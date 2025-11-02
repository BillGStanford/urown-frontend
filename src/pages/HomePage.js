import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { fetchWithRetry, getCachedData, setCachedData } from '../utils/apiUtils';
import { useUser } from '../context/UserContext';
import { ChevronRight, Flame, Award, Users, TrendingUp, Eye, MessageSquare, Calendar } from 'lucide-react';

function HomePage() {
  const [activeDebates, setActiveDebates] = useState([]);
  const [certifiedArticles, setCertifiedArticles] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [articlesByTopic, setArticlesByTopic] = useState({});
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch debate topics
        const debatesResponse = await fetchWithRetry(() => axios.get('/debate-topics'));
        setActiveDebates(debatesResponse.data.topics || []);
        
        // Fetch certified articles
        const certifiedResponse = await fetchWithRetry(() => 
          axios.get('/articles', { params: { certified: 'true', limit: 6 } })
        );
        setCertifiedArticles(certifiedResponse.data.articles || []);
        
        // Fetch all articles with views > 500
        const articlesResponse = await fetchWithRetry(() => 
          axios.get('/articles', { params: { limit: 100 } })
        );
        const allArticles = articlesResponse.data.articles || [];
        
        // Group articles by their first topic (views > 500)
        const grouped = {};
        allArticles
          .filter(article => article.views >= 500)
          .forEach(article => {
            const topic = article.topics && article.topics.length > 0 ? article.topics[0] : 'Uncategorized';
            if (!grouped[topic]) {
              grouped[topic] = [];
            }
            grouped[topic].push(article);
          });
        
        // Sort articles within each topic by views
        Object.keys(grouped).forEach(topic => {
          grouped[topic].sort((a, b) => b.views - a.views);
        });
        
        setArticlesByTopic(grouped);
        
        // Fetch top users (mock data - you'd need to implement this endpoint)
        // For now, we'll leave it empty
        setTopUsers([]);
        
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num;
  };

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-gray-800">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/20 via-transparent to-purple-900/20"></div>
        <div className="relative max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">
              {user ? (
                <>Welcome back, <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">{user.display_name}</span></>
              ) : (
                <>The Voice of <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">Debate</span></>
              )}
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-3xl mx-auto">
              Join the conversation. Share your perspective. Shape the discourse.
            </p>
            {!user && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/signup" className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-100 transition-colors">
                  Sign up free
                </Link>
                <Link to="/browse" className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-full hover:bg-white/10 transition-colors">
                  Browse debates
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Active Debates Section */}
        {activeDebates.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl md:text-4xl font-black text-white flex items-center gap-3">
                <Flame className="w-8 h-8 text-orange-500" />
                Active Debates
              </h2>
              <Link to="/browse" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-bold">
                Show all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeDebates.map((debate) => (
                <Link 
                  key={debate.id}
                  to={`/debate-topics/${debate.id}`}
                  className="group bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 hover:from-gray-700 hover:to-gray-800 transition-all duration-300 border border-gray-700 hover:border-orange-500"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-orange-500 transition-colors line-clamp-2">
                        {debate.title}
                      </h3>
                      <p className="text-sm text-gray-400 line-clamp-2">{debate.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {debate.opinions_count} opinions
                    </span>
                    <span className="text-orange-500 font-bold">Join debate →</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Editorial Picks Section */}
        {certifiedArticles.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl md:text-4xl font-black text-white flex items-center gap-3">
                <Award className="w-8 h-8 text-yellow-500" />
                Editorial Picks
              </h2>
            </div>
            <div className="overflow-x-auto pb-4 -mx-4 px-4">
              <div className="flex gap-6" style={{ minWidth: 'min-content' }}>
                {certifiedArticles.map((article) => (
                  <Link 
                    key={article.id}
                    to={`/articles/${article.id}`}
                    className="group bg-gradient-to-br from-yellow-900/20 to-orange-900/20 rounded-2xl p-6 hover:from-yellow-900/30 hover:to-orange-900/30 transition-all duration-300 border border-yellow-700/50 hover:border-yellow-500 flex-shrink-0"
                    style={{ width: '320px' }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="w-5 h-5 text-yellow-500" />
                      <span className="text-xs font-bold text-yellow-500 uppercase tracking-wider">Certified</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-3 group-hover:text-orange-500 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {formatNumber(article.views)}
                      </span>
                      <span>by {article.display_name}</span>
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-3">
                      {truncateText(article.content.replace(/<[^>]*>/g, ''), 120)}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Popular Users Section */}
        {topUsers.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl md:text-4xl font-black text-white flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-purple-500" />
                Popular Voices
              </h2>
            </div>
            <div className="overflow-x-auto pb-4 -mx-4 px-4">
              <div className="flex gap-4" style={{ minWidth: 'min-content' }}>
                {topUsers.map((user) => (
                  <Link 
                    key={user.id}
                    to={`/user/${encodeURIComponent(user.display_name)}`}
                    className="group bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl p-6 hover:from-purple-900/30 hover:to-pink-900/30 transition-all duration-300 border border-purple-700/50 hover:border-purple-500 flex-shrink-0 text-center"
                    style={{ width: '200px' }}
                  >
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-black">
                      {user.display_name.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-500 transition-colors truncate">
                      {user.display_name}
                    </h3>
                    <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                      <span>{formatNumber(user.followers)} followers</span>
                      <span>{formatNumber(user.totalViews)} views</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Articles by Topic Sections */}
        {Object.keys(articlesByTopic).length > 0 && (
          <div className="space-y-16">
            {Object.entries(articlesByTopic)
              .sort(([, articlesA], [, articlesB]) => {
                const totalViewsA = articlesA.reduce((sum, a) => sum + a.views, 0);
                const totalViewsB = articlesB.reduce((sum, b) => sum + b.views, 0);
                return totalViewsB - totalViewsA;
              })
              .map(([topic, articles]) => (
                <section key={topic}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl md:text-4xl font-black text-white">
                      {topic}
                    </h2>
                    <Link to={`/browse?topic=${topic}`} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-bold">
                      Show all <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="overflow-x-auto pb-4 -mx-4 px-4">
                    <div className="flex gap-6" style={{ minWidth: 'min-content' }}>
                      {articles.slice(0, 8).map((article) => (
                        <Link 
                          key={article.id}
                          to={`/articles/${article.id}`}
                          className="group bg-gray-800 rounded-2xl p-6 hover:bg-gray-700 transition-all duration-300 flex-shrink-0"
                          style={{ width: '320px' }}
                        >
                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            {article.certified && (
                              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 text-xs font-bold rounded-md">
                                Certified
                              </span>
                            )}
                            {article.topics && article.topics.slice(0, 2).map(t => (
                              <span key={t} className="px-2 py-1 bg-gray-700 text-gray-300 text-xs font-bold rounded-md">
                                {t}
                              </span>
                            ))}
                          </div>
                          <h3 className="text-lg font-bold text-white mb-3 group-hover:text-orange-500 transition-colors line-clamp-2">
                            {article.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {formatNumber(article.views)}
                            </span>
                            <span>by {article.display_name}</span>
                          </div>
                          <p className="text-sm text-gray-400 line-clamp-3">
                            {truncateText(article.content.replace(/<[^>]*>/g, ''), 120)}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                </section>
              ))}
          </div>
        )}

        {/* Bottom CTA for non-logged users */}
        {!user && (
          <section className="mt-20 text-center py-20 bg-gradient-to-r from-orange-900/30 to-pink-900/30 rounded-3xl border border-orange-700/50">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Ready to join the conversation?
            </h2>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Create your free account and start sharing your perspective today.
            </p>
            <Link 
              to="/signup"
              className="inline-flex items-center gap-2 px-10 py-5 bg-white text-black font-black rounded-full hover:bg-gray-100 transition-colors text-lg"
            >
              Sign up free
              <ChevronRight className="w-6 h-6" />
            </Link>
          </section>
        )}
      </div>
    </div>
  );
}

export default HomePage;