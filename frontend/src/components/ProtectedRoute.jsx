import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, saveRedirectPath } from '../utils/authRedirect';

/**
 * ProtectedRoute component that guards routes requiring authentication
 * 
 * Features:
 * - Checks if user is authenticated before allowing access
 * - Saves the intended destination before redirecting to login
 * - Includes a loading state to wait for auth initialization
 * - Prevents race conditions where auth context isn't ready yet
 */
export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Wait a brief moment to ensure auth state is fully initialized
    // This prevents race conditions where the auth token might not be loaded yet
    const timer = setTimeout(() => {
      setAuthChecked(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Show nothing while checking auth state (prevents flash of login page)
  if (!authChecked) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f0faf8 0%, #e8f5f2 100%)',
        }}
      >
        <div style={{ textAlign: 'center', animation: 'pulse 1.5s ease-in-out infinite' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              border: '2px solid var(--accent)',
              borderTop: '2px solid transparent',
              margin: '0 auto 16px',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Checking authentication...
          </p>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  const authenticated = isAuthenticated();

  // If not authenticated, save the intended destination and redirect to login
  if (!authenticated) {
    // Save the current location so we can redirect back after login
    saveRedirectPath(location.pathname, location.search);

    // Redirect to login with the intended destination saved in sessionStorage
    return <Navigate to="/login" replace />;
  }

  // Optional: Check if user role is allowed (if specified)
  if (allowedRoles.length > 0) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!allowedRoles.includes(user.role)) {
      // User is authenticated but doesn't have the required role
      return <Navigate to="/patient/dashboard" replace />;
    }
  }

  // User is authenticated and authorized, render the component
  return children;
}
