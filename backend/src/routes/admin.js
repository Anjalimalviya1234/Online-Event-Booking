const express = require('express');
const router = express.Router();
const { getAdminStats, getAllVenues, updateVenueStatus, toggleVenueActive, toggleFeatured, getVenueDetail, getAllUsers, getAllBookings, adminUpdateBookingStatus, getPendingVendors, updateVendorStatus } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/venues', getAllVenues);
router.get('/venues/:id', getVenueDetail);
router.put('/venues/:id/status', updateVenueStatus);
router.put('/venues/:id/toggle-active', toggleVenueActive);
router.put('/venues/:id/toggle-featured', toggleFeatured);
router.get('/users', getAllUsers);
router.get('/bookings', getAllBookings);
router.put('/bookings/:id/status', adminUpdateBookingStatus);

// Vendor management
router.get('/vendors/pending', getPendingVendors);
router.put('/vendors/:id/status', updateVendorStatus);

module.exports = router;
