const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const BudgetNotification = require('../models/BudgetNotification');
const User = require('../models/User');
const { sendEmail } = require('../config/email');

const formatINR = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(n);

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
      <tr style="background:#f9f9f9;"><td style="padding:12px 16px;border:1px solid #eee;font-weight:600;color:#333;">Remaining Budget</td><td style="padding:12px 16px;border:1px solid #eee;font-weight:700;">${formatINR(remaining)}</td></tr>
    </table>
    <p style="color:${is100 ? '#7a2c2b' : '#7a4a30'};font-size:14px;background:${is100 ? '#FBF0F0' : '#FAF0EB'};padding:16px;border-radius:8px;margin:0 0 24px;">${footerMsg}</p>
    <hr style="border:none;border-top:1px solid #eee;margin:0 0 24px;">
    <p style="margin:0;color:#999;font-size:13px;">Thank you,<br><strong>FinanceTrack Team</strong></p>
  </div>
</div></body></html>`;

  const text = `Hello ${userName},\n\n${is100 ? `Your spending in ${categoryName} has reached or exceeded your monthly budget.` : `Your spending in ${categoryName} has reached 90% of your monthly budget.`}\n\nMonthly Budget: ${formatINR(budgetAmount)}\nAmount Spent: ${formatINR(spentAmount)}\nRemaining: ${formatINR(remaining)}\n\n${footerMsg}\n\nThank you,\nFinanceTrack Team`;

  return { subject, html, text };
};

const checkAndSendBudgetAlerts = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user?.email) return;

    const now   = new Date();
    const month = now.getMonth() + 1;
    const year  = now.getFullYear();
    const uid   = new mongoose.Types.ObjectId(String(userId));

    // Only check budgets for current month
    const budgets = await Budget.find({ user: uid, month, year }).populate('category', 'name type');
    console.log(`[ALERT] ${user.email} — ${budgets.length} budget(s) for ${month}/${year}`);

    for (const budget of budgets) {
      const catId  = new mongoose.Types.ObjectId(String(budget.category._id));
      const bMonth = budget.month;
      const bYear  = budget.year;

      // Calculate total spent for this category this month
      const agg = await Transaction.aggregate([
        { $match: {
          user:     uid,
          category: catId,
          type:     'EXPENSE',
          transactionDate: {
            $gte: new Date(bYear, bMonth - 1, 1),
            $lte: new Date(bYear, bMonth, 0, 23, 59, 59, 999),
          },
        }},
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);

      const spent = agg[0]?.total || 0;
      const pct   = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

      console.log(`[ALERT] ${budget.category.name}: ₹${spent}/₹${budget.amount} = ${pct.toFixed(1)}%`);

      // ── 90% ALERT — send once per month ──────────────────────────────────
      if (pct >= 90) {
        // Check if we already sent a SUCCESSFUL 90% alert this month
        const sent90 = await BudgetNotification.findOne({
          budget: budget._id, threshold: 90, month: bMonth, year: bYear, status: 'sent',
        });

        if (!sent90) {
          console.log(`[ALERT] Sending 90% for ${budget.category.name}`);
          const eml = buildEmail(user.fullName, budget.category.name, budget.amount, spent, 90);
          const result = await sendEmail({ to: user.email, subject: eml.subject, html: eml.html, text: eml.text });
          // Always create a new record (no upsert, no unique constraint issues)
          await BudgetNotification.create({
            user: uid, budget: budget._id, category: catId,
            month: bMonth, year: bYear, threshold: 90,
            status: result.success ? 'sent' : 'failed', spentAmount: spent,
          });
          console.log(`[ALERT] 90% → ${result.success ? 'SENT' : 'FAILED ('+result.reason+')'}`);
        } else {
          console.log(`[ALERT] 90% already sent for ${budget.category.name}, skip`);
        }
      }

      // ── 100% ALERT — send every time user spends MORE after limit ────────
      if (pct >= 100) {
        // Find last SUCCESSFUL 100% alert
        const last100 = await BudgetNotification.findOne(
          { budget: budget._id, threshold: 100, month: bMonth, year: bYear, status: 'sent' },
          {},
          { sort: { sentAt: -1 } }  // get the most recent one
        );

        const lastSpent = last100?.spentAmount || 0;
        const shouldSend = spent > lastSpent; // send if spent increased since last alert

        console.log(`[ALERT] 100% check: spent=₹${spent}, lastAlertSpent=₹${lastSpent}, shouldSend=${shouldSend}`);

        if (shouldSend) {
          console.log(`[ALERT] Sending 100% for ${budget.category.name} (₹${spent})`);
          const eml = buildEmail(user.fullName, budget.category.name, budget.amount, spent, 100);
          const result = await sendEmail({ to: user.email, subject: eml.subject, html: eml.html, text: eml.text });
          await BudgetNotification.create({
            user: uid, budget: budget._id, category: catId,
            month: bMonth, year: bYear, threshold: 100,
            status: result.success ? 'sent' : 'failed', spentAmount: spent,
          });
          console.log(`[ALERT] 100% → ${result.success ? 'SENT' : 'FAILED ('+result.reason+')'}`);
        } else {
          console.log(`[ALERT] 100% skipped — spent hasn't increased since last alert`);
        }
      }
    }
  } catch (err) {
    console.error('[ALERT] FATAL ERROR:', err.message, err.stack);
  }
};

module.exports = { checkAndSendBudgetAlerts };
