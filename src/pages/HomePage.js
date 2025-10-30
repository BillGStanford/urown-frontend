import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ArticleCard from '../components/ArticleCard';
import DebateHallSection from '../components/DebateHallSection';
import TrendingOpinions from '../components/TrendingOpinions';
import { useUser } from '../context/UserContext';
import { ChevronLeft, ChevronRight, BookOpen, Calendar, Star, TrendingUp, Flame, ArrowRight, Zap, Users, MessageSquare, Award, RefreshCw } from 'lucide-react';

function HomePage() {
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const { user } = useUser();
  const eventSourceRef = useRef(null);

  // Fetch certified articles
const fetchFeaturedArticles = async (forceRefresh = false) => {
  try {
    if (forceRefresh) {
      setRefreshing(true);
    }
    
    const params = { certified: 'true' };
    if (forceRefresh) {
      params._t = Date.now(); // Cache busting parameter
    }
    
    const response = await axios.get('/api/articles', { params });
    setFeaturedArticles(response.data.articles || []);
    setLastUpdate(Date.now());
  } catch (error) {
    console.error('Error fetching featured articles:', error);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

  // Initial fetch
  useEffect(() => {
    fetchFeaturedArticles();
  }, []);

  // Set up SSE for real-time updates
useEffect(() => {
  const eventSource = new EventSource('/api/updates');
  
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    // Refresh articles on relevant updates
    if (data.type === 'certification_changed' || 
        data.type === 'article_deleted' ||
        data.type === 'certification_expired') {
      fetchFeaturedArticles(true);
    }
  };
  
  eventSource.onerror = (error) => {
    console.error('SSE error:', error);
    eventSource.close();
  };
  
  eventSourceRef.current = eventSource;
  
  return () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
  };
}, []);

  const handleArticleClick = (article) => {
    console.log('Navigate to article:', article.id);
  };

  const getTodayDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const articlesToShow = 3;
  const filteredArticles = featuredArticles.filter(article => article.certified);
  const totalPages = Math.ceil(filteredArticles.length / articlesToShow);
  
  const currentArticles = filteredArticles.slice(
    currentIndex * articlesToShow,
    (currentIndex + 1) * articlesToShow
  );

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex < totalPages - 1 ? prevIndex + 1 : 0
    );
  };

  const goToPrev = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex > 0 ? prevIndex - 1 : totalPages - 1
    );
  };

  const handleRefresh = () => {
    fetchFeaturedArticles(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-white overflow-hidden border-b border-gray-200">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50"></div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-orange-50/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-yellow-50/20 to-transparent"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-20 md:py-28 lg:py-32">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg shadow-sm mb-6">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700 font-medium text-sm">{filteredArticles.length} Active Debates</span>
                  {lastUpdate && (
                    <span className="text-xs text-gray-500">
                      Updated {new Date(lastUpdate).toLocaleTimeString()}
                    </span>
                  )}
                </div>
                
                <h1 className="mb-6">
                  {user ? (
                    <>
                      <div className="text-gray-900 text-4xl md:text-5xl lg:text-6xl font-bold mb-3 leading-tight">
                        Welcome back,
                      </div>
                      <div className="text-orange-600 text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                        {user.display_name || user.full_name}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-gray-900 text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-2">
                        The Premier Platform
                      </div>
                      <div className="text-gray-900 text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                        for Intellectual
                      </div>
                      <div className="text-orange-600 text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                        Discourse
                      </div>
                    </>
                  )}
                </h1>
                
                <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed max-w-2xl">
                  {user 
                    ? 'Continue engaging with thought leaders and shaping the conversation on topics that matter.' 
                    : 'Join industry experts, academics, and thought leaders in rigorous, evidence-based debates on the issues shaping our world.'}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-10">
                  <Link 
                    to="/browse" 
                    className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors duration-200 shadow-lg"
                  >
                    Explore Debates
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </Link>
                  
                  {!user && (
                    <Link 
                      to="/signup" 
                      className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-gray-900 bg-white border-2 border-gray-900 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      Create Account
                    </Link>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-orange-600" />
                    <span className="font-medium">Editorial Review Process</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-orange-600" />
                    <span className="font-medium">Expert Community</span>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                      <Award className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{filteredArticles.length}</div>
                    <div className="text-sm text-gray-600 font-medium">Certified Articles</div>
                    <div className="mt-3 text-xs text-gray-500">Reviewed by editorial board</div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                      <MessageSquare className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">Active</div>
                    <div className="text-sm text-gray-600 font-medium">Ongoing Debates</div>
                    <div className="mt-3 text-xs text-gray-500">Updated in real-time</div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                      <Users className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">15,000+</div>
                    <div className="text-sm text-gray-600 font-medium">Monthly Readers</div>
                    <div className="mt-3 text-xs text-gray-500">Growing community</div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                      <TrendingUp className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">24/7</div>
                    <div className="text-sm text-gray-600 font-medium">Platform Access</div>
                    <div className="mt-3 text-xs text-gray-500">Always available</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2 space-y-12">
            <section>
              <DebateHallSection />
            </section>
            
            {filteredArticles.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                      Editorial Picks
                      <Award className="w-7 h-7 text-orange-600" />
                    </h2>
                    <p className="text-gray-600 text-sm">Curated content reviewed by our editorial board</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleRefresh}
                      className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      disabled={refreshing}
                    >
                      <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                      Refresh
                    </button>
                    <Link 
                      to="/browse" 
                      className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white font-semibold text-sm rounded-lg hover:bg-gray-800 transition-colors duration-200"
                    >
                      View All
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentArticles.map((article) => (
                      <div 
                        key={article.id}
                        className="transform transition-all duration-300 hover:scale-105"
                      >
                        <ArticleCard
                          article={article}
                          onClick={handleArticleClick}
                        />
                      </div>
                    ))}
                  </div>
                  
                  {totalPages > 1 && (
                    <>
                      <button 
                        onClick={goToPrev}
                        className="hidden lg:flex absolute -left-6 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center bg-white border-2 border-gray-900 text-gray-900 rounded-full shadow-lg hover:bg-gray-900 hover:text-white transition-all duration-200"
                        aria-label="Previous"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button 
                        onClick={goToNext}
                        className="hidden lg:flex absolute -right-6 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center bg-white border-2 border-gray-900 text-gray-900 rounded-full shadow-lg hover:bg-gray-900 hover:text-white transition-all duration-200"
                        aria-label="Next"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                      
                      <div className="flex justify-center items-center gap-2 mt-8">
                        {Array.from({ length: totalPages }).map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`transition-all duration-300 ${
                              index === currentIndex 
                                ? 'w-8 h-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full' 
                                : 'w-2 h-2 bg-gray-300 rounded-full hover:bg-gray-400'
                            }`}
                            aria-label={`Page ${index + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
                
                <Link 
                  to="/browse" 
                  className="md:hidden flex items-center justify-center gap-2 w-full mt-6 px-6 py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all duration-200"
                >
                  View All Articles
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </section>
            )}
          </div>
          
          <aside className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-7 h-7 text-white" />
                    <h3 className="text-2xl font-black text-white">Trending Now</h3>
                  </div>
                  <p className="text-orange-100 text-sm">Most debated topics today</p>
                </div>
                <div className="bg-white">
                  <TrendingOpinions />
                </div>
              </div>
              
              {!user && (
                <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-2xl p-6 shadow-xl">
                  <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                    <Zap className="w-6 h-6 text-yellow-500" />
                    How It Works
                  </h3>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-yellow-500 text-black rounded-full flex items-center justify-center font-black">1</div>
                      <div>
                        <p className="font-bold text-sm mb-1">Write Your Argument</p>
                        <p className="text-gray-400 text-xs">Share your perspective on any topic</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-black rounded-full flex items-center justify-center font-black">2</div>
                      <div>
                        <p className="font-bold text-sm mb-1">Get Challenged</p>
                        <p className="text-gray-400 text-xs">Others write counter-arguments</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-red-500 text-black rounded-full flex items-center justify-center font-black">3</div>
                      <div>
                        <p className="font-bold text-sm mb-1">Debate & Grow</p>
                        <p className="text-gray-400 text-xs">Engage in meaningful discourse</p>
                      </div>
                    </div>
                  </div>
                  <Link 
                    to="/signup"
                    className="mt-6 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold py-3 rounded-xl hover:from-yellow-400 hover:to-orange-400 transition-all duration-200"
                  >
                    Start Debating
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {!user && (
        <section className="bg-black text-white py-20 md:py-28 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800"></div>
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-64 h-64 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-64 h-64 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>
          
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6">
              Your Voice Matters.
              <span className="block bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent mt-2">
                Make It Heard.
              </span>
            </h2>
            <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Join a community of thinkers who aren't afraid to challenge the status quo. Write, debate, and grow together.
            </p>
            <Link 
              to="/signup"
              className="inline-flex items-center gap-3 px-10 py-5 text-lg font-bold text-black bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl hover:from-yellow-400 hover:to-orange-400 transition-all duration-300 hover:scale-105 shadow-2xl"
            >
              Create Free Account
              <ArrowRight className="w-6 h-6" />
            </Link>
            <p className="text-gray-500 text-sm mt-6">No credit card required • Join in 30 seconds</p>
          </div>
        </section>
      )}
    </div>
  );
}

export default HomePage;