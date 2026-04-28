const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('vendor', 'admin'), upload.array('images', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'Please upload at least one image' });
        }

        const uploadPromises = req.files.map(file => {
            return new Promise((resolve, reject) => {
                // Convert buffer to base64
                const b64 = Buffer.from(file.buffer).toString('base64');
                let dataURI = "data:" + file.mimetype + ";base64," + b64;

                cloudinary.uploader.upload(dataURI, {
                    folder: 'event_booking/venues',
                    resource_type: 'auto'
                }, (error, result) => {
                    if (error) reject(error);
                    else resolve({
                        url: result.secure_url,
                        public_id: result.public_id
                    });
                });
            });
        });

        const results = await Promise.all(uploadPromises);

        res.status(200).json({
            success: true,
            images: results
        });

    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ success: false, message: 'Image upload failed' });
    }
});

module.exports = router;
