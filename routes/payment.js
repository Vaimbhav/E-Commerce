const express = require('express');
const { getPayment, verifyPayment } = require('../controllers/payment');
const router = express.Router();

router.post('/get-payment', getPayment);
router.post('/paymentverification', verifyPayment);

module.exports = router;