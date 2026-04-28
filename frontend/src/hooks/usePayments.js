import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function usePayment() {
    const [loading, setLoading] = useState(false);

    const initiatePayment = async (bookingId, userInfo, onSuccess) => {
        setLoading(true);
        try {
            // Step 1: Create Razorpay order
            const { data } = await axios.post(`${API_URL}/payments/create-order`, { bookingId }, { withCredentials: true });

            if (!data.success) {
                toast.error(data.message || 'Failed to create payment order');
                setLoading(false);
                return;
            }

            const { order, key, booking } = data;

            // Step 2: Open Razorpay checkout
            const options = {
                key: key,
                amount: order.amount,
                currency: order.currency,
                name: 'EventBook',
                description: `Advance for Booking ${booking.bookingId}`,
                order_id: order.id,
                handler: async function (response) {
                    // Step 3: Verify payment on server
                    try {
                        const verifyRes = await axios.post(`${API_URL}/payments/verify`, {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            bookingId: booking.id
                        }, { withCredentials: true });

                        if (verifyRes.data.success) {
                            toast.success('Payment successful! Booking confirmed.');
                            if (onSuccess) onSuccess(verifyRes.data.booking);
                        } else {
                            toast.error('Payment verification failed');
                        }
                    } catch (err) {
                        toast.error('Payment verification failed');
                        console.error('Verify error:', err);
                    }
                    setLoading(false);
                },
                prefill: {
                    name: userInfo?.name || '',
                    email: userInfo?.email || '',
                    contact: userInfo?.mobile || ''
                },
                theme: {
                    color: '#6C3CE1'
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                        toast('Payment cancelled', { icon: '⚠️' });
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                toast.error(`Payment failed: ${response.error.description}`);
                setLoading(false);
            });
            rzp.open();

        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to initiate payment');
            setLoading(false);
        }
    };

    return { initiatePayment, loading };
}
