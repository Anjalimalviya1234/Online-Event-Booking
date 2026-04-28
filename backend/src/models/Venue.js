const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Venue name is required'],
        trim: true,
        maxlength: 100
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        maxlength: 2000
    },
    city: {
        type: String,
        required: [true, 'City is required'],
        trim: true
    },
    area: {
        type: String,
        required: [true, 'Area is required'],
        trim: true
    },
    address: {
        type: String,
        required: [true, 'Address is required']
    },
    latitude: { type: Number },
    longitude: { type: Number },
    capacity: {
        min: { type: Number, required: true },
        max: { type: Number, required: true }
    },
    pricePerPlate: { type: Number },
    startingPrice: {
        type: Number,
        required: [true, 'Starting price is required']
    },
    venueType: {
        type: String,
        enum: ['banquet', 'lawn', 'resort', 'hotel', 'farmhouse', 'community-hall', 'marriage-garden'],
        required: true
    },
    occasions: [{
        type: String,
        enum: ['wedding', 'reception', 'engagement', 'birthday', 'corporate', 'conference', 'party', 'anniversary', 'other']
    }],
    images: [{
        url: String,
        public_id: String,
        isMain: { type: Boolean, default: false }
    }],
    amenities: {
        parking: { type: Boolean, default: false },
        parkingCapacity: { type: Number, default: 0 },
        ac: { type: Boolean, default: false },
        wifi: { type: Boolean, default: false },
        dj: { type: Boolean, default: false },
        decorationAvailable: { type: Boolean, default: false },
        cateringAvailable: { type: Boolean, default: false },
        alcoholAllowed: { type: Boolean, default: false },
        outsideCatering: { type: Boolean, default: false },
        rooms: { type: Number, default: 0 },
        changingRooms: { type: Boolean, default: false },
        stage: { type: Boolean, default: false },
        projector: { type: Boolean, default: false },
        generator: { type: Boolean, default: false }
    },
    packages: [{
        name: String,
        description: String,
        price: Number,
        includes: [String]
    }],
    foodMenu: [{
        category: String,
        items: [{
            name: String,
            price: Number,
            isVeg: Boolean
        }]
    }],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        average: { type: Number, default: 0, min: 0, max: 5 },
        count: { type: Number, default: 0 }
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    featured: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

venueSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'venue'
});

venueSchema.pre('save', function (next) {
    this.slug = this.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-');
    // Normalize city name: trim and capitalize first letter of each word
    if (this.city) {
        this.city = this.city.trim().replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    }
    next();
});

venueSchema.index({ city: 1, startingPrice: 1 });
venueSchema.index({ 'rating.average': -1 });
venueSchema.index({ venueType: 1 });

module.exports = mongoose.model('Venue', venueSchema);
