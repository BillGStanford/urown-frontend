import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/UserContext';

function SignupPage() {
  const { login } = useUser(); // Changed from handleLogin to login
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    full_name: '',
    display_name: '',
    date_of_birth: '',
    password: '',
    confirm_password: '',
    terms_agreed: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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

    if (!formData.email && !formData.phone) {
      newErrors.contact = 'Either email or phone number is required';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.full_name.trim() || formData.full_name.length < 2) {
      newErrors.full_name = 'Full name must be at least 2 characters';
    }

    if (!formData.display_name.trim() || formData.display_name.length < 2) {
      newErrors.display_name = 'Display name must be at least 2 characters';
    }

    if (!formData.date_of_birth) {
      newErrors.date_of_birth = 'Date of birth is required';
    } else {
      const birthDate = new Date(formData.date_of_birth);
      const today = new Date();
      const age = Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
      if (age < 15) {
        newErrors.date_of_birth = 'You must be at least 15 years old';
      }
    }

    if (!formData.password || formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    if (!formData.terms_agreed) {
      newErrors.terms_agreed = 'You must agree to the terms of service';
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
      const response = await axios.post('/auth/signup', {
        email: formData.email || null,
        phone: formData.phone || null,
        full_name: formData.full_name,
        display_name: formData.display_name,
        date_of_birth: formData.date_of_birth,
        password: formData.password,
        terms_agreed: formData.terms_agreed
      });

      // Use login from context (changed from handleLogin)
      login(response.data.user, response.data.token);
    } catch (error) {
      console.error('Signup error:', error);
      if (error.response?.data?.error) {
        setErrors({ general: error.response.data.error });
      } else {
        setErrors({ general: 'Registration failed. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold mb-4">JOIN UROWN</h1>
        <p className="text-2xl font-bold">Start sharing your opinions with the world</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {errors.general && (
          <div className="error-message text-center text-2xl">
            {errors.general}
          </div>
        )}

        {/* Contact Information */}
        <div className="bg-gray-50 p-8 border-2 border-black">
          <h2 className="text-3xl font-bold mb-6">CONTACT INFORMATION</h2>
          
          {errors.contact && (
            <div className="error-message mb-4">{errors.contact}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">EMAIL (REQUIRED)</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="your@email.com"
              />
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>

            <div>
              <label className="form-label">PHONE NUMBER (REQUIRED)</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input-field"
                placeholder="+1234567890"
              />
              {errors.phone && <div className="error-message">{errors.phone}</div>}
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-gray-50 p-8 border-2 border-black">
          <h2 className="text-3xl font-bold mb-6">PERSONAL INFORMATION</h2>
          
          <div className="space-y-6">
            <div>
              <label className="form-label">NAME (OPTIONAL & NEVER DISCLOSED) *</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="input-field"
                placeholder="John Doe"
                required
              />
              {errors.full_name && <div className="error-message">{errors.full_name}</div>}
            </div>

            <div>
              <label className="form-label">DISPLAY NAME *</label>
              <input
                type="text"
                name="display_name"
                value={formData.display_name}
                onChange={handleChange}
                className="input-field"
                placeholder="JohnD_Writer"
                required
              />
              {errors.display_name && <div className="error-message">{errors.display_name}</div>}
              <p className="text-lg font-bold mt-2 text-gray-600">
                This is how other users will see you
              </p>
            </div>

            <div>
              <label className="form-label">DATE OF BIRTH *</label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                className="input-field"
                required
              />
              {errors.date_of_birth && <div className="error-message">{errors.date_of_birth}</div>}
              <p className="text-lg font-bold mt-2 text-gray-600">
                You must be at least 15 years old
              </p>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-gray-50 p-8 border-2 border-black">
          <h2 className="text-3xl font-bold mb-6">SECURITY</h2>
          
          <div className="space-y-6">
            <div>
              <label className="form-label">PASSWORD *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field"
                placeholder="Create a strong password"
                required
              />
              {errors.password && <div className="error-message">{errors.password}</div>}
              <p className="text-lg font-bold mt-2 text-gray-600">
                Must be 8+ characters with uppercase, lowercase, and number
              </p>
            </div>

            <div>
              <label className="form-label">CONFIRM PASSWORD *</label>
              <input
                type="password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                className="input-field"
                placeholder="Confirm your password"
                required
              />
              {errors.confirm_password && <div className="error-message">{errors.confirm_password}</div>}
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="bg-gray-50 p-8 border-2 border-black">
          <label className="flex items-start space-x-4">
            <input
              type="checkbox"
              name="terms_agreed"
              checked={formData.terms_agreed}
              onChange={handleChange}
              className="mt-2 w-6 h-6"
              required
            />
            <div>
              <span className="text-2xl font-bold">
                I AGREE TO THE TERMS OF SERVICE *
              </span>
              <p className="text-lg font-bold mt-2 text-gray-600">
                By checking this box, you agree to follow our community guidelines and terms of service
              </p>
            </div>
          </label>
          {errors.terms_agreed && <div className="error-message mt-4">{errors.terms_agreed}</div>}
        </div>

        {/* Submit */}
        <div className="text-center">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary text-3xl px-16 py-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
          </button>
        </div>
      </form>

      <div className="text-center mt-12">
        <p className="text-xl font-bold">
          Already have an account?{' '}
          <Link to="/login" className="underline hover:no-underline">
            LOGIN HERE
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;