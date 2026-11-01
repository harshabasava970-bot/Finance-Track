const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    minlength: [2, 'Category name must be at least 2 characters'],
  },
  type: {
    type: String,
    enum: { values: ['INCOME', 'EXPENSE'], message: 'Type must be INCOME or EXPENSE' },
    required: [true, 'Category type is required'],
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  // null = system category, ObjectId = user-created
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  isSystem: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

// Prevent duplicate name+type per owner (null owner = system categories)
categorySchema.index({ name: 1, type: 1, owner: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);
