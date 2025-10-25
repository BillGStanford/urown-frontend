// src/pages/UserProfile.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { 
  User, 
  FileText, 
  Eye, 
  Calendar, 
  Award, 
  Shield, 
  ChevronRight,
  BookOpen,
  TrendingUp,
  Clock,
  Heart,
  MessageCircle,
  Share2,
  CheckCircle,
  Trophy,
  Star,
  Users,
  Activity,
  Zap,
  Sparkles
} from 'lucide-react';

const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://urown-backend.onrender.com/api'  
  : 'http://localhost:5000/api';

const UserProfile = () => {
  const { display_name } = useParams();
  const [user, setUser] = useState(null);
  const [articles, setArticles] = useState([]);
  const [stats, setStats] = useState({ totalArticles: 0, totalViews: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const response = await axios.get(`${API_URL}/users/${encodeURIComponent(display_name)}`, { headers });
        setUser(response.data.user);
        setArticles(response.data.articles);
        setStats(response.data.stats);
        setIsFollowing(response.data.user.isFollowing || false);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [display_name]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await axios.get(`${API_URL}/user/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setCurrentUser(response.data.user);
        }
      } catch (err) {
        console.error('Failed to fetch current user:', err);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleFollow = async () => {
    if (!currentUser) {
      // Redirect to login or show login modal
      return;
    }

    try {
      setFollowLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (isFollowing) {
        await axios.delete(`${API_URL}/users/${user.id}/follow`, { headers });
        setUser(prev => ({ ...prev, followers: prev.followers - 1 }));
      } else {
        await axios.post(`${API_URL}/users/${user.id}/follow`, {}, { headers });
        setUser(prev => ({ ...prev, followers: prev.followers + 1 }));
      }

      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error('Follow/unfollow error:', err);
      setError(err.response?.data?.error || 'Failed to follow/unfollow user');
    } finally {
      setFollowLoading(false);
    }
  };

  const certifiedCount = articles.filter(article => article.certified).length;
  const debateWinnerCount = articles.filter(article => article.is_debate_winner).length;
  const isCertifiedByFollowers = user && user.followers >= 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-purple-500 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="h-10 w-10 text-purple-500 animate-pulse" />
            </div>
          </div>
          <div className="mt-8 text-xl font-semibold text-gray-700 animate-pulse">Loading amazing content...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex flex-col">
        <div className="flex-grow container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-12 text-center border border-white/20">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Profile Not Found</h2>
              <p className="text-gray-600 mb-8 text-lg">{error}</p>
              <Link 
                to="/" 
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Hero Section with Cover */}
      <div className="relative">
        <div className="h-48 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0">
            <div className="absolute top-4 left-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-4 right-4 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
          </div>
        </div>
        
        {/* Profile Info */}
        <div className="container mx-auto px-4 -mt-16">
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/30">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
              <div className="relative -mt-20 md:-mt-16">
                <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl border-4 border-white">
                  <span className="text-5xl font-bold text-white">
                    {user.display_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-2 border-3 border-white shadow-lg">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
              </div>
              
              <div className="flex-grow text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold text-gray-900">{user.display_name}</h1>
                  {isCertifiedByFollowers && (
                    <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                      <Star className="h-4 w-4" />
                      Certified
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-3">
                  <span className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    {user.tier} Tier
                  </span>
                  {user.role !== 'user' && (
                    <span className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      {user.role}
                    </span>
                  )}
                  <span className="bg-gradient-to-r from-green-100 to-blue-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {user.followers || 0} Followers
                  </span>
                </div>
                <p className="text-gray-600 flex items-center justify-center md:justify-start gap-2">
                  <Calendar className="h-4 w-4" />
                  Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                </p>
              </div>
              
              {currentUser && currentUser.id !== user.id && (
                <div className="flex-shrink-0">
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg ${
                      isFollowing
                        ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                    }`}
                  >
                    {followLoading ? 'Loading...' : isFollowing ? 'Unfollow' : 'Follow'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="container mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/30 hover:shadow-2xl transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-purple-100 rounded-xl p-3">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-purple-600">{stats.totalArticles}</span>
            </div>
            <p className="text-gray-700 font-semibold">Articles</p>
            <p className="text-gray-500 text-sm">Published content</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/30 hover:shadow-2xl transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-blue-100 rounded-xl p-3">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-blue-600">{stats.totalViews}</span>
            </div>
            <p className="text-gray-700 font-semibold">Total Views</p>
            <p className="text-gray-500 text-sm">People reached</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/30 hover:shadow-2xl transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-green-100 rounded-xl p-3">
                <Award className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-green-600">{certifiedCount}</span>
            </div>
            <p className="text-gray-700 font-semibold">Certified</p>
            <p className="text-gray-500 text-sm">Expert articles</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/30 hover:shadow-2xl transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-yellow-100 rounded-xl p-3">
                <Trophy className="h-6 w-6 text-yellow-600" />
              </div>
              <span className="text-2xl font-bold text-yellow-600">{debateWinnerCount}</span>
            </div>
            <p className="text-gray-700 font-semibold">Debate Wins</p>
            <p className="text-gray-500 text-sm">Champion content</p>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/30">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Activity className="h-8 w-8 text-purple-600" />
              Recent Activity
            </h2>
            <div className="flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-full">
              <Zap className="h-4 w-4 text-purple-600" />
              <span className="text-purple-800 font-semibold">{articles.length} posts</span>
            </div>
          </div>
          
          {articles.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">No articles yet</h3>
              <p className="text-gray-500 text-lg">This user hasn't published any articles yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {articles.map((article, index) => (
                <div key={article.id} className="group">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100 hover:shadow-lg transition-all duration-300">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-grow">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="bg-white rounded-full p-2 shadow-sm">
                            <FileText className="h-5 w-5 text-purple-600" />
                          </div>
                          <div className="flex-grow">
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                              <Link to={`/article/${article.id}`}>
                                {article.title}
                              </Link>
                            </h3>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {article.certified && (
                                <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  Certified
                                </span>
                              )}
                              {article.is_debate_winner && (
                                <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                                  <Trophy className="h-3 w-3" />
                                  Debate Winner
                                </span>
                              )}
                              {article.topics && article.topics.map((topic, idx) => (
                                <span key={idx} className="bg-white text-gray-700 text-xs px-3 py-1 rounded-full border border-gray-200">
                                  {topic}
                                </span>
                              ))}
                            </div>
                            <p className="text-gray-600 mb-4 line-clamp-2">
                              {article.content.substring(0, 200)}...
                            </p>
                            <div className="flex items-center gap-6 text-sm text-gray-500">
                              <div className="flex items-center gap-2">
                                <Eye className="h-4 w-4" />
                                <span>{article.views || 0} views</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>{formatDistanceToNow(new Date(article.created_at), { addSuffix: true })}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Link 
                          to={`/article/${article.id}`} 
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
                        >
                          Read Article
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Spacer */}
      <div className="h-16"></div>
    </div>
  );
};

export default UserProfile;