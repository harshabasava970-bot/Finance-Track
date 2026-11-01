const Transaction = require('../models/Transaction');
const { success } = require('../utils/apiResponse');

exports.getSummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = { user: req.user._id };
    if (startDate || endDate) {
      filter.transactionDate = {};
      if (startDate) filter.transactionDate.$gte = new Date(startDate);
      if (endDate) { const e = new Date(endDate); e.setHours(23,59,59,999); filter.transactionDate.$lte = e; }
    }
    const agg = await Transaction.aggregate([
      { $match: filter },
      { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);
    const income = agg.find(a => a._id === 'INCOME')?.total || 0;
    const expenses = agg.find(a => a._id === 'EXPENSE')?.total || 0;
    const totalTx = agg.reduce((s, a) => s + a.count, 0);
    return success(res, {
      totalIncome: income, totalExpenses: expenses,
      balance: income - expenses, totalSavings: income - expenses,
      totalTransactions: totalTx,
    });
  } catch (err) { next(err); }
};

exports.getMonthlyData = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = { user: req.user._id };
    if (startDate) filter.transactionDate = { $gte: new Date(startDate) };
    if (endDate) { const e = new Date(endDate); e.setHours(23,59,59,999); filter.transactionDate = { ...(filter.transactionDate || {}), $lte: e }; }
    const agg = await Transaction.aggregate([
      { $match: filter },
      { $group: { _id: { year: { $year: '$transactionDate' }, month: { $month: '$transactionDate' }, type: '$type' }, total: { $sum: '$amount' } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);
    const months = {};
    const NAMES = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    agg.forEach(({ _id, total }) => {
      const key = `${_id.year}-${_id.month}`;
      if (!months[key]) months[key] = { year: _id.year, month: _id.month, monthName: NAMES[_id.month], income: 0, expenses: 0 };
      if (_id.type === 'INCOME') months[key].income = total;
      else months[key].expenses = total;
    });
    return success(res, Object.values(months));
  } catch (err) { next(err); }
};

exports.getCategorySpending = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = { user: req.user._id, type: 'EXPENSE' };
    if (startDate || endDate) {
      filter.transactionDate = {};
      if (startDate) filter.transactionDate.$gte = new Date(startDate);
      if (endDate) { const e = new Date(endDate); e.setHours(23,59,59,999); filter.transactionDate.$lte = e; }
    }
    const agg = await Transaction.aggregate([
      { $match: filter },
      { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'cat' } },
      { $unwind: '$cat' },
      { $group: { _id: '$cat.name', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
    ]);
    const grandTotal = agg.reduce((s, a) => s + a.total, 0);
    return success(res, agg.map(a => ({
      category: a._id, total: a.total,
      percentage: grandTotal > 0 ? Math.round((a.total / grandTotal) * 10000) / 100 : 0,
    })));
  } catch (err) { next(err); }
};
