const express = require('express');
const {
	addToCart,
	fetchCartByUser,
	updateCart,
	deleteFromCart,
} = require('../controllers/cart');


const router = express.Router();

router.post('/', addToCart);
router.get('/', fetchCartByUser);
router.patch('/:id', updateCart);
router.delete('/:id', deleteFromCart);

module.exports = router;
