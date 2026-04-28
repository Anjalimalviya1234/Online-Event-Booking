import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiSearch, HiLocationMarker, HiCalendar, HiUsers, HiSparkles } from 'react-icons/hi';
import { useCities } from '../../../hooks/useVenues';
const occasions = ['Wedding', 'Reception', 'Engagement', 'Birthday', 'Corporate', 'Conference', 'Party', 'Anniversary'];

export default function Hero() {
    const navigate = useNavigate();
    const cities = useCities();
    const [city, setCity] = useState('');
    const [occasion, setOccasion] = useState('');
    const [guests, setGuests] = useState('');
    const [eventDate, setEventDate] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (city) params.set('city', city);
        if (occasion) params.set('occasion', occasion.toLowerCase());
        if (guests) params.set('minCapacity', guests);
        if (eventDate) params.set('date', eventDate);
        navigate(`/venues?${params.toString()}`);
    };

    const stats = [
        { value: '500+', label: 'Venues' },
        { value: '10K+', label: 'Events' },
        { value: '4.8', label: 'Rating' },
        { value: '50+', label: 'Cities' },
    ];

    return (
        <section className="relative min-h-screen flex items-center justify-center pt-[120px] pb-[80px] max-md:pt-[100px] max-md:pb-[60px] overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(108,60,225,0.25)_0%,transparent_70%)] -top-[150px] -left-[200px] animate-[float_8s_ease-in-out_infinite]" />
                <div className="absolute w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.2)_0%,transparent_70%)] top-[20%] -right-[150px] animate-[float_10s_ease-in-out_infinite_reverse]" />
                <div className="absolute w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(255,107,107,0.12)_0%,transparent_70%)] -bottom-[100px] left-[30%] animate-[float_12s_ease-in-out_infinite]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
            </div>

            <div className="relative z-[2] text-center flex flex-col items-center max-w-[1280px] mx-auto px-6">
                <motion.div className="inline-flex items-center gap-2 px-5 py-2 bg-primary/[0.12] border border-primary/25 rounded-full text-primary-light text-sm font-semibold mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
                    <HiSparkles className="text-base text-accent-gold" />
                    <span>#1 Event Venue Booking Platform in MP</span>
                </motion.div>

                <motion.h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold leading-[1.12] tracking-tight text-white mb-5 max-w-[800px]" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}>
                    Find Your
                    <span className="bg-gradient-to-r from-primary via-blue-500 to-accent-cyan bg-clip-text text-transparent"> Perfect Venue</span>
                    <br />
                    For Every Celebration
                </motion.h1>

                <motion.p className="text-[clamp(1rem,2vw,1.15rem)] text-text-secondary max-w-[620px] mb-10 leading-relaxed" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}>
                    Discover 500+ stunning marriage gardens, banquet halls, resorts &amp; event spaces across Madhya Pradesh. Compare, book &amp; celebrate!
                </motion.p>

                <motion.form className="flex items-center bg-bg-card/85 backdrop-blur-xl border border-border-light rounded-3xl p-2 w-full max-w-[780px] shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_60px_rgba(108,60,225,0.1)] mb-12 max-md:flex-col max-md:gap-0 max-md:p-3 max-md:rounded-2xl" onSubmit={handleSearch} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.6 }}>
                    <div className="flex-1 min-w-0 flex items-center gap-2.5 px-3 py-2 max-md:w-full max-md:border-b max-md:border-border-default max-md:px-3 max-md:py-2.5">
                        <HiLocationMarker className="text-xl text-primary-light shrink-0" />
                        <select value={city} onChange={(e) => setCity(e.target.value)} className="flex-1 bg-transparent border-none text-white text-sm py-1.5 outline-none [&>option]:bg-bg-card [&>option]:text-white">
                            <option value="">Select City</option>
                            {cities.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="w-px h-8 bg-border-default shrink-0 max-md:hidden" />
                    <div className="flex-1 min-w-0 flex items-center gap-2.5 px-3 py-2 max-md:w-full max-md:border-b max-md:border-border-default max-md:px-3 max-md:py-2.5">
                        <HiCalendar className="text-xl text-primary-light shrink-0" />
                        <select value={occasion} onChange={(e) => setOccasion(e.target.value)} className="flex-1 bg-transparent border-none text-white text-sm py-1.5 outline-none [&>option]:bg-bg-card [&>option]:text-white">
                            <option value="">Occasion</option>
                            {occasions.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>
                    <div className="w-px h-8 bg-border-default shrink-0 max-md:hidden" />
                    <div className="flex-1 min-w-0 flex items-center gap-2.5 px-3 py-2 max-md:w-full max-md:border-b max-md:border-border-default max-md:px-3 max-md:py-2.5">
                        <HiCalendar className="text-xl text-primary-light shrink-0" />
                        <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="flex-1 bg-transparent border-none text-white text-sm py-1.5 outline-none [color-scheme:dark] cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer relative" />
                    </div>
                    <div className="w-px h-8 bg-border-default shrink-0 max-md:hidden" />
                    <div className="flex-1 min-w-0 flex items-center gap-2.5 px-3 py-2 max-md:w-full max-md:px-3 max-md:py-2.5">
                        <HiUsers className="text-xl text-primary-light shrink-0" />
                        <input type="number" placeholder="Guest Count" value={guests} onChange={(e) => setGuests(e.target.value)} min="1" className="flex-1 bg-transparent border-none text-white text-sm py-1.5 outline-none placeholder:text-text-muted" />
                    </div>
                    <button type="submit" className="shrink-0 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-light text-white text-sm font-semibold border-none rounded-2xl whitespace-nowrap shadow-[0_4px_20px_rgba(108,60,225,0.4)] hover:-translate-y-0.5 hover:shadow-[0_6px_30px_rgba(108,60,225,0.5)] transition-all duration-300 max-md:w-full max-md:justify-center max-md:mt-1 max-md:rounded-xl">
                        <HiSearch />
                        <span>Search</span>
                    </button>
                </motion.form>

                <motion.div className="flex items-center gap-12 max-md:gap-6 max-md:flex-wrap max-md:justify-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.8 }}>
                    {stats.map((stat, i) => (
                        <div key={i} className="flex flex-col items-center">
                            <span className="text-[1.75rem] font-extrabold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">{stat.value}</span>
                            <span className="text-xs text-text-muted font-medium uppercase tracking-widest">{stat.label}</span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
