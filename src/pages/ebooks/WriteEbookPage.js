// src/pages/ebooks/WriteEbookPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const WriteEbookPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    language: 'en',
    cover_color: '#667eea'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'ar', name: 'Arabic' }
  ];

  const colorPresets = [
    '#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b',
    '#fa709a', '#fee140', '#30cfd0', '#a8edea', '#fed6e3'
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (formData.title.length > 255) {
      newErrors.title = 'Title must be less than 255 characters';
    }

    if (formData.subtitle && formData.subtitle.length > 255) {
      newErrors.subtitle = 'Subtitle must be less than 255 characters';
    }

    if (formData.description && formData.description.length > 5000) {
      newErrors.description = 'Description must be less than 5000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await axios.post('/ebooks', formData);
      
      // Navigate to chapter creation
      navigate(`/ebooks/write/${response.data.ebook.id}/chapter`);
    } catch (error) {
      console.error('Error creating ebook:', error);
      if (error.response?.data?.error) {
        setErrors({ submit: error.response.data.error });
      } else {
        setErrors({ submit: 'Failed to create book. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Book</h1>
          <p className="text-gray-600">
            Start by giving your book a title and some basic information
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* Global Error */}
          {errors.submit && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {errors.submit}
            </div>
          )}

          {/* Title */}
          <div className="mb-6">
            <label className="block font-semibold mb-2">
              Book Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter your book title..."
              className={`w-full px-4 py-3 border rounded-lg text-lg ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              maxLength={255}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              {formData.title.length}/255 characters
            </p>
          </div>

          {/* Subtitle */}
          <div className="mb-6">
            <label className="block font-semibold mb-2">
              Subtitle (Optional)
            </label>
            <input
              type="text"
              name="subtitle"
              value={formData.subtitle}
              onChange={handleChange}
              placeholder="Add a subtitle..."
              className={`w-full px-4 py-3 border rounded-lg ${
                errors.subtitle ? 'border-red-500' : 'border-gray-300'
              }`}
              maxLength={255}
            />
            {errors.subtitle && (
              <p className="text-red-500 text-sm mt-1">{errors.subtitle}</p>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block font-semibold mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell readers what your book is about..."
              rows={6}
              className={`w-full px-4 py-3 border rounded-lg resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              maxLength={5000}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              {formData.description.length}/5000 characters
            </p>
          </div>

          {/* Language */}
          <div className="mb-6">
            <label className="block font-semibold mb-2">
              Language
            </label>
            <select
              name="language"
              value={formData.language}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Cover Color */}
          <div className="mb-8">
            <label className="block font-semibold mb-2">
              Cover Color
            </label>
            <p className="text-sm text-gray-600 mb-3">
              Choose a color for your book cover (no images allowed)
            </p>
            
            {/* Color Preview */}
            <div
              className="w-full h-48 rounded-lg mb-4 flex items-center justify-center text-white text-6xl font-bold shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${formData.cover_color} 0%, ${formData.cover_color}dd 100%)`
              }}
            >
              {formData.title ? formData.title.charAt(0).toUpperCase() : '?'}
            </div>

            {/* Color Presets */}
            <div className="flex flex-wrap gap-2 mb-3">
              {colorPresets.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, cover_color: color }))}
                  className={`w-12 h-12 rounded-lg border-2 transition ${
                    formData.cover_color === color
                      ? 'border-blue-600 ring-2 ring-blue-200'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>

            {/* Custom Color Input */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Custom:</label>
              <input
                type="color"
                value={formData.cover_color}
                onChange={(e) => setFormData(prev => ({ ...prev, cover_color: e.target.value }))}
                className="w-16 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={formData.cover_color}
                onChange={(e) => setFormData(prev => ({ ...prev, cover_color: e.target.value }))}
                placeholder="#667eea"
                className="flex-1 px-3 py-2 border border-gray-300 rounded"
                pattern="^#[0-9A-Fa-f]{6}$"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? 'Creating...' : 'Create Book & Add Chapters'}
            </button>
          </div>
        </form>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">📚 What's Next?</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• After creating your book, you'll add chapters</li>
            <li>• You can publish up to 2 books per week</li>
            <li>• Books must have at least 1 chapter to publish</li>
            <li>• No images allowed - text-only content</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WriteEbookPage;