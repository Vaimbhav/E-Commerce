const express = require('express');
const {
	createOrder,
	fetchOrderByUser,
	deleteOrder,
	updateOrder,
	fetchAllOrders,
	getPayment,
	verifyPayment,
} = require('../controllers/order');

const router = express.Router();

router.post('/', createOrder);
router.get('/own', fetchOrderByUser);
router.delete('/:id', deleteOrder);
router.patch('/:id', updateOrder);
router.get('/', fetchAllOrders);

module.exports = router;
