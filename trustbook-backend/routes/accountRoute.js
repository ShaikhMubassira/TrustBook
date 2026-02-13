const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/accountController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', ctrl.createAccount);
router.get('/my', ctrl.getMyAccounts);
router.get('/shared', ctrl.getSharedAccounts);
router.get('/search', ctrl.searchAccounts);
router.get('/:id', ctrl.getAccountDetail);
router.put('/:id', ctrl.updateAccount);
router.delete('/:id', ctrl.deleteAccount);
router.get('/:id/transactions', ctrl.getAccountTransactions);
router.get('/:id/statement/:year/:month', ctrl.getAccountStatement);

module.exports = router;
