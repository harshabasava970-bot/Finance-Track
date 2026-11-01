const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: { values: ['INCOME', 'EXPENSE'], message: 'Type must be INCOME or EXPENSE' },
    required: [true, 'Transaction type is required'],
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be positive'],
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required'],
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  transactionDate: {
    type: Date,
    required: [true, 'Transaction date is required'],
    default: Date.now,
  },
}, { timestamps: true });

// Index for fast user+date queries
transactionSchema.index({ user: 1, transactionDate: -1 });
transactionSchema.index({ user: 1, type: 1, transactionDate: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
