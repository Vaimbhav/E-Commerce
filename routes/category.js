const express = require('express');
const { fetchCategory, createCategory } = require('../controllers/category');

const router = express.Router();

router.get('/', fetchCategory);
router.post('/', createCategory);

module.exports = router;
