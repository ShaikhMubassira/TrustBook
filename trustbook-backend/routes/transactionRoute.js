const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

// All transaction routes require authentication
router.use(protect);

router.post('/add', ctrl.addTransaction);
router.get('/all', ctrl.getAllTransactions);
router.get('/dashboard', ctrl.getDashboardStats);
router.get('/search', ctrl.searchTransactions);
router.delete('/:id', ctrl.deleteTransaction);

module.exports = router;

module.exports = router;