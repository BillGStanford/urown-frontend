import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { fetchWithRetry, getCachedData, setCachedData } from '../utils/apiUtils';
import { useUser } from '../context/UserContext';
import { ChevronRight, ChevronLeft, Flame, Award, Users, TrendingUp, Eye, MessageSquare, Calendar, Star, Zap, ArrowRight, Briefcase, DollarSign, Trophy, Pizza, Plane, Laptop, Heart, Film, Microscope, Globe, Sparkles, Clock, BarChart3 } from 'lucide-react';
import RedFlaggedBanner from '../components/RedFlaggedBanner';

function HomePage() {
  const [activeDebates, setActiveDebates] = useState([]);
  const [certifiedArticles, setCertifiedArticles] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [articlesByTopic, setArticlesByTopic] = useState({});
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const navigate = useNavigate();
  
  // Refs for scroll containers
  const certifiedScrollRef = useRef(null);
  const usersScrollRef = useRef(null);
  const topicScrollRefs = useRef({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch debate topics
        const debatesResponse = await fetchWithRetry(() => axios.get('/debate-topics'));
        setActiveDebates(debatesResponse.data.topics || []);
        
        // Fetch certified articles - NO LIMIT to show all
        const certifiedResponse = await fetchWithRetry(() => 
          axios.get('/articles', { params: { certified: 'true' } })
        );
        const certifiedData = certifiedResponse.data.articles || [];
        console.log('Certified articles fetched:', certifiedData.length);
        console.log('Certified article IDs:', certifiedData.map(a => a.id));
        setCertifiedArticles(certifiedData);
        
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
      'Politics': Globe,
      'Business': Briefcase,
      'Finance': DollarSign,
      'Sports': Trophy,
      'Food': Pizza,
      'Travel': Plane,
      'Technology': Laptop,
      'Health': Heart,
      'Entertainment': Film,
      'Science': Microscope,
      'Environment': Globe
    };
    
    const IconComponent = iconMap[topic] || MessageSquare;
    return <IconComponent className="w-6 h-6" strokeWidth={2.5} />;
  };

  // Scroll functions
  const scroll = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = 340; // Card width + gap
      const newScrollPosition = ref.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      ref.current.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      });
    }
  };

  // Handle article click - navigate to article page
  const handleArticleClick = (articleId) => {
    navigate(`/article/${articleId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-900 text-xl font-bold">Loading amazing content...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section - Only for non-logged users */}
      {!user && (
        <div className="relative overflow-hidden bg-white border-b border-gray-200">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50/80 via-white to-pink-50/30"></div>
          
          {/* Floating decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200/20 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl animate-float-delayed"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-28">
            <div className="max-w-4xl">
              {/* Status Badge with enhanced animation */}
              <div className="inline-flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-xl shadow-lg mb-8 animate-fade-in backdrop-blur-sm">
                <div className="relative">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                </div>
                <span className="text-gray-700 font-bold text-sm">{activeDebates.length} Active Debates • Live Now</span>
              </div>
              
              {/* Main Headline with enhanced styling */}
              <h1 className="mb-6 animate-slide-up">
                <div className="text-gray-900 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-2">
                  The Premier Platform
                </div>
                <div className="text-gray-900 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-2">
                  for Intellectual
                </div>
                <div className="relative inline-block">
                  <div className="text-orange-600 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight">
                    Discourse
                  </div>
                  <div className="absolute -bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-orange-400 to-pink-400 opacity-30 blur-sm"></div>
                </div>
              </h1>
              
              {/* Subheadline with better spacing */}
              <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed max-w-3xl animate-slide-up-delay">
                Join industry experts, academics, and thought leaders in rigorous, evidence-based debates on the issues shaping our world.
              </p>
              
              {/* CTA Buttons with enhanced hover effects */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-slide-up-delay-2">
                <Link 
                  to="/browse" 
                  className="group inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                >
                  <Sparkles className="mr-2 w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Explore Debates
                  <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link 
                  to="/signup" 
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-gray-900 bg-white border-2 border-gray-900 rounded-xl hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Create Account
                </Link>
              </div>
              
              {/* Trust Indicators with enhanced icons */}
              <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-6 text-sm text-gray-600 animate-fade-in-delay">
                <div className="flex items-center gap-3 group">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                    <Award className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                  <span className="font-bold text-gray-800">Editorial Review Process</span>
                </div>
                <div className="flex items-center gap-3 group">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                    <Users className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                  <span className="font-bold text-gray-800">Expert Community</span>
                </div>
                <div className="flex items-center gap-3 group">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                    <BarChart3 className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                  <span className="font-bold text-gray-800">Data-Driven Insights</span>
                </div>
              </div>
            </div>

            {/* Enhanced Stats Grid */}
            <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 animate-slide-up-delay-3">
              <div className="bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <Award className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
                <div className="text-3xl font-black text-gray-900 mb-1">{certifiedArticles.length}</div>
                <div className="text-sm text-gray-600 font-bold">Certified Articles</div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <MessageSquare className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
                <div className="text-3xl font-black text-gray-900 mb-1">Active</div>
                <div className="text-sm text-gray-600 font-bold">Ongoing Debates</div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <Users className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
                <div className="text-3xl font-black text-gray-900 mb-1">15K+</div>
                <div className="text-sm text-gray-600 font-bold">Monthly Readers</div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <Clock className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
                <div className="text-3xl font-black text-gray-900 mb-1">24/7</div>
                <div className="text-sm text-gray-600 font-bold">Platform Access</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Enhanced welcome message for logged-in users */}
        {user && (
          <div className="mb-12 animate-fade-in relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-100 to-pink-100 rounded-3xl blur-2xl opacity-30"></div>
            <div className="relative bg-white/50 backdrop-blur-sm border-2 border-gray-200 rounded-3xl p-8 shadow-xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg">
                  {user.display_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-4xl font-black text-gray-900 mb-2">
                    Welcome back, <span className="bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">{user.display_name}</span>
                  </h1>
                  <p className="text-xl text-gray-600 font-semibold">What will you debate today?</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Debates Section - Enhanced */}
        {activeDebates.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-xl">
                    <Flame className="w-8 h-8 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                </div>
                <h2 className="text-4xl font-black text-gray-900">
                  Active Debates
                </h2>
              </div>
              <Link to="/browse" className="hidden sm:flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-bold text-sm rounded-xl hover:bg-gray-800 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl">
                Browse All
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeDebates.map((debate, index) => (
                <Link 
                  key={debate.id}
                  to={`/debate/${debate.id}`}
                  className="group relative bg-white rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 hover:border-orange-500 transform hover:scale-105 hover:-translate-y-1 animate-fade-in-up overflow-hidden"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100 to-pink-100 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
                  
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-xl transition-shadow">
                      <MessageSquare className="w-6 h-6 text-white" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-black text-gray-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                        {debate.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{debate.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm pt-4 border-t border-gray-100">
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
          </section>
        )}

        {/* Editorial Picks Section - Enhanced */}
        {certifiedArticles.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl">
                  <Award className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>
                <h2 className="text-4xl font-black text-gray-900">Editorial Picks</h2>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => scroll(certifiedScrollRef, 'left')}
                  className="p-3 bg-white border-2 border-gray-900 rounded-xl hover:bg-gray-900 hover:text-white transition-all shadow-md hover:shadow-lg"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scroll(certifiedScrollRef, 'right')}
                  className="p-3 bg-white border-2 border-gray-900 rounded-xl hover:bg-gray-900 hover:text-white transition-all shadow-md hover:shadow-lg"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="relative">
              <div ref={certifiedScrollRef} className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide scroll-smooth">
                <div className="flex gap-6" style={{ minWidth: 'min-content' }}>
                  {certifiedArticles.map((article, index) => (
                    <button
                      key={article.id}
                      onClick={() => handleArticleClick(article.id)}
                      className="group relative bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 border-2 border-orange-200 hover:border-orange-500 flex-shrink-0 transform hover:scale-105 hover:-translate-y-1 animate-fade-in-up text-left overflow-hidden"
                      style={{ width: '320px', animationDelay: `${index * 100}ms` }}
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-200 to-yellow-200 rounded-full blur-2xl opacity-50"></div>
                      
                      <div className="relative">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-700 rounded-lg flex items-center justify-center shadow-lg">
                            <Award className="w-5 h-5 text-white" strokeWidth={3} />
                          </div>
                          <span className="text-xs font-black text-orange-600 uppercase tracking-wider bg-white px-3 py-1 rounded-full">Certified</span>
                        </div>
                        <h3 className="text-lg font-black text-gray-900 mb-3 group-hover:text-orange-600 transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3 font-semibold">
                          <span className="flex items-center gap-1.5">
                            <Eye className="w-4 h-4" strokeWidth={2.5} />
                            {formatNumber(article.views)}
                          </span>
                          <span className="truncate">by {article.display_name}</span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                          {truncateText(article.content.replace(/<[^>]*>/g, ''), 120)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Popular Users Section - Enhanced */}
        {topUsers.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl">
                  <TrendingUp className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>
                <h2 className="text-4xl font-black text-gray-900">Popular Voices</h2>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => scroll(usersScrollRef, 'left')}
                  className="p-3 bg-white border-2 border-gray-900 rounded-xl hover:bg-gray-900 hover:text-white transition-all shadow-md hover:shadow-lg"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scroll(usersScrollRef, 'right')}
                  className="p-3 bg-white border-2 border-gray-900 rounded-xl hover:bg-gray-900 hover:text-white transition-all shadow-md hover:shadow-lg"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="relative">
              <div ref={usersScrollRef} className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide scroll-smooth">
                <div className="flex gap-4" style={{ minWidth: 'min-content' }}>
                  {topUsers.map((topUser, index) => (
                    <Link 
                      key={index}
                      to={`/user/${encodeURIComponent(topUser.display_name)}`}
                      className="group relative bg-white rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 hover:border-purple-500 flex-shrink-0 text-center transform hover:scale-105 hover:-translate-y-1 animate-fade-in-up overflow-hidden"
                      style={{ width: '180px', animationDelay: `${index * 100}ms` }}
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      
                      <div className="relative">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-black shadow-xl group-hover:shadow-2xl transition-shadow">
                          {topUser.display_name.charAt(0).toUpperCase()}
                        </div>
                        <h3 className="text-base font-black text-gray-900 mb-3 group-hover:text-purple-600 transition-colors truncate">
                          {topUser.display_name}
                        </h3>
                        <div className="flex flex-col gap-2 text-xs text-gray-600 font-semibold">
                          <div className="flex items-center justify-center gap-1.5 bg-gray-50 rounded-lg py-2">
                            <Eye className="w-3.5 h-3.5" strokeWidth={2.5} />
                            <span className="font-black text-gray-900">{formatNumber(topUser.totalViews)}</span>
                          </div>
                          <span className="text-gray-500">{topUser.articleCount} articles</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* RedFlagged Banner */}
        <RedFlaggedBanner />

        {/* Articles by Topic Sections - Enhanced */}
        {Object.keys(articlesByTopic).length > 0 && (
          <div className="space-y-16 mt-16">
            {Object.entries(articlesByTopic)
              .sort(([, articlesA], [, articlesB]) => {
                const totalViewsA = articlesA.reduce((sum, a) => sum + a.views, 0);
                const totalViewsB = articlesB.reduce((sum, b) => sum + b.views, 0);
                return totalViewsB - totalViewsA;
              })
              .map(([topic, articles]) => (
                <section key={topic}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center shadow-lg">
                        {getTopicIcon(topic)}
                      </div>
                      <h2 className="text-4xl font-black text-gray-900">{topic}</h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="hidden sm:flex items-center gap-2">
                        <button
                          onClick={() => scroll(topicScrollRefs.current[topic], 'left')}
                          className="p-3 bg-white border-2 border-gray-900 rounded-xl hover:bg-gray-900 hover:text-white transition-all shadow-md hover:shadow-lg"
                          aria-label="Scroll left"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => scroll(topicScrollRefs.current[topic], 'right')}
                          className="p-3 bg-white border-2 border-gray-900 rounded-xl hover:bg-gray-900 hover:text-white transition-all shadow-md hover:shadow-lg"
                          aria-label="Scroll right"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                      <Link to={`/browse?topic=${topic}`} className="hidden md:flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-bold text-sm rounded-xl hover:bg-gray-800 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl">
                        Browse <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                  <div className="relative">
                    <div 
                      ref={el => topicScrollRefs.current[topic] = el}
                      className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide scroll-smooth"
                    >
                      <div className="flex gap-6" style={{ minWidth: 'min-content' }}>
                        {articles.slice(0, 8).map((article, index) => (
                          <button
                            key={article.id}
                            onClick={() => handleArticleClick(article.id)}
                            className="group relative bg-white rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 hover:border-orange-500 flex-shrink-0 transform hover:scale-105 hover:-translate-y-1 animate-fade-in-up text-left overflow-hidden"
                            style={{ width: '320px', animationDelay: `${index * 50}ms` }}
                          >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-50 to-pink-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            
                            <div className="relative">
                              <div className="flex items-center gap-2 mb-4 flex-wrap">
                                {article.certified && (
                                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-100 to-orange-200 text-orange-700 text-xs font-black rounded-lg shadow-sm">
                                    <Award className="w-3.5 h-3.5" strokeWidth={2.5} />
                                    Certified
                                  </div>
                                )}
                                {article.topics && article.topics.slice(0, 2).map(t => (
                                  <span key={t} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors">
                                    {t}
                                  </span>
                                ))}
                              </div>
                              <h3 className="text-lg font-black text-gray-900 mb-3 group-hover:text-orange-600 transition-colors line-clamp-2">
                                {article.title}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3 font-semibold">
                                <span className="flex items-center gap-1.5">
                                  <Eye className="w-4 h-4" strokeWidth={2.5} />
                                  {formatNumber(article.views)}
                                </span>
                                <span className="truncate">by {article.display_name}</span>
                              </div>
                              <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                                {truncateText(article.content.replace(/<[^>]*>/g, ''), 120)}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              ))}
          </div>
        )}

        {/* Bottom CTA for non-logged users - Enhanced */}
        {!user && (
          <section className="mt-20 text-center py-20 bg-gradient-to-br from-orange-50 via-pink-50 to-yellow-50 rounded-3xl border-2 border-orange-200 animate-fade-in px-4 relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-10 left-10 w-64 h-64 bg-orange-300/30 rounded-full blur-3xl animate-float"></div>
              <div className="absolute bottom-10 right-10 w-80 h-80 bg-pink-300/30 rounded-full blur-3xl animate-float-delayed"></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl animate-bounce-slow">
                    <Zap className="w-12 h-12 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-ping"></div>
                </div>
              </div>
              <h2 className="text-5xl font-black text-gray-900 mb-6">
                Ready to join the conversation?
              </h2>
              <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto font-semibold leading-relaxed">
                Create your free account and start sharing your perspective today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link 
                  to="/signup"
                  className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-gray-900 to-gray-800 text-white font-black rounded-xl hover:shadow-2xl transition-all duration-300 text-lg transform hover:scale-105 hover:-translate-y-1"
                >
                  <Sparkles className="w-6 h-6" />
                  Sign up free
                  <ChevronRight className="w-6 h-6" />
                </Link>
                <Link 
                  to="/browse"
                  className="inline-flex items-center gap-2 px-8 py-5 bg-white text-gray-900 font-bold rounded-xl border-2 border-gray-900 hover:bg-gray-50 transition-all duration-300 text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Explore First
                </Link>
              </div>
            </div>
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
            transform: translateY(30px);
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
            transform: translateY(-15px);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(20px, -20px) scale(1.05);
          }
        }

        @keyframes float-delayed {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-20px, 20px) scale(1.05);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-fade-in-delay {
          animation: fade-in 0.6s ease-out 0.3s both;
        }

        .animate-slide-up {
          animation: slide-up 0.7s ease-out;
        }

        .animate-slide-up-delay {
          animation: slide-up 0.7s ease-out 0.2s both;
        }

        .animate-slide-up-delay-2 {
          animation: slide-up 0.7s ease-out 0.4s both;
        }

        .animate-slide-up-delay-3 {
          animation: slide-up 0.7s ease-out 0.6s both;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out both;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2.5s ease-in-out infinite;
        }

        .animate-float {
          animation: float 8s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }

        .scroll-smooth {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
}

export default HomePage;