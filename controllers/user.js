const User = require('../models/user');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.fetchUserById = async (req, res) => {
	try {
		const id = req.user.id;
		const user = await User.findById(id);
		return res.status(200).json({ id: user.id, addresses: user.addresses, email: user.email, role: user.role });
	} catch (error) {
		return res.status(400).json({
			success: false,
			message: 'Error in fetching User'
		})
	}
};


exports.updateUser = async (req, res) => {
	try {
		const { id } = req.params;
		const updatedUser = await User.findByIdAndUpdate(id, req.body, {
			new: true,
		});
		return res.status(200).json(updatedUser);
	} catch (error) {
		return res.status(400).json({
			error: error.message,
			message: 'Error While Updating User',
		});
	}
};
