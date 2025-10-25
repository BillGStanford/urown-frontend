import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { fetchWithRetry, getCachedData, setCachedData } from '../utils/apiUtils';
import { Eye, Clock, RefreshCw, TrendingUp, ArrowRight, Award } from 'lucide-react';

function TrendingOpinions() {
  const [trendingArticles, setTrendingArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeFilter, setTimeFilter] = useState('today');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchTrendingArticles();
  }, [timeFilter]);

  const fetchTrendingArticles = async () => {
    try {
      setLoading(true);
      setIsRefreshing(true);
      
      const cacheKey = `trending-articles-${timeFilter}`;
      let cachedData = getCachedData(cacheKey);
      
      if (!cachedData) {
        const response = await fetchWithRetry(() => 
          axios.get('/articles', {
            params: {
              limit: 100,
              offset: 0,
              featured: 'false'
            }
          })
        );
        cachedData = response.data.articles;
        setCachedData(cacheKey, cachedData, 60 * 30);
      }
      
      const articlesWithScore = cachedData.map(article => {
        let score = Math.log((article.views || 0) + 1) * 100;
        
        const now = new Date();
        const createdAt = new Date(article.created_at);
        const hoursSinceCreation = (now - createdAt) / (1000 * 60 * 60);
        
        if (timeFilter === 'today' && hoursSinceCreation < 24) {
          score *= (24 - hoursSinceCreation) / 12 + 1;
        } else if (timeFilter === 'week' && hoursSinceCreation < 168) {
          score *= (168 - hoursSinceCreation) / 84 + 1;
        } else if (timeFilter === 'month' && hoursSinceCreation < 720) {
          score *= (720 - hoursSinceCreation) / 360 + 1;
        }
        
        if (article.certified) {
          score *= 1.5;
        }
        
        if (hoursSinceCreation < 48 && (article.views || 0) < 100) {
          score *= 2;
        }
        
        return {
          ...article,
          trendingScore: score,
          hoursSinceCreation
        };
      });
      
      const topTrending = [...articlesWithScore]
        .sort((a, b) => b.trendingScore - a.trendingScore)
        .slice(0, 5);
      
      setTrendingArticles(topTrending);
    } catch (error) {
      console.error('Error fetching trending articles:', error);
      setError('Failed to load trending articles');
    } finally {
      setLoading(false);
      setTimeout(() => setIsRefreshing(false), 600);
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

  const formatViews = (views) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views;
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-800 font-semibold text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between">
        <button 
          onClick={() => fetchTrendingArticles()}
          disabled={isRefreshing}
          className="text-sm font-semibold text-gray-600 hover:text-orange-600 transition-colors duration-200 flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      
      {/* Time Filter Pills */}
      <div className="px-6 pb-4">
        <div className="flex gap-2">
          {[
            { key: 'today', label: 'Today' },
            { key: 'week', label: 'Week' },
            { key: 'month', label: 'Month' },
            { key: 'all', label: 'All' }
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => handleTimeFilterChange(filter.key)}
              className={`flex-1 px-3 py-2 text-xs font-semibold rounded-lg transition-colors duration-200 ${
                timeFilter === filter.key 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Info Banner */}
      <div className="px-6 pb-4">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <p className="text-xs text-gray-700">
            <span className="font-semibold text-gray-900">Algorithm:</span> Ranked by views, recency, and editorial certification
          </p>
        </div>
      </div>
      
      {/* Loading State */}
      {loading && (
        <div className="py-12 px-6 text-center">
          <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-3 animate-pulse" />
          <p className="text-sm font-semibold text-gray-700">Loading articles...</p>
        </div>
      )}
      
      {/* Trending Articles List */}
      {!loading && trendingArticles.length > 0 && (
        <div className="divide-y divide-gray-100">
          {trendingArticles.map((article, index) => (
            <Link 
              key={article.id} 
              to={`/article/${article.id}`}
              className="group block hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="flex items-start gap-4 p-6">
                {/* Rank Badge */}
                <div className={`flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full font-bold text-sm ${
                  index === 0 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}>
                  {index + 1}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-gray-900 group-hover:text-orange-600 transition-colors duration-200 line-clamp-2 mb-2">
                    {article.title}
                  </h3>
                  
                  {/* Author */}
                  <p className="text-xs text-gray-600 mb-2">
                    by {article.display_name}
                  </p>
                  
                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                    {article.certified && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-orange-100 text-orange-700 font-semibold">
                        <Award className="h-3 w-3" />
                        Certified
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 font-medium">
                      <Eye className="h-3.5 w-3.5" />
                      {formatViews(article.views || 0)}
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium">
                      <Clock className="h-3.5 w-3.5" />
                      {formatTimeAgo(article.hoursSinceCreation)}
                    </span>
                  </div>
                </div>
                
                {/* Arrow Indicator */}
                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <ArrowRight className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      
      {/* No Articles State */}
      {!loading && trendingArticles.length === 0 && (
        <div className="py-12 px-6 text-center">
          <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-900 mb-2">
            No Trending Articles
          </h3>
          <p className="text-sm text-gray-600">
            Check back later for popular content
          </p>
        </div>
      )}
      
      {/* View All Button */}
      {!loading && trendingArticles.length > 0 && (
        <div className="p-6 border-t border-gray-100">
          <Link 
            to="/browse?trending=true" 
            className="group flex items-center justify-center gap-2 w-full py-3 px-4 bg-gray-900 text-white font-semibold text-sm rounded-lg hover:bg-gray-800 transition-colors duration-200"
          >
            View All Trending
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </div>
      )}
    </div>
  );
}

export default TrendingOpinions;