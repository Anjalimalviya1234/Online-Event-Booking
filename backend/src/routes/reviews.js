const express = require('express');
const router = express.Router();
const { createReview, getVenueReviews, getVendorReviews, deleteReview } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, createReview);
router.get('/vendor', protect, authorize('vendor', 'admin'), getVendorReviews);
router.get('/venue/:venueId', getVenueReviews);
router.delete('/:id', protect, deleteReview);

module.exports = router;
