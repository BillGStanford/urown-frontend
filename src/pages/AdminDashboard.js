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
import { Mail, FileText, AlertTriangle, UserX, UserCheck } from 'lucide-react';

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
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showArticleModal, setShowArticleModal] = useState(false);
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
  const [banDuration, setBanDuration] = useState({ days: 1, hours: 0 }); // default 1 day
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
      
      // Refresh data
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
    
    // Refresh data
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
      
      // Refresh data
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

    // Calculate ban end time from current time + duration
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
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
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
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
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
      case 'super-admin': return 'bg-red-100 text-red-800';
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'editorial-board': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <div className="text-2xl font-bold mt-4">LOADING ADMIN DASHBOARD...</div>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'super-admin')) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-2xl px-4">
          <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
          <p className="text-xl mb-8">You don't have permission to access the admin dashboard.</p>
          <Link to="/" className="bg-black text-white px-6 py-3 font-bold hover:bg-gray-800 transition-colors">
            GO TO HOMEPAGE
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-2 border-red-500 text-red-700 p-4 mb-8 text-center">
          <div className="text-xl font-bold">{error}</div>
          <button 
            onClick={() => setError(null)}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded font-bold hover:bg-red-600"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* Welcome Section */}
      <div className="text-center mb-16">
        <h1 className="text-7xl font-bold mb-6">
          ADMIN DASHBOARD
        </h1>
        <p className="text-2xl font-bold text-gray-600">
          Welcome back, {user.display_name}! ({user.role})
        </p>
        <div className="flex justify-center space-x-4 mt-4">
          <button 
            onClick={refreshData}
            disabled={isRefreshing}
            className={`px-6 py-3 font-bold ${
              isRefreshing 
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            {isRefreshing ? 'REFRESHING...' : 'REFRESH DATA'}
          </button>
          
          {user.role === 'super-admin' && (
            <Link 
              to="/admin/contacts"
              className="px-6 py-3 bg-blue-600 text-white font-bold hover:bg-blue-700 flex items-center"
            >
              <Mail className="mr-2" size={18} />
              MANAGE CONTACT MESSAGES
            </Link>
          )}
          
          {user.role === 'super-admin' && (
            <Link 
              to="/admin/reported-articles"
              className="px-6 py-3 bg-red-600 text-white font-bold hover:bg-red-700 flex items-center"
            >
              <FileText className="mr-2" size={18} />
              MANAGE REPORTED ARTICLES
            </Link>
          )}
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="mb-8">
        <div className="flex border-b border-gray-200">
          <button
            className={`py-4 px-6 font-bold text-lg ${activeTab === 'overview' ? 'border-b-4 border-black' : 'text-gray-500'}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`py-4 px-6 font-bold text-lg ${activeTab === 'users' ? 'border-b-4 border-black' : 'text-gray-500'}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button
            className={`py-4 px-6 font-bold text-lg ${activeTab === 'articles' ? 'border-b-4 border-black' : 'text-gray-500'}`}
            onClick={() => setActiveTab('articles')}
          >
            Articles
          </button>
          {user.role === 'super-admin' && (
            <button
              className={`py-4 px-6 font-bold text-lg ${activeTab === 'warnings' ? 'border-b-4 border-black' : 'text-gray-500'}`}
              onClick={() => setActiveTab('warnings')}
            >
              <div className="flex items-center">
                <AlertTriangle className="mr-2" size={18} />
                Warnings
              </div>
            </button>
          )}
          {user.role === 'super-admin' && (
            <button
              className={`py-4 px-6 font-bold text-lg ${activeTab === 'audit-log' ? 'border-b-4 border-black' : 'text-gray-500'}`}
              onClick={() => setActiveTab('audit-log')}
            >
              Audit Log
            </button>
          )}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="mb-16">
          <h2 className="text-4xl font-bold mb-8 text-center">SYSTEM OVERVIEW</h2>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white p-6 border-2 border-black text-center">
              <div className="text-3xl font-bold mb-2">
                {adminStats.userCounts.reduce((sum, item) => sum + parseInt(item.count), 0)}
              </div>
              <div className="text-lg font-bold">Total Users</div>
            </div>
            <div className="bg-white p-6 border-2 border-black text-center">
              <div className="text-3xl font-bold mb-2">
                {adminStats.articleStats.total_articles || 0}
              </div>
              <div className="text-lg font-bold">Total Articles</div>
            </div>
            <div className="bg-white p-6 border-2 border-black text-center">
              <div className="text-3xl font-bold mb-2">
                {adminStats.totalViews}
              </div>
              <div className="text-lg font-bold">Total Views</div>
            </div>
            <div className="bg-white p-6 border-2 border-black text-center">
              <div className="text-3xl font-bold mb-2">
                {adminStats.articleStats.certified_articles || 0}
              </div>
              <div className="text-lg font-bold">Certified Articles</div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            <div className="bg-white p-8 border-2 border-black">
              <h3 className="text-2xl font-bold mb-6 text-center">User Distribution by Role</h3>
              <div className="h-80">
                <Pie data={userRoleData} options={chartOptions} />
              </div>
            </div>

            <div className="bg-white p-8 border-2 border-black">
              <h3 className="text-2xl font-bold mb-6 text-center">Article Status</h3>
              <div className="h-80">
                <Pie data={articleStatusData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-8 border-2 border-black">
            <h3 className="text-2xl font-bold mb-6">Recent Admin Activity</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Admin
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Target
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {adminStats.recentActivity.length > 0 ? (
                    adminStats.recentActivity.map((activity, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">{activity.admin_name || 'System'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            activity.action === 'delete' ? 'bg-red-100 text-red-800' :
                            activity.action === 'update_role' ? 'bg-yellow-100 text-yellow-800' :
                            activity.action === 'certify' ? 'bg-green-100 text-green-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {activity.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {activity.target_type} #{activity.target_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(activity.created_at)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
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
        <div className="mb-16">
          <h2 className="text-4xl font-bold mb-8 text-center">USER MANAGEMENT</h2>
          
          <div className="bg-white p-8 border-2 border-black mb-8">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Display Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Tier
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.length > 0 ? (
                    users.map((userItem) => (
                      <tr key={userItem.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {userItem.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">{userItem.display_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {userItem.email || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {userItem.tier}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(userItem.role)}`}>
                            {userItem.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {userItem.ban_end ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              Banned
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(userItem.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {user.role === 'super-admin' && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedUser(userItem);
                                  setShowUserModal(true);
                                }}
                                className="text-indigo-600 hover:text-indigo-900 mr-3"
                              >
                                Edit Role
                              </button>
                            </>
                          )}
                          {userItem.ban_end ? (
                            <button
                              onClick={() => handleUnbanUser(userItem.id)}
                              className="text-green-600 hover:text-green-900 mr-3"
                            >
                              <UserCheck className="inline mr-1" size={16} />
                              Unban
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setBanUserId(userItem.id);
                                setShowBanModal(true);
                              }}
                              className="text-red-600 hover:text-red-900 mr-3"
                            >
                              <UserX className="inline mr-1" size={16} />
                              Ban
                            </button>
                          )}
                          {userItem.id !== user.id && (
                            <button
                              onClick={() => {
                                setDeleteTarget(userItem.id);
                                setDeleteType('user');
                                setShowDeleteConfirm(true);
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'articles' && (
        <div className="mb-16">
          <h2 className="text-4xl font-bold mb-8 text-center">ARTICLE MANAGEMENT</h2>
          
          <div className="bg-white p-8 border-2 border-black mb-8">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Author
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Views
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Certified
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {articles.length > 0 ? (
                    articles.map((article) => (
                      <tr key={article.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {article.id}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-gray-900 max-w-xs truncate">
                            {article.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{article.display_name}</div>
                          <div className="text-xs text-gray-500">{article.tier}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            article.published 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {article.published ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {article.views || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            article.certified 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {article.certified ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {(user.role === 'editorial-board' || user.role === 'admin' || user.role === 'super-admin') && (
                            <button
                              onClick={() => handleCertifyArticle(article.id, !article.certified)}
                              className={`mr-3 ${article.certified ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}`}
                            >
                              {article.certified ? 'Uncertify' : 'Certify'}
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setDeleteTarget(article.id);
                              setDeleteType('article');
                              setShowDeleteConfirm(true);
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                        No articles found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'warnings' && user.role === 'super-admin' && (
        <div className="mb-16">
          <h2 className="text-4xl font-bold mb-8 text-center">USER WARNINGS</h2>
          
          <div className="bg-white p-8 border-2 border-black mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Accounts To Delete</h3>
              <div className="space-x-4">
                <button
                  onClick={handleCleanupWarnings}
                  className="px-4 py-2 bg-yellow-600 text-white font-bold hover:bg-yellow-700"
                >
                  Clean Old Warnings
                </button>
                <button
                  onClick={handleHardDeleteAccounts}
                  className="px-4 py-2 bg-red-600 text-white font-bold hover:bg-red-700"
                >
                  Hard Delete Accounts
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Display Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Warnings
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Last Warning
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {accountsToDelete.length > 0 ? (
                    accountsToDelete.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">{user.display_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.account_status === 'soft_deleted' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {user.account_status === 'soft_deleted' ? 'Deleted' : 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.warning_count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.last_warning_at ? formatDate(user.last_warning_at) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {
                              setWarningUserId(user.id);
                              setShowWarningModal(true);
                            }}
                            className="text-yellow-600 hover:text-yellow-900 mr-3"
                          >
                            Add Warning
                          </button>
                          {user.account_status === 'soft_deleted' && (
                            <button
                              onClick={() => handleUndoDelete(user.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Undo Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                        No accounts with warnings found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'audit-log' && user.role === 'super-admin' && (
        <div className="mb-16">
          <h2 className="text-4xl font-bold mb-8 text-center">AUDIT LOG</h2>
          
          <div className="bg-white p-8 border-2 border-black mb-8">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Admin
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Target Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Target ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {auditLog.length > 0 ? (
                    auditLog.map((log) => (
                      <tr key={log.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">{log.admin_name || 'System'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            log.action === 'delete' ? 'bg-red-100 text-red-800' :
                            log.action === 'update_role' ? 'bg-yellow-100 text-yellow-800' :
                            log.action === 'certify' ? 'bg-green-100 text-green-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.target_type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.target_id}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="max-w-xs truncate">{log.details || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(log.created_at)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                        No audit log entries found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* User Role Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-lg max-w-md w-full">
            <h3 className="text-2xl font-bold mb-6">Update User Role</h3>
            <div className="mb-6">
              <p className="font-bold mb-2">User: {selectedUser.display_name}</p>
              <p className="text-gray-600 mb-4">Current Role: {selectedUser.role}</p>
              
              <div className="space-y-2">
                {['user', 'editorial-board', 'admin', 'super-admin'].map((role) => (
                  <label key={role} className="flex items-center">
                    <input
                      type="radio"
                      name="role"
                      value={role}
                      checked={selectedUser.role === role}
                      onChange={() => setSelectedUser({...selectedUser, role})}
                      className="mr-2"
                    />
                    <span className="capitalize">{role.replace('-', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowUserModal(false)}
                className="px-4 py-2 border border-gray-300 rounded font-bold hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateUserRole(selectedUser.id, selectedUser.role)}
                className="px-4 py-2 bg-black text-white rounded font-bold hover:bg-gray-800"
              >
                Update Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-lg max-w-md w-full">
            <h3 className="text-2xl font-bold mb-6">Add User Warning</h3>
            
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Reason for Warning
              </label>
              <textarea
                value={warningReason}
                onChange={(e) => setWarningReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder="Enter reason for warning..."
              />
            </div>
            
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowWarningModal(false);
                  setWarningReason('');
                  setWarningUserId(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded font-bold hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAddWarning}
                className="px-4 py-2 bg-yellow-600 text-white rounded font-bold hover:bg-yellow-700"
              >
                Add Warning
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ban Modal */}
      {showBanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-lg max-w-md w-full">
            <h3 className="text-2xl font-bold mb-6">Ban User</h3>
            
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Ban Duration
              </label>
              <div className="flex space-x-4">
                <div>
                  <label className="text-sm text-gray-600">Days</label>
                  <input
                    type="number"
                    min="0"
                    value={banDuration.days}
                    onChange={(e) => setBanDuration({...banDuration, days: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Hours</label>
                  <input
                    type="number"
                    min="0"
                    value={banDuration.hours}
                    onChange={(e) => setBanDuration({...banDuration, hours: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder="Enter reason for ban..."
              />
            </div>
            
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowBanModal(false);
                  setBanReason('');
                  setBanDuration({ days: 1, hours: 0 });
                }}
                className="px-4 py-2 border border-gray-300 rounded font-bold hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleBanUser}
                className="px-4 py-2 bg-red-600 text-white rounded font-bold hover:bg-red-700"
              >
                Ban User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-lg max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4">Confirm Deletion</h3>
            <p className="mb-6">
              Are you sure you want to delete this {deleteType}? This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteTarget(null);
                  setDeleteType(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded font-bold hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded font-bold hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;