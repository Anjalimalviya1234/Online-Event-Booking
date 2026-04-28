import { motion, AnimatePresence } from 'framer-motion';
import { HiXCircle } from 'react-icons/hi';

export default function CancelBookingModal({ cancelModal, cancelReason, setCancelReason, cancelLoading, onConfirm, onClose }) {
    if (!cancelModal.open) return null;
    return (
        <AnimatePresence>
            <motion.div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
                <motion.div className="bg-bg-secondary border border-border-default rounded-2xl w-full max-w-md shadow-2xl" initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.95 }} transition={{ type: 'spring', damping: 25 }} onClick={(e) => e.stopPropagation()}>
                    <div className="p-5 border-b border-border-default">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-accent/15 text-accent text-xl"><HiXCircle /></div>
                            <div><h3 className="text-lg font-bold text-white">Cancel Booking</h3><p className="text-text-muted text-xs">for {cancelModal.bookingName}</p></div>
                        </div>
                    </div>
                    <div className="p-5 space-y-4">
                        <div>
                            <label className="text-xs font-medium text-text-muted mb-2 block uppercase tracking-wide">Reason for Cancellation <span className="text-accent">*</span></label>
                            <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} rows={3} className="w-full px-4 py-3 bg-white/[0.03] border border-border-default rounded-xl text-white text-sm outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(255,107,107,0.15)] transition-all resize-none placeholder:text-text-muted" placeholder="e.g., Venue unavailable on that date, Double booking, Maintenance work..." autoFocus />
                        </div>
                        <div className="p-3 bg-accent/5 border border-accent/15 rounded-lg">
                            <p className="text-text-secondary text-xs leading-relaxed">⚠️ The customer will receive an <strong className="text-white">email notification</strong> with this reason. If payment was made, a refund will be automatically initiated.</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 p-5 border-t border-border-default">
                        <button onClick={onClose} className="px-5 py-2.5 bg-white/5 border border-border-default rounded-xl text-text-secondary text-sm font-medium hover:text-white hover:bg-white/10 transition-all">Go Back</button>
                        <button onClick={onConfirm} disabled={cancelLoading || !cancelReason.trim()} className="flex items-center gap-1.5 px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:brightness-110 transition-all shadow-lg shadow-accent/25 disabled:opacity-50 disabled:cursor-not-allowed"><HiXCircle /> {cancelLoading ? 'Cancelling...' : 'Confirm Cancellation'}</button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
