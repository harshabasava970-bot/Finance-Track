const router = require('express').Router();
const { sendEmail } = require('../config/email');
const { checkAndSendBudgetAlerts } = require('../services/budgetAlertService');
const BudgetNotification = require('../models/BudgetNotification');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');
const { protect } = require('../middleware/auth');

// Send test email
router.post('/email', protect, async (req, res) => {
  const { SMTP_FROM, BREVO_API_KEY } = process.env;
  if (!BREVO_API_KEY) {
    return res.status(500).json({ success: false, message: 'BREVO_API_KEY not configured in Render environment' });
  }
  const result = await sendEmail({
    to: req.user.email,
    subject: 'FinanceTrack – Email Test',
    html: `<div style="font-family:Arial;padding:24px;"><h2 style="color:#245C45;">Email Test</h2><p>Hello <strong>${req.user.fullName}</strong>, your emails are working!</p></div>`,
    text: `Hello ${req.user.fullName}, your FinanceTrack emails are working!`,
  });
  if (result.success) return res.json({ success: true, message: `Test email sent to ${req.user.email}` });
  return res.status(500).json({ success: false, message: `Failed: ${result.reason}` });
});

// Re-trigger budget alerts (clears old records so they resend)
router.post('/trigger-alerts', protect, async (req, res) => {
  try {
    const now   = new Date();
    const month = now.getMonth() + 1;
    const year  = now.getFullYear();
    const deleted = await BudgetNotification.deleteMany({ user: req.user._id, month, year });
    console.log(`[TRIGGER] Cleared ${deleted.deletedCount} notifications for ${req.user.email}`);
    await checkAndSendBudgetAlerts(req.user._id);
    return res.json({ success: true, message: 'Budget alerts re-triggered. Check your inbox.' });
  } catch (err) {
    console.error('[TRIGGER] Error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Debug — show current budget state and notifications
router.get('/debug-alerts', protect, async (req, res) => {
  try {
    const now   = new Date();
    const month = now.getMonth() + 1;
    const year  = now.getFullYear();
    const uid   = new mongoose.Types.ObjectId(String(req.user._id));

    const budgets = await Budget.find({ user: uid, month, year }).populate('category', 'name');
    const notifications = await BudgetNotification.find({ user: uid, month, year });

    const result = [];
    for (const b of budgets) {
      const agg = await Transaction.aggregate([
        { $match: {
          user: uid,
          category: new mongoose.Types.ObjectId(String(b.category._id)),
          type: 'EXPENSE',
          transactionDate: { $gte: new Date(year, month-1, 1), $lte: new Date(year, month, 0, 23, 59, 59) },
        }},
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);
      const spent = agg[0]?.total || 0;
      const pct   = (spent / b.amount) * 100;
      const notifs = notifications.filter(n => n.budget.toString() === b._id.toString());
      result.push({
        category: b.category.name,
        budget: b.amount, spent, pct: pct.toFixed(2) + '%',
        notifications: notifs.map(n => ({ threshold: n.threshold, status: n.status, sentAt: n.sentAt, spentAmount: n.spentAmount })),
      });
    }
    return res.json({ success: true, data: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
