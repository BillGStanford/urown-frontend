import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { fetchWithRetry, getCachedData, setCachedData } from '../utils/apiUtils';
import { useUser } from '../context/UserContext';
import { ChevronRight, Flame, Award, Users, TrendingUp, Eye, MessageSquare, Calendar, Star, Zap, ArrowRight } from 'lucide-react';

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
        
        // Fetch certified articles - remove limit to get all
        const certifiedResponse = await fetchWithRetry(() => 
          axios.get('/articles', { params: { certified: 'true' } })
        );
        setCertifiedArticles(certifiedResponse.data.articles || []);
        
        // Fetch all articles
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
        
        // Calculate top users from articles
        const userStats = {};
        allArticles.forEach(article => {
          if (!userStats[article.display_name]) {
            userStats[article.display_name] = {
              display_name: article.display_name,
              totalViews: 0,
              articleCount: 0
            };
          }
          userStats[article.display_name].totalViews += article.views || 0;
          userStats[article.display_name].articleCount += 1;
        });
        
        // Convert to array and sort by total views
        const topUsersArray = Object.values(userStats)
          .sort((a, b) => b.totalViews - a.totalViews)
          .slice(0, 10);
        
        setTopUsers(topUsersArray);
        
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

  const getTopicIcon = (topic) => {
    const iconMap = {
      'Politics': Users,
      'Business': TrendingUp,
      'Finance': TrendingUp,
      'Sports': Award,
      'Food': Star,
      'Travel': Star,
      'Technology': Zap,
      'Health': Star,
      'Entertainment': Star,
      'Science': Zap,
      'Environment': Star
    };
    const IconComponent = iconMap[topic] || MessageSquare;
    return <IconComponent className="w-8 h-8 text-orange-600" strokeWidth={2.5} />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-900 text-xl font-bold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Only for non-logged users */}
      {!user && (
        <div className="relative overflow-hidden bg-white border-b border-gray-200">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-white"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
            <div className="max-w-4xl">
              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg shadow-sm mb-8 animate-fade-in">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-700 font-semibold text-sm">{activeDebates.length} Active Debates</span>
              </div>
              
              {/* Main Headline */}
              <h1 className="mb-6 animate-slide-up">
                <div className="text-gray-900 text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-2">
                  The Premier Platform
                </div>
                <div className="text-gray-900 text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                  for Intellectual
                </div>
                <div className="text-orange-600 text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                  Discourse
                </div>
              </h1>
              
              {/* Subheadline */}
              <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed max-w-3xl animate-slide-up-delay">
                Join industry experts, academics, and thought leaders in rigorous, evidence-based debates on the issues shaping our world.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-slide-up-delay-2">
                <Link 
                  to="/browse" 
                  className="group inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Explore Debates
                  <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link 
                  to="/signup" 
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-gray-900 bg-white border-2 border-gray-900 rounded-xl hover:bg-gray-50 transition-all duration-200 transform hover:scale-105"
                >
                  Create Account
                </Link>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-8 text-sm text-gray-600 animate-fade-in-delay">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-orange-600" strokeWidth={2.5} />
                  </div>
                  <span className="font-semibold">Editorial Review Process</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-orange-600" strokeWidth={2.5} />
                  </div>
                  <span className="font-semibold">Expert Community</span>
                </div>
              </div>
            </div>

            {/* Stats Grid - Right Side */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 animate-slide-up-delay-3">
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-orange-600" strokeWidth={2.5} />
                </div>
                <div className="text-3xl font-black text-gray-900 mb-1">{certifiedArticles.length}</div>
                <div className="text-sm text-gray-600 font-semibold">Certified Articles</div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 text-orange-600" strokeWidth={2.5} />
                </div>
                <div className="text-3xl font-black text-gray-900 mb-1">Active</div>
                <div className="text-sm text-gray-600 font-semibold">Ongoing Debates</div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-orange-600" strokeWidth={2.5} />
                </div>
                <div className="text-3xl font-black text-gray-900 mb-1">15K+</div>
                <div className="text-sm text-gray-600 font-semibold">Monthly Readers</div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-orange-600" strokeWidth={2.5} />
                </div>
                <div className="text-3xl font-black text-gray-900 mb-1">24/7</div>
                <div className="text-sm text-gray-600 font-semibold">Platform Access</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Welcome message for logged-in users */}
        {user && (
          <div className="mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Welcome back, <span className="bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">{user.display_name}</span>
            </h1>
            <p className="text-xl text-gray-600 font-medium">What will you debate today?</p>
          </div>
        )}

        {/* Active Debates Section */}
        {activeDebates.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Flame className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
                Active Debates
              </h2>
              <Link to="/browse" className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white font-bold text-sm rounded-xl hover:bg-gray-800 transition-all duration-200 transform hover:scale-105">
                Browse
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
              <div className="flex gap-6" style={{ minWidth: 'min-content' }}>
                {activeDebates.map((debate, index) => (
                  <Link 
                    key={debate.id}
                    to={`/debate-topics/${debate.id}`}
                    className="group bg-white rounded-2xl p-6 hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-orange-500 flex-shrink-0 transform hover:scale-105 animate-fade-in-up"
                    style={{ width: '320px', animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                        <MessageSquare className="w-6 h-6 text-white" strokeWidth={2.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-black text-gray-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                          {debate.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{debate.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-2 font-semibold">
                        <Users className="w-4 h-4" strokeWidth={2.5} />
                        {debate.opinions_count} opinions
                      </span>
                      <span className="text-orange-600 font-black flex items-center gap-1 group-hover:gap-2 transition-all">
                        Join <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Editorial Picks Section */}
        {certifiedArticles.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Award className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
                Editorial Picks
              </h2>
            </div>
            <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
              <div className="flex gap-6" style={{ minWidth: 'min-content' }}>
                {certifiedArticles.map((article, index) => (
                  <Link 
                    key={article.id}
                    to={`/articles/${article.id}`}
                    className="group bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 border-2 border-orange-200 hover:border-orange-500 flex-shrink-0 transform hover:scale-105 animate-fade-in-up"
                    style={{ width: '320px', animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center shadow-md">
                        <Award className="w-5 h-5 text-white" strokeWidth={3} />
                      </div>
                      <span className="text-xs font-black text-orange-600 uppercase tracking-wider">Certified</span>
                    </div>
                    <h3 className="text-lg font-black text-gray-900 mb-3 group-hover:text-orange-600 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3 font-semibold">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" strokeWidth={2.5} />
                        {formatNumber(article.views)}
                      </span>
                      <span>by {article.display_name}</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-3">
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
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
                Popular Voices
              </h2>
            </div>
            <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
              <div className="flex gap-4" style={{ minWidth: 'min-content' }}>
                {topUsers.map((topUser, index) => (
                  <Link 
                    key={index}
                    to={`/user/${encodeURIComponent(topUser.display_name)}`}
                    className="group bg-white rounded-2xl p-6 hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-purple-500 flex-shrink-0 text-center transform hover:scale-105 animate-fade-in-up"
                    style={{ width: '200px', animationDelay: `${index * 100}ms` }}
                  >
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-black shadow-lg">
                      {topUser.display_name.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="text-lg font-black text-gray-900 mb-2 group-hover:text-purple-600 transition-colors truncate">
                      {topUser.display_name}
                    </h3>
                    <div className="flex flex-col gap-1 text-xs text-gray-600 font-semibold">
                      <span className="flex items-center justify-center gap-1">
                        <Eye className="w-3 h-3" strokeWidth={2.5} />
                        {formatNumber(topUser.totalViews)} views
                      </span>
                      <span className="text-gray-500">{topUser.articleCount} articles</span>
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
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 flex items-center gap-3">
                      {getTopicIcon(topic)}
                      {topic}
                    </h2>
                    <Link to={`/browse?topic=${encodeURIComponent(topic)}`} className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white font-bold text-sm rounded-xl hover:bg-gray-800 transition-all duration-200 transform hover:scale-105">
                      Browse <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                    <div className="flex gap-6" style={{ minWidth: 'min-content' }}>
                      {articles.slice(0, 8).map((article, index) => (
                        <Link 
                          key={article.id}
                          to={`/articles/${article.id}`}
                          className="group bg-white rounded-2xl p-6 hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-orange-500 flex-shrink-0 transform hover:scale-105 animate-fade-in-up"
                          style={{ width: '320px', animationDelay: `${index * 50}ms` }}
                        >
                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            {article.certified && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-600 text-xs font-black rounded-md">
                                <Award className="w-3 h-3" strokeWidth={2.5} />
                                Certified
                              </div>
                            )}
                            {article.topics && article.topics.slice(0, 2).map(t => (
                              <span key={t} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-md">
                                {t}
                              </span>
                            ))}
                          </div>
                          <h3 className="text-lg font-black text-gray-900 mb-3 group-hover:text-orange-600 transition-colors line-clamp-2">
                            {article.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3 font-semibold">
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" strokeWidth={2.5} />
                              {formatNumber(article.views)}
                            </span>
                            <span>by {article.display_name}</span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-3">
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
          <section className="mt-20 text-center py-20 bg-gradient-to-br from-orange-50 to-pink-50 rounded-3xl border-2 border-orange-200 animate-fade-in">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg animate-bounce-slow">
                <Zap className="w-10 h-10 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              Ready to join the conversation?
            </h2>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto font-medium">
              Create your free account and start sharing your perspective today.
            </p>
            <Link 
              to="/signup"
              className="inline-flex items-center gap-2 px-10 py-5 bg-gray-900 text-white font-black rounded-xl hover:bg-gray-800 transition-all duration-200 text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Sign up free
              <ChevronRight className="w-6 h-6" />
            </Link>
          </section>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-fade-in-delay {
          animation: fade-in 0.6s ease-out 0.3s both;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }

        .animate-slide-up-delay {
          animation: slide-up 0.6s ease-out 0.2s both;
        }

        .animate-slide-up-delay-2 {
          animation: slide-up 0.6s ease-out 0.4s both;
        }

        .animate-slide-up-delay-3 {
          animation: slide-up 0.6s ease-out 0.6s both;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out both;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default HomePage;