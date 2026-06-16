import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getBackendMode, toggleBackendMode } from '../services/api';

/**
 * Navbar component for general page headers.
 * Standard Bootstrap styling.
 */
export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userName = localStorage.getItem('userName') || 'User';
  const backendMode = getBackendMode();

  const handleLogout = () => {
    // 1. Wipe out any persistent tokens and session variables
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');

    // 2. Head back to Login page
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark py-3 shadow-sm">
      <div className="container">
        {/* Brand Link */}
        <Link className="navbar-brand fw-bold d-flex align-items-center" to="/">
          <span className="bg-primary text-white px-2 py-1 rounded me-2">TM</span>
          Task Manager
        </Link>

        {/* Toggle Button for Mobile viewports */}
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#taskNavbarContent" 
          aria-controls="taskNavbarContent" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Dynamic menu items depending on current authentication state */}
        <div className="collapse navbar-collapse" id="taskNavbarContent">
          {/* Backend Connection Indicator Dashboard */}
          <div className="d-flex align-items-center me-auto ms-lg-3 my-2 my-lg-0">
            <span className="navbar-text text-muted me-2 text-sm d-none d-lg-inline">Connection:</span>
            <button 
              onClick={toggleBackendMode} 
              className={`btn btn-sm py-1 px-3 rounded-pill text-xs fw-semibold ${
                backendMode === 'springboot' 
                  ? 'btn-success text-white' 
                  : 'btn-outline-info text-info'
              }`}
              title="Click to toggle between Mock and Live Spring Boot server"
              style={{ fontSize: '0.75rem' }}
            >
              {backendMode === 'springboot' ? '⚡ Spring Boot API (Port 8080)' : '🟢 Sandbox Database'}
            </button>
          </div>

          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center">
            {token ? (
              <>
                <li className="nav-item">
                  <span className="navbar-text text-light me-3">
                    Welcome, <strong className="text-primary">{userName}</strong>!
                  </span>
                </li>
                <li className="nav-item">
                  <button 
                    onClick={handleLogout} 
                    className="btn btn-outline-danger btn-sm"
                    id="logout-button"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link btn btn-primary text-white btn-sm px-3 ms-2" to="/register">Sign Up</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

