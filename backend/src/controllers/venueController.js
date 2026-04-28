const Venue = require('../models/Venue');
const User = require('../models/User');
const Availability = require('../models/Availability');
const { sendNewVenueEmailToAdmin } = require('../utils/emailService');

// @desc    Get all venues with filters
// @route   GET /api/venues
exports.getVenues = async (req, res) => {
    try {
        const {
            city, area, venueType, occasion, minPrice, maxPrice,
            minCapacity, maxCapacity, parking, ac, catering,
            decoration, sort, page = 1, limit = 12, search, featured, date
        } = req.query;

        const query = { isApproved: true, isActive: true };

        if (city) query.city = new RegExp(city, 'i');
        if (area) query.area = new RegExp(area, 'i');
        if (venueType) query.venueType = venueType;
        if (occasion) query.occasions = { $in: [occasion] };
        if (featured === 'true') query.featured = true;

        if (minPrice || maxPrice) {
            query.startingPrice = {};
            if (minPrice) query.startingPrice.$gte = Number(minPrice);
            if (maxPrice) query.startingPrice.$lte = Number(maxPrice);
        }

        if (minCapacity || maxCapacity) {
            if (minCapacity) query['capacity.max'] = { $gte: Number(minCapacity) };
            if (maxCapacity) query['capacity.min'] = { $lte: Number(maxCapacity) };
        }

        if (parking === 'true') query['amenities.parking'] = true;
        if (ac === 'true') query['amenities.ac'] = true;
        if (catering === 'true') query['amenities.cateringAvailable'] = true;
        if (decoration === 'true') query['amenities.decorationAvailable'] = true;

        if (search) {
            query.$or = [
                { name: new RegExp(search, 'i') },
                { city: new RegExp(search, 'i') },
                { area: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') }
            ];
        }

        // Date-based availability filter: exclude venues that are booked/unavailable on the given date
        if (date) {
            const unavailable = await Availability.find({
                date: new Date(date),
                isAvailable: false
            }).select('venue');
            const unavailableVenueIds = unavailable.map(a => a.venue);
            if (unavailableVenueIds.length > 0) {
                query._id = { $nin: unavailableVenueIds };
            }
        }

        let sortOption = { createdAt: -1 };
        if (sort === 'price-low') sortOption = { startingPrice: 1 };
        if (sort === 'price-high') sortOption = { startingPrice: -1 };
        if (sort === 'rating') sortOption = { 'rating.average': -1 };
        if (sort === 'popular') sortOption = { 'rating.count': -1 };

        const skip = (Number(page) - 1) * Number(limit);

        const [venues, total] = await Promise.all([
            Venue.find(query)
                .sort(sortOption)
                .skip(skip)
                .limit(Number(limit))
                .select('-foodMenu -packages'),
            Venue.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            count: venues.length,
            total,
            totalPages: Math.ceil(total / Number(limit)),
            currentPage: Number(page),
            venues
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get vendor venues
// @route   GET /api/venues/my-venues
exports.getMyVenues = async (req, res) => {
    try {
        const venues = await Venue.find({ owner: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: venues.length, venues });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single venue
// @route   GET /api/venues/:id
exports.getVenue = async (req, res) => {
    try {
        const venue = await Venue.findById(req.params.id)
            .populate('owner', 'name email mobile')
            .populate({
                path: 'reviews',
                populate: { path: 'user', select: 'name avatar' },
                options: { sort: { createdAt: -1 }, limit: 10 }
            });

        if (!venue) {
            return res.status(404).json({ success: false, message: 'Venue not found' });
        }

        res.status(200).json({ success: true, venue });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create venue
// @route   POST /api/venues
exports.createVenue = async (req, res) => {
    try {
        console.log('Creating venue with body:', JSON.stringify(req.body, null, 2));
        console.log('User ID:', req.user._id);
        req.body.owner = req.user._id;
        const venue = await Venue.create(req.body);

        // Send email notification to admin
        const vendor = await User.findById(req.user._id).select('name email mobile');
        sendNewVenueEmailToAdmin(venue, vendor);

        res.status(201).json({ success: true, venue });
    } catch (error) {
        console.error('Create Venue Error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Venue with this name already exists' });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: error.message, stack: error.stack });
    }
};

// @desc    Update venue
// @route   PUT /api/venues/:id
exports.updateVenue = async (req, res) => {
    try {
        let venue = await Venue.findById(req.params.id);

        if (!venue) {
            return res.status(404).json({ success: false, message: 'Venue not found' });
        }

        if (venue.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to update this venue' });
        }

        venue = await Venue.findByIdAndUpdate(req.params.id, req.body, {
            new: true, runValidators: true
        });

        res.status(200).json({ success: true, venue });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete venue
// @route   DELETE /api/venues/:id
exports.deleteVenue = async (req, res) => {
    try {
        const venue = await Venue.findById(req.params.id);

        if (!venue) {
            return res.status(404).json({ success: false, message: 'Venue not found' });
        }

        if (venue.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await venue.deleteOne();
        res.status(200).json({ success: true, message: 'Venue deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get featured venues
// @route   GET /api/venues/featured
exports.getFeaturedVenues = async (req, res) => {
    try {
        const venues = await Venue.find({ isApproved: true, isActive: true, featured: true })
            .sort({ 'rating.average': -1 })
            .limit(8);
        res.status(200).json({ success: true, venues });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get venue cities
// @route   GET /api/venues/cities
exports.getCities = async (req, res) => {
    try {
        const cities = await Venue.distinct('city', { isApproved: true, isActive: true });
        res.status(200).json({ success: true, cities });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
