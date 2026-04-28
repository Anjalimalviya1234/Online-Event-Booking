import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { fetchCurrentUser } from './store/authSlice';
import Home from './pages/HomePage/Home';
import Login from './pages/Auth/Login';
import Venues from './pages/Venues/Venues';
import VenueDetail from './pages/Venues/VenueDetail';
import VendorLogin from './pages/Vendor/VendorLogin';
import VendorDashboard from './pages/Vendor/VendorDashboard';
import AddVenue from './pages/Vendor/AddVenue';
import AdminLogin from './pages/Admin/AdminLogin';
import AdminDashboard from './pages/Admin/AdminDashboard';
import Profile from './pages/Profile/Profile';
import Wishlist from './pages/Wishlist/Wishlist';
import About from './pages/About/About';
import Contact from './pages/Contact/Contact';
import OAuthSuccess from './pages/Auth/OAuthSuccess';
import NotFound from './pages/NotFound';
import Onboarding from './components/Onboarding';
import HelpSupport from './pages/HelpSupport/HelpSupport';

function App() {
    const dispatch = useDispatch();
    const { loading } = useSelector((state) => state.auth);

    // Bootstrap auth: fetch the current user on app load using the HTTP-only cookie
    useEffect(() => {
        dispatch(fetchCurrentUser());
    }, [dispatch]);

    // Show a loading spinner while authenticating to prevent UI flicker
    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#0A0A0F',
            }}>
                <div style={{
                    width: 48,
                    height: 48,
                    border: '3px solid rgba(108,60,225,0.2)',
                    borderTopColor: '#6C3CE1',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <>
            <Onboarding />
            <Toaster position="top-right" toastOptions={{ style: { background: '#1A1A2E', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' } }} />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/oauth-success" element={<OAuthSuccess />} />
                <Route path="/venues" element={<Venues />} />
                <Route path="/venues/:id" element={<VenueDetail />} />
                <Route path="/list-your-venue" element={<VendorLogin />} />
                <Route path="/vendor" element={<VendorLogin />} />
                <Route path="/vendor/dashboard" element={<VendorDashboard />} />
                <Route path="/vendor/add-venue" element={<AddVenue />} />
                <Route path="/vendor/edit-venue/:id" element={<AddVenue />} />
                <Route path="/admin" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/help" element={<HelpSupport />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </>
    );
}

export default App;
