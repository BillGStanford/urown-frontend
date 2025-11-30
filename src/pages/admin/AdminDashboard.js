// pages/AdminDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { fetchWithDeduplication, createApiRequest } from '../../utils/apiUtils';
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
  Book
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
    ebookStats: {},
    totalViews: 0,
    recentActivity: []
  });
  const [users, setUsers] = useState([]);
  const [articles, setArticles] = useState([]);
  const [ebooks, setEbooks] = useState([]);
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

  // Fetch ebooks
  const fetchEbooks = useCallback(async () => {
    try {
      const response = await fetchWithDeduplication(
        'admin-ebooks',
        createApiRequest('/admin/ebooks', { method: 'GET' })
      );
      setEbooks(response.data.ebooks);
      setError(null);
    } catch (error) {
      console.error('Error fetching ebooks:', error);
      if (error.response?.status !== 429) {
        setError('Failed to load ebooks. Please try again later.');
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
        new Promise(resolve => setTimeout(resolve, 900)).then(() => fetchEbooks()),
        new Promise(resolve => setTimeout(resolve, 1200)).then(() => fetchAuditLog())
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchAdminStats, fetchUsers, fetchArticles, fetchEbooks, fetchAuditLog]);

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


// Handle ebook publish/unpublish
// Handle ebook publish/unpublish
const handlePublishEbook = async (ebookId, published) => {
  try {
    await fetchWithDeduplication(
      `publish-ebook-${ebookId}`,
      createApiRequest(`/admin/ebooks/${ebookId}/publish`, {
        method: 'PUT',
        data: { published }
      })
    );
    await refreshData();
  } catch (error) {
    console.error('Error updating ebook publish status:', error);
    
    // Provide specific error messages based on the error response
    if (error.response?.status === 400) {
      if (error.response.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Failed to update ebook publish status. Please check the ebook requirements.');
      }
    } else {
      setError('Failed to update ebook publish status. Please try again later.');
    }
  }
};

  // Handle add warning
  const handleAddWarning = async () => {
    if (!warningReason.trim()) {
      alert('Please enter a reason for warning');
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
      alert('Please enter a reason for ban');
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
          'rgba(37, 99, 235, 0.8)',   // blue-600
          'rgba(139, 92, 246, 0.8)',  // violet-600
          'rgba(251, 146, 60, 0.8)',  // orange-400
          'rgba(34, 197, 94, 0.8)',   // green-600
        ],
        borderWidth: 1,
        borderColor: '#fff',
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
          'rgba(34, 197, 94, 0.8)',   // green
          'rgba(251, 146, 60, 0.8)',  // orange
          'rgba(139, 92, 246, 0.8)',  // violet
        ],
        borderWidth: 1,
        borderColor: '#fff',
      },
    ],
  };

  const ebookStatusData = {
    labels: ['Published', 'Drafts'],
    datasets: [
      {
        label: 'Ebooks',
        data: [
          adminStats.ebookStats.published_ebooks || 0,
          adminStats.ebookStats.draft_ebooks || 0
        ],
        backgroundColor: [
          'rgba(147, 51, 234, 0.8)',   // purple-600
          'rgba(251, 191, 36, 0.8)',  // amber-400
        ],
        borderWidth: 1,
        borderColor: '#fff',
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
          padding: 16,
          font: { size: 13, weight: '500' },
          color: '#374151'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        padding: 12,
        cornerRadius: 8,
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
    const base = "px-3 py-1 rounded-full text-xs font-medium tracking-wide border";
    switch (role) {
      case 'super-admin': return `${base} bg-red-50 text-red-700 border-red-200`;
      case 'admin': return `${base} bg-indigo-50 text-indigo-700 border-indigo-200`;
      case 'editorial-board': return `${base} bg-cyan-50 text-cyan-700 border-cyan-200`;
      default: return `${base} bg-gray-50 text-gray-700 border-gray-300`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-indigo-600 mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'super-admin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <Shield className="mx-auto mb-4 text-red-600" size={64} />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h1>
          <p className="text-gray-600 mb-6">You do not have permission to access admin dashboard.</p>
          <Link to="/" className="inline-flex items-center px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="text-indigo-600" size={28} />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Control Panel</h1>
                <p className="text-sm text-gray-500">Secure system management interface</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, <span className="font-medium text-gray-900">{user.display_name}</span>
              </span>
              <span className={getRoleBadge(user.role)}>{user.role.replace(/-/g, ' ').toUpperCase()}</span>
              <button
                onClick={refreshData}
                disabled={isRefreshing}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition ${
                  isRefreshing 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle size={20} />
              <span className="font-medium">{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
              <X size={20} />
            </button>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8 flex flex-wrap gap-3">
          <Link
            to="/admin/write-article"
            className="flex items-center space-x-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            <PenTool size={18} />
            <span>Write Article</span>
          </Link>
          {user.role === 'super-admin' && (
            <>
              <Link
                to="/admin/contacts"
                className="flex items-center space-x-2 bg-gray-700 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition"
              >
                <Mail size={18} />
                <span>Contact Messages</span>
              </Link>
              <Link
                to="/admin/reported-articles"
                className="flex items-center space-x-2 bg-orange-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-orange-700 transition"
              >
                <FileText size={18} />
                <span>Reported Articles</span>
              </Link>
            </>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'articles', label: 'Articles', icon: FileText },
              { id: 'ebooks', label: 'Ebooks', icon: Book },
              ...(user.role === 'super-admin' ? [
                { id: 'warnings', label: 'Warnings', icon: AlertTriangle },
                { id: 'audit-log', label: 'Audit Log', icon: Shield }
              ] : [])
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-3 border-b-2 font-medium transition ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Users', value: adminStats.userCounts.reduce((s, i) => s + parseInt(i.count), 0), icon: Users, color: 'bg-blue-600' },
                { label: 'Total Articles', value: adminStats.articleStats.total_articles || 0, icon: FileText, color: 'bg-green-600' },
                { label: 'Total Ebooks', value: adminStats.ebookStats.total_ebooks || 0, icon: Book, color: 'bg-purple-600' },
                { label: 'Total Views', value: adminStats.totalViews.toLocaleString(), icon: Eye, color: 'bg-indigo-600' },
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <stat.icon className="text-white" size={24} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">User Role Distribution</h3>
                <div className="h-64"><Pie data={userRoleData} options={chartOptions} /></div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Article Status Overview</h3>
                <div className="h-64"><Pie data={articleStatusData} options={chartOptions} /></div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ebook Status Overview</h3>
                <div className="h-64"><Pie data={ebookStatusData} options={chartOptions} /></div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {adminStats.recentActivity.length > 0 ? (
                      adminStats.recentActivity.map((activity, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {activity.admin_name || 'System'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              activity.action === 'delete' ? 'bg-red-100 text-red-700' :
                              activity.action === 'update_role' ? 'bg-yellow-100 text-yellow-700' :
                              activity.action === 'certify' ? 'bg-green-100 text-green-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {activity.action.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {activity.target_type} #{activity.target_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(activity.created_at)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No recent activity</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.length > 0 ? users.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">#{u.id}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{u.display_name}</div>
                        <div className="text-xs text-gray-500">Joined {formatDate(u.created_at)}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{u.email || '—'}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          {u.tier}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={getRoleBadge(u.role)}>{u.role.replace('-', ' ').toUpperCase()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          u.ban_end ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
                        }`}>
                          {u.ban_end ? 'Banned' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex space-x-1">
                          {user.role === 'super-admin' && (
                            <button onClick={() => { setSelectedUser(u); setShowUserModal(true); }} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded">
                              <Edit size={16} />
                            </button>
                          )}
                          {u.ban_end ? (
                            <button onClick={() => handleUnbanUser(u.id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded">
                              <UserCheck size={16} />
                            </button>
                          ) : (
                            <button onClick={() => { setBanUserId(u.id); setShowBanModal(true); }} className="p-1.5 text-orange-600 hover:bg-orange-50 rounded">
                              <UserX size={16} />
                            </button>
                          )}
                          {u.id !== user.id && (
                            <button onClick={() => { setDeleteTarget(u.id); setDeleteType('user'); setShowDeleteConfirm(true); }} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-500">No users found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Articles Tab */}
        {activeTab === 'articles' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Article Management</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Certified</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {articles.length > 0 ? articles.map(a => (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">#{a.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs truncate">{a.title}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{a.display_name}</div>
                        <div className="text-xs text-gray-500">{a.tier}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          a.published ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                        }`}>
                          {a.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{a.views || 0}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          a.certified ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-gray-50 text-gray-600 border border-gray-300'
                        }`}>
                          {a.certified ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex space-x-1">
                          {(user.role === 'editorial-board' || user.role === 'admin' || user.role === 'super-admin') && (
                            <button onClick={() => handleCertifyArticle(a.id, !a.certified)} className={`p-1.5 rounded ${a.certified ? 'text-yellow-600 hover:bg-yellow-50' : 'text-purple-600 hover:bg-purple-50'}`}>
                              {a.certified ? <XCircle size={16} /> : <CheckCircle size={16} />}
                            </button>
                          )}
                          <button onClick={() => { setDeleteTarget(a.id); setDeleteType('article'); setShowDeleteConfirm(true); }} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-500">No articles found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Ebooks Tab */}
        {activeTab === 'ebooks' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Ebook Management</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chapters</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ebooks.length > 0 ? ebooks.map(e => (
                    <tr key={e.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">#{e.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {e.cover_image && (
                            <img 
                              src={e.cover_image} 
                              alt={e.title} 
                              className="h-10 w-8 object-cover rounded mr-3"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900 max-w-xs truncate">{e.title}</div>
                            {e.subtitle && (
                              <div className="text-xs text-gray-500 max-w-xs truncate">{e.subtitle}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{e.author_name || e.creator_name}</div>
                        <div className="text-xs text-gray-500">Created {formatDate(e.created_at)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          e.published ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                        }`}>
                          {e.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{e.chapter_count || 0}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{e.views || 0}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {e.tags && e.tags.length > 0 ? (
                            e.tags.slice(0, 2).map((tag, i) => (
                              <span key={i} className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-500">No tags</span>
                          )}
                          {e.tags && e.tags.length > 2 && (
                            <span className="text-xs text-gray-500">+{e.tags.length - 2} more</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex space-x-1">
                          <button 
                            onClick={() => handlePublishEbook(e.id, !e.published)} 
                            className={`p-1.5 rounded ${e.published ? 'text-yellow-600 hover:bg-yellow-50' : 'text-green-600 hover:bg-green-50'}`}
                            title={e.published ? 'Unpublish' : 'Publish'}
                          >
                            {e.published ? <XCircle size={16} /> : <CheckCircle size={16} />}
                          </button>
                          <button 
                            onClick={() => { setDeleteTarget(e.id); setDeleteType('ebook'); setShowDeleteConfirm(true); }} 
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="8" className="px-6 py-8 text-center text-gray-500">No ebooks found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Warnings Tab */}
        {activeTab === 'warnings' && user.role === 'super-admin' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">User Warnings</h2>
              <div className="flex space-x-3">
                <button onClick={handleCleanupWarnings} className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition">
                  <Clock size={16} />
                  <span>Clean Old Warnings</span>
                </button>
                <button onClick={handleHardDeleteAccounts} className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition">
                  <Trash2 size={16} />
                  <span>Hard Delete</span>
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warnings</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Warning</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {accountsToDelete.length > 0 ? accountsToDelete.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">#{u.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.display_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{u.email || '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          u.account_status === 'soft_deleted' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                        }`}>
                          {u.account_status === 'soft_deleted' ? 'Deleted' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                          {u.warning_count} warnings
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{u.last_warning_at ? formatDate(u.last_warning_at) : '—'}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex space-x-1">
                          <button onClick={() => { setWarningUserId(u.id); setShowWarningModal(true); }} className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded">
                            <AlertTriangle size={16} />
                          </button>
                          {u.account_status === 'soft_deleted' && (
                            <button onClick={() => handleUndoDelete(u.id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded">
                              <UserCheck size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-500">No accounts with warnings</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Audit Log Tab */}
        {activeTab === 'audit-log' && user.role === 'super-admin' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">System Audit Log</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {auditLog.length > 0 ? auditLog.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">#{log.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{log.admin_name || 'System'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          log.action === 'delete' ? 'bg-red-100 text-red-700' :
                          log.action === 'update_role' ? 'bg-yellow-100 text-yellow-700' :
                          log.action === 'certify' ? 'bg-green-100 text-green-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{log.target_type} #{log.target_id}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{log.details || '—'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(log.created_at)}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">No audit log entries</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modals */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Update User Role</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">User: <span className="font-medium text-gray-900">{selectedUser.display_name}</span></p>
                  <p className="text-sm text-gray-600 mt-1">Current Role: <span className={getRoleBadge(selectedUser.role)}>{selectedUser.role.replace('-', ' ').toUpperCase()}</span></p>
                </div>
                <div className="space-y-2">
                  {['user', 'editorial-board', 'admin', 'super-admin'].map(role => (
                    <label key={role} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
                      <input
                        type="radio"
                        name="role"
                        value={role}
                        checked={selectedUser.role === role}
                        onChange={() => setSelectedUser({...selectedUser, role})}
                        className="mr-3"
                      />
                      <span className="capitalize font-medium">{role.replace('-', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button onClick={() => setShowUserModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50">Cancel</button>
                <button onClick={() => handleUpdateUserRole(selectedUser.id, selectedUser.role)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">Update Role</button>
              </div>
            </div>
          </div>
        )}

        {showWarningModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add User Warning</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Warning</label>
                <textarea
                  value={warningReason}
                  onChange={(e) => setWarningReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  rows="4"
                  placeholder="Enter reason..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button onClick={() => { setShowWarningModal(false); setWarningReason(''); setWarningUserId(null); }} className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50">Cancel</button>
                <button onClick={handleAddWarning} className="px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700">Add Warning</button>
              </div>
            </div>
          </div>
        )}

        {showBanModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ban User</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ban Duration</label>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="number" min="0" value={banDuration.days} onChange={e => setBanDuration({...banDuration, days: parseInt(e.target.value) || 0})} className="px-3 py-2 border border-gray-300 rounded-lg" placeholder="Days" />
                    <input type="number" min="0" value={banDuration.hours} onChange={e => setBanDuration({...banDuration, hours: parseInt(e.target.value) || 0})} className="px-3 py-2 border border-gray-300 rounded-lg" placeholder="Hours" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                  <textarea
                    value={banReason}
                    onChange={e => setBanReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows="3"
                    placeholder="Enter reason..."
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button onClick={() => { setShowBanModal(false); setBanReason(''); setBanDuration({ days: 1, hours: 0 }); }} className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50">Cancel</button>
                <button onClick={handleBanUser} className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700">Ban User</button>
              </div>
            </div>
          </div>
        )}

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="text-center mb-4">
                <AlertTriangle className="mx-auto text-red-600" size={48} />
                <h3 className="text-lg font-semibold text-gray-900 mt-4">Confirm Deletion</h3>
                <p className="text-gray-600 mt-2">This action cannot be undone.</p>
              </div>
              <div className="flex justify-end space-x-3">
                <button onClick={() => { setShowDeleteConfirm(false); setDeleteTarget(null); setDeleteType(null); }} className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50">Cancel</button>
                <button onClick={handleDeleteConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;