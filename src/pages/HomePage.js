import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { fetchWithRetry, getCachedData, setCachedData } from '../utils/apiUtils';
import { useUser } from '../context/UserContext';
import { ChevronRight, ChevronLeft, Flame, Award, Users, TrendingUp, Eye, MessageSquare, Calendar, Star, Zap, ArrowRight, Briefcase, DollarSign, Trophy, Pizza, Plane, Laptop, Heart, Film, Microscope, Globe } from 'lucide-react';

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
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-28">
            <div className="max-w-4xl">
              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 bg-white border border-gray-300 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-sm mb-6 sm:mb-8 animate-fade-in">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-700 font-semibold text-xs sm:text-sm">{activeDebates.length} Active Debates</span>
              </div>
              
              {/* Main Headline */}
              <h1 className="mb-4 sm:mb-6 animate-slide-up">
                <div className="text-gray-900 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-2">
                  The Premier Platform
                </div>
                <div className="text-gray-900 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                  for Intellectual
                </div>
                <div className="text-orange-600 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                  Discourse
                </div>
              </h1>
              
              {/* Subheadline */}
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-6 sm:mb-8 lg:mb-10 leading-relaxed max-w-3xl animate-slide-up-delay">
                Join industry experts, academics, and thought leaders in rigorous, evidence-based debates on the issues shaping our world.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12 animate-slide-up-delay-2">
                <Link 
                  to="/browse" 
                  className="group inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-bold text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Explore Debates
                  <ChevronRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link 
                  to="/signup" 
                  className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-bold text-gray-900 bg-white border-2 border-gray-900 rounded-xl hover:bg-gray-50 transition-all duration-200 transform hover:scale-105"
                >
                  Create Account
                </Link>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4 sm:gap-8 text-xs sm:text-sm text-gray-600 animate-fade-in-delay">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Award className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" strokeWidth={2.5} />
                  </div>
                  <span className="font-semibold">Editorial Review Process</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" strokeWidth={2.5} />
                  </div>
                  <span className="font-semibold">Expert Community</span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="mt-12 sm:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 animate-slide-up-delay-3">
              <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <Award className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" strokeWidth={2.5} />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-gray-900 mb-1">{certifiedArticles.length}</div>
                <div className="text-xs sm:text-sm text-gray-600 font-semibold">Certified Articles</div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" strokeWidth={2.5} />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-gray-900 mb-1">Active</div>
                <div className="text-xs sm:text-sm text-gray-600 font-semibold">Ongoing Debates</div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" strokeWidth={2.5} />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-gray-900 mb-1">15K+</div>
                <div className="text-xs sm:text-sm text-gray-600 font-semibold">Monthly Readers</div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" strokeWidth={2.5} />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-gray-900 mb-1">24/7</div>
                <div className="text-xs sm:text-sm text-gray-600 font-semibold">Platform Access</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Welcome message for logged-in users */}
        {user && (
          <div className="mb-8 sm:mb-12 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-3 sm:mb-4">
              Welcome back, <span className="bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">{user.display_name}</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 font-medium">What will you debate today?</p>
          </div>
        )}

        {/* Active Debates Section */}
        {activeDebates.length > 0 && (
          <section className="mb-12 sm:mb-16">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                  <Flame className="w-5 h-5 sm:w-7 sm:h-7 text-white" strokeWidth={2.5} />
                </div>
                <span className="hidden sm:inline">Active Debates</span>
                <span className="sm:hidden">Debates</span>
              </h2>
              <Link to="/browse" className="hidden sm:flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gray-900 text-white font-bold text-xs sm:text-sm rounded-xl hover:bg-gray-800 transition-all duration-200 transform hover:scale-105">
                Browse
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {activeDebates.map((debate, index) => (
                <Link 
                  key={debate.id}
                  to={`/debate-topics/${debate.id}`}
                  className="group bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-orange-500 transform hover:scale-105 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                      <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-black text-gray-900 mb-1 sm:mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                        {debate.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{debate.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-gray-500 flex items-center gap-1 sm:gap-2 font-semibold">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4" strokeWidth={2.5} />
                      {debate.opinions_count} opinions
                    </span>
                    <span className="text-orange-600 font-black flex items-center gap-1 group-hover:gap-2 transition-all">
                      Join <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            <Link to="/browse" className="sm:hidden flex items-center justify-center gap-2 mt-4 px-6 py-3 bg-gray-900 text-white font-bold text-sm rounded-xl hover:bg-gray-800 transition-all w-full">
              Browse All
              <ChevronRight className="w-4 h-4" />
            </Link>
          </section>
        )}

        {/* Editorial Picks Section with Horizontal Scroll */}
        {certifiedArticles.length > 0 && (
          <section className="mb-12 sm:mb-16">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                  <Award className="w-5 h-5 sm:w-7 sm:h-7 text-white" strokeWidth={2.5} />
                </div>
                <span className="hidden sm:inline">Editorial Picks</span>
                <span className="sm:hidden">Certified</span>
              </h2>
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => scroll(certifiedScrollRef, 'left')}
                  className="p-2 bg-white border-2 border-gray-900 rounded-lg hover:bg-gray-900 hover:text-white transition-all"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scroll(certifiedScrollRef, 'right')}
                  className="p-2 bg-white border-2 border-gray-900 rounded-lg hover:bg-gray-900 hover:text-white transition-all"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="relative">
              <div ref={certifiedScrollRef} className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide scroll-smooth">
                <div className="flex gap-4 sm:gap-6" style={{ minWidth: 'min-content' }}>
                  {certifiedArticles.map((article, index) => (
                    <button
                      key={article.id}
                      onClick={() => handleArticleClick(article.id)}
                      className="group bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300 border-2 border-orange-200 hover:border-orange-500 flex-shrink-0 transform hover:scale-105 animate-fade-in-up text-left"
                      style={{ width: '280px', animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-orange-600 rounded-lg flex items-center justify-center shadow-md">
                          <Award className="w-4 h-4 sm:w-5 sm:h-5 text-white" strokeWidth={3} />
                        </div>
                        <span className="text-xs font-black text-orange-600 uppercase tracking-wider">Certified</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-gray-900 mb-3 group-hover:text-orange-600 transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-3 font-semibold">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4" strokeWidth={2.5} />
                          {formatNumber(article.views)}
                        </span>
                        <span className="truncate">by {article.display_name}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-3">
                        {truncateText(article.content.replace(/<[^>]*>/g, ''), 120)}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Popular Users Section with Horizontal Scroll */}
        {topUsers.length > 0 && (
          <section className="mb-12 sm:mb-16">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-5 h-5 sm:w-7 sm:h-7 text-white" strokeWidth={2.5} />
                </div>
                <span className="hidden sm:inline">Popular Voices</span>
                <span className="sm:hidden">Top Users</span>
              </h2>
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => scroll(usersScrollRef, 'left')}
                  className="p-2 bg-white border-2 border-gray-900 rounded-lg hover:bg-gray-900 hover:text-white transition-all"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scroll(usersScrollRef, 'right')}
                  className="p-2 bg-white border-2 border-gray-900 rounded-lg hover:bg-gray-900 hover:text-white transition-all"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="relative">
              <div ref={usersScrollRef} className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide scroll-smooth">
                <div className="flex gap-3 sm:gap-4" style={{ minWidth: 'min-content' }}>
                  {topUsers.map((topUser, index) => (
                    <Link 
                      key={index}
                      to={`/user/${encodeURIComponent(topUser.display_name)}`}
                      className="group bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-purple-500 flex-shrink-0 text-center transform hover:scale-105 animate-fade-in-up"
                      style={{ width: '160px', animationDelay: `${index * 100}ms` }}
                    >
                      <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl sm:text-2xl font-black shadow-lg">
                        {topUser.display_name.charAt(0).toUpperCase()}
                      </div>
                      <h3 className="text-sm sm:text-base font-black text-gray-900 mb-2 group-hover:text-purple-600 transition-colors truncate">
                        {topUser.display_name}
                      </h3>
                      <div className="flex flex-col gap-1 text-xs text-gray-600 font-semibold">
                        <span className="flex items-center justify-center gap-1">
                          <Eye className="w-3 h-3" strokeWidth={2.5} />
                          {formatNumber(topUser.totalViews)}
                        </span>
                        <span className="text-gray-500">{topUser.articleCount} articles</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Articles by Topic Sections with Horizontal Scroll */}
        {Object.keys(articlesByTopic).length > 0 && (
          <div className="space-y-12 sm:space-y-16">
            {Object.entries(articlesByTopic)
              .sort(([, articlesA], [, articlesB]) => {
                const totalViewsA = articlesA.reduce((sum, a) => sum + a.views, 0);
                const totalViewsB = articlesB.reduce((sum, b) => sum + b.views, 0);
                return totalViewsB - totalViewsA;
              })
              .map(([topic, articles]) => (
                <section key={topic}>
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 flex items-center gap-2 sm:gap-3">
                      <span className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-xl sm:rounded-2xl flex items-center justify-center">
                        {getTopicIcon(topic)}
                      </span>
                      <span className="hidden sm:inline">{topic}</span>
                      <span className="sm:hidden text-xl">{topic}</span>
                    </h2>
                    <div className="flex items-center gap-2">
                      <div className="hidden sm:flex items-center gap-2">
                        <button
                          onClick={() => scroll(topicScrollRefs.current[topic], 'left')}
                          className="p-2 bg-white border-2 border-gray-900 rounded-lg hover:bg-gray-900 hover:text-white transition-all"
                          aria-label="Scroll left"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => scroll(topicScrollRefs.current[topic], 'right')}
                          className="p-2 bg-white border-2 border-gray-900 rounded-lg hover:bg-gray-900 hover:text-white transition-all"
                          aria-label="Scroll right"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                      <Link to={`/browse?topic=${topic}`} className="hidden md:flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gray-900 text-white font-bold text-xs sm:text-sm rounded-xl hover:bg-gray-800 transition-all duration-200 transform hover:scale-105">
                        Browse <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Link>
                    </div>
                  </div>
                  <div className="relative">
                    <div 
                      ref={el => topicScrollRefs.current[topic] = el}
                      className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide scroll-smooth"
                    >
                      <div className="flex gap-4 sm:gap-6" style={{ minWidth: 'min-content' }}>
                        {articles.slice(0, 8).map((article, index) => (
                          <button
                            key={article.id}
                            onClick={() => handleArticleClick(article.id)}
                            className="group bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-orange-500 flex-shrink-0 transform hover:scale-105 animate-fade-in-up text-left"
                            style={{ width: '280px', animationDelay: `${index * 50}ms` }}
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
                            <h3 className="text-base sm:text-lg font-black text-gray-900 mb-3 group-hover:text-orange-600 transition-colors line-clamp-2">
                              {article.title}
                            </h3>
                            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-3 font-semibold">
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3 sm:w-4 sm:h-4" strokeWidth={2.5} />
                                {formatNumber(article.views)}
                              </span>
                              <span className="truncate">by {article.display_name}</span>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-600 line-clamp-3">
                              {truncateText(article.content.replace(/<[^>]*>/g, ''), 120)}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              ))}
          </div>
        )}

        {/* Bottom CTA for non-logged users */}
        {!user && (
          <section className="mt-16 sm:mt-20 text-center py-12 sm:py-16 md:py-20 bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl sm:rounded-3xl border-2 border-orange-200 animate-fade-in px-4">
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg animate-bounce-slow">
                <Zap className="w-7 h-7 sm:w-10 sm:h-10 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4 sm:mb-6">
              Ready to join the conversation?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-10 max-w-2xl mx-auto font-medium">
              Create your free account and start sharing your perspective today.
            </p>
            <Link 
              to="/signup"
              className="inline-flex items-center gap-2 px-8 sm:px-10 py-4 sm:py-5 bg-gray-900 text-white font-black rounded-xl hover:bg-gray-800 transition-all duration-200 text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Sign up free
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
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

        .scroll-smooth {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
}

export default HomePage;