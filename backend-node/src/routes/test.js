const router = require('express').Router();
const { sendEmail } = require('../config/email');
const { checkAndSendBudgetAlerts } = require('../services/budgetAlertService');
const BudgetNotification = require('../models/BudgetNotification');
const { protect } = require('../middleware/auth');

// Test email — returns full config + result
router.post('/email', protect, async (req, res) => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

  const config = {
    SMTP_HOST: SMTP_HOST || 'MISSING',
    SMTP_PORT: SMTP_PORT || 'MISSING',
    SMTP_USER: SMTP_USER || 'MISSING',
    SMTP_PASS: SMTP_PASS ? 'SET' : 'MISSING',
    SMTP_FROM: SMTP_FROM || 'MISSING',
  };

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return res.status(500).json({
      success: false,
      message: 'SMTP not configured in Render environment variables',
      config,
    });
  }

  const result = await sendEmail({
    to: req.user.email,
    subject: 'FinanceTrack – Email Test',
    html: `<div style="font-family:Arial,sans-serif;padding:24px;max-width:500px;"><div style="background:#245C45;padding:20px;border-radius:8px 8px 0 0;"><h2 style="color:white;margin:0;">Test Email</h2></div><div style="padding:20px;border:1px solid #eee;border-radius:0 0 8px 8px;"><p>Hello <strong>${req.user.fullName}</strong>,</p><p>Your FinanceTrack email notifications are working!</p><p style="color:#888;font-size:13px;">FinanceTrack Team</p></div></div>`,
    text: `Hello ${req.user.fullName}, your FinanceTrack email notifications are working!`,
  });

  if (result.success) {
    return res.json({ success: true, message: `Email sent to ${req.user.email}`, config });
  } else {
    return res.status(500).json({
      success: false,
      message: `Email failed: ${result.reason}`,
      code: result.code,
      config,
    });
  }
});

// Debug endpoint — shows exact notification state for current user
router.get('/debug-alerts', protect, async (req, res) => {
  const BudgetNotification = require('../models/BudgetNotification');
  const Budget = require('../models/Budget');
  const Transaction = require('../models/Transaction');
  const mongoose = require('mongoose');

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const userId = new mongoose.Types.ObjectId(String(req.user._id));

  const budgets = await Budget.find({ user: userId, month, year }).populate('category', 'name');
  const notifications = await BudgetNotification.find({ user: userId, month, year });

  const result = [];
  for (const b of budgets) {
    const agg = await Transaction.aggregate([
      { $match: {
        user: userId,
        category: new mongoose.Types.ObjectId(String(b.category._id)),
        type: 'EXPENSE',
        transactionDate: { $gte: new Date(year, month-1, 1), $lte: new Date(year, month, 0, 23, 59, 59) }
      }},
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const spent = agg[0]?.total || 0;
    const pct = (spent / b.amount) * 100;
    const notifs = notifications.filter(n => n.budget.toString() === b._id.toString());
    result.push({
      category: b.category.name,
      budget: b.amount, spent, pct: pct.toFixed(2),
      notifications: notifs.map(n => ({ threshold: n.threshold, status: n.status, sentAt: n.sentAt }))
    });
  }
  return res.json({ success: true, data: result });
});
  try {
    const now   = new Date();
    const month = now.getMonth() + 1;
    const year  = now.getFullYear();

    // Delete existing notifications so they get resent
    const deleted = await BudgetNotification.deleteMany({ user: req.user._id, month, year });
    console.log(`[TRIGGER] Cleared ${deleted.deletedCount} notifications for user ${req.user.email}`);

    await checkAndSendBudgetAlerts(req.user._id);

    return res.json({ success: true, message: 'Budget alerts triggered — check your inbox and Render logs' });
  } catch (err) {
    console.error('[TRIGGER] Error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
