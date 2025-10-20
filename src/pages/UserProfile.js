// src/pages/UserProfile.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { formatDistanceToNow } from 'date-fns';

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <div className="text-2xl font-bold mt-4">LOADING...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex-grow container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
            <Link to="/" className="text-blue-500 hover:underline mt-2 inline-block">
              Return to Home
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* User Profile Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row items-center md:items-start">
              <div className="mb-4 md:mb-0 md:mr-6">
                <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  {user.display_name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="text-center md:text-left flex-grow">
                <h1 className="text-3xl font-bold mb-2">{user.display_name}</h1>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                    {user.tier} Tier
                  </span>
                  {user.role !== 'user' && (
                    <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                      {user.role}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-2">
                  Member since {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                </p>
                <div className="flex justify-center md:justify-start gap-6 text-sm">
                  <div>
                    <span className="font-semibold">{stats.totalArticles}</span> Articles
                  </div>
                  <div>
                    <span className="font-semibold">{stats.totalViews}</span> Total Views
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User's Articles */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Published Articles</h2>
            {articles.length === 0 ? (
              <p className="text-gray-500">No published articles yet.</p>
            ) : (
              <div className="space-y-4">
                {articles.map(article => (
                  <div key={article.id} className="border-b pb-4 last:border-b-0">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-semibold">
                        <Link to={`/article/${article.id}`} className="text-blue-600 hover:underline">
                          {article.title}
                        </Link>
                      </h3>
                      <div className="flex gap-2">
                        {article.certified && (
                          <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                            Certified
                          </span>
                        )}
                        {article.is_debate_winner && (
                          <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                            Debate Winner
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-600 mb-2 line-clamp-2">
                      {article.content.substring(0, 200)}...
                    </p>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <div className="flex gap-2">
                        {article.topics && article.topics.map((topic, index) => (
                          <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                            {topic}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-4">
                        <span>{article.views || 0} views</span>
                        <span>{formatDistanceToNow(new Date(article.created_at), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserProfile;