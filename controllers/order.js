const { sendMail, invoiceTemplate } = require('../common');
const Order = require('../models/orders');
const Product = require('../models/product');
const User = require('../models/user');


exports.fetchOrderByUser = async (req, res) => {
	try {
		const { id } = req.user;
		const order = await Order.find({ user: id });
		return res.status(200).json(order);
	} catch (error) {
		return res.status(400).json({
			message: 'Error in fetching order by user',
		});
	}
};


exports.createOrder = async (req, res) => {

	try {
		const doc = new Order(req.body);
		const user = await User.findById(doc.user);
		const order = await doc.save();
		await sendMail({ to: user.email, html: invoiceTemplate(order), subject: 'Order Received' })


		for (let item of order.items) {
			await Product.updateOne({ _id: item.product.id }, { $inc: { 'stock': (-1 * item.quantity) } });
		}

		return res.status(200).json(order);
	} catch (error) {
		return res.status(400).json({
			message: 'Error in creating order',
		});
	}
};

exports.updateOrder = async (req, res) => {
	try {
		const { id } = req.params;
		const doc = await Order.findByIdAndUpdate(id, req.body, { new: true });
		const order = await doc.save();
		return res.status(200).json(order);
	} catch (error) {
		return res.status(400).json({
			message: 'Error in updating order',
		});
	}
};

exports.deleteOrder = async (req, res) => {
	try {
		const { id } = req.params;
		const doc = await Order.findByIdAndDelete(id);
		return res.status(200).json(doc);
	} catch (error) {
		return res.status(400).json({
			message: 'Error in updating order',
		});
	}
};

exports.fetchAllOrders = async (req, res) => {
	// sort = {_sort: "price", _order: "desc"};
	// pagination = {_page: 1, _limit: 10};

	let query = Order.find({ deleted: { $ne: true } });
	let totalQuery = Order.find({ deleted: { $ne: true } });

	if (req.query._sort && req.query._order) {
		query = query.sort({ [req.query._sort]: req.query._order });
	}

	if (req.query._page && req.query._limit) {
		const pageSize = req.query._limit;
		const page = req.query.page;
		query = query.skip(pageSize * (page - 1)).limit(pageSize);
	}

	try {
		const totalOrder = await totalQuery.count().exec();
		const order = await query.exec();
		res.set('X-Total-Count', totalOrder);
		return res.status(200).json(order);
	} catch (error) {
		return res.status(400).json({
			message: 'Error in fetching all orders',
		});
	}
};