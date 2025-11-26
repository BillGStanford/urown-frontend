import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { fetchWithDeduplication, getCachedData, setCachedData, createApiRequest } from '../../utils/apiUtils';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { 
  FileText, 
  Eye, 
  Calendar, 
  Award, 
  Users, 
  TrendingUp, 
  Settings, 
  RefreshCw,
  Edit,
  Trash2,
  ExternalLink,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Target,
  Clock,
  ChevronRight,
  PenTool,
  Trophy,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function Dashboard() {
  const { user, updateUser } = useUser();
  const navigate = useNavigate();
  const [weeklyRemainingArticles, setWeeklyRemainingArticles] = useState(0);
  const [nextResetDate, setNextResetDate] = useState(null);
  const [userStats, setUserStats] = useState({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    views: 0
  });
  const [userArticles, setUserArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    article: null
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Memoized function to calculate remaining articles
  const calculateRemainingArticles = useCallback((userWeeklyCount) => {
    const silverTierLimit = 2;
    return Math.max(0, silverTierLimit - userWeeklyCount);
  }, []);

  // Memoized function to calculate next reset date
  const calculateNextResetDate = useCallback((resetDate) => {
    if (!resetDate) return null;
    const reset = new Date(resetDate);
    return new Date(reset.getTime() + (7 * 24 * 60 * 60 * 1000));
  }, []);

  // Calculate total views from articles if not provided by API
  const calculateTotalViews = useCallback((articles) => {
    return articles.reduce((total, article) => total + (article.views || 0), 0);
  }, []);

  // Update local state when user changes
  useEffect(() => {
    if (user) {
      setWeeklyRemainingArticles(calculateRemainingArticles(user.weekly_articles_count));
      setNextResetDate(calculateNextResetDate(user.weekly_reset_date));
    }
  }, [user, calculateRemainingArticles, calculateNextResetDate]);

  // Function to fetch user statistics with deduplication
  const fetchUserStats = useCallback(async () => {
    try {
      const cachedStats = getCachedData('user-stats');
      if (cachedStats) {
        setUserStats(cachedStats);
        setLoading(false);
        return;
      }

      setLoading(true);
      
      const response = await fetchWithDeduplication(
        'user-stats',
        createApiRequest('/user/stats', { method: 'GET' })
      );
      
      const stats = response.data.stats;
      setUserStats(stats);
      setCachedData('user-stats', stats);
      setError(null);
      
    } catch (error) {
      console.error('Error fetching user stats:', error);
      if (error.response?.status !== 429) {
        setError('Failed to load user statistics. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to fetch user articles
  const fetchUserArticles = useCallback(async () => {
    try {
      const response = await fetchWithDeduplication(
        'user-articles',
        createApiRequest('/user/articles', { method: 'GET' })
      );
      
      setUserArticles(response.data.articles);
      setError(null);
      
    } catch (error) {
      console.error('Error fetching user articles:', error);
      if (error.response?.status !== 429) {
        setError('Failed to load your articles. Please try again later.');
      }
    }
  }, []);

  // Function to delete an article
  const deleteArticle = useCallback(async (articleId) => {
    try {
      setIsDeleting(true);
      
      await fetchWithDeduplication(
        `delete-article-${articleId}`,
        createApiRequest(`/articles/${articleId}`, { method: 'DELETE' })
      );
      
      await fetchUserArticles();
      await fetchUserStats();
      setDeleteConfirm({ show: false, article: null });
      
    } catch (error) {
      console.error('Error deleting article:', error);
      setError('Failed to delete article. Please try again later.');
    } finally {
      setIsDeleting(false);
    }
  }, [fetchUserArticles, fetchUserStats]);

  // Function to refresh user profile data
  const refreshUserData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      
      const response = await fetchWithDeduplication(
        'user-profile',
        createApiRequest('/user/profile', { method: 'GET' })
      );
      
      const userData = response.data.user;
      updateUser(userData);
      
      setWeeklyRemainingArticles(calculateRemainingArticles(userData.weekly_articles_count));
      setNextResetDate(calculateNextResetDate(userData.weekly_reset_date));
      
      setError(null);
      
    } catch (error) {
      console.error('Error refreshing user data:', error);
      if (error.response?.status !== 429) {
        setError('Failed to refresh user data. Please try again later.');
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [updateUser, calculateRemainingArticles, calculateNextResetDate]);

  // Initial data loading
  useEffect(() => {
    if (user && !loading) {
      const loadData = async () => {
        await refreshUserData();
        setTimeout(() => fetchUserStats(), 500);
        setTimeout(() => fetchUserArticles(), 1000);
      };
      loadData();
    } else if (user) {
      fetchUserStats();
      fetchUserArticles();
    }
  }, [user?.id]);

  // Update views when articles change
  useEffect(() => {
    if (userArticles.length > 0) {
      const totalViews = calculateTotalViews(userArticles);
      setUserStats(prev => ({ ...prev, views: totalViews }));
    }
  }, [userArticles, calculateTotalViews]);

  const formatDate = (date) => {
    if (!date) return 'Unknown';
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTimeUntilReset = () => {
    if (!nextResetDate) return 'Unknown';
    
    const now = new Date();
    const timeLeft = nextResetDate.getTime() - now.getTime();
    
    if (timeLeft <= 0) return 'Reset available';
    
    const days = Math.floor(timeLeft / (24 * 60 * 60 * 1000));
    const hours = Math.floor((timeLeft % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    
    if (days > 0) {
      return `${days} day${days !== 1 ? 's' : ''}, ${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  };

  const handleRetry = async () => {
    setError(null);
    await Promise.all([
      refreshUserData(),
      new Promise(resolve => setTimeout(resolve, 500)).then(() => fetchUserStats()),
      new Promise(resolve => setTimeout(resolve, 1000)).then(() => fetchUserArticles())
    ]);
  };

  const showDeleteConfirm = (item, type) => {
    setDeleteConfirm({
      show: true,
      article: type === 'article' ? item : null
    });
  };

  const handleDelete = async () => {
    if (deleteConfirm.article) {
      await deleteArticle(deleteConfirm.article.id);
    }
  };

  // Chart data (keeping existing chart code)
  const articleStatusData = {
    labels: ['Published', 'Drafts'],
    datasets: [{
      label: 'Articles',
      data: [userStats.publishedArticles, userStats.draftArticles],
      backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
      borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
      borderWidth: 1,
    }],
  };

  const articleStatusOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Article Status Distribution', font: { size: 16 } },
    },
  };

  const topArticles = [...userArticles]
    .filter(article => article.published)
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  const viewsPerArticleData = {
    labels: topArticles.map(article => 
      article.title.length > 20 ? article.title.substring(0, 20) + '...' : article.title
    ),
    datasets: [{
      label: 'Views',
      data: topArticles.map(article => article.views || 0),
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
    }],
  };

  const viewsPerArticleOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Top Articles by Views', font: { size: 16 } },
    },
    scales: { y: { beginAtZero: true } }
  };

  const articlesByMonth = {};
  userArticles.forEach(article => {
    const date = new Date(article.created_at);
    const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
    articlesByMonth[monthYear] = (articlesByMonth[monthYear] || 0) + 1;
  });

  const sortedMonths = Object.keys(articlesByMonth).sort((a, b) => {
    const [aMonth, aYear] = a.split('/').map(Number);
    const [bMonth, bYear] = b.split('/').map(Number);
    return aYear - bYear || aMonth - bMonth;
  });

  const timelineData = {
    labels: sortedMonths,
    datasets: [{
      label: 'Articles Created',
      data: sortedMonths.map(month => articlesByMonth[month]),
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
      tension: 0.3,
      fill: true,
    }],
  };

  const timelineOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Article Creation Timeline', font: { size: 16 } },
    },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-gray-700">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button 
                onClick={handleRetry}
                disabled={isRefreshing}
                className={`mt-2 px-4 py-2 rounded-md text-sm font-medium ${
                  isRefreshing 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                {isRefreshing ? 'Retrying...' : 'Retry'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 mb-8 shadow-lg">
        <div className="max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Welcome back, {user.display_name}!
          </h1>
          <p className="text-orange-100 text-lg">
            Ready to share your opinions with the world?
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Tier Status */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100 mr-4">
                <Trophy className="h-8 w-8 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Your Tier</p>
                <p className="text-2xl font-bold text-gray-900">{user.tier.toUpperCase()}</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-600">
                <Info className="h-4 w-4 mr-1" />
                Premium features coming soon
              </div>
            </div>
          </div>

          {/* Weekly Articles */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 mr-4">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">This Week</p>
                <p className="text-2xl font-bold text-gray-900">{weeklyRemainingArticles} / 2</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-1" />
                Articles remaining
              </div>
            </div>
          </div>

          {/* Reset Timer */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 mr-4">
                <RefreshCw className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Reset In</p>
                <p className="text-2xl font-bold text-gray-900">{getTimeUntilReset()}</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-600">
                <Activity className="h-4 w-4 mr-1" />
                Weekly limit resets
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'overview' 
                    ? 'border-b-2 border-orange-500 text-orange-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'analytics' 
                    ? 'border-b-2 border-orange-500 text-orange-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('analytics')}
              >
                Analytics
              </button>
              <button
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'articles' 
                    ? 'border-b-2 border-orange-500 text-orange-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('articles')}
              >
                My Articles
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <>
                {/* Action Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Write New Article */}
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-8 text-center text-white">
                    <div className="flex justify-center mb-4">
                      <PenTool className="h-16 w-16" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4">Write New Article</h2>
                    {weeklyRemainingArticles > 0 ? (
                      <>
                        <p className="mb-6">
                          You have {weeklyRemainingArticles} article{weeklyRemainingArticles !== 1 ? 's' : ''} remaining this week
                        </p>
                        <Link to="/write" className="inline-flex items-center px-6 py-3 bg-white text-orange-600 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                          Start Writing
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Link>
                      </>
                    ) : (
                      <>
                        <p className="mb-6">
                          You've reached your weekly limit. Reset in {getTimeUntilReset()}
                        </p>
                        <button 
                          disabled 
                          className="inline-flex items-center px-6 py-3 bg-gray-300 text-gray-500 rounded-lg font-medium cursor-not-allowed"
                        >
                          Limit Reached
                        </button>
                      </>
                    )}
                  </div>

                  {/* Quick Stats */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="text-2xl font-bold text-gray-900">{loading ? '...' : userStats.totalArticles}</div>
                        <div className="text-sm text-gray-600">Total Articles</div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="text-2xl font-bold text-gray-900">{loading ? '...' : userStats.publishedArticles}</div>
                        <div className="text-sm text-gray-600">Published</div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="text-2xl font-bold text-gray-900">{loading ? '...' : userStats.draftArticles}</div>
                        <div className="text-sm text-gray-600">Drafts</div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="text-2xl font-bold text-gray-900">{loading ? '...' : userStats.views}</div>
                        <div className="text-sm text-gray-600">Views</div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'analytics' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Content Analytics</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <div className="h-80">
                      <Pie data={articleStatusData} options={articleStatusOptions} />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <div className="h-80">
                      <Bar data={viewsPerArticleData} options={viewsPerArticleOptions} />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 mb-8">
                  <div className="h-80">
                    <Line data={timelineData} options={timelineOptions} />
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Articles</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Article Title
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Views
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {topArticles.length > 0 ? (
                          topArticles.map((article) => (
                            <tr key={article.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {article.title.length > 50 ? article.title.substring(0, 50) + '...' : article.title}
                                </div>
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
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(article.created_at).toLocaleDateString()}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
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

            {activeTab === 'articles' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">My Articles</h2>
                  <Link to="/write" className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md font-medium hover:bg-orange-700 transition-colors">
                    <PenTool className="h-4 w-4 mr-2" />
                    Create New Article
                  </Link>
                </div>
                
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Title
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Views
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {userArticles.length > 0 ? (
                          userArticles.map((article) => (
                            <tr key={article.id}>
                              <td className="px-6 py-4">
                                <div className="text-sm font-medium text-gray-900 max-w-xs">
                                  {article.title.length > 50 ? article.title.substring(0, 50) + '...' : article.title}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {new Date(article.created_at).toLocaleDateString()}
                                </div>
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
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(article.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                {article.published ? (
                                  <Link 
                                    to={`/article/${article.id}`}
                                    className="text-blue-600 hover:text-blue-900 mr-3"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </Link>
                                ) : (
                                  <Link 
                                    to={`/write?edit=${article.id}`}
                                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Link>
                                )}
                                <button
                                  onClick={() => showDeleteConfirm(article, 'article')}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                              No articles found. <Link to="/write" className="text-blue-600 hover:underline">Write your first article!</Link>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Profile Section */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Account Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Display Name:</span>
                  <span className="text-sm text-gray-900">{user.display_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Full Name:</span>
                  <span className="text-sm text-gray-900">{user.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Email:</span>
                  <span className="text-sm text-gray-900">{user.email || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Phone:</span>
                  <span className="text-sm text-gray-900">{user.phone || 'Not provided'}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Membership</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Member Since:</span>
                  <span className="text-sm text-gray-900">
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Current Tier:</span>
                  <span className="text-sm text-gray-900">{user.tier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Articles This Week:</span>
                  <span className="text-sm text-gray-900">{user.weekly_articles_count} / 2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Next Reset:</span>
                  <span className="text-sm text-gray-900">{formatDate(nextResetDate)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-6 space-x-4">
            <button 
              onClick={handleRetry}
              disabled={isRefreshing}
              className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium ${
                isRefreshing ? 'opacity-50 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
            </button>
            <Link to="/settings" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium bg-white text-gray-700 hover:bg-gray-50">
              <Settings className="h-4 w-4 mr-2" />
              Account Settings
            </Link>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">Delete Article</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this article? This action cannot be undone.
                  {deleteConfirm.article && (
                    <div className="mt-2 p-2 bg-gray-100 rounded">
                      <strong>{deleteConfirm.article.title}</strong>
                    </div>
                  )}
                </p>
              </div>
              <div className="flex justify-center mt-4 space-x-4">
                <button
                  onClick={() => setDeleteConfirm({ show: false, article: null })}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;