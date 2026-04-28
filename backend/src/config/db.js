const mongoose = require('mongoose');
const dns = require('dns');

// Force IPv4 to avoid SRV resolution issues on some networks
dns.setDefaultResultOrder('ipv4first');

const connectDB = async (retries = 5) => {
    for (let i = 0; i < retries; i++) {
        try {
            const conn = await mongoose.connect(process.env.MONGODB_URI);
            console.log(`MongoDB Connected: ${conn.connection.host}`);
            return;
        } catch (error) {
            console.error(`Database Connection Error (attempt ${i + 1}/${retries}): ${error.message}`);
            if (i < retries - 1) {
                console.log('Retrying in 3 seconds...');
                await new Promise(r => setTimeout(r, 3000));
            } else {
                console.error('All DB connection attempts failed. Exiting.');
                process.exit(1);
            }
        }
    }
};

module.exports = connectDB;
