import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import useAuth from '../../hooks/useAuth';
import { useAdminStats, useAdminVenues, useAdminUsers, useAdminVenueDetail, useAdminBookings } from '../../hooks/useAdmin';
import {
    HiHome, HiOfficeBuilding, HiUsers, HiCurrencyRupee, HiCalendar,
    HiCheckCircle, HiXCircle, HiLogout, HiMenu, HiX,
    HiTrendingUp, HiCheck, HiClipboardList, HiEye,
    HiLocationMarker, HiStar, HiChevronLeft, HiChevronRight,
    HiBan, HiPlay, HiUserGroup, HiClock, HiPhone, HiMail, HiDocumentText
} from 'react-icons/hi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
import axios from 'axios';

const navItems = [
    { icon: <HiHome />, label: 'Dashboard', id: 'dashboard' },
    { icon: <HiOfficeBuilding />, label: 'All Venues', id: 'venues' },
    { icon: <HiCalendar />, label: 'Bookings', id: 'bookings' },
    { icon: <HiCurrencyRupee />, label: 'Commission', id: 'commission' },
    { icon: <HiTrendingUp />, label: 'Reports', id: 'reports' },
    { icon: <HiUsers />, label: 'Users', id: 'users' },
    { icon: <HiCheckCircle />, label: 'Approvals', id: 'approvals' },
    { icon: <HiUserGroup />, label: 'Vendor Requests', id: 'vendors' },
];

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { user: adminUser, loading: authLoading, logout } = useAuth();

    // Hooks for data fetching
    const { stats: fetchedStats, loading: statsLoading, refetch: refetchStats } = useAdminStats();
    const { venues: pendingVenues, loading: pendingLoading, refetch: refetchPending, updateVenueStatus: updatePendingStatus } = useAdminVenues('pending');
    const { venues: allVenues, loading: allLoading, refetch: refetchAll, updateVenueStatus: updateAllStatus, toggleVenueActive: toggleAllActive, toggleVenueFeatured: toggleAllFeatured } = useAdminVenues();
    const { users, loading: usersLoading } = useAdminUsers();
    const { bookings: adminBookings, loading: bookingsLoading, updateBookingStatus: adminUpdateBooking } = useAdminBookings();

    const [activeNav, setActiveNav] = useState('dashboard');
    const [bookingFilter, setBookingFilter] = useState('all');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Vendor requests state
    const [pendingVendorsList, setPendingVendorsList] = useState([]);
    const [vendorsLoading, setVendorsLoading] = useState(false);

    // Fetch pending vendors
    useEffect(() => {
        const fetchVendors = async () => {
            setVendorsLoading(true);
            try {
                const { data } = await axios.get(`${API_URL}/admin/vendors/pending`, { withCredentials: true });
                if (data.success) setPendingVendorsList(data.vendors);
            } catch (err) {
                console.error('Failed to fetch vendors:', err);
            } finally {
                setVendorsLoading(false);
            }
        };
        fetchVendors();
    }, []);

    const handleVendorApproval = async (vendorId, status) => {
        const action = status === 'approved' ? 'Approve' : 'Reject';
        if (!confirm(`${action} this vendor?`)) return;
        try {
            const { data } = await axios.put(`${API_URL}/admin/vendors/${vendorId}/status`, { vendorStatus: status }, { withCredentials: true });
            if (data.success) {
                setPendingVendorsList(prev => prev.map(v => v._id === vendorId ? { ...v, vendorStatus: status } : v));
                toast.success(data.message);
            }
        } catch (err) {
            toast.error('Failed to update vendor status');
        }
    };

    // Booking Detail Modal State
    const [selectedBooking, setSelectedBooking] = useState(null);

    // Venue Detail Modal State
    const [selectedVenueId, setSelectedVenueId] = useState(null);
    const { venue: selectedVenue, setVenue: setSelectedVenue, loading: venueDetailLoading } = useAdminVenueDetail(selectedVenueId);

    const [currentImage, setCurrentImage] = useState(0);
    const [detailTab, setDetailTab] = useState('overview');

    const loading = statsLoading || pendingLoading || allLoading || usersLoading || bookingsLoading;

    // Transform stats for display
    const statsDisplay = fetchedStats ? [
        { label: 'Total Users', value: fetchedStats.users, icon: <HiUsers />, change: 'active', color: '#3B82F6' },
        { label: 'Total Venues', value: fetchedStats.venues, icon: <HiOfficeBuilding />, change: 'listed', color: '#10B981' },
        { label: 'Total Bookings', value: fetchedStats.bookings, icon: <HiCalendar />, change: `${fetchedStats.pendingBookings || 0} pending`, color: '#06B6D4' },
        { label: 'Pending Approvals', value: fetchedStats.pendingVenues, icon: <HiClipboardList />, change: 'needs action', color: '#F59E0B' },
        { label: 'Total Revenue', value: `₹${(fetchedStats.revenue / 100000).toFixed(2)}L`, icon: <HiCurrencyRupee />, change: 'lifetime', color: '#8B5CF6' },
        { label: 'Advance Collected', value: `₹${((fetchedStats.advanceCollected || 0) / 1000).toFixed(1)}K`, icon: <HiCurrencyRupee />, change: 'via Razorpay', color: '#10B981' }
    ] : [];

    // Redirect if not admin
    useEffect(() => {
        if (!authLoading && (!adminUser || adminUser.role !== 'admin')) {
            navigate('/admin');
        }
    }, [authLoading, adminUser, navigate]);

    // Open Venue Detail Modal
    const openVenueDetail = (venueId) => {
        setCurrentImage(0);
        setDetailTab('overview');
        setSelectedVenueId(venueId);
    };

    const closeVenueDetail = () => {
        setSelectedVenueId(null);
    };

    const handleVenueStatus = async (id, isApproved) => {
        if (!confirm(isApproved ? 'Approve this venue?' : 'Reject this venue?')) return;
        try {
            // Update using pending hook (so it removes from pending list)
            const data = await updatePendingStatus(id, isApproved);
            if (data && data.success) {
                // If it was in the 'all' list, we should update it there too. 
                // Since updatePendingStatus only updates 'pendingVenues' state (removes it),
                // we need to manually update 'allVenues' or refetch it. Refetching is safer.
                refetchAll();
                refetchStats();

                if (selectedVenue?._id === id) {
                    setSelectedVenue(prev => ({ ...prev, isApproved }));
                }
            }
        } catch (error) {
            // Error handled in hook (toast)
        }
    };

    const handleToggleActive = async (id) => {
        const venue = allVenues.find(v => v._id === id) || selectedVenue;
        const action = venue?.isActive ? 'Stop' : 'Activate';
        if (!confirm(`${action} this venue? ${venue?.isActive ? 'It will be hidden from users.' : 'It will be visible to users again.'}`)) return;
        try {
            const data = await toggleAllActive(id);
            if (data && data.success) {
                if (selectedVenue?._id === id) {
                    setSelectedVenue(prev => ({ ...prev, isActive: data.venue.isActive }));
                }
            }
        } catch (error) {
            // Error handled in hook
        }
    };

    const handleToggleFeatured = async (id) => {
        try {
            const data = await toggleAllFeatured(id);
            if (data && data.success) {
                if (selectedVenue?._id === id) {
                    setSelectedVenue(prev => ({ ...prev, featured: data.venue.featured }));
                }
            }
        } catch (error) {
            // Error handled in hook
        }
    };

    const amenityLabels = {
        parking: '🅿️ Parking', ac: '❄️ AC', wifi: '📶 WiFi', dj: '🎵 DJ',
        decorationAvailable: '🎨 Decoration', cateringAvailable: '🍽️ Catering',
        alcoholAllowed: '🍷 Alcohol', outsideCatering: '🥡 Outside Catering',
        changingRooms: '👔 Changing Rooms', stage: '🎤 Stage',
        projector: '📽️ Projector', generator: '⚡ Generator'
    };

    if (loading && !statsDisplay.length) return <div className="flex items-center justify-center h-screen bg-bg-primary text-white">Loading Dashboard...</div>;

    return (
        <div className="flex min-h-screen bg-bg-primary">
            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 h-full w-[260px] bg-bg-secondary border-r border-border-default flex flex-col z-50 transition-transform duration-300 max-lg:${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className="p-5 pb-4 border-b border-border-default flex items-center justify-between">
                    <Link to="/" className="text-xl font-extrabold text-white">Event<span className="bg-gradient-to-r from-accent-emerald to-teal-500 bg-clip-text text-transparent">Book</span></Link>
                    <span className="px-2.5 py-0.5 bg-blue-500/15 text-blue-400 text-[0.65rem] font-bold rounded-full uppercase tracking-wider">Admin</span>
                    <button className="lg:hidden text-text-muted text-xl" onClick={() => setSidebarOpen(false)}><HiX /></button>
                </div>
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {navItems.map(item => (
                        <button key={item.id} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 border-none cursor-pointer ${activeNav === item.id ? 'bg-blue-500/15 text-blue-400' : 'text-text-secondary hover:bg-white/5 hover:text-white bg-transparent'}`} onClick={() => { setActiveNav(item.id); setSidebarOpen(false); }}>
                            {item.icon}<span>{item.label}</span>
                            {item.id === 'approvals' && pendingVenues.length > 0 && (
                                <span className="ml-auto px-2 py-0.5 bg-accent-gold/20 text-accent-gold text-[10px] font-bold rounded-full">{pendingVenues.length}</span>
                            )}
                            {item.id === 'vendors' && pendingVendorsList.filter(v => v.vendorStatus === 'pending').length > 0 && (
                                <span className="ml-auto px-2 py-0.5 bg-primary/20 text-primary-light text-[10px] font-bold rounded-full">{pendingVendorsList.filter(v => v.vendorStatus === 'pending').length}</span>
                            )}
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t border-border-default">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-500/15 text-blue-400 text-lg"><HiUsers /></div>
                        <div><p className="text-sm font-medium text-white">{adminUser?.name || 'Admin'}</p><p className="text-xs text-text-muted">System Admin</p></div>
                    </div>
                    <button className="w-full flex items-center justify-center gap-2 py-2 bg-white/5 border border-border-default rounded-xl text-text-secondary text-sm hover:text-accent hover:border-accent/20 transition-all duration-300" onClick={logout}><HiLogout /></button>
                </div>
            </aside>

            <main className="flex-1 lg:ml-[260px]">
                <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 bg-bg-primary/85 backdrop-blur-xl border-b border-border-default">
                    <div className="flex items-center gap-3">
                        <button className="lg:hidden text-white text-xl" onClick={() => setSidebarOpen(true)}><HiMenu /></button>
                        <h1 className="text-xl font-bold text-white">{navItems.find(n => n.id === activeNav)?.label || 'Dashboard'}</h1>
                    </div>
                </header>

                <div className="p-6 space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1 gap-4">
                        {statsDisplay.map((stat, i) => (
                            <motion.div key={i} className="flex items-center gap-4 p-5 bg-bg-card border border-border-default rounded-2xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                                <div className="w-12 h-12 flex items-center justify-center rounded-[14px] text-xl" style={{ background: `color-mix(in srgb, ${stat.color} 15%, transparent)`, color: stat.color }}>{stat.icon}</div>
                                <div>
                                    <span className="text-2xl font-extrabold text-white block">{stat.value}</span>
                                    <span className="text-text-muted text-xs">{stat.label}</span>
                                    <span className="flex items-center gap-1 text-accent-emerald text-[0.7rem] mt-0.5"><HiTrendingUp /> {stat.change}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Pending Venues Section (Approvals) */}
                    {(activeNav === 'approvals' || activeNav === 'dashboard') && (
                        <motion.div className="bg-bg-card border border-border-default rounded-2xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                            <div className="flex items-center justify-between p-5 border-b border-border-default">
                                <h2 className="text-lg font-semibold text-white">Pending Approvals</h2>
                                <span className="px-2.5 py-0.5 bg-accent-gold/15 text-accent-gold text-xs font-bold rounded-full">{pendingVenues.length} Pending</span>
                            </div>
                            <div className="p-5 grid gap-4">
                                {pendingVenues.length > 0 ? pendingVenues.map(venue => (
                                    <div key={venue._id} className="p-5 bg-white/[0.02] border border-border-default rounded-xl">
                                        <div className="flex items-start justify-between mb-3 max-sm:flex-col max-sm:gap-3">
                                            <div className="flex gap-4">
                                                <div className="w-16 h-16 rounded-lg bg-black/40 overflow-hidden flex-shrink-0">
                                                    <img src={venue.images[0]?.url || 'https://via.placeholder.com/100'} alt={venue.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-semibold text-white">{venue.name}</h3>
                                                    <p className="text-text-muted text-xs mt-0.5">{venue.city} • {venue.area} • {venue.venueType}</p>
                                                    <p className="text-text-secondary text-xs mt-1">Vendor: {venue.owner?.name}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => openVenueDetail(venue._id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 text-xs font-semibold hover:bg-blue-500/20 transition-all"><HiEye /> View Details</button>
                                                <button onClick={() => handleVenueStatus(venue._id, true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-emerald/10 border border-accent-emerald/20 rounded-lg text-accent-emerald text-xs font-semibold hover:bg-accent-emerald/20 transition-all"><HiCheck /> Approve</button>
                                                <button onClick={() => handleVenueStatus(venue._id, false)} className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-lg text-accent text-xs font-semibold hover:bg-accent/20 transition-all"><HiXCircle /> Reject</button>
                                            </div>
                                        </div>
                                    </div>
                                )) : <p className="text-text-muted text-center py-4">No pending venues.</p>}
                            </div>
                        </motion.div>
                    )}

                    {/* All Venues Section */}
                    {activeNav === 'venues' && (
                        <motion.div className="bg-bg-card border border-border-default rounded-2xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                            <div className="p-5 border-b border-border-default">
                                <h2 className="text-lg font-semibold text-white">All Venues</h2>
                            </div>
                            <div className="divide-y divide-border-default">
                                {allVenues.map(venue => (
                                    <div key={venue._id} className="p-4 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors">
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className="w-12 h-12 rounded-lg bg-black/40 overflow-hidden flex-shrink-0">
                                                <img src={venue.images[0]?.url || 'https://via.placeholder.com/100'} alt={venue.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-medium text-white truncate">{venue.name}</h3>
                                                <div className="flex items-center gap-2 text-xs text-text-muted flex-wrap">
                                                    <span>{venue.city}</span>
                                                    <span>•</span>
                                                    <span>{venue.owner?.name}</span>
                                                    <span>•</span>
                                                    <span className={venue.isApproved ? 'text-accent-emerald' : 'text-accent-gold'}>{venue.isApproved ? 'Approved' : 'Pending'}</span>
                                                    {venue.isApproved && (
                                                        <>
                                                            <span>•</span>
                                                            <span className={venue.isActive ? 'text-blue-400' : 'text-red-400'}>{venue.isActive ? 'Active' : 'Stopped'}</span>
                                                        </>
                                                    )}
                                                    {venue.featured && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="text-accent-gold">⭐ Featured</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <span className="text-sm font-semibold text-white mr-2">₹{venue.startingPrice?.toLocaleString('en-IN')}</span>
                                            <button onClick={() => openVenueDetail(venue._id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 text-xs font-semibold hover:bg-blue-500/20 transition-all"><HiEye /> View</button>
                                            {venue.isApproved && (
                                                <>
                                                    <button onClick={() => handleToggleFeatured(venue._id)} className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-semibold transition-all ${venue.featured ? 'bg-accent-gold/10 border-accent-gold/20 text-accent-gold hover:bg-accent-gold/20' : 'bg-white/5 border-border-default text-text-muted hover:text-accent-gold hover:border-accent-gold/20'}`}>
                                                        <HiStar /> {venue.featured ? 'Featured' : 'Feature'}
                                                    </button>
                                                    <button onClick={() => handleToggleActive(venue._id)} className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-semibold transition-all ${venue.isActive ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20' : 'bg-accent-emerald/10 border-accent-emerald/20 text-accent-emerald hover:bg-accent-emerald/20'}`}>
                                                        {venue.isActive ? <><HiBan /> Stop</> : <><HiPlay /> Activate</>}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* ============ BOOKINGS SECTION ============ */}
                    {(activeNav === 'bookings' || activeNav === 'dashboard') && (
                        <motion.div className="bg-bg-card border border-border-default rounded-2xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                            <div className="flex items-center justify-between p-5 border-b border-border-default flex-wrap gap-3">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-lg font-semibold text-white">All Bookings</h2>
                                    <span className="px-2.5 py-0.5 bg-blue-500/15 text-blue-400 text-xs font-bold rounded-full">{adminBookings.length}</span>
                                </div>
                                <div className="flex gap-1.5">
                                    {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(f => (
                                        <button key={f} onClick={() => setBookingFilter(f)} className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-all ${bookingFilter === f ? 'bg-blue-500/15 text-blue-400' : 'text-text-muted hover:text-white hover:bg-white/5'}`}>{f}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="p-5 space-y-3 max-h-[600px] overflow-y-auto">
                                {adminBookings.filter(b => bookingFilter === 'all' || b.status === bookingFilter).length > 0 ?
                                    adminBookings.filter(b => bookingFilter === 'all' || b.status === bookingFilter).map(b => (
                                        <div key={b._id} className="p-4 bg-white/[0.02] border border-border-default rounded-xl">
                                            <div className="flex justify-between gap-3 mb-2 flex-wrap">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="text-sm font-semibold text-white">{b.user?.name || 'Unknown User'}</h4>
                                                        <span className="text-text-muted text-[0.65rem]">({b.user?.email})</span>
                                                    </div>
                                                    <p className="text-text-muted text-xs capitalize">{b.eventType} • {b.venue?.name} • {b.venue?.city}</p>
                                                    <p className="text-text-muted text-[0.7rem] mt-1">📅 {new Date(b.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • 👥 {b.guestCount} guests • 🆔 {b.bookingId}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="block text-base font-bold text-white">₹{b.pricing?.totalAmount?.toLocaleString('en-IN')}</span>
                                                    <div className="flex items-center gap-1.5 mt-1 justify-end">
                                                        <span className={`inline-block px-2 py-0.5 text-[0.6rem] font-bold rounded-full uppercase tracking-wider border capitalize ${b.status === 'confirmed' || b.status === 'completed' ? 'bg-accent-emerald/15 text-accent-emerald border-accent-emerald/20' : b.status === 'pending' ? 'bg-accent-gold/15 text-accent-gold border-accent-gold/20' : 'bg-accent/15 text-accent border-accent/20'}`}>{b.status}</span>
                                                        <span className={`inline-block px-2 py-0.5 text-[0.6rem] font-bold rounded-full uppercase tracking-wider border ${b.paymentStatus === 'advance-paid' ? 'bg-blue-500/15 text-blue-400 border-blue-500/20' : b.paymentStatus === 'refunded' ? 'bg-primary/15 text-primary-light border-primary/20' : 'bg-white/5 text-text-muted border-border-default'}`}>{b.paymentStatus}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 mt-3 pt-3 border-t border-border-default flex-wrap">
                                                <button onClick={() => setSelectedBooking(b)} className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 text-xs font-semibold hover:bg-blue-500/20 transition-all"><HiEye /> View Details</button>
                                                {b.status === 'pending' && <button onClick={() => adminUpdateBooking(b._id, 'confirmed')} className="flex items-center gap-1 px-3 py-1.5 bg-accent-emerald/10 border border-accent-emerald/20 rounded-lg text-accent-emerald text-xs font-semibold hover:bg-accent-emerald/20 transition-all"><HiCheck /> Confirm</button>}
                                                {b.status === 'confirmed' && <button onClick={() => adminUpdateBooking(b._id, 'completed')} className="flex items-center gap-1 px-3 py-1.5 bg-accent-emerald/10 border border-accent-emerald/20 rounded-lg text-accent-emerald text-xs font-semibold hover:bg-accent-emerald/20 transition-all"><HiCheck /> Complete</button>}
                                                {(b.status === 'pending' || b.status === 'confirmed') && <button onClick={() => { if (window.confirm('Cancel this booking?' + (b.paymentStatus === 'advance-paid' ? ' Refund will be initiated.' : ''))) adminUpdateBooking(b._id, 'cancelled'); }} className="flex items-center gap-1 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-lg text-accent text-xs font-semibold hover:bg-accent/20 transition-all"><HiXCircle /> Cancel{b.paymentStatus === 'advance-paid' ? ' & Refund' : ''}</button>}
                                            </div>
                                        </div>
                                    )) : <p className="text-text-muted text-center py-4">No bookings found.</p>}
                            </div>
                        </motion.div>
                    )}

                    {/* Users Section */}
                    {activeNav === 'users' && (
                        <motion.div className="bg-bg-card border border-border-default rounded-2xl overflow-hidden" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                            <div className="p-5 border-b border-border-default">
                                <h2 className="text-lg font-semibold text-white">Registered Users</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-text-secondary">
                                    <thead className="bg-white/5 text-text-muted uppercase text-xs">
                                        <tr>
                                            <th className="px-6 py-3">Name</th>
                                            <th className="px-6 py-3">Email</th>
                                            <th className="px-6 py-3">Role</th>
                                            <th className="px-6 py-3">Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border-default">
                                        {users.map(user => (
                                            <tr key={user._id} className="hover:bg-white/[0.02]">
                                                <td className="px-6 py-4 font-medium text-white">{user.name}</td>
                                                <td className="px-6 py-4">{user.email}</td>
                                                <td className="px-6 py-4 capitalize">
                                                    <span className={`px-2 py-0.5 rounded text-xs border ${user.role === 'admin' ? 'bg-accent/10 text-accent border-accent/20' :
                                                        user.role === 'vendor' ? 'bg-primary/10 text-primary-light border-primary/20' :
                                                            'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                        }`}>{user.role}</span>
                                                </td>
                                                <td className="px-6 py-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}

                    {/* ============ VENDOR REQUESTS SECTION ============ */}
                    {activeNav === 'vendors' && (
                        <motion.div className="space-y-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            {/* Filter tabs */}
                            <div className="flex gap-2">
                                {['all', 'pending', 'approved', 'rejected'].map(f => (
                                    <button key={f} onClick={() => setBookingFilter(f)} className={`px-4 py-2 text-sm font-semibold rounded-xl capitalize transition-all border-none cursor-pointer ${bookingFilter === f ? 'bg-primary/15 text-primary-light' : 'text-text-muted hover:text-white hover:bg-white/5 bg-transparent'}`}>{f}</button>
                                ))}
                            </div>

                            {vendorsLoading ? (
                                <div className="text-center py-12 text-text-muted">Loading vendors...</div>
                            ) : (
                                pendingVendorsList
                                    .filter(v => bookingFilter === 'all' || v.vendorStatus === bookingFilter)
                                    .map(vendor => (
                                        <div key={vendor._id} className="bg-bg-card border border-border-default rounded-2xl overflow-hidden">
                                            <div className="p-5 flex items-start justify-between gap-4 max-md:flex-col">
                                                <div className="flex items-start gap-4 flex-1">
                                                    <div className="w-14 h-14 rounded-2xl bg-primary/15 text-primary-light flex items-center justify-center font-bold text-xl shrink-0">
                                                        {vendor.name?.[0]?.toUpperCase() || 'V'}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                            <h3 className="text-base font-semibold text-white">{vendor.name}</h3>
                                                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider border ${vendor.vendorStatus === 'approved' ? 'bg-accent-emerald/15 text-accent-emerald border-accent-emerald/20' :
                                                                vendor.vendorStatus === 'rejected' ? 'bg-accent/15 text-accent border-accent/20' :
                                                                    'bg-accent-gold/15 text-accent-gold border-accent-gold/20'
                                                                }`}>{vendor.vendorStatus || 'pending'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-text-muted text-xs flex-wrap">
                                                            <span className="flex items-center gap-1"><HiMail className="text-sm" /> {vendor.email}</span>
                                                            {vendor.mobile && <span className="flex items-center gap-1"><HiPhone className="text-sm" /> {vendor.mobile}</span>}
                                                        </div>
                                                        {vendor.businessName && (
                                                            <p className="text-white text-sm font-medium mt-2 flex items-center gap-1.5">
                                                                <HiOfficeBuilding className="text-primary-light" /> {vendor.businessName}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                {vendor.vendorStatus === 'pending' && (
                                                    <div className="flex gap-2 shrink-0">
                                                        <button onClick={() => handleVendorApproval(vendor._id, 'approved')} className="flex items-center gap-1.5 px-4 py-2 bg-accent-emerald/10 border border-accent-emerald/20 rounded-xl text-accent-emerald text-xs font-semibold hover:bg-accent-emerald/20 transition-all">
                                                            <HiCheck /> Approve
                                                        </button>
                                                        <button onClick={() => handleVendorApproval(vendor._id, 'rejected')} className="flex items-center gap-1.5 px-4 py-2 bg-accent/10 border border-accent/20 rounded-xl text-accent text-xs font-semibold hover:bg-accent/20 transition-all">
                                                            <HiXCircle /> Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Vendor Details */}
                                            {vendor.vendorDetails && (
                                                <div className="px-5 pb-5 pt-0">
                                                    <div className="grid grid-cols-4 max-lg:grid-cols-2 max-sm:grid-cols-1 gap-3">
                                                        {vendor.vendorDetails.city && (
                                                            <div className="p-3 bg-white/[0.03] border border-border-default rounded-xl">
                                                                <span className="text-text-muted text-[10px] uppercase tracking-wider block mb-1">City</span>
                                                                <span className="text-white text-sm font-medium">{vendor.vendorDetails.city}</span>
                                                            </div>
                                                        )}
                                                        {vendor.vendorDetails.venueType && (
                                                            <div className="p-3 bg-white/[0.03] border border-border-default rounded-xl">
                                                                <span className="text-text-muted text-[10px] uppercase tracking-wider block mb-1">Venue Type</span>
                                                                <span className="text-white text-sm font-medium capitalize">{vendor.vendorDetails.venueType.replace('-', ' ')}</span>
                                                            </div>
                                                        )}
                                                        {vendor.vendorDetails.estimatedCapacity && (
                                                            <div className="p-3 bg-white/[0.03] border border-border-default rounded-xl">
                                                                <span className="text-text-muted text-[10px] uppercase tracking-wider block mb-1">Est. Capacity</span>
                                                                <span className="text-white text-sm font-medium">{vendor.vendorDetails.estimatedCapacity} guests</span>
                                                            </div>
                                                        )}
                                                        {vendor.vendorDetails.experience && (
                                                            <div className="p-3 bg-white/[0.03] border border-border-default rounded-xl">
                                                                <span className="text-text-muted text-[10px] uppercase tracking-wider block mb-1">Experience</span>
                                                                <span className="text-white text-sm font-medium">{vendor.vendorDetails.experience}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {vendor.vendorDetails.address && (
                                                        <div className="p-3 bg-white/[0.03] border border-border-default rounded-xl mt-3">
                                                            <span className="text-text-muted text-[10px] uppercase tracking-wider block mb-1">Address</span>
                                                            <span className="text-white text-sm">{vendor.vendorDetails.address}</span>
                                                        </div>
                                                    )}
                                                    {vendor.vendorDetails.description && (
                                                        <div className="p-3 bg-white/[0.03] border border-border-default rounded-xl mt-3">
                                                            <span className="text-text-muted text-[10px] uppercase tracking-wider block mb-1">Description</span>
                                                            <p className="text-text-secondary text-sm leading-relaxed">{vendor.vendorDetails.description}</p>
                                                        </div>
                                                    )}
                                                    <p className="text-text-muted text-xs mt-3">Registered on {new Date(vendor.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))
                            )}
                            {!vendorsLoading && pendingVendorsList.filter(v => bookingFilter === 'all' || v.vendorStatus === bookingFilter).length === 0 && (
                                <div className="bg-bg-card border border-border-default rounded-2xl p-12 text-center">
                                    <HiUserGroup className="text-4xl text-white/10 mx-auto mb-3" />
                                    <p className="text-text-muted">No {bookingFilter !== 'all' ? bookingFilter : ''} vendor requests found.</p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ============ COMMISSION TRACKING SECTION ============ */}
                    {activeNav === 'commission' && (
                        <motion.div className="space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            {/* Commission Summary */}
                            {(() => {
                                const COMMISSION_RATE = 0.10;
                                const paidBookings = adminBookings.filter(b => b.paymentStatus === 'advance-paid' || b.paymentStatus === 'fully-paid');
                                const totalRevenue = paidBookings.reduce((s, b) => s + (b.pricing?.totalAmount || 0), 0);
                                const totalCommission = paidBookings.reduce((s, b) => s + (b.pricing?.advanceAmount || 0) * COMMISSION_RATE, 0);
                                const totalAdvance = paidBookings.reduce((s, b) => s + (b.pricing?.advanceAmount || 0), 0);
                                return (
                                    <>
                                        <div className="grid grid-cols-4 max-lg:grid-cols-2 max-sm:grid-cols-1 gap-4">
                                            <div className="p-6 bg-bg-card border border-border-default rounded-2xl">
                                                <span className="text-text-muted text-xs block mb-2">Total Booking Revenue</span>
                                                <span className="text-3xl font-extrabold text-white">₹{totalRevenue.toLocaleString('en-IN')}</span>
                                                <p className="text-blue-400 text-xs mt-1">{paidBookings.length} paid bookings</p>
                                            </div>
                                            <div className="p-6 bg-bg-card border border-border-default rounded-2xl">
                                                <span className="text-text-muted text-xs block mb-2">Advance Collected</span>
                                                <span className="text-3xl font-extrabold text-accent-emerald">₹{totalAdvance.toLocaleString('en-IN')}</span>
                                                <p className="text-text-muted text-xs mt-1">20% of total via Razorpay</p>
                                            </div>
                                            <div className="p-6 bg-gradient-to-br from-primary/10 to-primary-light/5 border border-primary/20 rounded-2xl">
                                                <span className="text-text-muted text-xs block mb-2">Platform Commission (10%)</span>
                                                <span className="text-3xl font-extrabold text-primary-light">₹{Math.round(totalCommission).toLocaleString('en-IN')}</span>
                                                <p className="text-primary-light/60 text-xs mt-1">10% of advance collected</p>
                                            </div>
                                            <div className="p-6 bg-bg-card border border-border-default rounded-2xl">
                                                <span className="text-text-muted text-xs block mb-2">Vendor Payouts</span>
                                                <span className="text-3xl font-extrabold text-accent-gold">₹{Math.round(totalAdvance - totalCommission).toLocaleString('en-IN')}</span>
                                                <p className="text-accent-gold/60 text-xs mt-1">Advance minus commission</p>
                                            </div>
                                        </div>

                                        {/* Per-Booking Commission Table */}
                                        <div className="bg-bg-card border border-border-default rounded-2xl overflow-hidden">
                                            <div className="p-5 border-b border-border-default flex items-center justify-between">
                                                <h2 className="text-lg font-semibold text-white">Commission Per Booking</h2>
                                                <span className="text-text-muted text-xs">{COMMISSION_RATE * 100}% commission rate</span>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm text-left">
                                                    <thead className="bg-white/5 text-text-muted text-xs uppercase">
                                                        <tr><th className="px-5 py-3">Booking</th><th className="px-5 py-3">Venue</th><th className="px-5 py-3">Total</th><th className="px-5 py-3">Advance</th><th className="px-5 py-3">Commission</th><th className="px-5 py-3">Date</th></tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-border-default">
                                                        {paidBookings.slice(0, 25).map(b => (
                                                            <tr key={b._id} className="hover:bg-white/[0.02]">
                                                                <td className="px-5 py-3 font-mono text-xs text-blue-400">{b.bookingId}</td>
                                                                <td className="px-5 py-3 text-white font-medium">{b.venue?.name}</td>
                                                                <td className="px-5 py-3 text-text-secondary">₹{(b.pricing?.totalAmount || 0).toLocaleString('en-IN')}</td>
                                                                <td className="px-5 py-3 text-accent-emerald">₹{(b.pricing?.advanceAmount || 0).toLocaleString('en-IN')}</td>
                                                                <td className="px-5 py-3 text-primary-light font-semibold">₹{Math.round((b.pricing?.advanceAmount || 0) * COMMISSION_RATE).toLocaleString('en-IN')}</td>
                                                                <td className="px-5 py-3 text-text-muted text-xs">{new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                        </motion.div>
                    )}

                    {/* ============ REPORTS & ANALYTICS SECTION ============ */}
                    {activeNav === 'reports' && (
                        <motion.div className="space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            {(() => {
                                const paidBookings = adminBookings.filter(b => b.paymentStatus === 'advance-paid' || b.paymentStatus === 'fully-paid');
                                // Revenue by city
                                const cityRevenue = {};
                                paidBookings.forEach(b => {
                                    const city = b.venue?.city || 'Unknown';
                                    cityRevenue[city] = (cityRevenue[city] || 0) + (b.pricing?.totalAmount || 0);
                                });
                                const cityEntries = Object.entries(cityRevenue).sort((a, b) => b[1] - a[1]);
                                const maxCity = cityEntries[0]?.[1] || 1;

                                // Revenue by venue type
                                const typeRevenue = {};
                                paidBookings.forEach(b => {
                                    const type = b.venue?.venueType || 'other';
                                    typeRevenue[type] = (typeRevenue[type] || 0) + (b.pricing?.totalAmount || 0);
                                });
                                const typeEntries = Object.entries(typeRevenue).sort((a, b) => b[1] - a[1]);
                                const maxType = typeEntries[0]?.[1] || 1;

                                // Monthly revenue
                                const monthlyRevenue = {};
                                paidBookings.forEach(b => {
                                    const month = new Date(b.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' });
                                    monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (b.pricing?.totalAmount || 0);
                                });
                                const monthEntries = Object.entries(monthlyRevenue).sort((a, b) => new Date(b[0]) - new Date(a[0])).slice(0, 12);
                                const maxMonth = Math.max(...monthEntries.map(m => m[1]), 1);

                                // Bookings by event type
                                const eventTypeCounts = {};
                                adminBookings.forEach(b => {
                                    const t = b.eventType || 'other';
                                    eventTypeCounts[t] = (eventTypeCounts[t] || 0) + 1;
                                });
                                const eventEntries = Object.entries(eventTypeCounts).sort((a, b) => b[1] - a[1]);
                                const maxEvent = eventEntries[0]?.[1] || 1;

                                const colors = ['#6C3CE1', '#10B981', '#F59E0B', '#3B82F6', '#EC4899', '#06B6D4', '#8B5CF6', '#14B8A6'];

                                return (
                                    <>
                                        {/* Summary Cards */}
                                        <div className="grid grid-cols-4 max-lg:grid-cols-2 max-sm:grid-cols-1 gap-4">
                                            <div className="p-5 bg-bg-card border border-border-default rounded-2xl">
                                                <span className="text-text-muted text-xs">Total Bookings</span>
                                                <span className="text-2xl font-extrabold text-white block">{adminBookings.length}</span>
                                            </div>
                                            <div className="p-5 bg-bg-card border border-border-default rounded-2xl">
                                                <span className="text-text-muted text-xs">Confirmed</span>
                                                <span className="text-2xl font-extrabold text-accent-emerald block">{adminBookings.filter(b => b.status === 'confirmed' || b.status === 'completed').length}</span>
                                            </div>
                                            <div className="p-5 bg-bg-card border border-border-default rounded-2xl">
                                                <span className="text-text-muted text-xs">Cancelled</span>
                                                <span className="text-2xl font-extrabold text-accent block">{adminBookings.filter(b => b.status === 'cancelled').length}</span>
                                            </div>
                                            <div className="p-5 bg-bg-card border border-border-default rounded-2xl">
                                                <span className="text-text-muted text-xs">Avg Order Value</span>
                                                <span className="text-2xl font-extrabold text-primary-light block">₹{paidBookings.length > 0 ? Math.round(paidBookings.reduce((s, b) => s + (b.pricing?.totalAmount || 0), 0) / paidBookings.length).toLocaleString('en-IN') : '0'}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 max-lg:grid-cols-1 gap-6">
                                            {/* Revenue by City */}
                                            <div className="bg-bg-card border border-border-default rounded-2xl">
                                                <div className="p-5 border-b border-border-default"><h3 className="text-base font-semibold text-white">Revenue by City</h3></div>
                                                <div className="p-5 space-y-3">
                                                    {cityEntries.length > 0 ? cityEntries.map(([city, revenue], i) => (
                                                        <div key={city}>
                                                            <div className="flex justify-between text-sm mb-1">
                                                                <span className="text-white font-medium">{city}</span>
                                                                <span className="text-accent-emerald font-semibold">₹{revenue.toLocaleString('en-IN')}</span>
                                                            </div>
                                                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(revenue / maxCity) * 100}%`, background: colors[i % colors.length] }} />
                                                            </div>
                                                        </div>
                                                    )) : <p className="text-text-muted text-sm">No data yet</p>}
                                                </div>
                                            </div>

                                            {/* Revenue by Venue Type */}
                                            <div className="bg-bg-card border border-border-default rounded-2xl">
                                                <div className="p-5 border-b border-border-default"><h3 className="text-base font-semibold text-white">Revenue by Venue Type</h3></div>
                                                <div className="p-5 space-y-3">
                                                    {typeEntries.length > 0 ? typeEntries.map(([type, revenue], i) => (
                                                        <div key={type}>
                                                            <div className="flex justify-between text-sm mb-1">
                                                                <span className="text-white font-medium capitalize">{type.replace('-', ' ')}</span>
                                                                <span className="text-primary-light font-semibold">₹{revenue.toLocaleString('en-IN')}</span>
                                                            </div>
                                                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(revenue / maxType) * 100}%`, background: colors[(i + 2) % colors.length] }} />
                                                            </div>
                                                        </div>
                                                    )) : <p className="text-text-muted text-sm">No data yet</p>}
                                                </div>
                                            </div>

                                            {/* Monthly Revenue Trend */}
                                            <div className="bg-bg-card border border-border-default rounded-2xl">
                                                <div className="p-5 border-b border-border-default"><h3 className="text-base font-semibold text-white">Monthly Revenue Trend</h3></div>
                                                <div className="p-5">
                                                    {monthEntries.length > 0 ? (
                                                        <div className="flex items-end gap-2 h-40">
                                                            {monthEntries.reverse().map(([month, revenue], i) => (
                                                                <div key={month} className="flex-1 flex flex-col items-center justify-end">
                                                                    <span className="text-text-muted text-[9px] mb-1">₹{(revenue / 1000).toFixed(0)}K</span>
                                                                    <div className="rounded-t-md w-full min-h-[4px] transition-all duration-500" style={{ height: `${(revenue / maxMonth) * 120}px`, background: `linear-gradient(to top, ${colors[i % colors.length]}, ${colors[i % colors.length]}88)` }} />
                                                                    <span className="text-text-muted text-[8px] mt-1 whitespace-nowrap">{month.split(' ')[0]}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : <p className="text-text-muted text-sm text-center py-8">No revenue data</p>}
                                                </div>
                                            </div>

                                            {/* Bookings by Event Type */}
                                            <div className="bg-bg-card border border-border-default rounded-2xl">
                                                <div className="p-5 border-b border-border-default"><h3 className="text-base font-semibold text-white">Bookings by Event Type</h3></div>
                                                <div className="p-5 space-y-3">
                                                    {eventEntries.length > 0 ? eventEntries.map(([type, count], i) => (
                                                        <div key={type}>
                                                            <div className="flex justify-between text-sm mb-1">
                                                                <span className="text-white font-medium capitalize">{type}</span>
                                                                <span className="text-blue-400 font-semibold">{count} bookings</span>
                                                            </div>
                                                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(count / maxEvent) * 100}%`, background: colors[(i + 4) % colors.length] }} />
                                                            </div>
                                                        </div>
                                                    )) : <p className="text-text-muted text-sm">No data yet</p>}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                        </motion.div>
                    )}
                </div>
            </main>
            {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

            {/* ==================== BOOKING DETAIL MODAL ==================== */}
            <AnimatePresence>
                {selectedBooking && (
                    <motion.div
                        className="fixed inset-0 z-[100] flex items-start justify-center bg-black/70 backdrop-blur-sm overflow-y-auto py-8 px-4"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setSelectedBooking(null)}
                    >
                        <motion.div
                            className="bg-bg-secondary border border-border-default rounded-2xl w-full max-w-2xl shadow-2xl relative"
                            initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 40, scale: 0.95 }}
                            transition={{ type: 'spring', damping: 25 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-5 border-b border-border-default">
                                <div>
                                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                        <HiDocumentText className="text-blue-400" /> Booking Details
                                    </h2>
                                    <p className="text-text-muted text-xs mt-0.5">ID: {selectedBooking.bookingId}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full uppercase ${selectedBooking.status === 'confirmed' || selectedBooking.status === 'completed' ? 'bg-accent-emerald/15 text-accent-emerald' : selectedBooking.status === 'pending' ? 'bg-accent-gold/15 text-accent-gold' : 'bg-accent/15 text-accent'}`}>
                                        {selectedBooking.status}
                                    </span>
                                    <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full uppercase ${selectedBooking.paymentStatus === 'advance-paid' ? 'bg-blue-500/15 text-blue-400' : selectedBooking.paymentStatus === 'refunded' ? 'bg-primary/15 text-primary-light' : 'bg-white/5 text-text-muted'}`}>
                                        {selectedBooking.paymentStatus}
                                    </span>
                                    <button onClick={() => setSelectedBooking(null)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-text-muted hover:text-white hover:bg-white/10 transition-all"><HiX /></button>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
                                {/* Customer Info */}
                                <div className="p-4 bg-white/[0.03] border border-border-default rounded-xl">
                                    <span className="text-text-muted text-xs block mb-3 uppercase tracking-wider font-medium">Customer Information</span>
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-full bg-blue-500/15 text-blue-400 flex items-center justify-center font-bold text-lg">
                                            {selectedBooking.user?.name?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <p className="text-white font-semibold">{selectedBooking.user?.name || 'Unknown'}</p>
                                            <div className="flex items-center gap-3 text-text-muted text-xs mt-0.5">
                                                <span className="flex items-center gap-1"><HiMail className="text-sm" /> {selectedBooking.user?.email}</span>
                                                {selectedBooking.user?.mobile && <span className="flex items-center gap-1"><HiPhone className="text-sm" /> {selectedBooking.user.mobile}</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Event & Venue Info */}
                                <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-4">
                                    <div className="p-4 bg-white/[0.03] border border-border-default rounded-xl">
                                        <span className="text-text-muted text-xs block mb-1">Venue</span>
                                        <span className="text-white font-medium">{selectedBooking.venue?.name}</span>
                                        <p className="text-text-muted text-xs mt-0.5">{selectedBooking.venue?.area}, {selectedBooking.venue?.city}</p>
                                    </div>
                                    <div className="p-4 bg-white/[0.03] border border-border-default rounded-xl">
                                        <span className="text-text-muted text-xs block mb-1">Event Type</span>
                                        <span className="text-white font-medium capitalize">{selectedBooking.eventType}</span>
                                    </div>
                                    <div className="p-4 bg-white/[0.03] border border-border-default rounded-xl">
                                        <span className="text-text-muted text-xs block mb-1">Event Date</span>
                                        <span className="text-white font-medium flex items-center gap-1.5">
                                            <HiCalendar className="text-blue-400" />
                                            {new Date(selectedBooking.eventDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                        </span>
                                        {selectedBooking.eventTime?.start && (
                                            <p className="text-text-muted text-xs mt-0.5 flex items-center gap-1"><HiClock className="text-sm" /> {selectedBooking.eventTime.start} - {selectedBooking.eventTime.end}</p>
                                        )}
                                    </div>
                                    <div className="p-4 bg-white/[0.03] border border-border-default rounded-xl">
                                        <span className="text-text-muted text-xs block mb-1">Guest Count</span>
                                        <span className="text-white font-medium flex items-center gap-1.5">
                                            <HiUserGroup className="text-blue-400" /> {selectedBooking.guestCount} guests
                                        </span>
                                    </div>
                                </div>

                                {/* Package Selected */}
                                {selectedBooking.packageSelected?.name && (
                                    <div className="p-4 bg-white/[0.03] border border-border-default rounded-xl">
                                        <span className="text-text-muted text-xs block mb-2 uppercase tracking-wider font-medium">Package Selected</span>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-white font-semibold">{selectedBooking.packageSelected.name}</span>
                                            <span className="text-accent-emerald font-bold">₹{selectedBooking.packageSelected.price?.toLocaleString('en-IN')}</span>
                                        </div>
                                        {selectedBooking.packageSelected.includes?.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                {selectedBooking.packageSelected.includes.map((item, i) => (
                                                    <span key={i} className="px-2 py-0.5 bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/15 rounded-full text-[10px] flex items-center gap-1"><HiCheck className="text-[10px]" /> {item}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Add-ons */}
                                {selectedBooking.addOns?.length > 0 && (
                                    <div className="p-4 bg-white/[0.03] border border-border-default rounded-xl">
                                        <span className="text-text-muted text-xs block mb-2 uppercase tracking-wider font-medium">Add-ons</span>
                                        <div className="space-y-1.5">
                                            {selectedBooking.addOns.map((addon, i) => (
                                                <div key={i} className="flex items-center justify-between text-sm">
                                                    <span className="text-text-secondary">{addon.name}</span>
                                                    <span className="text-white font-medium">₹{addon.price?.toLocaleString('en-IN')}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Pricing Breakdown */}
                                <div className="p-4 bg-gradient-to-br from-blue-500/5 to-primary/5 border border-blue-500/15 rounded-xl">
                                    <span className="text-text-muted text-xs block mb-3 uppercase tracking-wider font-medium">Pricing Breakdown</span>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-text-secondary">Base Price</span>
                                            <span className="text-white">₹{selectedBooking.pricing?.basePrice?.toLocaleString('en-IN')}</span>
                                        </div>
                                        {selectedBooking.pricing?.addOnsTotal > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-text-secondary">Add-ons</span>
                                                <span className="text-white">₹{selectedBooking.pricing.addOnsTotal.toLocaleString('en-IN')}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-sm">
                                            <span className="text-text-secondary">Tax (18% GST)</span>
                                            <span className="text-white">₹{selectedBooking.pricing?.tax?.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="border-t border-border-default my-2" />
                                        <div className="flex justify-between text-base font-bold">
                                            <span className="text-white">Total Amount</span>
                                            <span className="text-accent-emerald">₹{selectedBooking.pricing?.totalAmount?.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="flex justify-between text-sm mt-1">
                                            <span className="text-text-secondary">Advance (20%)</span>
                                            <span className="text-blue-400 font-medium">₹{selectedBooking.pricing?.advanceAmount?.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-text-secondary">Remaining</span>
                                            <span className="text-accent-gold font-medium">₹{selectedBooking.pricing?.remainingAmount?.toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Special Notes */}
                                {selectedBooking.specialNotes && (
                                    <div className="p-4 bg-white/[0.03] border border-border-default rounded-xl">
                                        <span className="text-text-muted text-xs block mb-2 uppercase tracking-wider font-medium">Special Notes</span>
                                        <p className="text-text-secondary text-sm leading-relaxed">{selectedBooking.specialNotes}</p>
                                    </div>
                                )}

                                {/* Booking Timeline */}
                                <div className="p-4 bg-white/[0.03] border border-border-default rounded-xl">
                                    <span className="text-text-muted text-xs block mb-2 uppercase tracking-wider font-medium">Booking Info</span>
                                    <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-3 text-sm">
                                        <div>
                                            <span className="text-text-muted text-xs">Booked On</span>
                                            <p className="text-white">{new Date(selectedBooking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                        {selectedBooking.razorpayPaymentId && (
                                            <div>
                                                <span className="text-text-muted text-xs">Payment ID</span>
                                                <p className="text-white text-xs font-mono">{selectedBooking.razorpayPaymentId}</p>
                                            </div>
                                        )}
                                        {selectedBooking.razorpayRefundId && (
                                            <div>
                                                <span className="text-text-muted text-xs">Refund ID</span>
                                                <p className="text-white text-xs font-mono">{selectedBooking.razorpayRefundId}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer — Actions */}
                            {(selectedBooking.status === 'pending' || selectedBooking.status === 'confirmed') && (
                                <div className="flex items-center justify-end gap-2 p-5 border-t border-border-default bg-white/[0.01] rounded-b-2xl">
                                    {selectedBooking.status === 'pending' && (
                                        <button onClick={() => { adminUpdateBooking(selectedBooking._id, 'confirmed'); setSelectedBooking(prev => ({ ...prev, status: 'confirmed' })); }} className="flex items-center gap-1.5 px-5 py-2.5 bg-accent-emerald text-white rounded-xl text-sm font-semibold hover:brightness-110 transition-all shadow-lg shadow-accent-emerald/25">
                                            <HiCheck /> Confirm Booking
                                        </button>
                                    )}
                                    {selectedBooking.status === 'confirmed' && (
                                        <button onClick={() => { adminUpdateBooking(selectedBooking._id, 'completed'); setSelectedBooking(prev => ({ ...prev, status: 'completed' })); }} className="flex items-center gap-1.5 px-5 py-2.5 bg-accent-emerald text-white rounded-xl text-sm font-semibold hover:brightness-110 transition-all shadow-lg shadow-accent-emerald/25">
                                            <HiCheck /> Mark Completed
                                        </button>
                                    )}
                                    <button onClick={() => { if (window.confirm('Cancel this booking?' + (selectedBooking.paymentStatus === 'advance-paid' ? ' Refund will be initiated.' : ''))) { adminUpdateBooking(selectedBooking._id, 'cancelled'); setSelectedBooking(prev => ({ ...prev, status: 'cancelled' })); } }} className="flex items-center gap-1.5 px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:brightness-110 transition-all shadow-lg shadow-accent/25">
                                        <HiXCircle /> Cancel{selectedBooking.paymentStatus === 'advance-paid' ? ' & Refund' : ''}
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ==================== VENUE DETAIL MODAL ==================== */}
            <AnimatePresence>
                {(selectedVenue || venueDetailLoading) && (
                    <motion.div
                        className="fixed inset-0 z-[100] flex items-start justify-center bg-black/70 backdrop-blur-sm overflow-y-auto py-8 px-4"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={closeVenueDetail}
                    >
                        <motion.div
                            className="bg-bg-secondary border border-border-default rounded-2xl w-full max-w-4xl shadow-2xl relative"
                            initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 40, scale: 0.95 }}
                            transition={{ type: 'spring', damping: 25 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {venueDetailLoading ? (
                                <div className="flex items-center justify-center py-32">
                                    <div className="w-10 h-10 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : selectedVenue && (
                                <>
                                    {/* Modal Header */}
                                    <div className="flex items-center justify-between p-5 border-b border-border-default">
                                        <div>
                                            <h2 className="text-xl font-bold text-white">{selectedVenue.name}</h2>
                                            <p className="text-text-muted text-sm flex items-center gap-1 mt-0.5">
                                                <HiLocationMarker className="text-primary-light" /> {selectedVenue.area}, {selectedVenue.city}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {/* Status Badges */}
                                            <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${selectedVenue.isApproved ? 'bg-accent-emerald/15 text-accent-emerald' : 'bg-accent-gold/15 text-accent-gold'}`}>
                                                {selectedVenue.isApproved ? '✓ Approved' : '⏳ Pending'}
                                            </span>
                                            {selectedVenue.isApproved && (
                                                <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${selectedVenue.isActive ? 'bg-blue-500/15 text-blue-400' : 'bg-red-500/15 text-red-400'}`}>
                                                    {selectedVenue.isActive ? '● Active' : '■ Stopped'}
                                                </span>
                                            )}
                                            {selectedVenue.featured && (
                                                <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-accent-gold/15 text-accent-gold">
                                                    ⭐ Featured
                                                </span>
                                            )}
                                            <button onClick={closeVenueDetail} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-text-muted hover:text-white hover:bg-white/10 transition-all"><HiX /></button>
                                        </div>
                                    </div>

                                    {/* Image Carousel */}
                                    {selectedVenue.images?.length > 0 && (
                                        <div className="relative h-72 bg-black/40 overflow-hidden">
                                            <img src={selectedVenue.images[currentImage]?.url} alt={selectedVenue.name} className="w-full h-full object-cover" />
                                            {selectedVenue.images.length > 1 && (
                                                <>
                                                    <button onClick={() => setCurrentImage(p => p === 0 ? selectedVenue.images.length - 1 : p - 1)} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-black/60 text-white rounded-full hover:bg-black/80 transition-all"><HiChevronLeft /></button>
                                                    <button onClick={() => setCurrentImage(p => p === selectedVenue.images.length - 1 ? 0 : p + 1)} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-black/60 text-white rounded-full hover:bg-black/80 transition-all"><HiChevronRight /></button>
                                                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                                                        {selectedVenue.images.map((_, i) => (
                                                            <button key={i} onClick={() => setCurrentImage(i)} className={`w-2 h-2 rounded-full transition-all ${currentImage === i ? 'bg-white scale-125' : 'bg-white/40'}`} />
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                            <div className="absolute top-3 right-3 px-3 py-1 bg-black/60 text-white text-[11px] rounded-full font-medium">{currentImage + 1} / {selectedVenue.images.length}</div>
                                        </div>
                                    )}

                                    {/* Detail Tabs */}
                                    <div className="flex gap-1 px-5 pt-4 border-b border-border-default overflow-x-auto">
                                        {['overview', 'amenities',
                                            ...(selectedVenue.packages?.length > 0 ? ['packages'] : []),
                                            ...(selectedVenue.foodMenu?.length > 0 ? ['menu'] : [])
                                        ].map(tab => (
                                            <button key={tab} onClick={() => setDetailTab(tab)} className={`px-4 py-2.5 text-sm font-medium capitalize whitespace-nowrap border-b-2 transition-all ${detailTab === tab ? 'border-blue-400 text-blue-400' : 'border-transparent text-text-muted hover:text-white'}`}>
                                                {tab}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Tab Content */}
                                    <div className="p-5 max-h-[400px] overflow-y-auto">
                                        {/* Overview Tab */}
                                        {detailTab === 'overview' && (
                                            <div className="space-y-5">
                                                <p className="text-text-secondary text-sm leading-relaxed">{selectedVenue.description}</p>

                                                <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-4">
                                                    <div className="p-4 bg-white/[0.03] border border-border-default rounded-xl">
                                                        <span className="text-text-muted text-xs block mb-1">Venue Type</span>
                                                        <span className="text-white font-medium capitalize">{selectedVenue.venueType?.replace('-', ' ')}</span>
                                                    </div>
                                                    <div className="p-4 bg-white/[0.03] border border-border-default rounded-xl">
                                                        <span className="text-text-muted text-xs block mb-1">Full Address</span>
                                                        <span className="text-white font-medium text-sm">{selectedVenue.address}</span>
                                                    </div>
                                                    <div className="p-4 bg-white/[0.03] border border-border-default rounded-xl">
                                                        <span className="text-text-muted text-xs block mb-1">Capacity</span>
                                                        <span className="text-white font-medium flex items-center gap-1"><HiUserGroup className="text-blue-400" /> {selectedVenue.capacity?.min} - {selectedVenue.capacity?.max} guests</span>
                                                    </div>
                                                    <div className="p-4 bg-white/[0.03] border border-border-default rounded-xl">
                                                        <span className="text-text-muted text-xs block mb-1">Starting Price</span>
                                                        <span className="text-white font-bold text-lg">₹{selectedVenue.startingPrice?.toLocaleString('en-IN')}</span>
                                                        {selectedVenue.pricePerPlate > 0 && <span className="text-text-muted text-xs block">+ ₹{selectedVenue.pricePerPlate}/plate</span>}
                                                    </div>
                                                </div>

                                                {selectedVenue.occasions?.length > 0 && (
                                                    <div>
                                                        <span className="text-text-muted text-xs block mb-2">Suitable Occasions</span>
                                                        <div className="flex flex-wrap gap-2">
                                                            {selectedVenue.occasions.map(o => (
                                                                <span key={o} className="px-3 py-1 bg-primary/10 text-primary-light border border-primary/20 rounded-full text-xs capitalize">{o}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Vendor Info */}
                                                <div className="p-4 bg-white/[0.03] border border-border-default rounded-xl">
                                                    <span className="text-text-muted text-xs block mb-2">Vendor Information</span>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-primary/15 text-primary-light flex items-center justify-center font-bold">{selectedVenue.owner?.name?.[0]?.toUpperCase()}</div>
                                                        <div>
                                                            <p className="text-white font-medium">{selectedVenue.owner?.name}</p>
                                                            <p className="text-text-muted text-xs">{selectedVenue.owner?.email} {selectedVenue.owner?.mobile ? `• ${selectedVenue.owner.mobile}` : ''}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Rating */}
                                                <div className="flex items-center gap-3">
                                                    <HiStar className="text-accent-gold text-lg" />
                                                    <span className="text-white font-medium">{selectedVenue.rating?.average?.toFixed(1) || '0.0'}</span>
                                                    <span className="text-text-muted text-sm">({selectedVenue.rating?.count || 0} reviews)</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Amenities Tab */}
                                        {detailTab === 'amenities' && (
                                            <div className="grid grid-cols-3 max-sm:grid-cols-2 gap-3">
                                                {selectedVenue.amenities && Object.entries(selectedVenue.amenities).map(([key, value]) => {
                                                    if (key === 'rooms' || key === 'parkingCapacity' || key === '_id') return null;
                                                    return (
                                                        <div key={key} className={`flex items-center gap-2 p-3 rounded-xl border text-sm ${value ? 'bg-accent-emerald/5 border-accent-emerald/15 text-accent-emerald' : 'bg-white/[0.02] border-border-default text-text-muted'}`}>
                                                            <span>{amenityLabels[key] || key}</span>
                                                            <span className="ml-auto">{value ? '✓' : '✗'}</span>
                                                        </div>
                                                    );
                                                })}
                                                {selectedVenue.amenities?.rooms > 0 && (
                                                    <div className="flex items-center gap-2 p-3 rounded-xl border bg-blue-500/5 border-blue-500/15 text-blue-400 text-sm">
                                                        🏨 Rooms: {selectedVenue.amenities.rooms}
                                                    </div>
                                                )}
                                                {selectedVenue.amenities?.parkingCapacity > 0 && (
                                                    <div className="flex items-center gap-2 p-3 rounded-xl border bg-blue-500/5 border-blue-500/15 text-blue-400 text-sm">
                                                        🅿️ Parking: {selectedVenue.amenities.parkingCapacity} vehicles
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Packages Tab */}
                                        {detailTab === 'packages' && (
                                            <div className="grid gap-4">
                                                {selectedVenue.packages?.map((pkg, i) => (
                                                    <div key={i} className="p-4 bg-white/[0.03] border border-border-default rounded-xl">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <h4 className="text-white font-semibold">{pkg.name}</h4>
                                                            <span className="text-accent-emerald font-bold text-lg">₹{pkg.price?.toLocaleString('en-IN')}</span>
                                                        </div>
                                                        {pkg.description && <p className="text-text-muted text-sm mb-3">{pkg.description}</p>}
                                                        {pkg.includes?.length > 0 && (
                                                            <div className="flex flex-wrap gap-2">
                                                                {pkg.includes.map((item, j) => (
                                                                    <span key={j} className="px-2.5 py-1 bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/15 rounded-full text-[11px] flex items-center gap-1">
                                                                        <HiCheck className="text-xs" /> {item}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Menu Tab */}
                                        {detailTab === 'menu' && (
                                            <div className="space-y-5">
                                                {selectedVenue.foodMenu?.map((cat, i) => (
                                                    <div key={i}>
                                                        <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-primary-light"></span>
                                                            {cat.category}
                                                        </h4>
                                                        <div className="grid gap-2 pl-4 border-l-2 border-border-default">
                                                            {cat.items?.map((item, j) => (
                                                                <div key={j} className="flex items-center justify-between p-2.5 bg-white/[0.02] rounded-lg">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className={`w-3 h-3 rounded-sm border ${item.isVeg ? 'border-green-500' : 'border-red-500'}`}>
                                                                            <span className={`block w-1.5 h-1.5 rounded-full m-[2px] ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                                        </span>
                                                                        <span className="text-white text-sm">{item.name}</span>
                                                                    </div>
                                                                    {item.price > 0 && <span className="text-text-muted text-sm font-medium">₹{item.price}</span>}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center justify-between gap-3 p-5 border-t border-border-default bg-white/[0.01] rounded-b-2xl">
                                        <div className="text-text-muted text-xs">
                                            Created: {new Date(selectedVenue.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </div>
                                        <div className="flex gap-2">
                                            {/* Show Approve/Reject for pending venues */}
                                            {!selectedVenue.isApproved && (
                                                <>
                                                    <button onClick={() => handleVenueStatus(selectedVenue._id, true)} className="flex items-center gap-1.5 px-5 py-2.5 bg-accent-emerald text-white rounded-xl text-sm font-semibold hover:brightness-110 transition-all shadow-lg shadow-accent-emerald/25">
                                                        <HiCheck /> Approve Venue
                                                    </button>
                                                    <button onClick={() => handleVenueStatus(selectedVenue._id, false)} className="flex items-center gap-1.5 px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:brightness-110 transition-all shadow-lg shadow-accent/25">
                                                        <HiXCircle /> Reject
                                                    </button>
                                                </>
                                            )}
                                            {/* Show Stop/Activate and Featured toggle for approved venues */}
                                            {selectedVenue.isApproved && (
                                                <>
                                                    <button onClick={() => handleToggleFeatured(selectedVenue._id)} className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg ${selectedVenue.featured
                                                        ? 'bg-accent-gold text-black shadow-accent-gold/25 hover:brightness-110'
                                                        : 'bg-white/10 text-white shadow-white/5 hover:bg-white/20'}`}>
                                                        <HiStar /> {selectedVenue.featured ? 'Remove from Featured' : 'Mark as Featured'}
                                                    </button>
                                                    <button onClick={() => handleToggleActive(selectedVenue._id)} className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg ${selectedVenue.isActive
                                                        ? 'bg-red-500 text-white shadow-red-500/25 hover:brightness-110'
                                                        : 'bg-accent-emerald text-white shadow-accent-emerald/25 hover:brightness-110'}`}>
                                                        {selectedVenue.isActive ? <><HiBan /> Stop Venue</> : <><HiPlay /> Activate Venue</>}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
