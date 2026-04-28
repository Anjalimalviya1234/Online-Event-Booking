import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiStar, HiLocationMarker, HiUsers, HiHeart } from 'react-icons/hi';

export default function VenueCard({ venue, index = 0, isLiked = false, onToggleLike }) {
    const mainImage = venue.images?.find(img => img.isMain)?.url || venue.images?.[0]?.url || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800';
    const venueId = venue._id || venue.id;
    const [likeLoading, setLikeLoading] = useState(false);

    const handleLike = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!onToggleLike || likeLoading) return;
        setLikeLoading(true);
        await onToggleLike(venueId);
        setLikeLoading(false);
    };

    return (
        <motion.div className="group bg-bg-card border border-border-default rounded-2xl overflow-hidden transition-all duration-300 hover:border-primary/30 hover:-translate-y-1.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_40px_rgba(108,60,225,0.1)]" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }}>
            <Link to={`/venues/${venueId || 'demo'}`} className="block no-underline text-inherit">
                <div className="relative h-[220px] overflow-hidden">
                    <img src={mainImage} alt={venue.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.08]" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <button
                        className={`absolute top-3 right-3 w-9 h-9 flex items-center justify-center backdrop-blur-lg border-none rounded-full text-lg z-[3] transition-all duration-300 ${isLiked
                            ? 'bg-accent text-white scale-110 shadow-[0_0_15px_rgba(255,59,48,0.4)]'
                            : 'bg-black/50 text-white hover:bg-accent hover:scale-110'}`}
                        onClick={handleLike}
                        disabled={likeLoading}
                    >
                        <HiHeart className={likeLoading ? 'animate-pulse' : ''} />
                    </button>
                    {venue.featured && (
                        <span className="absolute top-3 left-3 px-3 py-1 bg-gradient-to-r from-accent-gold to-[#F7C948] text-bg-card text-[0.7rem] font-bold rounded-full uppercase tracking-wide z-[3]">★ Featured</span>
                    )}
                    <div className="absolute bottom-3 left-3 px-3.5 py-1.5 bg-black/70 backdrop-blur-lg text-white text-lg font-bold rounded-xl z-[3]">
                        ₹{(venue.startingPrice || 0).toLocaleString('en-IN')}
                    </div>
                </div>
                <div className="p-4 px-5 pb-5">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1 text-sm font-semibold">
                            <HiStar className="text-accent-gold text-base" />
                            <span>{venue.rating?.average || 4.0}</span>
                            <span className="text-text-muted font-normal text-xs">({venue.rating?.count || 0})</span>
                        </div>
                        <span className="text-[0.7rem] font-semibold uppercase tracking-wide text-primary-light px-2.5 py-0.5 bg-primary/10 rounded-full">{(venue.venueType || 'venue').replace('-', ' ')}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 leading-tight line-clamp-1">{venue.name}</h3>
                    <div className="flex items-center gap-1.5 text-text-secondary text-sm mb-2.5">
                        <HiLocationMarker className="text-accent text-base shrink-0" />
                        <span>{venue.area}, {venue.city}</span>
                    </div>
                    <div className="mb-3">
                        <div className="flex items-center gap-1.5 text-text-muted text-xs">
                            <HiUsers className="text-accent-emerald" />
                            <span>{venue.capacity?.min || 100}-{venue.capacity?.max || 500} Guests</span>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {venue.amenities?.parking && <span className="px-2.5 py-0.5 bg-white/5 border border-border-default rounded-full text-[0.7rem] text-text-secondary font-medium">Parking</span>}
                        {venue.amenities?.ac && <span className="px-2.5 py-0.5 bg-white/5 border border-border-default rounded-full text-[0.7rem] text-text-secondary font-medium">AC</span>}
                        {venue.amenities?.cateringAvailable && <span className="px-2.5 py-0.5 bg-white/5 border border-border-default rounded-full text-[0.7rem] text-text-secondary font-medium">Catering</span>}
                        {venue.amenities?.decorationAvailable && <span className="px-2.5 py-0.5 bg-white/5 border border-border-default rounded-full text-[0.7rem] text-text-secondary font-medium">Decor</span>}
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
