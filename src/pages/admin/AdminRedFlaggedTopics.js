import React, { useState, useEffect } from 'react';
import { 
  fetchAllTopics, 
  createTopic, 
  updateTopic, 
  deleteTopic, 
  toggleTopicActive 
} from '../../utils/redFlaggedApi';

const AdminRedFlaggedTopics = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    expires_at: ''
  });
  const [error, setError] = useState('');
  
  useEffect(() => {
    loadTopics();
  }, []);
  
  const loadTopics = async () => {
    try {
      setLoading(true);
      const data = await fetchAllTopics();
      setTopics(data.topics || []);
    } catch (error) {
      console.error('Failed to load topics:', error);
      setError('Failed to load topics');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }
    
    try {
      if (editingTopic) {
        await updateTopic(editingTopic.id, formData);
      } else {
        await createTopic(formData);
      }
      
      setShowModal(false);
      setEditingTopic(null);
      setFormData({ title: '', description: '', expires_at: '' });
      loadTopics();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to save topic');
    }
  };
  
  const handleEdit = (topic) => {
    setEditingTopic(topic);
    setFormData({
      title: topic.title,
      description: topic.description,
      expires_at: topic.expires_at ? new Date(topic.expires_at).toISOString().slice(0, 16) : ''
    });
    setShowModal(true);
  };
  
  const handleDelete = async (topicId) => {
    if (!window.confirm('Are you sure you want to delete this topic? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteTopic(topicId);
      loadTopics();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete topic');
    }
  };
  
  const handleToggleActive = async (topicId, currentStatus) => {
    try {
      await toggleTopicActive(topicId, !currentStatus);
      loadTopics();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to toggle topic status');
    }
  };
  
  const activeTopics = topics.filter(t => t.active);
  const canCreateMore = activeTopics.length < 10;
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-gray-900 mb-2">
              💭 RedFlagged Topics
            </h1>
            <p className="text-gray-600">
              Manage topics for users to write about ({activeTopics.length}/10 active)
            </p>
          </div>
          <button
            onClick={() => {
              setEditingTopic(null);
              setFormData({ title: '', description: '', expires_at: '' });
              setShowModal(true);
            }}
            disabled={!canCreateMore}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            + Create New Topic
          </button>
        </div>
        
        {!canCreateMore && (
          <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700">
            <p className="font-semibold">Maximum topics reached</p>
            <p className="text-sm">You can have a maximum of 10 active topics. Deactivate or delete existing topics to create new ones.</p>
          </div>
        )}
        
        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {topics.map(topic => (
            <div
              key={topic.id}
              className={`bg-white rounded-xl shadow-md p-6 border-2 ${
                topic.active ? 'border-purple-200' : 'border-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">
                      {topic.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      topic.active 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {topic.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {topic.description}
                  </p>
                  {topic.expires_at && (
                    <p className="text-xs text-gray-500">
                      📅 Expires: {new Date(topic.expires_at).toLocaleString()}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Created: {new Date(topic.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleActive(topic.id, topic.active)}
                  className={`flex-1 py-2 rounded-lg font-semibold text-sm transition ${
                    topic.active
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      : 'bg-green-100 hover:bg-green-200 text-green-700'
                  }`}
                >
                  {topic.active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleEdit(topic)}
                  className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-semibold text-sm transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(topic.id)}
                  className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-semibold text-sm transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {topics.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">💭</div>
            <p className="text-xl font-bold text-gray-900 mb-2">No topics yet</p>
            <p className="text-gray-600 mb-6">
              Create your first topic to help users share specific experiences
            </p>
          </div>
        )}
      </div>
      
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-8">
            <h3 className="text-2xl font-bold mb-6">
              {editingTopic ? 'Edit Topic' : 'Create New Topic'}
            </h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Craziest Story that Happened to You"
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what kind of stories you want users to share..."
                  rows={4}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">
                  Expiration Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.expires_at}
                  onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave blank for no expiration
                </p>
              </div>
              
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition"
                >
                  {editingTopic ? 'Update Topic' : 'Create Topic'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingTopic(null);
                    setFormData({ title: '', description: '', expires_at: '' });
                    setError('');
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRedFlaggedTopics;