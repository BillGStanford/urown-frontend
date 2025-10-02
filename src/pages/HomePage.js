// src/pages/HomePage.js
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ArticleCard from '../components/ArticleCard';
import DebateHallSection from '../components/DebateHallSection';
import TrendingOpinions from '../components/TrendingOpinions';
import { fetchWithRetry, getCachedData, setCachedData } from '../utils/apiUtils';
import { useUser } from '../context/UserContext';
import { ChevronLeft, ChevronRight, BookOpen, Calendar, Star, TrendingUp, Flame } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Hero Section - Enhanced */}
      <div className="relative bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white py-20 px-8 mb-8 overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center justify-center mb-4 bg-yellow-500 text-black px-6 py-2 rounded-full font-bold text-sm tracking-wide">
            <Flame className="mr-2" size={18} />
            WHAT'S HAPPENING TODAY
          </div>
          
          <h1 className="text-6xl font-black mb-4 tracking-tight">
            {user ? `Welcome back, ${user.display_name || user.full_name}!` : 'Welcome to Your Feed'}
          </h1>
          
          <div className="flex items-center justify-center text-xl text-gray-300 mb-8 space-x-3">
            <Calendar className="text-yellow-500" size={24} />
            <span className="font-medium">{getTodayDate()}</span>
          </div>
          
          <p className="text-2xl font-semibold mb-10 text-gray-200">
            <span className="text-yellow-500 font-black text-3xl">{filteredArticles.length}</span> Editorial Board Certified Articles Ready
          </p>
          
          <Link 
            to="/browse" 
            className="inline-flex items-center bg-white text-black px-10 py-4 text-xl font-bold rounded-lg hover:bg-yellow-500 hover:text-black transform hover:scale-105 transition-all duration-300 shadow-2xl"
          >
            <BookOpen className="mr-3" size={24} />
            Explore All Articles
          </Link>
        </div>
      </div>

      {/* Main Content with Sidebar Layout */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="flex gap-8">
          {/* Main Content Area - 65% */}
          <div className="flex-1" style={{ width: '65%' }}>
            {/* DEBATE HALL SECTION */}
            <div className="mb-10">
              <DebateHallSection />
            </div>
            
            {/* Editorial Board Approved Articles */}
            {filteredArticles.length > 0 && (
              <div className="mb-12">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-4xl font-black flex items-center text-gray-900 mb-2">
                      <Star className="mr-3 text-yellow-500" size={36} fill="currentColor" />
                      EDITORIAL PICKS
                    </h2>
                    <p className="text-gray-600 ml-12">Curated by our editorial board</p>
                  </div>
                  <Link 
                    to="/browse" 
                    className="inline-flex items-center bg-gray-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    VIEW ALL
                    <ChevronRight className="ml-2" size={20} />
                  </Link>
                </div>
                
                {/* Enhanced Carousel */}
                <div className="relative bg-white rounded-2xl shadow-xl p-6">
                  {/* Left Navigation Button */}
                  {totalPages > 1 && (
                    <button 
                      onClick={goToPrev}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 z-20 bg-gradient-to-r from-gray-900 to-black text-white rounded-full p-3 shadow-2xl hover:scale-110 transition-all duration-200"
                      aria-label="Previous articles"
                    >
                      <ChevronLeft className="h-7 w-7" />
                    </button>
                  )}
                  
                  {/* Articles Container */}
                  <div className="overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {currentArticles.map((article) => (
                        <ArticleCard
                          key={article.id}
                          article={article}
                          onClick={handleArticleClick}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Right Navigation Button */}
                  {totalPages > 1 && (
                    <button 
                      onClick={goToNext}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20 bg-gradient-to-r from-black to-gray-900 text-white rounded-full p-3 shadow-2xl hover:scale-110 transition-all duration-200"
                      aria-label="Next articles"
                    >
                      <ChevronRight className="h-7 w-7" />
                    </button>
                  )}
                  
                  {/* Page Indicators */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-8 space-x-2">
                      {Array.from({ length: totalPages }).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentIndex(index)}
                          className={`transition-all duration-300 rounded-full ${
                            index === currentIndex 
                              ? 'w-8 h-3 bg-gradient-to-r from-yellow-500 to-yellow-600' 
                              : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
                          }`}
                          aria-label={`Go to page ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Sidebar - 35% */}
          <aside className="w-full" style={{ maxWidth: '35%' }}>
            <div className="sticky top-6">
              {/* Trending Header */}
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-2xl px-6 py-4 shadow-lg">
                <div className="flex items-center">
                  <TrendingUp className="mr-3" size={28} />
                  <h2 className="text-2xl font-black">TRENDING NOW</h2>
                </div>
                <p className="text-sm text-orange-100 mt-1">Hot takes everyone's talking about</p>
              </div>
              
              {/* Trending Content */}
              <div className="bg-white rounded-b-2xl shadow-xl overflow-hidden border-t-4 border-orange-500">
                <TrendingOpinions />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default HomePage;