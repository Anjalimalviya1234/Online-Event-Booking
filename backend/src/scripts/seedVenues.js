const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const Venue = require('../models/Venue');
const User = require('../models/User');

const MONGO_URI = process.env.MONGODB_URI;

const seedVenues = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Find the vendor/admin user to set as owner
        const owner = await User.findOne({ role: { $in: ['vendor', 'admin'] } });
        if (!owner) {
            console.log('❌ No vendor/admin user found. Please create one first.');
            process.exit(1);
        }
        console.log(`📌 Using owner: ${owner.name} (${owner.email})`);

        const venues = [
            {
                name: 'Royal Heritage Palace',
                description: 'A magnificent 5-star palace venue offering sprawling lawns, luxurious banquet halls with crystal chandeliers, and world-class hospitality. Our venue combines traditional Rajasthani architecture with modern amenities to create an unforgettable wedding experience. Features include a grand entrance with fountain, royal-themed decor options, premium lighting setup, and a dedicated event management team.',
                city: 'Udaipur',
                area: 'City Palace Road',
                address: '45 City Palace Road, Near Lake Pichola, Udaipur, Rajasthan - 313001',
                capacity: { min: 200, max: 2000 },
                pricePerPlate: 2500,
                startingPrice: 500000,
                venueType: 'hotel',
                occasions: ['wedding', 'reception', 'engagement', 'corporate', 'anniversary'],
                images: [
                    { url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200', isMain: true },
                    { url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200', isMain: false },
                    { url: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=1200', isMain: false },
                    { url: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=1200', isMain: false },
                ],
                amenities: {
                    parking: true, parkingCapacity: 300, ac: true, wifi: true, dj: true,
                    decorationAvailable: true, cateringAvailable: true, alcoholAllowed: true,
                    rooms: 50, changingRooms: true, stage: true, generator: true
                },
                packages: [
                    {
                        name: 'Venue Only',
                        description: 'Just the venue with basic setup and lighting',
                        price: 500000,
                        includes: ['Venue', 'Basic Lighting', 'Chairs & Tables', 'Parking', 'Security']
                    },
                    {
                        name: 'Classic Wedding',
                        description: 'Venue with full catering and basic decoration',
                        price: 1200000,
                        includes: ['Venue', 'Veg Catering (500 guests)', 'Standard Decoration', 'DJ', 'Parking', '5 Rooms']
                    },
                    {
                        name: 'Royal Grand Package',
                        description: 'Complete luxury wedding solution - our most popular package',
                        price: 2500000,
                        includes: ['Venue', 'Premium Catering (1000 guests)', 'Designer Decoration', 'DJ & Live Band', 'Photography & Videography', '20 Rooms (2 nights)', 'Valet Parking', 'Fireworks', 'Bridal Suite']
                    }
                ],
                foodMenu: [
                    {
                        category: 'Starters',
                        items: [
                            { name: 'Paneer Tikka', price: 350, isVeg: true },
                            { name: 'Hara Bhara Kabab', price: 280, isVeg: true },
                            { name: 'Chicken Seekh Kabab', price: 400, isVeg: false },
                            { name: 'Tandoori Prawns', price: 550, isVeg: false },
                            { name: 'Dahi Ke Kebab', price: 320, isVeg: true }
                        ]
                    },
                    {
                        category: 'Main Course',
                        items: [
                            { name: 'Dal Makhani', price: 400, isVeg: true },
                            { name: 'Shahi Paneer', price: 450, isVeg: true },
                            { name: 'Butter Chicken', price: 500, isVeg: false },
                            { name: 'Laal Maas', price: 600, isVeg: false },
                            { name: 'Malai Kofta', price: 420, isVeg: true },
                            { name: 'Biryani (Veg/Non-Veg)', price: 450, isVeg: true }
                        ]
                    },
                    {
                        category: 'Breads',
                        items: [
                            { name: 'Butter Naan', price: 80, isVeg: true },
                            { name: 'Garlic Naan', price: 100, isVeg: true },
                            { name: 'Laccha Paratha', price: 90, isVeg: true }
                        ]
                    },
                    {
                        category: 'Desserts',
                        items: [
                            { name: 'Gulab Jamun', price: 200, isVeg: true },
                            { name: 'Rasgulla', price: 200, isVeg: true },
                            { name: 'Kheer', price: 250, isVeg: true },
                            { name: 'Ice Cream Counter', price: 300, isVeg: true }
                        ]
                    }
                ],
                owner: owner._id,
                isApproved: true,
                isActive: true,
                featured: true,
                rating: { average: 4.7, count: 156 }
            },
            {
                name: 'Golden Oak Banquet Hall',
                description: 'A modern, chic banquet hall located in the heart of Mumbai. Perfect for corporate events, engagement parties, and birthday celebrations. Features state-of-the-art sound system, LED walls, designer interiors with gold accenting, and a flexible floor plan that can be customized for any event size. Our professional team ensures seamless event execution.',
                city: 'Mumbai',
                area: 'Andheri West',
                address: '12, Link Road, Andheri West, Mumbai, Maharashtra - 400053',
                capacity: { min: 50, max: 400 },
                pricePerPlate: 800,
                startingPrice: 75000,
                venueType: 'banquet',
                occasions: ['engagement', 'birthday', 'corporate', 'party', 'anniversary'],
                images: [
                    { url: 'https://images.unsplash.com/photo-1549488344-cbb6c34cf08b?w=1200', isMain: true },
                    { url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200', isMain: false },
                    { url: 'https://images.unsplash.com/photo-1431540015160-0400cf056e0e?w=1200', isMain: false },
                ],
                amenities: {
                    parking: true, parkingCapacity: 80, ac: true, wifi: true, dj: true,
                    decorationAvailable: true, cateringAvailable: true, alcoholAllowed: true,
                    rooms: 0, changingRooms: true, stage: true, projector: true, generator: true
                },
                packages: [
                    {
                        name: 'Birthday Bash',
                        description: 'Perfect package for birthday celebrations',
                        price: 75000,
                        includes: ['Venue (4 hours)', 'Basic Decoration', 'Sound System', 'Cake Table Setup', 'Parking']
                    },
                    {
                        name: 'Engagement Special',
                        description: 'Beautiful setup for your engagement ceremony',
                        price: 150000,
                        includes: ['Venue (6 hours)', 'Premium Decoration', 'DJ', 'Catering (100 guests)', 'Photography', 'Parking']
                    },
                    {
                        name: 'Corporate Event',
                        description: 'Professional setup for meetings and conferences',
                        price: 120000,
                        includes: ['Venue (8 hours)', 'Projector & Screen', 'Sound System', 'Tea/Coffee Service', 'Lunch', 'Wi-Fi', 'Notepads & Pens']
                    }
                ],
                foodMenu: [
                    {
                        category: 'Welcome Drinks',
                        items: [
                            { name: 'Virgin Mojito', price: 150, isVeg: true },
                            { name: 'Fresh Lime Soda', price: 100, isVeg: true },
                            { name: 'Mango Lassi', price: 120, isVeg: true }
                        ]
                    },
                    {
                        category: 'Starters',
                        items: [
                            { name: 'Veg Spring Rolls', price: 250, isVeg: true },
                            { name: 'Paneer 65', price: 300, isVeg: true },
                            { name: 'Chicken Lollipop', price: 350, isVeg: false },
                            { name: 'Fish Fingers', price: 400, isVeg: false }
                        ]
                    },
                    {
                        category: 'Main Course',
                        items: [
                            { name: 'Mix Veg Curry', price: 300, isVeg: true },
                            { name: 'Paneer Butter Masala', price: 350, isVeg: true },
                            { name: 'Chicken Curry', price: 400, isVeg: false },
                            { name: 'Jeera Rice', price: 200, isVeg: true },
                            { name: 'Roti Basket', price: 100, isVeg: true }
                        ]
                    },
                    {
                        category: 'Desserts',
                        items: [
                            { name: 'Brownie with Ice Cream', price: 250, isVeg: true },
                            { name: 'Gulab Jamun', price: 150, isVeg: true }
                        ]
                    }
                ],
                owner: owner._id,
                isApproved: true,
                isActive: true,
                featured: true,
                rating: { average: 4.3, count: 89 }
            },
            {
                name: 'Serene Valley Farmhouse',
                description: 'Escape the city chaos at Serene Valley - a lush green 3-acre farmhouse with a private swimming pool, beautiful garden area, and cozy cottages. Ideal for intimate weddings, pre-wedding shoots, and weekend celebrations. Surrounded by nature with stunning sunset views, BBQ pit, bonfire area, and outdoor games like cricket and badminton. Our farmhouse offers a unique blend of rustic charm and modern comfort.',
                city: 'Pune',
                area: 'Lonavala',
                address: 'Survey No. 78, Tungarli Village, Old Mumbai-Pune Highway, Lonavala, Maharashtra - 410401',
                capacity: { min: 30, max: 200 },
                pricePerPlate: 1200,
                startingPrice: 100000,
                venueType: 'farmhouse',
                occasions: ['wedding', 'birthday', 'party', 'anniversary', 'engagement'],
                images: [
                    { url: 'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=1200', isMain: true },
                    { url: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1200', isMain: false },
                    { url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200', isMain: false },
                ],
                amenities: {
                    parking: true, parkingCapacity: 40, ac: false, wifi: true, dj: true,
                    decorationAvailable: true, cateringAvailable: true, alcoholAllowed: true,
                    rooms: 6, changingRooms: true, stage: false, generator: true
                },
                packages: [
                    {
                        name: 'Day Outing',
                        description: 'Perfect for birthday parties & get-togethers (10am to 6pm)',
                        price: 50000,
                        includes: ['Venue (8 hours)', 'Pool Access', 'Garden Area', 'BBQ Setup', 'Basic Sound System', 'Parking']
                    },
                    {
                        name: 'Weekend Getaway',
                        description: 'Overnight stay with celebrations (Check-in 2pm, Check-out 11am)',
                        price: 120000,
                        includes: ['Venue (1 Night)', 'All 6 Rooms', 'Pool Access', 'BBQ & Bonfire', 'Breakfast', 'Games Area', 'Parking']
                    },
                    {
                        name: 'Intimate Wedding',
                        description: 'Complete wedding setup for small gatherings',
                        price: 300000,
                        includes: ['Venue (2 Nights)', 'All Rooms', 'Garden Decoration', 'Catering (150 guests)', 'DJ', 'Mandap Setup', 'Pool Party Setup', 'Bonfire Night', 'Breakfast & Dinner']
                    }
                ],
                foodMenu: [
                    {
                        category: 'BBQ & Starters',
                        items: [
                            { name: 'Grilled Paneer Skewers', price: 300, isVeg: true },
                            { name: 'Corn on the Cob', price: 150, isVeg: true },
                            { name: 'BBQ Chicken Wings', price: 400, isVeg: false },
                            { name: 'Grilled Fish', price: 500, isVeg: false }
                        ]
                    },
                    {
                        category: 'Main Course',
                        items: [
                            { name: 'Farm Fresh Dal Fry', price: 250, isVeg: true },
                            { name: 'Kadai Paneer', price: 350, isVeg: true },
                            { name: 'Chicken Biryani', price: 400, isVeg: false },
                            { name: 'Steamed Rice', price: 150, isVeg: true },
                            { name: 'Tandoori Roti', price: 60, isVeg: true }
                        ]
                    },
                    {
                        category: 'Breakfast',
                        items: [
                            { name: 'Poha', price: 100, isVeg: true },
                            { name: 'Aloo Paratha with Curd', price: 150, isVeg: true },
                            { name: 'Masala Omelette', price: 120, isVeg: false },
                            { name: 'Tea / Coffee', price: 50, isVeg: true }
                        ]
                    }
                ],
                owner: owner._id,
                isApproved: true,
                isActive: true,
                featured: false,
                rating: { average: 4.5, count: 67 }
            },
            {
                name: 'Sunset Beach Resort & Lawns',
                description: 'A stunning beachside resort in Goa offering breathtaking sunset views and tropical vibes. Our resort features a sprawling beachfront lawn, a luxurious indoor banquet hall, infinity pool, and premium cottages. Perfect for destination weddings, beach ceremonies, cocktail parties, and corporate retreats. The professional event team, along with in-house florists and decorators, ensures a magical experience right by the Arabian Sea.',
                city: 'Goa',
                area: 'Calangute',
                address: 'Beach Road No. 7, Near Calangute Beach, North Goa - 403516',
                capacity: { min: 100, max: 800 },
                pricePerPlate: 1800,
                startingPrice: 300000,
                venueType: 'resort',
                occasions: ['wedding', 'reception', 'party', 'corporate', 'anniversary', 'engagement'],
                images: [
                    { url: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=1200', isMain: true },
                    { url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200', isMain: false },
                    { url: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=1200', isMain: false },
                    { url: 'https://images.unsplash.com/photo-1549488344-cbb6c34cf08b?w=1200', isMain: false },
                ],
                amenities: {
                    parking: true, parkingCapacity: 150, ac: true, wifi: true, dj: true,
                    decorationAvailable: true, cateringAvailable: true, alcoholAllowed: true,
                    rooms: 25, changingRooms: true, stage: true, generator: true
                },
                packages: [
                    {
                        name: 'Beach Party',
                        description: 'Fun beach party setup with DJ and drinks',
                        price: 200000,
                        includes: ['Beach Lawn', 'DJ Setup', 'Basic Decoration', 'Bar Counter', 'Bonfire', 'Parking']
                    },
                    {
                        name: 'Destination Wedding',
                        description: 'Complete beach wedding package for 2 days',
                        price: 800000,
                        includes: ['Beach Lawn + Indoor Hall', 'Premium Beach Decoration', 'Mandap by the Sea', 'Catering (300 guests)', 'DJ & Live Band', '15 Rooms (2 Nights)', 'Photography', 'Mehendi Setup', 'Cocktail Night']
                    },
                    {
                        name: 'Grand Celebration',
                        description: 'The ultimate Goa wedding experience - 3 days of celebrations',
                        price: 1500000,
                        includes: ['All Venues (3 Days)', 'Designer Decoration', 'Premium Catering (500 guests)', 'DJ + Live Band + Ghazal Night', 'All 25 Rooms (3 Nights)', 'Professional Photography & Videography', 'Drone Coverage', 'Fireworks', 'Poolside Cocktail', 'Airport Transfers', 'Welcome Hampers']
                    }
                ],
                foodMenu: [
                    {
                        category: 'Goan Starters',
                        items: [
                            { name: 'Prawn Koliwada', price: 500, isVeg: false },
                            { name: 'Goan Fish Cutlet', price: 450, isVeg: false },
                            { name: 'Stuffed Mushrooms', price: 350, isVeg: true },
                            { name: 'Crispy Calamari', price: 550, isVeg: false },
                            { name: 'Cheese Chilli Toast', price: 300, isVeg: true }
                        ]
                    },
                    {
                        category: 'Main Course - Goan Specials',
                        items: [
                            { name: 'Goan Fish Curry', price: 600, isVeg: false },
                            { name: 'Prawn Balchao', price: 650, isVeg: false },
                            { name: 'Chicken Xacuti', price: 550, isVeg: false },
                            { name: 'Mushroom Xacuti (Veg)', price: 400, isVeg: true },
                            { name: 'Goan Veg Curry', price: 350, isVeg: true },
                            { name: 'Steamed Rice', price: 150, isVeg: true },
                            { name: 'Goan Bread Basket', price: 120, isVeg: true }
                        ]
                    },
                    {
                        category: 'Continental',
                        items: [
                            { name: 'Grilled Chicken Steak', price: 600, isVeg: false },
                            { name: 'Pasta Alfredo', price: 400, isVeg: true },
                            { name: 'Caesar Salad', price: 350, isVeg: true },
                            { name: 'Garlic Bread', price: 200, isVeg: true }
                        ]
                    },
                    {
                        category: 'Desserts',
                        items: [
                            { name: 'Bebinca (Goan Layered Cake)', price: 300, isVeg: true },
                            { name: 'Coconut Flan', price: 250, isVeg: true },
                            { name: 'Chocolate Lava Cake', price: 350, isVeg: true },
                            { name: 'Fresh Fruit Platter', price: 200, isVeg: true }
                        ]
                    }
                ],
                owner: owner._id,
                isApproved: true,
                isActive: true,
                featured: true,
                rating: { average: 4.8, count: 203 }
            }
        ];

        // Clear existing seeded venues (optional - only removes venues with same names)
        const venueNames = venues.map(v => v.name);
        await Venue.deleteMany({ name: { $in: venueNames } });
        console.log('🗑️  Cleaned up old seeded venues (if any)');

        // Insert venues one by one using save() so pre-save slug hook triggers
        const created = [];
        for (const venueData of venues) {
            const venue = new Venue(venueData);
            await venue.save();
            created.push(venue);
        }

        console.log(`\n✅ Successfully seeded ${created.length} venues:\n`);
        created.forEach((v, i) => {
            console.log(`  ${i + 1}. ${v.name} (slug: ${v.slug})`);
            console.log(`     📍 ${v.area}, ${v.city}`);
            console.log(`     💰 Starting ₹${v.startingPrice.toLocaleString('en-IN')}`);
            console.log(`     📦 ${v.packages.length} Packages | 🍽️  ${v.foodMenu.length} Menu Categories`);
            console.log(`     ✅ Approved: ${v.isApproved} | ⭐ Featured: ${v.featured}\n`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding venues:', error.message);
        process.exit(1);
    }
};

seedVenues();
