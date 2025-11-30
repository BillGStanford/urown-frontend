import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../../context/UserContext';
import { Mail, Lock, AlertCircle, ChevronRight, User, Eye, EyeOff, Shield } from 'lucide-react';

function LoginPage() {
  const { login } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const error = params.get('error');
    if (error) setErrors({ general: decodeURIComponent(error) });
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.identifier || !formData.password) {
      setErrors({
        identifier: !formData.identifier ? 'Required' : '',
        password: !formData.password ? 'Required' : ''
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/auth/login', formData);
      login(response.data.user, response.data.token);
      navigate('/');
    } catch (error) {
      setErrors({ 
        general: error.response?.data?.error || 'Invalid email or password' 
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
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Log in to your account to continue</p>
        </div>

        {/* Login Form Card */}
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
            {/* Email/Username Field */}
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-2">
                Email or Display Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="identifier"
                  type="text"
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleChange}
                  onFocus={() => handleFocus('identifier')}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all ${
                    errors.identifier ? 'border-red-500' : 'border-gray-300'
                  } ${focusedField === 'identifier' ? 'ring-2 ring-yellow-500' : ''}`}
                  placeholder="you@example.com or username"
                  autoComplete="username"
                />
              </div>
              {errors.identifier && (
                <p className="mt-2 text-sm text-red-600">{errors.identifier}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => handleFocus('password')}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  } ${focusedField === 'password' ? 'ring-2 ring-yellow-500' : ''}`}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                />
                <span className="ml-2 text-sm text-gray-700">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-yellow-600 hover:text-yellow-700 font-medium">
                Forgot password?
              </Link>
            </div>

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
                  Logging in...
                </>
              ) : (
                <>
                  Log In
                  <ChevronRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Sign Up Link */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-yellow-600 hover:text-yellow-700 font-medium">
              Sign up
            </Link>
          </p>
        </div>

        {/* Security Badge */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-xs text-gray-600">
            <Shield className="h-4 w-4" />
            Secure and encrypted connection
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;