// pages/SignupPage.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { Mail, Phone, User, Calendar, Lock, CheckCircle, AlertCircle, ChevronRight, MessageCircle, Info, Gift } from 'lucide-react';

function SignupPage() {
  const { login } = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteCodeFromUrl = searchParams.get('invite') || '';
  
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    full_name: '',
    display_name: '',
    discord_username: '',
    date_of_birth: '',
    password: '',
    confirm_password: '',
    invite_code: inviteCodeFromUrl.toUpperCase(),
    terms_agreed: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showDiscordTooltip, setShowDiscordTooltip] = useState(false);
  const [inviteCodeValidation, setInviteCodeValidation] = useState({
    validated: false,
    valid: false,
    name: '',
    description: ''
  });
  const [isValidatingInvite, setIsValidatingInvite] = useState(false);

  // Validate invite code on mount if present in URL
  useEffect(() => {
    if (inviteCodeFromUrl) {
      validateInviteCode(inviteCodeFromUrl.toUpperCase());
    }
  }, [inviteCodeFromUrl]);

  // Validate invite code
  const validateInviteCode = async (code) => {
    if (!code || code.length !== 5) {
      setInviteCodeValidation({ validated: false, valid: false, name: '', description: '' });
      return;
    }

    setIsValidatingInvite(true);
    try {
      const response = await axios.get(`/invite-codes/validate/${code}`);
      setInviteCodeValidation({
        validated: true,
        valid: true,
        name: response.data.name,
        description: response.data.description
      });
      setErrors(prev => ({ ...prev, invite_code: '' }));
    } catch (error) {
      setInviteCodeValidation({
        validated: true,
        valid: false,
        name: '',
        description: ''
      });
      if (error.response?.status === 404) {
        setErrors(prev => ({ ...prev, invite_code: 'Invalid or inactive invite code' }));
      }
    } finally {
      setIsValidatingInvite(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'invite_code') {
      const upperValue = value.toUpperCase();
      setFormData(prev => ({
        ...prev,
        [name]: upperValue
      }));
      
      // Validate invite code when it reaches 5 characters
      if (upperValue.length === 5) {
        validateInviteCode(upperValue);
      } else {
        setInviteCodeValidation({ validated: false, valid: false, name: '', description: '' });
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
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

    if (formData.invite_code && formData.invite_code.trim().length > 0) {
      if (formData.invite_code.length !== 5) {
        newErrors.invite_code = 'Invite code must be exactly 5 characters';
      } else if (!inviteCodeValidation.valid && inviteCodeValidation.validated) {
        newErrors.invite_code = 'Invalid or inactive invite code';
      }
    }

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
        invite_code: formData.invite_code || null,
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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero Header */}
        <div className="text-center mb-12 animate-slide-up">
          <div className="inline-flex items-center gap-3 bg-white border-2 border-gray-900 px-5 py-3 rounded-xl shadow-lg mb-6">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <span className="font-bold text-lg">Join 38k+ thinkers</span>
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-gray-900 mb-4">
            Create Your
            <span className="bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent"> Account</span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 font-medium max-w-2xl mx-auto">
            Share your voice. Debate ideas. Shape the future.
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-gray-200 overflow-hidden animate-fade-in-up">
          <form onSubmit={handleSubmit} className="p-8 sm:p-12 space-y-10">
            {errors.general && (
              <div className="bg-red-50 border-2 border-red-300 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3 animate-shake">
                <AlertCircle className="w-6 h-6" />
                <span className="font-bold">{errors.general}</span>
              </div>
            )}

            {/* Contact Info */}
            <section>
              <h2 className="text-3xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <Mail className="w-8 h-8 text-orange-600" />
                Contact
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-bold text-gray-900 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-5 py-4 rounded-xl border-2 ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:border-orange-600 focus:outline-none transition-all text-lg`}
                    placeholder="you@example.com"
                  />
                  {errors.email && <p className="mt-2 text-red-600 font-semibold">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-lg font-bold text-gray-900 mb-2">Phone (Optional)</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-5 py-4 rounded-xl border-2 ${errors.phone ? 'border-red-500' : 'border-gray-300'} focus:border-orange-600 focus:outline-none transition-all text-lg`}
                    placeholder="+1234567890"
                  />
                  {errors.phone && <p className="mt-2 text-red-600 font-semibold">{errors.phone}</p>}
                </div>
              </div>
            </section>

            {/* Personal Info */}
            <section>
              <h2 className="text-3xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <User className="w-8 h-8 text-orange-600" />
                Profile
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-bold text-gray-900 mb-2">Full Name (Private & Optional)</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="w-full px-5 py-4 rounded-xl border-2 border-gray-300 focus:border-orange-600 focus:outline-none transition-all text-lg"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-lg font-bold text-gray-900 mb-2">Display Name *</label>
                  <input
                    type="text"
                    name="display_name"
                    value={formData.display_name}
                    onChange={handleChange}
                    className={`w-full px-5 py-4 rounded-xl border-2 ${errors.display_name ? 'border-red-500' : 'border-gray-300'} focus:border-orange-600 focus:outline-none transition-all text-lg`}
                    placeholder="JohnD_Writer"
                    required
                  />
                  {errors.display_name && <p className="mt-2 text-red-600 font-semibold">{errors.display_name}</p>}
                </div>
                
                {/* Discord Username Field */}
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-lg font-bold text-gray-900">
                      Discord Username (Optional)
                    </label>
                    <div 
                      className="relative"
                      onMouseEnter={() => setShowDiscordTooltip(true)}
                      onMouseLeave={() => setShowDiscordTooltip(false)}
                    >
                      <Info className="w-5 h-5 text-gray-500 cursor-help" />
                      {showDiscordTooltip && (
                        <div className="absolute left-0 top-8 z-50 w-80 bg-gray-900 text-white text-sm px-4 py-3 rounded-lg shadow-xl">
                          <div className="flex items-start gap-2">
                            <MessageCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold mb-1">Why add Discord?</p>
                              <p className="text-gray-300">
                                This will appear in your user profile. This will also help you if you are in a partnered Discord server so you may earn roles in that Discord community from the roles you get on this platform.
                              </p>
                            </div>
                          </div>
                          <div className="absolute -top-2 left-4 w-4 h-4 bg-gray-900 transform rotate-45"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="relative">
                    <MessageCircle className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="discord_username"
                      value={formData.discord_username}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-5 py-4 rounded-xl border-2 ${errors.discord_username ? 'border-red-500' : 'border-gray-300'} focus:border-purple-500 focus:outline-none transition-all text-lg`}
                      placeholder="username#1234"
                    />
                  </div>
                  {errors.discord_username && <p className="mt-2 text-red-600 font-semibold">{errors.discord_username}</p>}
                </div>

                <div>
                  <label className="block text-lg font-bold text-gray-900 mb-2">Date of Birth *</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className={`w-full px-5 py-4 rounded-xl border-2 ${errors.date_of_birth ? 'border-red-500' : 'border-gray-300'} focus:border-orange-600 focus:outline-none transition-all text-lg`}
                    required
                  />
                  {errors.date_of_birth && <p className="mt-2 text-red-600 font-semibold">{errors.date_of_birth}</p>}
                </div>
              </div>
            </section>

            {/* Invite Code Section */}
            <section>
              <h2 className="text-3xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <Gift className="w-8 h-8 text-orange-600" />
                Invite Code (Optional)
              </h2>
              <div>
                <label className="block text-lg font-bold text-gray-900 mb-2">
                  Have an invite code?
                </label>
                <input
                  type="text"
                  name="invite_code"
                  value={formData.invite_code}
                  onChange={handleChange}
                  disabled={!!inviteCodeFromUrl}
                  maxLength={5}
                  className={`w-full px-5 py-4 rounded-xl border-2 ${
                    errors.invite_code 
                      ? 'border-red-500' 
                      : inviteCodeValidation.valid 
                      ? 'border-green-500' 
                      : 'border-gray-300'
                  } focus:border-orange-600 focus:outline-none transition-all text-lg uppercase ${
                    inviteCodeFromUrl ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="Enter 5-character code"
                />
                
                {isValidatingInvite && (
                  <p className="mt-2 text-blue-600 font-semibold flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                    Validating code...
                  </p>
                )}
                
                {inviteCodeValidation.validated && inviteCodeValidation.valid && (
                  <div className="mt-3 p-4 bg-green-50 border-2 border-green-300 rounded-xl">
                    <p className="text-green-700 font-bold flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Valid code: {inviteCodeValidation.name}
                    </p>
                    {inviteCodeValidation.description && (
                      <p className="text-green-600 mt-1">{inviteCodeValidation.description}</p>
                    )}
                  </div>
                )}
                
                {errors.invite_code && (
                  <p className="mt-2 text-red-600 font-semibold flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {errors.invite_code}
                  </p>
                )}
                
                {inviteCodeFromUrl && (
                  <p className="mt-2 text-gray-600 text-sm">
                    This code was provided in your invite link and cannot be changed.
                  </p>
                )}
              </div>
            </section>

            {/* Security */}
            <section>
              <h2 className="text-3xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <Lock className="w-8 h-8 text-orange-600" />
                Security
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-bold text-gray-900 mb-2">Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-5 py-4 rounded-xl border-2 ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:border-orange-600 focus:outline-none transition-all text-lg`}
                    placeholder="••••••••"
                    required
                  />
                  {errors.password && <p className="mt-2 text-red-600 font-semibold">{errors.password}</p>}
                </div>
                <div>
                  <label className="block text-lg font-bold text-gray-900 mb-2">Confirm Password *</label>
                  <input
                    type="password"
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    className={`w-full px-5 py-4 rounded-xl border-2 ${errors.confirm_password ? 'border-red-500' : 'border-gray-300'} focus:border-orange-600 focus:outline-none transition-all text-lg`}
                    placeholder="••••••••"
                    required
                  />
                  {errors.confirm_password && <p className="mt-2 text-red-600 font-semibold">{errors.confirm_password}</p>}
                </div>
              </div>
            </section>

            {/* Terms */}
            <section>
              <label className="flex items-start gap-4 cursor-pointer">
                <input
                  type="checkbox"
                  name="terms_agreed"
                  checked={formData.terms_agreed}
                  onChange={handleChange}
                  className="w-7 h-7 rounded-lg border-2 border-gray-400 checked:bg-orange-600 focus:ring-orange-600 mt-1"
                />
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    I agree to the <Link to="/community-guidelines" className="text-orange-600 underline">Community Guidelines</Link>
                  </p>
                  {errors.terms_agreed && <p className="mt-2 text-red-600 font-semibold">{errors.terms_agreed}</p>}
                </div>
              </label>
            </section>

            {/* Submit */}
            <div className="text-center pt-6">
              <button
                type="submit"
                disabled={loading}
                className="group inline-flex items-center justify-center gap-3 px-12 py-5 bg-gray-900 text-white font-black text-xl rounded-xl hover:bg-gray-800 transform hover:scale-105 transition-all duration-200 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
                <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </form>
        </div>

        {/* Login Link */}
        <div className="text-center mt-10 animate-fade-in-delay">
          <p className="text-xl font-bold text-gray-700">
            Already have an account?{' '}
            <Link to="/login" className="text-orange-600 hover:underline font-black">
              Login here
            </Link>
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

export default SignupPage;