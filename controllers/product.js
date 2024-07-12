const Product = require('../models/product');

exports.createProduct = async (req, res) => {
	try {
		const product = new Product(req.body);
		product.discountedPrice = Math.round(product.price * (1 - product.discountPercentage / 100));
		const savedProduct = await product.save();
		res.status(200).json(savedProduct);
	} catch (error) {
		return res.status(400).json({
			error: error.message,
			error: 'Error While Creating Post',
		});
	}
};

exports.fetchAllProducts = async (req, res) => {
	// here we need all query string
	// filter = {category: ["smartphone", "laptops"]};
	// sort = {_sort: "price", _order: "desc"};
	// pagination = {_page: 1, _limit: 10};
	// TODO :we have to try with multiple category and brands after change in front-end
	let condition = {};
	if (!req.query.admin) {
		condition.deleted = { $ne: true };
	}
	let query = Product.find(condition);
	let totalProductQuery = Product.find(condition);

	if (req.query.category) {
		query = query.find({ category: { $in: req.query.category.split(',') } });
		totalProductQuery = totalProductQuery.find({
			category: { $in: req.query.category.split(',') },
		});
	}
	if (req.query.brand) {
		query = query.find({ brand: { $in: req.query.brand.split(',') } });
		totalProductQuery = totalProductQuery.find({ brand: { $in: req.query.brand.split(',') } });
	}
	if (req.query._sort && req.query._order) {
		query = query.sort({ [req.query._sort]: req.query._order });
		// totalProductQuery = (await totalProductQuery).sort({
		// 	[req.query._sort]: req.query._order,
		// });
	}
	if (req.query._page && req.query._limit) {
		const pageSize = req.query._limit;
		const page = req.query._page;
		query = query.skip(pageSize * (page - 1)).limit(pageSize);
	}

	const totalDocs = await totalProductQuery.count().exec();

	// Output total document
	// console.log({totalDocs});

	try {
		const product = await query.exec();
		res.set('X-Total-Count', totalDocs);
		res.status(200).json(product);
	} catch (error) {
		return res.status(400).json({
			error: error.message,
			fatGaya: 'Code Fat gya Filter krne me',
		});
	}
};

exports.fetchProductById = async (req, res) => {
	try {
		const { id } = req.params;
		const foundedProduct = await Product.findById(id);
		return res.status(200).json(foundedProduct);
	} catch (error) {
		return res.status(400).json({
			error: error.message,
			error: 'Error while fetching product by ID',
		});
	}
};

exports.updateProduct = async (req, res) => {
	try {
		const { id } = req.params;
		const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
			new: true,
		});
		updatedProduct.discountedPrice = Math.round(updatedProduct.price * (1 - updatedProduct.discountPercentage / 100));
		await updatedProduct.save();
		return res.status(200).json(updatedProduct);
	} catch (error) {
		return res.status(400).json({
			message: 'Product did not updated Succesfully',
			error: error.message,
		});
	}
};
