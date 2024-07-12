const Category = require('../models/category');

exports.fetchCategory = async (req, res) => {
	try {
		const category = await Category.find({}).exec();
		return res.status(200).json(category);
	} catch (error) {
		return res.status.json({
			error: error.message,
			error: 'Category not fetched successfully',
		});
	}
};

exports.createCategory = async (req, res) => {
	try {
		const category = new Category(req.body);
		const savedCategory = await category.save();
		return res.status(200).json(savedCategory);
	} catch (error) {
		return res.status(400).json({
			error: 'Cannot Create Category',
		});
	}
};
