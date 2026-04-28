const Review = require('../models/Review');
const Booking = require('../models/Booking');

// @desc    Create review
// @route   POST /api/reviews
exports.createReview = async (req, res) => {
    try {
        const { venueId, rating, title, comment, images, eventType, eventDate } = req.body;

        const existingReview = await Review.findOne({ user: req.user._id, venue: venueId });
        if (existingReview) {
            return res.status(400).json({ success: false, message: 'You have already reviewed this venue' });
        }

        const review = await Review.create({
            user: req.user._id,
            venue: venueId,
            rating,
            title,
            comment,
            images,
            eventType,
            eventDate
        });

        const populatedReview = await Review.findById(review._id).populate('user', 'name avatar');
        res.status(201).json({ success: true, review: populatedReview });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get venue reviews
// @route   GET /api/reviews/venue/:venueId
exports.getVenueReviews = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const [reviews, total] = await Promise.all([
            Review.find({ venue: req.params.venueId })
                .populate('user', 'name avatar')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            Review.countDocuments({ venue: req.params.venueId })
        ]);

        res.status(200).json({ success: true, count: reviews.length, total, reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all reviews for vendor's venues
// @route   GET /api/reviews/vendor
exports.getVendorReviews = async (req, res) => {
    try {
        const Venue = require('../models/Venue');
        const venues = await Venue.find({ owner: req.user._id }).select('_id name');
        const venueIds = venues.map(v => v._id);

        const reviews = await Review.find({ venue: { $in: venueIds } })
            .populate('user', 'name avatar')
            .populate('venue', 'name city')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: reviews.length, reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await review.deleteOne();
        res.status(200).json({ success: true, message: 'Review deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
