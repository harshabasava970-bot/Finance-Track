const router = require('express').Router();
const ctrl = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/transactions', ctrl.getTransactions);
router.get('/summary', ctrl.getSummary);
router.get('/export', ctrl.exportCsv);

module.exports = router;
