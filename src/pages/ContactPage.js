import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, User, MessageCircle, ArrowLeft, Send } from 'lucide-react';
import { addContactMessage } from '../utils/contactMessageUtils';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    contactMethod: 'email', // 'email' or 'phone'
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const subjectOptions = [
    'Account Deletion Request',
    'Supporting Us / Donations',
    'Business Partnership Inquiry',
    'Technical Support',
    'Content Moderation Issue',
    'Feature Request',
    'Bug Report',
    'General Inquiry',
    'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear success/error messages when user starts typing
    if (success || error) {
      setSuccess(false);
      setError('');
    }
  };

  const handleContactMethodChange = (method) => {
    setFormData(prev => ({
      ...prev,
      contactMethod: method,
      email: method === 'email' ? prev.email : '',
      phone: method === 'phone' ? prev.phone : ''
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      return 'Name is required';
    }

    if (formData.contactMethod === 'email') {
      if (!formData.email.trim()) {
        return 'Email is required';
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        return 'Please enter a valid email address';
      }
    } else {
      if (!formData.phone.trim()) {
        return 'Phone number is required';
      }
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
        return 'Please enter a valid phone number';
      }
    }

    if (!formData.subject) {
      return 'Please select a subject';
    }

    if (!formData.message.trim()) {
      return 'Message is required';
    }

    if (formData.message.trim().length < 10) {
      return 'Message must be at least 10 characters long';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      // Create message object for the utility function
      const messageData = {
        name: formData.name.trim(),
        email: formData.contactMethod === 'email' ? formData.email.trim() : null,
        phone: formData.contactMethod === 'phone' ? formData.phone.trim() : null,
        subject: formData.subject,
        message: formData.message.trim()
      };

      // Use the contact message utility function
      const result = await addContactMessage(messageData);

      if (result.success) {
        setSuccess(true);
        setFormData({
          contactMethod: 'email',
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      } else {
        throw new Error(result.error || 'Failed to submit message');
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setError('Failed to send message. Please try again later.');
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

      {/* Contact Form */}
      <div className="flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter">
              CONTACT US
            </h1>
            <p className="text-lg font-bold text-gray-600">
              WE'RE HERE TO HELP. SEND US A MESSAGE.
            </p>
          </div>

          <div className="bg-white p-8 border-4 border-black">
            {success && (
              <div className="bg-green-100 border-2 border-green-500 p-6 mb-6">
                <div className="flex items-center space-x-3">
                  <Send className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-black text-green-800 text-lg">MESSAGE SENT SUCCESSFULLY!</p>
                    <p className="font-bold text-green-700">
                      We've received your message and will get back to you within 24-48 hours.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-100 border-2 border-red-500 p-4">
                  <p className="font-bold text-red-700">{error}</p>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-sm font-black mb-2 uppercase">
                  YOUR NAME *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border-2 border-black font-bold focus:outline-none focus:ring-0 focus:border-gray-500"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              {/* Contact Method Selection */}
              <div>
                <label className="block text-lg font-black mb-4">
                  HOW SHOULD WE CONTACT YOU? *
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
                  {formData.contactMethod === 'email' ? 'EMAIL ADDRESS *' : 'PHONE NUMBER *'}
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

              {/* Subject Selection */}
              <div>
                <label className="block text-sm font-black mb-2 uppercase">
                  WHAT IS THIS ABOUT? *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MessageCircle className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border-2 border-black font-bold focus:outline-none focus:ring-0 focus:border-gray-500 bg-white"
                    required
                  >
                    <option value="">SELECT A SUBJECT</option>
                    {subjectOptions.map((option) => (
                      <option key={option} value={option} className="font-bold">
                        {option.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-black mb-2 uppercase">
                  YOUR MESSAGE *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-black font-bold focus:outline-none focus:ring-0 focus:border-gray-500 resize-none"
                  placeholder="Tell us what's on your mind. Be as detailed as possible so we can help you better."
                  required
                  minLength={10}
                />
                <div className="text-right text-sm text-gray-500 mt-1">
                  <span className={`font-bold ${formData.message.length < 10 ? 'text-red-500' : 'text-green-500'}`}>
                    {formData.message.length}/10 minimum
                  </span>
                </div>
              </div>

              {/* Important Notice for Account Deletion */}
              {formData.subject === 'Account Deletion Request' && (
                <div className="bg-yellow-100 border-2 border-yellow-500 p-4">
                  <p className="font-black text-yellow-800 mb-2">⚠️ IMPORTANT NOTICE</p>
                  <p className="font-bold text-yellow-700 text-sm">
                    Account deletion is permanent and cannot be undone. All your articles, data, and account information will be permanently removed from our systems. Please make sure this is what you want before submitting this request.
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-4 font-black text-lg border-2 border-black hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Send size={20} />
                <span>{loading ? 'SENDING MESSAGE...' : 'SEND MESSAGE'}</span>
              </button>

              {/* Contact Information */}
              <div className="border-t-2 border-gray-300 pt-6 mt-8">
                <h3 className="font-black text-lg mb-4">OTHER WAYS TO REACH US:</h3>
                <div className="space-y-2 text-sm font-bold text-gray-600">
                  <p>📧 GENERAL INQUIRIES: hello@urown.com</p>
                  <p>🛠️ TECHNICAL SUPPORT: support@urown.com</p>
                  <p>💼 BUSINESS INQUIRIES: business@urown.com</p>
                  <p>⏰ RESPONSE TIME: 24-48 HOURS</p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-2xl font-black mb-4">UROWN</div>
          <p className="font-bold text-gray-300">
            YOUR STORIES. YOUR VOICE. YOUR PLATFORM.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ContactPage;