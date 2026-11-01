const mongoose = require('mongoose');

const budgetNotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  budget: { type: mongoose.Schema.Types.ObjectId, ref: 'Budget', required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  threshold: { type: Number, enum: [90, 100], required: true },
  sentAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['sent', 'failed'], default: 'sent' },
}, { timestamps: true });

// Prevent duplicate alerts for same budget+threshold in same month/year
budgetNotificationSchema.index({ budget: 1, threshold: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('BudgetNotification', budgetNotificationSchema);
