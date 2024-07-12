const mongoose = require('mongoose');

require('dotenv').config();

const connectWithDb = async () => {
	try {
		await mongoose.connect(process.env.DATABASE_URL);
		console.log('DB Connected Successfully');
	} catch (error) {
		console.log('Error in connecting with Db');
		process.exit(1);
	}
};

module.exports = connectWithDb;
