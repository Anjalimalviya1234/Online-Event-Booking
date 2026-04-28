const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Only register Google Strategy if credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL,
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    // Find user by googleId or email
                    let user = await User.findOne({
                        $or: [
                            { googleId: profile.id },
                            { email: profile.emails[0].value }
                        ]
                    });

                    if (user) {
                        // Link google account if not already linked
                        if (!user.googleId) {
                            user.googleId = profile.id;
                            if (profile.photos?.[0]?.value && !user.avatar) {
                                user.avatar = profile.photos[0].value;
                            }
                            await user.save({ validateBeforeSave: false });
                        }
                        return done(null, user);
                    }

                    // Create new user
                    user = await User.create({
                        googleId: profile.id,
                        email: profile.emails[0].value,
                        name: profile.displayName,
                        avatar: profile.photos?.[0]?.value || '',
                        isVerified: true,
                        password: require('crypto').randomBytes(32).toString('hex') // random password for Google users
                    });

                    return done(null, user);
                } catch (err) {
                    return done(err, null);
                }
            }
        )
    );
} else {
    console.warn('⚠️  Google OAuth credentials not found. Google login will be disabled.');
}

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

module.exports = passport;

