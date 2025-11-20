import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PenTool, AlertCircle, CheckCircle, X, ArrowLeft } from 'lucide-react';
import { fetchWithDeduplication, createApiRequest, validateUserSession } from '../../utils/apiUtils';

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
      const response = await fetchWithDeduplication(
        'admin-topics',
        createApiRequest('/topics', { method: 'GET' })
      );
      setTopics(response.data.topics);
    } catch (err) {
      console.error('Error fetching topics:', err);
      setError('Failed to load topics. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleTopicToggle = (topicId) => {
    setFormData(prev => {
      const exists = prev.topicIds.includes(topicId);
      const newIds = exists
        ? prev.topicIds.filter(id => id !== topicId)
        : [...prev.topicIds, topicId];

      if (newIds.length > 3) {
        setError('Maximum 3 topics allowed');
        return prev;
      }

      setError('');
      return { ...prev, topicIds: newIds };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (!formData.username.trim()) return setError('Author username is required');
    if (!formData.title.trim()) return setError('Article title is required');
    if (!formData.content.trim()) return setError('Article content is required');
    if (formData.title.length > 255) return setError('Title must be 255 characters or less');

    // Validate user session before making the request
    const isSessionValid = await validateUserSession();
    if (!isSessionValid) {
      setError('Your session has expired. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      await fetchWithDeduplication(
        'admin-create-article',
        createApiRequest('/admin/articles/create', {
          method: 'POST',
          data: {
            username: formData.username.trim(),
            title: formData.title.trim(),
            content: formData.content.trim(),
            topicIds: formData.topicIds
          }
        })
      );

      setSuccess('Article published successfully');
      setFormData({ username: '', title: '', content: '', topicIds: [] });

      setTimeout(() => navigate('/admin'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to publish article');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <PenTool className="text-indigo-600" size={24} />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Create Article</h1>
                <p className="text-sm text-gray-500">Admin-only publishing interface</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={18} />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Alert Messages */}
          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle size={18} />
                <span className="font-medium">{error}</span>
              </div>
              <button onClick={() => setError('')} className="text-red-600 hover:text-red-800">
                <X size={18} />
              </button>
            </div>
          )}

          {success && (
            <div className="mb-5 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center">
              <CheckCircle size={18} className="mr-2" />
              <span className="font-medium">{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Author Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Author Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="e.g., john_doe"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <p className="mt-1.5 text-xs text-gray-500">
                This user will appear as the article author
              </p>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Article Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter a clear, descriptive title"
                maxLength={255}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <div className="mt-1.5 flex justify-between text-xs text-gray-500">
                <span>Title must be accurate and under 255 characters</span>
                <span>{formData.title.length}/255</span>
              </div>
            </div>

            {/* Topics */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topics <span className="text-gray-500">(Max 3)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {topics.map(topic => (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => handleTopicToggle(topic.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                      formData.topicIds.includes(topic.id)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {topic.name}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-xs text-gray-500">
                {formData.topicIds.length} of 3 topics selected
              </p>
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Article Content <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Write full article content here..."
                rows={16}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                required
              />
              <p className="mt-1.5 text-xs text-gray-500">
                Plain text only. Use markdown-style formatting if needed.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Articles posted via admin bypass all user limits and are published immediately.
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => navigate('/admin')}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-6 py-2.5 rounded-lg font-medium text-white transition ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {loading ? 'Publishing...' : 'Publish Article'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-indigo-50 border border-indigo-200 rounded-lg p-5">
          <h3 className="font-medium text-indigo-900 mb-2">Admin Publishing Privileges</h3>
          <ul className="text-sm text-indigo-800 space-y-1">
            <li>• No weekly article limits</li>
            <li>• Immediate publication</li>
            <li>• Full editorial override</li>
            <li>• Content appears under specified username</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AdminWriteArticle;