import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { fetchWithRetry, getCachedData, setCachedData } from '../utils/apiUtils';

function TrendingOpinions() {
  const [trendingArticles, setTrendingArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeFilter, setTimeFilter] = useState('today'); // today, week, month, all

  useEffect(() => {
    fetchTrendingArticles();
  }, [timeFilter]);

  const fetchTrendingArticles = async () => {
    try {
      setLoading(true);
      
      // Create a cache key based on the time filter
      const cacheKey = `trending-articles-${timeFilter}`;
      let cachedData = getCachedData(cacheKey);
      
      if (!cachedData) {
        // Fetch articles with more data to calculate trending score
        const response = await fetchWithRetry(() => 
          axios.get('/articles', {
            params: {
              limit: 100, // Get more articles to have a larger pool
              offset: 0,
              featured: 'false'
            }
          })
        );
        cachedData = response.data.articles;
        setCachedData(cacheKey, cachedData, 60 * 30); // Cache for 30 minutes
      }
      
      // Calculate trending score for each article
      const articlesWithScore = cachedData.map(article => {
        // Base score on views with logarithmic scaling to prevent extreme dominance
        let score = Math.log((article.views || 0) + 1) * 100;
        
        // Apply time-based adjustments
        const now = new Date();
        const createdAt = new Date(article.created_at);
        const hoursSinceCreation = (now - createdAt) / (1000 * 60 * 60);
        
        // Boost newer articles based on time filter
        if (timeFilter === 'today' && hoursSinceCreation < 24) {
          // New articles get a boost that decreases as they age
          score *= (24 - hoursSinceCreation) / 12 + 1;
        } else if (timeFilter === 'week' && hoursSinceCreation < 168) {
          score *= (168 - hoursSinceCreation) / 84 + 1;
        } else if (timeFilter === 'month' && hoursSinceCreation < 720) {
          score *= (720 - hoursSinceCreation) / 360 + 1;
        }
        
        // Boost editorial certified articles
        if (article.certified) {
          score *= 1.5;
        }
        
        // Give newer articles with fewer views a visibility boost
        // This helps small writers get discovered
        if (hoursSinceCreation < 48 && (article.views || 0) < 100) {
          score *= 2;
        }
        
        return {
          ...article,
          trendingScore: score,
          hoursSinceCreation
        };
      });
      
      // Sort by trending score and take top 5
      const topTrending = [...articlesWithScore]
        .sort((a, b) => b.trendingScore - a.trendingScore)
        .slice(0, 5);
      
      setTrendingArticles(topTrending);
    } catch (error) {
      console.error('Error fetching trending articles:', error);
      setError('Failed to load trending articles');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeFilterChange = (filter) => {
    setTimeFilter(filter);
  };

  const formatTimeAgo = (hours) => {
    if (hours < 1) {
      return 'Just now';
    } else if (hours < 24) {
      return `${Math.floor(hours)}h ago`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    }
  };

  if (error) {
    return (
      <div className="bg-white border-2 border-black p-6 rounded-lg mb-8 shadow-lg w-full">
        <div className="text-black font-bold text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-black rounded-lg p-6 mb-8 shadow-lg w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-black">TRENDING OPINIONS</h2>
        <button 
          onClick={() => fetchTrendingArticles()}
          className="text-black font-bold hover:underline flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          REFRESH
        </button>
      </div>
      
      {/* Time Filter */}
      <div className="flex space-x-3 mb-6">
        {['today', 'week', 'month', 'all'].map((filter) => (
          <button
            key={filter}
            onClick={() => handleTimeFilterChange(filter)}
            className={`px-4 py-2 text-base font-bold rounded-lg transition-all flex-1 ${
              timeFilter === filter 
                ? 'bg-black text-white' 
                : 'bg-gray-100 text-black hover:bg-gray-200'
            }`}
          >
            {filter.toUpperCase()}
          </button>
        ))}
      </div>
      
      {/* Explanation */}
      <div className="text-sm text-gray-700 mb-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <span className="font-bold">How it works:</span> Trending is based on views, recency, and editorial certification. 
        Newer articles with fewer views get a visibility boost.
      </div>
      
      {/* Loading State */}
      {loading && (
        <div className="py-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
          </div>
          <div className="text-xl font-bold text-black">LOADING TRENDING ARTICLES...</div>
        </div>
      )}
      
      {/* Trending Articles List */}
      {!loading && trendingArticles.length > 0 && (
        <div className="space-y-5">
          {trendingArticles.map((article, index) => (
            <Link 
              key={article.id} 
              to={`/article/${article.id}`}
              className="block group"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-black text-white text-xl font-bold mr-4">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg group-hover:underline text-black truncate">
                    {article.title}
                  </h3>
                  <div className="flex flex-wrap items-center text-sm text-gray-700 gap-x-4 gap-y-1 mt-1">
                    <span className="font-bold truncate">{article.display_name}</span>
                    {article.certified && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-gray-200 text-black flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        CERTIFIED
                      </span>
                    )}
                    <span className="flex items-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {article.views || 0} VIEWS
                    </span>
                    <span className="flex items-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatTimeAgo(article.hoursSinceCreation)}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      
      {/* No Articles State */}
      {!loading && trendingArticles.length === 0 && (
        <div className="py-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-xl font-bold text-black mb-2">
            NO TRENDING ARTICLES
          </div>
          <p className="text-base text-gray-700">Check back later for new trending opinions</p>
        </div>
      )}
      
      {/* View All Link */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <Link 
          to="/browse?trending=true" 
          className="flex items-center justify-center w-full py-3 px-4 bg-black hover:bg-gray-800 text-white font-bold rounded-lg transition-colors duration-200"
        >
          VIEW ALL TRENDING ARTICLES
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

export default TrendingOpinions;