import { motion, AnimatePresence } from 'framer-motion';
import { HiX, HiCheck, HiXCircle, HiDocumentText, HiCalendar, HiClock, HiUserGroup, HiMail, HiPhone } from 'react-icons/hi';

export default function BookingDetailModal({ booking, statusCls, onClose, onAccept, onComplete, onCancel }) {
    if (!booking) return null;
    return (
        <AnimatePresence>
            <motion.div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/70 backdrop-blur-sm overflow-y-auto py-8 px-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
                <motion.div className="bg-bg-secondary border border-border-default rounded-2xl w-full max-w-2xl shadow-2xl relative" initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 40, scale: 0.95 }} transition={{ type: 'spring', damping: 25 }} onClick={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <div className="flex items-center justify-between p-5 border-b border-border-default">
                        <div>
                            <h2 className="text-lg font-bold text-white flex items-center gap-2"><HiDocumentText className="text-accent-emerald" /> Booking Details</h2>
                            <p className="text-text-muted text-xs mt-0.5">ID: {booking.bookingId}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full uppercase ${statusCls(booking.status)}`}>{booking.status}</span>
                            <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full uppercase ${booking.paymentStatus === 'advance-paid' ? 'bg-blue-500/15 text-blue-400' : booking.paymentStatus === 'refunded' ? 'bg-primary/15 text-primary-light' : 'bg-white/5 text-text-muted'}`}>{booking.paymentStatus}</span>
                            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-text-muted hover:text-white hover:bg-white/10 transition-all"><HiX /></button>
                        </div>
                    </div>
                    {/* Body */}
                    <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
                        <div className="p-4 bg-white/[0.03] border border-border-default rounded-xl">
                            <span className="text-text-muted text-xs block mb-3 uppercase tracking-wider font-medium">Customer Information</span>
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-full bg-accent-emerald/15 text-accent-emerald flex items-center justify-center font-bold text-lg">{booking.user?.name?.[0]?.toUpperCase() || 'U'}</div>
                                <div>
                                    <p className="text-white font-semibold">{booking.user?.name || 'Unknown'}</p>
                                    <div className="flex items-center gap-3 text-text-muted text-xs mt-0.5">
                                        <span className="flex items-center gap-1"><HiMail className="text-sm" /> {booking.user?.email}</span>
                                        {booking.user?.mobile && <span className="flex items-center gap-1"><HiPhone className="text-sm" /> {booking.user.mobile}</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-4">
                            <div className="p-4 bg-white/[0.03] border border-border-default rounded-xl"><span className="text-text-muted text-xs block mb-1">Venue</span><span className="text-white font-medium">{booking.venue?.name}</span><p className="text-text-muted text-xs mt-0.5">{booking.venue?.area}, {booking.venue?.city}</p></div>
                            <div className="p-4 bg-white/[0.03] border border-border-default rounded-xl"><span className="text-text-muted text-xs block mb-1">Event Type</span><span className="text-white font-medium capitalize">{booking.eventType}</span></div>
                            <div className="p-4 bg-white/[0.03] border border-border-default rounded-xl"><span className="text-text-muted text-xs block mb-1">Event Date</span><span className="text-white font-medium flex items-center gap-1.5"><HiCalendar className="text-accent-emerald" />{new Date(booking.eventDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>{booking.eventTime?.start && (<p className="text-text-muted text-xs mt-0.5 flex items-center gap-1"><HiClock className="text-sm" /> {booking.eventTime.start} - {booking.eventTime.end}</p>)}</div>
                            <div className="p-4 bg-white/[0.03] border border-border-default rounded-xl"><span className="text-text-muted text-xs block mb-1">Guest Count</span><span className="text-white font-medium flex items-center gap-1.5"><HiUserGroup className="text-accent-emerald" /> {booking.guestCount} guests</span></div>
                        </div>
                        {booking.packageSelected?.name && (
                            <div className="p-4 bg-white/[0.03] border border-border-default rounded-xl">
                                <span className="text-text-muted text-xs block mb-2 uppercase tracking-wider font-medium">Package Selected</span>
                                <div className="flex items-center justify-between mb-2"><span className="text-white font-semibold">{booking.packageSelected.name}</span><span className="text-accent-emerald font-bold">₹{booking.packageSelected.price?.toLocaleString('en-IN')}</span></div>
                                {booking.packageSelected.includes?.length > 0 && (<div className="flex flex-wrap gap-1.5 mt-2">{booking.packageSelected.includes.map((item, i) => (<span key={i} className="px-2 py-0.5 bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/15 rounded-full text-[10px] flex items-center gap-1"><HiCheck className="text-[10px]" /> {item}</span>))}</div>)}
                            </div>
                        )}
                        {booking.addOns?.length > 0 && (
                            <div className="p-4 bg-white/[0.03] border border-border-default rounded-xl">
                                <span className="text-text-muted text-xs block mb-2 uppercase tracking-wider font-medium">Add-ons</span>
                                <div className="space-y-1.5">{booking.addOns.map((addon, i) => (<div key={i} className="flex items-center justify-between text-sm"><span className="text-text-secondary">{addon.name}</span><span className="text-white font-medium">₹{addon.price?.toLocaleString('en-IN')}</span></div>))}</div>
                            </div>
                        )}
                        <div className="p-4 bg-gradient-to-br from-accent-emerald/5 to-teal-500/5 border border-accent-emerald/15 rounded-xl">
                            <span className="text-text-muted text-xs block mb-3 uppercase tracking-wider font-medium">Pricing Breakdown</span>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm"><span className="text-text-secondary">Base Price</span><span className="text-white">₹{booking.pricing?.basePrice?.toLocaleString('en-IN')}</span></div>
                                {booking.pricing?.addOnsTotal > 0 && <div className="flex justify-between text-sm"><span className="text-text-secondary">Add-ons</span><span className="text-white">₹{booking.pricing.addOnsTotal.toLocaleString('en-IN')}</span></div>}
                                <div className="flex justify-between text-sm"><span className="text-text-secondary">Tax (18% GST)</span><span className="text-white">₹{booking.pricing?.tax?.toLocaleString('en-IN')}</span></div>
                                <div className="border-t border-border-default my-2" />
                                <div className="flex justify-between text-base font-bold"><span className="text-white">Total Amount</span><span className="text-accent-emerald">₹{booking.pricing?.totalAmount?.toLocaleString('en-IN')}</span></div>
                                <div className="flex justify-between text-sm mt-1"><span className="text-text-secondary">Advance (20%)</span><span className="text-blue-400 font-medium">₹{booking.pricing?.advanceAmount?.toLocaleString('en-IN')}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-text-secondary">Remaining</span><span className="text-accent-gold font-medium">₹{booking.pricing?.remainingAmount?.toLocaleString('en-IN')}</span></div>
                            </div>
                        </div>
                        {booking.specialNotes && (<div className="p-4 bg-white/[0.03] border border-border-default rounded-xl"><span className="text-text-muted text-xs block mb-2 uppercase tracking-wider font-medium">Special Notes</span><p className="text-text-secondary text-sm leading-relaxed">{booking.specialNotes}</p></div>)}
                        <div className="p-4 bg-white/[0.03] border border-border-default rounded-xl">
                            <span className="text-text-muted text-xs block mb-2 uppercase tracking-wider font-medium">Booking Info</span>
                            <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-3 text-sm">
                                <div><span className="text-text-muted text-xs">Booked On</span><p className="text-white">{new Date(booking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p></div>
                                {booking.razorpayPaymentId && (<div><span className="text-text-muted text-xs">Payment ID</span><p className="text-white text-xs font-mono">{booking.razorpayPaymentId}</p></div>)}
                            </div>
                        </div>
                    </div>
                    {/* Footer */}
                    {(booking.status === 'pending' || booking.status === 'confirmed') && (
                        <div className="flex items-center justify-end gap-2 p-5 border-t border-border-default bg-white/[0.01] rounded-b-2xl">
                            {booking.status === 'pending' && (<><button onClick={onAccept} className="flex items-center gap-1.5 px-5 py-2.5 bg-accent-emerald text-white rounded-xl text-sm font-semibold hover:brightness-110 transition-all shadow-lg shadow-accent-emerald/25"><HiCheck /> Accept Booking</button><button onClick={() => onCancel(booking._id, booking.user?.name || booking.bookingId)} className="flex items-center gap-1.5 px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:brightness-110 transition-all shadow-lg shadow-accent/25"><HiXCircle /> Decline</button></>)}
                            {booking.status === 'confirmed' && (<><button onClick={onComplete} className="flex items-center gap-1.5 px-5 py-2.5 bg-accent-emerald text-white rounded-xl text-sm font-semibold hover:brightness-110 transition-all shadow-lg shadow-accent-emerald/25"><HiCheck /> Mark Completed</button><button onClick={() => onCancel(booking._id, booking.user?.name || booking.bookingId)} className="flex items-center gap-1.5 px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:brightness-110 transition-all shadow-lg shadow-accent/25"><HiXCircle /> Cancel</button></>)}
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
