const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const BudgetNotification = require('../models/BudgetNotification');
const User = require('../models/User');
const { sendEmail } = require('../config/email');

const formatINR = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(n);

const buildEmail = (userName, categoryName, budgetAmount, spentAmount, threshold) => {
  const remaining = Math.max(0, budgetAmount - spentAmount);
  const is100 = threshold === 100;

  const subject = is100
    ? 'FinanceTrack – Budget Limit Reached'
    : 'FinanceTrack – Budget Warning (90%)';

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:24px auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
  <div style="background:${is100 ? '#B94A48' : '#C7795B'};padding:28px 32px;">
    <h1 style="margin:0;color:#fff;font-size:20px;font-weight:700;">${is100 ? 'Budget Limit Reached' : 'Budget Warning – 90% Used'}</h1>
  </div>
  <div style="padding:32px;">
    <p style="margin:0 0 16px;color:#333;font-size:15px;">Hello <strong>${userName}</strong>,</p>
    <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.6;">
      ${is100
        ? `Your spending in the <strong>${categoryName}</strong> category has <strong>reached or exceeded</strong> your monthly budget.`
        : `Your spending in the <strong>${categoryName}</strong> category has reached <strong>90%</strong> of your monthly budget.`
      }
    </p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      <tr style="background:#f9f9f9;"><td style="padding:12px 16px;border:1px solid #eee;font-weight:600;color:#333;">Monthly Budget</td><td style="padding:12px 16px;border:1px solid #eee;color:#245C45;font-weight:700;">${formatINR(budgetAmount)}</td></tr>
      <tr><td style="padding:12px 16px;border:1px solid #eee;font-weight:600;color:#333;">Amount Spent</td><td style="padding:12px 16px;border:1px solid #eee;color:${is100 ? '#B94A48' : '#C7795B'};font-weight:700;">${formatINR(spentAmount)}</td></tr>
      <tr style="background:#f9f9f9;"><td style="padding:12px 16px;border:1px solid #eee;font-weight:600;color:#333;">Remaining</td><td style="padding:12px 16px;border:1px solid #eee;font-weight:700;">${formatINR(remaining)}</td></tr>
    </table>
    <p style="color:${is100 ? '#7a2c2b' : '#7a4a30'};font-size:14px;background:${is100 ? '#FBF0F0' : '#FAF0EB'};padding:16px;border-radius:8px;">
      ${is100 ? 'Your budget limit has been reached. Please review your expenses and manage your remaining finances carefully.' : 'You have used 90% of your allocated budget. Please monitor your spending carefully.'}
    </p>
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
    <p style="margin:0;color:#999;font-size:13px;">Thank you,<br><strong>FinanceTrack Team</strong></p>
  </div>
</div>
</body></html>`;

  const text = `Hello ${userName},\n\n${is100 ? `Your spending in ${categoryName} has reached or exceeded your monthly budget.` : `Your spending in ${categoryName} has reached 90% of your monthly budget.`}\n\nMonthly Budget: ${formatINR(budgetAmount)}\nAmount Spent: ${formatINR(spentAmount)}\nRemaining: ${formatINR(remaining)}\n\n${is100 ? 'Your budget limit has been reached.' : 'Please monitor your spending carefully.'}\n\nThank you,\nFinanceTrack Team`;

  return { subject, html, text };
};

/**
 * Check all budgets for a user and send email alerts.
 * Called after every transaction create/update/delete AND budget create/update.
 *
 * Logic:
 * - For each active budget this month, calculate real spending from transactions
 * - If spending >= 90% and no successful 90% alert sent yet → send warning email
 * - If spending >= 100% and no successful 100% alert sent yet → send limit email
 * - Both can fire in the same call (e.g. single transaction crosses both thresholds)
 */
const checkAndSendBudgetAlerts = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user?.email) {
      console.log('[ALERT] No email for user:', userId);
      return;
    }

    const now   = new Date();
    const month = now.getMonth() + 1;
    const year  = now.getFullYear();

    // Get all budgets for this user this month
    const budgets = await Budget.find({
      user: new mongoose.Types.ObjectId(String(userId)),
      month,
      year,
    }).populate('category', 'name type');

    console.log(`[ALERT] Checking ${budgets.length} budgets for ${user.email} (${month}/${year})`);

    for (const budget of budgets) {
      // Calculate actual spending using MongoDB ObjectId comparison
      const agg = await Transaction.aggregate([
        {
          $match: {
            user: new mongoose.Types.ObjectId(String(userId)),
            category: new mongoose.Types.ObjectId(String(budget.category._id)),
            type: 'EXPENSE',
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

      console.log(`[ALERT] ${budget.category.name}: spent=${spent}, budget=${budget.amount}, pct=${pct.toFixed(1)}%`);

      // Check 90% threshold
      if (pct >= 90) {
        const sent90 = await BudgetNotification.findOne({
          user: new mongoose.Types.ObjectId(String(userId)),
          budget: budget._id,
          threshold: 90,
          month,
          year,
          status: 'sent',
        });

        if (!sent90) {
          console.log(`[ALERT] Sending 90% alert to ${user.email} for ${budget.category.name}`);
          const { subject, html, text } = buildEmail(user.fullName, budget.category.name, budget.amount, spent, 90);
          const result = await sendEmail({ to: user.email, subject, html, text });

          await BudgetNotification.findOneAndUpdate(
            { budget: budget._id, threshold: 90, month, year },
            {
              $set: {
                user: new mongoose.Types.ObjectId(String(userId)),
                category: budget.category._id,
                sentAt: new Date(),
                status: result.success ? 'sent' : 'failed',
              }
            },
            { upsert: true }
          );

          if (result.success) {
            console.log(`[ALERT] 90% email sent to ${user.email}`);
          } else {
            console.error(`[ALERT] 90% email FAILED: ${result.reason}`);
          }
        } else {
          console.log(`[ALERT] 90% already sent for ${budget.category.name}, skipping`);
        }
      }

      // Check 100% threshold separately
      if (pct >= 100) {
        const sent100 = await BudgetNotification.findOne({
          user: new mongoose.Types.ObjectId(String(userId)),
          budget: budget._id,
          threshold: 100,
          month,
          year,
          status: 'sent',
        });

        if (!sent100) {
          console.log(`[ALERT] Sending 100% alert to ${user.email} for ${budget.category.name}`);
          const { subject, html, text } = buildEmail(user.fullName, budget.category.name, budget.amount, spent, 100);
          const result = await sendEmail({ to: user.email, subject, html, text });

          await BudgetNotification.findOneAndUpdate(
            { budget: budget._id, threshold: 100, month, year },
            {
              $set: {
                user: new mongoose.Types.ObjectId(String(userId)),
                category: budget.category._id,
                sentAt: new Date(),
                status: result.success ? 'sent' : 'failed',
              }
            },
            { upsert: true }
          );

          if (result.success) {
            console.log(`[ALERT] 100% email sent to ${user.email}`);
          } else {
            console.error(`[ALERT] 100% email FAILED: ${result.reason}`);
          }
        } else {
          console.log(`[ALERT] 100% already sent for ${budget.category.name}, skipping`);
        }
      }
    }
  } catch (err) {
    console.error('[ALERT] Unexpected error:', err.message, err.stack);
  }
};

module.exports = { checkAndSendBudgetAlerts };
