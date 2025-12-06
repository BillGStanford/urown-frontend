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
  UserPlus,
  Zap,
  TrendingUp,
  Trophy,
  Target,
  Activity
} from 'lucide-react';

const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://urown-backend.onrender.com/api'  
  : 'http://localhost:5000/api';

// URownScoreCard Component
const URownScoreCard = ({ user, userRank, stats }) => {
  if (!user.urown_score && user.urown_score !== 0) return null;

  // Calculate progress percentage for articles
  const progressPercentage = Math.min(((stats?.totalArticles || 0) / 15) * 100, 100);

  return (
    <div className="bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-2xl shadow-xl border-2 border-yellow-200 overflow-hidden">
      <div className="p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Zap className="h-6 w-6" />
            UROWN Score
          </h3>
          {userRank && userRank.rank <= 15 && (
            <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/30">
              <Trophy className="h-4 w-4" />
              <span className="text-sm font-bold">Top 15</span>
            </div>
          )}
        </div>

        <div className="text-5xl font-extrabold mb-2">
          {user.urown_score.toLocaleString()}
        </div>
        {userRank && (
          <div className="flex items-center gap-4 text-white/90 mb-6">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Rank #{userRank.rank}</span>
            </div>
            <span className="text-white/60">•</span>
            <div className="text-sm">
              Top {Math.round((userRank.rank / userRank.total_users) * 100)}%
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="mb-4">
            <p className="font-semibold text-sm mb-2">Articles Progress</p>
            <div className="w-full bg-black/10 rounded-full h-2">
              <div 
                className="bg-gray-800 rounded-full h-2 transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span>{stats?.totalArticles || 0}/15 Articles ({Math.round(progressPercentage)}%)</span>
              <span className="font-semibold">Goal: 15</span>
            </div>
          </div>

          <Link
            to="/leaderboard"
            className="block w-full py-3 px-4 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors duration-200 font-bold text-center flex items-center justify-center gap-2"
          >
            <Trophy className="h-5 w-5" />
            View Leaderboard
          </Link>
        </div>
      </div>
    </div>
  );
};

const UserProfile = () => {
  const { display_name } = useParams();
  const [user, setUser] = useState(null);
  const [articles, setArticles] = useState([]);
  const [stats, setStats] = useState({ 
    totalArticles: 0, 
    totalViews: 0
  });
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
  const [userRank, setUserRank] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // Don't include authorization headers for public profile access
        const response = await axios.get(`${API_URL}/users/${encodeURIComponent(display_name)}`);
        
        console.log('=== USER PROFILE DATA ===');
        console.log('Full response:', response.data);
        console.log('User ideology:', response.data.user.ideology);
        console.log('Ideology public:', response.data.user.ideology_public);
        console.log('Ideology details:', response.data.user.ideology_details);
        console.log('Discord username:', response.data.user.discord_username);
        console.log('========================');
        
        setUser(response.data.user);
        setArticles(response.data.articles || []);
        
        // Calculate total views for articles
        const articleViews = (response.data.articles || []).reduce((sum, article) => sum + (article.views || 0), 0);
        
        setStats({
          totalArticles: response.data.articles?.length || 0,
          totalViews: articleViews
        });
        
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
        // Don't set error here as it's not critical for the page to function
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchUserRank = async () => {
      if (!user) return;
      
      try {
        const token = localStorage.getItem('token');
        // Only try to fetch rank if user is logged in
        if (token) {
          const headers = { Authorization: `Bearer ${token}` };
          const response = await axios.get(`${API_URL}/user/rank`, { headers });
          setUserRank(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch user rank:', err);
        // Don't set error here as it's not critical for the page to function
      }
    };

    fetchUserRank();
  }, [user]);

  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      if (!user?.ideology || !user?.ideology_public) return;
      
      try {
        const token = localStorage.getItem('token');
        // Only try to fetch suggested users if user is logged in
        if (token) {
          const headers = { Authorization: `Bearer ${token}` };
          const response = await axios.get(`${API_URL}/users/suggested/${encodeURIComponent(user.ideology)}`, { 
            headers,
            params: { exclude_user_id: user.id }
          });
          
          setSuggestedUsers(response.data.users || []);
        }
      } catch (err) {
        console.error('Failed to fetch suggested users:', err);
        // Don't set error here as it's not critical for the page to function
      }
    };

    if (user) {
      fetchSuggestedUsers();
    }
  }, [user]);

  const handleFollow = async () => {
    if (!currentUser) return;

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

      await axios.patch(`${API_URL}/user/ideology/visibility`, 
        { ideology_public: newVisibility },
        { headers }
      );

      setUser(prev => ({ 
        ...prev, 
        ideology_public: newVisibility 
      }));
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-3 border-b-3 border-yellow-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <User className="h-8 w-8 text-yellow-600" />
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
                className="inline-flex items-center px-6 py-3 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-700 transition-colors duration-200 shadow-sm"
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
      <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 relative overflow-hidden">
        <div className="absolute inset-0" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.1
        }}></div>
        
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-32 h-32 bg-yellow-500 rounded-full flex items-center justify-center shadow-2xl border-4 border-white">
                  <span className="text-5xl font-bold text-gray-800">
                    {user.display_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                {isCertifiedByFollowers && (
                  <div className="absolute bottom-2 right-2 bg-yellow-500 rounded-full p-2 border-3 border-white shadow-lg">
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
                    <span className="text-2xl font-bold">{user.urown_score || 0}</span>
                    <span className="text-sm text-white/80 ml-2">UROWN Score</span>
                  </div>
                  <div className="w-px h-6 bg-white/30"></div>
                  <div>
                    <span className="text-2xl font-bold">{stats.totalArticles}</span>
                    <span className="text-sm text-white/80 ml-2">Articles</span>
                  </div>
                  <div className="w-px h-6 bg-white/30"></div>
                  <div>
                    <span className="text-2xl font-bold">{user.followers || 0}</span>
                    <span className="text-sm text-white/80 ml-2">Followers</span>
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
                      ? 'bg-white text-yellow-700 hover:bg-gray-100'
                      : 'bg-white text-yellow-700 hover:bg-gray-100'
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
            {/* UROWN Score Card */}
            <URownScoreCard user={user} userRank={userRank} stats={stats} />

            {/* Views Stats Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Eye className="h-5 w-5 text-yellow-600" />
                View Statistics
              </h3>
              
              <div className="bg-yellow-50 rounded-xl p-4 border-l-5 border-yellow-500">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-gray-500">TOTAL ARTICLE VIEWS</span>
                    <span className="text-xs text-gray-500 block">Across {stats.totalArticles} articles</span>
                  </div>
                  <span className="text-3xl font-bold text-yellow-700">{stats.totalViews.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Achievements Card */}
            {certifiedCount > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-600" />
                  Achievements
                </h3>
                <div className="bg-green-50 rounded-xl p-4 border-l-5 border-green-500">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Award className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-700">Certified Articles</div>
                        <div className="text-xs text-gray-500">Articles certified by community</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-green-600">{certifiedCount}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Political Ideology Card */}
            {shouldShowIdeology && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  Political Ideology
                </h3>
                
                <div className="bg-purple-50 rounded-xl p-4 border-l-5 border-purple-500">
                  <h4 className="font-bold text-purple-700 mb-2 text-lg">{user.ideology}</h4>
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
                        className="w-full py-2.5 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
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
                        className="w-full py-2.5 px-4 bg-white text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors duration-200 font-medium text-sm flex items-center justify-center gap-2"
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
                  <Users className="h-5 w-5 text-yellow-600" />
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
                      <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center flex-shrink-0">
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
            {/* Tab Navigation */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2 mb-6">
              <div className="flex space-x-1">
                <button
                  className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                    true ? 'bg-yellow-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FileText className="h-5 w-5" />
                  Articles ({articles.length})
                </button>
              </div>
            </div>

            {/* Articles Tab Content */}
            <div className="space-y-4">
              {articles.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No articles yet</h3>
                  <p className="text-gray-500">This user hasn't published any articles yet.</p>
                </div>
              ) : (
                articles.map((article) => (
                  <Link key={article.id} to={`/article/${article.id}`} className="block group">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden">
                      <div className="p-6">
                        {/* Article Title & Preview */}
                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-yellow-700 transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {article.content.substring(0, 200)}...
                        </p>

                        {/* Badges */}
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

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <Eye className="h-4 w-4" />
                              <span className="font-medium">{article.views || 0} views</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{formatDistanceToNow(new Date(article.created_at), { addSuffix: true })}</span>
                            </div>
                          </div>
                          <div className="inline-flex items-center gap-2 text-yellow-700 hover:text-yellow-800 font-semibold text-sm transition-colors group">
                            Read article
                            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
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