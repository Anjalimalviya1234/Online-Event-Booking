import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import useAuth from '../../hooks/useAuth';
import { useMyVenues, useVendorReviews } from '../../hooks/useVenues';
import { useVendorBookings } from '../../hooks/useBookings';
import {
    HiHome, HiOfficeBuilding, HiCalendar, HiCurrencyRupee,
    HiChatAlt2, HiCog, HiLogout, HiPlus, HiMenu,
    HiCheck, HiClock, HiXCircle, HiClipboardList, HiTag
} from 'react-icons/hi';

// Components
import VendorSidebar from './components/VendorSidebar';
import VendorStatsGrid from './components/VendorStatsGrid';
import VendorVenues from './components/VendorVenues';
import VendorBookings from './components/VendorBookings';
import VendorEarnings from './components/VendorEarnings';
import VendorReviews from './components/VendorReviews';
import VendorOffers from './components/VendorOffers';
import VendorEnquiries from './components/VendorEnquiries';
import VendorSettings from './components/VendorSettings';
import BookingDetailModal from './components/BookingDetailModal';
import CancelBookingModal from './components/CancelBookingModal';

const navItems = [
    { icon: <HiHome />, label: 'Dashboard', id: 'dashboard' },
    { icon: <HiOfficeBuilding />, label: 'My Venues', id: 'venues' },
    { icon: <HiCalendar />, label: 'Bookings', id: 'bookings' },
    { icon: <HiCurrencyRupee />, label: 'Earnings', id: 'earnings' },
    { icon: <HiTag />, label: 'Offers', id: 'offers' },
    { icon: <HiChatAlt2 />, label: 'Reviews', id: 'reviews' },
    { icon: <HiClipboardList />, label: 'Enquiries', id: 'enquiries' },
    { icon: <HiCog />, label: 'Settings', id: 'settings' },
];

