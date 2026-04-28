import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuth from '../hooks/useAuth';
import { HiMenu, HiX, HiUser, HiHeart, HiCalendar, HiSearch, HiOfficeBuilding, HiShieldCheck, HiLogout } from 'react-icons/hi';

export default function Navbar() {
    const { user, logout } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <motion.nav
            className={`fixed top-0 left-0 right-0 z-[1000] py-4 transition-all duration-300 ${scrolled ? 'bg-[rgba(10,10,15,0.85)] backdrop-blur-xl border-b border-border-default shadow-[0_8px_32px_rgba(0,0,0,0.5)] py-2.5' : ''}`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
        >
            <div className="max-w-[1280px] mx-auto px-6 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2.5 no-underline">
                    <div>
                        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-9 h-9">
                            <rect width="32" height="32" rx="8" fill="url(#grad)" />
                            <path d="M8 16L16 8L24 16L16 24L8 16Z" fill="white" fillOpacity="0.9" />
                            <path d="M12 16L16 12L20 16L16 20L12 16Z" fill="url(#grad)" />
                            <defs>
                                <linearGradient id="grad" x1="0" y1="0" x2="32" y2="32">
                                    <stop stopColor="#6C3CE1" />
                                    <stop offset="1" stopColor="#8B5CF6" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <span className="text-[1.4rem] font-extrabold text-white tracking-tight">
                        Event<span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">Book</span>
                    </span>
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    {[
                        { to: '/', label: 'Home' },
                        { to: '/about', label: 'About' },
                        { to: '/venues', label: 'Venues' },
                        { to: '/venues?featured=true', label: 'Featured' },
                        ...(user?.role === 'vendor' ? [{ to: '/vendor/dashboard', label: 'Dashboard' }] : []),
                        ...(user?.role === 'admin' ? [{ to: '/admin/dashboard', label: 'Admin Panel' }] : []),
                    ].map(link => (
                        <Link key={link.to} to={link.to} className="text-sm font-medium text-text-secondary hover:text-white transition-all duration-300 relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-primary after:to-primary-light after:transition-all after:duration-300 hover:after:w-full">
                            {link.label}
                        </Link>
                    ))}
                </div>

                <div className="hidden md:flex items-center gap-2">
                    <Link to="/venues" className="w-10 h-10 flex items-center justify-center rounded-full text-text-secondary text-lg hover:text-white hover:bg-white/[0.08] transition-all duration-300">
                        <HiSearch />
                    </Link>
                    <Link to="/wishlist" className="w-10 h-10 flex items-center justify-center rounded-full text-text-secondary text-lg hover:text-accent hover:bg-accent/10 transition-all duration-300" title="My Liked Venues">
                        <HiHeart />
                    </Link>

                    {user ? (
                        <div className="flex items-center gap-2 ml-2">
                            <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                                <div className="w-[34px] h-[34px] rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white font-bold text-sm">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-full" />
                                    ) : (
                                        user.name?.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <span className="text-white text-sm font-medium">{user.name?.split(' ')[0]}</span>
                            </Link>
                            <button onClick={logout} title="Logout" className="w-[34px] h-[34px] flex items-center justify-center rounded-full bg-white/[0.06] text-text-secondary text-lg hover:bg-red-500/15 hover:text-red-500 transition-all duration-300">
                                <HiLogout />
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="ml-2 inline-flex items-center gap-2 px-[18px] py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-primary to-primary-light text-white shadow-[0_4px_15px_rgba(108,60,225,0.4)] hover:-translate-y-0.5 hover:shadow-[0_6px_25px_rgba(108,60,225,0.5)] transition-all duration-300">
                            <HiUser /> Login
                        </Link>
                    )}
                </div>

                <button className="flex md:hidden w-10 h-10 items-center justify-center bg-transparent text-white text-2xl rounded-xl" onClick={() => setMenuOpen(!menuOpen)}>
                    {menuOpen ? <HiX /> : <HiMenu />}
                </button>
            </div>

            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        className="overflow-hidden bg-[rgba(10,10,15,0.98)] backdrop-blur-xl border-t border-border-default px-6 py-4 flex flex-col gap-1"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {[
                            { to: '/', label: 'Home' },
                            { to: '/about', label: 'About' },
                            { to: '/venues', label: 'Venues' },
                            { to: '/venues?featured=true', label: 'Featured' },
                            { to: '/wishlist', label: 'My Likes' },
                            ...(user?.role === 'vendor' ? [{ to: '/vendor/dashboard', label: 'Dashboard' }] : []),
                            ...(user?.role === 'admin' ? [{ to: '/admin/dashboard', label: 'Admin Panel' }] : []),
                        ].map(link => (
                            <Link key={link.to} to={link.to} className="py-3.5 px-4 text-base font-medium text-text-secondary rounded-xl hover:bg-white/5 hover:text-white transition-all duration-300" onClick={() => setMenuOpen(false)}>
                                {link.label}
                            </Link>
                        ))}

                        {user ? (
                            <>
                                <Link to="/profile" className="flex items-center gap-3 py-3.5 px-4 text-white font-medium hover:bg-white/5 transition-all duration-300" onClick={() => setMenuOpen(false)}>
                                    <div className="w-[34px] h-[34px] rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white font-bold text-sm">
                                        {user.avatar ? (
                                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-full" />
                                        ) : (
                                            user.name?.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <span>{user.name}</span>
                                </Link>
                                <button className="w-full mt-2 inline-flex items-center justify-center gap-2 px-7 py-3 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-primary-light text-white shadow-[0_4px_15px_rgba(108,60,225,0.4)]" onClick={() => { logout(); setMenuOpen(false); }}>
                                    <HiLogout /> Logout
                                </button>
                            </>
                        ) : (
                            <Link to="/login" className="w-full mt-2 inline-flex items-center justify-center gap-2 px-7 py-3 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-primary-light text-white shadow-[0_4px_15px_rgba(108,60,225,0.4)]" onClick={() => setMenuOpen(false)}>
                                <HiUser /> Login / Sign Up
                            </Link>
                        )}


                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}
