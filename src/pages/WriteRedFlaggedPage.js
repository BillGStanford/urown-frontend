// src/pages/WriteRedFlaggedPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { createRedFlaggedPost } from '../utils/redFlaggedApi';

const WriteRedFlaggedPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  
  const [formData, setFormData] = useState({
    company_name: '',
    position: '',
    experience_type: '',
    story: '',
    rating_fairness: 3,
    rating_pay: 3,
    rating_culture: 3,
    rating_management: 3,
    anonymous_username: '',
    is_anonymous: true,
    terms_agreed: false
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [charCount, setCharCount] = useState(0);
  
  const experienceTypes = [
    'Toxic Management',
    'Pay Issues',
    'Poor Culture',
    'Overworked',
    'Discrimination',
    'Harassment',
    'Lack of Growth',
    'Great Experience',
    'Fair Treatment',
    'Good Benefits',
    'Work-Life Balance',
    'Other'
  ];
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'story') {
      setCharCount(value.length);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleRatingChange = (ratingType, value) => {
    setFormData(prev => ({
      ...prev,
      [ratingType]: parseInt(value)
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!formData.company_name.trim()) {
      setError('Company name is required');
      return;
    }
    
    if (!formData.experience_type) {
      setError('Please select an experience type');
      return;
    }
    
    if (!formData.story.trim()) {
      setError('Your story is required');
      return;
    }
    
    if (formData.story.trim().length < 100) {
      setError('Your story must be at least 100 characters. Please provide more details.');
      return;
    }
    
    if (formData.is_anonymous && !formData.anonymous_username.trim()) {
      setError('Username is required for anonymous posts');
      return;
    }
    
    if (!formData.terms_agreed) {
      setError('You must agree to the terms');
      return;
    }
    
    setLoading(true);
    
try {
  const response = await createRedFlaggedPost(formData);
  navigate(`/redflagged/${response.post.id}`);
} catch (err) {
  setError(err.response?.data?.error || 'Failed to create post');
  setLoading(false);
}
  };
  
  const RatingStars = ({ label, value, onChange }) => (
    <div className="mb-4">
      <label className="block text-sm font-semibold mb-2">{label}</label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`text-2xl transition-all ${
              star <= value 
                ? 'text-yellow-500' 
                : 'text-gray-300 hover:text-yellow-400'
            }`}
          >
            ★
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">{value}/5</span>
      </div>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-black text-gray-900 mb-2">
              🚩 Share Your Experience
            </h1>
            <p className="text-gray-600">
              RedFlagged by UROWN — Where workers speak freely.
            </p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {/* Company Name */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                placeholder="e.g., Starbucks, Amazon, Google"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>
            
            {/* Position (Optional) */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">
                Position (Optional)
              </label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                placeholder="e.g., Barista, Warehouse Associate, Software Engineer"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave blank to protect anonymity
              </p>
            </div>
            
            {/* Experience Type */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">
                Experience Type <span className="text-red-500">*</span>
              </label>
              <select
                name="experience_type"
                value={formData.experience_type}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              >
                <option value="">Select experience type</option>
                {experienceTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            {/* Ratings */}
            <div className="mb-6 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-bold mb-4">Rate Your Experience</h3>
              <RatingStars 
                label="Fairness" 
                value={formData.rating_fairness}
                onChange={(val) => handleRatingChange('rating_fairness', val)}
              />
              <RatingStars 
                label="Pay & Benefits" 
                value={formData.rating_pay}
                onChange={(val) => handleRatingChange('rating_pay', val)}
              />
              <RatingStars 
                label="Company Culture" 
                value={formData.rating_culture}
                onChange={(val) => handleRatingChange('rating_culture', val)}
              />
              <RatingStars 
                label="Management" 
                value={formData.rating_management}
                onChange={(val) => handleRatingChange('rating_management', val)}
              />
            </div>
            
            {/* Story */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">
                Your Story <span className="text-red-500">*</span>
              </label>
              <textarea
                name="story"
                value={formData.story}
                onChange={handleChange}
                placeholder="Share your experience in detail. What happened? How did it make you feel? What would you want others to know?"
                rows={10}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                required
              />
              <div className="flex justify-between mt-2">
                <p className="text-xs text-gray-500">
                  Minimum 100 characters
                </p>
                <p className={`text-xs ${charCount >= 100 ? 'text-green-600' : 'text-gray-500'}`}>
                  {charCount} characters
                </p>
              </div>
            </div>
            
            {/* Anonymous Username */}
            {formData.is_anonymous && (
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="anonymous_username"
                  value={formData.anonymous_username}
                  onChange={handleChange}
                  placeholder="Choose a display name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required={formData.is_anonymous}
                />
                <p className="text-xs text-gray-500 mt-1">
                  No profanity or offensive language
                </p>
              </div>
            )}
            
            {/* Show Real Name Option (only if logged in) */}
            {user && (
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_anonymous"
                    checked={formData.is_anonymous}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      is_anonymous: e.target.checked
                    }))}
                    className="mr-2"
                  />
                  <span className="text-sm">Post anonymously</span>
                </label>
              </div>
            )}
            
            {/* Terms Agreement */}
            <div className="mb-6">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  name="terms_agreed"
                  checked={formData.terms_agreed}
                  onChange={handleChange}
                  className="mr-2 mt-1"
                  required
                />
                <span className="text-sm text-gray-700">
                  I agree that I am sharing my own experience truthfully. 
                  I understand that posts are user opinions and UROWN is not responsible for content accuracy.
                </span>
              </label>
            </div>
            
            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-red-600 text-white font-bold py-4 rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Publishing...' : '🚩 Publish Post'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/redflagged')}
                className="px-6 py-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
        
        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ <strong>Disclaimer:</strong> Posts on RedFlagged are user opinions and personal experiences. 
            UROWN does not verify the accuracy of claims and is not responsible for user-generated content.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WriteRedFlaggedPage;