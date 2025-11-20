import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { axios } from '../../utils/apiUtils';
import ArticleCard from '../../components/ArticleCard';
import { fetchWithRetry, getCachedData, setCachedData } from '../../utils/apiUtils';
import TrendingOpinions from '../../components/TrendingOpinions';
import SidebarAd from '../../components/ads/SidebarAd';
import InFeedAd from '../../components/ads/InFeedAd';
import { Shuffle, RefreshCw, Search, Filter, TrendingUp, Zap, Grid, List, X, ChevronDown, Sparkles, Briefcase, DollarSign, Trophy, Pizza, Plane, Laptop, Heart, Film, Microscope, Globe, Flame, Eye, MessageCircle } from 'lucide-react';

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
  const [totalArticleCount, setTotalArticleCount] = useState(0);
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
    const topicParam = urlParams.get('topic');
    
    if (topicParam) {
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

  useEffect(() => {
    setArticles([]);
    setCurrentPage(1);
    setTotalArticleCount(0);
    fetchArticles(true);
  }, [selectedTopic]);

  useEffect(() => {
    if (currentPage > 1) {
      fetchArticles();
    }
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
      
      newArticles = [...newArticles].sort((a, b) => {
        if (a.certified && !b.certified) return -1;
        if (!a.certified && b.certified) return 1;
        return (b.views || 0) - (a.views || 0);
      });
      
      if (reset) {
        setArticles(newArticles);
        setTotalArticleCount(newArticles.length);
      } else {
        setArticles(prev => {
          const existingIds = new Set(prev.map(article => article.id));
          const uniqueNewArticles = newArticles.filter(article => !existingIds.has(article.id));
          const combined = [...prev, ...uniqueNewArticles];
          setTotalArticleCount(combined.length);
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
    return <IconComponent className="w-4 h-4" />;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-200/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700"></div>
        <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-red-200/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Compact Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-1 flex items-center gap-3">
                <Flame className="w-8 h-8 text-orange-500" />
                Explore
              </h1>
              <p className="text-sm text-gray-600">
                {searchTerm ? filteredArticles.length : totalArticleCount} articles • {topics.length} topics
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={handleRefresh}
                className="p-2.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-all shadow-sm"
                disabled={loading || refreshing}
              >
                <RefreshCw size={18} className={loading || refreshing ? 'animate-spin text-orange-500' : 'text-gray-700'} />
              </button>
              
              <button 
                onClick={openRandomArticle}
                className="p-2.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl transition-all shadow-sm"
                disabled={filteredArticles.length === 0 && articles.length === 0}
              >
                <Shuffle size={18} />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-11 pr-4 py-3 text-sm border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all rounded-xl bg-white/80 backdrop-blur-sm shadow-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-4">
            {/* Topics Filter Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                  <Filter size={16} className="text-orange-500" />
                  Topics
                </h3>
              </div>
              
              <div className="p-3">
                <div className="space-y-1.5">
                  <button
                    onClick={() => handleTopicSelect(null)}
                    className={`w-full px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left ${
                      !selectedTopic 
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md' 
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    All Topics
                  </button>
                  
                  {topics.map(topic => (
                    <button
                      key={topic.id}
                      onClick={() => handleTopicSelect(topic.id)}
                      className={`w-full px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                        selectedTopic === topic.id 
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md' 
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {getTopicIcon(topic.name)}
                      {topic.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* View Options Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-sm p-4 space-y-4">
              {/* View Mode */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-2 block">View</label>
                <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex-1 p-2 rounded-md transition-all flex items-center justify-center gap-1.5 text-xs font-semibold ${
                      viewMode === 'grid' 
                        ? 'bg-white shadow-sm text-orange-600' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Grid size={14} />
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex-1 p-2 rounded-md transition-all flex items-center justify-center gap-1.5 text-xs font-semibold ${
                      viewMode === 'list' 
                        ? 'bg-white shadow-sm text-orange-600' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <List size={14} />
                    List
                  </button>
                </div>
              </div>

              {/* Counter Toggle */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-600">Counter Opinions</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={showCounters}
                      onChange={handleToggleCounters}
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-500 peer-checked:to-red-500"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Trending Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-5 h-5 text-white" />
                  <h3 className="text-base font-black text-white">Trending</h3>
                </div>
                <p className="text-xs text-orange-100">Most debated today</p>
              </div>
              <TrendingOpinions />
            </div>

            {/* NEW: Add Advertisement Here */}
            <SidebarAd />
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Active Filters */}
            {selectedTopic && (
              <div className="mb-4 flex items-center gap-2">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md">
                  {getTopicIcon(getSelectedTopicName())}
                  {getSelectedTopicName()}
                  <button
                    onClick={clearTopicFilter}
                    className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
                <div className="text-base font-bold text-red-900 mb-3">{error}</div>
                <button 
                  onClick={handleRefresh}
                  className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 font-semibold transition-all rounded-lg text-sm"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Loading State */}
            {loading && articles.length === 0 && (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-orange-500 to-red-500 mb-4 shadow-lg">
                  <RefreshCw className="h-7 w-7 text-white animate-spin" />
                </div>
                <div className="text-lg font-bold text-gray-900">Loading articles...</div>
              </div>
            )}

            {/* No Articles */}
            {!loading && articles.length === 0 && !error && (
              <div className="text-center py-16 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200 p-12">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-orange-600" />
                </div>
                <div className="text-2xl font-black mb-3 text-gray-900">No Articles Yet</div>
                <div className="text-sm text-gray-600 mb-6">Be the first to share your opinion!</div>
                <Link to="/write" className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 text-sm font-bold transition-all rounded-xl shadow-lg">
                  Start Writing
                  <Zap className="h-4 w-4" />
                </Link>
              </div>
            )}

            {/* No Results */}
            {!loading && articles.length > 0 && filteredArticles.length === 0 && (
              <div className="text-center py-16 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200 p-12">
                <Search className="mx-auto mb-6 text-gray-400" size={48} />
                <div className="text-2xl font-black mb-3 text-gray-900">
                  {searchTerm ? 'No Results Found' : "Doesn't Exist Yet"}
                </div>
                <div className="text-sm text-gray-600 mb-6">
                  {searchTerm 
                    ? 'Try different keywords or clear your search' 
                    : `No articles found for "${getSelectedTopicName()}"`}
                </div>
                <div className="flex items-center justify-center gap-3">
                  {searchTerm ? (
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 font-semibold transition-all rounded-lg text-sm"
                    >
                      Clear Search
                    </button>
                  ) : (
                    <>
                      <Link 
                        to="/write" 
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-2.5 font-semibold transition-all rounded-lg text-sm"
                      >
                        <Zap className="h-4 w-4" />
                        Write Article
                      </Link>
                      <button 
                        onClick={clearTopicFilter}
                        className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 font-semibold transition-all rounded-lg text-sm"
                      >
                        Clear Filter
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Articles Feed */}
            {!loading && filteredArticles.length > 0 && (
              <>
                <div className={viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6' 
                  : 'flex flex-col gap-4 mb-6'
                }>
                  {filteredArticles.map((article, index) => (
                    <React.Fragment key={article.id}>
                      <ArticleCard
                        article={article}
                        counterCount={showCounters ? counterCounts[article.id] || 0 : null}
                        onClick={handleArticleClick}
                        viewMode={viewMode}
                      />
                      {/* NEW: Add In-Feed Ad every 6 articles */}
                      {(index + 1) % 6 === 0 && index !== filteredArticles.length - 1 && (
                        <InFeedAd className={viewMode === 'grid' ? 'sm:col-span-2' : ''} />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Load More */}
                {!searchTerm && hasMore && (
                  <div className="text-center mb-6">
                    <button
                      onClick={handleLoadMore}
                      disabled={loading}
                      className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-900 px-8 py-3 font-semibold transition-all disabled:opacity-50 rounded-xl border border-gray-200 shadow-sm"
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

                {/* End Message */}
                {!searchTerm && !hasMore && articles.length > 0 && (
                  <div className="text-center py-6">
                    <span className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                      You've seen it all
                    </span>
                  </div>
                )}
              </>
            )}

            {/* CTA Banner */}
            {!loading && filteredArticles.length > 0 && (
              <div className="mt-8 bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 rounded-2xl p-8 text-center relative overflow-hidden shadow-xl">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                  <h2 className="text-2xl sm:text-3xl font-black mb-2 text-white">
                    Share Your Voice
                  </h2>
                  <p className="text-sm text-orange-100 mb-6 max-w-md mx-auto">
                    Join thousands of writers sharing their perspectives
                  </p>
                  <Link 
                    to="/write" 
                    className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-orange-600 px-6 py-3 font-bold transition-all rounded-xl shadow-lg"
                  >
                    Start Writing
                    <Zap className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BrowseArticles;