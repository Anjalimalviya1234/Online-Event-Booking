import { motion } from 'framer-motion';
import { HiStar } from 'react-icons/hi';

const testimonials = [
    { name: 'Aarti & Rahul', event: 'Wedding', venue: 'Royal Palace Marriage Garden', city: 'Bhopal', rating: 5, text: 'Finding the perfect wedding venue was so stressful until we found EventBook. Booked our dream garden in just 2 days! The virtual tour feature was incredibly helpful.', avatar: '👩‍❤️‍👨' },
    { name: 'Vikram Patel', event: 'Corporate Event', venue: 'Grand Imperial Banquet', city: 'Indore', rating: 5, text: 'Organized our company annual meet for 500 people. The filter system helped us find exactly what we needed. Smooth booking process and great venue!', avatar: '👨‍💼' },
    { name: 'Sneha Sharma', event: 'Engagement', venue: 'Sunset Garden Resort', city: 'Gwalior', rating: 4, text: 'Beautiful venue at an amazing price! The price comparison feature saved us ₹50,000 compared to other platforms. Highly recommend EventBook!', avatar: '👩' },
    { name: 'Rajesh & Priya', event: 'Reception', venue: 'Heritage Hotel & Banquets', city: 'Ujjain', rating: 5, text: 'The entire process from searching to booking took less than 30 minutes. The venue was exactly as shown in the photos. Our guests were truly impressed!', avatar: '💑' }
];

export default function Testimonials() {
    return (
        <section className="py-20 max-md:py-12 bg-bg-primary">
            <div className="max-w-[1280px] mx-auto px-6">
                <div className="text-center mb-12">
                    <span className="inline-block text-primary-light text-sm font-semibold uppercase tracking-[0.15em] mb-3">Happy Customers</span>
                    <h2 className="font-display text-[clamp(2rem,3.5vw,2.75rem)] font-bold mb-4 bg-gradient-to-br from-white to-text-secondary bg-clip-text text-transparent">What People Say</h2>
                    <p className="text-text-secondary text-base max-w-[600px] mx-auto">Real stories from real celebrations</p>
                </div>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
                    {testimonials.map((t, i) => (
                        <motion.div key={i} className="p-7 bg-bg-card border border-border-default rounded-2xl transition-all duration-300 hover:border-primary/25 hover:-translate-y-1 hover:shadow-[0_4px_16px_rgba(0,0,0,0.4)]" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}>
                            <div className="flex gap-1 mb-4">
                                {[...Array(5)].map((_, si) => (
                                    <HiStar key={si} className={`text-lg ${si < t.rating ? 'text-accent-gold' : 'text-text-muted opacity-30'}`} />
                                ))}
                            </div>
                            <p className="text-text-secondary text-sm leading-relaxed mb-5 italic">&ldquo;{t.text}&rdquo;</p>
                            <div className="flex items-center gap-3 pt-4 border-t border-border-default">
                                <div className="w-11 h-11 flex items-center justify-center text-2xl bg-primary/10 rounded-full">{t.avatar}</div>
                                <div>
                                    <h4 className="text-sm font-semibold text-white">{t.name}</h4>
                                    <p className="text-xs text-text-muted mt-0.5">{t.event} • {t.venue}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
