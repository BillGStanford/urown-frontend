import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, LogIn } from 'lucide-react';

const LoginPage = ({ login }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.token, data.user);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b-4 border-black bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link to="/" className="text-4xl md:text-6xl font-black tracking-tighter">
              UROWN
            </Link>
            <Link 
              to="/"
              className="flex items-center space-x-2 bg-white text-black px-6 py-3 font-bold text-lg border-2 border-black hover:bg-black hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span>BACK</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Login Form */}
      <div className="flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter">
              WELCOME BACK
            </h1>
            <p className="text-lg font-bold text-gray-600">
              CONTINUE YOUR WRITING JOURNEY
            </p>
          </div>

          <div className="bg-white p-8 border-4 border-black">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-100 border-2 border-red-500 p-4">
                  <p className="font-bold text-red-700">{error}</p>
                </div>
              )}

              {/* Email or Phone */}
              <div>
                <label className="block text-sm font-black mb-2 uppercase">
                  EMAIL OR PHONE NUMBER
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="emailOrPhone"
                    value={formData.emailOrPhone}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border-2 border-black font-bold focus:outline-none focus:ring-0 focus:border-gray-500"
                    placeholder="your@email.com or +1 (555) 123-4567"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-black mb-2 uppercase">
                  PASSWORD
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 border-2 border-black font-bold focus:outline-none focus:ring-0 focus:border-gray-500"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-4 font-black text-lg border-2 border-black hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <LogIn size={20} />
                <span>{loading ? 'LOGGING IN...' : 'LOGIN'}</span>
              </button>

              {/* Sign Up Link */}
              <div className="text-center pt-4">
                <p className="text-sm font-bold text-gray-600">
                  DON'T HAVE AN ACCOUNT?{' '}
                  <Link to="/signup" className="text-black underline hover:no-underline font-black">
                    SIGN UP HERE
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* Demo Info */}
          <div className="mt-8 bg-gray-100 p-6 border-2 border-black">
            <h3 className="font-black text-lg mb-4">DEMO ACCOUNT</h3>
            <p className="text-sm font-bold text-gray-700 mb-4">
              Want to test the platform? Create a new account or use these demo credentials:
            </p>
            <div className="bg-white p-4 border-2 border-gray-300 font-mono text-sm">
              <div className="font-bold">Email: demo@urown.com</div>
              <div className="font-bold">Password: demo123</div>
            </div>
            <p className="text-xs font-bold text-gray-600 mt-2">
              Note: Demo account may not exist yet. Please create your own account to get started.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;