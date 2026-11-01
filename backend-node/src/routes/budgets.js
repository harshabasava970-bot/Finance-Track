const router = require('express').Router();
const ctrl = require('../controllers/budgetController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', ctrl.getBudgets);
router.get('/analysis', ctrl.getBudgetAnalysis);
router.post('/', ctrl.createBudget);
router.put('/:id', ctrl.updateBudget);
router.delete('/:id', ctrl.deleteBudget);

module.exports = router;
