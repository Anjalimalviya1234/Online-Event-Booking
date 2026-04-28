import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * ProtectedRoute - Guards routes based on authentication and role.
 *
 * @param {React.ReactNode} children - The page component to render
 * @param {string[]} allowedRoles - Array of roles allowed (e.g., ['vendor'], ['admin'], ['user','vendor','admin'])
 * @param {string} redirectTo - Where to redirect if unauthorized (defaults to '/login')
 */
export default function ProtectedRoute({ children, allowedRoles, redirectTo = '/login' }) {
    const { user, loading } = useSelector((state) => state.auth);

    // Still bootstrapping auth — show nothing (App.jsx already shows a spinner)
    if (loading) return null;

    // Not logged in
    if (!user) {
        return <Navigate to={redirectTo} replace />;
    }

    // Logged in but role not allowed
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect role-specific users to their dashboard instead of a generic 403
        if (user.role === 'vendor') return <Navigate to="/vendor/dashboard" replace />;
        if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
        return <Navigate to="/" replace />;
    }

    return children;
}