export default function VendorDashboard() {
    const navigate = useNavigate();
    const { user: vendorUser, loading: authLoading, logout, updateProfile } = useAuth();
    const { venues: myVenues, loading: venuesLoading } = useMyVenues();
    const { bookings, loading: bookingsLoading, updateStatus } = useVendorBookings();
    const { reviews, loading: reviewsLoading } = useVendorReviews();

    const [activeNav, setActiveNav] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [cancelModal, setCancelModal] = useState({ open: false, bookingId: null, bookingName: '' });
    const [cancelReason, setCancelReason] = useState('');
    const [cancelLoading, setCancelLoading] = useState(false);
    const [stats, setStats] = useState([
        { label: 'Total Bookings', value: '0', icon: <HiCalendar />, change: '', color: '#10B981' },
        { label: 'Revenue', value: '₹0', icon: <HiCurrencyRupee />, change: '', color: '#8B5CF6' },
        { label: 'Total Venues', value: '0', icon: <HiOfficeBuilding />, change: '', color: '#F5A623' },
        { label: 'Pending Requests', value: '0', icon: <HiClipboardList />, change: '', color: '#06B6D4' },
    ]);
    const [settingsForm, setSettingsForm] = useState({ name: '', mobile: '' });
    const [settingsLoading, setSettingsLoading] = useState(false);

    const loading = venuesLoading || bookingsLoading;

    // Redirect if not vendor/admin
    useEffect(() => {
        if (!authLoading && (!vendorUser || (vendorUser.role !== 'vendor' && vendorUser.role !== 'admin'))) {
            navigate('/vendor');
        }
    }, [authLoading, vendorUser, navigate]);

    useEffect(() => {
        if (vendorUser) setSettingsForm({ name: vendorUser.name || '', mobile: vendorUser.mobile || '' });
    }, [vendorUser]);

    useEffect(() => {
        if (!loading) {
            const totalBookings = bookings.length;
            const totalRevenue = bookings.reduce((sum, b) => sum + (b.pricing?.totalAmount || 0), 0);
            const pending = bookings.filter(b => b.status === 'pending').length;
            setStats([
                { label: 'Total Bookings', value: totalBookings.toString(), icon: <HiCalendar />, change: 'lifetime', color: '#10B981' },
                { label: 'Revenue', value: `₹${(totalRevenue / 100000).toFixed(2)}L`, icon: <HiCurrencyRupee />, change: 'lifetime', color: '#8B5CF6' },
                { label: 'Total Venues', value: myVenues?.length.toString() || '0', icon: <HiOfficeBuilding />, change: 'active', color: '#F5A623' },
                { label: 'Pending Requests', value: pending.toString(), icon: <HiClipboardList />, change: 'needs action', color: '#06B6D4' },
            ]);
        }
    }, [bookings, myVenues, loading]);

    const handleLogout = () => logout();

    const openCancelModal = (bookingId, bookingName) => {
        setCancelModal({ open: true, bookingId, bookingName });
        setCancelReason('');
    };

    const handleCancelWithReason = async () => {
        if (!cancelReason.trim()) { toast.error('Please enter a reason for cancellation'); return; }
        setCancelLoading(true);
        try {
            await updateStatus(cancelModal.bookingId, 'cancelled', cancelReason.trim());
            if (selectedBooking?._id === cancelModal.bookingId) setSelectedBooking(prev => prev ? ({ ...prev, status: 'cancelled' }) : null);
            setCancelModal({ open: false, bookingId: null, bookingName: '' });
            setCancelReason('');
        } catch (err) { /* handled in hook */ } finally { setCancelLoading(false); }
    };

    const handleSettingsSave = async () => {
        setSettingsLoading(true);
        try { await updateProfile(settingsForm); } catch (e) { /* handled */ } finally { setSettingsLoading(false); }
    };

    // Computed data
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'completed');
    const pendingBookings = bookings.filter(b => b.status === 'pending');
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled');
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.pricing?.totalAmount || 0), 0);
    const pendingRevenue = pendingBookings.reduce((sum, b) => sum + (b.pricing?.totalAmount || 0), 0);

    const monthlyEarnings = {};
    confirmedBookings.forEach(b => {
        const month = new Date(b.createdAt || b.eventDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' });
        monthlyEarnings[month] = (monthlyEarnings[month] || 0) + (b.pricing?.totalAmount || 0);
    });

    const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '0.0';
    const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
        star, count: reviews.filter(r => r.rating === star).length,
        percentage: reviews.length > 0 ? Math.round((reviews.filter(r => r.rating === star).length / reviews.length) * 100) : 0
    }));

    const statusCls = (s) => s === 'confirmed' || s === 'approved' || s === 'completed' ? 'bg-accent-emerald/15 text-accent-emerald border-accent-emerald/20' : s === 'pending' ? 'bg-accent-gold/15 text-accent-gold border-accent-gold/20' : 'bg-accent/15 text-accent border-accent/20';

    if (loading) return <div className="flex items-center justify-center h-screen bg-bg-primary text-white">Loading Dashboard...</div>;

    // Block dashboard if vendor not approved
    if (vendorUser?.role === 'vendor' && vendorUser?.vendorStatus !== 'approved') {
        return (
            <div className="min-h-screen flex items-center justify-center p-10 px-6 bg-bg-primary relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.12)_0%,transparent_70%)] -top-[150px] -left-[150px]" />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
                </div>
                <motion.div className="w-full max-w-lg bg-bg-card border border-border-default rounded-3xl p-10 text-center relative z-[2] shadow-[0_8px_32px_rgba(0,0,0,0.5)]" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                    {vendorUser.vendorStatus === 'rejected' ? (
                        <>
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent/15 flex items-center justify-center"><HiXCircle className="text-accent text-4xl" /></div>
                            <h2 className="font-display text-2xl font-bold text-white mb-3">Application Rejected</h2>
                            <p className="text-text-secondary text-sm mb-6 leading-relaxed max-w-sm mx-auto">Unfortunately, your vendor application was not approved. Please contact our support team for more details.</p>
                            {vendorUser.rejectionReason && (<div className="p-4 bg-accent/[0.08] border border-accent/20 rounded-xl mb-6 text-left"><p className="text-accent text-xs font-semibold mb-1">Reason:</p><p className="text-text-secondary text-sm">{vendorUser.rejectionReason}</p></div>)}
                        </>
                    ) : (
                        <>
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent-gold/15 flex items-center justify-center"><HiClock className="text-accent-gold text-4xl" /></div>
                            <h2 className="font-display text-2xl font-bold text-white mb-3">Account Under Review</h2>
                            <p className="text-text-secondary text-sm mb-6 leading-relaxed max-w-sm mx-auto">Your venue owner application is being reviewed by our team. You'll get access to the dashboard once approved.</p>
                            <div className="bg-white/[0.03] border border-border-default rounded-xl p-5 mb-6 text-left space-y-2.5">
                                <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-accent-emerald/15 flex items-center justify-center shrink-0"><HiCheck className="text-accent-emerald" /></div><span className="text-text-secondary text-sm">Account created successfully</span></div>
                                <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-accent-gold/15 flex items-center justify-center shrink-0"><HiClock className="text-accent-gold text-sm" /></div><span className="text-text-secondary text-sm">Admin verification in progress</span></div>
                                <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center shrink-0 text-text-muted text-xs">3</div><span className="text-text-muted text-sm">Dashboard access after approval</span></div>
                            </div>
                            <p className="text-text-muted text-xs mb-4">Typically takes 24-48 hours</p>
                        </>
                    )}
                    <div className="flex gap-3 justify-center">
                        <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl bg-gradient-to-r from-accent-emerald to-teal-500 text-white shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:-translate-y-0.5 transition-all duration-300">Back to Home</Link>
                        <button onClick={handleLogout} className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl bg-white/[0.06] border border-border-default text-text-secondary hover:text-white transition-all duration-300"><HiLogout /> Logout</button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-bg-primary">
            <VendorSidebar navItems={navItems} activeNav={activeNav} setActiveNav={setActiveNav} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} vendorUser={vendorUser} reviews={reviews} onLogout={handleLogout} />

            <main className="flex-1 lg:ml-[260px]">
                <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 bg-bg-primary/85 backdrop-blur-xl border-b border-border-default">
                    <div className="flex items-center gap-3">
                        <button className="lg:hidden text-white text-xl" onClick={() => setSidebarOpen(true)}><HiMenu /></button>
                        <h1 className="text-xl font-bold text-white">{navItems.find(n => n.id === activeNav)?.label || 'Dashboard'}</h1>
                    </div>
                    <Link to="/vendor/add-venue" className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent-emerald to-teal-500 text-white text-sm font-semibold rounded-xl hover:-translate-y-0.5 transition-all duration-300"><HiPlus /> Add New Venue</Link>
                </header>

                <div className="p-6 space-y-6">
                    <VendorStatsGrid stats={stats} />

                    {(activeNav === 'venues' || activeNav === 'dashboard') && <VendorVenues venues={myVenues} />}

                    {(activeNav === 'bookings' || activeNav === 'dashboard') && (
                        <VendorBookings bookings={bookings} activeNav={activeNav} statusCls={statusCls} onViewDetails={setSelectedBooking} onAccept={(id) => updateStatus(id, 'confirmed')} onComplete={(id) => updateStatus(id, 'completed')} onCancel={openCancelModal} />
                    )}

                    {activeNav === 'earnings' && (
                        <VendorEarnings confirmedBookings={confirmedBookings} pendingBookings={pendingBookings} cancelledBookings={cancelledBookings} totalRevenue={totalRevenue} pendingRevenue={pendingRevenue} monthlyEarnings={monthlyEarnings} />
                    )}

                    {activeNav === 'reviews' && <VendorReviews reviews={reviews} reviewsLoading={reviewsLoading} avgRating={avgRating} ratingDistribution={ratingDistribution} />}

                    {activeNav === 'offers' && <VendorOffers myVenues={myVenues} />}

                    {activeNav === 'enquiries' && <VendorEnquiries />}

                    {activeNav === 'settings' && (
                        <VendorSettings vendorUser={vendorUser} settingsForm={settingsForm} setSettingsForm={setSettingsForm} settingsLoading={settingsLoading} onSave={handleSettingsSave} myVenues={myVenues} />
                    )}
                </div>
            </main>

            {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

            {selectedBooking && (
                <BookingDetailModal
                    booking={selectedBooking} statusCls={statusCls} onClose={() => setSelectedBooking(null)}
                    onAccept={() => { updateStatus(selectedBooking._id, 'confirmed'); setSelectedBooking(prev => ({ ...prev, status: 'confirmed' })); }}
                    onComplete={() => { updateStatus(selectedBooking._id, 'completed'); setSelectedBooking(prev => ({ ...prev, status: 'completed' })); }}
                    onCancel={openCancelModal}
                />
            )}

            <CancelBookingModal cancelModal={cancelModal} cancelReason={cancelReason} setCancelReason={setCancelReason} cancelLoading={cancelLoading} onConfirm={handleCancelWithReason} onClose={() => setCancelModal({ open: false, bookingId: null, bookingName: '' })} />
        </div>
    );
}
