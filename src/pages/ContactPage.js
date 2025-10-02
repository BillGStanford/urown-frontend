// ContactPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { Mail, Phone, User, Send, Lock } from 'lucide-react';

function ContactPage() {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'concern',
    content: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Initialize form with user data if logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.display_name || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [user]);

  const categories = [
    { value: 'concern', label: 'Concern' },
    { value: 'business', label: 'Business Inquiry' },
    { value: 'ads', label: 'Advertisement' },
    { value: 'partnership', label: 'Partnership Proposal' },
    { value: 'feedback', label: 'Feedback' },
    { value: 'other', label: 'Other' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Fixed: Changed from '/api/contact' to '/contact' 
      // since axios already has a base URL that includes '/api'
      const response = await axios.post('/contact', formData);
      setSubmitSuccess(true);
      // Reset form
      setFormData({
        name: user ? user.display_name || '' : '',
        email: user ? user.email || '' : '',
        phone: user ? user.phone || '' : '',
        category: 'concern',
        content: ''
      });
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('An error occurred while submitting your message. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine if fields should be disabled
  const isNameDisabled = !!user;
  const isEmailDisabled = !!(user && user.email);
  const isPhoneDisabled = !!(user && user.phone);

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-lg text-gray-600">
            Have a question, concern, or business inquiry? We'd love to hear from you.
          </p>
          {user && (
            <p className="text-md text-blue-600 mt-2">
              Welcome back, {user.display_name}! Your information has been pre-filled below and cannot be changed.
            </p>
          )}
        </div>

        {submitSuccess ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <div className="flex items-center">
              <svg className="h-6 w-6 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h3 className="text-lg font-medium text-green-800">Message Sent Successfully!</h3>
            </div>
            <p className="mt-2 text-green-700">
              Thank you for contacting us. We'll get back to you as soon as possible.
            </p>
            <button
              onClick={() => setSubmitSuccess(false)}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                    {isNameDisabled && (
                      <span className="ml-2 text-xs text-blue-600">(Pre-filled)</span>
                    )}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      readOnly={isNameDisabled}
                      className={`w-full pl-10 pr-10 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                        isNameDisabled ? 'bg-gray-100 text-gray-700' : ''
                      }`}
                      placeholder="Your full name"
                    />
                    {isNameDisabled && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-blue-500" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                      {isEmailDisabled && (
                        <span className="ml-2 text-xs text-blue-600">(Pre-filled)</span>
                      )}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        readOnly={isEmailDisabled}
                        className={`w-full pl-10 pr-10 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                          isEmailDisabled ? 'bg-gray-100 text-gray-700' : ''
                        }`}
                        placeholder="your.email@example.com"
                      />
                      {isEmailDisabled && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-blue-500" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                      {isPhoneDisabled && (
                        <span className="ml-2 text-xs text-blue-600">(Pre-filled)</span>
                      )}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        readOnly={isPhoneDisabled}
                        className={`w-full pl-10 pr-10 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                          isPhoneDisabled ? 'bg-gray-100 text-gray-700' : ''
                        }`}
                        placeholder="+1 (555) 123-4567"
                      />
                      {isPhoneDisabled && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-blue-500" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-500 italic">
                  Please provide either your email or phone number so we can contact you.
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Please provide details about your inquiry..."
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-3 px-6 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2" size={18} />
                        Send Message
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ContactPage;