import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchCurrentUser } from '../../store/authSlice';

/**
 * OAuthSuccess — Landing page after Google OAuth redirect.
 * The backend sets an HTTP-only cookie with the JWT token and redirects here
 * with ?token=... in the URL. We:
 * 1. Store the token in Redux (for axios interceptor usage)
 * 2. Fetch the full user profile via /api/auth/me
 * 3. Redirect based on role (user → /, vendor → /vendor/dashboard, admin → /admin/dashboard)
 */
export default function OAuthSuccess() {
    const [params] = useSearchParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const token = params.get('token');

        if (!token) {
            navigate('/login');
            return;
        }

        // The HTTP-only cookie is already set by the backend.
        // We dispatch fetchCurrentUser which will use the cookie to get user data.
        // We also temporarily pass the token via Redux so the axios interceptor picks it up.
        dispatch({ type: 'auth/setToken', payload: token });

        dispatch(fetchCurrentUser()).then((result) => {
            if (fetchCurrentUser.fulfilled.match(result)) {
                const user = result.payload.user;
                // Role-based redirect
                if (user?.role === 'vendor') {
                    navigate('/vendor/dashboard', { replace: true });
                } else if (user?.role === 'admin') {
                    navigate('/admin/dashboard', { replace: true });
                } else {
                    navigate('/', { replace: true });
                }
            } else {
                navigate('/login', { replace: true });
            }
        });
    }, []);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0A0A0F',
            gap: '16px',
        }}>
            <div style={{
                width: 48,
                height: 48,
                border: '3px solid rgba(108,60,225,0.2)',
                borderTopColor: '#6C3CE1',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
            }} />
            <p style={{ color: '#8B8BA3', fontSize: '0.95rem' }}>Signing you in with Google...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
