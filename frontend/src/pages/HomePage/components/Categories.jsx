import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOfficeBuilding, HiHome, HiGlobe, HiSparkles, HiCake, HiStar } from 'react-icons/hi';

const categories = [
    { icon: <HiSparkles />, label: 'Marriage Gardens', type: 'marriage-garden', color: '#FF6B6B', count: '120+' },
    { icon: <HiOfficeBuilding />, label: 'Banquet Halls', type: 'banquet', color: '#8B5CF6', count: '85+' },
    { icon: <HiGlobe />, label: 'Resorts', type: 'resort', color: '#06B6D4', count: '45+' },
    { icon: <HiHome />, label: 'Farmhouses', type: 'farmhouse', color: '#10B981', count: '60+' },
    { icon: <HiStar />, label: 'Hotels', type: 'hotel', color: '#F5A623', count: '90+' },
    { icon: <HiCake />, label: 'Party Lawns', type: 'lawn', color: '#EC4899', count: '75+' },
];

export default function Categories() {
    return (
        <section className="py-20 max-md:py-12 bg-bg-secondary">
            <div className="max-w-[1280px] mx-auto px-6">
                <div className="text-center mb-12">
                    <span className="inline-block text-primary-light text-sm font-semibold uppercase tracking-[0.15em] mb-3">Browse Categories</span>
                    <h2 className="font-display text-[clamp(2rem,3.5vw,2.75rem)] font-bold mb-4 bg-gradient-to-br from-white to-text-secondary bg-clip-text text-transparent">Find The Perfect Venue Type</h2>
                    <p className="text-text-secondary text-base max-w-[600px] mx-auto">Choose from a variety of venue types for your special occasion</p>
                </div>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] max-md:grid-cols-2 gap-5 max-md:gap-3">
                    {categories.map((cat, i) => (
                        <motion.div key={cat.type} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}>
                            <Link to={`/venues?venueType=${cat.type}`} className="group flex flex-col items-center py-8 px-5 max-md:py-6 max-md:px-4 bg-bg-card border border-border-default rounded-2xl text-center transition-all duration-300 no-underline relative overflow-hidden hover:border-primary/30 hover:-translate-y-2 hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                                <div className="w-16 h-16 flex items-center justify-center rounded-[18px] text-[1.6rem] mb-4 transition-all duration-300 group-hover:scale-110" style={{ background: `color-mix(in srgb, ${cat.color} 12%, transparent)`, color: cat.color }}>
                                    {cat.icon}
                                </div>
                                <h3 className="text-[0.95rem] font-semibold text-white mb-1.5">{cat.label}</h3>
                                <span className="text-xs text-text-muted">{cat.count} Venues</span>
                                <div className="absolute w-[100px] h-[100px] rounded-full blur-[50px] opacity-0 -bottom-[30px] -right-[30px] transition-all duration-500 group-hover:opacity-15" style={{ background: cat.color }} />
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
