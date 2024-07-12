const express = require('express');
const {
	createProduct,
	fetchAllProducts,
	fetchProductById,
	updateProduct,
} = require('../controllers/product');

const router = express.Router();

router.post('/', createProduct);
router.get('/', fetchAllProducts);
router.get('/:id', fetchProductById);
router.patch('/:id', updateProduct);

module.exports = router;
