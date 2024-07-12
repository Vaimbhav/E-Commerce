const express = require('express');
const {fetchBrand, createBrand} = require('../controllers/brand');

const router = express.Router();

router.get('/', fetchBrand);
router.post('/', createBrand);

module.exports = router;
