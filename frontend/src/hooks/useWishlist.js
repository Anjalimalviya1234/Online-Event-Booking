import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import useAuth from './useAuth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function useWishlist() {
    const navigate = useNavigate();
    const { user, loading: loadingUser } = useAuth();
    const [wishlistIds, setWishlistIds] = useState([]);

    // Sync wishlist from user data
    useEffect(() => {
        if (user) {
            setWishlistIds(user.wishlist?.map(v => v._id || v) || []);
        }
    }, [user?._id, user?.wishlist]);

    const isLiked = (venueId) => wishlistIds.includes(venueId);

    const toggleLike = async (venueId) => {
        if (!user) {
            toast('Please login to save venues', { icon: '❤️' });
            navigate('/login');
            return;
        }

        try {
            const { data } = await axios.put(`${API_URL}/auth/wishlist/${venueId}`, {}, { withCredentials: true });
            if (data.success) {
                toast.success(data.message);
                setWishlistIds(data.wishlist.map(v => v._id || v));
                return data;
            }
        } catch (error) {
            toast.error('Failed to update wishlist');
        }
    };

    return { user, wishlistIds, loadingUser, isLiked, toggleLike };
}

// Hook for fetching full wishlist details
export function useMyWishlist() {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, loading: loadingUser } = useAuth();

    useEffect(() => {
        if (loadingUser) return;
        if (!user) {
            setLoading(false);
            return;
        }
        const fetchWishlist = async () => {
            setLoading(true);
            try {
                const { data } = await axios.get(`${API_URL}/auth/wishlist`, { withCredentials: true });
                if (data.success) setWishlist(data.venues);
            } catch (error) {
                console.error('Failed to fetch wishlist', error);
            } finally {
                setLoading(false);
            }
        };
        fetchWishlist();
    }, [user?._id, loadingUser]);

    return { wishlist, loading, setWishlist };
}
