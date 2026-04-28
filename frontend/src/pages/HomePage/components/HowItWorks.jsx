import { motion } from 'framer-motion';
import { HiSearch, HiCalendar, HiCreditCard, HiSparkles } from 'react-icons/hi';

const steps = [
    { icon: <HiSearch />, step: '01', title: 'Search & Discover', description: 'Browse 500+ venues, filter by city, budget, capacity, and amenities to find your perfect match.', color: '#8B5CF6' },
    { icon: <HiCalendar />, step: '02', title: 'Check & Compare', description: 'View detailed photos, virtual tours, compare prices, read reviews, and check real-time availability.', color: '#06B6D4' },
    { icon: <HiCreditCard />, step: '03', title: 'Book & Pay', description: 'Select your package, choose your date, and pay securely online with just 20% advance payment.', color: '#10B981' },
    { icon: <HiSparkles />, step: '04', title: 'Celebrate!', description: 'Get instant confirmation, venue contact details, and enjoy your perfectly planned celebration.', color: '#F5A623' }
];

export default function HowItWorks() {
    return (
        <section className="py-20 max-md:py-12 bg-bg-secondary relative">
            <div className="max-w-[1280px] mx-auto px-6">
                <div className="text-center mb-12">
                    <span className="inline-block text-primary-light text-sm font-semibold uppercase tracking-[0.15em] mb-3">Simple Process</span>
                    <h2 className="font-display text-[clamp(2rem,3.5vw,2.75rem)] font-bold mb-4 bg-gradient-to-br from-white to-text-secondary bg-clip-text text-transparent">How It Works</h2>
                    <p className="text-text-secondary text-base max-w-[600px] mx-auto">Book your dream venue in 4 easy steps</p>
                </div>
                <div className="grid grid-cols-4 max-lg:grid-cols-2 max-sm:grid-cols-1 gap-6 relative">
                    {steps.map((step, i) => (
                        <motion.div key={i} className="group text-center p-8 px-6 bg-bg-card border border-border-default rounded-2xl relative transition-all duration-300 hover:border-primary/30 hover:-translate-y-1.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)]" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.15 }}>
                            <div className="text-[2.5rem] font-black opacity-15 absolute top-4 right-5 font-display" style={{ color: step.color }}>{step.step}</div>
                            <div className="w-[72px] h-[72px] flex items-center justify-center rounded-[20px] text-[1.75rem] mx-auto mb-5 transition-all duration-300 group-hover:scale-110" style={{ background: `color-mix(in srgb, ${step.color} 12%, transparent)`, color: step.color }}>{step.icon}</div>
                            <h3 className="text-lg font-bold text-white mb-2.5">{step.title}</h3>
                            <p className="text-sm text-text-secondary leading-relaxed">{step.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
