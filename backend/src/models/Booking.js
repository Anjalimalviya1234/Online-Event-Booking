const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    bookingId: {
        type: String,
        unique: true,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    venue: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Venue',
        required: true
    },
    eventType: {
        type: String,
        required: [true, 'Event type is required'],
        enum: ['wedding', 'reception', 'engagement', 'birthday', 'corporate', 'conference', 'party', 'anniversary', 'other']
    },
    eventDate: {
        type: Date,
        required: [true, 'Event date is required']
    },
    eventTime: {
        start: String,
        end: String
    },
    guestCount: {
        type: Number,
        required: [true, 'Guest count is required'],
        min: 1
    },
    packageSelected: {
        name: String,
        price: Number,
        includes: [String]
    },
    addOns: [{
        name: String,
        price: Number
    }],
    specialNotes: String,
    pricing: {
        basePrice: { type: Number, required: true },
        addOnsTotal: { type: Number, default: 0 },
        tax: { type: Number, default: 0 },
        totalAmount: { type: Number, required: true },
        advanceAmount: { type: Number, required: true },
        remainingAmount: { type: Number, required: true }
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['unpaid', 'advance-paid', 'fully-paid', 'refunded'],
        default: 'unpaid'
    },
    venueContact: {
        name: String,
        phone: String
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    razorpayRefundId: String
}, {
    timestamps: true
});

bookingSchema.pre('save', function (next) {
    if (!this.bookingId) {
        this.bookingId = 'EVB-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
    }
    next();
});

module.exports = mongoose.model('Booking', bookingSchema);
