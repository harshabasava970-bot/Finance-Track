const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const { success, error } = require('../utils/apiResponse');

const calcSpent = async (userId, categoryId, month, year) => {
  const res = await Transaction.aggregate([
    { $match: { user: userId, category: categoryId, type: 'EXPENSE',
        transactionDate: { $gte: new Date(year, month - 1, 1), $lte: new Date(year, month, 0, 23, 59, 59) } } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  return res[0]?.total || 0;
};

const formatBudget = async (b, userId) => {
  const spent = await calcSpent(userId, b.category._id, b.month, b.year);
  const remaining = b.amount - spent;
  const pct = b.amount > 0 ? (spent / b.amount) * 100 : 0;
  return {
    id: b._id, categoryId: b.category._id, categoryName: b.category.name,
    amount: b.amount, spent, remaining, percentageUsed: Math.round(pct * 100) / 100,
    month: b.month, year: b.year,
  };
};

exports.getBudgets = async (req, res, next) => {
  try {
    const budgets = await Budget.find({ user: req.user._id }).populate('category', 'name type');
    const result = await Promise.all(budgets.map(b => formatBudget(b, req.user._id)));
    return success(res, result);
  } catch (err) { next(err); }
};

exports.createBudget = async (req, res, next) => {
  try {
    const { categoryId, amount, month, year } = req.body;
    if (!categoryId || !amount || !month || !year) return error(res, 'categoryId, amount, month, year required', 400);
    if (amount <= 0) return error(res, 'Amount must be positive', 400);
    const cat = await Category.findOne({ _id: categoryId, $or: [{ isSystem: true }, { owner: req.user._id }] });
    if (!cat) return error(res, 'Category not found', 404);
    if (cat.type !== 'EXPENSE') return error(res, 'Only expense categories can have budgets', 400);
    const exists = await Budget.findOne({ user: req.user._id, category: categoryId, month, year });
    if (exists) return error(res, 'Budget for this category and period already exists', 400);
    const b = await Budget.create({ user: req.user._id, category: categoryId, amount: parseFloat(amount), month: parseInt(month), year: parseInt(year) });
    await b.populate('category', 'name type');
    return success(res, await formatBudget(b, req.user._id), 'Budget created', 201);
  } catch (err) { next(err); }
};

exports.updateBudget = async (req, res, next) => {
  try {
    const b = await Budget.findOne({ _id: req.params.id, user: req.user._id }).populate('category', 'name type');
    if (!b) return error(res, 'Budget not found', 404);
    const { amount, month, year } = req.body;
    if (amount !== undefined) b.amount = parseFloat(amount);
    if (month !== undefined) b.month = parseInt(month);
    if (year !== undefined) b.year = parseInt(year);
    await b.save();
    return success(res, await formatBudget(b, req.user._id));
  } catch (err) { next(err); }
};

exports.deleteBudget = async (req, res, next) => {
  try {
    const b = await Budget.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!b) return error(res, 'Budget not found', 404);
    return success(res, null, 'Budget deleted');
  } catch (err) { next(err); }
};

exports.getBudgetAnalysis = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const m = parseInt(month) || new Date().getMonth() + 1;
    const y = parseInt(year) || new Date().getFullYear();
    const budgets = await Budget.find({ user: req.user._id, month: m, year: y }).populate('category', 'name type');
    const result = await Promise.all(budgets.map(b => formatBudget(b, req.user._id)));
    return success(res, result);
  } catch (err) { next(err); }
};
