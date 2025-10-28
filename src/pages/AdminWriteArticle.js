// src/pages/AdminWriteArticle.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AdminWriteArticle() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    title: '',
    content: '',
    topicIds: []
  });
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const response = await axios.get('/topics');
      setTopics(response.data.topics);
    } catch (err) {
      console.error('Error fetching topics:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTopicToggle = (topicId) => {
    setFormData(prev => {
      const newTopicIds = prev.topicIds.includes(topicId)
        ? prev.topicIds.filter(id => id !== topicId)
        : [...prev.topicIds, topicId];
      
      if (newTopicIds.length > 3) {
        setError('You can select a maximum of 3 topics');
        return prev;
      }
      
      setError('');
      return { ...prev, topicIds: newTopicIds };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (!formData.username.trim()) {
      setError('Username is required');
      setLoading(false);
      return;
    }

    if (!formData.title.trim()) {
      setError('Title is required');
      setLoading(false);
      return;
    }

    if (!formData.content.trim()) {
      setError('Content is required');
      setLoading(false);
      return;
    }

    if (formData.title.length > 255) {
      setError('Title must be 255 characters or less');
      setLoading(false);
      return;
    }

    try {
      await axios.post('/admin/articles/create', {
        username: formData.username.trim(),
        title: formData.title.trim(),
        content: formData.content.trim(),
        topicIds: formData.topicIds
      });

      setSuccess('Article posted successfully!');
      
      // Reset form
      setFormData({
        username: '',
        title: '',
        content: '',
        topicIds: []
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/admin');
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post article');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin: Post Article</h1>
            <p className="text-gray-600 mt-2">
              Create and publish articles without account restrictions
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Author Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter author username"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                This username will be displayed as the article author
              </p>
            </div>

            {/* Title Field */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Article Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter article title"
                maxLength={255}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.title.length}/255 characters
              </p>
            </div>

            {/* Topics Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topics (Select up to 3)
              </label>
              <div className="flex flex-wrap gap-2">
                {topics.map(topic => (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => handleTopicToggle(topic.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      formData.topicIds.includes(topic.id)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {topic.name}
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {formData.topicIds.length}/3 topics selected
              </p>
            </div>

            {/* Content Field */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Article Content
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Write your article content here..."
                rows={15}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Write the full article content. Supports plain text formatting.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Posting...' : 'Post Article'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Admin Article Posting</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Articles posted through this page bypass all restrictions</li>
              <li>• No weekly limits apply to admin-posted articles</li>
              <li>• Articles are automatically published and visible immediately</li>
              <li>• The username provided will be shown as the author</li>
              <li>• These articles help build the website's content library</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminWriteArticle;