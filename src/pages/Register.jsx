import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

/**
 * Register Page provides new user registration.
 */
export default function Register() {
  const navigate = useNavigate();
  
  // Local state for tracking form input values
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Local state for UI feedback (error messages and loading spinners)
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Updates form state dynamically on user keypress
  const handleChange = (e) => {
    const { name, value} = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when typing to keep user experience smooth
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setGeneralError('');
  };

  // Perform client-side validation checks before bothering the server
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please provide a valid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      // Create request payload matching Java Register Dto fields
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password
      };

      // Make API Post Request
      const response = await api.post('/auth/register', payload);

      // Save token + details to localStorage
      const { token, name, email } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('userName', name);
      localStorage.setItem('userEmail', email);

      // Redirect user to Main tasks workspace
      navigate('/');
    } catch (err) {
      console.error('Registration failed:', err);
      // Capture error response message or fall back gracefully
      if (err.response && err.response.data) {
        const serverError = err.response.data.message || err.response.data.error;
        // If there are detailed validation field errors from Spring Validation
        if (err.response.data.details) {
          setErrors(err.response.data.details);
        } else {
          setGeneralError(serverError || 'Registration failed. Please check your credentials.');
        }
      } else {
        setGeneralError('Could not reach server. Please make sure the backend is active.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-5 fade-in-element">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-5">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body p-5">
              
              {/* Branding Header */}
              <div className="text-center mb-4">
                <h3 className="fw-bold text-dark">Create Account</h3>
                <p className="text-muted text-sm">Join the internship Task Management workspace</p>
              </div>

              {/* General Alert Banner */}
              {generalError && (
                <div className="alert alert-danger mb-4 rounded-3 text-sm py-2" role="alert">
                  {generalError}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                {/* Name Input */}
                <div className="mb-3">
                  <label className="form-label text-secondary fw-semibold">Name</label>
                  <input
                    type="text"
                    name="name"
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                  {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>

                {/* Email Input */}
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

                {/* Password Input */}
                <div className="mb-3">
                  <label className="form-label text-secondary fw-semibold">Password</label>
                  <input
                    type="password"
                    name="password"
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </div>

                {/* Confirm Password Input */}
                <div className="mb-4">
                  <label className="form-label text-secondary fw-semibold">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                </div>

                {/* Submit Register Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary w-full py-2.5 fw-bold rounded-3 mb-3 d-flex align-items-center justify-content-center"
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Registering...
                    </>
                  ) : (
                    'Register'
                  )}
                </button>
              </form>

              {/* Navigation link back to SignIn */}
              <div className="text-center mt-3">
                <span className="text-muted">Already have an account? </span>
                <Link to="/login" className="text-primary text-decoration-none fw-semibold">Log In</Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
