import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import { HiMail, HiLockClosed, HiUser, HiPhone, HiEye, HiEyeOff, HiArrowLeft, HiBriefcase } from 'react-icons/hi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Login() {
    const navigate = useNavigate();
    const { login, register } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', mobile: '', password: '', role: 'user' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLogin) {
                const data = await login({ email: formData.email, password: formData.password });
                if (data && data.success) {
                    toast.success('Login successful!');
                    const userRole = data.user?.role || 'user';
                    setTimeout(() => {
                        if (userRole === 'admin') navigate('/admin/dashboard');
                        else if (userRole === 'vendor') navigate('/vendor/dashboard');
                        else navigate('/');
                    }, 500);
                }
            } else {
                if (!formData.name || !formData.email || !formData.password) {
                    toast.error('Please fill all required fields');
                    setLoading(false);
                    return;
                }

                const data = await register({
                    name: formData.name,
                    email: formData.email,
                    mobile: formData.mobile,
                    password: formData.password,
                    role: formData.role
                });

                if (data && data.success) {
                    toast.success('Account created successfully!');
                    const userRole = data.user?.role || formData.role || 'user';
                    setTimeout(() => {
                        if (userRole === 'admin') navigate('/admin/dashboard');
                        else if (userRole === 'vendor') navigate('/vendor/add-venue');
                        else navigate('/');
                    }, 500);
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-10 px-6 relative overflow-hidden">
            <Link to="/" className="fixed top-6 left-6 flex items-center gap-1.5 text-text-secondary text-sm font-medium z-10 hover:text-white transition-all duration-300">
                <HiArrowLeft /> Back to Home
            </Link>

            <motion.div className="grid grid-cols-2 max-md:grid-cols-1 w-full max-w-[960px] bg-bg-card border border-border-default rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative z-[2]" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <div className="p-12 px-10 bg-gradient-to-br from-primary to-primary-light flex flex-col justify-center max-md:hidden">
                    <div className="mb-10">
                        <h1 className="text-[2rem] font-extrabold text-white mb-2">Event<span className="opacity-85">Book</span></h1>
                        <p className="text-white/75 text-[0.95rem]">Find & Book Perfect Event Venues</p>
                    </div>
                </div>

                <div className="p-12 px-10 max-md:p-9 max-md:px-6 flex flex-col justify-center">
                    <div className="mb-6">
                        <h2 className="font-display text-[1.75rem] font-bold text-white mb-1.5">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                        <p className="text-text-secondary text-sm">{isLogin ? 'Login to your account to manage bookings' : 'Join EventBook to start booking venues'}</p>
                    </div>

                    <div className="flex bg-bg-secondary rounded-xl p-1 mb-6">
                        <button className={`flex-1 py-2.5 border-none rounded-lg text-sm font-semibold transition-all duration-300 ${isLogin ? 'bg-gradient-to-r from-primary to-primary-light text-white' : 'bg-transparent text-text-muted'}`} onClick={() => setIsLogin(true)}>Login</button>
                        <button className={`flex-1 py-2.5 border-none rounded-lg text-sm font-semibold transition-all duration-300 ${!isLogin ? 'bg-gradient-to-r from-primary to-primary-light text-white' : 'bg-transparent text-text-muted'}`} onClick={() => setIsLogin(false)}>Sign Up</button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 mb-5">

                        {!isLogin && (
                            <>
                                <div className="flex items-center px-3.5 bg-bg-secondary border border-border-default rounded-xl">
                                    <HiUser className="text-text-muted text-lg shrink-0" />
                                    <input type="text" placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="flex-1 py-3.5 px-3 bg-transparent border-none text-white text-sm outline-none" />
                                </div>

                                <div className="flex items-center px-3.5 bg-bg-secondary border border-border-default rounded-xl">
                                    <HiPhone className="text-text-muted text-lg shrink-0" />
                                    <input type="tel" placeholder="Mobile Number" value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} className="flex-1 py-3.5 px-3 bg-transparent border-none text-white text-sm outline-none" />
                                </div>

                                {/* ✅ ROLE DROPDOWN */}
                                <div className="flex items-center px-3.5 bg-bg-secondary border border-border-default rounded-xl">
                                    <HiBriefcase className="text-text-muted text-lg shrink-0" />
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="flex-1 py-3.5 px-3 bg-transparent border-none text-white text-sm outline-none cursor-pointer appearance-none"
                                    >
                                        <option value="user" className="bg-[#1A1A2E] text-white">Regular User (Book Venues)</option>
                                        <option value="vendor" className="bg-[#1A1A2E] text-white">Vendor (List Venues)</option>
                                        <option value="admin" className="bg-[#1A1A2E] text-white">Admin (Manage Platform)</option>
                                    </select>
                                </div>
                            </>
                        )}

                        <div className="flex items-center px-3.5 bg-bg-secondary border border-border-default rounded-xl">
                            <HiMail className="text-text-muted text-lg shrink-0" />
                            <input type="email" placeholder="Email Address" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required className="flex-1 py-3.5 px-3 bg-transparent border-none text-white text-sm outline-none" />
                        </div>

                        <div className="flex items-center px-3.5 bg-bg-secondary border border-border-default rounded-xl">
                            <HiLockClosed className="text-text-muted text-lg shrink-0" />
                            <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required className="flex-1 py-3.5 px-3 bg-transparent border-none text-white text-sm outline-none" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <HiEyeOff /> : <HiEye />}
                            </button>
                        </div>

                        <button type="submit" className="w-full mt-1 py-4 bg-primary text-white rounded-2xl">
                            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Sign Up'}
                        </button>
                    </form>

                    <p className="text-center text-text-secondary text-sm">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button onClick={() => setIsLogin(!isLogin)}>
                            {isLogin ? 'Sign Up' : 'Login'}
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}