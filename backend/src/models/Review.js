const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
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
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: 1,
        max: 5
    },
    title: {
        type: String,
        trim: true,
        maxlength: 100
    },
    comment: {
        type: String,
        required: [true, 'Review comment is required'],
        maxlength: 1000
    },
    images: [{
        url: String,
        public_id: String
    }],
    eventType: String,
    eventDate: Date,
    isVerified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

reviewSchema.index({ venue: 1, user: 1 }, { unique: true });

reviewSchema.statics.calculateAverageRating = async function (venueId) {
    const result = await this.aggregate([
        { $match: { venue: venueId } },
        {
            $group: {
                _id: '$venue',
                averageRating: { $avg: '$rating' },
                count: { $sum: 1 }
            }
        }
    ]);

    try {
        const Venue = require('./Venue');
        if (result.length > 0) {
            await Venue.findByIdAndUpdate(venueId, {
                'rating.average': Math.round(result[0].averageRating * 10) / 10,
                'rating.count': result[0].count
            });
        } else {
            await Venue.findByIdAndUpdate(venueId, {
                'rating.average': 0,
                'rating.count': 0
            });
        }
    } catch (err) {
        console.error(err);
    }
};

reviewSchema.post('save', function () {
    this.constructor.calculateAverageRating(this.venue);
});

reviewSchema.post('deleteOne', { document: true }, function () {
    this.constructor.calculateAverageRating(this.venue);
});

module.exports = mongoose.model('Review', reviewSchema);
