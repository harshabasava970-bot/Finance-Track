const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const BudgetNotification = require('../models/BudgetNotification');
const User = require('../models/User');
const { sendEmail } = require('../config/email');

const formatINR = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(n);

// Build email for a specific threshold (90 or 100)
const buildEmail = (userName, categoryName, budgetAmount, spentAmount, threshold) => {
  const remaining = Math.max(0, budgetAmount - spentAmount);
  const is100 = (threshold === 100);

  const subject = is100
    ? 'FinanceTrack – Budget Limit Reached'
    : 'FinanceTrack – Budget Warning (90%)';

  const headerColor  = is100 ? '#B94A48' : '#C7795B';
  const headerTitle  = is100 ? 'Budget Limit Reached' : 'Budget Warning – 90% Used';
  const bodyMessage  = is100
    ? `Your spending in the <strong>${categoryName}</strong> category has <strong>reached or exceeded</strong> your monthly budget.`
    : `Your spending in the <strong>${categoryName}</strong> category has reached <strong>90%</strong> of your monthly budget.`;
  const footerMsg    = is100
    ? 'Your budget limit has been reached. Please review your expenses and manage your remaining finances carefully.'
    : 'You have used 90% of your allocated budget. Please monitor your spending carefully.';
  const footerBg     = is100 ? '#FBF0F0' : '#FAF0EB';
  const footerColor  = is100 ? '#7a2c2b' : '#7a4a30';
  const amountColor  = is100 ? '#B94A48' : '#C7795B';

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:24px auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
  <div style="background:${headerColor};padding:28px 32px;">
    <h1 style="margin:0;color:#fff;font-size:20px;font-weight:700;">${headerTitle}</h1>
  </div>
  <div style="padding:32px;">
    <p style="margin:0 0 16px;color:#333;font-size:15px;">Hello <strong>${userName}</strong>,</p>
    <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.6;">${bodyMessage}</p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      <tr style="background:#f9f9f9;">
        <td style="padding:12px 16px;border:1px solid #eee;font-weight:600;color:#333;">Monthly Budget</td>
        <td style="padding:12px 16px;border:1px solid #eee;color:#245C45;font-weight:700;">${formatINR(budgetAmount)}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;border:1px solid #eee;font-weight:600;color:#333;">Amount Spent</td>
        <td style="padding:12px 16px;border:1px solid #eee;color:${amountColor};font-weight:700;">${formatINR(spentAmount)}</td>
      </tr>
      <tr style="background:#f9f9f9;">
        <td style="padding:12px 16px;border:1px solid #eee;font-weight:600;color:#333;">Remaining Budget</td>
        <td style="padding:12px 16px;border:1px solid #eee;font-weight:700;color:#333;">${formatINR(remaining)}</td>
      </tr>
    </table>
    <p style="color:${footerColor};font-size:14px;background:${footerBg};padding:16px;border-radius:8px;margin:0 0 24px;">${footerMsg}</p>
    <hr style="border:none;border-top:1px solid #eee;margin:0 0 24px;">
    <p style="margin:0;color:#999;font-size:13px;">Thank you,<br><strong>FinanceTrack Team</strong></p>
  </div>
</div>
</body></html>`;

  const textBody = is100
    ? `Your spending in ${categoryName} has reached or exceeded your monthly budget.\n\nMonthly Budget: ${formatINR(budgetAmount)}\nAmount Spent: ${formatINR(spentAmount)}\nRemaining: ${formatINR(remaining)}\n\nYour budget limit has been reached. Please review your expenses.`
    : `Your spending in ${categoryName} has reached 90% of your monthly budget.\n\nMonthly Budget: ${formatINR(budgetAmount)}\nAmount Spent: ${formatINR(spentAmount)}\nRemaining: ${formatINR(remaining)}\n\nYou have used 90% of your allocated budget. Please monitor your spending carefully.`;

  const text = `Hello ${userName},\n\n${textBody}\n\nThank you,\nFinanceTrack Team`;

  return { subject, html, text };
};

// Send ONE alert for a specific threshold — isolated function, no shared state
const sendThresholdAlert = async (userId, budget, spent, threshold, user) => {
  const budgetId = budget._id;
  const month    = new Date().getMonth() + 1;
  const year     = new Date().getFullYear();

  console.log(`[ALERT] Checking threshold ${threshold}% for ${budget.category.name} (spent=${spent}, budget=${budget.amount})`);

  // Check if already successfully sent
  const existing = await BudgetNotification.findOne({
    budget:    budgetId,
    threshold: threshold,
    month:     month,
    year:      year,
    status:    'sent',
  });

  if (existing) {
    console.log(`[ALERT] ${threshold}% already sent for ${budget.category.name} — skipping`);
    return;
  }

  // Build and send email with the CORRECT threshold
  const emailData = buildEmail(
    user.fullName,
    budget.category.name,
    budget.amount,
    spent,
    threshold    // ← this is the exact threshold passed, never mixed up
  );

  console.log(`[ALERT] Sending ${threshold}% email to ${user.email} — Subject: ${emailData.subject}`);

  const result = await sendEmail({
    to:      user.email,
    subject: emailData.subject,
    html:    emailData.html,
    text:    emailData.text,
  });

  // Save notification record
  await BudgetNotification.findOneAndUpdate(
    { budget: budgetId, threshold, month, year },
    {
      $set: {
        user:     new mongoose.Types.ObjectId(String(userId)),
        category: budget.category._id,
        sentAt:   new Date(),
        status:   result.success ? 'sent' : 'failed',
      },
      $setOnInsert: {
        budget:    budgetId,
        threshold: threshold,
        month:     month,
        year:      year,
      }
    },
    { upsert: true, new: true }
  );

  if (result.success) {
    console.log(`[ALERT] ${threshold}% email SENT successfully to ${user.email}`);
  } else {
    console.error(`[ALERT] ${threshold}% email FAILED: ${result.reason}`);
  }
};

/**
 * Main function — check all budgets for this user and fire alerts.
 * Called after every transaction create/update/delete and budget create/update.
 */
const checkAndSendBudgetAlerts = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user?.email) return;

    const now   = new Date();
    const month = now.getMonth() + 1;
    const year  = now.getFullYear();

    const budgets = await Budget.find({
      user:  new mongoose.Types.ObjectId(String(userId)),
      month: month,
      year:  year,
    }).populate('category', 'name type');

    console.log(`[ALERT] Checking ${budgets.length} budget(s) for ${user.email}`);

    for (const budget of budgets) {
      // Calculate real spending from actual transactions
      const agg = await Transaction.aggregate([
        {
          $match: {
            user:     new mongoose.Types.ObjectId(String(userId)),
            category: new mongoose.Types.ObjectId(String(budget.category._id)),
            type:     'EXPENSE',
            transactionDate: {
              $gte: new Date(year, month - 1, 1),
              $lte: new Date(year, month, 0, 23, 59, 59, 999),
            },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);

      const spent = agg[0]?.total || 0;
      const pct   = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

      console.log(`[ALERT] ${budget.category.name}: budget=₹${budget.amount}, spent=₹${spent}, pct=${pct.toFixed(1)}%`);

      // Fire 90% alert if threshold crossed
      if (pct >= 90) {
        await sendThresholdAlert(userId, budget, spent, 90, user);
      }

      // Fire 100% alert SEPARATELY if threshold crossed
      if (pct >= 100) {
        await sendThresholdAlert(userId, budget, spent, 100, user);
      }
    }
  } catch (err) {
    console.error('[ALERT] Error:', err.message, err.stack);
  }
};

module.exports = { checkAndSendBudgetAlerts };
