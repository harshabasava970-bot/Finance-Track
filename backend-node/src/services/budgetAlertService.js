const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const BudgetNotification = require('../models/BudgetNotification');
const User = require('../models/User');
const { sendEmail } = require('../config/email');

const formatINR = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(n);

/**
 * Build email HTML/text for a given threshold (90 or 100).
 * threshold=90  → "Budget Warning (90%)"
 * threshold=100 → "Budget Limit Reached"
 */
const buildEmail = (userName, categoryName, budgetAmount, spentAmount, threshold) => {
  const remaining   = Math.max(0, budgetAmount - spentAmount);
  const is100       = threshold === 100;
  const subject     = is100 ? 'FinanceTrack – Budget Limit Reached' : 'FinanceTrack – Budget Warning (90%)';
  const headerColor = is100 ? '#B94A48' : '#C7795B';
  const headerTitle = is100 ? 'Budget Limit Reached' : 'Budget Warning – 90% Used';
  const bodyMsg     = is100
    ? `Your spending in the <strong>${categoryName}</strong> category has <strong>reached or exceeded</strong> your monthly budget.`
    : `Your spending in the <strong>${categoryName}</strong> category has reached <strong>90%</strong> of your monthly budget.`;
  const footerMsg   = is100
    ? 'Your budget limit has been reached. Please review your expenses and manage your remaining finances carefully.'
    : 'You have used 90% of your allocated budget. Please monitor your spending carefully.';

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:24px auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
  <div style="background:${headerColor};padding:28px 32px;">
    <h1 style="margin:0;color:#fff;font-size:20px;font-weight:700;">${headerTitle}</h1>
  </div>
  <div style="padding:32px;">
    <p style="margin:0 0 16px;color:#333;font-size:15px;">Hello <strong>${userName}</strong>,</p>
    <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.6;">${bodyMsg}</p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      <tr style="background:#f9f9f9;"><td style="padding:12px 16px;border:1px solid #eee;font-weight:600;color:#333;">Monthly Budget</td><td style="padding:12px 16px;border:1px solid #eee;color:#245C45;font-weight:700;">${formatINR(budgetAmount)}</td></tr>
      <tr><td style="padding:12px 16px;border:1px solid #eee;font-weight:600;color:#333;">Amount Spent</td><td style="padding:12px 16px;border:1px solid #eee;color:${headerColor};font-weight:700;">${formatINR(spentAmount)}</td></tr>
      <tr style="background:#f9f9f9;"><td style="padding:12px 16px;border:1px solid #eee;font-weight:600;color:#333;">Remaining Budget</td><td style="padding:12px 16px;border:1px solid #eee;font-weight:700;color:#333;">${formatINR(remaining)}</td></tr>
    </table>
    <p style="color:${is100 ? '#7a2c2b' : '#7a4a30'};font-size:14px;background:${is100 ? '#FBF0F0' : '#FAF0EB'};padding:16px;border-radius:8px;margin:0 0 24px;">${footerMsg}</p>
    <hr style="border:none;border-top:1px solid #eee;margin:0 0 24px;">
    <p style="margin:0;color:#999;font-size:13px;">Thank you,<br><strong>FinanceTrack Team</strong></p>
  </div>
</div></body></html>`;

  const text = `Hello ${userName},\n\n${is100
    ? `Your spending in ${categoryName} has reached or exceeded your monthly budget.`
    : `Your spending in ${categoryName} has reached 90% of your monthly budget.`
  }\n\nMonthly Budget: ${formatINR(budgetAmount)}\nAmount Spent: ${formatINR(spentAmount)}\nRemaining: ${formatINR(remaining)}\n\n${footerMsg}\n\nThank you,\nFinanceTrack Team`;

  return { subject, html, text };
};

/**
 * NOTIFICATION RULES:
 *
 * 90% alert:
 *   - Send ONCE per budget per month when spending first crosses 90%
 *   - Do NOT resend if already sent this month
 *
 * 100% alert:
 *   - Send when spending first reaches/exceeds 100%
 *   - RESEND every time a NEW transaction pushes spending higher (user keeps spending after limit)
 *   - Track by storing the "spentAtLastAlert" — if spent is higher now, resend
 *
 * This means:
 *   Budget ₹4000, spent ₹3600 → 90% email ✅
 *   Spent ₹4000 → 100% email ✅
 *   Spent ₹4500 → 100% email again ✅ (new transaction exceeded again)
 *   Spent ₹4600 → 100% email again ✅
 */
const checkAndSendBudgetAlerts = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user?.email) return;

    const now   = new Date();
    const month = now.getMonth() + 1;
    const year  = now.getFullYear();
    const uid   = new mongoose.Types.ObjectId(String(userId));

    const budgets = await Budget.find({ user: uid, month, year }).populate('category', 'name type');
    console.log(`[ALERT] Checking ${budgets.length} budget(s) for user ${user.email} (${month}/${year})`);

    for (const budget of budgets) {
      const catId     = new mongoose.Types.ObjectId(String(budget.category._id));
      const bMonth    = budget.month;  // use budget's month, not server's now
      const bYear     = budget.year;   // use budget's year, not server's now

      // Get actual spending for this category in the BUDGET's month/year
      const agg = await Transaction.aggregate([
        { $match: {
          user: uid,
          category: catId,
          type: 'EXPENSE',
          transactionDate: {
            $gte: new Date(bYear, bMonth - 1, 1, 0, 0, 0, 0),
            $lte: new Date(bYear, bMonth, 0, 23, 59, 59, 999),
          },
        }},
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);

      const spent = agg[0]?.total || 0;
      const pct   = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

      console.log(`[ALERT] ${budget.category.name} (${bMonth}/${bYear}): budget=₹${budget.amount} spent=₹${spent} pct=${pct.toFixed(1)}%`);

      // ── 90% CHECK ──────────────────────────────────────────────────────────
      if (pct >= 90) {
        const existing90 = await BudgetNotification.findOne({
          budget: budget._id, threshold: 90, month: bMonth, year: bYear, status: 'sent',
        });

        if (!existing90) {
          console.log(`[ALERT] Firing 90% alert for ${budget.category.name}`);
          const email = buildEmail(user.fullName, budget.category.name, budget.amount, spent, 90);
          const result = await sendEmail({ to: user.email, ...email });
          await BudgetNotification.findOneAndUpdate(
            { budget: budget._id, threshold: 90, month: bMonth, year: bYear },
            { $set: { user: uid, category: catId, sentAt: new Date(), status: result.success ? 'sent' : 'failed', spentAmount: spent } },
            { upsert: true }
          );
          console.log(`[ALERT] 90% email ${result.success ? 'SENT' : 'FAILED'} → ${user.email}`);
        } else {
          console.log(`[ALERT] 90% already sent for ${budget.category.name}`);
        }
      }

      // ── 100% CHECK ─────────────────────────────────────────────────────────
      if (pct >= 100) {
        const last100 = await BudgetNotification.findOne({
          budget: budget._id, threshold: 100, month: bMonth, year: bYear, status: 'sent',
        });

        const shouldSend = !last100 || (last100.spentAmount != null && spent > last100.spentAmount);

        if (shouldSend) {
          console.log(`[ALERT] Firing 100% alert for ${budget.category.name} (spent=₹${spent})`);
          const email = buildEmail(user.fullName, budget.category.name, budget.amount, spent, 100);
          const result = await sendEmail({ to: user.email, ...email });

          if (result.success) {
            await BudgetNotification.findOneAndUpdate(
              { budget: budget._id, threshold: 100, month: bMonth, year: bYear },
              { $set: { user: uid, category: catId, sentAt: new Date(), status: 'sent', spentAmount: spent } },
              { upsert: true }
            );
            console.log(`[ALERT] 100% email SENT → ${user.email} (spent=₹${spent})`);
          } else {
            console.error(`[ALERT] 100% email FAILED: ${result.reason}`);
            await BudgetNotification.findOneAndUpdate(
              { budget: budget._id, threshold: 100, month: bMonth, year: bYear },
              { $set: { user: uid, category: catId, sentAt: new Date(), status: 'failed', spentAmount: spent } },
              { upsert: true }
            );
          }
        } else {
          console.log(`[ALERT] 100% already sent for ${budget.category.name} at same spend level`);
        }
      }
    }
  } catch (err) {
    console.error('[ALERT] Error:', err.message, err.stack);
  }
};

module.exports = { checkAndSendBudgetAlerts };
