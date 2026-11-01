const Transaction = require('../models/Transaction');
const { success, error, paginated } = require('../utils/apiResponse');

const buildFilter = (userId, { type, categoryId, startDate, endDate, search }) => {
  const filter = { user: userId };
  if (type) filter.type = type;
  if (categoryId) filter.category = categoryId;
  if (startDate || endDate) {
    filter.transactionDate = {};
    if (startDate) filter.transactionDate.$gte = new Date(startDate);
    if (endDate) { const e = new Date(endDate); e.setHours(23,59,59,999); filter.transactionDate.$lte = e; }
  }
  if (search) filter.$or = [{ description: { $regex: search, $options: 'i' } }];
  return filter;
};

exports.getTransactions = async (req, res, next) => {
  try {
    const { page = 0, size = 20, sortBy = 'transactionDate', sortDir = 'desc', ...filters } = req.query;
    const filter = buildFilter(req.user._id, filters);
    const pageNum = parseInt(page);
    const pageSize = parseInt(size);
    const sort = { [sortBy]: sortDir === 'asc' ? 1 : -1 };

    const [txs, total] = await Promise.all([
      Transaction.find(filter).populate('category', 'name type').sort(sort).skip(pageNum * pageSize).limit(pageSize),
      Transaction.countDocuments(filter),
    ]);

    const content = txs.map(tx => ({
      id: tx._id, type: tx.type, amount: tx.amount,
      categoryId: tx.category?._id, categoryName: tx.category?.name || '',
      description: tx.description, transactionDate: tx.transactionDate,
    }));
    return paginated(res, content, pageNum, pageSize, total, Math.ceil(total / pageSize));
  } catch (err) { next(err); }
};

exports.getSummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    let start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
    let end = endDate ? new Date(endDate) : new Date();
    end.setHours(23,59,59,999);

    const filter = { user: req.user._id, transactionDate: { $gte: start, $lte: end } };

    const [totals, byCategory] = await Promise.all([
      Transaction.aggregate([
        { $match: filter },
        { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Transaction.aggregate([
        { $match: { ...filter, type: 'EXPENSE' } },
        { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'cat' } },
        { $unwind: { path: '$cat', preserveNullAndEmptyArrays: true } },
        { $group: { _id: { $ifNull: ['$cat.name', 'Uncategorized'] }, total: { $sum: '$amount' } } },
        { $sort: { total: -1 } },
      ]),
    ]);

    const income = totals.find(t => t._id === 'INCOME')?.total || 0;
    const expenses = totals.find(t => t._id === 'EXPENSE')?.total || 0;
    const expenseTotal = byCategory.reduce((s, c) => s + c.total, 0);

    return success(res, {
      totalIncome: income,
      totalExpenses: expenses,
      netBalance: income - expenses,
      transactionCount: totals.reduce((s, t) => s + t.count, 0),
      expenseByCategory: byCategory.map(c => ({
        category: c._id, total: c.total,
        percentage: expenseTotal > 0 ? Math.round((c.total / expenseTotal) * 10000) / 100 : 0,
      })),
      incomeByCategory: [],
    });
  } catch (err) { next(err); }
};

exports.exportCsv = async (req, res, next) => {
  try {
    const { type, categoryId, startDate, endDate, search } = req.query;
    const filter = buildFilter(req.user._id, { type, categoryId, startDate, endDate, search });
    const txs = await Transaction.find(filter).populate('category', 'name').sort({ transactionDate: -1 });

    let csv = 'Date,Type,Category,Description,Amount\n';
    txs.forEach(tx => {
      const date = tx.transactionDate ? new Date(tx.transactionDate).toISOString().split('T')[0] : '';
      const desc = (tx.description || '').replace(/,/g, ';').replace(/"/g, '""');
      const cat = (tx.category?.name || '').replace(/,/g, ';');
      csv += `${date},${tx.type},${cat},"${desc}",${tx.amount}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="financetrack_${new Date().toISOString().split('T')[0]}.csv"`);
    return res.send(csv);
  } catch (err) { next(err); }
};
