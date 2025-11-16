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
  PenTool,
  X,
  Menu,
  ChevronDown,
  Home,
  Settings,
  LogOut
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
  
  // Admin menu state
  const [showAdminMenu, setShowAdminMenu] = useState(false);

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

  // Chart data
  const userRoleData = {
    labels: adminStats.userCounts.map(item => item.role.replace(/-/g, ' ').toUpperCase()),
    datasets: [
      {
        label: 'Users',
        data: adminStats.userCounts.map(item => item.count),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',   // blue-500
          'rgba(99, 102, 241, 0.8)',  // indigo-500
          'rgba(245, 158, 11, 0.8)',  // amber-500
          'rgba(16, 185, 129, 0.8)',  // emerald-500
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
          'rgba(16, 185, 129, 0.8)',  // emerald-500
          'rgba(245, 158, 11, 0.8)',  // amber-500
          'rgba(99, 102, 241, 0.8)',  // indigo-500
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
          padding: 12,
          font: { size: 12, weight: '500' },
          color: '#374151'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 4,
      }
    },
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadge = (role) => {
    const base = "px-2 py-1 text-xs font-medium";
    switch (role) {
      case 'super-admin': return `${base} bg-red-100 text-red-800`;
      case 'admin': return `${base} bg-indigo-100 text-indigo-800`;
      case 'editorial-board': return `${base} bg-cyan-100 text-cyan-800`;
      default: return `${base} bg-gray-100 text-gray-800`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-gray-800 mx-auto"></div>
          <p className="mt-4 text-sm font-medium text-gray-700">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'super-admin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 max-w-md w-full text-center border border-gray-200">
          <Shield className="mx-auto mb-4 text-red-600" size={48} />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h1>
          <p className="text-gray-600 mb-6">You do not have permission to access the admin dashboard.</p>
          <Link to="/" className="inline-flex items-center px-4 py-2 bg-gray-800 text-white font-medium hover:bg-gray-900 transition">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Admin Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gray-900 text-white">
        <div className="flex items-center justify-between h-8 px-3">
          <div className="flex items-center space-x-4 text-xs">
            <span className="font-medium">Admin Panel</span>
            <span>|</span>
            <Link to="/" className="hover:text-gray-300 transition">Visit Site</Link>
          </div>
          <div className="flex items-center space-x-4 text-xs">
            <span>{user.display_name}</span>
            <span>|</span>
            <Link to="/profile" className="hover:text-gray-300 transition">Profile</Link>
            <span>|</span>
            <Link to="/logout" className="hover:text-gray-300 transition">Log Out</Link>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex pt-8">
        {/* Sidebar */}
        <div className="w-56 bg-gray-800 min-h-screen fixed left-0 top-8 bottom-0 overflow-y-auto">
          <div className="p-4">
            <div className="mb-6">
              <h2 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">Dashboard</h2>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`w-full text-left px-3 py-2 rounded text-sm transition ${
                      activeTab === 'overview' 
                        ? 'bg-gray-700 text-white' 
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    Overview
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('users')}
                    className={`w-full text-left px-3 py-2 rounded text-sm transition ${
                      activeTab === 'users' 
                        ? 'bg-gray-700 text-white' 
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    Users
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('articles')}
                    className={`w-full text-left px-3 py-2 rounded text-sm transition ${
                      activeTab === 'articles' 
                        ? 'bg-gray-700 text-white' 
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    Articles
                  </button>
                </li>
                {user.role === 'super-admin' && (
                  <>
                    <li>
                      <button
                        onClick={() => setActiveTab('warnings')}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition ${
                          activeTab === 'warnings' 
                            ? 'bg-gray-700 text-white' 
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                      >
                        Warnings
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveTab('audit-log')}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition ${
                          activeTab === 'audit-log' 
                            ? 'bg-gray-700 text-white' 
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                      >
                        Audit Log
                      </button>
                    </li>
                  </>
                )}
              </ul>
            </div>
            
            <div className="mb-6">
              <h2 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">Quick Actions</h2>
              <ul className="space-y-1">
                <li>
                  <Link
                    to="/admin/write-article"
                    className="block px-3 py-2 rounded text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition"
                  >
                    Write Article
                  </Link>
                </li>
                {user.role === 'super-admin' && (
                  <>
                    <li>
                      <Link
                        to="/admin/contacts"
                        className="block px-3 py-2 rounded text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition"
                      >
                        Contact Messages
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/admin/reported-articles"
                        className="block px-3 py-2 rounded text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition"
                      >
                        Reported Articles
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
            
            <div>
              <h2 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">System</h2>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={refreshData}
                    disabled={isRefreshing}
                    className={`w-full text-left px-3 py-2 rounded text-sm transition ${
                      isRefreshing 
                        ? 'text-gray-500 cursor-not-allowed' 
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-56">
          {/* Page Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {activeTab === 'overview' && 'Dashboard Overview'}
                  {activeTab === 'users' && 'User Management'}
                  {activeTab === 'articles' && 'Article Management'}
                  {activeTab === 'warnings' && 'User Warnings'}
                  {activeTab === 'audit-log' && 'System Audit Log'}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {activeTab === 'overview' && 'System statistics and recent activity'}
                  {activeTab === 'users' && 'Manage user accounts and permissions'}
                  {activeTab === 'articles' && 'Manage article content and certification'}
                  {activeTab === 'warnings' && 'View and manage user warnings'}
                  {activeTab === 'audit-log' && 'Track system changes and administrative actions'}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={getRoleBadge(user.role)}>{user.role.replace(/-/g, ' ').toUpperCase()}</span>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-800 p-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle size={16} />
                <span className="text-sm font-medium">{error}</span>
              </div>
              <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
                <X size={16} />
              </button>
            </div>
          )}

          {/* Content Area */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Users', value: adminStats.userCounts.reduce((s, i) => s + parseInt(i.count), 0), icon: Users, color: 'bg-blue-500' },
                    { label: 'Total Articles', value: adminStats.articleStats.total_articles || 0, icon: FileText, color: 'bg-green-500' },
                    { label: 'Total Views', value: adminStats.totalViews.toLocaleString(), icon: Eye, color: 'bg-purple-500' },
                    { label: 'Certified', value: adminStats.articleStats.certified_articles || 0, icon: Award, color: 'bg-amber-500' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-4 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
                          <p className="mt-1 text-2xl font-semibold text-gray-900">{stat.value}</p>
                        </div>
                        <div className={`${stat.color} p-2 rounded`}>
                          <stat.icon className="text-white" size={20} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-4 border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">User Role Distribution</h3>
                    <div className="h-64"><Pie data={userRoleData} options={chartOptions} /></div>
                  </div>
                  <div className="bg-white p-4 border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Article Status Overview</h3>
                    <div className="h-64"><Pie data={articleStatusData} options={chartOptions} /></div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {adminStats.recentActivity.length > 0 ? (
                          adminStats.recentActivity.map((activity, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                {activity.admin_name || 'System'}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium ${
                                  activity.action === 'delete' ? 'bg-red-100 text-red-800' :
                                  activity.action === 'update_role' ? 'bg-yellow-100 text-yellow-800' :
                                  activity.action === 'certify' ? 'bg-green-100 text-green-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {activity.action.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                                {activity.target_type} #{activity.target_id}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(activity.created_at)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan="4" className="px-4 py-4 text-center text-sm text-gray-500">No recent activity</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="bg-white border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.length > 0 ? users.map(u => (
                        <tr key={u.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">#{u.id}</td>
                          <td className="px-4 py-2">
                            <div className="text-sm font-medium text-gray-900">{u.display_name}</div>
                            <div className="text-xs text-gray-500">Joined {formatDate(u.created_at)}</div>
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">{u.email || '—'}</td>
                          <td className="px-4 py-2">
                            <span className="inline-flex px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800">
                              {u.tier}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            <span className={getRoleBadge(u.role)}>{u.role.replace('-', ' ').toUpperCase()}</span>
                          </td>
                          <td className="px-4 py-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium ${
                              u.ban_end ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {u.ban_end ? 'Banned' : 'Active'}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-sm">
                            <div className="flex space-x-1">
                              {user.role === 'super-admin' && (
                                <button onClick={() => { setSelectedUser(u); setShowUserModal(true); }} className="p-1 text-gray-600 hover:text-gray-900">
                                  <Edit size={14} />
                                </button>
                              )}
                              {u.ban_end ? (
                                <button onClick={() => handleUnbanUser(u.id)} className="p-1 text-green-600 hover:text-green-900">
                                  <UserCheck size={14} />
                                </button>
                              ) : (
                                <button onClick={() => { setBanUserId(u.id); setShowBanModal(true); }} className="p-1 text-orange-600 hover:text-orange-900">
                                  <UserX size={14} />
                                </button>
                              )}
                              {u.id !== user.id && (
                                <button onClick={() => { setDeleteTarget(u.id); setDeleteType('user'); setShowDeleteConfirm(true); }} className="p-1 text-red-600 hover:text-red-900">
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan="7" className="px-4 py-4 text-center text-sm text-gray-500">No users found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Articles Tab */}
            {activeTab === 'articles' && (
              <div className="bg-white border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Certified</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {articles.length > 0 ? articles.map(a => (
                        <tr key={a.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">#{a.id}</td>
                          <td className="px-4 py-2 text-sm font-medium text-gray-900 max-w-xs truncate">{a.title}</td>
                          <td className="px-4 py-2">
                            <div className="text-sm font-medium text-gray-900">{a.display_name}</div>
                            <div className="text-xs text-gray-500">{a.tier}</div>
                          </td>
                          <td className="px-4 py-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium ${
                              a.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {a.published ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">{a.views || 0}</td>
                          <td className="px-4 py-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium ${
                              a.certified ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {a.certified ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-sm">
                            <div className="flex space-x-1">
                              {(user.role === 'editorial-board' || user.role === 'admin' || user.role === 'super-admin') && (
                                <button onClick={() => handleCertifyArticle(a.id, !a.certified)} className={`p-1 ${a.certified ? 'text-yellow-600 hover:text-yellow-900' : 'text-purple-600 hover:text-purple-900'}`}>
                                  {a.certified ? <XCircle size={14} /> : <CheckCircle size={14} />}
                                </button>
                              )}
                              <button onClick={() => { setDeleteTarget(a.id); setDeleteType('article'); setShowDeleteConfirm(true); }} className="p-1 text-red-600 hover:text-red-900">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan="7" className="px-4 py-4 text-center text-sm text-gray-500">No articles found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Warnings Tab */}
            {activeTab === 'warnings' && user.role === 'super-admin' && (
              <div className="bg-white border border-gray-200">
                <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-gray-900">User Warnings</h3>
                  <div className="flex space-x-2">
                    <button onClick={handleCleanupWarnings} className="flex items-center space-x-1 px-3 py-1.5 bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition">
                      <Clock size={14} />
                      <span>Clean Old Warnings</span>
                    </button>
                    <button onClick={handleHardDeleteAccounts} className="flex items-center space-x-1 px-3 py-1.5 bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition">
                      <Trash2 size={14} />
                      <span>Hard Delete</span>
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warnings</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Warning</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {accountsToDelete.length > 0 ? accountsToDelete.map(u => (
                        <tr key={u.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">#{u.id}</td>
                          <td className="px-4 py-2 text-sm font-medium text-gray-900">{u.display_name}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">{u.email || '—'}</td>
                          <td className="px-4 py-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium ${
                              u.account_status === 'soft_deleted' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {u.account_status === 'soft_deleted' ? 'Deleted' : 'Active'}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            <span className="inline-flex px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800">
                              {u.warning_count} warnings
                            </span>
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">{u.last_warning_at ? formatDate(u.last_warning_at) : '—'}</td>
                          <td className="px-4 py-2 text-sm">
                            <div className="flex space-x-1">
                              <button onClick={() => { setWarningUserId(u.id); setShowWarningModal(true); }} className="p-1 text-yellow-600 hover:text-yellow-900">
                                <AlertTriangle size={14} />
                              </button>
                              {u.account_status === 'soft_deleted' && (
                                <button onClick={() => handleUndoDelete(u.id)} className="p-1 text-green-600 hover:text-green-900">
                                  <UserCheck size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan="7" className="px-4 py-4 text-center text-sm text-gray-500">No accounts with warnings</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Audit Log Tab */}
            {activeTab === 'audit-log' && user.role === 'super-admin' && (
              <div className="bg-white border border-gray-200">
                <div className="px-4 py-3 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900">System Audit Log</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {auditLog.length > 0 ? auditLog.map(log => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">#{log.id}</td>
                          <td className="px-4 py-2 text-sm font-medium text-gray-900">{log.admin_name || 'System'}</td>
                          <td className="px-4 py-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium ${
                              log.action === 'delete' ? 'bg-red-100 text-red-800' :
                              log.action === 'update_role' ? 'bg-yellow-100 text-yellow-800' :
                              log.action === 'certify' ? 'bg-green-100 text-green-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">{log.target_type} #{log.target_id}</td>
                          <td className="px-4 py-2 text-sm text-gray-600 max-w-xs truncate">{log.details || '—'}</td>
                          <td className="px-4 py-2 text-sm text-gray-500">{formatDate(log.created_at)}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan="6" className="px-4 py-4 text-center text-sm text-gray-500">No audit log entries</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 max-w-md w-full">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">Update User Role</h3>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">User: <span className="font-medium text-gray-900">{selectedUser.display_name}</span></p>
                  <p className="text-sm text-gray-600 mt-1">Current Role: <span className={getRoleBadge(selectedUser.role)}>{selectedUser.role.replace('-', ' ').toUpperCase()}</span></p>
                </div>
                <div className="space-y-2">
                  {['user', 'editorial-board', 'admin', 'super-admin'].map(role => (
                    <label key={role} className="flex items-center p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-50 transition">
                      <input
                        type="radio"
                        name="role"
                        value={role}
                        checked={selectedUser.role === role}
                        onChange={() => setSelectedUser({...selectedUser, role})}
                        className="mr-3"
                      />
                      <span className="capitalize text-sm font-medium">{role.replace('-', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 flex justify-end space-x-2">
              <button onClick={() => setShowUserModal(false)} className="px-3 py-1.5 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleUpdateUserRole(selectedUser.id, selectedUser.role)} className="px-3 py-1.5 bg-gray-800 text-white rounded text-sm font-medium hover:bg-gray-900">Update Role</button>
            </div>
          </div>
        </div>
      )}

      {showWarningModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 max-w-md w-full">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">Add User Warning</h3>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Warning</label>
                <textarea
                  value={warningReason}
                  onChange={(e) => setWarningReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                  rows="4"
                  placeholder="Enter reason..."
                />
              </div>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 flex justify-end space-x-2">
              <button onClick={() => { setShowWarningModal(false); setWarningReason(''); setWarningUserId(null); }} className="px-3 py-1.5 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={handleAddWarning} className="px-3 py-1.5 bg-amber-600 text-white rounded text-sm font-medium hover:bg-amber-700">Add Warning</button>
            </div>
          </div>
        </div>
      )}

      {showBanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 max-w-md w-full">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">Ban User</h3>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ban Duration</label>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="number" min="0" value={banDuration.days} onChange={e => setBanDuration({...banDuration, days: parseInt(e.target.value) || 0})} className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500" placeholder="Days" />
                    <input type="number" min="0" value={banDuration.hours} onChange={e => setBanDuration({...banDuration, hours: parseInt(e.target.value) || 0})} className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500" placeholder="Hours" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                  <textarea
                    value={banReason}
                    onChange={e => setBanReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                    rows="3"
                    placeholder="Enter reason..."
                  />
                </div>
              </div>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 flex justify-end space-x-2">
              <button onClick={() => { setShowBanModal(false); setBanReason(''); setBanDuration({ days: 1, hours: 0 }); }} className="px-3 py-1.5 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={handleBanUser} className="px-3 py-1.5 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700">Ban User</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 max-w-md w-full">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">Confirm Deletion</h3>
            </div>
            <div className="p-4 text-center">
              <AlertTriangle className="mx-auto text-red-600" size={32} />
              <p className="mt-2 text-sm text-gray-600">This action cannot be undone.</p>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 flex justify-end space-x-2">
              <button onClick={() => { setShowDeleteConfirm(false); setDeleteTarget(null); setDeleteType(null); }} className="px-3 py-1.5 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={handleDeleteConfirm} className="px-3 py-1.5 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;