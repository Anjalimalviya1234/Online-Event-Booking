const User = require('../models/User');
const Venue = require('../models/Venue');
const Booking = require('../models/Booking');
const Availability = require('../models/Availability');
const { sendVenueStatusEmailToVendor } = require('../utils/emailService');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/stats
exports.getAdminStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalVendors = await User.countDocuments({ role: 'vendor' });
        const totalVenues = await Venue.countDocuments();
        const pendingVenues = await Venue.countDocuments({ isApproved: false });
        const totalBookings = await Booking.countDocuments();
        const pendingBookings = await Booking.countDocuments({ status: 'pending' });
        const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
        const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
        const completedBookings = await Booking.countDocuments({ status: 'completed' });
        const revenue = await Booking.aggregate([
            { $match: { status: { $in: ['confirmed', 'completed'] } } },
            { $group: { _id: null, total: { $sum: '$pricing.totalAmount' } } }
        ]);
        const advanceCollected = await Booking.aggregate([
            { $match: { paymentStatus: 'advance-paid' } },
            { $group: { _id: null, total: { $sum: '$pricing.advanceAmount' } } }
        ]);

        res.status(200).json({
            success: true,
            stats: {
                users: totalUsers,
                vendors: totalVendors,
                venues: totalVenues,
                pendingVenues,
                bookings: totalBookings,
                pendingBookings,
                confirmedBookings,
                cancelledBookings,
                completedBookings,
                revenue: revenue[0]?.total || 0,
                advanceCollected: advanceCollected[0]?.total || 0
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get All Venues (Admin)
// @route   GET /api/admin/venues
exports.getAllVenues = async (req, res) => {
    try {
        const { status, search } = req.query;
        let query = {};

        if (status === 'pending') query.isApproved = false;
        if (status === 'approved') query.isApproved = true;

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { city: { $regex: search, $options: 'i' } }
            ];
        }

        const venues = await Venue.find(query)
            .populate('owner', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: venues.length, venues });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Approve/Reject Venue
// @route   PUT /api/admin/venues/:id/status
exports.updateVenueStatus = async (req, res) => {
    try {
        const { isApproved, rejectionReason } = req.body;

        const venue = await Venue.findByIdAndUpdate(
            req.params.id,
            { isApproved, rejectionReason: isApproved ? '' : rejectionReason },
            { new: true }
        ).populate('owner', 'name email');

        if (!venue) {
            return res.status(404).json({ success: false, message: 'Venue not found' });
        }

        // Send email notification to the vendor
        if (venue.owner?.email) {
            sendVenueStatusEmailToVendor(venue, venue.owner.email, isApproved, rejectionReason);
        }

        res.status(200).json({ success: true, venue });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Toggle Venue Active Status (Stop/Resume)
// @route   PUT /api/admin/venues/:id/toggle-active
exports.toggleVenueActive = async (req, res) => {
    try {
        const venue = await Venue.findById(req.params.id);
        if (!venue) {
            return res.status(404).json({ success: false, message: 'Venue not found' });
        }

        venue.isActive = !venue.isActive;
        await venue.save();

        res.status(200).json({
            success: true,
            venue,
            message: venue.isActive ? 'Venue activated successfully' : 'Venue stopped successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Toggle Venue Featured Status
// @route   PUT /api/admin/venues/:id/toggle-featured
exports.toggleFeatured = async (req, res) => {
    try {
        const venue = await Venue.findById(req.params.id);
        if (!venue) {
            return res.status(404).json({ success: false, message: 'Venue not found' });
        }

        venue.featured = !venue.featured;
        await venue.save();

        res.status(200).json({
            success: true,
            venue,
            message: venue.featured ? 'Venue marked as featured' : 'Venue removed from featured'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get Single Venue Details (Admin)
// @route   GET /api/admin/venues/:id
exports.getVenueDetail = async (req, res) => {
    try {
        const venue = await Venue.findById(req.params.id)
            .populate('owner', 'name email mobile');

        if (!venue) {
            return res.status(404).json({ success: false, message: 'Venue not found' });
        }

        res.status(200).json({ success: true, venue });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get All Users
// @route   GET /api/admin/users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: users.length, users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get All Bookings (Admin)
// @route   GET /api/admin/bookings
exports.getAllBookings = async (req, res) => {
    try {
        const { status } = req.query;
        const query = {};
        if (status) query.status = status;

        const bookings = await Booking.find(query)
            .populate('venue', 'name city area images')
            .populate('user', 'name email mobile')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: bookings.length, bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Admin update booking status (with refund)
// @route   PUT /api/admin/bookings/:id/status
exports.adminUpdateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        let refundInfo = null;
        if (status === 'cancelled' && booking.razorpayPaymentId && (booking.paymentStatus === 'advance-paid' || booking.paymentStatus === 'fully-paid')) {
            try {
                const Razorpay = require('razorpay');
                const razorpay = new Razorpay({
                    key_id: process.env.RAZORPAY_KEY_ID,
                    key_secret: process.env.RAZORPAY_KEY_SECRET
                });
                const refundAmount = booking.pricing.advanceAmount * 100;
                const refund = await razorpay.payments.refund(booking.razorpayPaymentId, {
                    amount: refundAmount,
                    notes: { bookingId: booking._id.toString(), reason: 'Cancelled by admin' }
                });
                booking.paymentStatus = 'refunded';
                booking.razorpayRefundId = refund.id;
                refundInfo = { id: refund.id, amount: booking.pricing.advanceAmount, status: refund.status };
            } catch (refundErr) {
                console.error('Admin refund failed:', refundErr.message);
            }
        }

        booking.status = status;
        await booking.save();

        if (status === 'cancelled') {
            await Availability.findOneAndUpdate(
                { booking: booking._id },
                { isAvailable: true, isLocked: false, lockedBy: null, booking: null }
            );
        }

        const updated = await Booking.findById(booking._id)
            .populate('venue', 'name city area')
            .populate('user', 'name email mobile');

        res.status(200).json({ success: true, booking: updated, refund: refundInfo });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get Pending Vendors
// @route   GET /api/admin/vendors/pending
exports.getPendingVendors = async (req, res) => {
    try {
        const vendors = await User.find({ role: 'vendor' })
            .select('-password')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: vendors.length, vendors });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Approve/Reject Vendor
// @route   PUT /api/admin/vendors/:id/status
exports.updateVendorStatus = async (req, res) => {
    try {
        const { vendorStatus, rejectionReason } = req.body;

        if (!['approved', 'rejected'].includes(vendorStatus)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const vendor = await User.findById(req.params.id);
        if (!vendor || vendor.role !== 'vendor') {
            return res.status(404).json({ success: false, message: 'Vendor not found' });
        }

        vendor.vendorStatus = vendorStatus;
        vendor.rejectionReason = vendorStatus === 'rejected' ? (rejectionReason || '') : '';
        await vendor.save({ validateBeforeSave: false });

        res.status(200).json({
            success: true,
            vendor,
            message: vendorStatus === 'approved' ? 'Vendor approved successfully' : 'Vendor rejected'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
