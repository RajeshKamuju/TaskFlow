import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * ProtectedRoute Component secures user pages.
 * If the user has a valid 'token' saved, they can view children pages.
 * Otherwise, they get redirected to the login page immediately.
 */
export default function ProtectedRoute() {
  const token = localStorage.getItem('token');

  // If token is missing, redirect user to the public /login route
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Outlet renders the nested child routes configured inside our router rules!
  return <Outlet />;
}
