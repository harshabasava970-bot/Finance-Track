require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const connectDB = require('./config/db');
const seedData = require('./config/seed');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ── Security & middleware ──
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    const allowed = (process.env.FRONTEND_URL || 'http://localhost:5173').split(',').map(s => s.trim());
    if (!origin || allowed.some(a => origin.startsWith(a) || a === '*')) return callback(null, true);
    callback(new Error('CORS not allowed'));
  },
  credentials: true,
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Health check (public) ──
app.get('/actuator/health', (req, res) => res.json({ status: 'UP' }));
app.get('/health', (req, res) => res.json({ status: 'UP' }));
app.get('/', (req, res) => res.json({ message: 'FinanceTrack API', status: 'running' }));

// ── Routes ──
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/budgets', require('./routes/budgets'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/test', require('./routes/test'));

// ── 404 ──
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// ── Error handler ──
app.use(errorHandler);

// ── Start ──
const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  await seedData();

  // Fix: drop old unique index on budgetnotifications if it exists
  try {
    const mongoose = require('mongoose');
    const BudgetNotification = require('./models/BudgetNotification');
    // Wait for connection to be ready
    if (mongoose.connection.readyState === 1) {
      await BudgetNotification.collection.dropIndex('budget_1_threshold_1_month_1_year_1').catch(() => {});
      await BudgetNotification.syncIndexes().catch(() => {});
      console.log('BudgetNotification indexes synced');
    }
  } catch (e) { /* index may not exist, that is fine */ }

  app.listen(PORT, () => console.log(`FinanceTrack server running on port ${PORT}`));
});

module.exports = app;
