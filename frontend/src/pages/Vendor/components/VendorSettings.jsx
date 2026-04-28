import { motion } from 'framer-motion';
import { HiUser, HiMail, HiPhone, HiSave, HiLockClosed } from 'react-icons/hi';

export default function VendorSettings({ vendorUser, settingsForm, setSettingsForm, settingsLoading, onSave, myVenues }) {
    const inputCls = "w-full px-4 py-3 bg-white/[0.03] border border-border-default rounded-xl text-white text-sm outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(108,60,225,0.15)] transition-all";

    return (
        <motion.div className="space-y-6 max-w-2xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="bg-bg-card border border-border-default rounded-2xl">
                <div className="p-5 border-b border-border-default">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2"><HiUser className="text-primary-light" /> Profile Settings</h2>
                </div>
                <div className="p-5 space-y-4">
                    <div>
                        <label className="flex items-center gap-1.5 text-xs font-medium text-text-muted mb-2 uppercase tracking-wide"><HiUser className="text-sm" /> Full Name</label>
                        <input type="text" value={settingsForm.name} onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })} className={inputCls} placeholder="Your full name" />
                    </div>
                    <div>
                        <label className="flex items-center gap-1.5 text-xs font-medium text-text-muted mb-2 uppercase tracking-wide"><HiMail className="text-sm" /> Email Address</label>
                        <div className="w-full px-4 py-3 bg-white/[0.02] border border-border-default rounded-xl text-text-secondary text-sm">{vendorUser?.email || '—'}<span className="text-text-muted text-xs ml-2">(cannot change)</span></div>
                    </div>
                    <div>
                        <label className="flex items-center gap-1.5 text-xs font-medium text-text-muted mb-2 uppercase tracking-wide"><HiPhone className="text-sm" /> Mobile Number</label>
                        <input type="tel" value={settingsForm.mobile} onChange={(e) => setSettingsForm({ ...settingsForm, mobile: e.target.value })} className={inputCls} placeholder="+91 98765 43210" />
                    </div>
                    <div className="flex justify-end pt-2">
                        <button onClick={onSave} disabled={settingsLoading} className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-accent-emerald to-teal-500 text-white text-sm font-semibold rounded-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 shadow-[0_4px_15px_rgba(16,185,129,0.3)]"><HiSave /> {settingsLoading ? 'Saving...' : 'Save Changes'}</button>
                    </div>
                </div>
            </div>
            <div className="bg-bg-card border border-border-default rounded-2xl">
                <div className="p-5 border-b border-border-default">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2"><HiLockClosed className="text-primary-light" /> Account Information</h2>
                </div>
                <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-border-default rounded-xl">
                        <div><p className="text-white text-sm font-medium">Account Role</p><p className="text-text-muted text-xs capitalize">{vendorUser?.role || 'vendor'}</p></div>
                        <span className="px-3 py-1 bg-accent-emerald/15 text-accent-emerald text-xs font-bold rounded-full uppercase">{vendorUser?.role}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-border-default rounded-xl">
                        <div><p className="text-white text-sm font-medium">Member Since</p><p className="text-text-muted text-xs">{vendorUser?.createdAt ? new Date(vendorUser.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</p></div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-border-default rounded-xl">
                        <div><p className="text-white text-sm font-medium">Active Venues</p><p className="text-text-muted text-xs">{myVenues.length} venues listed</p></div>
                        <span className="text-white font-bold text-lg">{myVenues.length}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
