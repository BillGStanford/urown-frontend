import React, { useState, useEffect } from 'react';
import { Gift, Plus, Edit2, Trash2, Power, Users, TrendingUp, Search, AlertCircle, CheckCircle, X } from 'lucide-react';
import { fetchWithRetry, createApiRequest, fetchWithDeduplication } from '../utils/apiUtils';

function AdminInviteCodeManagement() {
  const [activeTab, setActiveTab] = useState('codes');
  const [codes, setCodes] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedCodeUsers, setSelectedCodeUsers] = useState([]);
  const [selectedCode, setSelectedCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Create/Edit modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [modalData, setModalData] = useState({
    code: '',
    name: '',
    description: ''
  });
  const [modalErrors, setModalErrors] = useState({});

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCodes();
    fetchLeaderboard();
  }, []);

  const fetchCodes = async () => {
    try {
      setLoading(true);
      const response = await fetchWithRetry(
        createApiRequest('/admin/invite-codes')
      );
      setCodes(response.data.codes);
    } catch (err) {
      setError('Failed to load invite codes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetchWithRetry(
        createApiRequest('/admin/invite-codes/leaderboard')
      );
      setLeaderboard(response.data.leaderboard);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    }
  };

  const fetchCodeUsers = async (code) => {
    try {
      setLoading(true);
      const response = await fetchWithRetry(
        createApiRequest(`/admin/invite-codes/${code}/users`)
      );
      setSelectedCodeUsers(response.data.users);
      setSelectedCode(code);
      setActiveTab('users');
    } catch (err) {
      setError('Failed to load users for this code');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setModalData({ code: '', name: '', description: '' });
    setModalErrors({});
    setShowModal(true);
  };

  const openEditModal = (code) => {
    setModalMode('edit');
    setModalData({
      id: code.id,
      code: code.code,
      name: code.name,
      description: code.description || ''
    });
    setModalErrors({});
    setShowModal(true);
  };

  const validateModalData = () => {
    const errors = {};
    
    if (modalMode === 'create') {
      if (!modalData.code || modalData.code.length !== 5) {
        errors.code = 'Code must be exactly 5 characters';
      }
      if (!/^[A-Z0-9]{5}$/.test(modalData.code)) {
        errors.code = 'Code must contain only letters and numbers';
      }
    }
    
    if (!modalData.name || modalData.name.trim().length < 3) {
      errors.name = 'Name must be at least 3 characters';
    }
    
    setModalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateCode = async () => {
    if (!validateModalData()) return;

    try {
      await fetchWithRetry(
        createApiRequest('/admin/invite-codes', {
          method: 'POST',
          data: {
            code: modalData.code.toUpperCase(),
            name: modalData.name.trim(),
            description: modalData.description.trim()
          }
        })
      );
      
      setSuccess('Invite code created successfully!');
      setShowModal(false);
      fetchCodes();
      fetchLeaderboard();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create invite code');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleUpdateCode = async () => {
    if (!validateModalData()) return;

    try {
      await fetchWithRetry(
        createApiRequest(`/admin/invite-codes/${modalData.id}`, {
          method: 'PUT',
          data: {
            name: modalData.name.trim(),
            description: modalData.description.trim()
          }
        })
      );
      
      setSuccess('Invite code updated successfully!');
      setShowModal(false);
      fetchCodes();
      fetchLeaderboard();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update invite code');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await fetchWithRetry(
        createApiRequest(`/admin/invite-codes/${id}/toggle`, {
          method: 'PATCH'
        })
      );
      setSuccess('Code status updated!');
      fetchCodes();
      fetchLeaderboard();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to toggle code status');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteCode = async (id, codeName) => {
    if (!window.confirm(`Are you sure you want to delete the invite code "${codeName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await fetchWithRetry(
        createApiRequest(`/admin/invite-codes/${id}`, {
          method: 'DELETE'
        })
      );
      setSuccess('Invite code deleted successfully!');
      fetchCodes();
      fetchLeaderboard();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete invite code');
      setTimeout(() => setError(''), 3000);
    }
  };

  const filteredCodes = codes.filter(code =>
    code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    code.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = selectedCodeUsers.filter(user =>
    user.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Gift className="w-12 h-12 text-orange-600" />
              <div>
                <h1 className="text-4xl font-black text-gray-900">Invite Code Management</h1>
                <p className="text-gray-600 mt-1">Create and manage invite codes for user signups</p>
              </div>
            </div>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Code
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border-2 border-red-300 text-red-700 px-6 py-4 rounded-xl mb-6 flex items-center gap-3">
            <AlertCircle className="w-6 h-6" />
            <span className="font-bold">{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-2 border-green-300 text-green-700 px-6 py-4 rounded-xl mb-6 flex items-center gap-3">
            <CheckCircle className="w-6 h-6" />
            <span className="font-bold">{success}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
          <div className="flex border-b-2 border-gray-200">
            <button
              onClick={() => setActiveTab('codes')}
              className={`flex-1 px-6 py-4 font-bold text-lg transition-colors ${
                activeTab === 'codes'
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Gift className="w-5 h-5 inline-block mr-2" />
              All Codes ({codes.length})
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex-1 px-6 py-4 font-bold text-lg transition-colors ${
                activeTab === 'leaderboard'
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <TrendingUp className="w-5 h-5 inline-block mr-2" />
              Leaderboard
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 px-6 py-4 font-bold text-lg transition-colors ${
                activeTab === 'users'
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Users className="w-5 h-5 inline-block mr-2" />
              Users by Code
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-6 border-b-2 border-gray-200">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={activeTab === 'users' ? 'Search users...' : 'Search codes...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 font-semibold">Loading...</p>
              </div>
            ) : (
              <>
                {/* All Codes Tab */}
                {activeTab === 'codes' && (
                  <div className="space-y-4">
                    {filteredCodes.length === 0 ? (
                      <div className="text-center py-12">
                        <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-xl font-bold text-gray-400">No invite codes found</p>
                        <p className="text-gray-500 mt-2">Create your first invite code to get started</p>
                      </div>
                    ) : (
                      filteredCodes.map((code) => (
                        <div
                          key={code.id}
                          className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 hover:border-orange-300 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-3xl font-black text-gray-900 font-mono bg-white px-4 py-2 rounded-lg border-2 border-gray-300">
                                  {code.code}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                  code.active
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  {code.active ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              <h3 className="text-xl font-bold text-gray-900 mb-1">{code.name}</h3>
                              {code.description && (
                                <p className="text-gray-600 mb-3">{code.description}</p>
                              )}
                              <div className="flex items-center gap-6 text-sm text-gray-500">
                                <span>
                                  <Users className="w-4 h-4 inline mr-1" />
                                  {code.total_users} users
                                </span>
                                <span>Created by {code.created_by_name || 'Unknown'}</span>
                                <span>{new Date(code.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => fetchCodeUsers(code.code)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View users"
                              >
                                <Users className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => openEditModal(code)}
                                className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                                title="Edit code"
                              >
                                <Edit2 className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleToggleActive(code.id)}
                                className={`p-2 ${
                                  code.active ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'
                                } rounded-lg transition-colors`}
                                title={code.active ? 'Deactivate' : 'Activate'}
                              >
                                <Power className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteCode(code.id, code.name)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete code"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Leaderboard Tab */}
                {activeTab === 'leaderboard' && (
                  <div className="space-y-4">
                    {leaderboard.length === 0 ? (
                      <div className="text-center py-12">
                        <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-xl font-bold text-gray-400">No usage data yet</p>
                        <p className="text-gray-500 mt-2">Codes will appear here once they're used</p>
                      </div>
                    ) : (
                      leaderboard.map((item, index) => (
                        <div
                          key={item.code}
                          className="bg-gradient-to-r from-orange-50 to-white border-2 border-gray-200 rounded-xl p-6"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`text-3xl font-black ${
                                index === 0 ? 'text-yellow-500' :
                                index === 1 ? 'text-gray-400' :
                                index === 2 ? 'text-orange-600' :
                                'text-gray-600'
                              }`}>
                                #{index + 1}
                              </div>
                              <div>
                                <div className="flex items-center gap-3 mb-1">
                                  <span className="text-2xl font-black text-gray-900 font-mono">
                                    {item.code}
                                  </span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                    item.active
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-red-100 text-red-700'
                                  }`}>
                                    {item.active ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                                {item.description && (
                                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-4xl font-black text-orange-600">
                                {item.user_count}
                              </div>
                              <div className="text-sm text-gray-500 font-semibold">Users</div>
                              <button
                                onClick={() => fetchCodeUsers(item.code)}
                                className="mt-2 text-sm text-blue-600 hover:underline font-semibold"
                              >
                                View Users →
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Users by Code Tab */}
                {activeTab === 'users' && (
                  <div>
                    {selectedCode ? (
                      <>
                        <div className="mb-6 pb-4 border-b-2 border-gray-200">
                          <h2 className="text-2xl font-black text-gray-900 mb-2">
                            Users with code: <span className="text-orange-600 font-mono">{selectedCode}</span>
                          </h2>
                          <p className="text-gray-600">
                            Total: <span className="font-bold">{selectedCodeUsers.length}</span> users
                          </p>
                        </div>
                        
                        {filteredUsers.length === 0 ? (
                          <div className="text-center py-12">
                            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-xl font-bold text-gray-400">No users found</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {filteredUsers.map((user) => (
                              <div
                                key={user.id}
                                className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-orange-300 transition-colors"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h3 className="text-lg font-bold text-gray-900">
                                      {user.display_name}
                                    </h3>
                                    <p className="text-sm text-gray-600">{user.email}</p>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm text-gray-500">
                                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                        user.tier === 'Gold' ? 'bg-yellow-100 text-yellow-700' :
                                        user.tier === 'Silver' ? 'bg-gray-100 text-gray-700' :
                                        'bg-orange-100 text-orange-700'
                                      }`}>
                                        {user.tier}
                                      </span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      Score: {user.urown_score}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                      Joined {new Date(user.created_at).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-xl font-bold text-gray-400">Select a code to view users</p>
                        <p className="text-gray-500 mt-2">
                          Click "View Users" on any code to see who signed up with it
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-gray-900">
                {modalMode === 'create' ? 'Create Invite Code' : 'Edit Invite Code'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {modalMode === 'create' && (
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Code (5 characters) *
                  </label>
                  <input
                    type="text"
                    value={modalData.code}
                    onChange={(e) => setModalData({ ...modalData, code: e.target.value.toUpperCase() })}
                    maxLength={5}
                    className={`w-full px-4 py-3 border-2 rounded-xl font-mono text-lg uppercase ${
                      modalErrors.code ? 'border-red-500' : 'border-gray-300'
                    } focus:border-orange-600 focus:outline-none`}
                    placeholder="ABC12"
                  />
                  {modalErrors.code && (
                    <p className="mt-1 text-sm text-red-600">{modalErrors.code}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={modalData.name}
                  onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                  className={`w-full px-4 py-3 border-2 rounded-xl ${
                    modalErrors.name ? 'border-red-500' : 'border-gray-300'
                  } focus:border-orange-600 focus:outline-none`}
                  placeholder="Debate Discord Server"
                />
                {modalErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{modalErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={modalData.description}
                  onChange={(e) => setModalData({ ...modalData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-600 focus:outline-none resize-none"
                  placeholder="Additional information about this invite code..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={modalMode === 'create' ? handleCreateCode : handleUpdateCode}
                className="flex-1 px-4 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors"
              >
                {modalMode === 'create' ? 'Create' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminInviteCodeManagement;