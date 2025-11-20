// src/pages/AdminRedFlaggedDashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AdminRedFlaggedDashboard = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedPost, setSelectedPost] = useState(null);
  const [flagReason, setFlagReason] = useState('');
  
  useEffect(() => {
    fetchPosts();
  }, []);
  
  const fetchPosts = async () => {
    try {
      setLoading(true);
      // Remove /api prefix since it's already in the base URL
      const response = await axios.get('/redflagged?limit=100');
      setPosts(response.data.posts);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      alert('Failed to fetch posts: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };
  
  const handleFlag = async (postId, flagged) => {
    try {
      // Remove /api prefix
      await axios.put(`/admin/redflagged/${postId}/flag`, {
        flagged,
        flagged_reason: flagged ? flagReason : null
      });
      
      alert(flagged ? 'Post flagged successfully' : 'Post unflagged successfully');
      setSelectedPost(null);
      setFlagReason('');
      fetchPosts();
    } catch (error) {
      alert('Failed to update post: ' + (error.response?.data?.error || error.message));
    }
  };
  
  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to permanently delete this post?')) {
      return;
    }
    
    try {
      // Remove /api prefix
      await axios.delete(`/admin/redflagged/${postId}`);
      alert('Post deleted successfully');
      fetchPosts();
    } catch (error) {
      alert('Failed to delete post: ' + (error.response?.data?.error || error.message));
    }
  };
  
  const filteredPosts = posts.filter(post => {
    if (filter === 'flagged') return post.flagged;
    if (filter === 'unflagged') return !post.flagged;
    return true;
  });
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-gray-900 mb-2">
              RedFlagged Management
            </h1>
            <p className="text-gray-600">Moderate and manage RedFlagged posts</p>
          </div>
          <Link
            to="/admin/redflagged/topics"
            className="bg-purple-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-purple-700 transition"
          >
            💭 Manage Topics
          </Link>
        </div>
        
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex gap-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              All ({posts.length})
            </button>
            <button
              onClick={() => setFilter('flagged')}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                filter === 'flagged' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Flagged ({posts.filter(p => p.flagged).length})
            </button>
            <button
              onClick={() => setFilter('unflagged')}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                filter === 'unflagged' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Active ({posts.filter(p => !p.flagged).length})
            </button>
          </div>
        </div>
        
        {/* Posts Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Experience
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Stats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPosts.map(post => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{post.company_name}</div>
                    {post.position && (
                      <div className="text-sm text-gray-500">{post.position}</div>
                    )}
                    {post.topic_title && (
                      <div className="text-xs text-purple-600 mt-1">
                        💭 {post.topic_title}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{post.experience_type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-lg">{Number(post.overall_rating).toFixed(1)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm">{post.author_name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-gray-600">
                      <div>👁️ {post.views} views</div>
                      <div>❤️ {post.reaction_count} reactions</div>
                      <div>💬 {post.comment_count || 0} comments</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {post.flagged ? (
                      <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                        Flagged
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link
                        to={`/redflagged/${post.id}`}
                        target="_blank"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => setSelectedPost(post)}
                        className="text-yellow-600 hover:underline text-sm"
                      >
                        {post.flagged ? 'Unflag' : 'Flag'}
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="text-red-600 hover:underline text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredPosts.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No posts found
            </div>
          )}
        </div>
      </div>
      
      {/* Flag Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h3 className="text-2xl font-bold mb-4">
              {selectedPost.flagged ? 'Unflag Post' : 'Flag Post'}
            </h3>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="font-bold mb-2">{selectedPost.company_name}</div>
              <p className="text-sm text-gray-600 line-clamp-3">{selectedPost.story}</p>
            </div>
            
            {!selectedPost.flagged && (
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">
                  Reason for flagging
                </label>
                <textarea
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  placeholder="Enter reason..."
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>
            )}
            
            {selectedPost.flagged && selectedPost.flagged_reason && (
              <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
                <div className="text-sm font-semibold mb-1">Current flag reason:</div>
                <div className="text-sm text-gray-700">{selectedPost.flagged_reason}</div>
              </div>
            )}
            
            <div className="flex gap-4">
              <button
                onClick={() => handleFlag(selectedPost.id, !selectedPost.flagged)}
                className={`flex-1 py-3 rounded-lg font-bold transition ${
                  selectedPost.flagged
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {selectedPost.flagged ? 'Unflag Post' : 'Flag Post'}
              </button>
              <button
                onClick={() => {
                  setSelectedPost(null);
                  setFlagReason('');
                }}
                className="px-6 py-3 border rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRedFlaggedDashboard;