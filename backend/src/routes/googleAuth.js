const express = require('express');
const passport = require('passport');
const { generateToken } = require('../utils/tokenHelper');

const router = express.Router();

// @desc    Start Google OAuth login
// @route   GET /api/auth/google
router.get(
    '/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        prompt: 'select_account',
    })
);

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    async (req, res) => {
        try {
            const user = req.user;
            const token = generateToken(user._id);

            const isProduction = process.env.NODE_ENV === 'production';

            // Set HTTP-only cookie (same as normal login)
            res.cookie('token', token, {
                expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                httpOnly: true,
                secure: isProduction,
                sameSite: isProduction ? 'none' : 'lax'
            });

            // Redirect to frontend OAuth success page
            const clientURL = process.env.CLIENT_URL || 'http://localhost:3000';
            res.redirect(`${clientURL}/oauth-success?token=${token}`);
        } catch (error) {
            console.error('Google OAuth callback error:', error);
            const clientURL = process.env.CLIENT_URL || 'http://localhost:3000';
            res.redirect(`${clientURL}/login?error=oauth_failed`);
        }
    }
);

module.exports = router;
