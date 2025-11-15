// src/pages/HomePage.js
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { fetchWithRetry, getCachedData, setCachedData } from '../utils/apiUtils';
import { useUser } from '../context/UserContext';
import RedFlaggedBanner from '../components/RedFlaggedBanner';
import { ChevronRight, ChevronLeft, Flame, Award, Users, TrendingUp, Eye, MessageSquare, Calendar, Star, Zap, ArrowRight, Briefcase, DollarSign, Trophy, Pizza, Plane, Laptop, Heart, Film, Microscope, Globe, Filter, Bookmark, Share2, ThumbsUp, MessageCircle, Repeat2, BarChart3, User, Hash, Clock, X, Home, Search, PenTool, UserPlus, Menu } from 'lucide-react';

function HomePage() {
  const [activeDebates, setActiveDebates] = useState([]);
  const [certifiedArticles, setCertifiedArticles] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [dailyFeed, setDailyFeed] = useState([]);
  const [topLeaders, setTopLeaders] = useState([]);
  const [redFlaggedContent, setRedFlaggedContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('trending');
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const { user } = useUser();
  const navigate = useNavigate();
  
  // Refs for scroll containers
  const certifiedScrollRef = useRef(null);
  const usersScrollRef = useRef(null);
  const dailyFeedScrollRef = useRef(null);

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
        
        // Fetch RedFlagged content
        try {
          const redFlaggedResponse = await fetchWithRetry(() => axios.get('/redflagged'));
          setRedFlaggedContent(redFlaggedResponse.data.articles || []);
        } catch (err) {
          console.error('Error fetching RedFlagged content:', err);
          setRedFlaggedContent([]);
        }
        
        // Extract unique topics from articles
        const uniqueTopics = new Set();
        allArticles.forEach(article => {
          if (article.topics && article.topics.length > 0) {
            article.topics.forEach(topic => uniqueTopics.add(topic));
          }
        });
        setTopics(Array.from(uniqueTopics));
        
        // Calculate top users from articles
        const userStats = {};
        allArticles.forEach(article => {
          if (!userStats[article.display_name]) {
            userStats[article.display_name] = {
              display_name: article.display_name,
              totalViews: 0,
              articleCount: 0,
              // Simulating UROWN score based on views and engagement
              urownScore: (article.views || 0) * 0.7 + (article.likes || 0) * 1.5 + (article.comments || 0) * 2.0
            };
          } else {
            userStats[article.display_name].totalViews += article.views || 0;
            userStats[article.display_name].articleCount += 1;
            // Update UROWN score
            userStats[article.display_name].urownScore += (article.views || 0) * 0.7 + (article.likes || 0) * 1.5 + (article.comments || 0) * 2.0;
          }
        });
        
        // Convert to array and sort by total views
        const topUsersArray = Object.values(userStats)
          .sort((a, b) => b.totalViews - a.totalViews)
          .slice(0, 10);
        
        // Get top 5 leaders by UROWN score
        const leadersArray = Object.values(userStats)
          .sort((a, b) => b.urownScore - a.urownScore)
          .slice(0, 5);
        
        setTopUsers(topUsersArray);
        setTopLeaders(leadersArray);
        
        // Create daily feed from recent articles and RedFlagged content
        const recentArticles = [...allArticles]
          .sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date))
          .slice(0, 20);
        
        // Combine regular articles with RedFlagged content
        const combinedFeed = [...recentArticles, ...redFlaggedContent]
          .sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || b.date))
          .slice(0, 30);
        
        setDailyFeed(combinedFeed);
        
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

  // Handle username click - navigate to user profile
  const handleUserClick = (username) => {
    navigate(`/user/${encodeURIComponent(username)}`);
  };

  // Format date for social media style
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.ceil(diffTime / (1000 * 60));
        return diffMinutes <= 1 ? 'just now' : `${diffMinutes}m ago`;
      }
      return `${diffHours}h ago`;
    } else if (diffDays === 1) {
      return 'yesterday';
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Filter daily feed based on selected filter and topic
  const getFilteredFeed = () => {
    let filtered = [...dailyFeed];
    
    // Filter by topic if selected
    if (selectedTopic) {
      filtered = filtered.filter(article => 
        article.topics && article.topics.includes(selectedTopic)
      );
    }
    
    // Sort by selected filter
    if (activeFilter === 'trending') {
      filtered.sort((a, b) => b.views - a.views);
    } else if (activeFilter === 'recent') {
      filtered.sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date));
    } else if (activeFilter === 'popular') {
      filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    }
    
    return filtered;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-900 text-xl font-bold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      {/* Hero Section - Only for non-logged users */}
      <RedFlaggedBanner />
      {!user && (
        <div className="relative overflow-hidden bg-white border-b border-gray-200">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-white"></div>
          
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
                <div className="text-2xl sm:text-3xl font-black text-gray-900 mb-1">38K+</div>
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
                  to={`/debate/${debate.id}`}
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
                        <span className="truncate">by 
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUserClick(article.display_name);
                            }}
                            className="text-orange-600 hover:text-orange-800 ml-1"
                          >
                            {article.display_name}
                          </button>
                        </span>
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

        {/* Daily Feed Section */}
        <section className="mt-16 sm:mt-20">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                <Clock className="w-5 h-5 sm:w-7 sm:h-7 text-white" strokeWidth={2.5} />
              </div>
              <span className="hidden sm:inline">Daily Feed</span>
              <span className="sm:hidden">Feed</span>
            </h2>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => scroll(dailyFeedScrollRef, 'left')}
                  className="p-2 bg-white border-2 border-gray-900 rounded-lg hover:bg-gray-900 hover:text-white transition-all"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scroll(dailyFeedScrollRef, 'right')}
                  className="p-2 bg-white border-2 border-gray-900 rounded-lg hover:bg-gray-900 hover:text-white transition-all"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 mb-6 sm:mb-8 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setActiveFilter('trending')}
              className={`px-4 py-2 rounded-lg font-bold text-sm sm:text-base transition-all flex items-center gap-2 whitespace-nowrap ${
                activeFilter === 'trending' 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
              }`}
            >
              <Flame className="w-4 h-4" strokeWidth={2.5} />
              Trending
            </button>
            <button
              onClick={() => setActiveFilter('recent')}
              className={`px-4 py-2 rounded-lg font-bold text-sm sm:text-base transition-all flex items-center gap-2 whitespace-nowrap ${
                activeFilter === 'recent' 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
              }`}
            >
              <Clock className="w-4 h-4" strokeWidth={2.5} />
              Recent
            </button>
            <button
              onClick={() => setActiveFilter('popular')}
              className={`px-4 py-2 rounded-lg font-bold text-sm sm:text-base transition-all flex items-center gap-2 whitespace-nowrap ${
                activeFilter === 'popular' 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
              }`}
            >
              <ThumbsUp className="w-4 h-4" strokeWidth={2.5} />
              Popular
            </button>
            <div className="relative">
              <button
                className={`px-4 py-2 rounded-lg font-bold text-sm sm:text-base transition-all flex items-center gap-2 whitespace-nowrap ${
                  selectedTopic 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                }`}
              >
                <Filter className="w-4 h-4" strokeWidth={2.5} />
                {selectedTopic || 'Topics'}
              </button>
              {selectedTopic && (
                <button
                  onClick={() => setSelectedTopic(null)}
                  className="absolute -top-1 -right-1 bg-gray-900 text-white rounded-full p-1"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            {topics.length > 0 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {topics.slice(0, 5).map(topic => (
                  <button
                    key={topic}
                    onClick={() => setSelectedTopic(topic === selectedTopic ? null : topic)}
                    className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                      selectedTopic === topic
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    #{topic}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Feed Items */}
          <div className="space-y-4 sm:space-y-6">
            {getFilteredFeed().slice(0, 10).map((article, index) => (
              <div 
                key={article.id}
                className={`bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 border ${
                  article.is_redflagged 
                    ? 'border-red-200 hover:border-red-500' 
                    : 'border-gray-200 hover:border-blue-500'
                } animate-fade-in-up`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">
                    {article.display_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        onClick={() => handleUserClick(article.display_name)}
                        className="text-base sm:text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {article.display_name}
                      </button>
                      <span className="text-gray-500 text-xs sm:text-sm">·</span>
                      <span className="text-gray-500 text-xs sm:text-sm">{formatDate(article.created_at || article.date)}</span>
                      {article.certified && (
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-600 text-xs font-black rounded-md">
                          <Award className="w-3 h-3" strokeWidth={2.5} />
                          Certified
                        </div>
                      )}
                      {article.is_redflagged && (
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-600 text-xs font-black rounded-md">
                          <Flame className="w-3 h-3" strokeWidth={2.5} />
                          RedFlagged
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleArticleClick(article.id)}
                      className="text-left w-full"
                    >
                      <h4 className="text-lg sm:text-xl font-black text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                        {article.title}
                      </h4>
                      <p className="text-sm sm:text-base text-gray-700 mb-3 line-clamp-3">
                        {truncateText(article.content.replace(/<[^>]*>/g, ''), 200)}
                      </p>
                      {article.topics && article.topics.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {article.topics.slice(0, 3).map(topic => (
                            <button
                              key={topic}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTopic(topic);
                              }}
                              className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-md hover:bg-blue-100 transition-colors"
                            >
                              #{topic}
                            </button>
                          ))}
                        </div>
                      )}
                    </button>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-4 sm:gap-6">
                        <button className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors">
                          <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
                          <span className="text-xs sm:text-sm font-semibold">{article.comments || 0}</span>
                        </button>
                        <button className="flex items-center gap-1 text-gray-500 hover:text-green-600 transition-colors">
                          <Repeat2 className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
                        </button>
                        <button className="flex items-center gap-1 text-gray-500 hover:text-red-600 transition-colors">
                          <Heart className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
                          <span className="text-xs sm:text-sm font-semibold">{article.likes || 0}</span>
                        </button>
                        <button className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors">
                          <Share2 className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
                        </button>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
                        <span className="text-xs sm:text-sm font-semibold">{formatNumber(article.views)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <Link to="/browse" className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all">
              Go to Browse Page
            </Link>
          </div>
        </section>

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

      {/* Leaderboard Sidebar */}
      {topLeaders.length > 0 && (
        <div className={`fixed right-0 top-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 z-50 overflow-y-auto ${
          isLeaderboardOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              Leaderboard
            </h2>
            <button
              onClick={() => setIsLeaderboardOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="p-4">
            <div className="space-y-3">
              {topLeaders.map((leader, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center font-black text-lg rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-md">
                    {index + 1}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-md">
                    {leader.display_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 truncate">{leader.display_name}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <BarChart3 className="w-3 h-3" strokeWidth={2.5} />
                        <span className="font-semibold">UROWN: {formatNumber(Math.round(leader.urownScore))}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" strokeWidth={2.5} />
                        {formatNumber(leader.totalViews)} views
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {index === 0 && <Trophy className="w-5 h-5 text-yellow-500" />}
                    {index === 1 && <Trophy className="w-5 h-5 text-gray-400" />}
                    {index === 2 && <Trophy className="w-5 h-5 text-amber-700" />}
                  </div>
                </div>
              ))}
            </div>
            
            <Link
              to="/leaderboard"
              className="block w-full py-3 px-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors duration-200 font-bold text-center flex items-center justify-center gap-2 mt-6"
            >
              <Trophy className="h-5 w-5" />
              Visit Page
            </Link>
          </div>
        </div>
      )}

      {/* Leaderboard Toggle Button */}
      {topLeaders.length > 0 && (
        <button
          onClick={() => setIsLeaderboardOpen(true)}
          className="fixed right-4 bottom-20 md:bottom-4 w-14 h-14 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-full shadow-lg hover:shadow-xl flex items-center justify-center text-white z-40 transition-all duration-200 transform hover:scale-110"
        >
          <Trophy className="h-6 w-6" />
        </button>
      )}

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-40">
        <div className="grid grid-cols-5 gap-1">
          <Link
            to="/"
            className="flex flex-col items-center justify-center py-2 px-1 text-gray-600 hover:text-orange-600 transition-colors"
          >
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link
            to="/browse"
            className="flex flex-col items-center justify-center py-2 px-1 text-gray-600 hover:text-orange-600 transition-colors"
          >
            <Search className="h-5 w-5" />
            <span className="text-xs mt-1">Browse</span>
          </Link>
          {user ? (
            <Link
              to="/write"
              className="flex flex-col items-center justify-center py-2 px-1 text-gray-600 hover:text-orange-600 transition-colors"
            >
              <PenTool className="h-5 w-5" />
              <span className="text-xs mt-1">Write</span>
            </Link>
          ) : (
            <Link
              to="/signup"
              className="flex flex-col items-center justify-center py-2 px-1 text-gray-600 hover:text-orange-600 transition-colors"
            >
              <UserPlus className="h-5 w-5" />
              <span className="text-xs mt-1">Join</span>
            </Link>
          )}
          <Link
            to="/leaderboard"
            className="flex flex-col items-center justify-center py-2 px-1 text-gray-600 hover:text-orange-600 transition-colors"
          >
            <Trophy className="h-5 w-5" />
            <span className="text-xs mt-1">Top</span>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex flex-col items-center justify-center py-2 px-1 text-gray-600 hover:text-orange-600 transition-colors"
          >
            <Menu className="h-5 w-5" />
            <span className="text-xs mt-1">Menu</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
          <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-xl">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Menu</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                <Link
                  to="/ideology-quiz"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Ideology Quiz
                </Link>
                <Link
                  to="/about"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  to="/partners"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Partners
                </Link>
                <Link
                  to="/contact"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contact
                </Link>
                <Link
                  to="/redflagged"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  RedFlagged
                </Link>
                {user && (
                  <>
                    <div className="border-t border-gray-200 my-2"></div>
                    <Link
                      to="/library"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Library
                    </Link>
                    <Link
                      to={`/user/${encodeURIComponent(user.display_name)}`}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Settings
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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