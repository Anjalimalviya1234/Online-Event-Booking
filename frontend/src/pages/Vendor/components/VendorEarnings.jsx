import { motion } from 'framer-motion';
import { HiCurrencyRupee, HiClock, HiXCircle, HiTrendingUp, HiCheck } from 'react-icons/hi';

export default function VendorEarnings({ confirmedBookings, pendingBookings, cancelledBookings, totalRevenue, pendingRevenue, monthlyEarnings }) {
    return (
        <motion.div className="space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            {/* Revenue Overview Cards */}
            <div className="grid grid-cols-3 max-md:grid-cols-1 gap-4">
                <div className="p-6 bg-bg-card border border-border-default rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-accent-emerald/15 text-accent-emerald text-lg"><HiCurrencyRupee /></div>
                        <span className="text-text-muted text-sm">Total Revenue</span>
                    </div>
                    <span className="text-3xl font-extrabold text-white">₹{totalRevenue.toLocaleString('en-IN')}</span>
                    <p className="text-accent-emerald text-xs mt-1 flex items-center gap-1"><HiTrendingUp /> From {confirmedBookings.length} confirmed bookings</p>
                </div>
                <div className="p-6 bg-bg-card border border-border-default rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-accent-gold/15 text-accent-gold text-lg"><HiClock /></div>
                        <span className="text-text-muted text-sm">Pending Revenue</span>
                    </div>
                    <span className="text-3xl font-extrabold text-white">₹{pendingRevenue.toLocaleString('en-IN')}</span>
                    <p className="text-accent-gold text-xs mt-1">{pendingBookings.length} bookings awaiting confirmation</p>
                </div>
                <div className="p-6 bg-bg-card border border-border-default rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-accent/15 text-accent text-lg"><HiXCircle /></div>
                        <span className="text-text-muted text-sm">Cancelled</span>
                    </div>
                    <span className="text-3xl font-extrabold text-white">{cancelledBookings.length}</span>
                    <p className="text-text-muted text-xs mt-1">Cancelled bookings</p>
                </div>
            </div>

            {/* Monthly Breakdown */}
            <div className="bg-bg-card border border-border-default rounded-2xl">
                <div className="p-5 border-b border-border-default">
                    <h2 className="text-lg font-semibold text-white">Monthly Earnings</h2>
                </div>
                <div className="p-5">
                    {Object.keys(monthlyEarnings).length > 0 ? (
                        <div className="space-y-3">
                            {Object.entries(monthlyEarnings).sort((a, b) => new Date(b[0]) - new Date(a[0])).map(([month, amount]) => (
                                <div key={month} className="flex items-center justify-between p-4 bg-white/[0.02] border border-border-default rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary/15 text-primary-light text-sm font-bold">{month.split(' ')[0].slice(0, 3)}</div>
                                        <span className="text-white font-medium">{month}</span>
                                    </div>
                                    <span className="text-accent-emerald font-bold text-lg">₹{amount.toLocaleString('en-IN')}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-text-muted text-center py-8">No earnings data yet. Start accepting bookings!</p>
                    )}
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-bg-card border border-border-default rounded-2xl">
                <div className="p-5 border-b border-border-default">
                    <h2 className="text-lg font-semibold text-white">Recent Transactions</h2>
                </div>
                <div className="divide-y divide-border-default max-h-[400px] overflow-y-auto">
                    {confirmedBookings.length > 0 ? confirmedBookings.slice(0, 15).map(b => (
                        <div key={b._id} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-accent-emerald/15 flex items-center justify-center text-accent-emerald text-sm"><HiCheck /></div>
                                <div>
                                    <p className="text-white text-sm font-medium">{b.user?.name}</p>
                                    <p className="text-text-muted text-xs capitalize">{b.eventType} • {b.venue?.name} • {new Date(b.eventDate).toLocaleDateString('en-IN')}</p>
                                </div>
                            </div>
                            <span className="text-accent-emerald font-bold">+₹{b.pricing?.totalAmount?.toLocaleString('en-IN')}</span>
                        </div>
                    )) : (
                        <p className="text-text-muted text-center py-8">No transactions yet.</p>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
