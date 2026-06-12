import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './components/Navbar';
import AppRoutes from './routes/AppRoutes';

/**
 * App is our root layout orchestrator.
 * Combines Routing Providers and site-wide components (like our header Navbar).
 */
export default function App() {
  return (
    <BrowserRouter>
      {/* Dynamic Bootstrap Header layout */}
      <Navbar />
      
      {/* Content Canvas Area wrapping different pages */}
      <div className="container-fluid px-0">
        <AppRoutes />
      </div>
    </BrowserRouter>
  );
}
