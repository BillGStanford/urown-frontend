// src/pages/HomePage.js
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ArticleCard from '../components/ArticleCard';
import DebateHallSection from '../components/DebateHallSection';
import TrendingOpinions from '../components/TrendingOpinions';
import { fetchWithRetry, getCachedData, setCachedData } from '../utils/apiUtils';
import { useUser } from '../context/UserContext';
import { ChevronLeft, ChevronRight, BookOpen, Calendar, Star, TrendingUp, Flame, ArrowRight, Zap, Users, MessageSquare, Award } from 'lucide-react';

function HomePage() {
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { user } = useUser();

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        
        const featuredCacheKey = 'articles-certified';
        let featuredData = getCachedData(featuredCacheKey);
        
        if (!featuredData) {
          const featuredResponse = await fetchWithRetry(() => 
            axios.get('/articles', {
              params: { certified: 'true' }
            })
          );
          featuredData = featuredResponse.data.articles;
          setCachedData(featuredCacheKey, featuredData);
        }
        setFeaturedArticles(featuredData);
        
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchArticles();
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Completely Redesigned */}
      <div className="relative bg-black text-white overflow-hidden">
        {/* Animated mesh gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm border border-yellow-500/30 px-4 py-2 rounded-full mb-6">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-yellow-500 font-semibold text-sm tracking-wider uppercase">{filteredArticles.length} Live Debates</span>
            </div>
            
            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
              {user ? (
                <>
                  Welcome Back,
                  <span className="block bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent mt-2">
                    {user.display_name || user.full_name}
                  </span>
                </>
              ) : (
                <>
                  Where Ideas
                  <span className="block bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
                    Collide & Evolve
                  </span>
                </>
              )}
            </h1>
            
            {/* Subheadline */}
            <p className="text-lg sm:text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto font-light">
              {user 
                ? 'Your platform for intellectual combat. Write bold arguments, face fierce rebuttals, and let the best ideas win.' 
                : 'Join the arena of ideas. Publish your perspective, challenge opposing views, and engage in debates that matter.'}
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link 
                to="/browse" 
                className="group relative w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-black bg-white rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <span className="relative z-10 flex items-center">
                  <BookOpen className="mr-2 w-5 h-5" />
                  Explore Debates
                </span>
              </Link>
              
              {!user && (
                <Link 
                  to="/signup" 
                  className="group relative w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-black bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                >
                  <span className="relative z-10 flex items-center">
                    Join Free
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              )}
            </div>
            
            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center justify-center mb-2">
                  <Award className="w-6 h-6 text-yellow-500" />
                </div>
                <div className="text-2xl font-black text-white mb-1">{filteredArticles.length}</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">Certified</div>
              </div>
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center justify-center mb-2">
                  <Flame className="w-6 h-6 text-orange-500" />
                </div>
                <div className="text-2xl font-black text-white mb-1">Live</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">Active Now</div>
              </div>
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-6 h-6 text-yellow-500" />
                </div>
                <div className="text-2xl font-black text-white mb-1">4000+</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">Total Views</div>
              </div>
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center justify-center mb-2">
                  <MessageSquare className="w-6 h-6 text-orange-500" />
                </div>
                <div className="text-2xl font-black text-white mb-1">24/7</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">Discussion</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-12 md:h-16" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 C300,80 600,80 900,40 L1200,0 L1200,120 L0,120 Z" fill="#f9fafb"></path>
          </svg>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main Content - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-12">
            {/* Debate Hall Section */}
            <section>
              <DebateHallSection />
            </section>
            
            {/* Editorial Picks Section */}
            {filteredArticles.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-8 bg-gradient-to-b from-yellow-500 to-orange-500 rounded-full"></div>
                    <div>
                      <h2 className="text-3xl md:text-4xl font-black text-gray-900 flex items-center gap-3">
                        Editorial Picks
                        <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                      </h2>
                      <p className="text-gray-600 text-sm mt-1">Handpicked by our editorial board</p>
                    </div>
                  </div>
                  <Link 
                    to="/browse" 
                    className="hidden md:flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all duration-200 hover:gap-3"
                  >
                    View All
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
                
                {/* Carousel Container */}
                <div className="relative">
                  {/* Articles Grid */}
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
                  
                  {/* Navigation */}
                  {totalPages > 1 && (
                    <>
                      {/* Desktop Navigation Arrows */}
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
                      
                      {/* Dot Indicators */}
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
                
                {/* Mobile View All Button */}
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
          
          {/* Sidebar - Takes 1 column */}
          <aside className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Trending Section */}
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
              
              {/* How It Works - Only for non-logged-in users */}
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

      {/* Bottom CTA Section - Only for non-logged-in users */}
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