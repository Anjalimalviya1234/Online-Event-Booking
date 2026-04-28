import { Link } from 'react-router-dom';
import { HiX, HiLogout, HiOfficeBuilding } from 'react-icons/hi';

export default function VendorSidebar({ navItems, activeNav, setActiveNav, sidebarOpen, setSidebarOpen, vendorUser, reviews, onLogout }) {
    return (
        <aside className={`fixed top-0 left-0 h-full w-[260px] bg-bg-secondary border-r border-border-default flex flex-col z-50 transition-transform duration-300 max-lg:${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
            <div className="p-5 pb-4 border-b border-border-default flex items-center justify-between">
                <Link to="/" className="text-xl font-extrabold text-white">Event<span className="bg-gradient-to-r from-accent-emerald to-teal-500 bg-clip-text text-transparent">Book</span></Link>
                <span className="px-2.5 py-0.5 bg-accent-emerald/15 text-accent-emerald text-[0.65rem] font-bold rounded-full uppercase tracking-wider">Vendor</span>
                <button className="lg:hidden text-text-muted text-xl" onClick={() => setSidebarOpen(false)}><HiX /></button>
            </div>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {navItems.map(item => (
                    <button key={item.id} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 border-none cursor-pointer ${activeNav === item.id ? 'bg-accent-emerald/15 text-accent-emerald' : 'text-text-secondary hover:bg-white/5 hover:text-white bg-transparent'}`} onClick={() => { setActiveNav(item.id); setSidebarOpen(false); }}>
                        {item.icon}<span>{item.label}</span>
                        {item.id === 'reviews' && reviews.length > 0 && (
                            <span className="ml-auto px-2 py-0.5 bg-accent-gold/20 text-accent-gold text-[10px] font-bold rounded-full">{reviews.length}</span>
                        )}
                    </button>
                ))}
            </nav>
            <div className="p-4 border-t border-border-default">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 flex items-center justify-center rounded-full bg-accent-emerald/15 text-accent-emerald text-lg"><HiOfficeBuilding /></div>
                    <div><p className="text-sm font-medium text-white">{vendorUser?.name || 'Venue Owner'}</p><p className="text-xs text-text-muted">Venue Partner</p></div>
                </div>
                <button className="w-full flex items-center justify-center gap-2 py-2 bg-white/5 border border-border-default rounded-xl text-text-secondary text-sm hover:text-accent hover:border-accent/20 transition-all duration-300" onClick={onLogout}><HiLogout /> Logout</button>
            </div>
        </aside>
    );
}
