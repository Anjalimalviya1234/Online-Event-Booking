require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Venue = require('./models/Venue');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Venue.deleteMany({});

        // Create admin
        const admin = await User.create({
            name: 'Admin',
            email: 'admin@eventbook.com',
            password: 'admin123',
            role: 'admin',
            mobile: '9999999999'
        });

        // Create vendor
        const vendor = await User.create({
            name: 'Rajesh Sharma',
            email: 'vendor@eventbook.com',
            password: 'vendor123',
            role: 'vendor',
            mobile: '9876543210'
        });

        // Create test user
        const user = await User.create({
            name: 'Priya Singh',
            email: 'user@eventbook.com',
            password: 'user123',
            role: 'user',
            mobile: '9123456789'
        });

        const venues = [
            {
                name: 'Royal Palace Marriage Garden',
                description: 'A grand marriage garden with lush green lawns, elegant indoor hall, and breathtaking decor options. Perfect for large-scale weddings and receptions with capacity for up to 2000 guests.',
                city: 'Bhopal',
                area: 'MP Nagar',
                address: '123, MP Nagar Zone-II, Bhopal, MP 462011',
                latitude: 23.2332,
                longitude: 77.4345,
                capacity: { min: 200, max: 2000 },
                startingPrice: 150000,
                pricePerPlate: 800,
                venueType: 'marriage-garden',
                occasions: ['wedding', 'reception', 'engagement'],
                images: [
                    { url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800', isMain: true },
                    { url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800', isMain: false },
                    { url: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800', isMain: false }
                ],
                amenities: { parking: true, parkingCapacity: 200, ac: true, wifi: true, dj: true, decorationAvailable: true, cateringAvailable: true, rooms: 10, changingRooms: true, stage: true, generator: true },
                packages: [
                    { name: 'Venue Only', description: 'Just the venue with basic setup', price: 150000, includes: ['Venue', 'Basic Lighting', 'Chairs & Tables', 'Parking'] },
                    { name: 'Venue + Food', description: 'Venue with full catering service', price: 350000, includes: ['Venue', 'Catering (Veg)', 'Basic Decoration', 'Parking', 'DJ'] },
                    { name: 'Premium Package', description: 'Complete wedding solution', price: 600000, includes: ['Venue', 'Premium Catering', 'Full Decoration', 'DJ', 'Photography', 'Rooms', 'Valet Parking'] }
                ],
                owner: vendor._id,
                rating: { average: 4.5, count: 128 },
                isApproved: true,
                featured: true
            },
            {
                name: 'Lakeside Resort & Convention',
                description: 'A stunning lakeside resort offering panoramic views and world-class facilities. Ideal for destination weddings, corporate retreats, and grand celebrations.',
                city: 'Bhopal',
                area: 'Shamla Hills',
                address: '45, Shamla Hills, Near Upper Lake, Bhopal, MP 462013',
                latitude: 23.2465,
                longitude: 77.4018,
                capacity: { min: 100, max: 1500 },
                startingPrice: 200000,
                pricePerPlate: 1200,
                venueType: 'resort',
                occasions: ['wedding', 'reception', 'corporate', 'party'],
                images: [
                    { url: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800', isMain: true },
                    { url: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800', isMain: false },
                    { url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', isMain: false }
                ],
                amenities: { parking: true, parkingCapacity: 150, ac: true, wifi: true, dj: true, decorationAvailable: true, cateringAvailable: true, alcoholAllowed: true, rooms: 50, changingRooms: true, stage: true, projector: true, generator: true },
                packages: [
                    { name: 'Day Event', description: 'Perfect for day ceremonies', price: 200000, includes: ['Venue', 'Lawn Access', 'Basic Decoration', 'Parking'] },
                    { name: 'Full Day Package', description: 'Complete day and night event', price: 500000, includes: ['Venue', 'Catering', 'Decoration', 'DJ', 'Rooms (5)', 'Parking'] },
                    { name: 'Destination Wedding', description: 'Multi-day wedding package', price: 1500000, includes: ['3-Day Venue', 'All Meals', 'Premium Decoration', 'DJ+Band', '20 Rooms', 'Photography', 'Events Planning'] }
                ],
                owner: vendor._id,
                rating: { average: 4.8, count: 89 },
                isApproved: true,
                featured: true
            },
            {
                name: 'Grand Imperial Banquet',
                description: 'An exquisite banquet hall with crystal chandeliers, marble flooring, and state-of-the-art sound and lighting. The most premium indoor venue in Indore.',
                city: 'Indore',
                area: 'Vijay Nagar',
                address: '78, Vijay Nagar Square, Indore, MP 452010',
                latitude: 22.7537,
                longitude: 75.8938,
                capacity: { min: 100, max: 800 },
                startingPrice: 100000,
                pricePerPlate: 900,
                venueType: 'banquet',
                occasions: ['wedding', 'reception', 'engagement', 'birthday', 'corporate'],
                images: [
                    { url: 'https://images.unsplash.com/photo-1549488344-cbb6c34cf08b?w=800', isMain: true },
                    { url: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800', isMain: false },
                    { url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', isMain: false }
                ],
                amenities: { parking: true, parkingCapacity: 100, ac: true, wifi: true, dj: true, decorationAvailable: true, cateringAvailable: true, rooms: 5, stage: true, projector: true, generator: true },
                packages: [
                    { name: 'Basic', description: 'Hall booking', price: 100000, includes: ['Hall', 'AC', 'Basic Lighting', 'Parking'] },
                    { name: 'Standard', description: 'Hall with food', price: 250000, includes: ['Hall', 'Catering (500 guests)', 'Decoration', 'DJ', 'Parking'] },
                    { name: 'Luxury', description: 'All-inclusive package', price: 450000, includes: ['Hall', 'Premium Catering', 'Floral Decoration', 'DJ+Band', 'Photography', 'Valet'] }
                ],
                owner: vendor._id,
                rating: { average: 4.3, count: 215 },
                isApproved: true,
                featured: true
            },
            {
                name: 'Green Valley Farmhouse',
                description: 'A beautiful farmhouse surrounded by nature with open lawns, swimming pool, and modern amenities. Perfect for intimate weddings and birthday parties.',
                city: 'Indore',
                area: 'Rau',
                address: '22, Rau-Pithampur Road, Indore, MP 453331',
                latitude: 22.6567,
                longitude: 75.8672,
                capacity: { min: 50, max: 500 },
                startingPrice: 50000,
                pricePerPlate: 600,
                venueType: 'farmhouse',
                occasions: ['wedding', 'birthday', 'party', 'anniversary'],
                images: [
                    { url: 'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=800', isMain: true },
                    { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', isMain: false },
                    { url: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', isMain: false }
                ],
                amenities: { parking: true, parkingCapacity: 50, ac: false, wifi: true, dj: true, decorationAvailable: true, cateringAvailable: true, outsideCatering: true, rooms: 3, changingRooms: true, stage: true, generator: true },
                packages: [
                    { name: 'Day Picnic', description: 'Day event package', price: 50000, includes: ['Farmhouse', 'Lawn', 'Pool', 'Parking'] },
                    { name: 'Event Package', description: 'Full event setup', price: 120000, includes: ['Farmhouse', 'Lawn', 'Catering', 'DJ', 'Basic Decoration'] },
                    { name: 'Weekend Package', description: '2-day event with stay', price: 200000, includes: ['2-Day Farmhouse', 'All Meals', 'Decoration', 'DJ', 'Rooms', 'Pool', 'Bonfire'] }
                ],
                owner: vendor._id,
                rating: { average: 4.1, count: 67 },
                isApproved: true,
                featured: false
            },
            {
                name: 'Maharaja Convention Center',
                description: 'The largest convention center in Jabalpur with multiple halls, grand lobby, and modern audio-visual facilities. Suitable for weddings and large corporate events.',
                city: 'Jabalpur',
                area: 'Wright Town',
                address: '101, Wright Town, Jabalpur, MP 482002',
                latitude: 23.1687,
                longitude: 79.9353,
                capacity: { min: 300, max: 3000 },
                startingPrice: 180000,
                pricePerPlate: 700,
                venueType: 'community-hall',
                occasions: ['wedding', 'reception', 'conference', 'corporate'],
                images: [
                    { url: 'https://images.unsplash.com/photo-1431540015160-0400cf056e0e?w=800', isMain: true },
                    { url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800', isMain: false },
                    { url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800', isMain: false }
                ],
                amenities: { parking: true, parkingCapacity: 300, ac: true, wifi: true, dj: true, decorationAvailable: true, cateringAvailable: true, rooms: 8, stage: true, projector: true, generator: true },
                packages: [
                    { name: 'Hall A', description: 'Small hall for 300-500 guests', price: 80000, includes: ['Hall A', 'AC', 'Furniture', 'Parking'] },
                    { name: 'Hall B', description: 'Grand hall for 500-1500 guests', price: 180000, includes: ['Grand Hall', 'AC', 'Stage', 'Lighting', 'Parking'] },
                    { name: 'Full Venue', description: 'All halls + lawn', price: 350000, includes: ['All Halls', 'Lawn', 'Full Catering', 'Decoration', 'DJ', 'Valet'] }
                ],
                owner: vendor._id,
                rating: { average: 4.0, count: 156 },
                isApproved: true,
                featured: true
            },
            {
                name: 'Sunset Garden Resort',
                description: 'A charming garden resort with beautiful sunset views, water fountain, and themed decor options. Ideal for engagement ceremonies and birthday celebrations.',
                city: 'Gwalior',
                area: 'City Center',
                address: '56, City Center Road, Gwalior, MP 474001',
                latitude: 26.2183,
                longitude: 78.1828,
                capacity: { min: 100, max: 700 },
                startingPrice: 75000,
                pricePerPlate: 550,
                venueType: 'lawn',
                occasions: ['wedding', 'engagement', 'birthday', 'party', 'anniversary'],
                images: [
                    { url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800', isMain: true },
                    { url: 'https://images.unsplash.com/photo-1529543544882-ea51407e6571?w=800', isMain: false },
                    { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', isMain: false }
                ],
                amenities: { parking: true, parkingCapacity: 80, ac: false, wifi: true, dj: true, decorationAvailable: true, cateringAvailable: true, outsideCatering: true, changingRooms: true, stage: true, generator: true },
                packages: [
                    { name: 'Garden Only', description: 'Open lawn event', price: 75000, includes: ['Lawn', 'Basic Setup', 'Parking'] },
                    { name: 'Garden + Food', description: 'Lawn with catering', price: 180000, includes: ['Lawn', 'Catering (400 guests)', 'Decoration', 'DJ'] },
                    { name: 'Grand Event', description: 'Premium outdoor event', price: 300000, includes: ['Full Garden', 'Premium Catering', 'Theme Decoration', 'DJ+Band', 'Photography'] }
                ],
                owner: vendor._id,
                rating: { average: 4.4, count: 93 },
                isApproved: true,
                featured: false
            },
            {
                name: 'Heritage Hotel & Banquets',
                description: 'An elegant heritage-style hotel with classic architecture, beautiful banquet halls, and modern amenities. The perfect blend of tradition and luxury.',
                city: 'Ujjain',
                area: 'Freeganj',
                address: '33, Freeganj Road, Ujjain, MP 456001',
                latitude: 23.1793,
                longitude: 75.7849,
                capacity: { min: 50, max: 600 },
                startingPrice: 80000,
                pricePerPlate: 650,
                venueType: 'hotel',
                occasions: ['wedding', 'reception', 'engagement', 'corporate', 'conference'],
                images: [
                    { url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', isMain: true },
                    { url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', isMain: false },
                    { url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', isMain: false }
                ],
                amenities: { parking: true, parkingCapacity: 60, ac: true, wifi: true, dj: true, decorationAvailable: true, cateringAvailable: true, alcoholAllowed: true, rooms: 30, changingRooms: true, stage: true, projector: true, generator: true },
                packages: [
                    { name: 'Banquet Hall', description: 'Indoor banquet', price: 80000, includes: ['Hall', 'AC', 'Furniture', 'Parking'] },
                    { name: 'Wedding Package', description: 'Complete wedding setup', price: 250000, includes: ['Hall', 'Catering', 'Decoration', 'DJ', '5 Rooms', 'Parking'] },
                    { name: 'Royal Package', description: 'Premium heritage experience', price: 500000, includes: ['Full Venue', 'Royal Catering', 'Grand Decoration', 'Band+DJ', '10 Rooms', 'Photography', 'Gift Hampers'] }
                ],
                owner: vendor._id,
                rating: { average: 4.6, count: 74 },
                isApproved: true,
                featured: true
            },
            {
                name: 'Paradise Garden & Banquet',
                description: 'A modern venue featuring both indoor and outdoor spaces with beautiful landscaping, LED lighting, and premium sound system. Budget-friendly yet elegant.',
                city: 'Bhopal',
                area: 'Kolar Road',
                address: '89, Kolar Road, Bhopal, MP 462042',
                latitude: 23.1750,
                longitude: 77.4700,
                capacity: { min: 100, max: 1000 },
                startingPrice: 60000,
                pricePerPlate: 500,
                venueType: 'marriage-garden',
                occasions: ['wedding', 'reception', 'engagement', 'birthday'],
                images: [
                    { url: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800', isMain: true },
                    { url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800', isMain: false },
                    { url: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800', isMain: false }
                ],
                amenities: { parking: true, parkingCapacity: 100, ac: true, wifi: true, dj: true, decorationAvailable: true, cateringAvailable: true, outsideCatering: true, rooms: 4, changingRooms: true, stage: true, generator: true },
                packages: [
                    { name: 'Budget', description: 'Affordable wedding', price: 60000, includes: ['Venue', 'Basic Setup', 'Parking'] },
                    { name: 'Value', description: 'Best value for money', price: 150000, includes: ['Venue', 'Catering (500 guests)', 'Basic Decoration', 'DJ'] },
                    { name: 'Premium', description: 'Premium celebration', price: 300000, includes: ['Venue', 'Premium Catering', 'Full Decoration', 'DJ+Band', 'Photography', 'Rooms'] }
                ],
                owner: vendor._id,
                rating: { average: 4.2, count: 342 },
                isApproved: true,
                featured: false
            }
        ];

        await Venue.insertMany(venues);
        console.log(`✅ Seeded ${venues.length} venues`);
        console.log('✅ Created admin: admin@eventbook.com / admin123');
        console.log('✅ Created vendor: vendor@eventbook.com / vendor123');
        console.log('✅ Created user: user@eventbook.com / user123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
};

seedData();
