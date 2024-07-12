const { sanitizeUser, sendMail } = require('../common');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config();
const cookie = require('cookie');


exports.createUser = async (req, res) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) {
			return res.status(400).json({
				success: false,
				message: 'Email And Password is Required',
			});
		}
		const user = await User.findOne({ email });
		if (user) {
			return res.status(400).json({
				success: false,
				message: 'User Already Registered',
			});
		}
		let hashedPassword;
		try {
			hashedPassword = await bcrypt.hash(password, 10);
		} catch (error) {
			return res.status(400).json({
				success: false,
				message: 'Error in Hashing Password',
			});
		}
		const newUser = new User({
			email,
			password: hashedPassword,
		});

		const doc = await newUser.save();

		req.login(sanitizeUser(doc), (err) => {
			if (err) {
				res.status(400).json(err);
			}
			else {
				const token = jwt.sign(sanitizeUser(doc), process.env.SECRET_KEY);
				return res.cookie(
					'jwt',
					token,
					{ expires: new Date(Date.now() + 5 * 60 * 60 * 1000), httpOnly: true }
				).status(201).json(token);
			}
		})
	} catch (error) {
		return res.status(400).json({
			success: false,
			message: 'User Cannot Be Formed',
		});
	}
};

exports.loginUser = async (req, res) => {
	const user = req.user;
	// console.log('here ', user);
	return res.cookie(
		'jwt',
		user.token,
		{ expires: new Date(Date.now() + 5 * 60 * 60 * 1000), httpOnly: true }
	).status(201).json(sanitizeUser(user));
};

exports.checkAuth = async (req, res) => {
	if (req.user) {
		return res.json(req.user);
	}
	else {
		return res.sendStatus(401).json({
			success: false,
			message: 'User Not Verified',
		})
	}
}

exports.logOutUser = async (req, res) => {
	return res.cookie(
		'jwt',
		null,
		{ expires: new Date(Date.now()), httpOnly: true }
	).sendStatus(200);
}



exports.resetPasswordRequest = async (req, res) => {
	const email = req.body.email;
	const user = await User.findOne({ email: email });
	if (user) {
		const token = crypto.randomBytes(48).toString('hex');
		user.resetPasswordToken = token;
		await user.save();

		// Also set token in email
		const resetPageLink =
			'https://ecommerce-b6ia.onrender.com/reset-password?token=' + token + '&email=' + email;
		const subject = 'reset password for e-commerce';
		const html = `<p>Click <a href='${resetPageLink}'>here</a> to Reset Password</p>`;

		// lets send email and a token in the mail body so we can verify that user has clicked right link

		if (email) {
			const response = await sendMail({ to: email, subject, html });
			res.json(response);
		} else {
			res.sendStatus(400);
		}
	} else {
		res.sendStatus(400);
	}
};

exports.resetPassword = async (req, res) => {
	const { email, password, token } = req.body;

	const user = await User.findOne({ email: email, resetPasswordToken: token });
	if (user) {
		let hashedPassword;
		try {
			hashedPassword = await bcrypt.hash(password, 10);
		} catch (error) {
			return res.status(400).json({
				success: false,
				message: 'Error in Hashing Password',
			});
		}
		user.password = hashedPassword;
		await user.save();
		const subject = 'password successfully reset for e-commerce';
		const html = `<p>Successfully able to Reset Password</p>`;
		if (email) {
			const response = await sendMail({ to: email, subject, html });
			res.json(response);
		} else {
			res.sendStatus(400);
		}


	} else {
		res.sendStatus(400);
	}
};


