// src/pages/ebooks/EditEbookPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ChapterList from '../../components/ChapterList';
import PublishModal from '../../components/PublishModal';

const EditEbookPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [ebook, setEbook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    cover_color: '#667eea'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [weeklyPublishedCount, setWeeklyPublishedCount] = useState(0);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchEbookDetails();
    fetchWeeklyCount();
  }, [id]);

  const fetchEbookDetails = async () => {
    try {
      const [ebookRes, chaptersRes] = await Promise.all([
        axios.get(`/ebooks/${id}`),
        axios.get(`/ebooks/${id}/chapters`)
      ]);
      
      const ebookData = ebookRes.data.ebook;
      setEbook(ebookData);
      setChapters(chaptersRes.data.chapters);
      setFormData({
        title: ebookData.title,
        subtitle: ebookData.subtitle || '',
        description: ebookData.description || '',
        cover_color: ebookData.cover_color || '#667eea'
      });
    } catch (error) {
      console.error('Error fetching ebook:', error);
      alert('Failed to load book');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeklyCount = async () => {
    try {
      const response = await axios.get('/user/profile');
      setWeeklyPublishedCount(response.data.user.weekly_ebooks_count || 0);
    } catch (error) {
      console.error('Error fetching weekly count:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
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

  const handleSaveMetadata = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      await axios.put(`/ebooks/${id}`, formData);
      alert('Book details saved successfully');
      await fetchEbookDetails();
    } catch (error) {
      console.error('Error saving metadata:', error);
      alert(error.response?.data?.error || 'Failed to save book details');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (publishData) => {
    if (chapters.length === 0) {
      alert('Please add at least one chapter before publishing');
      return;
    }

    try {
      setSaving(true);
      await axios.post(`/ebooks/${id}/publish`, publishData);
      alert('Book published successfully!');
      setShowPublishModal(false);
      await fetchEbookDetails();
      navigate(`/ebooks/${id}`);
    } catch (error) {
      console.error('Error publishing book:', error);
      alert(error.response?.data?.error || 'Failed to publish book');
    } finally {
      setSaving(false);
    }
  };

  const handleReorderChapters = async (reorderedChapters) => {
    try {
      setChapters(reorderedChapters);
      await axios.put(`/ebooks/${id}/chapters/reorder`, {
        chapter_ids: reorderedChapters.map(ch => ch.id)
      });
    } catch (error) {
      console.error('Error reordering chapters:', error);
      await fetchEbookDetails(); // Revert on error
    }
  };

  const handleDeleteChapter = async (chapterId) => {
    if (!window.confirm('Delete this chapter? This cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/ebooks/${id}/chapters/${chapterId}`);
      await fetchEbookDetails();
    } catch (error) {
      console.error('Error deleting chapter:', error);
      alert('Failed to delete chapter');
    }
  };

  const handleDeleteBook = async () => {
    if (!window.confirm('Delete this entire book? This cannot be undone and will delete all chapters.')) {
      return;
    }

    const confirmText = window.prompt('Type "DELETE" to confirm:');
    if (confirmText !== 'DELETE') {
      return;
    }

    try {
      await axios.delete(`/ebooks/${id}`);
      alert('Book deleted successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting book:', error);
      alert('Failed to delete book');
    }
  };

  const colorPresets = [
    '#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b',
    '#fa709a', '#fee140', '#30cfd0', '#a8edea', '#fed6e3'
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
            >
              ← Back
            </button>
            <div>
              <h1 className="font-bold text-xl">Edit Book</h1>
              <p className="text-sm text-gray-600">
                {ebook?.published ? 'Published' : 'Draft'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveMetadata}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            
            {!ebook?.published && (
              <button
                onClick={() => setShowPublishModal(true)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Publish Book
              </button>
            )}

            {ebook?.published && (
              <button
                onClick={() => navigate(`/ebooks/${id}`)}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                View Book
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Metadata */}
          <div className="lg:col-span-2 space-y-6">
            {/* Book Details */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h2 className="font-bold text-xl mb-6">Book Details</h2>

              {/* Title */}
              <div className="mb-6">
                <label className="block font-semibold mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  maxLength={255}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              {/* Subtitle */}
              <div className="mb-6">
                <label className="block font-semibold mb-2">Subtitle</label>
                <input
                  type="text"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  maxLength={255}
                />
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block font-semibold mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none"
                  maxLength={5000}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.description.length}/5000 characters
                </p>
              </div>

              {/* Cover Color */}
              <div>
                <label className="block font-semibold mb-2">Cover Color</label>
                <div
                  className="w-full h-48 rounded-lg mb-4 flex items-center justify-center text-white text-6xl font-bold"
                  style={{
                    background: `linear-gradient(135deg, ${formData.cover_color} 0%, ${formData.cover_color}dd 100%)`
                  }}
                >
                  {formData.title ? formData.title.charAt(0).toUpperCase() : '?'}
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {colorPresets.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, cover_color: color }))}
                      className={`w-12 h-12 rounded-lg border-2 ${
                        formData.cover_color === color
                          ? 'border-blue-600 ring-2 ring-blue-200'
                          : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>

                <input
                  type="color"
                  value={formData.cover_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, cover_color: e.target.value }))}
                  className="w-full h-12 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Chapters */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h2 className="font-bold text-xl mb-6">Chapters</h2>
              <ChapterList
                chapters={chapters}
                ebookId={id}
                onReorder={handleReorderChapters}
                onDelete={handleDeleteChapter}
              />
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="font-bold text-lg text-red-900 mb-4">Danger Zone</h3>
              <button
                onClick={handleDeleteBook}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete This Book
              </button>
              <p className="text-sm text-red-700 mt-2">
                This will permanently delete the book and all its chapters. This cannot be undone.
              </p>
            </div>
          </div>

          {/* Right Column - Stats & Info */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="font-bold text-lg mb-4">Statistics</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-semibold">
                    {ebook?.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Chapters:</span>
                  <span className="font-semibold">{chapters.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Words:</span>
                  <span className="font-semibold">
                    {chapters.reduce((sum, ch) => sum + (ch.word_count || 0), 0).toLocaleString()}
                  </span>
                </div>
                {ebook?.published && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reads:</span>
                    <span className="font-semibold">{ebook.views || 0}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-semibold">
                    {new Date(ebook?.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Publishing Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Publishing Limits</h4>
              <p className="text-sm text-blue-800">
                You can publish up to 2 books per week. You've published{' '}
                {weeklyPublishedCount} this week.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Publish Modal */}
      <PublishModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        onPublish={handlePublish}
        ebook={{ ...ebook, chapter_count: chapters.length }}
        weeklyPublishedCount={weeklyPublishedCount}
      />
    </div>
  );
};

export default EditEbookPage;