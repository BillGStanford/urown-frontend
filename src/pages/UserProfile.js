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
  Clock,
  CheckCircle,
  Star,
  Users,
  AlertCircle,
  MapPin,
  Link2,
  Brain,
  Lock,
  Unlock
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
  const isCertifiedByFollowers = user && user.followers >= 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
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
      <div className="min-h-screen bg-gray-50 flex flex-col pt-20">
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
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-20">
              {/* Cover */}
              <div className="h-24 bg-gradient-to-r from-orange-500 to-orange-600"></div>
              
              {/* Profile Info */}
              <div className="px-6 pb-6">
                <div className="relative -mt-12 mb-4">
                  <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                    <span className="text-3xl font-bold text-white">
                      {user.display_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {isCertifiedByFollowers && (
                    <div className="absolute bottom-0 right-0 bg-orange-500 rounded-full p-1.5 border-2 border-white shadow-sm">
                      <Award className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>

                <h1 className="text-xl font-bold text-gray-900 mb-1">{user.display_name}</h1>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-orange-50 text-orange-700 px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 border border-orange-200">
                    <Star className="h-3 w-3" />
                    {user.tier}
                  </span>
                  {user.role !== 'user' && (
                    <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 border border-blue-200">
                      <Shield className="h-3 w-3" />
                      {user.role}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}</span>
                </div>

                {currentUser && currentUser.id !== user.id && (
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`w-full py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-sm ${
                      isFollowing
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                        : 'bg-orange-600 text-white hover:bg-orange-700'
                    }`}
                  >
                    {followLoading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}

                <div className="border-t border-gray-200 mt-6 pt-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{stats.totalArticles}</div>
                      <div className="text-xs text-gray-500 mt-1">Articles</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{user.followers || 0}</div>
                      <div className="text-xs text-gray-500 mt-1">Followers</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{stats.totalViews}</div>
                      <div className="text-xs text-gray-500 mt-1">Views</div>
                    </div>
                  </div>
                </div>

                {certifiedCount > 0 && (
                  <div className="border-t border-gray-200 mt-6 pt-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-50 rounded-lg p-2">
                        <Award className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{certifiedCount} Certified Articles</div>
                        <div className="text-xs text-gray-500">Expert recognition</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Ideology Section */}
 {user.ideology && (
                  <div className="border-t border-gray-200 mt-6 pt-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="h-5 w-5 text-purple-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Political Ideology</h3>
                    </div>
                    
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-purple-900">{user.ideology}</h4>
                          {user.ideology_details?.description && (
                            <p className="text-gray-700 text-sm mt-1">{user.ideology_details.description}</p>
                          )}
                          {user.ideology_updated_at && (
                            <p className="text-xs text-gray-500 mt-2">
                              Updated {formatDistanceToNow(new Date(user.ideology_updated_at), { addSuffix: true })}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-purple-200">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-700">Visibility:</span>
                          <span className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 ${
                            user.ideology_public 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.ideology_public ? (
                              <>
                                <Unlock className="h-3 w-3" />
                                Public
                              </>
                            ) : (
                              <>
                                <Lock className="h-3 w-3" />
                                Private
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                      
                      {!user.ideology_public && (
                        <p className="text-xs text-gray-600 mt-3 italic">
                          Note: This user's ideology is private and only visible to them.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Content - Articles Feed */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Articles</h2>
              <p className="text-sm text-gray-500">{articles.length} published</p>
            </div>

            {articles.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200">
                  <BookOpen className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No articles yet</h3>
                <p className="text-gray-500">This user hasn't published any articles yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {articles.map((article) => (
                  <div key={article.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                    <div className="p-6">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-white">
                            {user.display_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">{user.display_name}</span>
                            {isCertifiedByFollowers && (
                              <CheckCircle className="h-4 w-4 text-orange-500 flex-shrink-0" />
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(article.created_at), { addSuffix: true })}
                          </div>
                        </div>
                      </div>

                      <Link to={`/article/${article.id}`} className="block group">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {article.content.substring(0, 200)}...
                        </p>
                      </Link>

                      {(article.certified || article.topics?.length > 0) && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {article.certified && (
                            <span className="bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-green-200 flex items-center gap-1">
                              <Award className="h-3 w-3" />
                              Certified
                            </span>
                          )}
                          {article.topics && article.topics.slice(0, 3).map((topic, idx) => (
                            <span key={idx} className="bg-gray-50 text-gray-700 text-xs px-2.5 py-1 rounded-md border border-gray-200">
                              {topic}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <Eye className="h-4 w-4" />
                            <span>{article.views || 0}</span>
                          </div>
                        </div>
                        <Link 
                          to={`/article/${article.id}`} 
                          className="inline-flex items-center gap-1.5 text-orange-600 hover:text-orange-700 font-semibold text-sm transition-colors"
                        >
                          Read more
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="h-12"></div>
    </div>
  );
};

export default UserProfile;