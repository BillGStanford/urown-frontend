import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Phone, User, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';

const SignUpPage = ({ login }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    contactMethod: 'email', // 'email' or 'phone'
    email: '',
    phone: '',
    fullName: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleContactMethodChange = (method) => {
    setFormData(prev => ({
      ...prev,
      contactMethod: method,
      email: method === 'email' ? prev.email : '',
      phone: method === 'phone' ? prev.phone : ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.agreeToTerms) {
      setError('You must agree to the terms and conditions');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.contactMethod === 'email' ? formData.email : null,
          phone: formData.contactMethod === 'phone' ? formData.phone : null,
          fullName: formData.fullName,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.token, data.user);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Registration failed');
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

      {/* Sign Up Form */}
      <div className="flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter">
              JOIN UROWN
            </h1>
            <p className="text-lg font-bold text-gray-600">
              START YOUR WRITING JOURNEY TODAY
            </p>
          </div>

          <div className="bg-white p-8 border-4 border-black">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-100 border-2 border-red-500 p-4">
                  <p className="font-bold text-red-700">{error}</p>
                </div>
              )}

              {/* Contact Method Selection */}
              <div>
                <label className="block text-lg font-black mb-4">
                  HOW SHOULD WE CONTACT YOU?
                </label>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => handleContactMethodChange('email')}
                    className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 font-bold border-2 border-black transition-colors ${
                      formData.contactMethod === 'email'
                        ? 'bg-black text-white'
                        : 'bg-white text-black hover:bg-gray-100'
                    }`}
                  >
                    <Mail size={20} />
                    <span>EMAIL</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleContactMethodChange('phone')}
                    className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 font-bold border-2 border-black transition-colors ${
                      formData.contactMethod === 'phone'
                        ? 'bg-black text-white'
                        : 'bg-white text-black hover:bg-gray-100'
                    }`}
                  >
                    <Phone size={20} />
                    <span>PHONE</span>
                  </button>
                </div>
              </div>

              {/* Contact Input */}
              <div>
                <label className="block text-sm font-black mb-2 uppercase">
                  {formData.contactMethod === 'email' ? 'EMAIL ADDRESS' : 'PHONE NUMBER'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {formData.contactMethod === 'email' ? 
                      <Mail className="h-5 w-5 text-gray-400" /> : 
                      <Phone className="h-5 w-5 text-gray-400" />
                    }
                  </div>
                  <input
                    type={formData.contactMethod === 'email' ? 'email' : 'tel'}
                    name={formData.contactMethod}
                    value={formData.contactMethod === 'email' ? formData.email : formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border-2 border-black font-bold focus:outline-none focus:ring-0 focus:border-gray-500"
                    placeholder={formData.contactMethod === 'email' ? 'your@email.com' : '+1 (555) 123-4567'}
                    required
                  />
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-black mb-2 uppercase">
                  FULL LEGAL NAME
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border-2 border-black font-bold focus:outline-none focus:ring-0 focus:border-gray-500"
                    placeholder="John Doe"
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

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-black mb-2 uppercase">
                  CONFIRM PASSWORD
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 border-2 border-black font-bold focus:outline-none focus:ring-0 focus:border-gray-500"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                  </button>
                </div>
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="mt-1 h-4 w-4 border-2 border-black text-black focus:ring-0"
                  required
                />
                <label className="text-sm font-bold text-gray-700">
                  I AGREE TO THE TERMS AND CONDITIONS AND PRIVACY POLICY. I UNDERSTAND THAT UROWN IS A FREE PLATFORM FOR PUBLISHING ARTICLES.
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-4 font-black text-lg border-2 border-black hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
              </button>

              {/* Login Link */}
              <div className="text-center pt-4">
                <p className="text-sm font-bold text-gray-600">
                  ALREADY HAVE AN ACCOUNT?{' '}
                  <Link to="/login" className="text-black underline hover:no-underline font-black">
                    LOGIN HERE
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;