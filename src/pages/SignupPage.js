// pages/SignupPage.js
import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { User, Mail, Phone, Calendar, Lock, CheckCircle, AlertCircle, Eye, EyeOff, Sparkles } from 'lucide-react';

function SignupPage() {
  const { login } = useUser();
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    // Email is now required
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone is now optional
    if (formData.phone && !/^\+?[1-9]\d{1,14}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Full name is now optional - only validate if provided
    if (formData.full_name && formData.full_name.trim().length > 0 && formData.full_name.length < 2) {
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
        email: formData.email,
        phone: formData.phone || null,
        full_name: formData.full_name || null,
        display_name: formData.display_name,
        date_of_birth: formData.date_of_birth,
        password: formData.password,
        terms_agreed: formData.terms_agreed
      });

      login(response.data.user, response.data.token);
    } catch (error) {
      console.error('Signup error:', error);
      
      // Enhanced error logging to get more details
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
        
        const { data } = error.response;
        
        if (data.details) {
          if (typeof data.details === 'object') {
            setErrors(data.details);
          } else if (Array.isArray(data.details)) {
            const fieldErrors = {};
            data.details.forEach(msg => {
              const field = msg.toLowerCase().split(' ')[0];
              fieldErrors[field] = msg;
            });
            setErrors(fieldErrors);
          } else {
            setErrors({ general: data.details });
          }
        } else {
          setErrors({ general: data.error || 'Registration failed. Please try again.' });
        }
      } else if (error.request) {
        console.error('Error request:', error.request);
        setErrors({ general: 'Network error. Please check your connection and try again.' });
      } else {
        console.error('Error message:', error.message);
        setErrors({ general: 'Registration failed. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-10">
          <div className="flex justify-center items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Join Our Community</h2>
          <p className="text-lg text-gray-600">Start sharing your opinions with the world</p>
        </div>

        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                <p className="text-red-700 font-medium">{errors.general}</p>
              </div>
            )}

            {/* Contact Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Mail className="h-4 w-4 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Contact Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50'} focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200`}
                      placeholder="your@email.com"
                      required
                    />
                    {errors.email && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      </div>
                    )}
                  </div>
                  {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number <span className="text-gray-400">(Optional)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl border ${errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50'} focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200`}
                      placeholder="+1234567890"
                    />
                    {errors.phone && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      </div>
                    )}
                  </div>
                  {errors.phone && <p className="mt-2 text-sm text-red-600">{errors.phone}</p>}
                  <p className="mt-2 text-xs text-gray-500">Used for account recovery</p>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center">
                  <User className="h-4 w-4 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name <span className="text-gray-400">(Optional & Never Disclosed)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.full_name ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50'} focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200`}
                    placeholder="John Doe"
                  />
                  {errors.full_name && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {errors.full_name && <p className="mt-2 text-sm text-red-600">{errors.full_name}</p>}
                <p className="mt-2 text-xs text-gray-500">This information will never be disclosed to other users</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Display Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="display_name"
                    value={formData.display_name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.display_name ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50'} focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200`}
                    placeholder="JohnD_Writer"
                    required
                  />
                  {errors.display_name && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {errors.display_name && <p className="mt-2 text-sm text-red-600">{errors.display_name}</p>}
                <p className="mt-2 text-xs text-gray-500">This is how other users will see you</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.date_of_birth ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50'} focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200`}
                    required
                  />
                  {errors.date_of_birth && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {errors.date_of_birth && <p className="mt-2 text-sm text-red-600">{errors.date_of_birth}</p>}
                <p className="mt-2 text-xs text-gray-500">You must be at least 15 years old</p>
              </div>
            </div>

            {/* Security */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-pink-100 rounded-xl flex items-center justify-center">
                  <Lock className="h-4 w-4 text-pink-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Security</h3>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 pr-12 rounded-xl border ${errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50'} focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200`}
                    placeholder="Create a strong password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                  </button>
                </div>
                {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
                <p className="mt-2 text-xs text-gray-500">Must be 8+ characters with uppercase, lowercase, and number</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 pr-12 rounded-xl border ${errors.confirm_password ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50'} focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200`}
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                  </button>
                </div>
                {errors.confirm_password && <p className="mt-2 text-sm text-red-600">{errors.confirm_password}</p>}
              </div>
            </div>

            {/* Terms */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-100">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="terms_agreed"
                  checked={formData.terms_agreed}
                  onChange={handleChange}
                  className="mt-1 w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                  required
                />
<div>
  <span className="text-sm font-semibold text-gray-900">
    I agree to the <a 
      href="/community-guidelines" 
      className="text-blue-600 hover:underline"
      target="_blank" 
      rel="noopener noreferrer"
    >
      Community Guidelines
    </a> 
    <span className="text-red-500">*</span>
  </span>
  <p className="text-xs text-gray-600 mt-1">
    By checking this box, you agree to follow our community guidelines.
  </p>
</div>

              </label>
              {errors.terms_agreed && <p className="mt-3 text-sm text-red-600">{errors.terms_agreed}</p>}
            </div>

            {/* Submit */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-4 px-6 rounded-2xl hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-700">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-orange-600 hover:text-orange-700 transition-colors">
              Login Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;