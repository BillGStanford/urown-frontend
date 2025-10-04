// src/pages/UserProfile.js
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import ArticleCard from '../components/ArticleCard';
import { 
  User, 
  Calendar, 
  BookOpen, 
  Eye, 
  Edit3, 
  Trash2,
  FileText,
  Award,
  TrendingUp,
  MessageCircle
} from 'lucide-react';

function UserProfile() {
  const { displayName } = useParams();
  const { user: currentUser } = useUser();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState(null);
  const [articles, setArticles] = useState([]);
  const [stats, setStats] = useState({
    totalArticles: 0,
    publishedArticles: 0,
    totalViews: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('published');

  const isOwnProfile = currentUser && currentUser.display_name === displayName;

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user profile by display name
        const userResponse = await axios.get(`/user/profile/${displayName}`);
        setProfileUser(userResponse.data.user);

        // Fetch user's articles
        const articlesResponse = await axios.get(`/user/articles/${displayName}`);
        const userArticles = articlesResponse.data.articles;
        setArticles(userArticles);

        // Calculate stats
        const published = userArticles.filter(a => a.published);
        const totalViews = published.reduce((sum, a) => sum + (a.views || 0), 0);
        
        setStats({
          totalArticles: userArticles.length,
          publishedArticles: published.length,
          totalViews: totalViews
        });

      } catch (error) {
        console.error('Error fetching profile:', error);
        setError(error.response?.data?.error || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [displayName]);

  const handleDeleteArticle = async (articleId) => {
    if (!window.confirm('Are you sure you want to delete this article?')) {
      return;
    }

    try {
      await axios.delete(`/articles/${articleId}`);
      setArticles(articles.filter(a => a.id !== articleId));
      
      // Update stats
      const article = articles.find(a => a.id === articleId);
      if (article) {
        setStats(prev => ({
          totalArticles: prev.totalArticles - 1,
          publishedArticles: article.published ? prev.publishedArticles - 1 : prev.publishedArticles,
          totalViews: article.published ? prev.totalViews - (article.views || 0) : prev.totalViews
        }));
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('Failed to delete article');
    }
  };

  const handleEditArticle = (articleId) => {
    navigate(`/write?edit=${articleId}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredArticles = articles.filter(article => {
    if (activeTab === 'published') {
      return article.published;
    } else if (activeTab === 'drafts') {
      return !article.published;
    }
    return true;
  });

  // Show only published articles to non-owners
  const displayArticles = isOwnProfile ? filteredArticles : articles.filter(a => a.published);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-black mx-auto mb-4"></div>
          <div className="text-2xl font-bold">LOADING PROFILE...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl border-4 border-red-500">
          <h2 className="text-3xl font-black text-red-600 mb-4">PROFILE NOT FOUND</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            to="/" 
            className="inline-flex items-center bg-black text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-800 transition-all duration-200"
          >
            BACK TO HOME
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Profile Header */}
      <div className="relative bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white py-16 px-8 mb-8">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Profile Avatar */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl border-4 border-white">
                <User size={64} className="text-white" />
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-5xl font-black mb-2 tracking-tight">
                {profileUser.full_name}
              </h1>
              <p className="text-2xl text-gray-300 mb-4">
                @{profileUser.display_name}
              </p>
              
              {/* Tier Badge */}
              <div className="inline-flex items-center bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-4 py-2 rounded-full font-bold text-sm mb-4">
                <Award className="mr-2" size={16} />
                {profileUser.tier} TIER
              </div>

              {/* Join Date */}
              <div className="flex items-center justify-center md:justify-start text-gray-300 mt-4">
                <Calendar className="mr-2" size={18} />
                <span>Joined {formatDate(profileUser.created_at)}</span>
              </div>
            </div>

            {/* Edit Profile Button (own profile only) */}
            {isOwnProfile && (
              <div className="flex-shrink-0">
                <Link
                  to="/settings"
                  className="inline-flex items-center bg-white text-black px-6 py-3 rounded-lg font-bold hover:bg-yellow-500 transition-all duration-200 shadow-lg"
                >
                  <Edit3 className="mr-2" size={18} />
                  EDIT PROFILE
                </Link>
              </div>
            )}
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
              <div className="flex items-center justify-center mb-2">
                <BookOpen className="text-yellow-500" size={28} />
              </div>
              <div className="text-3xl font-black">{stats.publishedArticles}</div>
              <div className="text-gray-300 text-sm font-semibold uppercase tracking-wide">
                Published Articles
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
              <div className="flex items-center justify-center mb-2">
                <Eye className="text-yellow-500" size={28} />
              </div>
              <div className="text-3xl font-black">{stats.totalViews.toLocaleString()}</div>
              <div className="text-gray-300 text-sm font-semibold uppercase tracking-wide">
                Total Views
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="text-yellow-500" size={28} />
              </div>
              <div className="text-3xl font-black">
                {stats.publishedArticles > 0 ? Math.round(stats.totalViews / stats.publishedArticles) : 0}
              </div>
              <div className="text-gray-300 text-sm font-semibold uppercase tracking-wide">
                Avg. Views per Article
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Articles Section */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        {/* Tabs (only show for own profile) */}
        {isOwnProfile && (
          <div className="flex space-x-2 mb-8 bg-white rounded-xl p-2 shadow-lg border-2 border-gray-200">
            <button
              onClick={() => setActiveTab('published')}
              className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg font-bold transition-all duration-200 ${
                activeTab === 'published'
                  ? 'bg-black text-white'
                  : 'bg-transparent text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FileText className="mr-2" size={18} />
              PUBLISHED ({articles.filter(a => a.published).length})
            </button>
            <button
              onClick={() => setActiveTab('drafts')}
              className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg font-bold transition-all duration-200 ${
                activeTab === 'drafts'
                  ? 'bg-black text-white'
                  : 'bg-transparent text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Edit3 className="mr-2" size={18} />
              DRAFTS ({articles.filter(a => !a.published).length})
            </button>
          </div>
        )}

        {/* Articles Header */}
        <div className="mb-6">
          <h2 className="text-3xl font-black flex items-center text-gray-900">
            <MessageCircle className="mr-3 text-black" size={32} />
            {isOwnProfile ? 'YOUR ARTICLES' : `${profileUser.display_name}'S ARTICLES`}
          </h2>
        </div>

        {/* Articles Grid */}
        {displayArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayArticles.map((article) => (
              <div key={article.id} className="relative">
                <ArticleCard
                  article={{
                    ...article,
                    display_name: profileUser.display_name,
                    tier: profileUser.tier
                  }}
                  onClick={() => navigate(`/article/${article.id}`)}
                />
                
                {/* Edit/Delete Buttons (own profile only) */}
                {isOwnProfile && (
                  <div className="absolute top-4 right-4 flex space-x-2 z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditArticle(article.id);
                      }}
                      className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg"
                      title="Edit article"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteArticle(article.id);
                      }}
                      className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-all duration-200 shadow-lg"
                      title="Delete article"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl shadow-xl border-2 border-gray-200">
            <FileText size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {isOwnProfile ? 'NO ARTICLES YET' : 'NO PUBLISHED ARTICLES'}
            </h3>
            <p className="text-gray-600 mb-6">
              {isOwnProfile 
                ? 'Start sharing your opinions with the world!' 
                : `${profileUser.display_name} hasn't published any articles yet.`}
            </p>
            {isOwnProfile && (
              <Link
                to="/write"
                className="inline-flex items-center bg-black text-white px-8 py-4 rounded-lg font-bold hover:bg-gray-800 transition-all duration-200 shadow-lg"
              >
                <Edit3 className="mr-2" size={20} />
                WRITE YOUR FIRST ARTICLE
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserProfile;