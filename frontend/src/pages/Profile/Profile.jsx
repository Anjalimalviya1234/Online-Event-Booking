import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ProfileInfo from './components/ProfileInfo';
import MyBookings from './components/MyBookings';
import PaymentHistory from './components/PaymentHistory';
import useAuth from '../../hooks/useAuth';
import useWishlistDefault, { useMyWishlist } from '../../hooks/useWishlist';
import { HiUser, HiCalendar, HiHeart, HiCog, HiLogout, HiArrowLeft, HiShieldCheck, HiStar, HiLocationMarker, HiTrash, HiCurrencyRupee, HiQuestionMarkCircle } from 'react-icons/hi';

const sideNavItems = [
    { id: 'profile', label: 'My Profile', icon: <HiUser /> },
    { id: 'bookings', label: 'My Bookings', icon: <HiCalendar /> },
    { id: 'payments', label: 'Payments', icon: <HiCurrencyRupee /> },
    { id: 'wishlist', label: 'Wishlist', icon: <HiHeart /> },
    { id: 'help', label: 'Help & Support', icon: <HiQuestionMarkCircle /> },
    { id: 'settings', label: 'Settings', icon: <HiCog /> },
];

function WishlistTab() {
    const { wishlist, loading, setWishlist } = useMyWishlist();
    const { toggleLike } = useWishlistDefault();

    const handleRemove = async (venueId) => {
        await toggleLike(venueId);
        setWishlist(prev => prev.filter(v => v._id !== venueId));
    };

    if (loading) return (
        <div className="space-y-4">
            {[1, 2].map(i => (
                <div key={i} className="bg-bg-card border border-border-default rounded-2xl p-5 animate-pulse">
                    <div className="flex gap-4"><div className="w-28 h-20 bg-white/[0.05] rounded-xl" /><div className="flex-1 space-y-3"><div className="h-4 bg-white/[0.05] rounded-lg w-3/4" /><div className="h-3 bg-white/[0.05] rounded-lg w-1/2" /></div></div>
                </div>
            ))}
        </div>
    );

    if (wishlist.length === 0) return (
        <motion.div className="bg-bg-card border border-border-default rounded-2xl p-10 text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-5xl mb-4">💜</div>
            <h3 className="text-xl font-bold text-white mb-2">Your Wishlist is Empty</h3>
            <p className="text-text-secondary text-sm mb-6 max-w-md mx-auto">Save your favorite venues to compare and book later.</p>
            <Link to="/venues" className="inline-flex items-center gap-2 px-7 py-3 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-primary-light text-white shadow-[0_4px_15px_rgba(108,60,225,0.4)] hover:-translate-y-0.5 transition-all duration-300"><HiHeart /> Explore Venues</Link>
        </motion.div>
    );

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <p className="text-text-muted text-sm mb-4">{wishlist.length} saved venue{wishlist.length > 1 ? 's' : ''}</p>
            <div className="space-y-4">
                {wishlist.map((venue, i) => (
                    <motion.div key={venue._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-bg-card border border-border-default rounded-2xl overflow-hidden hover:border-border-light transition-all duration-300">
                        <div className="flex gap-4 p-5 max-md:flex-col">
                            <div className="w-32 h-24 max-md:w-full max-md:h-40 rounded-xl overflow-hidden shrink-0">
                                <img src={venue.images?.[0]?.url || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400'} alt={venue.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base font-semibold text-white truncate">{venue.name}</h3>
                                <div className="flex items-center gap-1.5 text-text-muted text-xs mt-0.5"><HiLocationMarker /><span>{venue.area}, {venue.city}</span></div>
                                <div className="flex items-center gap-4 flex-wrap mt-2 text-sm">
                                    <span className="flex items-center gap-1 text-text-secondary"><HiStar className="text-accent-gold" /> {venue.rating?.average || 'N/A'}</span>
                                    <span className="flex items-center gap-1 text-text-secondary"><HiCurrencyRupee className="text-accent-emerald" /> ₹{(venue.startingPrice || 0).toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex items-center gap-3 mt-3">
                                    <Link to={`/venues/${venue._id}`} className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-primary to-primary-light text-white text-xs font-semibold rounded-xl hover:-translate-y-0.5 transition-all duration-300 shadow-[0_4px_12px_rgba(108,60,225,0.3)]">View Venue</Link>
                                    <button onClick={() => handleRemove(venue._id)} className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium hover:bg-red-500/20 transition-all"><HiTrash /> Remove</button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}

export default function Profile() {
    const navigate = useNavigate();
    const { user, setUser, loading, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');

    useEffect(() => {
        if (!loading && !user) navigate('/login');
    }, [loading, user, navigate]);

    const handleUserUpdate = (updatedUser) => {
        setUser(updatedUser);
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <main className="pt-[100px] min-h-screen flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
                        <p className="text-text-muted text-sm">Loading profile...</p>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <main className="pt-[100px] min-h-screen pb-20">
                <div className="max-w-[1280px] mx-auto px-6">
                    {/* Page Header */}
                    <motion.div
                        className="flex items-center justify-between mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div>
                            <Link to="/" className="flex items-center gap-1.5 text-text-muted text-xs mb-2 hover:text-text-secondary transition-colors">
                                <HiArrowLeft /> Back to Home
                            </Link>
                            <h1 className="font-display text-[clamp(1.5rem,3vw,2.25rem)] font-bold bg-gradient-to-br from-white to-text-secondary bg-clip-text text-transparent">
                                My Account
                            </h1>
                        </div>
                    </motion.div>

                    {/* Layout: Sidebar + Content */}
                    <div className="grid grid-cols-[260px_1fr] max-lg:grid-cols-1 gap-6">
                        {/* Sidebar */}
                        <motion.aside
                            className="max-lg:order-2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <div className="bg-bg-card border border-border-default rounded-2xl p-4 sticky top-[100px]">
                                {/* User Summary */}
                                <div className="flex items-center gap-3 pb-4 mb-3 border-b border-border-default">
                                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white font-bold text-base">
                                        {user?.avatar ? (
                                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-xl" />
                                        ) : (
                                            user?.name?.charAt(0).toUpperCase() || 'U'
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-sm font-semibold text-white truncate">{user?.name}</h3>
                                        <p className="text-text-muted text-xs truncate">{user?.email}</p>
                                    </div>
                                </div>

                                {/* Nav Items */}
                                <nav className="flex flex-col gap-1 mb-3">
                                    {sideNavItems.map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => setActiveTab(item.id)}
                                            className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-sm font-medium text-left transition-all duration-300 border border-transparent ${activeTab === item.id
                                                ? 'bg-gradient-to-r from-primary/15 to-transparent text-white border-primary/20'
                                                : 'text-text-secondary hover:text-white hover:bg-white/[0.04]'
                                                }`}
                                        >
                                            <span className={`text-lg ${activeTab === item.id ? 'text-primary-light' : ''}`}>{item.icon}</span>
                                            {item.label}
                                        </button>
                                    ))}
                                </nav>

                                <div className="pt-3 border-t border-border-default">
                                    <button
                                        onClick={logout}
                                        className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all duration-300"
                                    >
                                        <HiLogout className="text-lg" /> Logout
                                    </button>
                                </div>
                            </div>
                        </motion.aside>

                        {/* Main Content */}
                        <div className="max-lg:order-1">
                            {activeTab === 'profile' && (
                                <ProfileInfo user={user} onUpdate={handleUserUpdate} />
                            )}

                            {activeTab === 'bookings' && (
                                <MyBookings />
                            )}

                            {activeTab === 'wishlist' && (
                                <WishlistTab />
                            )}

                            {activeTab === 'payments' && (
                                <PaymentHistory />
                            )}

                            {activeTab === 'help' && (
                                <motion.div
                                    className="bg-bg-card border border-border-default rounded-2xl overflow-hidden"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <div className="p-6 border-b border-border-default">
                                        <h3 className="text-lg font-semibold text-white">Help & Support</h3>
                                        <p className="text-text-muted text-sm mt-1">Get help with your bookings and account</p>
                                    </div>
                                    <div className="divide-y divide-border-default">
                                        {[
                                            { q: 'How do I book a venue?', a: 'Search for a venue, pick your date, select a package, and pay the 20% advance to confirm your booking.' },
                                            { q: 'What is the cancellation policy?', a: 'Free cancellation up to 30 days before the event. 50% refund for cancellations 15-30 days before. No refund within 15 days.' },
                                            { q: 'How does payment work?', a: 'You pay 20% advance online through Razorpay (UPI, Cards, Net Banking). The remaining 80% is paid directly to the venue before the event.' },
                                            { q: 'Can I modify my booking?', a: 'You can cancel and rebook. Direct modifications are not yet supported but coming soon.' },
                                            { q: 'How do I contact a venue?', a: 'Visit the venue detail page and use the Call or Chat buttons to contact the venue manager directly.' },
                                            { q: 'I paid but didn\'t get confirmation?', a: 'Please wait a few minutes. If the issue persists, contact us at support@eventbook.in with your booking ID.' },
                                        ].map((faq, i) => (
                                            <div key={i} className="p-5">
                                                <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2"><HiQuestionMarkCircle className="text-primary-light shrink-0" /> {faq.q}</h4>
                                                <p className="text-text-secondary text-sm leading-relaxed pl-6">{faq.a}</p>
                                            </div>
                                        ))}
                                        <div className="p-6">
                                            <h4 className="text-sm font-semibold text-white mb-3">Still need help?</h4>
                                            <div className="flex gap-3 flex-wrap">
                                                <a href="mailto:support@eventbook.in" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-primary-light text-white text-sm font-semibold rounded-xl hover:-translate-y-0.5 transition-all duration-300 shadow-[0_4px_12px_rgba(108,60,225,0.3)]">📧 Email Us</a>
                                                <a href="tel:+917000000000" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/[0.06] border border-border-default rounded-xl text-text-secondary text-sm font-medium hover:text-white hover:border-border-light transition-all duration-300">📞 Call Support</a>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'settings' && (
                                <motion.div
                                    className="bg-bg-card border border-border-default rounded-2xl overflow-hidden"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <div className="p-6 border-b border-border-default">
                                        <h3 className="text-lg font-semibold text-white">Account Settings</h3>
                                        <p className="text-text-muted text-sm mt-1">Manage your account preferences</p>
                                    </div>

                                    <div className="divide-y divide-border-default">
                                        {/* Notifications */}
                                        <div className="p-6">
                                            <h4 className="text-sm font-semibold text-white mb-4">Notifications</h4>
                                            <div className="space-y-4">
                                                {[
                                                    { label: 'Email notifications for booking updates', key: 'emailBooking', defaultOn: true },
                                                    { label: 'SMS notifications for booking confirmations', key: 'smsBooking', defaultOn: true },
                                                    { label: 'Promotional offers and deals', key: 'promoOffers', defaultOn: false },
                                                    { label: 'Newsletter and venue recommendations', key: 'newsletter', defaultOn: false },
                                                ].map(item => (
                                                    <label key={item.key} className="flex items-center justify-between cursor-pointer group">
                                                        <span className="text-text-secondary text-sm group-hover:text-white transition-colors">{item.label}</span>
                                                        <div className="relative">
                                                            <input type="checkbox" defaultChecked={item.defaultOn} className="sr-only peer" />
                                                            <div className="w-10 h-5 bg-white/10 rounded-full peer-checked:bg-primary transition-colors duration-300" />
                                                            <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform duration-300" />
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Security */}
                                        <div className="p-6">
                                            <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><HiShieldCheck className="text-primary-light" /> Security</h4>
                                            <button className="px-5 py-2.5 bg-white/[0.06] border border-border-default rounded-xl text-text-secondary text-sm font-medium hover:text-white hover:border-border-light transition-all duration-300">
                                                Change Password
                                            </button>
                                        </div>

                                        {/* Danger Zone */}
                                        <div className="p-6">
                                            <h4 className="text-sm font-semibold text-red-400 mb-2">Danger Zone</h4>
                                            <p className="text-text-muted text-xs mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                                            <button className="px-5 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium hover:bg-red-500/20 transition-all duration-300">
                                                Delete Account
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
