import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Fetch user's bookings
export function useMyBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBookings = useCallback(async () => {
        try {
            const { data } = await axios.get(`${API_URL}/bookings/my`, { withCredentials: true });
            if (data.success) setBookings(data.bookings);
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const cancelBooking = async (id, reason = '') => {
        try {
            const { data } = await axios.put(`${API_URL}/bookings/${id}/cancel`, { reason }, { withCredentials: true });
            if (data.success) {
                toast.success('Booking cancelled successfully');
                setBookings(prev => prev.map(b => b._id === id ? { ...b, status: 'cancelled' } : b));
                return data;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to cancel booking');
        }
    };

    return { bookings, loading, refetch: fetchBookings, cancelBooking };
}

// Fetch vendor's bookings + update status
export function useVendorBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBookings = useCallback(async () => {
        try {
            const { data } = await axios.get(`${API_URL}/bookings/vendor`, { withCredentials: true });
            if (data.success) setBookings(data.bookings);
        } catch (error) {
            console.error('Failed to fetch vendor bookings:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const updateStatus = async (id, status, reason = '') => {
        try {
            const { data } = await axios.put(`${API_URL}/bookings/${id}/status`, { status, reason }, { withCredentials: true });
            if (data.success) {
                toast.success(`Booking ${status}`);
                setBookings(prev => prev.map(b => b._id === id ? { ...b, status } : b));
                return data;
            }
        } catch (error) {
            toast.error('Failed to update booking');
        }
    };

    return { bookings, loading, updateStatus, refetch: fetchBookings };
}

// Create a new booking
export function useCreateBooking() {
    const [loading, setLoading] = useState(false);

    const createBooking = async (bookingData) => {
        setLoading(true);
        try {
            const { data } = await axios.post(`${API_URL}/bookings`, bookingData, { withCredentials: true });
            if (data.success) {
                toast.success('Booking created successfully!');
                return data;
            }
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to create booking';
            toast.error(msg);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return { createBooking, loading };
}

// Check venue availability for a specific date
export function useCheckAvailability() {
    const [checking, setChecking] = useState(false);
    const [availability, setAvailability] = useState(null);

    const checkAvailability = async (venueId, date) => {
        setChecking(true);
        setAvailability(null);
        try {
            const { data } = await axios.get(`${API_URL}/bookings/check-availability`, {
                params: { venueId, date }
            });
            if (data.success) {
                setAvailability(data.isAvailable);
                return data.isAvailable;
            }
        } catch (error) {
            toast.error('Failed to check availability');
            return null;
        } finally {
            setChecking(false);
        }
    };

    const resetAvailability = () => setAvailability(null);

    return { checkAvailability, checking, availability, resetAvailability };
}
