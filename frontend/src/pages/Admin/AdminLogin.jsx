import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { HiLockClosed, HiMail, HiUser } from 'react-icons/hi';
import { motion } from 'framer-motion';
import useAuth from '../../hooks/useAuth';

export default function AdminLogin() {
    const navigate = useNavigate();
    const { login, register, logout } = useAuth();

    const [isLogin, setIsLogin] = useState(true); // ✅ toggle
    const [name, setName] = useState(''); // ✅ for register
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLogin) {
                // 🔐 LOGIN
                const data = await login({ email, password });

                if (data && data.success) {
                    if (data.user.role === 'admin') {
                        toast.success(`Welcome back, Admin!`);
                        navigate('/admin/dashboard');
                    } else {
                        toast.error('Unauthorized. Admin only.');
                        await logout();
                    }
                }

            } else {
                // 🆕 REGISTER (ADMIN)
                if (!name || !email || !password) {
                    toast.error('All fields required');
                    setLoading(false);
                    return;
                }

                const data = await register({
                    name,
                    email,
                    password,
                    role: 'admin' // ⚠️ force admin
                });

                if (data && data.success) {
                    toast.success('Admin account created!');
                    setIsLogin(true); // switch to login
                }
            }

        } catch (error) {
            toast.error(error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-bg-card border border-border-default rounded-2xl p-8 shadow-2xl relative overflow-hidden"
            >

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        {isLogin ? 'Admin Login' : 'Admin Register'}
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* NAME (only register) */}
                    {!isLogin && (
                        <div className="relative">
                            <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-lg" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-10 py-3 bg-white/5 border rounded-xl text-white"
                                placeholder="Full Name"
                            />
                        </div>
                    )}

                    {/* EMAIL */}
                    <div className="relative">
                        <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-lg" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 py-3 bg-white/5 border rounded-xl text-white"
                            placeholder="Email"
                            required
                        />
                    </div>

                    {/* PASSWORD */}
                    <div className="relative">
                        <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-lg" />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 py-3 bg-white/5 border rounded-xl text-white"
                            placeholder="Password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl"
                    >
                        {loading ? 'Please wait...' : isLogin ? 'Login' : 'Register'}
                    </button>
                </form>

                {/* TOGGLE */}
                <div className="mt-5 text-center text-sm text-text-muted">
                    {isLogin ? "Don't have admin account?" : "Already have account?"}
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="ml-2 text-blue-400"
                    >
                        {isLogin ? 'Register' : 'Login'}
                    </button>
                </div>

            </motion.div>
        </div>
    );
}