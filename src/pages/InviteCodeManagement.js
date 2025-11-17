// src/pages/InviteCodeManagement.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Gift, Plus, Users, Trophy, Search, Check, X, Trash2, Power, ChevronDown, ChevronUp, Copy } from 'lucide-react';

function InviteCodeManagement() {
  const [activeTab, setActiveTab] = useState('create');
  const [inviteCodes, setInviteCodes] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Create form state
  const [createForm, setCreateForm] = useState({
    code: '',
    name: '',
    description: ''
  });
  
  // Filter state
  const [filterCode, setFilterCode] = useState('');
  const [expandedCode, setExpandedCode] = useState(null);
  const [selectedCodeUsers, setSelectedCodeUsers] = useState([]);
  
  useEffect(() => {
    if (activeTab === 'all') loadInviteCodes();
    if (activeTab === 'leaderboard') loadLeaderboard();
    if (activeTab === 'users') loadUsers();
  }, [activeTab]);
  
  const loadInviteCodes = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/invite-codes');
      setInviteCodes(response.data.inviteCodes);
    } catch (err) {
      setError('Failed to load invite codes');
    } finally {
      setLoading(false);
    }
  };
  
  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/invite-codes/leaderboard');
      setLeaderboard(response.data.leaderboard);
    } catch (err) {
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };
  
  const loadUsers = async (code = '') => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/users/with-invite-codes', {
        params: { code: code || undefined }
      });
      setUsers(response.data.users);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (createForm.code.length !== 6) {
      setError('Code must be exactly 6 characters');
      return;
    }
    
    try {
      setLoading(true);
      await axios.post('/api/admin/invite-codes', createForm);
      setSuccess('Invite code created successfully!');
      setCreateForm({ code: '', name: '', description: '' });
      if (activeTab === 'all') loadInviteCodes();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create invite code');
    } finally {
      setLoading(false);
    }
  };
  
  const handleToggleActive = async (id, currentStatus) => {
    try {
      await axios.put(`/api/admin/invite-codes/${id}/toggle`, {
        active: !currentStatus
      });
      setSuccess(`Invite code ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      loadInviteCodes();
    } catch (err) {
      setError('Failed to update invite code status');
    }
  };
  
  const handleDeleteCode = async (id) => {
    if (!window.confirm('Are you sure you want to delete this invite code? This action cannot be undone.')) {
      return;
    }
    
    try {
      await axios.delete(`/api/admin/invite-codes/${id}`);
      setSuccess('Invite code deleted successfully!');
      loadInviteCodes();
    } catch (err) {
      setError('Failed to delete invite code');
    }
  };
  
  const loadCodeUsers = async (code) => {
    try {
      const response = await axios.get(`/api/admin/invite-codes/${code}/users`);
      setSelectedCodeUsers(response.data.users);
      setExpandedCode(code);
    } catch (err) {
      setError('Failed to load users for this code');
    }
  };
  
  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCreateForm(prev => ({ ...prev, code }));
  };
  
  const copyInviteLink = (code) => {
    const link = `${window.location.origin}/signup?invite=${code}`;
    navigator.clipboard.writeText(link);
    setSuccess('Invite link copied to clipboard!');
    setTimeout(() => setSuccess(''), 3000);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3 mb-2">
            <Gift className="w-10 h-10 text-purple-600" />
            Invite Code Management
          </h1>
          <p className="text-gray-600 text-lg">Create and manage invite codes to track user acquisition.</p>
        </div>
        
        {/* Alerts */}
        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-300 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3">
            <X className="w-6 h-6" />
            <span className="font-bold">{error}</span>
            <button onClick={() => setError('')} className="ml-auto">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        
        {success && (
          <div className="mb-6 bg-green-50 border-2 border-green-300 text-green-700 px-6 py-4 rounded-xl flex items-center gap-3">
            <Check className="w-6 h-6" />
            <span className="font-bold">{success}</span>
            <button onClick={() => setSuccess('')} className="ml-auto">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 mb-6">
          <div className="flex border-b-2 border-gray-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-6 py-4 font-bold text-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'create'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Plus className="w-5 h-5" />
              Create New
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-4 font-bold text-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Gift className="w-5 h-5" />
              All Codes
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-6 py-4 font-bold text-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'leaderboard'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Trophy className="w-5 h-5" />
              Leaderboard
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-4 font-bold text-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'users'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Users className="w-5 h-5" />
              User Lookup
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-8">
          {/* Create Tab */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateCode} className="max-w-2xl mx-auto space-y-6">
              <div>
                <label className="block text-lg font-bold text-gray-900 mb-2">
                  Invite Code * (6 characters)
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={createForm.code}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    maxLength={6}
                    className="flex-1 px-5 py-4 rounded-xl border-2 border-gray-300 focus:border-purple-600 focus:outline-none text-lg uppercase tracking-wider font-mono"
                    placeholder="ABC123"
                    required
                  />
                  <button
                    type="button"
                    onClick={generateRandomCode}
                    className="px-6 py-4 bg-gray-200 text-gray-900 font-bold rounded-xl hover:bg-gray-300 transition-colors"
                  >
                    Generate
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-lg font-bold text-gray-900 mb-2">
                  Name/Source *
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-5 py-4 rounded-xl border-2 border-gray-300 focus:border-purple-600 focus:outline-none text-lg"
                  placeholder="Debate Discord Server"
                  required
                />
              </div>
              
              <div>
                <label className="block text-lg font-bold text-gray-900 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-5 py-4 rounded-xl border-2 border-gray-300 focus:border-purple-600 focus:outline-none text-lg"
                  rows={3}
                  placeholder="Additional details about this invite code..."
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full px-8 py-4 bg-purple-600 text-white font-black text-xl rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Invite Code'}
              </button>
            </form>
          )}
          
          {/* All Codes Tab */}
          {activeTab === 'all' && (
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
                </div>
              ) : inviteCodes.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Gift className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-xl font-bold">No invite codes yet</p>
                  <p>Create your first invite code to start tracking invites.</p>
                </div>
              ) : (
                inviteCodes.map((code) => (
                  <div key={code.id} className="border-2 border-gray-200 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl font-black text-purple-600 font-mono tracking-wider">
                            {code.code}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                            code.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {code.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{code.name}</h3>
                        {code.description && (
                          <p className="text-gray-600">{code.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                          <span>Created by: {code.creator_name || 'Unknown'}</span>
                          <span>•</span>
                          <span>Uses: {code.usage_count || 0}</span>
                          {code.last_used_at && (
                            <>
                              <span>•</span>
                              <span>Last used: {new Date(code.last_used_at).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyInviteLink(code.code)}
                          className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Copy invite link"
                        >
                          <Copy className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(code.id, code.active)}
                          className={`p-2 rounded-lg transition-colors ${
                            code.active
                              ? 'text-green-600 hover:bg-green-50'
                              : 'text-red-600 hover:bg-red-50'
                          }`}
                          title={code.active ? 'Deactivate' : 'Activate'}
                        >
                          <Power className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCode(code.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete code"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    
                    {code.usage_count > 0 && (
                      <button
                        onClick={() => expandedCode === code.code ? setExpandedCode(null) : loadCodeUsers(code.code)}
                        className="flex items-center gap-2 text-purple-600 hover:text-purple-800 font-bold"
                      >
                        {expandedCode === code.code ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        View {code.usage_count} user{code.usage_count !== 1 ? 's' : ''}
                      </button>
                    )}
                    
                    {expandedCode === code.code && (
                      <div className="mt-4 bg-gray-50 rounded-lg p-4 space-y-2">
                        {selectedCodeUsers.map((user) => (
                          <div key={user.id} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                            <div>
                              <span className="font-bold text-gray-900">{user.display_name}</span>
                              <span className="text-gray-500 ml-2">({user.email})</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <span className="text-gray-600">Score: {user.urown_score || 0}</span>
                              <span className="px-2 py-1 bg-gray-200 rounded text-gray-700 font-semibold">
                                {user.tier}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
          
          {/* Leaderboard Tab */}
          {activeTab === 'leaderboard' && (
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-xl font-bold">No usage yet</p>
                  <p>Invite codes haven't been used yet.</p>
                </div>
              ) : (
                leaderboard.map((code, index) => (
                  <div key={code.id} className="flex items-center gap-6 p-6 border-2 border-gray-200 rounded-xl hover:border-purple-300 transition-colors">
                    <div className={`text-4xl font-black ${
                      index === 0 ? 'text-yellow-500' :
                      index === 1 ? 'text-gray-400' :
                      index === 2 ? 'text-orange-600' :
                      'text-gray-300'
                    }`}>
                      #{index + 1}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl font-black text-purple-600 font-mono tracking-wider">
                          {code.code}
                        </span>
                        {index < 3 && <Trophy className="w-6 h-6 text-yellow-500" />}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">{code.name}</h3>
                      <p className="text-gray-600 text-sm mt-1">
                        Created by: {code.creator_name || 'Unknown'}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-4xl font-black text-purple-600">
                        {code.usage_count}
                      </div>
                      <div className="text-sm text-gray-600 font-semibold">
                        {code.usage_count === 1 ? 'use' : 'uses'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          
          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={filterCode}
                    onChange={(e) => setFilterCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="w-full pl-12 pr-5 py-4 rounded-xl border-2 border-gray-300 focus:border-purple-600 focus:outline-none text-lg uppercase tracking-wider font-mono"
                    placeholder="Filter by code (e.g., ABC123)"
                  />
                </div>
                <button
                  onClick={() => loadUsers(filterCode)}
                  className="px-8 py-4 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors"
                >
                  Search
                </button>
                {filterCode && (
                  <button
                    onClick={() => {
                      setFilterCode('');
                      loadUsers('');
                    }}
                    className="px-6 py-4 bg-gray-200 text-gray-900 font-bold rounded-xl hover:bg-gray-300 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
              
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-xl font-bold">No users found</p>
                  <p>No users have used invite codes yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-6 border-2 border-gray-200 rounded-xl hover:border-purple-300 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-xl font-bold text-gray-900">{user.display_name}</h3>
                          <span className="px-3 py-1 bg-gray-200 rounded-full text-sm font-semibold">
                            {user.tier}
                          </span>
                        </div>
                        <p className="text-gray-600">{user.email}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>Score: {user.urown_score || 0}</span>
                          <span>•</span>
                          <span>Joined: {new Date(user.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm text-gray-600 font-semibold mb-1">Invite Code:</div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-black text-purple-600 font-mono tracking-wider">
                            {user.invite_code_used}
                          </span>
                        </div>
                        {user.invite_code_name && (
                          <div className="text-sm text-gray-600 mt-1">
                            ({user.invite_code_name})
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InviteCodeManagement;