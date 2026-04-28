import { motion } from 'framer-motion';
import { HiTrendingUp } from 'react-icons/hi';

export default function VendorStatsGrid({ stats }) {
    return (
        <div className="grid grid-cols-4 max-lg:grid-cols-2 max-sm:grid-cols-1 gap-4">
            {stats.map((stat, i) => (
                <motion.div key={i} className="flex items-center gap-4 p-5 bg-bg-card border border-border-default rounded-2xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                    <div className="w-12 h-12 flex items-center justify-center rounded-[14px] text-xl" style={{ background: `color-mix(in srgb, ${stat.color} 15%, transparent)`, color: stat.color }}>{stat.icon}</div>
                    <div>
                        <span className="text-2xl font-extrabold text-white block">{stat.value}</span>
                        <span className="text-text-muted text-xs">{stat.label}</span>
                        <span className="flex items-center gap-1 text-accent-emerald text-[0.7rem] mt-0.5"><HiTrendingUp /> {stat.change}</span>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
