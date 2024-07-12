const express = require('express');
const { createUser, loginUser, checkAuth, logOutUser, resetPassword, resetPasswordRequest } = require('../controllers/auth');
const passport = require('passport');
const router = express.Router();

router.post('/signup', createUser);
router.post('/login', passport.authenticate('local'), loginUser);
router.get('/logout', logOutUser);
router.get('/check', passport.authenticate('jwt'), checkAuth);
router.post('/reset-password-request', resetPasswordRequest)
router.post('/reset-password', resetPassword);

module.exports = router;

// req.session.isAuth = true;