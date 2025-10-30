import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import ArticleCard from '../components/ArticleCard';
import TrendingOpinions from '../components/TrendingOpinions';
import { Shuffle, RefreshCw, Search, Filter, TrendingUp, Zap, Grid, List, X, ChevronDown } from 'lucide-react';

function BrowseArticles() {
  const [articles, setArticles] = useState([]);
  const [counterCounts, setCounterCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showCounters, setShowCounters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isTopicFilterOpen, setIsTopicFilterOpen] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const articlesPerPage = 12;
  const navigate = useNavigate();
  const location = useLocation();
  const eventSourceRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Fetch topics
// Fetch topics
const fetchTopics = useCallback(async () => {
  try {
    const response = await axios.get('/api/topics');
    setTopics(response.data.topics || []);
  } catch (error) {
    console.error('Error fetching topics:', error);
  }
}, []);

// Fetch articles
const fetchArticles = useCallback(async (reset = false, forceRefresh = false) => {
  if (abortControllerRef.current) {
    abortControllerRef.current.abort();
  }
  
  abortControllerRef.current = new AbortController();
  
  try {
    if (reset) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    
    const offset = reset ? 0 : (currentPage - 1) * articlesPerPage;
    
    const params = {
      limit: articlesPerPage,
      offset: offset,
      featured: 'false'
    };
    
    if (selectedTopic) {
      params.topicId = selectedTopic;
    }
    
    if (forceRefresh) {
      params._t = Date.now();
    }
    
    const response = await axios.get('/api/articles', { 
      params,
      signal: abortControllerRef.current.signal
    });
    
    let newArticles = response.data.articles || [];
    
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
    setLastUpdate(Date.now());
  } catch (error) {
    if (error.name !== 'CanceledError') {
      console.error('Error fetching articles:', error);
      setError('Failed to load articles');
    }
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}, [currentPage, selectedTopic, fetchCounterCounts]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const topicId = urlParams.get('topic');
    const newTopicId = topicId ? parseInt(topicId) : null;
    
    if (newTopicId !== selectedTopic) {
      setSelectedTopic(newTopicId);
      setArticles([]);
      setCurrentPage(1);
    }
  }, [location.search, selectedTopic]);

  useEffect(() => {
    if (selectedTopic !== undefined) {
      setArticles([]);
      setCurrentPage(1);
      fetchArticles(true, true);
    }
  }, [selectedTopic, fetchArticles]);

  useEffect(() => {
    if (currentPage > 1) {
      fetchArticles(false);
    }
  }, [currentPage, fetchArticles]);

useEffect(() => {
  const eventSource = new EventSource('/api/updates');
  
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    if (data.type === 'article_reported' || 
        data.type === 'article_created' ||
        data.type === 'article_updated' ||
        data.type === 'article_deleted' ||
        data.type === 'certification_changed' ||
        data.type === 'certification_expired') {
      fetchArticles(true, true);
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
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };
}, [fetchArticles]);

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
    setIsTopicFilterOpen(false);
    
    if (topicId) {
      navigate(`/browse?topic=${topicId}`);
    } else {
      navigate('/browse');
    }
  };

  const clearTopicFilter = () => {
    setIsTopicFilterOpen(false);
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
    fetchArticles(true, true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Social Media Header */}
            <div className="mb-6">
              {/* Stats Bar */}
              <div className="flex items-center gap-3 mb-4 overflow-x-auto pb-2">
                <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-gray-200 whitespace-nowrap">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-gray-900">
                    {filteredArticles.length} live
                  </span>
                </div>
                
                <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full px-4 py-2 shadow-sm whitespace-nowrap">
                  <Zap className="w-3.5 h-3.5 text-white" />
                  <span className="text-sm font-bold text-white">
                    Trending
                  </span>
                </div>

                {lastUpdate && (
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    Updated {new Date(lastUpdate).toLocaleTimeString()}
                  </span>
                )}
              </div>
              
              {/* Search Bar */}
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search opinions..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-11 pr-4 py-3 text-sm border border-gray-200 focus:border-gray-400 focus:outline-none transition-all rounded-full bg-gray-50 focus:bg-white"
                />
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <button 
                  onClick={openRandomArticle}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white px-4 py-2 font-semibold transition-all rounded-full shadow-sm text-sm whitespace-nowrap"
                  disabled={filteredArticles.length === 0 && articles.length === 0}
                >
                  <Shuffle size={14} />
                  Random
                </button>
                
                <button 
                  onClick={handleRefresh}
                  className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 px-4 py-2 font-semibold hover:bg-gray-50 transition-all rounded-full shadow-sm text-sm whitespace-nowrap"
                  disabled={loading || refreshing}
                >
                  <RefreshCw size={14} className={loading || refreshing ? 'animate-spin' : ''} />
                  Refresh
                </button>

                <div className="flex items-center gap-1 bg-white border border-gray-200 p-1 rounded-full shadow-sm">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-full transition-all ${viewMode === 'grid' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <Grid size={14} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-full transition-all ${viewMode === 'list' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <List size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Filters - Instagram Story Style */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
              <button
                onClick={toggleTopicFilter}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all whitespace-nowrap shadow-sm ${
                  selectedTopic 
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' 
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter size={14} />
                {getSelectedTopicName()}
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isTopicFilterOpen ? 'rotate-180' : ''}`} />
              </button>

              <button
                onClick={handleToggleCounters}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all whitespace-nowrap shadow-sm ${
                  showCounters 
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' 
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {showCounters ? 'Counters' : 'Original'}
              </button>

              {selectedTopic && (
                <button
                  onClick={clearTopicFilter}
                  className="p-2 rounded-full bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all shadow-sm"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Topic Dropdown */}
            {isTopicFilterOpen && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 mb-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => handleTopicSelect(null)}
                    className={`px-3 py-2 rounded-full text-sm font-semibold transition-all ${
                      !selectedTopic 
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-sm' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All Topics
                  </button>
                  {topics.map(topic => (
                    <button
                      key={topic.id}
                      onClick={() => handleTopicSelect(topic.id)}
                      className={`px-3 py-2 rounded-full text-sm font-semibold transition-all ${
                        selectedTopic === topic.id 
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-sm' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {topic.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-2xl mb-6">
                <div className="text-sm font-semibold text-red-900 mb-2">{error}</div>
                <button 
                  onClick={handleRefresh}
                  className="text-sm font-semibold text-red-600 hover:text-red-700"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Loading State */}
            {loading && articles.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative w-12 h-12 mb-4">
                  <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"></div>
                </div>
                <div className="text-sm font-semibold text-gray-600">Loading feed...</div>
              </div>
            )}

            {/* No Articles State */}
            {!loading && articles.length === 0 && !error && (
              <div className="bg-white rounded-3xl p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Start the Conversation</h3>
                <p className="text-gray-600 mb-6">Be the first to share your opinion</p>
                <Link 
                  to="/write" 
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white px-6 py-3 font-semibold transition-all rounded-full shadow-lg"
                >
                  Create Post
                </Link>
              </div>
            )}

            {/* No Results for Selected Topic */}
            {!loading && articles.length > 0 && filteredArticles.length === 0 && selectedTopic && (
              <div className="bg-white rounded-3xl p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                  <Filter className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No Posts Yet</h3>
                <p className="text-gray-600 mb-6">
                  Be the first to write about {getSelectedTopicName()}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link 
                    to="/write" 
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white px-6 py-3 font-semibold transition-all rounded-full shadow-lg"
                  >
                    <Zap className="h-4 w-4" />
                    Create Post
                  </Link>
                  <button 
                    onClick={clearTopicFilter}
                    className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-6 py-3 font-semibold transition-all rounded-full shadow-sm"
                  >
                    Clear Filter
                  </button>
                </div>
              </div>
            )}

            {/* Articles Feed */}
            {!loading && filteredArticles.length > 0 && (
              <>
                <div className={viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 gap-4 mb-6' 
                  : 'flex flex-col gap-4 mb-6'
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

                {!searchTerm && hasMore && (
                  <div className="text-center mb-6">
                    <button
                      onClick={handleLoadMore}
                      disabled={loading}
                      className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-8 py-3 font-semibold transition-all disabled:opacity-50 rounded-full shadow-sm"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Load More'
                      )}
                    </button>
                  </div>
                )}

                {!searchTerm && !hasMore && articles.length > 0 && (
                  <div className="text-center py-6 mb-6">
                    <span className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                      You're all caught up
                    </span>
                  </div>
                )}
              </>
            )}

            {/* Search No Results */}
            {searchTerm && filteredArticles.length === 0 && articles.length > 0 && (
              <div className="bg-white rounded-3xl p-12 text-center">
                <Search className="mx-auto mb-6 text-gray-300" size={48} />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Results</h3>
                <p className="text-gray-600 mb-6">Try different keywords</p>
                <button 
                  onClick={() => setSearchTerm('')}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white px-6 py-3 font-semibold transition-all rounded-full shadow-lg"
                >
                  Clear Search
                </button>
              </div>
            )}

            {/* CTA Card */}
            {!loading && filteredArticles.length > 0 && (
              <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-3xl p-8 text-center mt-6 shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 left-1/4 w-40 h-40 bg-yellow-500 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-orange-500 rounded-full blur-3xl"></div>
                </div>
                
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-2">Share Your Voice</h3>
                  <p className="text-gray-300 mb-6 text-sm">Join the conversation</p>
                  <Link 
                    to="/write" 
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white px-8 py-3 font-semibold transition-all rounded-full shadow-lg"
                  >
                    <Zap className="h-4 w-4" />
                    Create Post
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          <aside className="lg:col-span-1">
            <div className="sticky top-6">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-2xl px-5 py-4 shadow-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  <h2 className="text-lg font-bold">Trending</h2>
                </div>
              </div>
              
              <div className="bg-white rounded-b-2xl shadow-xl overflow-hidden border-t-2 border-orange-500">
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