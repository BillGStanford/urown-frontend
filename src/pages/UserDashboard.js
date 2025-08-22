
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  PenTool, 
  Eye, 
  Calendar, 
  TrendingUp, 
  Award,
  User,
  LogOut,
  FileText,
  BarChart3,
  Target
} from 'lucide-react';

const UserDashboard = ({ user, logout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Fetch user stats
      const statsResponse = await fetch('/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!statsResponse.ok) {
        throw new Error('Failed to fetch stats');
      }
      const statsData = await statsResponse.json();
      
      // Fetch user articles
      const articlesResponse = await fetch('/api/articles/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!articlesResponse.ok) {
        throw new Error('Failed to fetch articles');
      }
      const articlesData = await articlesResponse.json();

      setStats(statsData);
      setArticles(Array.isArray(articlesData) ? articlesData : []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message);
      setStats({
        totalArticles: 0,
        articlesToday: 0,
        articlesThisWeek: 0,
        dailyLimit: 2,
        weeklyLimit: 4,
        canPost: true,
        tier: user?.tier || 'silver',
        verified: user?.verified || false,
        totalViews: 0
      });
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const getTierInfo = (tier) => {
    const tiers = {
      silver: {
        name: 'SILVER',
        color: 'tier-silver bg-gray-300',
        icon: '🥈',
        next: 'GOLD (2+ articles)',
        benefits: ['2 articles/day', '4 articles/week', 'Basic publishing']
      },
      gold: {
        name: 'GOLD',
        color: 'tier-gold bg-yellow-400',
        icon: '🥇',
        next: 'PLATINUM (5+ articles, 1+ weekly)',
        benefits: ['5 articles/day', 'Unlimited weekly', 'Enhanced visibility']
      },
      platinum: {
        name: 'PLATINUM',
        color: 'tier-platinum bg-blue-300',
        icon: '💎',
        next: 'DIAMOND (10+ articles, 2+ weekly)',
        benefits: ['Front page highlights', 'Featured categories', 'Priority support']
      },
      diamond: {
        name: 'DIAMOND',
        color: 'tier-diamond bg-purple-400',
        icon: '💎',
        next: 'Maximum tier reached!',
        benefits: ['Verified writer badge', 'Beta features', 'Exclusive opportunities']
      }
    };
    return tiers[tier] || tiers.silver;
  };

  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }) : 'No date';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-4xl font-black">LOADING DASHBOARD...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-4xl font-black text-red-600">{error}</div>
      </div>
    );
  }

  const tierInfo = getTierInfo(stats?.tier || user?.tier || 'silver');

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b-4 border-black bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="text-3xl md:text-4xl font-black tracking-tighter">
              UROWN
            </Link>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-4">
                <div className={`tier-badge ${tierInfo.color} px-3 py-1 text-sm font-bold text-black`}>
                  TIER {stats?.tier?.toUpperCase() || 'SILVER'}
                </div>
                <span className="font-bold">
                  {user?.fullName || 'User'}
                  {stats?.verified && <Award className="inline ml-2 h-4 w-4" />}
                </span>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 bg-black text-white px-4 py-2 font-bold border-2 border-black hover:bg-white hover:text-black transition-colors"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">LOGOUT</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile Tier Info */}
        <div className="md:hidden mb-6 bg-gray-100 p-4 border-2 border-black">
          <div className="flex items-center justify-between">
            <div>
              <div className={`tier-badge ${tierInfo.color} px-3 py-1 inline-block mb-2 font-bold text-black`}>
                TIER {stats?.tier?.toUpperCase() || 'SILVER'}
              </div>
              <div className="font-bold">{user?.fullName || 'User'}</div>
            </div>
            {stats?.verified && <Award size={24} />}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b-2 border-black">
          {[
            { id: 'overview', label: 'OVERVIEW', icon: <BarChart3 size={20} /> },
            { id: 'articles', label: 'MY ARTICLES', icon: <FileText size={20} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 font-bold border-2 border-black transition-colors ${
                activeTab === tab.id
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-black text-white p-8">
              <h1 className="text-3xl md:text-4xl font-black mb-4">
                WELCOME BACK, {user?.fullName?.split(' ')[0]?.toUpperCase() || 'USER'}!
              </h1>
              <p className="text-lg font-bold mb-4">
                You're a {tierInfo.name} tier writer. Keep creating amazing content!
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-white text-black px-4 py-2 font-bold">
                  {stats?.totalArticles || 0} ARTICLES PUBLISHED
                </div>
                <div className="bg-white text-black px-4 py-2 font-bold">
                  {stats?.totalViews || 0} TOTAL VIEWS
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="newspaper-grid grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Publishing Stats */}
              <div className="article-card bg-white p-6 border-2 border-black">
                <h3 className="text-2xl font-black mb-4 flex items-center">
                  <TrendingUp className="mr-2" />
                  PUBLISHING STATS
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Articles Today</span>
                    <span>{stats?.articlesToday || 0}/{stats?.dailyLimit || 2}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Articles This Week</span>
                    <span>
                      {stats?.articlesThisWeek || 0}/
                      {stats?.weeklyLimit === 'Unlimited' ? '∞' : stats?.weeklyLimit || 4}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Total Views</span>
                    <span>{stats?.totalViews || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Can Post?</span>
                    <span className={stats?.canPost ? 'text-green-600' : 'text-red-600'}>
                      {stats?.canPost ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
                {!stats?.canPost && (
                  <p className="mt-4 text-sm text-red-600 font-bold">
                    You've reached your posting limit. Upgrade your tier or wait for the next period!
                  </p>
                )}
              </div>

              {/* Tier Info */}
              <div className="article-card bg-white p-6 border-2 border-black">
                <h3 className="text-2xl font-black mb-4 flex items-center">
                  <Award className="mr-2" />
                  YOUR TIER: {tierInfo.name}
                </h3>
                <div className="space-y-4">
                  <p className="text-lg font-bold">{tierInfo.icon} {tierInfo.name} Benefits:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    {tierInfo.benefits.map((benefit, index) => (
                      <li key={index} className="font-medium">{benefit}</li>
                    ))}
                  </ul>
                  <p className="font-bold">Next Tier: {tierInfo.next}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="article-card bg-white p-6 border-2 border-black">
                <h3 className="text-2xl font-black mb-4 flex items-center">
                  <Target className="mr-2" />
                  QUICK ACTIONS
                </h3>
                <div className="space-y-4">
                  <Link
                    to="/write"
                    className="block w-full bg-black text-white px-4 py-2 font-bold border-2 border-black hover:bg-white hover:text-black transition-colors flex items-center justify-center space-x-2"
                  >
                    <PenTool size={16} />
                    <span>Write New Article</span>
                  </Link>
                  <Link
                    to="/"
                    className="block w-full bg-gray-100 text-black px-4 py-2 font-bold border-2 border-black hover:bg-black hover:text-white transition-colors flex items-center justify-center space-x-2"
                  >
                    <FileText size={16} />
                    <span>View All Articles</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'articles' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black">YOUR ARTICLES</h2>
              <Link
                to="/write"
                className="bg-black text-white px-4 py-2 font-bold border-2 border-black hover:bg-white hover:text-black transition-colors flex items-center space-x-2"
              >
                <PenTool size={16} />
                <span>NEW ARTICLE</span>
              </Link>
            </div>

            {articles.length === 0 ? (
              <div className="bg-white p-6 border-2 border-black">
                <p className="text-lg font-bold">No articles yet. Start writing!</p>
              </div>
            ) : (
              <div className="newspaper-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map(article => (
                  <div key={article.id} className="article-card bg-white p-6 border-2 border-black">
                    {article.featuredImage && (
                      <img
                        src={article.featuredImage}
                        alt={article.title}
                        className="w-full h-48 object-cover mb-4 border-2 border-black"
                      />
                    )}
                    <h3 className="text-xl font-black mb-2">{article.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{article.excerpt}</p>
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center space-x-2">
                        <Calendar size={16} />
                        <span>{formatDate(article.createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Eye size={16} />
                        <span>{article.views || 0} views</span>
                      </div>
                    </div>
                    <Link
                      to={`/article/${article.id}`}
                      className="block w-full bg-black text-white px-4 py-2 font-bold border-2 border-black hover:bg-white hover:text-black transition-colors text-center"
                    >
                      READ MORE
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
