import { Link } from 'react-router-dom';
import VenueCard from '../../../components/VenueCard';
import useWishlist from '../../../hooks/useWishlist';
import { useVenues } from '../../../hooks/useVenues';
import { HiArrowRight, HiTrendingUp } from 'react-icons/hi';

export default function TrendingVenues() {
    const { venues, loading } = useVenues({}, 'popular', '', 1, 6);
    const { isLiked, toggleLike } = useWishlist();

    if (!loading && venues.length === 0) return null;

    return (
        <section className="py-20 max-md:py-12 bg-bg-primary">
            <div className="max-w-[1280px] mx-auto px-6">
                <div className="flex items-end justify-between mb-10 gap-6 max-md:flex-col max-md:items-start">
                    <div>
                        <span className="inline-flex items-center gap-1.5 text-accent-cyan text-sm font-semibold uppercase tracking-[0.15em] mb-2">
                            <HiTrendingUp className="text-base" /> Trending Now
                        </span>
                        <h2 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-bold bg-gradient-to-br from-white to-text-secondary bg-clip-text text-transparent mb-2">Trending in Your City</h2>
                        <p className="text-text-secondary text-[0.95rem]">Most booked venues this month — don't miss out!</p>
                    </div>
                    <Link to="/venues?sort=popular" className="inline-flex items-center gap-2 px-7 py-3 text-[0.95rem] font-semibold rounded-xl bg-white/[0.08] text-white border border-border-light backdrop-blur-lg hover:bg-white/[0.14] hover:border-accent-cyan hover:-translate-y-0.5 transition-all duration-300">
                        View All <HiArrowRight />
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] max-md:grid-cols-1 gap-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-bg-card border border-border-default rounded-2xl overflow-hidden animate-pulse">
                                <div className="h-[220px] bg-white/5" />
                                <div className="p-5 space-y-3"><div className="h-4 bg-white/5 rounded w-1/3" /><div className="h-5 bg-white/5 rounded w-2/3" /><div className="h-3 bg-white/5 rounded w-1/2" /></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] max-md:grid-cols-1 gap-6">
                        {venues.map((venue, i) => (
                            <VenueCard key={venue._id} venue={venue} index={i} isLiked={isLiked(venue._id)} onToggleLike={toggleLike} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
