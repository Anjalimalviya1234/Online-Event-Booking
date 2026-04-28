import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import VenueCard from '../../components/VenueCard';
import Footer from '../../components/Footer';
import useWishlist from '../../hooks/useWishlist';
import { useVenues, useCities } from '../../hooks/useVenues';
import { HiX, HiSearch, HiAdjustments, HiSortDescending } from 'react-icons/hi';

const venueTypes = ['All Types', 'marriage-garden', 'banquet', 'resort', 'farmhouse', 'hotel', 'lawn', 'community-hall'];
const sortOptions = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Top Rated' },
];

export default function Venues() {
    const [searchParams] = useSearchParams();
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const { isLiked, toggleLike } = useWishlist();
    const cities = useCities();

    const [filters, setFilters] = useState({
        city: searchParams.get('city') || '', venueType: searchParams.get('venueType') || '', occasion: searchParams.get('occasion') || '',
        minPrice: searchParams.get('minPrice') || '', maxPrice: searchParams.get('maxPrice') || '', minCapacity: searchParams.get('minCapacity') || '',
        date: searchParams.get('date') || '',
        parking: false, ac: false, catering: false, decoration: false,
    });
    const [sort, setSort] = useState('popular');
    const [searchQuery, setSearchQuery] = useState('');

    const featuredParam = searchParams.get('featured') === 'true' ? { featured: 'true' } : {};
    const { venues, loading, totalPages, totalCount } = useVenues(filters, sort, searchQuery, currentPage, 12, featuredParam);

    const clearFilters = () => {
        setFilters({ city: '', venueType: '', occasion: '', minPrice: '', maxPrice: '', minCapacity: '', date: '', parking: false, ac: false, catering: false, decoration: false });
        setSearchQuery('');
        setCurrentPage(1);
    };

    return (
        <>
            <Navbar />
            <main className="pt-[100px] min-h-screen pb-20">
                <div className="max-w-[1280px] mx-auto px-6">
                    <motion.div className="mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <h1 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-bold bg-gradient-to-br from-white to-text-secondary bg-clip-text text-transparent mb-2">
                            {searchParams.get('featured') === 'true' ? 'Featured Venues' : filters.city ? `Venues in ${filters.city}` : 'All Venues'}
                        </h1>
                        <p className="text-text-secondary text-[0.95rem]">{totalCount} venues found</p>
                    </motion.div>

                    <div className="flex items-center gap-4 mb-6 flex-wrap max-md:flex-col max-md:items-stretch">
                        <div className="flex-1 min-w-[250px] flex items-center gap-2.5 px-4 py-2.5 bg-bg-card border border-border-default rounded-xl transition-all duration-300 focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(108,60,225,0.15)]">
                            <HiSearch className="text-text-muted text-lg shrink-0" />
                            <input type="text" placeholder="Search venues by name or city..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="flex-1 bg-transparent border-none text-white text-sm outline-none placeholder:text-text-muted" />
                        </div>
                        <div className="flex items-center gap-3 max-md:justify-between">
                            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-bg-card border border-border-default rounded-xl text-text-secondary text-sm">
                                <HiSortDescending />
                                <select value={sort} onChange={(e) => { setSort(e.target.value); setCurrentPage(1); }} className="bg-transparent border-none text-white text-sm cursor-pointer outline-none [&>option]:bg-bg-card">
                                    {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </div>
                            <button className="flex items-center gap-2 px-[18px] py-2.5 bg-bg-card border border-border-default rounded-xl text-text-secondary text-sm font-medium cursor-pointer hover:border-primary hover:text-white transition-all duration-300" onClick={() => setShowFilters(!showFilters)}>
                                <HiAdjustments /> Filters
                            </button>
                        </div>
                    </div>

                    {showFilters && (
                        <motion.div className="bg-bg-card border border-border-default rounded-2xl p-6 mb-6 overflow-hidden" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                            <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] max-md:grid-cols-2 gap-4 mb-4">
                                {[
                                    { label: 'City', type: 'select', value: filters.city, options: ['All Cities', ...cities], onChange: (v) => { setFilters({ ...filters, city: v === 'All Cities' ? '' : v }); setCurrentPage(1); } },
                                    { label: 'Venue Type', type: 'select', value: filters.venueType, options: venueTypes, onChange: (v) => { setFilters({ ...filters, venueType: v === 'All Types' ? '' : v }); setCurrentPage(1); } },
                                ].map(f => (
                                    <div key={f.label}>
                                        <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wide">{f.label}</label>
                                        <select value={f.value} onChange={(e) => f.onChange(e.target.value)} className="w-full px-3 py-2.5 bg-bg-secondary border border-border-default rounded-lg text-white text-sm outline-none [&>option]:bg-bg-card [&>option]:capitalize">
                                            {f.options.map(o => <option key={o} value={o === 'All Cities' || o === 'All Types' ? '' : o}>{o === 'All Types' ? o : o.replace('-', ' ')}</option>)}
                                        </select>
                                    </div>
                                ))}
                                <div>
                                    <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wide">Event Date</label>
                                    <input type="date" value={filters.date} onChange={(e) => { setFilters({ ...filters, date: e.target.value }); setCurrentPage(1); }} min={new Date().toISOString().split('T')[0]} className="w-full px-3 py-2.5 bg-bg-secondary border border-border-default rounded-lg text-white text-sm outline-none [color-scheme:dark]" />
                                </div>
                                {[
                                    { label: 'Min Budget', placeholder: '₹ Min', value: filters.minPrice, key: 'minPrice' },
                                    { label: 'Max Budget', placeholder: '₹ Max', value: filters.maxPrice, key: 'maxPrice' },
                                    { label: 'Min Guests', placeholder: 'Guests', value: filters.minCapacity, key: 'minCapacity' },
                                ].map(f => (
                                    <div key={f.key}>
                                        <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wide">{f.label}</label>
                                        <input type="number" placeholder={f.placeholder} value={f.value} onChange={(e) => { setFilters({ ...filters, [f.key]: e.target.value }); setCurrentPage(1); }} className="w-full px-3 py-2.5 bg-bg-secondary border border-border-default rounded-lg text-white text-sm outline-none placeholder:text-text-muted" />
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center gap-5 flex-wrap pt-4 border-t border-border-default">
                                {['parking', 'ac', 'catering', 'decoration'].map(key => (
                                    <label key={key} className="flex items-center gap-1.5 text-text-secondary text-sm cursor-pointer hover:text-white transition-all duration-300">
                                        <input type="checkbox" checked={filters[key]} onChange={(e) => { setFilters({ ...filters, [key]: e.target.checked }); setCurrentPage(1); }} className="w-4 h-4 accent-primary cursor-pointer" /> {key.charAt(0).toUpperCase() + key.slice(1)}
                                    </label>
                                ))}
                                <button className="flex items-center gap-1 px-3.5 py-1.5 bg-accent/10 border border-accent/20 rounded-lg text-accent text-xs font-medium ml-auto hover:bg-accent/20 transition-all duration-300" onClick={clearFilters}>
                                    <HiX /> Clear All
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {loading ? (
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] max-md:grid-cols-1 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="bg-bg-card border border-border-default rounded-2xl overflow-hidden animate-pulse">
                                    <div className="h-[220px] bg-white/5" />
                                    <div className="p-5 space-y-3">
                                        <div className="h-4 bg-white/5 rounded w-1/3" />
                                        <div className="h-5 bg-white/5 rounded w-2/3" />
                                        <div className="h-3 bg-white/5 rounded w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : venues.length > 0 ? (
                        <>
                            <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] max-md:grid-cols-1 gap-6">
                                {venues.map((venue, i) => (
                                    <VenueCard key={venue._id} venue={venue} index={i} isLiked={isLiked(venue._id)} onToggleLike={toggleLike} />
                                ))}
                            </div>
                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-10">
                                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-4 py-2 bg-bg-card border border-border-default rounded-xl text-text-secondary text-sm font-medium disabled:opacity-30 hover:text-white hover:border-primary/30 transition-all">← Prev</button>
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-semibold transition-all ${currentPage === i + 1 ? 'bg-primary text-white' : 'bg-bg-card border border-border-default text-text-secondary hover:text-white'}`}>{i + 1}</button>
                                    ))}
                                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-4 py-2 bg-bg-card border border-border-default rounded-xl text-text-secondary text-sm font-medium disabled:opacity-30 hover:text-white hover:border-primary/30 transition-all">Next →</button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-20">
                            <h3 className="text-2xl font-bold text-white mb-2">No venues found</h3>
                            <p className="text-text-secondary mb-6">Try adjusting your filters or search query</p>
                            <button className="inline-flex items-center gap-2 px-7 py-3 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-primary-light text-white shadow-[0_4px_15px_rgba(108,60,225,0.4)]" onClick={clearFilters}>Clear Filters</button>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}
