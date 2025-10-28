// pages/AdminDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { fetchWithDeduplication, createApiRequest } from '../utils/apiUtils';
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { 
  Mail, 
  FileText, 
  AlertTriangle, 
  UserX, 
  UserCheck, 
  Shield, 
  Eye, 
  Users, 
  TrendingUp,
  RefreshCw,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  PenTool
} from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function AdminDashboard() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('overview');
  const [adminStats, setAdminStats] = useState({
    userCounts: [],
    articleStats: {},
    totalViews: 0,
    recentActivity: []
  });
  const [users, setUsers] = useState([]);
  const [articles, setArticles] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteType, setDeleteType] = useState(null);
  
  // Warning system state
  const [accountsToDelete, setAccountsToDelete] = useState([]);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningReason, setWarningReason] = useState('');
  const [warningUserId, setWarningUserId] = useState(null);
  
  // Ban system state
  const [showBanModal, setShowBanModal] = useState(false);
  const [banUserId, setBanUserId] = useState(null);
  const [banDuration, setBanDuration] = useState({ days: 1, hours: 0 });
  const [banReason, setBanReason] = useState('');

  // Fetch admin stats
  const fetchAdminStats = useCallback(async () => {
    try {
      const response = await fetchWithDeduplication(
        'admin-stats',
        createApiRequest('/admin/stats', { method: 'GET' })
      );
      
      setAdminStats(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      if (error.response?.status !== 429) {
        setError('Failed to load admin statistics. Please try again later.');
      }
    }
  }, []);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetchWithDeduplication(
        'admin-users',
        createApiRequest('/admin/users', { method: 'GET' })
      );
      
      setUsers(response.data.users);
      
      // Also fetch accounts to delete
      const accountsResponse = await fetchWithDeduplication(
        'accounts-to-delete',
        createApiRequest('/admin/users/accounts-to-delete', { method: 'GET' })
      );
      
      setAccountsToDelete(accountsResponse.data.users);
      setError(null);
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.response?.status !== 429) {
        setError('Failed to load users. Please try again later.');
      }
    }
  }, []);

  // Fetch articles
  const fetchArticles = useCallback(async () => {
    try {
      const response = await fetchWithDeduplication(
        'admin-articles',
        createApiRequest('/admin/articles', { method: 'GET' })
      );
      
      setArticles(response.data.articles);
      setError(null);
    } catch (error) {
      console.error('Error fetching articles:', error);
      if (error.response?.status !== 429) {
        setError('Failed to load articles. Please try again later.');
      }
    }
  }, []);

  // Fetch audit log
  const fetchAuditLog = useCallback(async () => {
    try {
      const response = await fetchWithDeduplication(
        'admin-audit-log',
        createApiRequest('/admin/audit-log', { method: 'GET' })
      );
      
      setAuditLog(response.data.auditLog);
      setError(null);
    } catch (error) {
      console.error('Error fetching audit log:', error);
      if (error.response?.status !== 429) {
        setError('Failed to load audit log. Please try again later.');
      }
    }
  }, []);

  // Refresh all data
  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchAdminStats(),
        new Promise(resolve => setTimeout(resolve, 300)).then(() => fetchUsers()),
        new Promise(resolve => setTimeout(resolve, 600)).then(() => fetchArticles()),
        new Promise(resolve => setTimeout(resolve, 900)).then(() => fetchAuditLog())
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchAdminStats, fetchUsers, fetchArticles, fetchAuditLog]);

  // Initial data loading
  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'super-admin')) {
      refreshData();
      setLoading(false);
    }
  }, [user]);

  // Handle user role update
  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      await fetchWithDeduplication(
        `update-user-role-${userId}`,
        createApiRequest(`/admin/users/${userId}/role`, {
          method: 'PUT',
          data: { role: newRole }
        })
      );
      
      await refreshData();
      setShowUserModal(false);
    } catch (error) {
      console.error('Error updating user role:', error);
      setError('Failed to update user role. Please try again later.');
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!deleteTarget || !deleteType) return;
    
    try {
      await fetchWithDeduplication(
        `delete-${deleteType}-${deleteTarget}`,
        createApiRequest(`/admin/${deleteType}s/${deleteTarget}`, {
          method: 'DELETE'
        })
      );
      
      await refreshData();
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      setDeleteType(null);
    } catch (error) {
      console.error(`Error deleting ${deleteType}:`, error);
      if (error.response?.status === 404) {
        setError(`The ${deleteType} was not found.`);
      } else if (error.response?.status === 403) {
        setError(`You don't have permission to delete this ${deleteType}.`);
      } else {
        setError(`Failed to delete ${deleteType}. Please try again later.`);
      }
    }
  };

  // Handle article certification
  const handleCertifyArticle = async (articleId, certified) => {
    try {
      await fetchWithDeduplication(
        `certify-article-${articleId}`,
        createApiRequest(`/editorial/articles/${articleId}/certify`, {
          method: 'POST',
          data: { certified }
        })
      );
      
      await refreshData();
    } catch (error) {
      console.error('Error certifying article:', error);
      setError('Failed to update article certification. Please try again later.');
    }
  };

  // Handle add warning
  const handleAddWarning = async () => {
    if (!warningReason.trim()) {
      alert('Please enter a reason for the warning');
      return;
    }
    
    try {
      await fetchWithDeduplication(
        `add-warning-${warningUserId}`,
        createApiRequest(`/admin/users/${warningUserId}/warnings`, {
          method: 'POST',
          data: { reason: warningReason }
        })
      );
      
      setShowWarningModal(false);
      setWarningReason('');
      setWarningUserId(null);
      refreshData();
    } catch (error) {
      console.error('Add warning error:', error);
      alert('Failed to add warning');
    }
  };

  // Handle ban user
  const handleBanUser = async () => {
    if (!banReason.trim()) {
      alert('Please enter a reason for the ban');
      return;
    }

    const banEnd = new Date();
    banEnd.setDate(banEnd.getDate() + parseInt(banDuration.days));
    banEnd.setHours(banEnd.getHours() + parseInt(banDuration.hours));

    try {
      await fetchWithDeduplication(
        `ban-user-${banUserId}`,
        createApiRequest(`/admin/users/${banUserId}/ban`, {
          method: 'POST',
          data: {
            banEnd: banEnd.toISOString(),
            reason: banReason
          }
        })
      );
      
      setShowBanModal(false);
      setBanReason('');
      setBanDuration({ days: 1, hours: 0 });
      refreshData();
    } catch (error) {
      console.error('Ban user error:', error);
      alert('Failed to ban user');
    }
  };

  // Handle unban user
  const handleUnbanUser = async (userId) => {
    try {
      await fetchWithDeduplication(
        `unban-user-${userId}`,
        createApiRequest(`/admin/users/${userId}/ban`, {
          method: 'DELETE'
        })
      );
      
      refreshData();
    } catch (error) {
      console.error('Unban user error:', error);
      alert('Failed to unban user');
    }
  };

  // Handle undo delete
  const handleUndoDelete = async (userId) => {
    try {
      await fetchWithDeduplication(
        `undo-delete-${userId}`,
        createApiRequest(`/admin/users/${userId}/undo-delete`, { method: 'POST' })
      );
      refreshData();
    } catch (error) {
      console.error('Undo delete error:', error);
      alert('Failed to undo deletion');
    }
  };

  // Handle cleanup warnings
  const handleCleanupWarnings = async () => {
    try {
      await fetchWithDeduplication(
        'cleanup-warnings',
        createApiRequest('/admin/cleanup-warnings', { method: 'POST' })
      );
      refreshData();
      alert('Warning cleanup completed');
    } catch (error) {
      console.error('Cleanup error:', error);
      alert('Failed to cleanup warnings');
    }
  };

  // Handle hard delete accounts
  const handleHardDeleteAccounts = async () => {
    try {
      await fetchWithDeduplication(
        'hard-delete-accounts',
        createApiRequest('/admin/hard-delete-accounts', { method: 'POST' })
      );
      refreshData();
      alert('Account hard deletion completed');
    } catch (error) {
      console.error('Hard delete error:', error);
      alert('Failed to hard delete accounts');
    }
  };

  // Prepare chart data
  const userRoleData = {
    labels: adminStats.userCounts.map(item => item.role),
    datasets: [
      {
        label: 'Users',
        data: adminStats.userCounts.map(item => item.count),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(234, 179, 8, 0.8)',
          'rgba(34, 197, 94, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  };

  const articleStatusData = {
    labels: ['Published', 'Drafts', 'Certified'],
    datasets: [
      {
        label: 'Articles',
        data: [
          adminStats.articleStats.published_articles || 0,
          adminStats.articleStats.draft_articles || 0,
          adminStats.articleStats.certified_articles || 0
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(168, 85, 247, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
    },
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'super-admin': return 'bg-gradient-to-r from-red-500 to-pink-500 text-white';
      case 'admin': return 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white';
      case 'editorial-board': return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
          <div className="text-2xl font-bold mt-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Loading Dashboard...
          </div>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'super-admin')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center max-w-2xl px-4">
          <Shield className="mx-auto mb-6 text-red-500" size={80} />
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            Access Denied
          </h1>
          <p className="text-xl text-gray-600 mb-8">You don't have permission to access the admin dashboard.</p>
          <Link to="/" className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-200">
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 bg-gradient-to-r from-red-500 to-pink-500 text-white p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle size={24} />
                <span className="font-semibold">{error}</span>
              </div>
              <button 
                onClick={() => setError(null)}
                className="bg-white text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-50 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Admin Dashboard
                </h1>
                <p className="text-lg text-gray-600">
                  Welcome back, <span className="font-semibold text-gray-900">{user.display_name}</span>
                  <span className={`ml-3 px-3 py-1 rounded-full text-xs font-bold ${getRoleBadgeColor(user.role)}`}>
                    {user.role.toUpperCase().replace('-', ' ')}
                  </span>
                </p>
              </div>
              <button 
                onClick={refreshData}
                disabled={isRefreshing}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-200 ${
                  isRefreshing 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl transform hover:scale-105'
                }`}
              >
                <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
            
            {/* Quick Action Buttons */}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link 
                to="/admin/write-article"
                className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <PenTool size={18} />
                <span>Post Admin Article</span>
              </Link>
              
              {user.role === 'super-admin' && (
                <>
                  <Link 
                    to="/admin/contacts"
                    className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    <Mail size={18} />
                    <span>Contact Messages</span>
                  </Link>
                  
                  <Link 
                    to="/admin/reported-articles"
                    className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    <FileText size={18} />
                    <span>Reported Articles</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-2 flex flex-wrap gap-2">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'articles', label: 'Articles', icon: FileText },
              ...(user.role === 'super-admin' ? [
                { id: 'warnings', label: 'Warnings', icon: AlertTriangle },
                { id: 'audit-log', label: 'Audit Log', icon: Shield }
              ] : [])
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <Users size={32} className="opacity-80" />
                  <div className="text-4xl font-bold">
                    {adminStats.userCounts.reduce((sum, item) => sum + parseInt(item.count), 0)}
                  </div>
                </div>
                <div className="text-lg font-semibold opacity-90">Total Users</div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <FileText size={32} className="opacity-80" />
                  <div className="text-4xl font-bold">
                    {adminStats.articleStats.total_articles || 0}
                  </div>
                </div>
                <div className="text-lg font-semibold opacity-90">Total Articles</div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <Eye size={32} className="opacity-80" />
                  <div className="text-4xl font-bold">
                    {adminStats.totalViews.toLocaleString()}
                  </div>
                </div>
                <div className="text-lg font-semibold opacity-90">Total Views</div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <Award size={32} className="opacity-80" />
                  <div className="text-4xl font-bold">
                    {adminStats.articleStats.certified_articles || 0}
                  </div>
                </div>
                <div className="text-lg font-semibold opacity-90">Certified</div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
                <h3 className="text-2xl font-bold mb-6 text-gray-800">User Distribution</h3>
                <div style={{ height: '300px' }}>
                  <Pie data={userRoleData} options={chartOptions} />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
                <h3 className="text-2xl font-bold mb-6 text-gray-800">Article Status</h3>
                <div style={{ height: '300px' }}>
                  <Pie data={articleStatusData} options={chartOptions} />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
              <h3 className="text-2xl font-bold mb-6 text-gray-800">Recent Activity</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase">Admin</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase">Action</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase">Target</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {adminStats.recentActivity.length > 0 ? (
                      adminStats.recentActivity.map((activity, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900">{activity.admin_name || 'System'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              activity.action === 'delete' ? 'bg-red-100 text-red-700' :
                              activity.action === 'update_role' ? 'bg-yellow-100 text-yellow-700' :
                              activity.action === 'certify' ? 'bg-green-100 text-green-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {activity.action}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {activity.target_type} #{activity.target_id}
                          </td>
                          <td className="px-6 py-4 text-gray-500 text-sm">
                            {formatDate(activity.created_at)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                          No recent activity
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">User Management</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase">User</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase">Tier</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.length > 0 ? (
                    users.map((userItem) => (
                      <tr key={userItem.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-gray-600">#{userItem.id}</td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{userItem.display_name}</div>
                          <div className="text-xs text-gray-500">{formatDate(userItem.created_at)}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{userItem.email || 'N/A'}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-400 to-orange-400 text-white">
                            {userItem.tier}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRoleBadgeColor(userItem.role)}`}>
                            {userItem.role.replace('-', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {userItem.ban_end ? (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                              Banned
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {user.role === 'super-admin' && (
                              <button
                                onClick={() => {
                                  setSelectedUser(userItem);
                                  setShowUserModal(true);
                                }}
                                className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                title="Edit Role"
                              >
                                <Edit size={16} />
                              </button>
                            )}
                            {userItem.ban_end ? (
                              <button
                                onClick={() => handleUnbanUser(userItem.id)}
                                className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                title="Unban User"
                              >
                                <UserCheck size={16} />
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setBanUserId(userItem.id);
                                  setShowBanModal(true);
                                }}
                                className="p-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors"
                                title="Ban User"
                              >
                                <UserX size={16} />
                              </button>
                            )}
                            {userItem.id !== user.id && (
                              <button
                                onClick={() => {
                                  setDeleteTarget(userItem.id);
                                  setDeleteType('user');
                                  setShowDeleteConfirm(true);
                                }}
                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                title="Delete User"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'articles' && (
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Article Management</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase">Title</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase">Author</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase">Views</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase">Certified</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {articles.length > 0 ? (
                    articles.map((article) => (
                      <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-gray-600">#{article.id}</td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900 max-w-xs truncate">
                            {article.title}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{article.display_name}</div>
                          <div className="text-xs text-gray-500">{article.tier}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            article.published 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {article.published ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-1 text-gray-600">
                            <Eye size={14} />
                            <span className="font-semibold">{article.views || 0}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            article.certified 
                              ? 'bg-purple-100 text-purple-700' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {article.certified ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {(user.role === 'editorial-board' || user.role === 'admin' || user.role === 'super-admin') && (
                              <button
                                onClick={() => handleCertifyArticle(article.id, !article.certified)}
                                className={`p-2 rounded-lg transition-colors ${
                                  article.certified 
                                    ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                                    : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                                }`}
                                title={article.certified ? 'Uncertify' : 'Certify'}
                              >
                                {article.certified ? <XCircle size={16} /> : <CheckCircle size={16} />}
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setDeleteTarget(article.id);
                                setDeleteType('article');
                                setShowDeleteConfirm(true);
                              }}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                              title="Delete Article"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                        No articles found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'warnings' && user.role === 'super-admin' && (
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-800">User Warnings</h2>
              <div className="flex space-x-3">
                <button
                  onClick={handleCleanupWarnings}
                  className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-5 py-2.5 rounded-xl font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  <Clock size={18} />
                  <span>Clean Old Warnings</span>
                </button>
                <button
                  onClick={handleHardDeleteAccounts}
                  className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-5 py-2.5 rounded-xl font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  <Trash2 size={18} />
                  <span>Hard Delete Accounts</span>
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase">User</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase">Warnings</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase">Last Warning</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {accountsToDelete.length > 0 ? (
                    accountsToDelete.map((userItem) => (
                      <tr key={userItem.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-gray-600">#{userItem.id}</td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{userItem.display_name}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{userItem.email || 'N/A'}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            userItem.account_status === 'soft_deleted' 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {userItem.account_status === 'soft_deleted' ? 'Deleted' : 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                            {userItem.warning_count} warnings
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm">
                          {userItem.last_warning_at ? formatDate(userItem.last_warning_at) : 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setWarningUserId(userItem.id);
                                setShowWarningModal(true);
                              }}
                              className="p-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition-colors"
                              title="Add Warning"
                            >
                              <AlertTriangle size={16} />
                            </button>
                            {userItem.account_status === 'soft_deleted' && (
                              <button
                                onClick={() => handleUndoDelete(userItem.id)}
                                className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                title="Undo Delete"
                              >
                                <UserCheck size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                        No accounts with warnings found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'audit-log' && user.role === 'super-admin' && (
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Audit Log</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase">Admin</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase">Action</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase">Target</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase">Details</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {auditLog.length > 0 ? (
                    auditLog.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-gray-600">#{log.id}</td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{log.admin_name || 'System'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            log.action === 'delete' ? 'bg-red-100 text-red-700' :
                            log.action === 'update_role' ? 'bg-yellow-100 text-yellow-700' :
                            log.action === 'certify' ? 'bg-green-100 text-green-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {log.target_type} #{log.target_id}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          <div className="max-w-xs truncate">{log.details || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-sm">
                          {formatDate(log.created_at)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        No audit log entries found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modals */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <h3 className="text-2xl font-bold mb-6 text-gray-800">Update User Role</h3>
              <div className="mb-6">
                <p className="font-bold mb-2 text-gray-800">User: {selectedUser.display_name}</p>
                <p className="text-gray-600 mb-4">Current Role: <span className="font-semibold">{selectedUser.role}</span></p>
                
                <div className="space-y-3">
                  {['user', 'editorial-board', 'admin', 'super-admin'].map((role) => (
                    <label key={role} className="flex items-center p-3 border-2 border-gray-200 rounded-xl hover:border-blue-400 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name="role"
                        value={role}
                        checked={selectedUser.role === role}
                        onChange={() => setSelectedUser({...selectedUser, role})}
                        className="mr-3 w-5 h-5"
                      />
                      <span className="font-semibold capitalize">{role.replace('-', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowUserModal(false)}
                  className="px-6 py-3 border-2 border-gray-300 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateUserRole(selectedUser.id, selectedUser.role)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Update Role
                </button>
              </div>
            </div>
          </div>
        )}

        {showWarningModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <h3 className="text-2xl font-bold mb-6 text-gray-800">Add User Warning</h3>
              
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Reason for Warning
                </label>
                <textarea
                  value={warningReason}
                  onChange={(e) => setWarningReason(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  rows="4"
                  placeholder="Enter reason for warning..."
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowWarningModal(false);
                    setWarningReason('');
                    setWarningUserId(null);
                  }}
                  className="px-6 py-3 border-2 border-gray-300 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddWarning}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Add Warning
                </button>
              </div>
            </div>
          </div>
        )}

        {showBanModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <h3 className="text-2xl font-bold mb-6 text-gray-800">Ban User</h3>
              
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Ban Duration
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600 block mb-1">Days</label>
                    <input
                      type="number"
                      min="0"
                      value={banDuration.days}
                      onChange={(e) => setBanDuration({...banDuration, days: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 block mb-1">Hours</label>
                    <input
                      type="number"
                      min="0"
                      value={banDuration.hours}
                      onChange={(e) => setBanDuration({...banDuration, hours: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Reason for Ban
                </label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows="4"
                  placeholder="Enter reason for ban..."
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowBanModal(false);
                    setBanReason('');
                    setBanDuration({ days: 1, hours: 0 });
                  }}
                  className="px-6 py-3 border-2 border-gray-300 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBanUser}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Ban User
                </button>
              </div>
            </div>
          </div>
        )}

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-red-100 p-4 rounded-full">
                  <AlertTriangle className="text-red-600" size={32} />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-center text-gray-800">Confirm Deletion</h3>
              <p className="mb-6 text-center text-gray-600">
                Are you sure you want to delete this {deleteType}? This action cannot be undone.
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteTarget(null);
                    setDeleteType(null);
                  }}
                  className="px-6 py-3 border-2 border-gray-300 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;