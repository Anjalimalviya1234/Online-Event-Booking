import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiPlus, HiPencil, HiEye } from 'react-icons/hi';

export default function VendorVenues({ venues }) {
    return (
        <motion.div className="bg-bg-card border border-border-default rounded-2xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="flex items-center justify-between p-5 border-b border-border-default">
                <h2 className="text-lg font-semibold text-white">My Venues</h2>
                <Link to="/vendor/add-venue" className="flex items-center gap-1.5 px-4 py-2 bg-white/[0.06] border border-border-default rounded-xl text-text-secondary text-sm font-medium hover:text-white transition-all duration-300"><HiPlus /> Add Venue</Link>
            </div>
            <div className="p-5 grid gap-4">
                {venues.length > 0 ? venues.map(venue => (
                    <div key={venue._id} className="p-5 bg-white/[0.02] border border-border-default rounded-xl">
                        <div className="flex items-start justify-between mb-3 max-sm:flex-col max-sm:gap-2">
                            <div>
                                <h3 className="text-base font-semibold text-white">{venue.name}</h3>
                                <p className="text-text-muted text-xs mt-0.5">{venue.city} • {venue.area} • {venue.venueType}</p>
                            </div>
                            <span className={`px-2.5 py-0.5 text-[0.65rem] font-bold rounded-full uppercase tracking-wider border capitalize ${venue.isApproved ? 'bg-accent-emerald/15 text-accent-emerald border-accent-emerald/20' : 'bg-accent-gold/15 text-accent-gold border-accent-gold/20'}`}>
                                {venue.isApproved ? 'Approved' : 'Pending'}
                            </span>
                        </div>
                        <div className="grid grid-cols-3 max-sm:grid-cols-2 gap-3 mb-4">
                            <div className="text-center p-2 bg-bg-secondary rounded-lg"><span className="block text-base font-bold text-white">{venue.rating?.average || '-'}</span><span className="text-[0.65rem] text-text-muted">Rating</span></div>
                            <div className="text-center p-2 bg-bg-secondary rounded-lg"><span className="block text-base font-bold text-white">₹{venue.startingPrice?.toLocaleString('en-IN') || 0}</span><span className="text-[0.65rem] text-text-muted">Price</span></div>
                            <div className="text-center p-2 bg-bg-secondary rounded-lg"><span className="block text-base font-bold text-white">{venue.images?.length || 0}</span><span className="text-[0.65rem] text-text-muted">Photos</span></div>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <Link to={`/vendor/edit-venue/${venue._id}`} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-border-default rounded-lg text-text-secondary text-xs font-medium hover:text-white hover:border-border-light transition-all duration-300"><HiPencil /> Edit</Link>
                            <Link to={`/venues/${venue._id}`} target="_blank" className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-border-default rounded-lg text-text-secondary text-xs font-medium hover:text-white hover:border-border-light transition-all duration-300"><HiEye /> View</Link>
                        </div>
                    </div>
                )) : <p className="text-text-muted text-center py-4">No venues found. Add your first venue!</p>}
            </div>
        </motion.div>
    );
}
