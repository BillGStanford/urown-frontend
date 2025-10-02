// pages/LoginPage.js

import React, { useState, useContext, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/UserContext';

function LoginPage() {
  const { login } = useUser();
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  // Check for error in URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const errorParam = params.get('error');
    if (errorParam) {
      setErrors({ general: decodeURIComponent(errorParam) });
    }
  }, [location.search]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.identifier.trim()) {
      newErrors.identifier = 'Email or display name is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await axios.post('/auth/login', {
        identifier: formData.identifier,
        password: formData.password
      });

      // Use login from context
      login(response.data.user, response.data.token);
    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.data?.error) {
        setErrors({ general: error.response.data.error });
      } else {
        setErrors({ general: 'Login failed. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold mb-4">WELCOME BACK</h1>
        <p className="text-2xl font-bold">Login to continue sharing your opinions</p>
      </div>

      <div className="bg-gray-50 p-12 border-2 border-black">
        <form onSubmit={handleSubmit} className="space-y-8">
          {errors.general && (
            <div className="error-message text-center text-2xl">
              {errors.general}
            </div>
          )}

          <div>
            <label className="form-label">EMAIL OR DISPLAY NAME *</label>
            <input
              type="text"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter your email or display name"
              required
              autoComplete="username"
            />
            {errors.identifier && <div className="error-message">{errors.identifier}</div>}
          </div>

          <div>
            <label className="form-label">PASSWORD *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>

          <div className="text-center">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-3xl px-16 py-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'LOGGING IN...' : 'LOGIN'}
            </button>
          </div>
        </form>
      </div>

      <div className="text-center mt-12 space-y-4">
        <p className="text-xl font-bold">
          Don't have an account?{' '}
          <Link to="/signup" className="underline hover:no-underline">
            SIGN UP HERE
          </Link>
        </p>
        
        <p className="text-lg font-bold text-gray-600">
          Forgot your password? Contact support for assistance.
        </p>
      </div>
    </div>
  );
}

export default LoginPage;