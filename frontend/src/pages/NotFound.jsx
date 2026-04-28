import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { HiHome, HiSearch } from 'react-icons/hi';

export default function NotFound() {
    return (
        <>
            <Navbar />
            <main className="pt-[100px] min-h-screen flex items-center justify-center pb-20">
                <motion.div className="text-center px-6" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="text-[8rem] max-md:text-[5rem] font-extrabold bg-gradient-to-br from-primary to-primary-light bg-clip-text text-transparent leading-none mb-2">404</div>
                    <h1 className="text-2xl font-bold text-white mb-3">Page Not Found</h1>
                    <p className="text-text-secondary text-sm mb-8 max-w-md mx-auto">
                        Oops! The page you're looking for doesn't exist or has been moved. Let's get you back on track.
                    </p>
                    <div className="flex items-center gap-4 justify-center max-sm:flex-col">
                        <Link to="/" className="inline-flex items-center gap-2 px-7 py-3 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-primary-light text-white shadow-[0_4px_15px_rgba(108,60,225,0.4)] hover:-translate-y-0.5 hover:shadow-[0_6px_25px_rgba(108,60,225,0.5)] transition-all duration-300">
                            <HiHome /> Go Home
                        </Link>
                        <Link to="/venues" className="inline-flex items-center gap-2 px-7 py-3 text-base font-semibold rounded-xl bg-white/[0.06] border border-border-default text-text-secondary hover:text-white hover:border-border-light transition-all duration-300">
                            <HiSearch /> Browse Venues
                        </Link>
                    </div>
                </motion.div>
            </main>
        </>
    );
}
