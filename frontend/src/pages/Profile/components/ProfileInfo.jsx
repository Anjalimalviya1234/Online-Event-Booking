import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiUser, HiMail, HiPhone, HiCamera, HiPencil, HiCheck, HiX } from 'react-icons/hi';
import useAuth from '../../../hooks/useAuth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ProfileInfo({ user, onUpdate }) {
    const { updateProfile } = useAuth();
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        mobile: user?.mobile || '',
        avatar: user?.avatar || '',
    });

    const handleSave = async () => {
        setLoading(true);
        try {
            const data = await updateProfile(formData);
            if (data && data.success) {
                onUpdate(data.user);
                setEditing(false);
            }
        } catch (error) {
            // Error handled in hook
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({ name: user?.name || '', mobile: user?.mobile || '', avatar: user?.avatar || '' });
        setEditing(false);
    };

    const inputCls = "w-full px-4 py-3 bg-bg-secondary border border-border-default rounded-xl text-white text-sm outline-none placeholder:text-text-muted transition-all duration-300 focus:border-primary focus:shadow-[0_0_0_3px_rgba(108,60,225,0.15)]";
    const readOnlyCls = "w-full px-4 py-3 bg-white/[0.02] border border-border-default rounded-xl text-text-secondary text-sm";

    return (
        <motion.div
            className="bg-bg-card border border-border-default rounded-2xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
        >
            {/* Profile Header/Banner */}
            <div className="relative h-36 bg-gradient-to-r from-primary/30 via-primary/10 to-primary-light/20">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            <div className="px-6 pb-6 -mt-14 relative">
                {/* Avatar */}
                <div className="flex items-end justify-between mb-6">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-3xl font-bold border-4 border-bg-card shadow-[0_8px_24px_rgba(108,60,225,0.3)]">
                            {user?.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-2xl" />
                            ) : (
                                user?.name?.charAt(0).toUpperCase() || 'U'
                            )}
                        </div>
                        {editing && (
                            <button className="absolute -bottom-1 -right-1 w-8 h-8 flex items-center justify-center bg-primary rounded-lg text-white text-sm shadow-lg hover:bg-primary-light transition-all duration-300">
                                <HiCamera />
                            </button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {editing ? (
                            <>
                                <button
                                    onClick={handleCancel}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-white/[0.06] border border-border-default rounded-xl text-text-secondary text-sm font-medium hover:text-white hover:border-border-light transition-all duration-300"
                                >
                                    <HiX /> Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-primary to-primary-light rounded-xl text-white text-sm font-semibold shadow-[0_4px_15px_rgba(108,60,225,0.4)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50"
                                >
                                    <HiCheck /> {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setEditing(true)}
                                className="flex items-center gap-1.5 px-5 py-2 bg-white/[0.06] border border-border-default rounded-xl text-text-secondary text-sm font-medium hover:text-white hover:border-primary/30 transition-all duration-300"
                            >
                                <HiPencil /> Edit Profile
                            </button>
                        )}
                    </div>
                </div>

                {/* User Info */}
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-white">{user?.name || 'User'}</h2>
                    <p className="text-text-muted text-sm">{user?.email}</p>
                    <span className="inline-block mt-2 px-3 py-0.5 bg-primary/10 border border-primary/20 rounded-full text-primary-light text-xs font-semibold uppercase tracking-wider capitalize">{user?.role || 'user'}</span>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-2 max-md:grid-cols-1 gap-4">
                    <div>
                        <label className="flex items-center gap-1.5 text-xs font-medium text-text-muted mb-2 uppercase tracking-wide">
                            <HiUser className="text-sm" /> Full Name
                        </label>
                        {editing ? (
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className={inputCls}
                                placeholder="Your full name"
                            />
                        ) : (
                            <div className={readOnlyCls}>{user?.name || '—'}</div>
                        )}
                    </div>

                    <div>
                        <label className="flex items-center gap-1.5 text-xs font-medium text-text-muted mb-2 uppercase tracking-wide">
                            <HiMail className="text-sm" /> Email Address
                        </label>
                        <div className={`${readOnlyCls} ${!editing && 'text-text-secondary'}`}>
                            {user?.email || '—'}
                            {editing && <span className="text-text-muted text-xs ml-2">(cannot change)</span>}
                        </div>
                    </div>

                    <div>
                        <label className="flex items-center gap-1.5 text-xs font-medium text-text-muted mb-2 uppercase tracking-wide">
                            <HiPhone className="text-sm" /> Mobile Number
                        </label>
                        {editing ? (
                            <input
                                type="tel"
                                value={formData.mobile}
                                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                className={inputCls}
                                placeholder="+91 98765 43210"
                            />
                        ) : (
                            <div className={readOnlyCls}>{user?.mobile || 'Not provided'}</div>
                        )}
                    </div>

                    <div>
                        <label className="flex items-center gap-1.5 text-xs font-medium text-text-muted mb-2 uppercase tracking-wide">
                            <HiUser className="text-sm" /> Member Since
                        </label>
                        <div className={readOnlyCls}>
                            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
