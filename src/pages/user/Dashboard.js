// Dashboard.js - WITH EBOOK MANAGEMENT
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

// PublishModal Component
const PublishModal = ({ isOpen, onClose, onPublish, ebook, weeklyPublishedCount = 0 }) => {
  const [length, setLength] = useState(ebook?.length || 'short');
  const [tags, setTags] = useState(ebook?.tags || []);
  const [customTag, setCustomTag] = useState('');
  const [license, setLicense] = useState(ebook?.license || 'all-rights-reserved');
  const [isbn, setIsbn] = useState(ebook?.isbn || '');
  const [isPublishing, setIsPublishing] = useState(false);

  const MAX_WEEKLY_BOOKS = 2;
  const canPublish = weeklyPublishedCount < MAX_WEEKLY_BOOKS;

  const availableTags = [
    'Fiction', 'Non-fiction', 'Policy', 'Essay', 'Debate',
    'Anthology', 'Memoir', 'Biography', 'History', 'Philosophy',
    'Science', 'Technology', 'Self-help', 'Business', 'Education'
  ];

  const handleAddTag = (tag) => {
    if (tags.length < 5 && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const handleRemoveTag = (tag) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleAddCustomTag = () => {
    if (customTag.trim() && tags.length < 5 && !tags.includes(customTag.trim())) {
      setTags([...tags, customTag.trim()]);
      setCustomTag('');
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    await onPublish({
      length,
      tags,
      license,
      isbn: isbn.trim() || null
    });
    setIsPublishing(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold">Publish Book</h2>
          <p className="text-gray-600 mt-2">Review your book details before publishing</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Weekly Limit Warning */}
          {!canPublish && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-semibold">⚠️ Weekly Limit Reached</p>
              <p className="text-red-700 text-sm mt-1">
                You've published {weeklyPublishedCount} of {MAX_WEEKLY_BOOKS} books this week. 
                Please wait until next week to publish more books.
              </p>
            </div>
          )}

          {/* Book Info Display */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-bold text-lg mb-2">{ebook?.title}</h3>
            {ebook?.description && (
              <p className="text-gray-700 text-sm">{ebook.description}</p>
            )}
            <div className="mt-3 text-sm text-gray-600">
              <span className="font-semibold">Chapters:</span> {ebook?.chapter_count || 0}
            </div>
          </div>

          {/* Length Selection */}
          <div>
            <label className="block font-semibold mb-2">Book Length</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="short"
                  checked={length === 'short'}
                  onChange={(e) => setLength(e.target.value)}
                  className="mr-2"
                />
                Short Length
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="long"
                  checked={length === 'long'}
                  onChange={(e) => setLength(e.target.value)}
                  className="mr-2"
                />
                Long Length
              </label>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block font-semibold mb-2">Tags (Select up to 5)</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {availableTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleAddTag(tag)}
                  disabled={tags.includes(tag) || tags.length >= 5}
                  className={`px-3 py-1 rounded text-sm ${
                    tags.includes(tag)
                      ? 'bg-blue-600 text-white'
                      : tags.length >= 5
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Custom Tag Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddCustomTag()}
                placeholder="Add custom tag..."
                maxLength={20}
                disabled={tags.length >= 5}
                className="flex-1 px-3 py-2 border border-gray-300 rounded"
              />
              <button
                onClick={handleAddCustomTag}
                disabled={!customTag.trim() || tags.length >= 5}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>

            {/* Selected Tags */}
            {tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm flex items-center gap-2"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* License */}
          <div>
            <label className="block font-semibold mb-2">License</label>
            <select
              value={license}
              onChange={(e) => setLicense(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            >
              <option value="all-rights-reserved">All Rights Reserved</option>
              <option value="cc-by">Creative Commons BY</option>
              <option value="cc-by-sa">Creative Commons BY-SA</option>
              <option value="cc-by-nc">Creative Commons BY-NC</option>
              <option value="public-domain">Public Domain</option>
            </select>
          </div>

          {/* ISBN (Optional) */}
          <div>
            <label className="block font-semibold mb-2">ISBN (Optional)</label>
            <input
              type="text"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              placeholder="978-3-16-148410-0"
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
            <p className="text-xs text-gray-500 mt-1">
              If you have an ISBN for this book, you can add it here
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
            disabled={isPublishing}
          >
            Cancel
          </button>
          <button
            onClick={handlePublish}
            disabled={!canPublish || isPublishing}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isPublishing ? 'Publishing...' : canPublish ? 'Publish Book' : 'Cannot Publish'}
          </button>
        </div>
      </div>
    </div>
  );
};

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
  const [userEbooks, setUserEbooks] = useState([]);
  const [weeklyEbooksCount, setWeeklyEbooksCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    article: null,
    ebook: null
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [publishModal, setPublishModal] = useState({
    show: false,
    ebook: null
  });

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
      setWeeklyEbooksCount(user.weekly_ebooks_count || 0);
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

  // Function to fetch user ebooks
  const fetchUserEbooks = useCallback(async () => {
    try {
      const response = await axios.get('/user/ebooks');
      setUserEbooks(response.data.ebooks || []);
    } catch (error) {
      console.error('Error fetching user ebooks:', error);
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
      setDeleteConfirm({ show: false, article: null, ebook: null });
      
    } catch (error) {
      console.error('Error deleting article:', error);
      setError('Failed to delete article. Please try again later.');
    } finally {
      setIsDeleting(false);
    }
  }, [fetchUserArticles, fetchUserStats]);

  // Function to delete an ebook
  const deleteEbook = useCallback(async (ebookId) => {
    try {
      setIsDeleting(true);
      await axios.delete(`/ebooks/${ebookId}`);
      await fetchUserEbooks();
      setDeleteConfirm({ show: false, article: null, ebook: null });
    } catch (error) {
      console.error('Error deleting ebook:', error);
      setError('Failed to delete ebook. Please try again later.');
    } finally {
      setIsDeleting(false);
    }
  }, [fetchUserEbooks]);

  // Function to publish ebook
  const publishEbook = useCallback(async (ebookId, publishData) => {
    try {
      await axios.post(`/ebooks/${ebookId}/publish`, publishData);
      await fetchUserEbooks();
      setPublishModal({ show: false, ebook: null });
      alert('Book published successfully!');
    } catch (error) {
      console.error('Error publishing ebook:', error);
      alert(error.response?.data?.error || 'Failed to publish book');
    }
  }, [fetchUserEbooks]);

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
      setWeeklyEbooksCount(userData.weekly_ebooks_count || 0);
      
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
        setTimeout(() => fetchUserEbooks(), 1500);
      };
      loadData();
    } else if (user) {
      fetchUserStats();
      fetchUserArticles();
      fetchUserEbooks();
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
      new Promise(resolve => setTimeout(resolve, 1000)).then(() => fetchUserArticles()),
      new Promise(resolve => setTimeout(resolve, 1500)).then(() => fetchUserEbooks())
    ]);
  };

  const showDeleteConfirm = (item, type) => {
    setDeleteConfirm({
      show: true,
      article: type === 'article' ? item : null,
      ebook: type === 'ebook' ? item : null
    });
  };

  const handleDelete = async () => {
    if (deleteConfirm.article) {
      await deleteArticle(deleteConfirm.article.id);
    } else if (deleteConfirm.ebook) {
      await deleteEbook(deleteConfirm.ebook.id);
    }
  };

  const showPublishModal = (ebook) => {
    setPublishModal({ show: true, ebook });
  };

  const handlePublish = async (publishData) => {
    if (publishModal.ebook) {
      await publishEbook(publishModal.ebook.id, publishData);
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

  const publishedEbooks = userEbooks.filter(e => e.published);
  const draftEbooks = userEbooks.filter(e => !e.published);

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
          <button
            className={`py-4 px-6 font-bold text-lg ${activeTab === 'ebooks' ? 'border-b-4 border-black' : 'text-gray-500'}`}
            onClick={() => setActiveTab('ebooks')}
          >
            My Books
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

            {/* Write New Book */}
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white p-12 text-center">
              <div className="text-6xl font-bold mb-6">📚</div>
              <h2 className="text-4xl font-bold mb-6">WRITE NEW BOOK</h2>
              {weeklyEbooksCount < 2 ? (
                <>
                  <p className="text-xl font-bold mb-8">
                    You can publish {2 - weeklyEbooksCount} more book{2 - weeklyEbooksCount !== 1 ? 's' : ''} this week
                  </p>
                  <Link to="/ebooks/write" className="bg-white text-purple-600 px-12 py-6 text-2xl font-bold border-2 border-white hover:bg-purple-600 hover:text-white hover:border-white transition-colors duration-200">
                    START WRITING
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-xl font-bold mb-8">
                    You've reached your weekly book limit
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
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
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
              <div className="bg-white p-6 border-2 border-black">
                <div className="text-3xl font-bold">{userEbooks.length}</div>
                <div className="text-lg font-bold">Books</div>
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

      {activeTab === 'ebooks' && (
        <div className="mb-16">
          <h2 className="text-4xl font-bold mb-8 text-center">MY BOOKS</h2>
          
          {/* Ebook Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 border-2 border-black text-center">
              <div className="text-3xl font-bold">{userEbooks.length}</div>
              <div className="text-lg font-bold">Total Books</div>
            </div>
            <div className="bg-white p-6 border-2 border-black text-center">
              <div className="text-3xl font-bold">{publishedEbooks.length}</div>
              <div className="text-lg font-bold">Published</div>
            </div>
            <div className="bg-white p-6 border-2 border-black text-center">
              <div className="text-3xl font-bold">{draftEbooks.length}</div>
              <div className="text-lg font-bold">Drafts</div>
            </div>
          </div>

          {/* Draft Books Section */}
          {draftEbooks.length > 0 && (
            <div className="bg-yellow-50 p-8 border-2 border-yellow-500 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">📝 Draft Books ({draftEbooks.length})</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {draftEbooks.map((ebook) => (
                  <div key={ebook.id} className="bg-white rounded-lg border-2 border-black overflow-hidden">
                    <div
                      className="h-48 flex items-center justify-center text-white text-6xl font-bold"
                      style={{
                        background: `linear-gradient(135deg, ${ebook.cover_color} 0%, ${ebook.cover_color}dd 100%)`
                      }}
                    >
                      {ebook.title.charAt(0).toUpperCase()}
                    </div>
                    
                    <div className="p-4">
                      <h4 className="font-bold text-lg mb-2 truncate">{ebook.title}</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        {ebook.chapter_count || 0} chapter{ebook.chapter_count !== 1 ? 's' : ''}
                      </p>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/ebooks/edit/${ebook.id}`)}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-bold"
                        >
                          Edit
                        </button>
                        {ebook.chapter_count > 0 && (
                          <button
                            onClick={() => showPublishModal(ebook)}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-bold"
                          >
                            Publish
                          </button>
                        )}
                        <button
                          onClick={() => showDeleteConfirm(ebook, 'ebook')}
                          className="px-4 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm font-bold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Published Books Section */}
          <div className="bg-white p-8 border-2 border-black mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">📚 Published Books ({publishedEbooks.length})</h3>
              <Link to="/ebooks/write" className="btn-primary">
                CREATE NEW BOOK
              </Link>
            </div>
            
            {publishedEbooks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publishedEbooks.map((ebook) => (
                  <div key={ebook.id} className="bg-white rounded-lg border-2 border-black overflow-hidden">
                    <div
                      className="h-48 flex items-center justify-center text-white text-6xl font-bold cursor-pointer"
                      style={{
                        background: `linear-gradient(135deg, ${ebook.cover_color} 0%, ${ebook.cover_color}dd 100%)`
                      }}
                      onClick={() => navigate(`/ebooks/${ebook.id}`)}
                    >
                      {ebook.title.charAt(0).toUpperCase()}
                    </div>
                    
                    <div className="p-4">
                      <h4 className="font-bold text-lg mb-2 truncate">{ebook.title}</h4>
                      <div className="text-sm text-gray-600 mb-4 space-y-1">
                        <p>{ebook.chapter_count || 0} chapter{ebook.chapter_count !== 1 ? 's' : ''}</p>
                        <p>{ebook.views || 0} read{ebook.views !== 1 ? 's' : ''}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/ebooks/${ebook.id}`)}
                          className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm font-bold"
                        >
                          View
                        </button>
                        <button
                          onClick={() => navigate(`/ebooks/edit/${ebook.id}`)}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-bold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => showDeleteConfirm(ebook, 'ebook')}
                          className="px-4 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm font-bold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600 mb-4">No published books yet</p>
                <Link to="/ebooks/write" className="btn-primary">
                  Write Your First Book
                </Link>
              </div>
            )}
          </div>

          {/* Weekly Publishing Info */}
          <div className="bg-blue-50 p-6 border-2 border-blue-200 rounded-lg">
            <h4 className="font-bold text-lg mb-2">📅 Weekly Publishing Limit</h4>
            <p className="text-gray-700">
              You've published <strong>{weeklyEbooksCount}</strong> of <strong>2</strong> books this week.
              {weeklyEbooksCount < 2 ? (
                <span> You can publish <strong>{2 - weeklyEbooksCount}</strong> more book{2 - weeklyEbooksCount !== 1 ? 's' : ''}.</span>
              ) : (
                <span> Limit resets in <strong>{getTimeUntilReset()}</strong>.</span>
              )}
            </p>
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
              Are you sure you want to delete this {deleteConfirm.article ? 'article' : 'book'}? This action cannot be undone.
              {(deleteConfirm.article || deleteConfirm.ebook) && (
                <div className="mt-2 p-3 bg-gray-100 rounded">
                  <strong>{deleteConfirm.article?.title || deleteConfirm.ebook?.title}</strong>
                </div>
              )}
            </p>
            
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setDeleteConfirm({ show: false, article: null, ebook: null })}
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

      {/* Publish Modal */}
      <PublishModal
        isOpen={publishModal.show}
        onClose={() => setPublishModal({ show: false, ebook: null })}
        onPublish={handlePublish}
        ebook={publishModal.ebook}
        weeklyPublishedCount={weeklyEbooksCount}
      />
    </div>
  );
}

export default Dashboard;