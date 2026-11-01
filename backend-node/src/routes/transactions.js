const router = require('express').Router();
const ctrl = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', ctrl.getTransactions);
router.get('/:id', ctrl.getTransactionById);
router.post('/', ctrl.createTransaction);
router.put('/:id', ctrl.updateTransaction);
router.delete('/:id', ctrl.deleteTransaction);

module.exports = router;
