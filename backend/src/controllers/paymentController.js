const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');
const { sendNewBookingEmailToAdmin, sendBookingConfirmationToUser } = require('../utils/emailService');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Create Razorpay order for booking advance
// @route   POST /api/payments/create-order
exports.createOrder = async (req, res) => {
    try {
        const { bookingId } = req.body;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        if (booking.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        if (booking.paymentStatus === 'advance-paid' || booking.paymentStatus === 'fully-paid') {
            return res.status(400).json({ success: false, message: 'Payment already completed' });
        }

        const amountInPaise = booking.pricing.advanceAmount * 100;

        const order = await razorpay.orders.create({
            amount: amountInPaise,
            currency: 'INR',
            receipt: booking.bookingId,
            notes: {
                bookingId: booking._id.toString(),
                eventType: booking.eventType,
                eventDate: booking.eventDate.toISOString()
            }
        });

        // Save order ID in booking
        booking.razorpayOrderId = order.id;
        await booking.save();

        res.status(200).json({
            success: true,
            order: {
                id: order.id,
                amount: order.amount,
                currency: order.currency
            },
            key: process.env.RAZORPAY_KEY_ID,
            booking: {
                id: booking._id,
                bookingId: booking.bookingId,
                advanceAmount: booking.pricing.advanceAmount
            }
        });
    } catch (error) {
        console.error('Razorpay create order error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Verify Razorpay payment signature
// @route   POST /api/payments/verify
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(sign)
            .digest('hex');

        if (expectedSign !== razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Payment verification failed' });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        booking.razorpayPaymentId = razorpay_payment_id;
        booking.razorpaySignature = razorpay_signature;
        booking.paymentStatus = 'advance-paid';
        booking.status = 'confirmed';
        await booking.save();

        const updatedBooking = await Booking.findById(bookingId)
            .populate('venue', 'name city area images address')
            .populate('user', 'name email mobile');

        // Send email notifications after successful payment
        sendNewBookingEmailToAdmin(updatedBooking);
        sendBookingConfirmationToUser(updatedBooking);

        res.status(200).json({
            success: true,
            message: 'Payment verified successfully',
            booking: updatedBooking
        });
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Refund payment for cancelled booking
// @route   POST /api/payments/refund
exports.refundPayment = async (req, res) => {
    try {
        const { bookingId } = req.body;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        if (!booking.razorpayPaymentId) {
            return res.status(400).json({ success: false, message: 'No payment found for this booking' });
        }

        if (booking.paymentStatus === 'refunded') {
            return res.status(400).json({ success: false, message: 'Payment already refunded' });
        }

        const refundAmount = booking.pricing.advanceAmount * 100;

        const refund = await razorpay.payments.refund(booking.razorpayPaymentId, {
            amount: refundAmount,
            notes: {
                bookingId: booking._id.toString(),
                reason: 'Booking cancelled by user'
            }
        });

        booking.paymentStatus = 'refunded';
        booking.razorpayRefundId = refund.id;
        await booking.save();

        res.status(200).json({
            success: true,
            message: 'Refund initiated successfully',
            refund: {
                id: refund.id,
                amount: booking.pricing.advanceAmount,
                status: refund.status
            }
        });
    } catch (error) {
        console.error('Refund error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Razorpay Webhook Handler (Server-to-Server verification)
// @route   POST /api/payments/webhook
// @access  Public (verified via HMAC signature)
exports.handleWebhook = async (req, res) => {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

        if (!webhookSecret) {
            console.error('RAZORPAY_WEBHOOK_SECRET not configured');
            return res.status(500).json({ status: 'error', message: 'Webhook secret not configured' });
        }

        // Verify webhook signature using raw body
        const signature = req.headers['x-razorpay-signature'];
        if (!signature) {
            return res.status(400).json({ status: 'error', message: 'Missing signature' });
        }

        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(req.rawBody)
            .digest('hex');

        if (expectedSignature !== signature) {
            console.error('Webhook signature mismatch');
            return res.status(400).json({ status: 'error', message: 'Invalid signature' });
        }

        // Parse event
        const event = JSON.parse(req.rawBody);
        const eventType = event.event;
        const payload = event.payload;

        console.log(`📩 Webhook received: ${eventType}`);

        switch (eventType) {
            // Payment successfully captured
            case 'payment.captured': {
                const payment = payload.payment.entity;
                const orderId = payment.order_id;

                const booking = await Booking.findOne({ razorpayOrderId: orderId });
                if (!booking) {
                    console.error(`Webhook: No booking found for order ${orderId}`);
                    return res.status(200).json({ status: 'ok', message: 'No booking found' });
                }

                // Idempotency check - skip if already processed
                if (booking.paymentStatus === 'advance-paid' || booking.paymentStatus === 'fully-paid') {
                    return res.status(200).json({ status: 'ok', message: 'Already processed' });
                }

                booking.razorpayPaymentId = payment.id;
                booking.paymentStatus = 'advance-paid';
                booking.status = 'confirmed';
                await booking.save();

                console.log(`✅ Webhook: Booking ${booking.bookingId} confirmed (payment: ${payment.id})`);
                break;
            }

            // Payment failed
            case 'payment.failed': {
                const payment = payload.payment.entity;
                const orderId = payment.order_id;

                const booking = await Booking.findOne({ razorpayOrderId: orderId });
                if (booking && booking.paymentStatus === 'unpaid') {
                    console.log(`❌ Webhook: Payment failed for booking ${booking.bookingId}`);
                }
                break;
            }

            // Refund initiated
            case 'refund.created': {
                const refund = payload.refund.entity;
                const paymentId = refund.payment_id;

                const booking = await Booking.findOne({ razorpayPaymentId: paymentId });
                if (booking && booking.paymentStatus !== 'refunded') {
                    booking.razorpayRefundId = refund.id;
                    booking.paymentStatus = 'refunded';
                    await booking.save();
                    console.log(`💰 Webhook: Refund created for booking ${booking.bookingId}`);
                }
                break;
            }

            // Refund processed (final confirmation)
            case 'refund.processed': {
                const refund = payload.refund.entity;
                const paymentId = refund.payment_id;

                const booking = await Booking.findOne({ razorpayPaymentId: paymentId });
                if (booking) {
                    booking.razorpayRefundId = refund.id;
                    booking.paymentStatus = 'refunded';
                    await booking.save();
                    console.log(`✅ Webhook: Refund processed for booking ${booking.bookingId}`);
                }
                break;
            }

            default:
                console.log(`ℹ️ Webhook: Unhandled event: ${eventType}`);
        }

        // Always return 200 to Razorpay to prevent retries
        res.status(200).json({ status: 'ok' });

    } catch (error) {
        console.error('Webhook error:', error);
        // Return 200 even on error to stop Razorpay retries for our internal errors
        res.status(200).json({ status: 'error', message: 'Internal processing error' });
    }
};
