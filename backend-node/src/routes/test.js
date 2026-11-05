const router = require('express').Router();
const { sendEmail } = require('../config/email');
const { checkAndSendBudgetAlerts } = require('../services/budgetAlertService');
const BudgetNotification = require('../models/BudgetNotification');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');
const { protect } = require('../middleware/auth');

// Drop old unique index AND recreate collection without it
router.post('/fix-index', protect, async (req, res) => {
  try {
    // Drop the entire collection and recreate — cleanest fix
    await BudgetNotification.collection.drop().catch(() => {});
    console.log('[FIX] Dropped budgetnotifications collection');
    // Recreate by syncing indexes (without unique constraint)
    await BudgetNotification.syncIndexes();
    console.log('[FIX] Recreated indexes without unique constraint');
    return res.json({ success: true, message: 'Collection recreated. All alerts will now work correctly.' });
  } catch (err) {
    console.error('[FIX] Error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Send test email
router.post('/email', protect, async (req, res) => {
  if (!process.env.BREVO_API_KEY) return res.status(500).json({ success: false, message: 'BREVO_API_KEY not set' });
  const result = await sendEmail({
    to: req.user.email, subject: 'FinanceTrack – Email Test',
    html: `<p>Hello <strong>${req.user.fullName}</strong>, emails are working!</p>`,
    text: `Hello ${req.user.fullName}, emails are working!`,
  });
  if (result.success) return res.json({ success: true, message: `Sent to ${req.user.email}` });
  return res.status(500).json({ success: false, message: result.reason });
});

// Re-trigger alerts (clears records and resends)
router.post('/trigger-alerts', protect, async (req, res) => {
  try {
    const now = new Date();
    const deleted = await BudgetNotification.deleteMany({ user: req.user._id, month: now.getMonth()+1, year: now.getFullYear() });
    console.log(`[TRIGGER] Cleared ${deleted.deletedCount} notifications`);
    await checkAndSendBudgetAlerts(req.user._id);
    return res.json({ success: true, message: 'Alerts triggered. Check inbox.' });
  } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
});

// Debug alert state
router.get('/debug-alerts', protect, async (req, res) => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year  = now.getFullYear();
    const uid   = new mongoose.Types.ObjectId(String(req.user._id));
    const budgets = await Budget.find({ user: uid, month, year }).populate('category', 'name');
    const notifications = await BudgetNotification.find({ user: uid, month, year });
    const result = [];
    for (const b of budgets) {
      const agg = await Transaction.aggregate([
        { $match: { user: uid, category: new mongoose.Types.ObjectId(String(b.category._id)), type: 'EXPENSE',
          transactionDate: { $gte: new Date(year, month-1, 1), $lte: new Date(year, month, 0, 23, 59, 59) } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);
      const spent = agg[0]?.total || 0;
      result.push({
        category: b.category.name, budget: b.amount, spent,
        pct: ((spent/b.amount)*100).toFixed(1)+'%',
        notifications: notifications.filter(n => n.budget.toString()===b._id.toString())
          .map(n => ({ threshold: n.threshold, status: n.status, sentAt: n.sentAt, spentAmount: n.spentAmount })),
      });
    }
    return res.json({ success: true, data: result });
  } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
