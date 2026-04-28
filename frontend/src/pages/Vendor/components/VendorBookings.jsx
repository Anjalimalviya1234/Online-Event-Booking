import { motion } from 'framer-motion';
import { HiEye, HiCheck, HiXCircle } from 'react-icons/hi';

export default function VendorBookings({ bookings, activeNav, statusCls, onViewDetails, onAccept, onComplete, onCancel }) {
    return (
        <motion.div className="bg-bg-card border border-border-default rounded-2xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div className="flex items-center justify-between p-5 border-b border-border-default">
                <h2 className="text-lg font-semibold text-white">{activeNav === 'bookings' ? 'All Bookings' : 'Recent Bookings'}</h2>
                <span className="w-7 h-7 flex items-center justify-center bg-primary/15 text-primary-light text-xs font-bold rounded-full">{bookings.length}</span>
            </div>
            <div className={`p-5 space-y-4 overflow-y-auto ${activeNav === 'dashboard' ? 'max-h-[500px]' : ''}`}>
                {bookings.length > 0 ? bookings.map(b => (
                    <div key={b._id} className="p-4 bg-white/[0.02] border border-border-default rounded-xl">
                        <div className="flex justify-between gap-3 mb-2 max-sm:flex-col">
                            <div>
                                <h4 className="text-sm font-semibold text-white">{b.user?.name}</h4>
                                <p className="text-text-muted text-xs mt-0.5 capitalize">{b.eventType} • {b.venue?.name}</p>
                                <p className="text-text-muted text-[0.7rem] mt-1">📅 {new Date(b.eventDate).toLocaleDateString()} • 👥 {b.guestCount} guests • 🆔 {b.bookingId}</p>
                            </div>
                            <div className="text-right max-sm:text-left">
                                <span className="block text-base font-bold text-white">₹{b.pricing?.totalAmount?.toLocaleString('en-IN')}</span>
                                <div className="flex items-center gap-1.5 mt-1 max-sm:justify-start justify-end">
                                    <span className={`inline-block px-2 py-0.5 text-[0.6rem] font-bold rounded-full uppercase tracking-wider border capitalize ${statusCls(b.status)}`}>{b.status}</span>
                                    <span className={`inline-block px-2 py-0.5 text-[0.6rem] font-bold rounded-full uppercase tracking-wider border ${b.paymentStatus === 'advance-paid' ? 'bg-blue-500/15 text-blue-400 border-blue-500/20' : b.paymentStatus === 'refunded' ? 'bg-primary/15 text-primary-light border-primary/20' : 'bg-white/5 text-text-muted border-border-default'}`}>{b.paymentStatus}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-3 pt-3 border-t border-border-default flex-wrap">
                            <button onClick={() => onViewDetails(b)} className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 text-xs font-semibold hover:bg-blue-500/20 transition-all duration-300"><HiEye /> View Details</button>
                            {b.status === 'pending' && (
                                <>
                                    <button onClick={() => onAccept(b._id)} className="flex items-center gap-1 px-3 py-1.5 bg-accent-emerald/10 border border-accent-emerald/20 rounded-lg text-accent-emerald text-xs font-semibold hover:bg-accent-emerald/20 transition-all duration-300"><HiCheck /> Accept</button>
                                    <button onClick={() => onCancel(b._id, b.user?.name || b.bookingId)} className="flex items-center gap-1 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-lg text-accent text-xs font-semibold hover:bg-accent/20 transition-all duration-300"><HiXCircle /> Decline</button>
                                </>
                            )}
                            {b.status === 'confirmed' && (
                                <>
                                    <button onClick={() => onComplete(b._id)} className="flex items-center gap-1 px-3 py-1.5 bg-accent-emerald/10 border border-accent-emerald/20 rounded-lg text-accent-emerald text-xs font-semibold hover:bg-accent-emerald/20 transition-all duration-300"><HiCheck /> Mark Completed</button>
                                    <button onClick={() => onCancel(b._id, b.user?.name || b.bookingId)} className="flex items-center gap-1 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-lg text-accent text-xs font-semibold hover:bg-accent/20 transition-all duration-300"><HiXCircle /> Cancel</button>
                                </>
                            )}
                        </div>
                    </div>
                )) : <p className="text-text-muted text-center py-4">No bookings received yet.</p>}
            </div>
        </motion.div>
    );
}
