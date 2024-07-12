const Brand = require('../models/brand');

exports.fetchBrand = async (req, res) => {
	try {
		const brand = await Brand.find({}).exec();
		return res.status(200).json(brand);
	} catch (error) {
		return res.status(400).json({
			error: error.message,
			error: `Can't fetch all brands`,
		});
	}
};

exports.createBrand = async (req, res) => {
	try {
		const brand = new Brand(req.body);
		const savedBrand = await brand.save();
		return res.status(200).json(savedBrand);
	} catch (error) {
		return res.status(400).json({
			error: 'Cannot Create Brand.',
		});
	}
};
