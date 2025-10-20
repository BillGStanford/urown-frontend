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
  Clock
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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/users/${encodeURIComponent(display_name)}`);
        setUser(response.data.user);
        setArticles(response.data.articles);
        setStats(response.data.stats);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [display_name]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 bg-indigo-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="mt-6 text-xl font-semibold text-gray-700">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
        <div className="flex-grow container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <Link 
                to="/" 
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 pb-20 pt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-xl">
                <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                  {user.display_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg">
                <User className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">{user.display_name}</h1>
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                {user.tier} Tier
              </span>
              {user.role !== 'user' && (
                <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  {user.role}
                </span>
              )}
            </div>
            <p className="text-white/80 text-sm">
              Member since {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 -mt-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Articles</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalArticles}</p>
              </div>
              <div className="bg-indigo-100 rounded-lg p-3">
                <FileText className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Views</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalViews}</p>
              </div>
              <div className="bg-purple-100 rounded-lg p-3">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Avg. Views</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.totalArticles > 0 ? Math.round(stats.totalViews / stats.totalArticles) : 0}
                </p>
              </div>
              <div className="bg-green-100 rounded-lg p-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Articles Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-indigo-600" />
              Published Articles
            </h2>
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
              {articles.length} {articles.length === 1 ? 'Article' : 'Articles'}
            </span>
          </div>
          
          {articles.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No articles yet</h3>
              <p className="text-gray-500">This user hasn't published any articles.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {articles.map(article => (
                <div key={article.id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-grow">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          <Link 
                            to={`/article/${article.id}`} 
                            className="hover:text-indigo-600 transition-colors"
                          >
                            {article.title}
                          </Link>
                        </h3>
                        <div className="flex gap-2 ml-4">
                          {article.certified && (
                            <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <Award className="h-3 w-3" />
                              Certified
                            </span>
                          )}
                          {article.is_debate_winner && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <Trophy className="h-3 w-3" />
                              Debate Winner
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {article.content.substring(0, 200)}...
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>{article.views || 0} views</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDistanceToNow(new Date(article.created_at), { addSuffix: true })}</span>
                        </div>
                        <div className="flex gap-2">
                          {article.topics && article.topics.map((topic, index) => (
                            <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Link 
                        to={`/article/${article.id}`} 
                        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium text-sm"
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
  );
};

export default UserProfile;