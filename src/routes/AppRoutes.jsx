import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import ProtectedRoute from './ProtectedRoute';

/**
 * AppRoutes defines url routing rules.
 * Uses ProtectedRoute wrappers for safe account administration.
 */
export default function AppRoutes() {
  return (
    <Routes>
      {/* PUBLIC PATHS (Sign in / Registration) */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* SECURED PATHS (Requires user authentication token) */}
      <Route element={<ProtectedRoute />}>
        {/* Render our core task dashboard page under root path */}
        <Route path="/" element={<Dashboard />} />
      </Route>

      {/* REDIRECT FALLBACK: Any other address defaults route visitors to Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
