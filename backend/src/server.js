require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('./config/passport');

const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const venueRoutes = require('./routes/venues');
const bookingRoutes = require('./routes/bookings');
const reviewRoutes = require('./routes/reviews');
const uploadRoutes = require('./routes/upload');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payments');
const googleAuthRoutes = require('./routes/googleAuth');

const app = express();

// Connect to database
connectDB();


// ✅ 🔥 FIXED CORS (IMPORTANT)
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://online-event-booking-3-3kz4.onrender.com'
];

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (Postman, mobile apps)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));


// Body parser
app.use(express.json({
    limit: '10mb',
    verify: (req, res, buf) => {
        if (req.originalUrl === '/api/payments/webhook') {
            req.rawBody = buf.toString();
        }
    }
}));

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// Session
app.use(session({
    secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || 'google_oauth_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    },
}));


// Passport
app.use(passport.initialize());


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', googleAuthRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);


// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Event Booking API is running' });
});


// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
});
