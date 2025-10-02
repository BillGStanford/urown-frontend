// src/pages/BrowseArticles.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ArticleCard from '../components/ArticleCard';
import { fetchWithRetry, getCachedData, setCachedData } from '../utils/apiUtils';
import TrendingOpinions from '../components/TrendingOpinions';
import { Shuffle, RefreshCw, Search, Filter, TrendingUp } from 'lucide-react';

function BrowseArticles() {
  const [articles, setArticles] = useState([]);
  const [counterCounts, setCounterCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showCounters, setShowCounters] = useState(false);
  const articlesPerPage = 12;
  const navigate = useNavigate();

  useEffect(() => {
    fetchArticles();
  }, [currentPage]);

  const fetchCounterCounts = async (articleIds) => {
    try {
      const counterPromises = articleIds.map(id => 
        axios.get(`/articles?parent_article_id=${id}`)
      );
      
      const responses = await Promise.all(counterPromises);
      
      const countsMap = {};
      articleIds.forEach((id, index) => {
        countsMap[id] = responses[index].data.articles.length;
      });
      
      setCounterCounts(countsMap);
    } catch (error) {
      console.error('Error fetching counter counts:', error);
    }
  };

  const fetchArticles = async (reset = false) => {
    try {
      setLoading(true);
      const offset = reset ? 0 : (currentPage - 1) * articlesPerPage;
      
      const cacheKey = `articles-${articlesPerPage}-${offset}-false`;
      let cachedData = getCachedData(cacheKey);
      
      if (!cachedData) {
        const response = await fetchWithRetry(() => 
          axios.get('/articles', {
            params: {
              limit: articlesPerPage,
              offset: offset,
              featured: 'false'
            }
          })
        );
        cachedData = response.data.articles;
        setCachedData(cacheKey, cachedData);
      }
      
      let newArticles = cachedData;
      
      newArticles = [...newArticles].sort((a, b) => {
        if (a.certified && !b.certified) return -1;
        if (!a.certified && b.certified) return 1;
        return (b.views || 0) - (a.views || 0);
      });
      
      if (reset) {
        setArticles(newArticles);
      } else {
        setArticles(prev => {
          const existingIds = new Set(prev.map(article => article.id));
          const uniqueNewArticles = newArticles.filter(article => !existingIds.has(article.id));
          return [...prev, ...uniqueNewArticles];
        });
      }

      const articleIds = newArticles.map(article => article.id);
      fetchCounterCounts(articleIds);

      setHasMore(newArticles.length === articlesPerPage);
    } catch (error) {
      console.error('Error fetching articles:', error);
      setError('Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  const openRandomArticle = () => {
    const availableArticles = filteredArticles.length > 0 ? filteredArticles : articles;
    
    if (availableArticles.length === 0) {
      setError('No articles available to select from');
      return;
    }
    
    const randomIndex = Math.floor(Math.random() * availableArticles.length);
    const randomArticle = availableArticles[randomIndex];
    
    navigate(`/article/${randomArticle.id}`);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleToggleCounters = () => {
    setShowCounters(!showCounters);
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const isOriginalArticle = article.parent_article_id === null;
    const isCounterOpinion = article.parent_article_id !== null;
    
    const matchesType = showCounters ? isCounterOpinion : isOriginalArticle;
    
    return matchesSearch && matchesType;
  });

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  const handleArticleClick = (article) => {
    console.log('Navigate to article:', article.id);
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    fetchArticles(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-8 py-12 md:py-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-[65%]">
            {/* Header */}
            <div className="mb-12">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-4 text-gray-900 tracking-tight">
                BROWSE OPINIONS
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl">
                Discover thought-provoking articles from our community of writers
              </p>
              
              {/* Search Bar */}
              <div className="relative max-w-2xl">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
                <input
                  type="text"
                  placeholder="Search articles, authors, or topics..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-14 pr-6 py-4 text-lg border-2 border-gray-300 focus:border-black focus:outline-none transition-colors rounded-lg"
                />
              </div>
            </div>

            {/* Control Bar */}
            <div className="bg-white rounded-xl shadow-lg border-2 border-black p-6 mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Article Count */}
                <div className="flex items-center gap-3">
                  <div className="text-2xl md:text-3xl font-black text-gray-900">
                    {searchTerm ? `${filteredArticles.length}` : `${articles.length}`}
                  </div>
                  <div className="text-sm md:text-base font-semibold text-gray-600 uppercase tracking-wide">
                    {searchTerm ? 'Results' : 'Articles'}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3">
                  <button 
                    onClick={handleRefresh}
                    className="inline-flex items-center gap-2 bg-white border-2 border-black text-black px-4 py-2 font-bold hover:bg-black hover:text-white transition-all duration-200 rounded-lg disabled:opacity-50"
                    disabled={loading}
                  >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    {loading ? 'REFRESHING' : 'REFRESH'}
                  </button>
                  
                  <button 
                    onClick={openRandomArticle}
                    className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 font-bold hover:bg-gray-800 transition-all duration-200 rounded-lg disabled:opacity-50"
                    disabled={filteredArticles.length === 0 && articles.length === 0}
                  >
                    <Shuffle size={18} />
                    RANDOM
                  </button>
                </div>
              </div>

              {/* Filter Toggle */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <Filter size={20} className="text-gray-600" />
                    <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Filter</span>
                  </div>
                  
                  <label className="flex items-center cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={showCounters}
                        onChange={handleToggleCounters}
                      />
                      <div className={`block w-14 h-8 rounded-full transition-colors ${showCounters ? 'bg-black' : 'bg-gray-300'}`}></div>
                      <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform shadow-md ${showCounters ? 'transform translate-x-6' : ''}`}></div>
                    </div>
                    <div className="ml-3 text-sm font-bold text-gray-700 uppercase tracking-wide">
                      Show Counter Opinions Only
                    </div>
                  </label>
                </div>
                
                <div className="mt-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Currently showing: {showCounters ? 'Counter Opinions' : 'Original Opinions'}
                </div>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-600 p-8 rounded-lg mb-8">
                <div className="text-2xl font-bold text-red-900 mb-4">{error}</div>
                <button 
                  onClick={handleRefresh}
                  className="bg-black text-white px-6 py-3 font-bold hover:bg-gray-800 transition-colors"
                >
                  TRY AGAIN
                </button>
              </div>
            )}

            {/* Loading State */}
            {loading && articles.length === 0 && (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-black mx-auto mb-6"></div>
                <div className="text-2xl font-bold text-gray-900">LOADING ARTICLES...</div>
              </div>
            )}

            {/* No Articles State */}
            {!loading && articles.length === 0 && !error && (
              <div className="text-center py-20 bg-white rounded-xl shadow-lg border-2 border-gray-200 p-12">
                <div className="text-6xl mb-6">📝</div>
                <div className="text-4xl font-black mb-4 text-gray-900">NO ARTICLES YET</div>
                <div className="text-xl text-gray-600 mb-8">
                  Be the first to share your opinion!
                </div>
                <Link to="/write" className="inline-block bg-black text-white px-8 py-4 text-lg font-bold hover:bg-gray-800 transition-colors">
                  WRITE FIRST ARTICLE
                </Link>
              </div>
            )}

            {/* Articles Grid */}
            {!loading && filteredArticles.length > 0 && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
                  {filteredArticles.map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      counterCount={showCounters ? counterCounts[article.id] || 0 : null}
                      onClick={handleArticleClick}
                    />
                  ))}
                </div>

                {/* Load More Button */}
                {!searchTerm && hasMore && (
                  <div className="text-center mb-12">
                    <button
                      onClick={handleLoadMore}
                      disabled={loading}
                      className="bg-black text-white px-12 py-4 text-xl font-bold hover:bg-gray-800 transition-all disabled:opacity-50 rounded-lg"
                    >
                      {loading ? 'LOADING...' : 'LOAD MORE ARTICLES'}
                    </button>
                  </div>
                )}

                {/* No More Articles Message */}
                {!searchTerm && !hasMore && articles.length > 0 && (
                  <div className="text-center py-12 mb-12">
                    <div className="text-xl font-bold text-gray-600">
                      YOU'VE REACHED THE END
                    </div>
                    <div className="text-base text-gray-500 mt-2">
                      Check back later for more opinions
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Search No Results */}
            {searchTerm && filteredArticles.length === 0 && articles.length > 0 && (
              <div className="text-center py-20 bg-white rounded-xl shadow-lg border-2 border-gray-200 p-12">
                <Search className="mx-auto mb-6 text-gray-400" size={64} />
                <div className="text-3xl font-black mb-4 text-gray-900">NO RESULTS FOUND</div>
                <div className="text-lg text-gray-600 mb-8">
                  Try searching with different keywords
                </div>
                <button 
                  onClick={() => setSearchTerm('')}
                  className="bg-black text-white px-8 py-3 font-bold hover:bg-gray-800 transition-colors"
                >
                  CLEAR SEARCH
                </button>
              </div>
            )}

            {/* Call to Action */}
            {!loading && filteredArticles.length > 0 && (
              <div className="bg-gradient-to-r from-black to-gray-900 text-white rounded-xl p-12 text-center mt-12 shadow-2xl">
                <h2 className="text-4xl md:text-5xl font-black mb-6">
                  HAVE AN OPINION TO SHARE?
                </h2>
                <p className="text-lg md:text-xl mb-8 text-gray-200 max-w-2xl mx-auto">
                  Join our community of writers and share your unique perspective with the world
                </p>
                <Link 
                  to="/write" 
                  className="inline-block bg-white text-black px-10 py-4 text-xl font-bold hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-xl"
                >
                  START WRITING
                </Link>
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <aside className="lg:w-[35%]">
            <div className="sticky top-6">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-2xl px-6 py-4 shadow-lg">
                <div className="flex items-center">
                  <TrendingUp className="mr-3" size={28} />
                  <h2 className="text-2xl font-black">TRENDING NOW</h2>
                </div>
                <p className="text-sm text-orange-100 mt-1">Hot takes everyone's talking about</p>
              </div>
              
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

export default BrowseArticles;