const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const BudgetNotification = require('../models/BudgetNotification');
const User = require('../models/User');
const { sendEmail } = require('../config/email');

const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

const buildAlertEmail = (userName, categoryName, budget, spent, threshold) => {
  const remaining = Math.max(0, budget - spent);
  const isExceeded = threshold === 100;
  const subject = isExceeded
    ? 'FinanceTrack – Budget Exceeded'
    : 'FinanceTrack – Budget Warning (90%)';
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <div style="background:#245C45;color:white;padding:20px;border-radius:8px 8px 0 0;">
        <h2 style="margin:0;">FinanceTrack Budget ${isExceeded ? 'Exceeded' : 'Warning'}</h2>
      </div>
      <div style="background:#f9f9f9;padding:24px;border:1px solid #e0e0e0;border-radius:0 0 8px 8px;">
        <p>Hello <strong>${userName}</strong>,</p>
        <p>Your spending in the <strong>${categoryName}</strong> category has ${isExceeded ? 'reached or exceeded' : 'reached 90% of'} your monthly budget.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr style="background:#f0f0f0;"><td style="padding:10px;border:1px solid #ddd;"><strong>Monthly Budget</strong></td><td style="padding:10px;border:1px solid #ddd;">${formatINR(budget)}</td></tr>
          <tr><td style="padding:10px;border:1px solid #ddd;"><strong>Amount Spent</strong></td><td style="padding:10px;border:1px solid #ddd;color:${isExceeded ? '#B94A48' : '#C7795B'};">${formatINR(spent)}</td></tr>
          <tr style="background:#f0f0f0;"><td style="padding:10px;border:1px solid #ddd;"><strong>Remaining</strong></td><td style="padding:10px;border:1px solid #ddd;">${formatINR(remaining)}</td></tr>
        </table>
        <p style="color:${isExceeded ? '#B94A48' : '#C7795B'};"><strong>${isExceeded ? 'You have reached your spending limit. Please review your expenses.' : 'Please monitor your expenses to avoid exceeding your budget.'}</strong></p>
        <hr style="border:none;border-top:1px solid #e0e0e0;margin:20px 0;">
        <p style="color:#888;font-size:12px;">Thank you,<br>FinanceTrack Team</p>
      </div>
    </div>`;
  const text = `Hello ${userName},\n\nYour spending in the ${categoryName} category has ${isExceeded ? 'reached or exceeded' : 'reached 90% of'} your monthly budget.\n\nMonthly Budget: ${formatINR(budget)}\nAmount Spent: ${formatINR(spent)}\nRemaining: ${formatINR(remaining)}\n\n${isExceeded ? 'You have reached your spending limit.' : 'Please monitor your expenses.'}\n\nFinanceTrack Team`;
  return { subject, html, text };
};

/**
 * Check budgets for a user after any transaction change and send alerts.
 * Called after create/update/delete transaction.
 */
const checkAndSendBudgetAlerts = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user?.email) return;

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const budgets = await Budget.find({ user: userId, month, year }).populate('category');

    for (const budget of budgets) {
      const spent = await Transaction.aggregate([
        { $match: { user: budget.user, category: budget.category._id, type: 'EXPENSE',
            transactionDate: {
              $gte: new Date(year, month - 1, 1),
              $lte: new Date(year, month, 0, 23, 59, 59),
            } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);
      const spentAmount = spent[0]?.total || 0;
      const pct = (spentAmount / budget.amount) * 100;

      // Check both thresholds
      for (const threshold of [90, 100]) {
        if (pct >= threshold) {
          // Check if already sent
          const alreadySent = await BudgetNotification.findOne({
            budget: budget._id, threshold, month, year,
          });
          if (!alreadySent) {
            const { subject, html, text } = buildAlertEmail(
              user.fullName, budget.category.name, budget.amount, spentAmount, threshold
            );
            const result = await sendEmail({ to: user.email, subject, html, text });
            await BudgetNotification.create({
              user: userId, budget: budget._id, category: budget.category._id,
              month, year, threshold, status: result.success ? 'sent' : 'failed',
            });
            if (result.success) {
              console.log(`Budget alert sent to ${user.email}: ${threshold}% for ${budget.category.name}`);
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('Budget alert error:', err.message);
  }
};

module.exports = { checkAndSendBudgetAlerts };
