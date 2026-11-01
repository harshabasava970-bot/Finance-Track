const router = require('express').Router();
const ctrl = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/summary', ctrl.getSummary);
router.get('/monthly', ctrl.getMonthlyData);
router.get('/categories', ctrl.getCategorySpending);
router.get('/budget-analysis', require('../controllers/budgetController').getBudgetAnalysis);

module.exports = router;
