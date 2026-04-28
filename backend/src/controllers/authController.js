const User = require('../models/User');
const { sendTokenResponse } = require('../utils/tokenHelper');

// @desc    Register user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { name, email, mobile, password, role, businessName, vendorDetails } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        const userData = { name, email, mobile, password, role: role || 'user' };

        // Vendor specific
        if (role === 'vendor') {
            userData.businessName = businessName;
            userData.vendorDetails = vendorDetails || {};
            userData.vendorStatus = 'pending';
        }

        const user = await User.create(userData);
        sendTokenResponse(user, 201, res);

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};


// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        sendTokenResponse(user, 200, res);

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};


// @desc    Get current user
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('wishlist');
        res.status(200).json({ success: true, user });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};


// @desc    Logout
// @route   POST /api/auth/logout
exports.logout = async (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 5 * 1000),
        httpOnly: true
    });

    res.status(200).json({ success: true, message: 'Logged out successfully' });
};


// @desc    Update profile
// @route   PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, mobile, avatar } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { name, mobile, avatar },
            { new: true, runValidators: true }
        );

        res.status(200).json({ success: true, user });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};


// @desc    Toggle wishlist
// @route   PUT /api/auth/wishlist/:venueId
exports.toggleWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const venueId = req.params.venueId;

        const index = user.wishlist.indexOf(venueId);

        if (index > -1) {
            user.wishlist.splice(index, 1);
        } else {
            user.wishlist.push(venueId);
        }

        await user.save({ validateBeforeSave: false });

        const updatedUser = await User.findById(req.user._id).populate('wishlist');

        res.status(200).json({
            success: true,
            isLiked: index === -1,
            wishlist: updatedUser.wishlist,
            message: index > -1 ? 'Removed from wishlist' : 'Added to wishlist'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};


// @desc    Get wishlist
// @route   GET /api/auth/wishlist
exports.getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate({
            path: 'wishlist',
            populate: { path: 'owner', select: 'name' }
        });

        res.status(200).json({ success: true, venues: user.wishlist });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};