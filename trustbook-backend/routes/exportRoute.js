const express = require('express');
const router = express.Router();
const { exportPDF, exportExcel } = require('../controllers/exportController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/pdf/:accountId/:year/:month', exportPDF);
router.get('/excel/:accountId/:year/:month', exportExcel);

module.exports = router;
