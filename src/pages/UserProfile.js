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
  Unlock,
  MessageSquare,
  UserPlus
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
  const [ideologyLoading, setIdeologyLoading] = useState(false);
  const [showDiscordModal, setShowDiscordModal] = useState(false);
  const [discordUsername, setDiscordUsername] = useState('');
  const [discordLoading, setDiscordLoading] = useState(false);
  const [suggestedUsers, setSuggestedUsers] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const response = await axios.get(`${API_URL}/users/${encodeURIComponent(display_name)}`, { headers });
        
        console.log('=== USER PROFILE DATA ===');
        console.log('Full response:', response.data);
        console.log('User ideology:', response.data.user.ideology);
        console.log('Ideology public:', response.data.user.ideology_public);
        console.log('Ideology details:', response.data.user.ideology_details);
        console.log('Discord username:', response.data.user.discord_username);
        console.log('========================');
        
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
          console.log('Current user:', response.data.user);
        }
      } catch (err) {
        console.error('Failed to fetch current user:', err);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      if (!user?.ideology || !user?.ideology_public) return;
      
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const response = await axios.get(`${API_URL}/users/suggested/${encodeURIComponent(user.ideology)}`, { 
          headers,
          params: { exclude_user_id: user.id }
        });
        
        setSuggestedUsers(response.data.users || []);
      } catch (err) {
        console.error('Failed to fetch suggested users:', err);
      }
    };

    if (user) {
      fetchSuggestedUsers();
    }
  }, [user]);

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

  const handleToggleIdeologyVisibility = async () => {
    try {
      setIdeologyLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const newVisibility = !user.ideology_public;
      console.log('Toggling visibility to:', newVisibility);

      await axios.patch(`${API_URL}/user/ideology/visibility`, 
        { ideology_public: newVisibility },
        { headers }
      );

      setUser(prev => ({ 
        ...prev, 
        ideology_public: newVisibility 
      }));

      console.log('Visibility updated successfully to:', newVisibility);
    } catch (err) {
      console.error('Toggle visibility error:', err);
      setError(err.response?.data?.error || 'Failed to update visibility');
    } finally {
      setIdeologyLoading(false);
    }
  };

  const handleUpdateDiscordUsername = async () => {
    try {
      setDiscordLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      await axios.put(`${API_URL}/user/profile`, 
        { discord_username: discordUsername.trim() },
        { headers }
      );

      setUser(prev => ({ 
        ...prev, 
        discord_username: discordUsername.trim() 
      }));

      if (currentUser && currentUser.id === user.id) {
        setCurrentUser(prev => ({ 
          ...prev, 
          discord_username: discordUsername.trim() 
        }));
      }

      setShowDiscordModal(false);
      setDiscordUsername('');
    } catch (err) {
      console.error('Update Discord username error:', err);
      setError(err.response?.data?.error || 'Failed to update Discord username');
    } finally {
      setDiscordLoading(false);
    }
  };

  const certifiedCount = articles.filter(article => article.certified).length;
  const isCertifiedByFollowers = user && user.followers >= 100;
  
  const isOwnProfile = currentUser && user && currentUser.id === user.id;
  const shouldShowIdeology = user?.ideology && (isOwnProfile || user?.ideology_public === true);

  console.log('Ideology Display Logic:', {
    hasIdeology: !!user?.ideology,
    isOwnProfile,
    currentUserExists: !!currentUser,
    ideologyPublic: user?.ideology_public,
    shouldShowIdeology
  });

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
      {/* Hero Header Section */}
      <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
        }}></div>
        
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl border-4 border-white">
                  <span className="text-5xl font-bold text-orange-600">
                    {user.display_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                {isCertifiedByFollowers && (
                  <div className="absolute bottom-2 right-2 bg-orange-500 rounded-full p-2 border-3 border-white shadow-lg">
                    <Award className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-grow text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
                  <h1 className="text-4xl font-bold text-white">{user.display_name}</h1>
                  <div className="flex flex-wrap justify-center md:justify-start gap-2">
                    <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1.5 border border-white/30">
                      <Star className="h-4 w-4" />
                      {user.tier}
                    </span>
                    {user.role !== 'user' && (
                      <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1.5 border border-white/30">
                        <Shield className="h-4 w-4" />
                        {user.role}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-center md:justify-start gap-2 text-white/90 mb-4">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}</span>
                </div>

                {/* Stats Row */}
                <div className="flex items-center justify-center md:justify-start gap-6 text-white">
                  <div>
                    <span className="text-2xl font-bold">{stats.totalArticles}</span>
                    <span className="text-sm text-white/80 ml-2">Articles</span>
                  </div>
                  <div className="w-px h-6 bg-white/30"></div>
                  <div>
                    <span className="text-2xl font-bold">{user.followers || 0}</span>
                    <span className="text-sm text-white/80 ml-2">Followers</span>
                  </div>
                  <div className="w-px h-6 bg-white/30"></div>
                  <div>
                    <span className="text-2xl font-bold">{stats.totalViews}</span>
                    <span className="text-sm text-white/80 ml-2">Views</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {currentUser && currentUser.id !== user.id && (
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`px-8 py-3 rounded-full font-semibold transition-all duration-200 shadow-lg ${
                    isFollowing
                      ? 'bg-white text-orange-600 hover:bg-gray-100'
                      : 'bg-white text-orange-600 hover:bg-gray-100'
                  }`}
                >
                  {followLoading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - About & Connect */}
          <div className="lg:col-span-1 space-y-6">
            {/* Achievements Card */}
            {certifiedCount > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-orange-600" />
                  Achievements
                </h3>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <Award className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{certifiedCount}</div>
                      <div className="text-sm text-gray-600">Certified Articles</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Discord Connect Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-indigo-600" />
                Discord
              </h3>
              
              {user.discord_username ? (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-indigo-900">{user.discord_username}</div>
                    {isOwnProfile && (
                      <button
                        onClick={() => setShowDiscordModal(true)}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                  {user.discord_username_updated_at && (
                    <p className="text-xs text-gray-500">
                      Updated {formatDistanceToNow(new Date(user.discord_username_updated_at), { addSuffix: true })}
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  {isOwnProfile ? (
                    <div>
                      <p className="text-gray-600 text-sm mb-3">Connect with other users on Discord</p>
                      <button
                        onClick={() => setShowDiscordModal(true)}
                        className="w-full py-2.5 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium text-sm flex items-center justify-center gap-2"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Add Username
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm text-center italic">No Discord username</p>
                  )}
                </div>
              )}
            </div>

            {/* Political Ideology Card */}
            {shouldShowIdeology && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  Political Ideology
                </h3>
                
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                  <h4 className="font-bold text-purple-900 mb-2 text-lg">{user.ideology}</h4>
                  {user.ideology_details?.description && (
                    <p className="text-gray-700 text-sm mb-3">{user.ideology_details.description}</p>
                  )}
                  
                  {isOwnProfile && (
                    <div className="pt-3 border-t border-purple-200 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">Visibility:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
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
                      
                      <button
                        onClick={handleToggleIdeologyVisibility}
                        disabled={ideologyLoading}
                        className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {ideologyLoading ? 'Updating...' : (
                          <>
                            {user.ideology_public ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                            Make {user.ideology_public ? 'Private' : 'Public'}
                          </>
                        )}
                      </button>
                      
                      <Link
                        to="/ideology-quiz"
                        className="w-full py-2 px-4 bg-white text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors duration-200 font-medium text-sm flex items-center justify-center gap-2"
                      >
                        <Brain className="h-4 w-4" />
                        Retake Quiz
                      </Link>
                    </div>
                  )}
                  
                  {!isOwnProfile && (
                    <div className="pt-3 border-t border-purple-200">
                      <p className="text-xs text-gray-600 italic flex items-center gap-1">
                        <Unlock className="h-3 w-3" />
                        Publicly shared ideology
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Suggested Users Card */}
            {suggestedUsers.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-orange-600" />
                  Similar Users
                </h3>
                <p className="text-xs text-gray-500 mb-4">Users with {user.ideology} ideology</p>
                
                <div className="space-y-3">
                  {suggestedUsers.slice(0, 5).map((suggestedUser) => (
                    <Link
                      key={suggestedUser.id}
                      to={`/user/${suggestedUser.display_name}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-white">
                          {suggestedUser.display_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="font-semibold text-gray-900 truncate">{suggestedUser.display_name}</div>
                        <div className="text-xs text-gray-500">{suggestedUser.followers || 0} followers</div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Articles Feed */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-orange-600" />
                    Published Articles
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">{articles.length} {articles.length === 1 ? 'article' : 'articles'}</p>
                </div>
              </div>
            </div>

            {articles.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No articles yet</h3>
                <p className="text-gray-500">This user hasn't published any articles yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {articles.map((article) => (
                  <div key={article.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-lg font-bold text-white">
                            {user.display_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-900">{user.display_name}</span>
                            {isCertifiedByFollowers && (
                              <CheckCircle className="h-5 w-5 text-orange-500 flex-shrink-0" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(article.created_at), { addSuffix: true })}
                          </div>
                        </div>
                      </div>

                      <Link to={`/article/${article.id}`} className="block group">
                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {article.content.substring(0, 200)}...
                        </p>
                      </Link>

                      {(article.certified || article.topics?.length > 0) && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {article.certified && (
                            <span className="bg-green-50 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-green-200 flex items-center gap-1.5">
                              <Award className="h-3.5 w-3.5" />
                              Certified
                            </span>
                          )}
                          {article.topics && article.topics.slice(0, 3).map((topic, idx) => (
                            <span key={idx} className="bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded-full border border-gray-200">
                              {topic}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            <span className="font-medium">{article.views || 0} views</span>
                          </div>
                        </div>
                        <Link 
                          to={`/article/${article.id}`} 
                          className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold text-sm transition-colors group"
                        >
                          Read article
                          <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
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

      {/* Discord Username Modal */}
      {showDiscordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {user.discord_username ? 'Update Discord' : 'Add Discord'}
                </h3>
                <p className="text-sm text-gray-500">Connect with the community</p>
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="discord-username" className="block text-sm font-semibold text-gray-700 mb-2">
                Discord Username
              </label>
              <input
                type="text"
                id="discord-username"
                value={discordUsername}
                onChange={(e) => setDiscordUsername(e.target.value)}
                placeholder="username#1234"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
              <p className="text-xs text-gray-500 mt-2">
                This will be visible on your public profile
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDiscordModal(false);
                  setDiscordUsername('');
                }}
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateDiscordUsername}
                disabled={discordLoading || !discordUsername.trim()}
                className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {discordLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="h-12"></div>
    </div>
  );
};

export default UserProfile;