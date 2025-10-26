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
  AlertCircle
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
      return;
    }

    try {
      setFollowLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (isFollowing) {
        await axios.delete(`${API_URL}/users/${user.id}/follow`, { headers });
        setIsFollowing(false);
      } else {
        await axios.post(`${API_URL}/users/${user.id}/follow`, {}, { headers });
        setIsFollowing(true);
      }

      const response = await axios.get(`${API_URL}/users/${encodeURIComponent(display_name)}`, { headers });
      setUser(response.data.user);
      
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-3 border-b-3 border-orange-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <User className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          <div className="mt-6 text-lg font-semibold text-gray-700">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-grow container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm p-10 text-center border border-gray-200">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Profile Not Found</h2>
              <p className="text-gray-600 mb-8">{error}</p>
              <Link 
                to="/" 
                className="inline-flex items-center px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors duration-200 shadow-sm"
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Cover */}
      <div className="relative">
        <div className="h-40 bg-gradient-to-r from-orange-500 to-orange-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/5"></div>
        </div>
        
        {/* Profile Info */}
        <div className="container mx-auto px-4 -mt-16">
          <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-200">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
              <div className="relative -mt-20 md:-mt-16">
                <div className="w-28 h-28 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                  <span className="text-4xl font-bold text-white">
                    {user.display_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="absolute bottom-1 right-1 bg-green-500 rounded-full p-1.5 border-2 border-white shadow-sm">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
              </div>
              
              <div className="flex-grow text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{user.display_name}</h1>
                  {isCertifiedByFollowers && (
                    <div className="flex items-center gap-1 bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold border border-orange-200">
                      <Award className="h-4 w-4" />
                      Certified
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-3">
                  <span className="bg-orange-50 text-orange-700 px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 border border-orange-200">
                    <Star className="h-4 w-4" />
                    {user.tier} Tier
                  </span>
                  {user.role !== 'user' && (
                    <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 border border-blue-200">
                      <Shield className="h-4 w-4" />
                      {user.role}
                    </span>
                  )}
                  <span className="bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 border border-gray-200">
                    <Users className="h-4 w-4" />
                    {user.followers || 0} Followers
                  </span>
                </div>
                <p className="text-gray-600 flex items-center justify-center md:justify-start gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                </p>
              </div>
              
              {currentUser && currentUser.id !== user.id && (
                <div className="flex-shrink-0">
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-sm ${
                      isFollowing
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                        : 'bg-orange-600 text-white hover:bg-orange-700'
                    }`}
                  >
                    {followLoading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="container mx-auto px-4 mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-orange-50 rounded-lg p-2.5">
                <FileText className="h-5 w-5 text-orange-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.totalArticles}</span>
            </div>
            <p className="text-gray-900 font-semibold text-sm">Articles</p>
            <p className="text-gray-500 text-xs">Published</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-blue-50 rounded-lg p-2.5">
                <Eye className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.totalViews}</span>
            </div>
            <p className="text-gray-900 font-semibold text-sm">Total Views</p>
            <p className="text-gray-500 text-xs">Reached</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-green-50 rounded-lg p-2.5">
                <Award className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{certifiedCount}</span>
            </div>
            <p className="text-gray-900 font-semibold text-sm">Certified</p>
            <p className="text-gray-500 text-xs">Expert articles</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-yellow-50 rounded-lg p-2.5">
                <Trophy className="h-5 w-5 text-yellow-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{debateWinnerCount}</span>
            </div>
            <p className="text-gray-900 font-semibold text-sm">Debate Wins</p>
            <p className="text-gray-500 text-xs">Champion</p>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
              <Activity className="h-6 w-6 text-orange-600" />
              Recent Activity
            </h2>
            <div className="flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200">
              <FileText className="h-4 w-4 text-orange-600" />
              <span className="text-orange-700 font-semibold text-sm">{articles.length} posts</span>
            </div>
          </div>
          
          {articles.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200">
                <BookOpen className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No articles yet</h3>
              <p className="text-gray-500">This user hasn't published any articles yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {articles.map((article) => (
                <div key={article.id} className="group">
                  <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-grow">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-200">
                            <FileText className="h-4 w-4 text-orange-600" />
                          </div>
                          <div className="flex-grow">
                            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                              <Link to={`/article/${article.id}`}>
                                {article.title}
                              </Link>
                            </h3>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {article.certified && (
                                <span className="bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1 rounded border border-green-200 flex items-center gap-1">
                                  <Award className="h-3 w-3" />
                                  Certified
                                </span>
                              )}
                              {article.is_debate_winner && (
                                <span className="bg-yellow-50 text-yellow-700 text-xs font-semibold px-2.5 py-1 rounded border border-yellow-200 flex items-center gap-1">
                                  <Trophy className="h-3 w-3" />
                                  Winner
                                </span>
                              )}
                              {article.topics && article.topics.slice(0, 3).map((topic, idx) => (
                                <span key={idx} className="bg-white text-gray-700 text-xs px-2.5 py-1 rounded border border-gray-200">
                                  {topic}
                                </span>
                              ))}
                            </div>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                              {article.content.substring(0, 180)}...
                            </p>
                            <div className="flex items-center gap-5 text-sm text-gray-500">
                              <div className="flex items-center gap-1.5">
                                <Eye className="h-4 w-4" />
                                <span>{article.views || 0}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4" />
                                <span>{formatDistanceToNow(new Date(article.created_at), { addSuffix: true })}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center lg:ml-4">
                        <Link 
                          to={`/article/${article.id}`} 
                          className="inline-flex items-center gap-2 bg-orange-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-orange-700 transition-colors duration-200 shadow-sm text-sm"
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
      <div className="h-12"></div>
    </div>
  );
};

export default UserProfile;