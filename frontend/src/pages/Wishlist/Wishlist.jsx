import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import VenueCard from '../../components/VenueCard';
import useWishlist, { useMyWishlist } from '../../hooks/useWishlist';
import { HiHeart, HiArrowLeft, HiEmojiSad } from 'react-icons/hi';

export default function Wishlist() {
    const navigate = useNavigate();
    const { wishlist: initialVenues, loading: loadingWishlist } = useMyWishlist();
    const { user, loadingUser, isLiked, toggleLike, wishlistIds } = useWishlist();

    // Local state to manage venues (filtering out unliked ones)
    const [venues, setVenues] = useState([]);

    // Sync venues with fetched data
    useEffect(() => {
        if (initialVenues) {
            setVenues(initialVenues);
        }
    }, [initialVenues]);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!loadingUser && !user) {
            navigate('/login');
        }
    }, [loadingUser, user, navigate]);

    // Keep venues in sync when wishlistIds change (after unlike)
    useEffect(() => {
        if (venues.length > 0) {
            setVenues(prev => prev.filter(v => wishlistIds.includes(v._id || v)));
        }
    }, [wishlistIds]);

    const loading = loadingUser || loadingWishlist;

    if (loadingUser) return null;

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-bg-primary pt-24 pb-16 px-6">
                <div className="max-w-[1280px] mx-auto">
                    {/* Header */}
                    <motion.div
                        className="mb-10"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Link to="/venues" className="inline-flex items-center gap-2 text-text-muted text-sm hover:text-white transition-colors mb-4">
                            <HiArrowLeft /> Back to Venues
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-accent/15 text-accent text-xl">
                                <HiHeart />
                            </div>
                            <div>
                                <h1 className="text-3xl font-extrabold text-white">My Liked Venues</h1>
                                <p className="text-text-muted text-sm mt-0.5">
                                    {venues.length} {venues.length === 1 ? 'venue' : 'venues'} saved
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Loading Skeleton */}
                    {loading && (
                        <div className="grid grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-bg-card border border-border-default rounded-2xl overflow-hidden animate-pulse">
                                    <div className="h-[220px] bg-white/5" />
                                    <div className="p-5 space-y-3">
                                        <div className="h-4 bg-white/5 rounded w-1/3" />
                                        <div className="h-5 bg-white/5 rounded w-2/3" />
                                        <div className="h-4 bg-white/5 rounded w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && venues.length === 0 && (
                        <motion.div
                            className="flex flex-col items-center justify-center py-24"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <div className="w-24 h-24 flex items-center justify-center rounded-full bg-white/5 mb-6">
                                <HiEmojiSad className="text-5xl text-text-muted" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">No Liked Venues Yet</h2>
                            <p className="text-text-muted text-center max-w-md mb-6">
                                Start exploring venues and tap the ❤️ heart button to save your favorites here!
                            </p>
                            <Link to="/venues" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl font-semibold shadow-[0_4px_15px_rgba(108,60,225,0.4)] hover:-translate-y-0.5 transition-all">
                                Explore Venues
                            </Link>
                        </motion.div>
                    )}

                    {/* Venue Cards Grid */}
                    {!loading && venues.length > 0 && (
                        <div className="grid grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1 gap-6">
                            {venues.map((venue, i) => (
                                <VenueCard
                                    key={venue._id}
                                    venue={venue}
                                    index={i}
                                    isLiked={isLiked(venue._id)}
                                    onToggleLike={toggleLike}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
