import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { axios } from '../utils/apiUtils';
import ArticleCard from '../components/ArticleCard';
import { fetchWithRetry, getCachedData, setCachedData } from '../utils/apiUtils';
import TrendingOpinions from '../components/TrendingOpinions';
import { Shuffle, RefreshCw, Search, Filter, TrendingUp, Zap, Grid, List, X, ChevronDown, Sparkles, Briefcase, DollarSign, Trophy, Pizza, Plane, Laptop, Heart, Film, Microscope, Globe, ChevronLeft, ChevronRight } from 'lucide-react';

function BrowseArticles() {
  const [articles, setArticles] = useState([]);
  const [articlesByTopic, setArticlesByTopic] = useState({});
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
  const [totalArticleCount, setTotalArticleCount] = useState(0);
  const [topicScrollPositions, setTopicScrollPositions] = useState({});
  const articlesPerPage = 12;
  const navigate = useNavigate();
  const location = useLocation();
  const topicRefs = useRef({});

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
    const topicParam = urlParams.get('topic');
    
    if (topicParam) {
      // Check if it's a topic name (string) or ID (number)
      const topicByName = topics.find(t => t.name === topicParam);
      const topicById = topics.find(t => t.id === parseInt(topicParam));
      
      const newTopicId = topicByName?.id || topicById?.id || null;
      
      if (newTopicId !== selectedTopic) {
        setSelectedTopic(newTopicId);
        setArticles([]);
        setCurrentPage(1);
        setTotalArticleCount(0);
      }
    } else if (selectedTopic !== null) {
      setSelectedTopic(null);
      setArticles([]);
      setCurrentPage(1);
      setTotalArticleCount(0);
    }
  }, [location.search, topics]);

  // Fetch articles when component mounts or when topic changes
  useEffect(() => {
    setArticles([]);
    setCurrentPage(1);
    setTotalArticleCount(0);
    fetchArticles(true);
  }, [selectedTopic]);

  // Fetch more articles when page changes
  useEffect(() => {
    if (currentPage > 1) {
      fetchArticles();
    }
  }, [currentPage]);

  // Initialize scroll positions for topics
  useEffect(() => {
    const initialPositions = {};
    topics.forEach(topic => {
      initialPositions[topic.id] = 0;
    });
    setTopicScrollPositions(initialPositions);
  }, [topics]);

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
      let cachedData = reset ? null : getCachedData(cacheKey);
      
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
        
        if (!reset) {
          setCachedData(cacheKey, cachedData);
        }
      }
      
      let newArticles = cachedData;
      
      // Sort by certified first, then views
      newArticles = [...newArticles].sort((a, b) => {
        if (a.certified && !b.certified) return -1;
        if (!a.certified && b.certified) return 1;
        return (b.views || 0) - (a.views || 0);
      });
      
      if (reset) {
        setArticles(newArticles);
        setTotalArticleCount(newArticles.length);
        
        // Group articles by topic
        const groupedArticles = {};
        newArticles.forEach(article => {
          if (article.topics && article.topics.length > 0) {
            article.topics.forEach(topicId => {
              if (!groupedArticles[topicId]) {
                groupedArticles[topicId] = [];
              }
              groupedArticles[topicId].push(article);
            });
          }
        });
        setArticlesByTopic(groupedArticles);
      } else {
        setArticles(prev => {
          const existingIds = new Set(prev.map(article => article.id));
          const uniqueNewArticles = newArticles.filter(article => !existingIds.has(article.id));
          const combined = [...prev, ...uniqueNewArticles];
          setTotalArticleCount(combined.length);
          
          // Update grouped articles
          const groupedArticles = { ...articlesByTopic };
          uniqueNewArticles.forEach(article => {
            if (article.topics && article.topics.length > 0) {
              article.topics.forEach(topicId => {
                if (!groupedArticles[topicId]) {
                  groupedArticles[topicId] = [];
                }
                groupedArticles[topicId].push(article);
              });
            }
          });
          setArticlesByTopic(groupedArticles);
          
          return combined;
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

  const getTopicIcon = (topicName) => {
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
    
    const IconComponent = iconMap[topicName] || Sparkles;
    return <IconComponent className="w-4 h-4" strokeWidth={2.5} />;
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
    setArticles([]);
    setTotalArticleCount(0);
    fetchArticles(true);
  };

  // Function to scroll topic section
  const scrollTopicSection = (topicId, direction) => {
    const container = topicRefs.current[topicId];
    if (!container) return;
    
    const scrollAmount = 320; // Width of one article card plus margin
    const newPosition = direction === 'left' 
      ? Math.max(0, topicScrollPositions[topicId] - scrollAmount)
      : topicScrollPositions[topicId] + scrollAmount;
    
    container.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    });
    
    setTopicScrollPositions(prev => ({
      ...prev,
      [topicId]: newPosition
    }));
  };

  // Get topics sorted by popularity (number of articles)
  const getTopicsByPopularity = () => {
    const topicsWithCount = topics.map(topic => ({
      ...topic,
      articleCount: articlesByTopic[topic.id] ? articlesByTopic[topic.id].length : 0
    }));
    
    // Sort by article count (descending)
    topicsWithCount.sort((a, b) => b.articleCount - a.articleCount);
    
    return topicsWithCount;
  };

  // Get articles for a topic, with special sorting for less popular topics
  const getArticlesForTopic = (topicId, isLessPopular = false) => {
    const topicArticles = articlesByTopic[topicId] || [];
    
    if (isLessPopular) {
      // For less popular topics, sometimes prioritize articles with fewer views
      // to boost engagement (30% chance)
      if (Math.random() < 0.3) {
        return [...topicArticles].sort((a, b) => (a.views || 0) - (b.views || 0));
      }
    }
    
    // Default sorting: certified first, then by views
    return [...topicArticles].sort((a, b) => {
      if (a.certified && !b.certified) return -1;
      if (!a.certified && b.certified) return 1;
      return (b.views || 0) - (a.views || 0);
    });
  };

  // Get politics topic (always first)
  const getPoliticsTopic = () => {
    return topics.find(topic => topic.name === 'Politics');
  };

  // Get top 3 topics by popularity (excluding Politics)
  const getTopTopics = () => {
    const politicsTopic = getPoliticsTopic();
    const topicsByPopularity = getTopicsByPopularity();
    
    // Filter out Politics if it exists
    const filteredTopics = politicsTopic 
      ? topicsByPopularity.filter(topic => topic.id !== politicsTopic.id)
      : topicsByPopularity;
    
    // Return top 3
    return filteredTopics.slice(0, 3);
  };

  // Get remaining topics
  const getRemainingTopics = () => {
    const politicsTopic = getPoliticsTopic();
    const topTopics = getTopTopics();
    
    // Filter out Politics and top topics
    return topics.filter(topic => {
      if (politicsTopic && topic.id === politicsTopic.id) return false;
      return !topTopics.some(topTopic => topTopic.id === topic.id);
    });
  };

  // Render topic section with sliding navigation
  const renderTopicSection = (topic, isLessPopular = false) => {
    const topicArticles = getArticlesForTopic(topic.id, isLessPopular);
    
    if (topicArticles.length === 0) return null;
    
    return (
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {getTopicIcon(topic.name)}
            <h2 className="text-2xl font-bold text-gray-900">{topic.name}</h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {topicArticles.length} articles
            </span>
          </div>
          
          {topicArticles.length > 3 && (
            <div className="flex gap-2">
              <button
                onClick={() => scrollTopicSection(topic.id, 'left')}
                className="p-2 bg-white border border-gray-300 rounded-full shadow-sm hover:shadow-md transition-shadow"
                aria-label="Scroll left"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => scrollTopicSection(topic.id, 'right')}
                className="p-2 bg-white border border-gray-300 rounded-full shadow-sm hover:shadow-md transition-shadow"
                aria-label="Scroll right"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
        
        <div 
          ref={el => topicRefs.current[topic.id] = el}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {topicArticles.map((article) => (
            <div key={article.id} className="flex-none w-80">
              <ArticleCard
                article={article}
                counterCount={showCounters ? counterCounts[article.id] || 0 : null}
                onClick={handleArticleClick}
                viewMode="card"
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2">
            {/* Hero Header */}
            <div className="mb-8 sm:mb-12">
              <div className="inline-flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg shadow-sm mb-6">
                <Sparkles className="w-4 h-4 text-orange-600" strokeWidth={2.5} />
                <span className="text-gray-700 font-semibold text-sm">
                  {searchTerm ? filteredArticles.length : totalArticleCount} {searchTerm ? 'Results' : 'Articles'}
                </span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4 sm:mb-6 text-gray-900 leading-tight">
                Explore Opinions
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl">
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
                  className="w-full pl-12 pr-4 py-3.5 text-base border-2 border-gray-300 focus:border-gray-900 focus:outline-none transition-all rounded-xl bg-white shadow-sm"
                />
              </div>
            </div>

            {/* Control Panel */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
              {/* Top Row: Stats and Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                {/* Article Count */}
                <div className="flex items-center gap-4 flex-wrap">
                  {selectedTopic && (
                    <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 px-3 py-2 rounded-lg">
                      {getTopicIcon(getSelectedTopicName())}
                      <span className="text-sm font-bold text-orange-700">{getSelectedTopicName()}</span>
                      <button
                        onClick={clearTopicFilter}
                        className="text-orange-600 hover:text-orange-700 ml-1"
                        aria-label="Clear filter"
                      >
                        <X size={16} strokeWidth={2.5} />
                      </button>
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
                    <RefreshCw size={16} className={loading || refreshing ? 'animate-spin' : ''} strokeWidth={2.5} />
                    <span className="hidden sm:inline">Refresh</span>
                  </button>
                  
                  <button 
                    onClick={openRandomArticle}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black px-4 py-2 font-bold transition-all duration-200 rounded-xl shadow-md hover:shadow-lg text-sm"
                    disabled={filteredArticles.length === 0 && articles.length === 0}
                  >
                    <Shuffle size={16} strokeWidth={2.5} />
                    <span className="hidden sm:inline">Random</span>
                  </button>

                  {/* View Mode Toggle */}
                  <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                      aria-label="Grid view"
                    >
                      <Grid size={16} className={viewMode === 'grid' ? 'text-gray-900' : 'text-gray-500'} strokeWidth={2.5} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                      aria-label="List view"
                    >
                      <List size={16} className={viewMode === 'list' ? 'text-gray-900' : 'text-gray-500'} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Filter Section */}
              <div className="pt-6 border-t border-gray-200 space-y-4">
                {/* Topic Filter */}
                <div>
                  <button
                    onClick={toggleTopicFilter}
                    className="flex items-center justify-between w-full sm:w-auto sm:min-w-[200px] px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Filter size={16} className="text-gray-600" strokeWidth={2.5} />
                      <span className="text-sm font-bold text-gray-700">Topic: {getSelectedTopicName()}</span>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform ${isTopicFilterOpen ? 'rotate-180' : ''}`} strokeWidth={2.5} />
                  </button>
                  
                  {isTopicFilterOpen && (
                    <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <button
                          onClick={() => handleTopicSelect(null)}
                          className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                            !selectedTopic 
                              ? 'bg-orange-600 text-white' 
                              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                          }`}
                        >
                          All Topics
                        </button>
                        {topics.map(topic => (
                          <button
                            key={topic.id}
                            onClick={() => handleTopicSelect(topic.id)}
                            className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${
                              selectedTopic === topic.id 
                                ? 'bg-orange-600 text-white' 
                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                            }`}
                          >
                            {getTopicIcon(topic.name)}
                            {topic.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Counter Opinions Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-700">Show Counter Opinions Only</span>
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
                  </label>
                </div>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-xl mb-8">
                <div className="text-lg font-bold text-red-900 mb-3">{error}</div>
                <button 
                  onClick={handleRefresh}
                  className="bg-gray-900 text-white px-6 py-2.5 font-bold hover:bg-gray-800 transition-all rounded-xl"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Loading State */}
            {loading && articles.length === 0 && (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 mb-4">
                  <RefreshCw className="h-8 w-8 text-white animate-spin" strokeWidth={2.5} />
                </div>
                <div className="text-xl font-bold text-gray-900">Loading articles...</div>
              </div>
            )}

            {/* No Articles State */}
            {!loading && articles.length === 0 && !error && (
              <div className="text-center py-16 sm:py-20 bg-white rounded-2xl shadow-lg border border-gray-200 p-8 sm:p-12">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-orange-600" strokeWidth={2.5} />
                </div>
                <div className="text-2xl sm:text-3xl font-black mb-4 text-gray-900">No Articles Yet</div>
                <div className="text-base sm:text-lg text-gray-600 mb-8">
                  Be the first to share your opinion!
                </div>
                <Link to="/write" className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black px-8 py-4 text-lg font-bold transition-all rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105">
                  Start Writing
                  <Zap className="h-5 w-5" strokeWidth={2.5} />
                </Link>
              </div>
            )}

            {/* No Results for Search/Filter */}
            {!loading && articles.length > 0 && filteredArticles.length === 0 && (
              <div className="text-center py-16 sm:py-20 bg-white rounded-2xl shadow-lg border border-gray-200 p-8 sm:p-12">
                <Search className="mx-auto mb-6 text-gray-400" size={64} strokeWidth={1.5} />
                <div className="text-2xl sm:text-3xl font-black mb-4 text-gray-900">
                  {searchTerm ? 'No Results Found' : "Doesn't Exist Yet"}
                </div>
                <div className="text-base sm:text-lg text-gray-600 mb-8">
                  {searchTerm 
                    ? 'Try different keywords or clear your search' 
                    : `No articles found for "${getSelectedTopicName()}". Be the first to write about it!`}
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  {searchTerm ? (
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 font-bold transition-all rounded-xl shadow-md"
                    >
                      Clear Search
                    </button>
                  ) : (
                    <>
                      <Link 
                        to="/write" 
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black px-8 py-3 font-bold transition-all rounded-xl shadow-md"
                      >
                        <Zap className="h-5 w-5" strokeWidth={2.5} />
                        Write Article
                      </Link>
                      <button 
                        onClick={clearTopicFilter}
                        className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 font-bold transition-all rounded-xl shadow-md"
                      >
                        Clear Filter
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Topic Sections */}
            {!loading && articles.length > 0 && !searchTerm && (
              <>
                {/* Politics Section (Always First) */}
                {(() => {
                  const politicsTopic = getPoliticsTopic();
                  return politicsTopic ? renderTopicSection(politicsTopic) : null;
                })()}
                
                {/* Top 3 Topics by Popularity */}
                {getTopTopics().map(topic => renderTopicSection(topic))}
                
                {/* Remaining Topics Section */}
                {(() => {
                  const remainingTopics = getRemainingTopics();
                  if (remainingTopics.length === 0) return null;
                  
                  return (
                    <div className="mb-10">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">More Topics</h2>
                      <div className="space-y-6">
                        {remainingTopics.map(topic => renderTopicSection(topic, true))}
                      </div>
                    </div>
                  );
                })()}
              </>
            )}

            {/* Articles Grid/List (when searching or filtering) */}
            {!loading && filteredArticles.length > 0 && (searchTerm || selectedTopic) && (
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
                      className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-10 py-4 text-lg font-bold transition-all disabled:opacity-50 rounded-xl shadow-lg hover:shadow-xl"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="h-5 w-5 animate-spin" strokeWidth={2.5} />
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

            {/* CTA Section */}
            {!loading && articles.length > 0 && (
              <div className="bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white rounded-2xl p-8 sm:p-12 text-center mt-8 shadow-2xl relative overflow-hidden">
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
                    <Zap className="h-5 w-5" strokeWidth={2.5} />
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          {/* Sidebar - 1 column */}
          <aside className="lg:col-span-1">
            <div className="sticky top-6">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-7 h-7 text-white" strokeWidth={2.5} />
                    <h3 className="text-2xl font-black text-white">Trending Now</h3>
                  </div>
                  <p className="text-sm text-orange-100">Most debated topics today</p>
                </div>
                <div className="bg-white">
                  <TrendingOpinions />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default BrowseArticles;