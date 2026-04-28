import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Fetch admin stats
export function useAdminStats() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = useCallback(async () => {
        try {
            const { data } = await axios.get(`${API_URL}/admin/stats`, { withCredentials: true });
            if (data.success) setStats(data.stats);
        } catch (error) {
            console.error('Failed to fetch admin stats:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return { stats, loading, refetch: fetchStats };
}

// Fetch admin venues (can filter by status e.g., 'pending')
export function useAdminVenues(status = '') {
    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchVenues = useCallback(async () => {
        setLoading(true);
        try {
            const url = status ? `${API_URL}/admin/venues?status=${status}` : `${API_URL}/admin/venues`;
            const { data } = await axios.get(url, { withCredentials: true });
            if (data.success) setVenues(data.venues);
        } catch (error) {
            console.error('Failed to fetch admin venues:', error);
        } finally {
            setLoading(false);
        }
    }, [status]);

    useEffect(() => {
        fetchVenues();
    }, [fetchVenues]);

    const updateVenueStatus = async (id, isApproved) => {
        try {
            const { data } = await axios.put(`${API_URL}/admin/venues/${id}/status`, { isApproved }, { withCredentials: true });
            if (data.success) {
                toast.success(isApproved ? 'Venue Approved' : 'Venue Rejected');
                setVenues(prev => status === 'pending'
                    ? prev.filter(v => v._id !== id)
                    : prev.map(v => v._id === id ? { ...v, isApproved } : v)
                );
                return data;
            }
        } catch (error) {
            toast.error('Failed to update venue status');
            throw error;
        }
    };

    const toggleVenueActive = async (id) => {
        try {
            const { data } = await axios.put(`${API_URL}/admin/venues/${id}/toggle-active`, {}, { withCredentials: true });
            if (data.success) {
                toast.success(data.message);
                setVenues(prev => prev.map(v => v._id === id ? { ...v, isActive: data.venue.isActive } : v));
                return data;
            }
        } catch (error) {
            toast.error('Failed to update venue');
            throw error;
        }
    };

    const toggleVenueFeatured = async (id) => {
        try {
            const { data } = await axios.put(`${API_URL}/admin/venues/${id}/toggle-featured`, {}, { withCredentials: true });
            if (data.success) {
                toast.success(data.message);
                setVenues(prev => prev.map(v => v._id === id ? { ...v, featured: data.venue.featured } : v));
                return data;
            }
        } catch (error) {
            toast.error('Failed to update venue');
            throw error;
        }
    };

    return { venues, loading, refetch: fetchVenues, updateVenueStatus, toggleVenueActive, toggleVenueFeatured };
}

// Fetch admin users
export function useAdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = useCallback(async () => {
        try {
            const { data } = await axios.get(`${API_URL}/admin/users`, { withCredentials: true });
            if (data.success) setUsers(data.users);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return { users, loading, refetch: fetchUsers };
}

// Fetch single venue detail for admin
export function useAdminVenueDetail(id) {
    const [venue, setVenue] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!id) {
            setVenue(null);
            return;
        }
        const fetchVenue = async () => {
            setLoading(true);
            try {
                const { data } = await axios.get(`${API_URL}/admin/venues/${id}`, { withCredentials: true });
                if (data.success) setVenue(data.venue);
            } catch (error) {
                toast.error('Failed to load venue details');
            } finally {
                setLoading(false);
            }
        };
        fetchVenue();
    }, [id]);

    return { venue, setVenue, loading };
}

// Fetch all bookings (admin)
export function useAdminBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBookings = useCallback(async () => {
        try {
            const { data } = await axios.get(`${API_URL}/admin/bookings`, { withCredentials: true });
            if (data.success) setBookings(data.bookings);
        } catch (error) {
            console.error('Failed to fetch admin bookings:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const updateBookingStatus = async (id, status) => {
        try {
            const { data } = await axios.put(`${API_URL}/admin/bookings/${id}/status`, { status }, { withCredentials: true });
            if (data.success) {
                toast.success(`Booking ${status}`);
                setBookings(prev => prev.map(b => b._id === id ? { ...b, status, paymentStatus: data.booking.paymentStatus } : b));
                return data;
            }
        } catch (error) {
            toast.error('Failed to update booking');
        }
    };

    return { bookings, loading, refetch: fetchBookings, updateBookingStatus };
}
