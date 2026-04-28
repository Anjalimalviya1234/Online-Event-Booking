import { motion } from 'framer-motion';
import { HiClipboardList } from 'react-icons/hi';

export default function VendorEnquiries() {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="bg-bg-card border border-border-default rounded-2xl p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-primary-light/10 flex items-center justify-center">
                    <HiClipboardList className="text-3xl text-primary-light" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Enquiries Coming Soon</h2>
                <p className="text-text-secondary max-w-md mx-auto mb-6">
                    We're building a powerful enquiry management system where you'll be able to receive, respond to, and track customer enquiries for your venues.
                </p>
                <div className="grid grid-cols-3 max-sm:grid-cols-1 gap-4 max-w-lg mx-auto">
                    {[
                        { icon: '💬', label: 'Direct Messages', desc: 'Chat with potential customers' },
                        { icon: '📋', label: 'Quote Requests', desc: 'Send custom price quotes' },
                        { icon: '📊', label: 'Lead Tracking', desc: 'Track conversion rates' },
                    ].map((feature, i) => (
                        <div key={i} className="p-4 bg-white/[0.03] border border-border-default rounded-xl">
                            <span className="text-2xl block mb-2">{feature.icon}</span>
                            <h4 className="text-white text-sm font-semibold mb-1">{feature.label}</h4>
                            <p className="text-text-muted text-xs">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
