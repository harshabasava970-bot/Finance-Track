const Category = require('../models/Category');
const User = require('../models/User');

const SYSTEM_CATEGORIES = [
  { name: 'Salary', type: 'INCOME' },
  { name: 'Freelance', type: 'INCOME' },
  { name: 'Business Income', type: 'INCOME' },
  { name: 'Investment Returns', type: 'INCOME' },
  { name: 'Rental Income', type: 'INCOME' },
  { name: 'Other Income', type: 'INCOME' },
  { name: 'Food & Dining', type: 'EXPENSE' },
  { name: 'Groceries', type: 'EXPENSE' },
  { name: 'Transportation', type: 'EXPENSE' },
  { name: 'Utilities', type: 'EXPENSE' },
  { name: 'Healthcare', type: 'EXPENSE' },
  { name: 'Education', type: 'EXPENSE' },
  { name: 'Shopping', type: 'EXPENSE' },
  { name: 'Entertainment', type: 'EXPENSE' },
  { name: 'Rent', type: 'EXPENSE' },
  { name: 'Insurance', type: 'EXPENSE' },
  { name: 'Travel', type: 'EXPENSE' },
  { name: 'Personal Care', type: 'EXPENSE' },
  { name: 'Savings', type: 'EXPENSE' },
  { name: 'Other Expense', type: 'EXPENSE' },
];

const seedData = async () => {
  try {
    // Seed system categories
    for (const cat of SYSTEM_CATEGORIES) {
      await Category.findOneAndUpdate(
        { name: cat.name, type: cat.type, isSystem: true },
        { ...cat, isSystem: true, owner: null },
        { upsert: true, new: true }
      );
    }
    console.log('System categories seeded');

    // Create default admin if not exists
    const adminEmail = 'admin@financetrack.com';
    const exists = await User.findOne({ email: adminEmail });
    if (!exists) {
      await User.create({
        fullName: 'Admin',
        email: adminEmail,
        password: 'Admin@1234',
        role: 'ADMIN',
      });
      console.log('Default admin created: admin@financetrack.com / Admin@1234');
    }
  } catch (err) {
    console.error('Seed error:', err.message);
  }
};

module.exports = seedData;
