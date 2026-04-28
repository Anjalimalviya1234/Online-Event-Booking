import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiLocationMarker, HiCurrencyRupee, HiEye, HiLightningBolt, HiArrowRight, HiX } from 'react-icons/hi';

const slides = [
    {
        icon: <HiLocationMarker className="text-4xl" />,
        title: 'Discover Venues',
        desc: 'Explore 500+ handpicked marriage gardens, resorts, banquet halls & event spaces across Madhya Pradesh.',
        gradient: 'from-primary via-blue-500 to-accent-cyan',
        bg: 'rgba(108,60,225,0.15)',
    },
    {
        icon: <HiCurrencyRupee className="text-4xl" />,
        title: 'Compare Prices',
        desc: 'Compare packages, prices, and amenities side-by-side to find the best deal for your budget.',
        gradient: 'from-accent-emerald via-teal-400 to-cyan-400',
        bg: 'rgba(16,185,129,0.15)',
    },
    {
        icon: <HiEye className="text-4xl" />,
        title: 'Virtual Tour',
        desc: 'View stunning photo galleries and explore venues virtually before visiting in person.',
        gradient: 'from-pink-500 via-rose-400 to-orange-400',
        bg: 'rgba(236,72,153,0.15)',
    },
    {
        icon: <HiLightningBolt className="text-4xl" />,
        title: 'Instant Booking',
        desc: 'Book your perfect venue instantly with secure payments and guaranteed confirmation.',
        gradient: 'from-accent-gold via-amber-400 to-orange-500',
        bg: 'rgba(245,158,11,0.15)',
    },
];

export default function Onboarding({ onComplete }) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        const hasSeenOnboarding = localStorage.getItem('eventbook_onboarding_seen');
        if (!hasSeenOnboarding) {
            setShowOnboarding(true);
        }
    }, []);

    const handleComplete = () => {
        localStorage.setItem('eventbook_onboarding_seen', 'true');
        setShowOnboarding(false);
        if (onComplete) onComplete();
    };

    const nextSlide = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
        } else {
            handleComplete();
        }
    };

    if (!showOnboarding) return null;

    const slide = slides[currentSlide];

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[200] flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                {/* Backdrop */}
                <div className="absolute inset-0 bg-bg-primary" />

                {/* Animated background orbs */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <motion.div
                        className="absolute w-[500px] h-[500px] rounded-full"
                        style={{ background: `radial-gradient(circle, ${slide.bg} 0%, transparent 70%)` }}
                        animate={{ x: [-100, 100, -100], y: [-50, 80, -50] }}
                        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.div
                        className="absolute w-[400px] h-[400px] rounded-full right-0 bottom-0"
                        style={{ background: `radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)` }}
                        animate={{ x: [50, -80, 50], y: [30, -60, 30] }}
                        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
                </div>

                {/* Skip button */}
                <button
                    onClick={handleComplete}
                    className="absolute top-6 right-6 z-10 flex items-center gap-1.5 px-4 py-2 bg-white/[0.06] border border-border-default rounded-full text-text-secondary text-sm font-medium hover:text-white hover:border-border-light transition-all duration-300"
                >
                    Skip <HiX className="text-xs" />
                </button>

                {/* Content */}
                <div className="relative z-[5] flex flex-col items-center text-center px-8 max-w-[520px]">
                    {/* Logo */}
                    <motion.div
                        className="mb-12"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <span className="text-3xl font-extrabold">
                            <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">Event</span>
                            <span className="text-white">Book</span>
                        </span>
                    </motion.div>

                    {/* Slide Content */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSlide}
                            initial={{ opacity: 0, x: 80 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -80 }}
                            transition={{ duration: 0.4 }}
                            className="flex flex-col items-center"
                        >
                            {/* Icon */}
                            <motion.div
                                className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${slide.gradient} flex items-center justify-center text-white mb-8 shadow-[0_8px_32px_rgba(108,60,225,0.3)]`}
                                initial={{ scale: 0, rotate: -20 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            >
                                {slide.icon}
                            </motion.div>

                            {/* Title */}
                            <h2 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold text-white mb-4 leading-tight">
                                {slide.title}
                            </h2>

                            {/* Description */}
                            <p className="text-text-secondary text-[1rem] leading-relaxed mb-10 max-w-[420px]">
                                {slide.desc}
                            </p>
                        </motion.div>
                    </AnimatePresence>

                    {/* Progress dots */}
                    <div className="flex items-center gap-2 mb-8">
                        {slides.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentSlide(i)}
                                className={`rounded-full transition-all duration-300 ${i === currentSlide
                                    ? 'w-8 h-2.5 bg-gradient-to-r from-primary to-primary-light'
                                    : 'w-2.5 h-2.5 bg-white/15 hover:bg-white/25'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Action button */}
                    <motion.button
                        onClick={nextSlide}
                        className="flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-primary to-primary-light text-white text-base font-semibold rounded-2xl shadow-[0_4px_20px_rgba(108,60,225,0.4)] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(108,60,225,0.5)] transition-all duration-300"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {currentSlide < slides.length - 1 ? (
                            <>Next <HiArrowRight /></>
                        ) : (
                            <>Get Started <HiLightningBolt /></>
                        )}
                    </motion.button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
