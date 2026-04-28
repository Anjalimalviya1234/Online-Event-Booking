const express = require('express');
const router = express.Router();
const {
    getVenues, getVenue, createVenue, updateVenue, deleteVenue,
    getFeaturedVenues, getCities, getMyVenues
} = require('../controllers/venueController');
const { protect, authorize } = require('../middleware/auth');

router.get('/featured', getFeaturedVenues);
router.get('/cities', getCities);
router.get('/my-venues', protect, authorize('vendor', 'admin'), getMyVenues);
router.get('/', getVenues);
router.get('/:id', getVenue);
router.post('/', protect, authorize('vendor', 'admin'), createVenue);
router.put('/:id', protect, authorize('vendor', 'admin'), updateVenue);
router.delete('/:id', protect, authorize('vendor', 'admin'), deleteVenue);

module.exports = router;
