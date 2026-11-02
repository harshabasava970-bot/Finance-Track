const router = require('express').Router();
const { sendEmail } = require('../config/email');
const { checkAndSendBudgetAlerts } = require('../services/budgetAlertService');
const BudgetNotification = require('../models/BudgetNotification');
const { protect } = require('../middleware/auth');

// Test email — sends a test email to the logged-in user
router.post('/email', protect, async (req, res) => {
  const user = req.user;

  console.log('[TEST EMAIL] SMTP config:', {
    host: process.env.SMTP_HOST || 'NOT SET',
    port: process.env.SMTP_PORT || 'NOT SET',
    user: process.env.SMTP_USER || 'NOT SET',
    pass: process.env.SMTP_PASS ? 'SET' : 'NOT SET',
    from: process.env.SMTP_FROM || 'NOT SET',
  });

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return res.status(500).json({
      success: false,
      message: 'SMTP not configured',
      config: {
        SMTP_HOST: process.env.SMTP_HOST || 'MISSING',
        SMTP_PORT: process.env.SMTP_PORT || 'MISSING',
        SMTP_USER: process.env.SMTP_USER || 'MISSING',
        SMTP_PASS: process.env.SMTP_PASS ? 'SET' : 'MISSING',
      }
    });
  }

  const result = await sendEmail({
    to: user.email,
    subject: 'FinanceTrack – Email Test',
    html: `<div style="font-family:Arial,sans-serif;padding:24px;max-width:500px;"><div style="background:#245C45;padding:20px;border-radius:8px 8px 0 0;"><h2 style="color:white;margin:0;">Email Test Successful!</h2></div><div style="padding:20px;border:1px solid #eee;border-radius:0 0 8px 8px;"><p>Hello <strong>${user.fullName}</strong>,</p><p>Your FinanceTrack email notifications are configured and working correctly.</p><p style="color:#888;font-size:13px;">FinanceTrack Team</p></div></div>`,
    text: `Hello ${user.fullName}, your FinanceTrack email notifications are working correctly.`,
  });

  if (result.success) {
    return res.json({ success: true, message: `Test email sent to ${user.email}` });
  } else {
    return res.status(500).json({ success: false, message: `Failed: ${result.reason}` });
  }
});

// Manually re-trigger budget alerts (clears old notifications and resends)
// Use this after configuring SMTP to send alerts for already-exceeded budgets
router.post('/trigger-alerts', protect, async (req, res) => {
  try {
    const now   = new Date();
    const month = now.getMonth() + 1;
    const year  = now.getFullYear();

    // Clear existing notifications for this user this month so they get resent
    await BudgetNotification.deleteMany({ user: req.user._id, month, year });

    // Re-check and send
    await checkAndSendBudgetAlerts(req.user._id);

    return res.json({ success: true, message: 'Budget alerts re-triggered. Check your inbox.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
