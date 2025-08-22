import React, { useState, useEffect } from 'react';
import { Shield, Users, FileText, Settings, Ban, Clock, CheckCircle, XCircle, Crown, Star, Award, Trash2, Eye, AlertTriangle, Star as StarIcon } from 'lucide-react';

const AdminPanel = ({ user, logout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [allUsers, setAllUsers] = useState([]);
  const [allArticles, setAllArticles] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [banDuration, setBanDuration] = useState('1');
  const [banReason, setBanReason] = useState('');

  // Check if user is admin or super-admin
  const isAdmin = user.role === 'admin' || user.role === 'super-admin';
  const isSuperAdmin = user.role === 'super-admin';

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch all users
      const usersResponse = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (usersResponse.ok) {
        const users = await usersResponse.json();
        setAllUsers(users);
      }

      // Fetch all articles
      const articlesResponse = await fetch('/api/admin/articles', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (articlesResponse.ok) {
        const articles = await articlesResponse.json();
        setAllArticles(articles);
      }

      // Fetch admin stats
      const statsResponse = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (statsResponse.ok) {
        const adminStats = await statsResponse.json();
        setStats(adminStats);
      }

    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId, action, data = {}) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${userId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        await fetchAdminData();
        setBanModalOpen(false);
        setSelectedUser(null);
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      alert(`Failed to ${action} user`);
    }
  };

  const handleArticleAction = async (articleId, action) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/articles/${articleId}/${action}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        await fetchAdminData();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error(`Error performing ${action} on article:`, error);
    }
  };

  const openBanModal = (user) => {
    setSelectedUser(user);
    setBanModalOpen(true);
  };

  const handleBanUser = () => {
    if (!banReason.trim()) {
      alert('Please provide a reason for the ban');
      return;
    }

    const banData = {
      duration: parseInt(banDuration),
      reason: banReason,
      unit: 'days'
    };

    handleUserAction(selectedUser.id, 'ban', banData);
    setBanReason('');
    setBanDuration('1');
  };

  const getTierIcon = (tier) => {
    switch (tier) {
      case 'diamond': return <Crown className="h-4 w-4 text-blue-400" />;
      case 'platinum': return <Star className="h-4 w-4 text-purple-400" />;
      case 'gold': return <Award className="h-4 w-4 text-yellow-400" />;
      default: return <div className="h-4 w-4 rounded-full bg-gray-400" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'super-admin': return 'text-red-600 bg-red-100';
      case 'admin': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatBanExpiry = (banExpiry) => {
    if (!banExpiry) return 'Not banned';
    const expiry = new Date(banExpiry);
    const now = new Date();
    if (expiry <= now) return 'Ban expired';
    
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `Banned for ${diffDays} more days`;
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-2xl font-bold animate-pulse">Loading Admin Panel...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-sm text-gray-600">
                  {isSuperAdmin ? 'Super Administrator' : 'Administrator'} Dashboard
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                {user.role?.toUpperCase()}
              </span>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4" />
                  <span>Overview</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Users</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('articles')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'articles'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Articles</span>
                </div>
              </button>
              {isSuperAdmin && (
                <button
                  onClick={() => setActiveTab('admins')}
                  className={`py-4 px-6 border-b-2 font-medium text-sm ${
                    activeTab === 'admins'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Settings className="h-4 w-4" />
                    <span>Admin Management</span>
                  </div>
                </button>
              )}
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Articles</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalArticles || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Ban className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Banned Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.bannedUsers || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Verified Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.verifiedUsers || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ban Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allUsers.map((userItem) => (
                    <tr key={userItem.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{userItem.fullName}</div>
                          <div className="text-sm text-gray-500">{userItem.email || userItem.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getTierIcon(userItem.tier)}
                          <span className="text-sm text-gray-900 capitalize">{userItem.tier}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {userItem.verified ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm text-gray-900">
                            {userItem.verified ? 'Verified' : 'Unverified'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm ${
                          userItem.banExpiry && new Date(userItem.banExpiry) > new Date()
                            ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {formatBanExpiry(userItem.banExpiry)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleUserAction(userItem.id, userItem.verified ? 'unverify' : 'verify')}
                          className={`px-3 py-1 rounded ${
                            userItem.verified
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {userItem.verified ? 'Unverify' : 'Verify'}
                        </button>
                        
                        <select
                          value={userItem.tier}
                          onChange={(e) => handleUserAction(userItem.id, 'changeTier', { tier: e.target.value })}
                          className="px-2 py-1 border rounded text-xs"
                        >
                          <option value="silver">Silver</option>
                          <option value="gold">Gold</option>
                          <option value="platinum">Platinum</option>
                          <option value="diamond">Diamond</option>
                        </select>

                        <button
                          onClick={() => openBanModal(userItem)}
                          disabled={userItem.banExpiry && new Date(userItem.banExpiry) > new Date()}
                          className="px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
                        >
                          Ban
                        </button>
                        
                        {userItem.banExpiry && new Date(userItem.banExpiry) > new Date() && (
                          <button
                            onClick={() => handleUserAction(userItem.id, 'unban')}
                            className="px-3 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200"
                          >
                            Unban
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'articles' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Article Management</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Article</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Featured</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Engagement</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allArticles.map((article) => (
                    <tr key={article.id}>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{article.title}</div>
                          <div className="text-sm text-gray-500">{article.category}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{article.author}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          article.status === 'published' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {article.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm ${
                          article.isFeatured ? 'text-yellow-600' : 'text-gray-600'
                        }`}>
                          {article.isFeatured ? 'Featured' : 'Not Featured'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>Views: {article.views || 0}</div>
                        <div>Likes: {article.likedBy?.length || 0}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleArticleAction(article.id, article.isFeatured ? 'unfeature' : 'feature')}
                          className={`px-3 py-1 rounded ${
                            article.isFeatured
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          }`}
                        >
                          {article.isFeatured ? <StarIcon className="h-4 w-4" /> : <StarIcon className="h-4 w-4" />}
                          {article.isFeatured ? 'Unfeature' : 'Feature'}
                        </button>
                        <button
                          onClick={() => handleArticleAction(article.id, 'delete')}
                          className="px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'admins' && isSuperAdmin && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Admin Management</h2>
              <p className="text-sm text-gray-600 mt-1">Promote or demote administrators</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allUsers.map((userItem) => (
                    <tr key={userItem.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{userItem.fullName}</div>
                          <div className="text-sm text-gray-500">{userItem.email || userItem.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(userItem.role || 'user')}`}>
                          {(userItem.role || 'user').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {userItem.role !== 'super-admin' && userItem.id !== user.id && (
                          <>
                            {userItem.role === 'admin' ? (
                              <button
                                onClick={() => handleUserAction(userItem.id, 'demoteAdmin')}
                                className="px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                              >
                                Demote to User
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUserAction(userItem.id, 'promoteAdmin')}
                                className="px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                              >
                                Promote to Admin
                              </button>
                            )}
                          </>
                        )}
                        {userItem.id === user.id && (
                          <span className="text-gray-500 text-sm">You</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Ban Modal */}
      {banModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Ban User: {selectedUser.fullName}</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ban Duration (days)
              </label>
              <input
                type="number"
                value={banDuration}
                onChange={(e) => setBanDuration(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Ban
              </label>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="e.g., Spam, Harassment, Inappropriate content..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setBanModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleBanUser}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Ban User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;