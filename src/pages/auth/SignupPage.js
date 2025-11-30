import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../../context/UserContext';
import { Mail, Phone, User, Calendar, Lock, CheckCircle, AlertCircle, ChevronRight, MessageCircle, Info, Sparkles, Zap, Shield } from 'lucide-react';

function SignupPage() {
  const { login } = useUser();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    full_name: '',
    display_name: '',
    discord_username: '',
    date_of_birth: '',
    password: '',
    confirm_password: '',
    terms_agreed: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showDiscordTooltip, setShowDiscordTooltip] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Invalid email address';

    if (formData.phone && !/^\+?[1-9]\d{1,14}$/.test(formData.phone.replace(/\s/g, '')))
      newErrors.phone = 'Invalid phone number';

    if (formData.full_name && formData.full_name.trim().length < 2)
      newErrors.full_name = 'Name too short';

    if (!formData.display_name.trim() || formData.display_name.length < 2)
      newErrors.display_name = 'Display name required (min 2 chars)';

    if (formData.discord_username && formData.discord_username.trim().length < 2)
      newErrors.discord_username = 'Discord username too short';

    if (!formData.date_of_birth) {
      newErrors.date_of_birth = 'Date of birth required';
    } else {
      const age = Math.floor((new Date() - new Date(formData.date_of_birth)) / (365.25 * 24 * 60 * 60 * 1000));
      if (age < 15) newErrors.date_of_birth = 'Must be 15 or older';
    }

    if (!formData.password || formData.password.length < 8)
      newErrors.password = 'Password must be 8+ characters';
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password))
      newErrors.password = 'Include uppercase, lowercase, and number';

    if (formData.password !== formData.confirm_password)
      newErrors.confirm_password = 'Passwords do not match';

    if (!formData.terms_agreed)
      newErrors.terms_agreed = 'You must agree to the terms';

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
    try {
      const response = await axios.post('/auth/signup', {
        email: formData.email,
        phone: formData.phone || null,
        full_name: formData.full_name || null,
        display_name: formData.display_name,
        discord_username: formData.discord_username || null,
        date_of_birth: formData.date_of_birth,
        password: formData.password,
        terms_agreed: formData.terms_agreed
      });

      login(response.data.user, response.data.token);
      navigate('/');
    } catch (error) {
      const err = error.response?.data;
      setErrors({
        general: err?.error || err?.details || 'Signup failed. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-500 rounded-2xl mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Join our community of thinkers and debaters</p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-800 font-medium">{errors.general}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => handleFocus('email')}
                  onBlur={handleBlur}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  } ${focusedField === 'email' ? 'ring-2 ring-yellow-500' : ''}`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-gray-500 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onFocus={() => handleFocus('phone')}
                  onBlur={handleBlur}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  } ${focusedField === 'phone' ? 'ring-2 ring-yellow-500' : ''}`}
                  placeholder="+1234567890"
                />
              </div>
              {errors.phone && (
                <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Full Name Field */}
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-gray-500 font-normal">(Private & Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="full_name"
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  onFocus={() => handleFocus('full_name')}
                  onBlur={handleBlur}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                    errors.full_name ? 'border-red-500' : 'border-gray-300'
                  } ${focusedField === 'full_name' ? 'ring-2 ring-yellow-500' : ''}`}
                  placeholder="John Doe"
                />
              </div>
              {errors.full_name && (
                <p className="mt-2 text-sm text-red-600">{errors.full_name}</p>
              )}
            </div>

            {/* Display Name Field */}
            <div>
              <label htmlFor="display_name" className="block text-sm font-medium text-gray-700 mb-2">
                Display Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="display_name"
                  type="text"
                  name="display_name"
                  value={formData.display_name}
                  onChange={handleChange}
                  onFocus={() => handleFocus('display_name')}
                  onBlur={handleBlur}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                    errors.display_name ? 'border-red-500' : 'border-gray-300'
                  } ${focusedField === 'display_name' ? 'ring-2 ring-yellow-500' : ''}`}
                  placeholder="JohnD_Writer"
                  required
                />
              </div>
              {errors.display_name && (
                <p className="mt-2 text-sm text-red-600">{errors.display_name}</p>
              )}
            </div>

            {/* Discord Username Field */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label htmlFor="discord_username" className="text-sm font-medium text-gray-700">
                  Discord Username
                </label>
                <div className="relative">
                  <button
                    type="button"
                    className="text-gray-500 hover:text-gray-700"
                    onMouseEnter={() => setShowDiscordTooltip(true)}
                    onMouseLeave={() => setShowDiscordTooltip(false)}
                  >
                    <Info className="h-4 w-4" />
                  </button>
                  {showDiscordTooltip && (
                    <div className="absolute left-0 top-6 z-10 w-80 p-3 bg-gray-800 text-white text-xs rounded-lg shadow-lg">
                      <p className="mb-2">This will appear on your public profile and help you connect with other users in our Discord community.</p>
                      <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-800 transform rotate-45"></div>
                    </div>
                  )}
                </div>
                <span className="text-gray-500 font-normal">(Optional)</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MessageCircle className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="discord_username"
                  type="text"
                  name="discord_username"
                  value={formData.discord_username}
                  onChange={handleChange}
                  onFocus={() => handleFocus('discord_username')}
                  onBlur={handleBlur}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                    errors.discord_username ? 'border-red-500' : 'border-gray-300'
                  } ${focusedField === 'discord_username' ? 'ring-2 ring-yellow-500' : ''}`}
                  placeholder="username#1234"
                />
              </div>
              {errors.discord_username && (
                <p className="mt-2 text-sm text-red-600">{errors.discord_username}</p>
              )}
            </div>

            {/* Date of Birth Field */}
            <div>
              <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="date_of_birth"
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  onFocus={() => handleFocus('date_of_birth')}
                  onBlur={handleBlur}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                    errors.date_of_birth ? 'border-red-500' : 'border-gray-300'
                  } ${focusedField === 'date_of_birth' ? 'ring-2 ring-yellow-500' : ''}`}
                  required
                />
              </div>
              {errors.date_of_birth && (
                <p className="mt-2 text-sm text-red-600">{errors.date_of_birth}</p>
              )}
            </div>

            {/* Password Fields */}
            <div className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => handleFocus('password')}
                    onBlur={handleBlur}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    } ${focusedField === 'password' ? 'ring-2 ring-yellow-500' : ''}`}
                    placeholder="••••••••••"
                    required
                  />
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirm_password"
                    type="password"
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    onFocus={() => handleFocus('confirm_password')}
                    onBlur={handleBlur}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                      errors.confirm_password ? 'border-red-500' : 'border-gray-300'
                    } ${focusedField === 'confirm_password' ? 'ring-2 ring-yellow-500' : ''}`}
                    placeholder="••••••••••"
                    required
                  />
                </div>
                {errors.confirm_password && (
                  <p className="mt-2 text-sm text-red-600">{errors.confirm_password}</p>
                )}
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start">
              <input
                id="terms_agreed"
                type="checkbox"
                name="terms_agreed"
                checked={formData.terms_agreed}
                onChange={handleChange}
                className="h-4 w-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500 mt-1"
              />
              <label htmlFor="terms_agreed" className="ml-2 text-sm text-gray-700">
                I agree to the <Link to="/community-guidelines" className="text-yellow-600 hover:text-yellow-700 font-medium">Community Guidelines</Link> and <Link to="/terms" className="text-yellow-600 hover:text-yellow-700 font-medium">Terms of Service</Link>
              </label>
            </div>
            {errors.terms_agreed && (
              <p className="mt-2 text-sm text-red-600">{errors.terms_agreed}</p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0112 20c0 2.142-.674 4.165-1.819 5.707L14.707 12l4.293 4.293a7.962 7.962 0 01-5.707 1.819C15.326 19.674 14 18.326 14 16.326v-4.035z"></path>
                  </svg>
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ChevronRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-yellow-600 hover:text-yellow-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>

        {/* Security Badge */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-xs text-gray-600">
            <Shield className="h-4 w-4" />
            Secure and encrypted
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;