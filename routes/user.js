const express = require('express');
const { fetchUserById, updateUser } = require('../controllers/user');

const router = express.Router();

router.get('/own', fetchUserById);
router.patch('/:id', updateUser);

module.exports = router;
