import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function CTASection() {
    return (
        <section className="pt-10 pb-20 bg-bg-secondary">
            <div className="max-w-[1280px] mx-auto px-6">
                <motion.div className="relative p-16 max-md:p-12 max-md:px-6 bg-gradient-to-br from-primary to-primary-light rounded-3xl overflow-hidden text-center" initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                    <div className="absolute w-[300px] h-[300px] rounded-full bg-white/10 -top-[100px] -right-[50px] blur-[40px]" />
                    <div className="absolute w-[250px] h-[250px] rounded-full bg-white/[0.08] -bottom-[80px] -left-[30px] blur-[40px]" />
                    <div className="relative z-[2]">
                        <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-extrabold text-white mb-4">Ready to Find Your Dream Venue?</h2>
                        <p className="text-lg text-white/85 max-w-[550px] mx-auto mb-8 leading-relaxed">
                            Join thousands of happy customers who found their perfect celebration space through EventBook. Start browsing now — its free!
                        </p>
                        <div className="flex items-center justify-center gap-4 flex-wrap">
                            <Link to="/venues" className="inline-flex items-center gap-2 px-9 py-4 text-base font-semibold rounded-2xl bg-white text-primary shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_6px_30px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition-all duration-300">
                                Explore Venues
                            </Link>
                            <Link to="/vendor" className="inline-flex items-center gap-2 px-9 py-4 text-base font-semibold rounded-2xl bg-white/[0.08] text-white border border-white/20 backdrop-blur-lg hover:bg-white/[0.14] hover:-translate-y-0.5 transition-all duration-300">
                                List Your Venue
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
