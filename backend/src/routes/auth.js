const express = require('express');
const router = express.Router();
const { register, login, getMe, logout, updateProfile, toggleWishlist, getWishlist, } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// router.post('/send-otp', sendOtp);
// router.post('/verify-otp', verifyOtp);
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/wishlist/:venueId', protect, toggleWishlist);
router.get('/wishlist', protect, getWishlist);

module.exports = router;
