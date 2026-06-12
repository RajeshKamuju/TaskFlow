import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

/**
 * Login page component manages user authorization with user email and password keys.
 */
export default function Login() {
  const navigate = useNavigate();

  // Local state for tracking login variables
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setGeneralError('');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email Address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please provide a valid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Connect to Login API endpoint
      const response = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password
      });

      // Save credentials standard payload
      const { token, name, email } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('userName', name);
      localStorage.setItem('userEmail', email);

      // Successfully redirected to main interface workspace
      navigate('/');
    } catch (err) {
      console.error('Login failed:', err);
      if (err.response && err.response.data) {
        setGeneralError(err.response.data.message || 'Invalid email or password');
      } else {
        setGeneralError('Could not connect to database server. Please check if your backend is currently active.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-5 fade-in-element">
      <div className="row justify-content-center mt-4">
        <div className="col-12 col-md-8 col-lg-5">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body p-5">
              
              {/* BRANDING HEADER */}
              <div className="text-center mb-4">
                <h3 className="fw-bold text-dark">Sign In</h3>
                <p className="text-muted text-sm">Welcome back! Manage your coding assignment achievements</p>
              </div>

              {/* GENERAL ALERT BANNER */}
              {generalError && (
                <div className="alert alert-danger mb-4 rounded-3 text-sm py-2" role="alert">
                  {generalError}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                {/* Email address field */}
                <div className="mb-3">
                  <label className="form-label text-secondary fw-semibold">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>

                {/* Password input field */}
                <div className="mb-4">
                  <label className="form-label text-secondary fw-semibold">Password</label>
                  <input
                    type="password"
                    name="password"
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    placeholder="Your password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </div>

                {/* Submit connection trigger */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary w-full py-2.5 fw-bold rounded-3 mb-3 d-flex align-items-center justify-content-center"
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Signing In...
                    </>
                  ) : (
                    'Log In'
                  )}
                </button>
              </form>

              {/* Redirect link to Register */}
              <div className="text-center mt-3">
                <span className="text-muted">New user page? </span>
                <Link to="/register" className="text-primary text-decoration-none fw-semibold">Register account</Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
