const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Category = require('../models/Category');
const { success, error } = require('../utils/apiResponse');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

exports.register = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;
    if (await User.findOne({ email })) {
      return error(res, 'Email already registered', 400);
    }
    const user = await User.create({ fullName, email, password });
    return success(res, { id: user._id, fullName: user.fullName, email: user.email, role: user.role }, 'Registered successfully', 201);
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return error(res, 'Email and password required', 400);
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.active) return error(res, 'Invalid credentials', 401);
    const ok = await user.comparePassword(password);
    if (!ok) return error(res, 'Invalid credentials', 401);
    const token = signToken(user._id);
    const userData = { id: user._id, fullName: user.fullName, email: user.email, role: user.role, active: user.active, createdAt: user.createdAt };
    return success(res, { token, user: userData }, 'Login successful');
  } catch (err) { next(err); }
};

exports.getProfile = async (req, res) => {
  const u = req.user;
  return success(res, { id: u._id, fullName: u.fullName, email: u.email, role: u.role, active: u.active, createdAt: u.createdAt });
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { fullName } = req.body;
    if (!fullName?.trim()) return error(res, 'Full name is required', 400);
    const user = await User.findByIdAndUpdate(req.user._id, { fullName: fullName.trim() }, { new: true });
    return success(res, { id: user._id, fullName: user.fullName, email: user.email, role: user.role });
  } catch (err) { next(err); }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return error(res, 'Current password is incorrect', 400);
    }
    if (!newPassword || newPassword.length < 8) return error(res, 'New password must be at least 8 characters', 400);
    user.password = newPassword;
    await user.save();
    return success(res, null, 'Password changed successfully');
  } catch (err) { next(err); }
};
