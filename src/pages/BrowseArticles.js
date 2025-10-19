// pages/BrowseArticles.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { axios } from '../utils/apiUtils';
import ArticleCard from '../components/ArticleCard';
import { fetchWithRetry, getCachedData, setCachedData } from '../utils/apiUtils';
import TrendingOpinions from '../components/TrendingOpinions';
import { Shuffle, RefreshCw, Search, Filter, TrendingUp, Zap, Grid, List, X, ChevronDown } from 'lucide-react';

function BrowseArticles() {
  const [articles, setArticles] = useState([]);
  const [counterCounts, setCounterCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showCounters, setShowCounters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isTopicFilterOpen, setIsTopicFilterOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const articlesPerPage = 12;
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch topics on component mount
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await axios.get('/topics');
        setTopics(response.data.topics || []);
      } catch (error) {
        console.error('Error fetching topics:', error);
      }
    };

    fetchTopics();
  }, []);

  // Check for topic in URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const topicId = urlParams.get('topic');
    if (topicId) {
      setSelectedTopic(parseInt(topicId));
    } else {
      setSelectedTopic(null);
    }
  }, [location.search]);

  // Fetch articles when component mounts or when topic changes
  useEffect(() => {
    fetchArticles();
  }, [currentPage, selectedTopic]);

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
      setRefreshing(true);
      const offset = reset ? 0 : (currentPage - 1) * articlesPerPage;
      
      const cacheKey = `articles-${articlesPerPage}-${offset}-false-${selectedTopic || 'all'}`;
      let cachedData = getCachedData(cacheKey);
      
      if (!cachedData) {
        const params = {
          limit: articlesPerPage,
          offset: offset,
          featured: 'false'
        };
        
        if (selectedTopic) {
          params.topicId = selectedTopic;
        }
        
        const response = await fetchWithRetry(() => 
          axios.get('/articles', { params })
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
      setRefreshing(false);
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

  const handleTopicSelect = (topicId) => {
    setSelectedTopic(topicId);
    setCurrentPage(1);
    setArticles([]); // Clear existing articles
    setIsTopicFilterOpen(false);
    
    // Update URL
    if (topicId) {
      navigate(`/browse?topic=${topicId}`);
    } else {
      navigate('/browse');
    }
  };

  const clearTopicFilter = () => {
    setSelectedTopic(null);
    setCurrentPage(1);
    navigate('/browse');
  };

  const toggleTopicFilter = () => {
    setIsTopicFilterOpen(!isTopicFilterOpen);
  };

  const getSelectedTopicName = () => {
    if (!selectedTopic) return 'All Topics';
    const topic = topics.find(t => t.id === selectedTopic);
    return topic ? topic.name : 'Unknown Topic';
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2">
            {/* Hero Header */}
            <div className="mb-8 md:mb-12">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm border border-yellow-500/30 px-4 py-2 rounded-full mb-4">
                <Zap className="w-4 h-4 text-yellow-600" />
                <span className="text-yellow-700 font-bold text-xs uppercase tracking-wider">
                  {filteredArticles.length} Active Debates
                </span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4 text-gray-900 leading-tight">
                Explore Opinions
              </h1>
              <p className="text-base sm:text-lg text-gray-600 mb-6 max-w-2xl">
                Dive into thought-provoking articles from writers around the world
              </p>
              
              {/* Search Bar */}
              <div className="relative max-w-2xl">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by title, author, or content..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-12 pr-4 py-3.5 text-base border-2 border-gray-300 focus:border-black focus:outline-none transition-all rounded-xl bg-white shadow-sm"
                />
              </div>
            </div>

            {/* Topic Filter */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 mb-6 md:mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Filter size={18} className="text-gray-600" />
                  <span className="text-sm font-bold text-gray-700">Topic Filter</span>
                </div>
                
                <button
                  onClick={toggleTopicFilter}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <span className="text-sm font-medium text-gray-700">{getSelectedTopicName()}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isTopicFilterOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
              
              {isTopicFilterOpen && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <button
                      onClick={() => handleTopicSelect(null)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        !selectedTopic 
                          ? 'bg-orange-100 text-orange-700 border-2 border-orange-300' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                      }`}
                    >
                      All Topics
                    </button>
                    {topics.map(topic => (
                      <button
                        key={topic.id}
                        onClick={() => handleTopicSelect(topic.id)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedTopic === topic.id 
                            ? 'bg-orange-100 text-orange-700 border-2 border-orange-300' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                        }`}
                      >
                        {topic.name}
                      </button>
                    ))}
                  </div>
                  
                  {selectedTopic && (
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Showing articles tagged with "{getSelectedTopicName()}"
                      </span>
                      <button
                        onClick={clearTopicFilter}
                        className="text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1"
                      >
                        <X size={16} />
                        Clear Filter
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Control Panel */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 mb-6 md:mb-8">
              {/* Top Row: Stats and Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                {/* Article Count */}
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                    {searchTerm ? filteredArticles.length : articles.length}
                  </div>
                  <div className="text-sm font-bold text-gray-600 uppercase tracking-wide">
                    {searchTerm ? 'Results' : 'Articles'}
                  </div>
                  {selectedTopic && (
                    <div className="text-sm font-medium text-orange-600 ml-2">
                      in {getSelectedTopicName()}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button 
                    onClick={handleRefresh}
                    className="inline-flex items-center gap-2 bg-white border-2 border-gray-900 text-gray-900 px-4 py-2 font-bold hover:bg-gray-900 hover:text-white transition-all duration-200 rounded-xl text-sm"
                    disabled={loading || refreshing}
                  >
                    <RefreshCw size={16} className={loading || refreshing ? 'animate-spin' : ''} />
                    Refresh
                  </button>
                  
                  <button 
                    onClick={openRandomArticle}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black px-4 py-2 font-bold transition-all duration-200 rounded-xl shadow-md hover:shadow-lg text-sm"
                    disabled={filteredArticles.length === 0 && articles.length === 0}
                  >
                    <Shuffle size={16} />
                    Random
                  </button>

                  {/* View Mode Toggle */}
                  <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                      aria-label="Grid view"
                    >
                      <Grid size={16} className={viewMode === 'grid' ? 'text-gray-900' : 'text-gray-500'} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                      aria-label="List view"
                    >
                      <List size={16} className={viewMode === 'list' ? 'text-gray-900' : 'text-gray-500'} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Filter Section */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Filter size={18} className="text-gray-600" />
                    <span className="text-sm font-bold text-gray-700">Filter Type</span>
                  </div>
                  
                  <label className="flex items-center cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={showCounters}
                        onChange={handleToggleCounters}
                      />
                      <div className={`block w-12 h-6 rounded-full transition-all ${showCounters ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gray-300'}`}></div>
                      <div className={`absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full transition-transform shadow-md ${showCounters ? 'transform translate-x-6' : ''}`}></div>
                    </div>
                    <span className="ml-3 text-sm font-bold text-gray-700">
                      Counter Opinions Only
                    </span>
                  </label>
                </div>
                
                <div className="mt-3 px-2">
                  <span className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${showCounters ? 'bg-orange-500' : 'bg-gray-400'}`}></div>
                    Showing: {showCounters ? 'Counter Opinions' : 'Original Opinions'}
                  </span>
                </div>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-xl mb-8">
                <div className="text-lg font-bold text-red-900 mb-3">{error}</div>
                <button 
                  onClick={handleRefresh}
                  className="bg-gradient-to-r from-gray-900 to-black text-white px-6 py-2.5 font-bold hover:from-black hover:to-gray-900 transition-all rounded-lg"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Loading State */}
            {loading && articles.length === 0 && (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 mb-4">
                  <RefreshCw className="h-8 w-8 text-white animate-spin" />
                </div>
                <div className="text-xl font-bold text-gray-900">Loading articles...</div>
              </div>
            )}

            {/* No Articles State */}
            {!loading && articles.length === 0 && !error && (
              <div className="text-center py-20 bg-white rounded-2xl shadow-lg border border-gray-200 p-12">
                <div className="text-6xl mb-6">📝</div>
                <div className="text-3xl font-black mb-4 text-gray-900">No Articles Yet</div>
                <div className="text-lg text-gray-600 mb-8">
                  Be the first to share your opinion!
                </div>
                <Link to="/write" className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black px-8 py-4 text-lg font-bold transition-all rounded-xl shadow-lg hover:shadow-xl">
                  Start Writing
                  <Zap className="h-5 w-5" />
                </Link>
              </div>
            )}

            {/* No Results for Selected Topic */}
            {!loading && articles.length > 0 && filteredArticles.length === 0 && selectedTopic && (
              <div className="text-center py-20 bg-white rounded-2xl shadow-lg border border-gray-200 p-12">
                <div className="text-6xl mb-6">🔍</div>
                <div className="text-3xl font-black mb-4 text-gray-900">No Articles Found</div>
                <div className="text-base text-gray-600 mb-8">
                  No articles found for "{getSelectedTopicName()}"
                </div>
                <button 
                  onClick={clearTopicFilter}
                  className="bg-gradient-to-r from-gray-900 to-black hover:from-black hover:to-gray-900 text-white px-8 py-3 font-bold transition-all rounded-xl shadow-md"
                >
                  Clear Topic Filter
                </button>
              </div>
            )}

            {/* Articles Grid/List */}
            {!loading && filteredArticles.length > 0 && (
              <>
                <div className={viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8' 
                  : 'flex flex-col gap-4 sm:gap-6 mb-8'
                }>
                  {filteredArticles.map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      counterCount={showCounters ? counterCounts[article.id] || 0 : null}
                      onClick={handleArticleClick}
                      viewMode={viewMode}
                    />
                  ))}
                </div>

                {/* Load More Button */}
                {!searchTerm && hasMore && (
                  <div className="text-center mb-8">
                    <button
                      onClick={handleLoadMore}
                      disabled={loading}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-900 to-black hover:from-black hover:to-gray-900 text-white px-10 py-4 text-lg font-bold transition-all disabled:opacity-50 rounded-xl shadow-lg hover:shadow-xl"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="h-5 w-5 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Load More'
                      )}
                    </button>
                  </div>
                )}

                {/* End of Results */}
                {!searchTerm && !hasMore && articles.length > 0 && (
                  <div className="text-center py-8 mb-8">
                    <div className="inline-flex items-center gap-2 bg-gray-100 px-6 py-3 rounded-full">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span className="text-sm font-bold text-gray-600">
                        You've reached the end
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Search No Results */}
            {searchTerm && filteredArticles.length === 0 && articles.length > 0 && (
              <div className="text-center py-20 bg-white rounded-2xl shadow-lg border border-gray-200 p-12">
                <Search className="mx-auto mb-6 text-gray-400" size={64} />
                <div className="text-2xl font-black mb-4 text-gray-900">No Results Found</div>
                <div className="text-base text-gray-600 mb-8">
                  Try different keywords or clear your search
                </div>
                <button 
                  onClick={() => setSearchTerm('')}
                  className="bg-gradient-to-r from-gray-900 to-black hover:from-black hover:to-gray-900 text-white px-8 py-3 font-bold transition-all rounded-xl shadow-md"
                >
                  Clear Search
                </button>
              </div>
            )}

            {/* CTA Section */}
            {!loading && filteredArticles.length > 0 && (
              <div className="bg-gradient-to-r from-gray-900 via-black to-gray-800 text-white rounded-2xl p-8 sm:p-12 text-center mt-8 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-1/4 w-64 h-64 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
                  <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
                </div>
                
                <div className="relative z-10">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
                    Have Your Say
                  </h2>
                  <p className="text-base sm:text-lg md:text-xl mb-8 text-gray-300 max-w-2xl mx-auto">
                    Join the conversation. Write your perspective and engage with others.
                  </p>
                  <Link 
                    to="/write" 
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black px-8 sm:px-10 py-3 sm:py-4 text-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-2xl rounded-xl"
                  >
                    Start Writing
                    <Zap className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          {/* Sidebar - 1 column */}
          <aside className="lg:col-span-1">
            <div className="sticky top-6">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-2xl px-6 py-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-7 h-7" />
                  <h2 className="text-2xl font-black">Trending Now</h2>
                </div>
                <p className="text-sm text-orange-100 mt-1">Hot debates happening today</p>
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