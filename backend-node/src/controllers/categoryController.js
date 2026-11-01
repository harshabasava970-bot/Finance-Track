const Category = require('../models/Category');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const { success, error } = require('../utils/apiResponse');

// Get categories visible to the user: system + their own
exports.getCategories = async (req, res, next) => {
  try {
    const { type } = req.query;
    const filter = { $or: [{ isSystem: true }, { owner: req.user._id }] };
    if (type) filter.type = type;
    const cats = await Category.find(filter).sort({ isSystem: -1, name: 1 });
    return success(res, cats.map(c => ({
      id: c._id, name: c.name, type: c.type, description: c.description,
      isSystem: c.isSystem, owner: c.owner,
    })));
  } catch (err) { next(err); }
};

// Users create personal categories
exports.createCategory = async (req, res, next) => {
  try {
    const { name, type, description } = req.body;
    if (!name?.trim()) return error(res, 'Category name is required', 400);
    if (!['INCOME', 'EXPENSE'].includes(type)) return error(res, 'Type must be INCOME or EXPENSE', 400);
    const exists = await Category.findOne({ name: name.trim(), type, owner: req.user._id });
    if (exists) return error(res, 'Category with this name and type already exists', 400);
    const cat = await Category.create({ name: name.trim(), type, description: description || '', owner: req.user._id, isSystem: false });
    return success(res, { id: cat._id, name: cat.name, type: cat.type, description: cat.description, isSystem: false }, 'Category created', 201);
  } catch (err) { next(err); }
};

// Users update their own categories
exports.updateCategory = async (req, res, next) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return error(res, 'Category not found', 404);
    if (cat.isSystem) return error(res, 'Cannot modify system categories', 403);
    if (String(cat.owner) !== String(req.user._id)) return error(res, 'Not authorized', 403);
    const { name, type, description } = req.body;
    if (name) cat.name = name.trim();
    if (type) cat.type = type;
    if (description !== undefined) cat.description = description;
    await cat.save();
    return success(res, { id: cat._id, name: cat.name, type: cat.type, description: cat.description });
  } catch (err) { next(err); }
};

// Users delete their own categories (if not in use)
exports.deleteCategory = async (req, res, next) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return error(res, 'Category not found', 404);
    if (cat.isSystem) return error(res, 'Cannot delete system categories', 403);
    if (String(cat.owner) !== String(req.user._id)) return error(res, 'Not authorized', 403);
    const inUse = await Transaction.exists({ category: cat._id, user: req.user._id });
    if (inUse) return error(res, 'Category is used in transactions and cannot be deleted', 400);
    await cat.deleteOne();
    return success(res, null, 'Category deleted');
  } catch (err) { next(err); }
};
