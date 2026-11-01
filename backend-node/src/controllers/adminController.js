const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const { success, error } = require('../utils/apiResponse');

exports.getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalTransactions, totalCategories, activeUsers] = await Promise.all([
      User.countDocuments(),
      Transaction.countDocuments(),
      Category.countDocuments({ isSystem: true }),
      User.countDocuments({ active: true }),
    ]);
    return success(res, { totalUsers, totalTransactions, totalCategories, activeUsers });
  } catch (err) { next(err); }
};

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return success(res, users.map(u => ({
      id: u._id, fullName: u.fullName, email: u.email,
      role: u.role, active: u.active, createdAt: u.createdAt,
    })));
  } catch (err) { next(err); }
};

exports.toggleUserActive = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return error(res, 'User not found', 404);
    if (user.role === 'ADMIN') return error(res, 'Cannot deactivate admin', 403);
    user.active = !user.active;
    await user.save();
    return success(res, { id: user._id, active: user.active });
  } catch (err) { next(err); }
};

exports.getCategories = async (req, res, next) => {
  try {
    const cats = await Category.find({ isSystem: true }).sort({ name: 1 });
    return success(res, cats.map(c => ({ id: c._id, name: c.name, type: c.type, description: c.description, isSystem: true })));
  } catch (err) { next(err); }
};

exports.createCategory = async (req, res, next) => {
  try {
    const { name, type, description } = req.body;
    if (!name?.trim()) return error(res, 'Name required', 400);
    const exists = await Category.findOne({ name: name.trim(), type, isSystem: true });
    if (exists) return error(res, 'System category already exists', 400);
    const cat = await Category.create({ name: name.trim(), type, description: description || '', isSystem: true, owner: null });
    return success(res, { id: cat._id, name: cat.name, type: cat.type, description: cat.description, isSystem: true }, 'Category created', 201);
  } catch (err) { next(err); }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const cat = await Category.findOne({ _id: req.params.id, isSystem: true });
    if (!cat) return error(res, 'System category not found', 404);
    const { name, type, description } = req.body;
    if (name) cat.name = name.trim();
    if (type) cat.type = type;
    if (description !== undefined) cat.description = description;
    await cat.save();
    return success(res, { id: cat._id, name: cat.name, type: cat.type, description: cat.description });
  } catch (err) { next(err); }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const cat = await Category.findOne({ _id: req.params.id, isSystem: true });
    if (!cat) return error(res, 'System category not found', 404);
    const inUse = await Transaction.exists({ category: cat._id });
    if (inUse) return error(res, 'Category is in use', 400);
    await cat.deleteOne();
    return success(res, null, 'Category deleted');
  } catch (err) { next(err); }
};
