// pages/LoginPage.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { Mail, Lock, AlertCircle, ChevronRight } from 'lucide-react';

function LoginPage() {
  const { login } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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
      setErrors({ general: error.response?.data?.error || 'Invalid email or password' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-slide-up">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl">
            <Mail className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-gray-900 mb-3">
            Welcome Back
          </h1>
          <p className="text-xl text-gray-600 font-medium">
            Log in to continue debating
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-gray-200 p-10 animate-fade-in-up">
          <form onSubmit={handleSubmit} className="space-y-8">
            {errors.general && (
              <div className="bg-red-50 border-2 border-red-300 text-red-700 px-5 py-4 rounded-xl flex items-center gap-3 animate-shake">
                <AlertCircle className="w-6 h-6" />
                <span className="font-bold">{errors.general}</span>
              </div>
            )}

            <div>
              <label className="block text-lg font-bold text-gray-900 mb-3">Email or Display Name</label>
              <input
                type="text"
                name="identifier"
                value={formData.identifier}
                onChange={handleChange}
                className={`w-full px-5 py-4 rounded-xl border-2 ${errors.identifier ? 'border-red-500' : 'border-gray-300'} focus:border-orange-600 focus:outline-none transition-all text-lg`}
                placeholder="you@example.com or JohnD"
                autoComplete="username"
              />
              {errors.identifier && <p className="mt-2 text-red-600 font-semibold">{errors.identifier}</p>}
            </div>

            <div>
              <label className="block text-lg font-bold text-gray-900 mb-3">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-5 py-4 rounded-xl border-2 ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:border-orange-600 focus:outline-none transition-all text-lg`}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              {errors.password && <p className="mt-2 text-red-600 font-semibold">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full group flex items-center justify-center gap-3 py-5 bg-gray-900 text-white font-black text-xl rounded-xl hover:bg-gray-800 transform hover:scale-105 transition-all duration-200 shadow-xl disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>

        {/* Links */}
        <div className="text-center mt-8 space-y-4 animate-fade-in-delay">
          <p className="text-lg font-bold text-gray-700">
            New here?{' '}
            <Link to="/signup" className="text-orange-600 hover:underline font-black">
              Create an account
            </Link>
          </p>
          <p className="text-sm text-gray-600">
            Forgot password? Contact <a href="mailto:support@urown.com" className="text-orange-600 underline">support</a>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </div>
  );
}

export default LoginPage;