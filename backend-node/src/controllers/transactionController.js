const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const { success, error, paginated } = require('../utils/apiResponse');
const { checkAndSendBudgetAlerts } = require('../services/budgetAlertService');

const buildFilter = (userId, { type, categoryId, startDate, endDate, search }) => {
  const filter = { user: userId };
  if (type) filter.type = type;
  if (categoryId) filter.category = categoryId;
  if (startDate || endDate) {
    filter.transactionDate = {};
    if (startDate) filter.transactionDate.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.transactionDate.$lte = end;
    }
  }
  if (search) {
    filter.$or = [
      { description: { $regex: search, $options: 'i' } },
    ];
  }
  return filter;
};

exports.getTransactions = async (req, res, next) => {
  try {
    const { page = 0, size = 10, sortBy = 'transactionDate', sortDir = 'desc', ...filters } = req.query;
    const filter = buildFilter(req.user._id, filters);
    const pageNum = parseInt(page);
    const pageSize = parseInt(size);
    const sort = { [sortBy]: sortDir === 'asc' ? 1 : -1 };

    const [transactions, total] = await Promise.all([
      Transaction.find(filter).populate('category', 'name type').sort(sort).skip(pageNum * pageSize).limit(pageSize),
      Transaction.countDocuments(filter),
    ]);

    const content = transactions.map(formatTx);
    return paginated(res, content, pageNum, pageSize, total, Math.ceil(total / pageSize));
  } catch (err) { next(err); }
};

exports.getTransactionById = async (req, res, next) => {
  try {
    const tx = await Transaction.findOne({ _id: req.params.id, user: req.user._id }).populate('category', 'name type');
    if (!tx) return error(res, 'Transaction not found', 404);
    return success(res, formatTx(tx));
  } catch (err) { next(err); }
};

exports.createTransaction = async (req, res, next) => {
  try {
    const { type, amount, categoryId, description, transactionDate } = req.body;
    if (!type || !amount || !categoryId) return error(res, 'type, amount and categoryId are required', 400);
    if (amount <= 0) return error(res, 'Amount must be positive', 400);

    const cat = await Category.findOne({ _id: categoryId, $or: [{ isSystem: true }, { owner: req.user._id }] });
    if (!cat) return error(res, 'Category not found', 404);
    if (cat.type !== type) return error(res, 'Category type does not match transaction type', 400);

    const tx = await Transaction.create({
      user: req.user._id, type, amount: parseFloat(amount), category: categoryId,
      description: description || '', transactionDate: transactionDate ? new Date(transactionDate) : new Date(),
    });
    await tx.populate('category', 'name type');

    // Fire budget alerts asynchronously
    checkAndSendBudgetAlerts(req.user._id).catch(() => {});

    return success(res, formatTx(tx), 'Transaction created', 201);
  } catch (err) { next(err); }
};

exports.updateTransaction = async (req, res, next) => {
  try {
    const tx = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!tx) return error(res, 'Transaction not found', 404);

    const { type, amount, categoryId, description, transactionDate } = req.body;
    if (categoryId) {
      const cat = await Category.findOne({ _id: categoryId, $or: [{ isSystem: true }, { owner: req.user._id }] });
      if (!cat) return error(res, 'Category not found', 404);
      if (cat.type !== (type || tx.type)) return error(res, 'Category type mismatch', 400);
      tx.category = categoryId;
    }
    if (type) tx.type = type;
    if (amount) tx.amount = parseFloat(amount);
    if (description !== undefined) tx.description = description;
    if (transactionDate) tx.transactionDate = new Date(transactionDate);
    await tx.save();
    await tx.populate('category', 'name type');
    checkAndSendBudgetAlerts(req.user._id).catch(() => {});
    return success(res, formatTx(tx));
  } catch (err) { next(err); }
};

exports.deleteTransaction = async (req, res, next) => {
  try {
    const tx = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!tx) return error(res, 'Transaction not found', 404);
    return success(res, null, 'Transaction deleted');
  } catch (err) { next(err); }
};

const formatTx = (tx) => ({
  id: tx._id,
  type: tx.type,
  amount: tx.amount,
  categoryId: tx.category?._id || tx.category,
  categoryName: tx.category?.name || '',
  categoryType: tx.category?.type || '',
  description: tx.description,
  transactionDate: tx.transactionDate,
  createdAt: tx.createdAt,
});
