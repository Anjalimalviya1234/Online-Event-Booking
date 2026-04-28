import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useMyBookings } from '../../../hooks/useBookings';
import { HiCalendar, HiLocationMarker, HiUsers, HiCurrencyRupee, HiEye, HiClock, HiCheckCircle, HiXCircle, HiExclamationCircle, HiBan } from 'react-icons/hi';

const statusConfig = {
    pending: { color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20', icon: <HiClock />, label: 'Pending' },
    confirmed: { color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20', icon: <HiCheckCircle />, label: 'Confirmed' },
    cancelled: { color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20', icon: <HiXCircle />, label: 'Cancelled' },
    completed: { color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20', icon: <HiCheckCircle />, label: 'Completed' },
};

export default function MyBookings() {
    const { bookings, loading, cancelBooking } = useMyBookings();
    const [activeFilter, setActiveFilter] = useState('all');
    const [expandedBooking, setExpandedBooking] = useState(null);
    const [cancelling, setCancelling] = useState(null);
    const [cancelModal, setCancelModal] = useState({ open: false, bookingId: null, venueName: '' });
    const [cancelReason, setCancelReason] = useState('');

    const openCancelModal = (bookingId, venueName) => {
        setCancelModal({ open: true, bookingId, venueName });
        setCancelReason('');
    };

    const handleCancelWithReason = async () => {
        if (!cancelReason.trim()) {
            toast.error('Please enter a reason for cancellation');
            return;
        }
        setCancelling(cancelModal.bookingId);
        await cancelBooking(cancelModal.bookingId, cancelReason.trim());
        setCancelling(null);
        setCancelModal({ open: false, bookingId: null, venueName: '' });
        setCancelReason('');
    };

    const filteredBookings = activeFilter === 'all'
        ? bookings
        : bookings.filter(b => b.status === activeFilter);

    const filters = [
        { key: 'all', label: 'All Bookings', count: bookings.length },
        { key: 'pending', label: 'Pending', count: bookings.filter(b => b.status === 'pending').length },
        { key: 'confirmed', label: 'Confirmed', count: bookings.filter(b => b.status === 'confirmed').length },
        { key: 'completed', label: 'Completed', count: bookings.filter(b => b.status === 'completed').length },
        { key: 'cancelled', label: 'Cancelled', count: bookings.filter(b => b.status === 'cancelled').length },
    ];

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-bg-card border border-border-default rounded-2xl p-6 animate-pulse">
                        <div className="flex gap-4">
                            <div className="w-28 h-20 bg-white/[0.05] rounded-xl" />
                            <div className="flex-1 space-y-3">
                                <div className="h-4 bg-white/[0.05] rounded-lg w-3/4" />
                                <div className="h-3 bg-white/[0.05] rounded-lg w-1/2" />
                                <div className="h-3 bg-white/[0.05] rounded-lg w-1/3" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (<>
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            {/* Status Filter Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-1.5 scrollbar-hide">
                {filters.map(f => (
                    <button
                        key={f.key}
                        onClick={() => setActiveFilter(f.key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 border ${activeFilter === f.key
                            ? 'bg-gradient-to-r from-primary to-primary-light text-white border-transparent shadow-[0_4px_15px_rgba(108,60,225,0.3)]'
                            : 'bg-bg-card border-border-default text-text-secondary hover:text-white hover:border-border-light'
                            }`}
                    >
                        {f.label}
                        <span className={`px-1.5 py-0.5 rounded-md text-xs font-bold ${activeFilter === f.key ? 'bg-white/20' : 'bg-white/[0.06]'
                            }`}>{f.count}</span>
                    </button>
                ))}
            </div>

            {/* Bookings List */}
            {filteredBookings.length > 0 ? (
                <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {filteredBookings.map((booking, index) => {
                            const status = statusConfig[booking.status] || statusConfig.pending;
                            const isExpanded = expandedBooking === booking._id;

                            return (
                                <motion.div
                                    key={booking._id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-bg-card border border-border-default rounded-2xl overflow-hidden hover:border-border-light transition-all duration-300"
                                >
                                    <div
                                        className="p-5 cursor-pointer"
                                        onClick={() => setExpandedBooking(isExpanded ? null : booking._id)}
                                    >
                                        <div className="flex gap-4 max-md:flex-col">
                                            {/* Venue Image */}
                                            <div className="w-32 h-24 max-md:w-full max-md:h-40 rounded-xl overflow-hidden shrink-0">
                                                <img
                                                    src={booking.venue?.images?.[0]?.url || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400'}
                                                    alt={booking.venue?.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            {/* Booking Details */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-3 mb-2">
                                                    <div>
                                                        <h3 className="text-base font-semibold text-white truncate">{booking.venue?.name || 'Venue'}</h3>
                                                        <div className="flex items-center gap-1.5 text-text-muted text-xs mt-0.5">
                                                            <HiLocationMarker />
                                                            <span>{booking.venue?.area}, {booking.venue?.city}</span>
                                                        </div>
                                                    </div>
                                                    <span className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${status.bg} ${status.color} shrink-0`}>
                                                        {status.icon} {status.label}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-4 flex-wrap text-sm text-text-secondary">
                                                    <span className="flex items-center gap-1.5">
                                                        <HiCalendar className="text-primary-light" />
                                                        {new Date(booking.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <HiUsers className="text-primary-light" />
                                                        {booking.guestCount} Guests
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <HiCurrencyRupee className="text-accent-emerald" />
                                                        <span className="text-white font-semibold">₹{booking.pricing?.totalAmount?.toLocaleString('en-IN')}</span>
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-3 mt-3">
                                                    <span className="text-text-muted text-xs">Booking ID: <span className="text-text-secondary font-medium">{booking.bookingId}</span></span>
                                                    <span className="text-primary-light text-xs font-medium capitalize">{booking.eventType}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-5 pb-5 pt-2 border-t border-border-default">
                                                    <div className="grid grid-cols-2 max-md:grid-cols-1 gap-4 mb-4">
                                                        <div className="bg-white/[0.02] rounded-xl p-4">
                                                            <h4 className="text-xs font-medium text-text-muted uppercase tracking-wide mb-3">Pricing Breakdown</h4>
                                                            <div className="space-y-2 text-sm">
                                                                <div className="flex justify-between"><span className="text-text-secondary">Base Price</span><span className="text-white">₹{booking.pricing?.basePrice?.toLocaleString('en-IN')}</span></div>
                                                                <div className="flex justify-between"><span className="text-text-secondary">Add-ons</span><span className="text-white">₹{booking.pricing?.addOnsTotal?.toLocaleString('en-IN')}</span></div>
                                                                <div className="flex justify-between"><span className="text-text-secondary">Tax (GST)</span><span className="text-white">₹{booking.pricing?.tax?.toLocaleString('en-IN')}</span></div>
                                                                <div className="flex justify-between pt-2 border-t border-border-default font-semibold"><span className="text-white">Total</span><span className="text-primary-light">₹{booking.pricing?.totalAmount?.toLocaleString('en-IN')}</span></div>
                                                            </div>
                                                        </div>

                                                        <div className="bg-white/[0.02] rounded-xl p-4">
                                                            <h4 className="text-xs font-medium text-text-muted uppercase tracking-wide mb-3">Payment Info</h4>
                                                            <div className="space-y-2 text-sm">
                                                                <div className="flex justify-between"><span className="text-text-secondary">Advance Paid</span><span className="text-accent-emerald font-medium">₹{booking.pricing?.advanceAmount?.toLocaleString('en-IN')}</span></div>
                                                                <div className="flex justify-between"><span className="text-text-secondary">Remaining</span><span className="text-accent font-medium">₹{booking.pricing?.remainingAmount?.toLocaleString('en-IN')}</span></div>
                                                                <div className="flex justify-between"><span className="text-text-secondary">Payment Status</span><span className="capitalize text-white">{booking.paymentStatus?.replace('-', ' ')}</span></div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {booking.packageSelected?.name && (
                                                        <div className="bg-primary/[0.06] border border-primary/10 rounded-xl p-4 mb-4">
                                                            <span className="text-xs text-text-muted uppercase tracking-wide">Package Selected</span>
                                                            <h4 className="text-sm font-semibold text-white mt-1">{booking.packageSelected.name}</h4>
                                                            {booking.packageSelected.includes?.length > 0 && (
                                                                <div className="flex flex-wrap gap-2 mt-2">
                                                                    {booking.packageSelected.includes.map((item, i) => (
                                                                        <span key={i} className="px-2.5 py-0.5 bg-white/[0.06] rounded-md text-text-secondary text-xs">{item}</span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {booking.specialNotes && (
                                                        <div className="bg-white/[0.02] rounded-xl p-4 mb-4">
                                                            <span className="text-xs text-text-muted uppercase tracking-wide">Special Notes</span>
                                                            <p className="text-text-secondary text-sm mt-1">{booking.specialNotes}</p>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center gap-3 justify-end">
                                                        {(booking.status === 'pending' || booking.status === 'confirmed') && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); openCancelModal(booking._id, booking.venue?.name || 'Venue'); }}
                                                                disabled={cancelling === booking._id}
                                                                className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium hover:bg-red-500/20 transition-all duration-300 disabled:opacity-50"
                                                            >
                                                                <HiBan /> {cancelling === booking._id ? 'Cancelling...' : 'Cancel Booking'}
                                                            </button>
                                                        )}
                                                        <Link
                                                            to={`/venues/${booking.venue?._id}`}
                                                            className="flex items-center gap-1.5 px-4 py-2 bg-white/[0.06] border border-border-default rounded-xl text-text-secondary text-sm font-medium hover:text-white hover:border-border-light transition-all duration-300"
                                                        >
                                                            <HiEye /> View Venue
                                                        </Link>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="text-center py-20 bg-bg-card border border-border-default rounded-2xl">
                    <div className="text-5xl mb-4">📅</div>
                    <h3 className="text-xl font-bold text-white mb-2">No Bookings Yet</h3>
                    <p className="text-text-secondary text-sm mb-6 max-w-md mx-auto">
                        {activeFilter === 'all'
                            ? "You haven't booked any venues yet. Browse our collection and book your perfect event venue!"
                            : `No ${activeFilter} bookings found.`}
                    </p>
                    {activeFilter === 'all' && (
                        <Link
                            to="/venues"
                            className="inline-flex items-center gap-2 px-7 py-3 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-primary-light text-white shadow-[0_4px_15px_rgba(108,60,225,0.4)] hover:-translate-y-0.5 hover:shadow-[0_6px_25px_rgba(108,60,225,0.5)] transition-all duration-300"
                        >
                            Browse Venues
                        </Link>
                    )}
                </div>
            )}
        </motion.div>

        {/* ========= CANCEL REASON MODAL ========= */}
        <AnimatePresence>
            {cancelModal.open && (
                <motion.div
                    className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setCancelModal({ open: false, bookingId: null, venueName: '' })}
                >
                    <motion.div
                        className="bg-[#1A1A2E] border border-white/[0.08] rounded-2xl w-full max-w-md shadow-2xl"
                        initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-5 border-b border-white/[0.06]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/15 text-red-400 text-xl">
                                    <HiBan />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Cancel Booking</h3>
                                    <p className="text-white/40 text-xs">{cancelModal.venueName}</p>
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="text-xs font-medium text-white/40 mb-2 block uppercase tracking-wide">
                                    Reason for Cancellation <span className="text-red-400">*</span>
                                </label>
                                <textarea
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm outline-none focus:border-red-400/50 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)] transition-all resize-none placeholder:text-white/20"
                                    placeholder="e.g., Change of plans, Found a better venue, Date conflict..."
                                    autoFocus
                                />
                            </div>
                            <div className="p-3 bg-red-500/5 border border-red-500/15 rounded-lg">
                                <p className="text-white/50 text-xs leading-relaxed">
                                    ⚠️ This action cannot be undone. {' '}
                                    <strong className="text-white/70">If you have made a payment, a refund will be automatically initiated.</strong>
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-2 p-5 border-t border-white/[0.06]">
                            <button
                                onClick={() => setCancelModal({ open: false, bookingId: null, venueName: '' })}
                                className="px-5 py-2.5 bg-white/5 border border-white/[0.08] rounded-xl text-white/50 text-sm font-medium hover:text-white hover:bg-white/10 transition-all"
                            >
                                Go Back
                            </button>
                            <button
                                onClick={handleCancelWithReason}
                                disabled={cancelling || !cancelReason.trim()}
                                className="flex items-center gap-1.5 px-5 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-all shadow-lg shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <HiBan /> {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    </>);
}
