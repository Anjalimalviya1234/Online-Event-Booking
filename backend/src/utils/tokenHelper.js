const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

const sendTokenResponse = (user, statusCode, res) => {
    const token = generateToken(user._id);

    const isProduction = process.env.NODE_ENV === 'production';

    const options = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax'
    };

    const userData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        avatar: user.avatar,
        vendorStatus: user.vendorStatus,
        businessName: user.businessName,
        vendorDetails: user.vendorDetails
    };

    res.status(statusCode)
        .cookie('token', token, options)
        .json({ success: true, token, user: userData });
};

module.exports = { generateToken, sendTokenResponse };
