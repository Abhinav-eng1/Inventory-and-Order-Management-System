/**
 * Protected Route Component
 * 
 * Guards routes from unauthenticated access.
 * If the user is not logged in (no token), it redirects them to the /login page.
 * While verifying authentication status, displays a clean loading indicator.
 */

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { token, loading } = useAuth();

  // Show a loading screen while auth state is being verified
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Verifying session...</p>
      </div>
    );
  }

  // If there is no active token, redirect to Login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Render child routes
  return <Outlet />;
};

export default ProtectedRoute;
