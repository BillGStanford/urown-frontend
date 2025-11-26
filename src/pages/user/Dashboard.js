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
      <div className="text-center py-16">
        <div className="text-2xl font-bold">Loading your dashboard...</div>
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
            onClick={handleRetry}
            disabled={isRefreshing}
            className={`mt-2 px-4 py-2 rounded font-bold ${
              isRefreshing 
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                : 'bg-red-500 text-white hover:bg-red-600'
            }`}
          >
            {isRefreshing ? 'Retrying...' : 'Retry'}
          </button>
        </div>
      )}

      {/* Welcome Section */}
      <div className="text-center mb-16">
        <h1 className="text-7xl font-bold mb-6">
          WELCOME BACK, {user.display_name.toUpperCase()}!
        </h1>
        <p className="text-2xl font-bold text-gray-600">
          Ready to share your opinions with the world?
        </p>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {/* Tier Status */}
        <div className="bg-gray-50 p-8 border-2 border-black text-center">
          <div className="text-5xl font-bold mb-4">🥈</div>
          <h2 className="text-3xl font-bold mb-2">YOUR TIER</h2>
          <div className="text-4xl font-bold text-gray-800 mb-2">
            {user.tier.toUpperCase()}
          </div>
          <p className="text-lg font-bold text-gray-600">
            Premium features coming soon
          </p>
        </div>

        {/* Weekly Articles */}
        <div className="bg-gray-50 p-8 border-2 border-black text-center">
          <div className="text-5xl font-bold mb-4">📝</div>
          <h2 className="text-3xl font-bold mb-2">THIS WEEK</h2>
          <div className="text-4xl font-bold text-gray-800 mb-2">
            {weeklyRemainingArticles} / 2
          </div>
          <p className="text-lg font-bold text-gray-600">
            Articles remaining
          </p>
        </div>

        {/* Reset Timer */}
        <div className="bg-gray-50 p-8 border-2 border-black text-center">
          <div className="text-5xl font-bold mb-4">⏰</div>
          <h2 className="text-3xl font-bold mb-2">RESET IN</h2>
          <div className="text-2xl font-bold text-gray-800 mb-2">
            {getTimeUntilReset()}
          </div>
          <p className="text-lg font-bold text-gray-600">
            Weekly limit resets
          </p>
        </div>
      </div>

      {/* Analytics Tabs */}
      <div className="mb-8">
        <div className="flex border-b border-gray-200">
          <button
            className={`py-4 px-6 font-bold text-lg ${activeTab === 'overview' ? 'border-b-4 border-black' : 'text-gray-500'}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`py-4 px-6 font-bold text-lg ${activeTab === 'analytics' ? 'border-b-4 border-black' : 'text-gray-500'}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
          <button
            className={`py-4 px-6 font-bold text-lg ${activeTab === 'articles' ? 'border-b-4 border-black' : 'text-gray-500'}`}
            onClick={() => setActiveTab('articles')}
          >
            My Articles
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Action Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Write New Article */}
            <div className="bg-black text-white p-12 text-center">
              <div className="text-6xl font-bold mb-6">✍️</div>
              <h2 className="text-4xl font-bold mb-6">WRITE NEW ARTICLE</h2>
              {weeklyRemainingArticles > 0 ? (
                <>
                  <p className="text-xl font-bold mb-8">
                    You have {weeklyRemainingArticles} article{weeklyRemainingArticles !== 1 ? 's' : ''} remaining this week
                  </p>
                  <Link to="/write" className="bg-white text-black px-12 py-6 text-2xl font-bold border-2 border-white hover:bg-black hover:text-white hover:border-white transition-colors duration-200">
                    START WRITING
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-xl font-bold mb-8">
                    You've reached your weekly limit. Reset in {getTimeUntilReset()}
                  </p>
                  <button 
                    disabled 
                    className="bg-gray-600 text-gray-400 px-12 py-6 text-2xl font-bold border-2 border-gray-600 cursor-not-allowed"
                  >
                    LIMIT REACHED
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-16 text-center">
            <h2 className="text-4xl font-bold mb-8">QUICK STATS</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 border-2 border-black">
                <div className="text-3xl font-bold">{loading ? '...' : userStats.totalArticles}</div>
                <div className="text-lg font-bold">Total Articles</div>
              </div>
              <div className="bg-white p-6 border-2 border-black">
                <div className="text-3xl font-bold">{loading ? '...' : userStats.publishedArticles}</div>
                <div className="text-lg font-bold">Published</div>
              </div>
              <div className="bg-white p-6 border-2 border-black">
                <div className="text-3xl font-bold">{loading ? '...' : userStats.draftArticles}</div>
                <div className="text-lg font-bold">Drafts</div>
              </div>
              <div className="bg-white p-6 border-2 border-black">
                <div className="text-3xl font-bold">{loading ? '...' : userStats.views}</div>
                <div className="text-lg font-bold">Views</div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'analytics' && (
        <div className="mb-16">
          <h2 className="text-4xl font-bold mb-8 text-center">CONTENT ANALYTICS</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div className="bg-white p-8 border-2 border-black">
              <div className="h-80">
                <Pie data={articleStatusData} options={articleStatusOptions} />
              </div>
            </div>

            <div className="bg-white p-8 border-2 border-black">
              <div className="h-80">
                <Bar data={viewsPerArticleData} options={viewsPerArticleOptions} />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 border-2 border-black mb-16">
            <div className="h-80">
              <Line data={timelineData} options={timelineOptions} />
            </div>
          </div>

          <div className="bg-white p-8 border-2 border-black">
            <h3 className="text-2xl font-bold mb-6">Top Performing Articles</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Article Title
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Views
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topArticles.length > 0 ? (
                    topArticles.map((article) => (
                      <tr key={article.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">
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
        <div className="mb-16">
          <h2 className="text-4xl font-bold mb-8 text-center">MY ARTICLES</h2>
          
          <div className="bg-white p-8 border-2 border-black mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">All Articles ({userArticles.length})</h3>
              <Link to="/write" className="btn-primary">
                CREATE NEW ARTICLE
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Views
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {userArticles.length > 0 ? (
                    userArticles.map((article) => (
                      <tr key={article.id}>
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-gray-900 max-w-xs">
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
                              View
                            </Link>
                          ) : (
                            <Link 
                              to={`/write?edit=${article.id}`}
                              className="text-indigo-600 hover:text-indigo-900 mr-3"
                            >
                              Edit
                            </Link>
                          )}
                          <button
                            onClick={() => showDeleteConfirm(article, 'article')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
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

      {/* Profile Section */}
      <div className="bg-gray-50 p-12 border-2 border-black">
        <h2 className="text-4xl font-bold mb-8 text-center">PROFILE INFORMATION</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">ACCOUNT DETAILS</h3>
            <div className="space-y-4">
              <div>
                <span className="text-lg font-bold">Display Name: </span>
                <span className="text-lg">{user.display_name}</span>
              </div>
              <div>
                <span className="text-lg font-bold">Full Name: </span>
                <span className="text-lg">{user.full_name}</span>
              </div>
              <div>
                <span className="text-lg font-bold">Email: </span>
                <span className="text-lg">{user.email || 'Not provided'}</span>
              </div>
              <div>
                <span className="text-lg font-bold">Phone: </span>
                <span className="text-lg">{user.phone || 'Not provided'}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-4">MEMBERSHIP</h3>
            <div className="space-y-4">
              <div>
                <span className="text-lg font-bold">Member Since: </span>
                <span className="text-lg">
                  {new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div>
                <span className="text-lg font-bold">Current Tier: </span>
                <span className="text-lg">{user.tier}</span>
              </div>
              <div>
                <span className="text-lg font-bold">Articles This Week: </span>
                <span className="text-lg">{user.weekly_articles_count} / 2</span>
              </div>
              <div>
                <span className="text-lg font-bold">Next Reset: </span>
                <span className="text-lg">{formatDate(nextResetDate)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <button 
            onClick={handleRetry}
            disabled={isRefreshing}
            className={`btn-secondary mr-4 ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isRefreshing ? 'REFRESHING...' : 'REFRESH DATA'}
          </button>
          <Link to="/settings" className="btn-secondary">
            ACCOUNT SETTINGS
          </Link>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-lg max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4">Confirm Deletion</h3>
            <p className="mb-6">
              Are you sure you want to delete this article? This action cannot be undone.
              {deleteConfirm.article && (
                <div className="mt-2 p-3 bg-gray-100 rounded">
                  <strong>{deleteConfirm.article.title}</strong>
                </div>
              )}
            </p>
            
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setDeleteConfirm({ show: false, article: null })}
                className="px-4 py-2 border border-gray-300 rounded font-bold hover:bg-gray-100"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded font-bold hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;