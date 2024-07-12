const Cart = require('../models/cart');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.addToCart = async (req, res) => {
	try {
		const id = req.user.id;
		const item = new Cart({ ...req.body, user: id });
		const savedItem = await item.save();
		const doc = savedItem.populate('product');
		return res.status(200).json(doc);
	}
	catch (error) {
		return res.status(401).json({
			success: false,
			err: error.message
		})
	}
};

exports.fetchCartByUser = async (req, res) => {
	try {
		const id = req.user.id;
		const cartItems = await Cart.find({ user: id }).populate('product');
		return res.status(200).json(cartItems);
	} catch (error) {
		return res.status(401).json({
			success: false,
			message: 'Unable to fetch cart by user ',
		})
	}
};

exports.updateCart = async (req, res) => {
	try {
		const { id } = req.params;
		const updatedCart = await Cart.findByIdAndUpdate(id, req.body, {
			new: true,
		}).populate('product');
		return res.status(200).json(updatedCart);
	} catch (error) {
		return res.status(400).json({
			message: 'Error In Updating Cart Item',
		});
	}
};

exports.deleteFromCart = async (req, res) => {
	try {
		const { id } = req.params;
		const doc = await Cart.findByIdAndDelete(id);
		return res.status(200).json(doc);
	} catch (error) {
		return res.status(400).json({
			message: 'Error In Deleting Cart Item',
		});
	}
};
