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

  const bodyText = is100
    ? `Your spending in the ${categoryName} category has reached or exceeded your monthly budget.\n\nMonthly Budget: ${formatINR(budgetAmount)}\nAmount Spent: ${formatINR(spentAmount)}\nRemaining Budget: ${formatINR(remaining)}\n\nYour budget limit has been reached. Please review your expenses and manage your remaining finances carefully.`
    : `Your spending in the ${categoryName} category has reached 90% of your monthly budget.\n\nMonthly Budget: ${formatINR(budgetAmount)}\nAmount Spent: ${formatINR(spentAmount)}\nRemaining Budget: ${formatINR(remaining)}\n\nYou have used 90% of your allocated budget. Please monitor your spending carefully.`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:24px auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <div style="background:${is100 ? '#B94A48' : '#C7795B'};padding:28px 32px;">
      <h1 style="margin:0;color:#fff;font-size:20px;font-weight:700;">
        ${is100 ? 'Budget Limit Reached' : 'Budget Warning (90%)'}
      </h1>
    </div>
    <div style="padding:32px;">
      <p style="margin:0 0 16px;color:#333;font-size:15px;">Hello <strong>${userName}</strong>,</p>
      <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.6;">
        ${is100
          ? `Your spending in the <strong>${categoryName}</strong> category has <strong>reached or exceeded</strong> your monthly budget.`
          : `Your spending in the <strong>${categoryName}</strong> category has reached <strong>90%</strong> of your monthly budget.`
        }
      </p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;border-radius:8px;overflow:hidden;">
        <tr style="background:#f9f9f9;">
          <td style="padding:12px 16px;border:1px solid #eee;font-weight:600;color:#333;width:50%;">Monthly Budget</td>
          <td style="padding:12px 16px;border:1px solid #eee;color:#245C45;font-weight:700;">${formatINR(budgetAmount)}</td>
        </tr>
        <tr>
          <td style="padding:12px 16px;border:1px solid #eee;font-weight:600;color:#333;">Amount Spent</td>
          <td style="padding:12px 16px;border:1px solid #eee;color:${is100 ? '#B94A48' : '#C7795B'};font-weight:700;">${formatINR(spentAmount)}</td>
        </tr>
        <tr style="background:#f9f9f9;">
          <td style="padding:12px 16px;border:1px solid #eee;font-weight:600;color:#333;">Remaining Budget</td>
          <td style="padding:12px 16px;border:1px solid #eee;color:#333;font-weight:700;">${formatINR(remaining)}</td>
        </tr>
      </table>
      <div style="background:${is100 ? '#FBF0F0' : '#FAF0EB'};border:1px solid ${is100 ? '#E8AAAA' : '#E8C4B0'};border-radius:8px;padding:16px 20px;margin-bottom:24px;">
        <p style="margin:0;color:${is100 ? '#7a2c2b' : '#7a4a30'};font-size:14px;">
          ${is100
            ? 'Your budget limit has been reached. Please review your expenses and manage your remaining finances carefully.'
            : 'You have used 90% of your allocated budget. Please monitor your spending carefully.'
          }
        </p>
      </div>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
      <p style="margin:0;color:#999;font-size:13px;">Thank you,<br><strong>FinanceTrack Team</strong></p>
    </div>
  </div>
</body>
</html>`;

  const text = `Hello ${userName},\n\n${bodyText}\n\nThank you,\nFinanceTrack Team`;

  return { subject, html, text };
};

/**
 * Check all budgets for a user and send email alerts if thresholds are crossed.
 * Called after every transaction create/update/delete.
 */
const checkAndSendBudgetAlerts = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user?.email) return;

    const now   = new Date();
    const month = now.getMonth() + 1;
    const year  = now.getFullYear();

    const budgets = await Budget.find({ user: userId, month, year }).populate('category', 'name');

    for (const budget of budgets) {
      // Calculate actual spending for this category this month
      const agg = await Transaction.aggregate([
        {
          $match: {
            user: budget.user,
            category: budget.category._id,
            type: 'EXPENSE',
            transactionDate: {
              $gte: new Date(year, month - 1, 1),
              $lte: new Date(year, month, 0, 23, 59, 59),
            },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);

      const spent = agg[0]?.total || 0;
      const pct   = (spent / budget.amount) * 100;

      // Check thresholds: 90 first, then 100
      for (const threshold of [90, 100]) {
        if (pct < threshold) continue;

        // Already sent this threshold for this budget this month?
        // Also retry if previous attempt failed (SMTP was not configured then)
        const alreadySent = await BudgetNotification.findOne({
          budget: budget._id,
          threshold,
          month,
          year,
          status: 'sent',  // only skip if successfully sent before
        });
        if (alreadySent) continue;

        // Send email
        const { subject, html, text } = buildEmail(
          user.fullName,
          budget.category.name,
          budget.amount,
          spent,
          threshold
        );

        const result = await sendEmail({ to: user.email, subject, html, text });

        // Record notification — upsert so failed attempts get updated on retry
        try {
          await BudgetNotification.findOneAndUpdate(
            { budget: budget._id, threshold, month, year },
            { user: userId, category: budget.category._id, sentAt: new Date(), status: result.success ? 'sent' : 'failed' },
            { upsert: true, new: true }
          );
        } catch (dupErr) {
          // ignore
        }

        if (result.success) {
          console.log(`[EMAIL] Sent ${threshold}% alert to ${user.email} for ${budget.category.name}`);
        } else {
          console.error(`[EMAIL] Failed ${threshold}% alert: ${result.reason}`);
        }
      }
    }
  } catch (err) {
    console.error('[BudgetAlert] Error:', err.message);
  }
};

module.exports = { checkAndSendBudgetAlerts };
