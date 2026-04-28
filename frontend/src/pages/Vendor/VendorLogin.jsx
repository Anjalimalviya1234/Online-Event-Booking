import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuth from '../../hooks/useAuth';
import { HiMail, HiLockClosed, HiEye, HiEyeOff, HiOfficeBuilding, HiArrowLeft, HiUser, HiPhone, HiLocationMarker, HiDocumentText, HiUsers, HiCheck, HiArrowRight, HiClock } from 'react-icons/hi';

const venueTypes = [
    { value: 'banquet', label: 'Banquet Hall' },
    { value: 'lawn', label: 'Lawn / Garden' },
    { value: 'resort', label: 'Resort' },
    { value: 'hotel', label: 'Hotel' },
    { value: 'farmhouse', label: 'Farmhouse' },
    { value: 'community-hall', label: 'Community Hall' },
    { value: 'marriage-garden', label: 'Marriage Garden' },
];

export default function VendorLogin() {
    const navigate = useNavigate();
    const { login, register, logout, user } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState(1); // 1: Personal, 2: Business, 3: Success

    const [formData, setFormData] = useState({
        name: '', email: '', mobile: '', password: '',
        businessName: '',
        vendorDetails: {
            city: '', address: '', venueType: '', description: '', estimatedCapacity: '', experience: ''
        }
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        setLoading(true);
        try {
            if (isLogin) {
                const data = await login({ email: formData.email, password: formData.password });
                if (data && data.success) {
                    if (data.user.role !== 'vendor' && data.user.role !== 'admin') {
                        setError('Access denied. This account is not a vendor account.');
                        await logout(true);
                        setLoading(false);
                        return;
                    }
                    if (data.user.vendorStatus === 'pending') {
                        setStep(3); // Show pending screen
                        setLoading(false);
                        return;
                    }
                    if (data.user.vendorStatus === 'rejected') {
                        setError('Your vendor application was rejected. Please contact support.');
                        await logout(true);
                        setLoading(false);
                        return;
                    }
                    navigate('/vendor/dashboard');
                }
            } else {
                // Step 1 validation
                if (step === 1) {
                    if (!formData.name || !formData.email || !formData.mobile || !formData.password) {
                        setError('Please fill all required fields');
                        setLoading(false);
                        return;
                    }
                    if (formData.password.length < 6) {
                        setError('Password must be at least 6 characters');
                        setLoading(false);
                        return;
                    }
                    setStep(2);
                    setLoading(false);
                    return;
                }

                // Step 2 validation
                if (!formData.businessName) { setError('Business name is required'); setLoading(false); return; }
                if (!formData.vendorDetails.city) { setError('City is required'); setLoading(false); return; }
                if (!formData.vendorDetails.venueType) { setError('Please select venue type'); setLoading(false); return; }

                const data = await register({
                    name: formData.name,
                    email: formData.email,
                    mobile: formData.mobile,
                    password: formData.password,
                    role: 'vendor',
                    businessName: formData.businessName,
                    vendorDetails: { ...formData.vendorDetails, estimatedCapacity: Number(formData.vendorDetails.estimatedCapacity) || undefined }
                });

                if (data && data.success) setStep(3); // Show success/pending screen
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally { setLoading(false); }
    };

    const updateVendorDetails = (field, value) => {
        setFormData(prev => ({ ...prev, vendorDetails: { ...prev.vendorDetails, [field]: value } }));
    };

    const inputCls = "flex items-center px-3.5 bg-bg-secondary border border-border-default rounded-xl transition-all duration-300 focus-within:border-accent-emerald focus-within:shadow-[0_0_0_3px_rgba(16,185,129,0.15)]";
    const inputInner = "flex-1 py-3.5 px-3 bg-transparent border-none text-white text-sm outline-none placeholder:text-text-muted";
    const labelCls = "block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wide";

    if (step === 3) {
        return (
            <div className="min-h-screen flex items-center justify-center p-10 px-6 relative overflow-hidden">
                <motion.div className="w-full max-w-lg bg-bg-card border border-border-default rounded-3xl p-10 text-center relative z-[2] shadow-[0_8px_32px_rgba(0,0,0,0.5)]" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent-gold/15 flex items-center justify-center">
                        <HiClock className="text-accent-gold text-4xl" />
                    </div>
                    <h2 className="font-display text-2xl font-bold text-white mb-3">Application Under Review</h2>
                    <p className="text-text-secondary text-sm mb-6 leading-relaxed max-w-sm mx-auto">
                        Thank you for registering! Your venue owner application is being reviewed by our team. You'll receive an email once approved.
                    </p>
                    <div className="bg-white/[0.03] border border-border-default rounded-xl p-5 mb-6 text-left space-y-2.5">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-accent-emerald/15 flex items-center justify-center shrink-0"><HiCheck className="text-accent-emerald" /></div>
                            <span className="text-text-secondary text-sm">Account created successfully</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-accent-gold/15 flex items-center justify-center shrink-0"><HiClock className="text-accent-gold text-sm" /></div>
                            <span className="text-text-secondary text-sm">Admin verification in progress</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center shrink-0 text-text-muted text-xs">3</div>
                            <span className="text-text-muted text-sm">Dashboard access after approval</span>
                        </div>
                    </div>
                    <p className="text-text-muted text-xs mb-6">Typically takes 24-48 hours</p>
                    <Link to="/" className="inline-flex items-center gap-2 px-7 py-3 text-sm font-semibold rounded-xl bg-gradient-to-r from-accent-emerald to-teal-500 text-white shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:-translate-y-0.5 transition-all duration-300">
                        <HiArrowLeft /> Back to Home
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-10 px-6 relative overflow-hidden">
            <Link to="/" className="fixed top-6 left-6 flex items-center gap-1.5 text-text-secondary text-sm font-medium z-10 hover:text-white transition-all duration-300"><HiArrowLeft /> Back to Home</Link>
            <motion.div className="grid grid-cols-2 max-md:grid-cols-1 w-full max-w-[960px] bg-bg-card border border-border-default rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative z-[2]" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <div className="p-12 px-10 bg-gradient-to-br from-accent-emerald to-teal-500 flex flex-col justify-center max-md:hidden">
                    <div className="mb-10"><h1 className="text-[2rem] font-extrabold text-white mb-2">Event<span className="opacity-85">Book</span></h1><p className="text-white/75 text-[0.95rem]">Venue Owner Portal</p></div>
                </div>
                <div className="p-12 px-10 max-md:p-9 max-md:px-6 flex flex-col justify-center">
                    <div className="mb-5">
                        <h2 className="font-display text-[1.75rem] font-bold text-white mb-1.5">
                            {isLogin ? 'Venue Owner Login' : (step === 1 ? 'Register — Step 1 of 2' : 'Register — Step 2 of 2')}
                        </h2>
                        <p className="text-text-secondary text-sm">
                            {isLogin ? 'Access your venue management dashboard' : (step === 1 ? 'Your personal details' : 'Your venue & business details')}
                        </p>
                    </div>

                    {/* Login/Register Toggle */}
                    <div className="flex bg-bg-secondary rounded-xl p-1 mb-5">
                        <button className={`flex-1 py-2.5 border-none rounded-lg text-sm font-semibold transition-all duration-300 ${isLogin ? 'bg-gradient-to-r from-accent-emerald to-teal-500 text-white' : 'bg-transparent text-text-muted'}`} onClick={() => { setIsLogin(true); setError(''); setStep(1); }}>Login</button>
                        <button className={`flex-1 py-2.5 border-none rounded-lg text-sm font-semibold transition-all duration-300 ${!isLogin ? 'bg-gradient-to-r from-accent-emerald to-teal-500 text-white' : 'bg-transparent text-text-muted'}`} onClick={() => { setIsLogin(false); setError(''); setStep(1); }}>Register</button>
                    </div>

                    {error && (<motion.div className="p-3 mb-4 bg-accent/10 border border-accent/20 rounded-xl text-accent text-sm" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>{error}</motion.div>)}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 mb-4">
                        <AnimatePresence mode="wait">
                            {isLogin && (
                                <motion.div key="login" className="flex flex-col gap-3.5" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                    <div className={inputCls}><HiMail className="text-text-muted text-lg shrink-0" /><input type="email" placeholder="Email Address" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required className={inputInner} /></div>
                                    <div className={inputCls}>
                                        <HiLockClosed className="text-text-muted text-lg shrink-0" />
                                        <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required className={inputInner} />
                                        <button type="button" className="bg-transparent border-none text-text-muted text-lg p-1 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <HiEyeOff /> : <HiEye />}</button>
                                    </div>
                                </motion.div>
                            )}

                            {!isLogin && step === 1 && (
                                <motion.div key="step1" className="flex flex-col gap-3.5" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                    <div className={inputCls}><HiUser className="text-text-muted text-lg shrink-0" /><input type="text" placeholder="Full Name *" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className={inputInner} /></div>
                                    <div className={inputCls}><HiMail className="text-text-muted text-lg shrink-0" /><input type="email" placeholder="Email Address *" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required className={inputInner} /></div>
                                    <div className={inputCls}><HiPhone className="text-text-muted text-lg shrink-0" /><input type="tel" placeholder="Mobile Number *" value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} required className={inputInner} /></div>
                                    <div className={inputCls}>
                                        <HiLockClosed className="text-text-muted text-lg shrink-0" />
                                        <input type={showPassword ? 'text' : 'password'} placeholder="Password (min 6 chars) *" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required minLength={6} className={inputInner} />
                                        <button type="button" className="bg-transparent border-none text-text-muted text-lg p-1 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <HiEyeOff /> : <HiEye />}</button>
                                    </div>
                                </motion.div>
                            )}

                            {!isLogin && step === 2 && (
                                <motion.div key="step2" className="flex flex-col gap-3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                    <div>
                                        <label className={labelCls}>Business / Venue Name *</label>
                                        <div className={inputCls}><HiOfficeBuilding className="text-text-muted text-lg shrink-0" /><input type="text" placeholder="e.g. Royal Gardens Banquet" value={formData.businessName} onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} required className={inputInner} /></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className={labelCls}>City *</label>
                                            <div className={inputCls}><HiLocationMarker className="text-text-muted text-lg shrink-0" /><input type="text" placeholder="e.g. Bhopal" value={formData.vendorDetails.city} onChange={(e) => updateVendorDetails('city', e.target.value)} required className={inputInner} /></div>
                                        </div>
                                        <div>
                                            <label className={labelCls}>Venue Type *</label>
                                            <select value={formData.vendorDetails.venueType} onChange={(e) => updateVendorDetails('venueType', e.target.value)} required className="w-full px-3.5 py-3.5 bg-bg-secondary border border-border-default rounded-xl text-white text-sm outline-none focus:border-accent-emerald transition-all [&>option]:bg-bg-card">
                                                <option value="">Select type</option>
                                                {venueTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex gap-3 mt-1">
                            {!isLogin && step === 2 && (
                                <button type="button" onClick={() => { setStep(1); setError(''); }} className="px-5 py-3.5 bg-white/[0.06] border border-border-default rounded-2xl text-text-secondary text-sm font-semibold hover:text-white transition-all duration-300">
                                    <HiArrowLeft className="inline mr-1" /> Back
                                </button>
                            )}
                            <button type="submit" className="flex-1 inline-flex items-center justify-center gap-2 px-9 py-3.5 text-base font-semibold rounded-2xl bg-gradient-to-r from-accent-emerald to-teal-500 text-white shadow-[0_4px_15px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50">
                                {loading ? 'Please wait...' : (isLogin ? <>Sign In</> : step === 1 ? 'Continue' : 'Submit Application')}
                            </button>
                        </div>
                    </form>

                    <div className="flex justify-center text-sm mt-4">
                        <Link to="/login" className="text-text-secondary hover:text-white transition-all duration-300">← Back to Customer Login</Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}