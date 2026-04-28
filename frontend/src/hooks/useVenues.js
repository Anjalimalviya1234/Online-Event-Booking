import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Fetch venues list with filters, sorting, pagination
export function useVenues(filters = {}, sort = 'popular', searchQuery = '', page = 1, limit = 12, extraParams = {}) {
    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        const fetchVenues = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (filters.city) params.append('city', filters.city);
                if (filters.venueType) params.append('venueType', filters.venueType);
                if (filters.occasion) params.append('occasion', filters.occasion);
                if (filters.minPrice) params.append('minPrice', filters.minPrice);
                if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
                if (filters.minCapacity) params.append('minCapacity', filters.minCapacity);
                if (filters.parking) params.append('parking', 'true');
                if (filters.ac) params.append('ac', 'true');
                if (filters.catering) params.append('catering', 'true');
                if (filters.decoration) params.append('decoration', 'true');
                if (filters.date) params.append('date', filters.date);
                if (searchQuery) params.append('search', searchQuery);
                if (sort) params.append('sort', sort);
                params.append('page', page);
                params.append('limit', limit);

                // Extra params (e.g., featured=true)
                Object.entries(extraParams).forEach(([key, val]) => {
                    if (val) params.append(key, val);
                });

                const { data } = await axios.get(`${API_URL}/venues?${params.toString()}`);
                if (data.success) {
                    setVenues(data.venues);
                    setTotalPages(data.totalPages || 1);
                    setTotalCount(data.total || 0);
                }
            } catch (error) {
                console.error('Failed to fetch venues:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchVenues();
    }, [JSON.stringify(filters), sort, searchQuery, page, limit, JSON.stringify(extraParams)]);

    return { venues, loading, totalPages, totalCount };
}

// Fetch featured venues (with fallback to top-rated)
export function useFeaturedVenues() {
    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/venues/featured`);
                if (data.success && data.venues.length > 0) {
                    setVenues(data.venues);
                } else {
                    const { data: allData } = await axios.get(`${API_URL}/venues?limit=6&sort=rating`);
                    if (allData.success) setVenues(allData.venues);
                }
            } catch (error) {
                console.error('Failed to fetch featured venues:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchFeatured();
    }, []);

    return { venues, loading };
}

// Fetch single venue by ID
export function useVenueDetail(id) {
    const [venue, setVenue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id) return;
        const fetchVenue = async () => {
            setLoading(true);
            try {
                const { data } = await axios.get(`${API_URL}/venues/${id}`);
                if (data.success) {
                    setVenue(data.venue);
                } else {
                    setError('Venue not found');
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load venue');
            } finally {
                setLoading(false);
            }
        };
        fetchVenue();
    }, [id]);

    return { venue, loading, error };
}

// Fetch cities list
export function useCities() {
    const [cities, setCities] = useState([]);

    useEffect(() => {
        const fetchCities = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/venues/cities`);
                if (data.success) setCities(data.cities);
            } catch (error) {
                console.error('Failed to fetch cities:', error);
            }
        };
        fetchCities();
    }, []);

    return cities;
}

// Fetch reviews for a venue
export function useReviews(venueId) {
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        if (!venueId) return;
        const fetchReviews = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/reviews/venue/${venueId}`);
                if (data.success) setReviews(data.reviews);
            } catch (err) {
                console.error('Failed to fetch reviews:', err);
            }
        };
        fetchReviews();
    }, [venueId]);

    return reviews;
}

// Fetch vendor's own venues
export function useMyVenues() {
    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchVenues = useCallback(async () => {
        try {
            const { data } = await axios.get(`${API_URL}/venues/my-venues`, { withCredentials: true });
            if (data.success) setVenues(data.venues);
        } catch (error) {
            console.error('Failed to fetch my venues:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchVenues();
    }, [fetchVenues]);

    return { venues, loading, refetch: fetchVenues };
}

// Hook for venue actions (create, update, upload)
export function useVenueActions() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const createVenue = async (payload) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axios.post(`${API_URL}/venues`, payload, { withCredentials: true });
            if (data.success) {
                return data;
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create venue');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const uploadImages = async (files) => {
        const formData = new FormData();
        Array.from(files).forEach(file => formData.append('images', file));

        try {
            const { data } = await axios.post(`${API_URL}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });
            return data;
        } catch (err) {
            throw err;
        }
    };

    const updateVenue = async (id, payload) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axios.put(`${API_URL}/venues/${id}`, payload, { withCredentials: true });
            if (data.success) {
                return data;
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update venue');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { createVenue, updateVenue, uploadImages, loading, error };
}

// Fetch vendor's reviews across all their venues
export function useVendorReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReviews = useCallback(async () => {
        try {
            const { data } = await axios.get(`${API_URL}/reviews/vendor`, { withCredentials: true });
            if (data.success) setReviews(data.reviews);
        } catch (error) {
            console.error('Failed to fetch vendor reviews:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    return { reviews, loading, refetch: fetchReviews };
}

// Submit a review for a venue
export function useCreateReview() {
    const [loading, setLoading] = useState(false);

    const submitReview = async (reviewData) => {
        setLoading(true);
        try {
            const { data } = await axios.post(`${API_URL}/reviews`, reviewData, { withCredentials: true });
            if (data.success) return data;
        } catch (err) {
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { submitReview, loading };
}
