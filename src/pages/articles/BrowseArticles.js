import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { axios } from '../../utils/apiUtils';
import ArticleCard from '../../components/ArticleCard';
import { fetchWithRetry, getCachedData, setCachedData } from '../../utils/apiUtils';
import TrendingOpinions from '../../components/TrendingOpinions';
import SidebarAd from '../../components/ads/SidebarAd';
import InFeedAd from '../../components/ads/InFeedAd';
import { Shuffle, RefreshCw, Search, Filter, TrendingUp, Zap, Grid, List, X, ChevronDown, Sparkles, Briefcase, DollarSign, Trophy, Pizza, Plane, Laptop, Heart, Film, Microscope, Globe, Flame, Eye, MessageCircle, BookOpen } from 'lucide-react';

function BrowseArticles() {
  const [articles, setArticles] = useState([]);
  const [ebooks, setEbooks] = useState([]);
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
  const [totalEbookCount, setTotalEbookCount] = useState(0);
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
        setEbooks([]);
        setCurrentPage(1);
        setTotalArticleCount(0);
        setTotalEbookCount(0);
      }
    } else if (selectedTopic !== null) {
      setSelectedTopic(null);
      setArticles([]);
      setEbooks([]);
      setCurrentPage(1);
      setTotalArticleCount(0);
      setTotalEbookCount(0);
    }
  }, [location.search, topics]);

  useEffect(() => {
    setArticles([]);
    setEbooks([]);
    setCurrentPage(1);
    setTotalArticleCount(0);
    setTotalEbookCount(0);
    fetchContent(true);
  }, [selectedTopic]);

  useEffect(() => {
    if (currentPage > 1) {
      fetchContent();
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

  const fetchContent = async (reset = false) => {
    try {
      setLoading(true);
      setRefreshing(true);
      const offset = reset ? 0 : (currentPage - 1) * articlesPerPage;
      
      // Always fetch both articles and ebooks
      const [articlesResponse, ebooksResponse] = await Promise.allSettled([
        fetchWithRetry(() => {
          const params = {
            limit: articlesPerPage,
            offset: offset,
            featured: 'false'
          };
          
          if (selectedTopic) {
            params.topicId = selectedTopic;
          }
          
          return axios.get('/articles', { params });
        }),
        fetchWithRetry(() => {
          const params = {
            limit: articlesPerPage,
            offset: offset
          };
          
          if (selectedTopic) {
            params.topicId = selectedTopic;
          }
          
          return axios.get('/ebooks', { params });
        })
      ]);
      
      // Handle articles
      if (articlesResponse.status === 'fulfilled') {
        let newArticles = articlesResponse.value.data.articles || [];
        
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
      }
      
      // Handle ebooks
      if (ebooksResponse.status === 'fulfilled') {
        const newEbooks = ebooksResponse.value.data.ebooks || [];
        
        if (reset) {
          setEbooks(newEbooks);
          setTotalEbookCount(newEbooks.length);
        } else {
          setEbooks(prev => {
            const existingIds = new Set(prev.map(ebook => ebook.id));
            const uniqueNewEbooks = newEbooks.filter(ebook => !existingIds.has(ebook.id));
            const combined = [...prev, ...uniqueNewEbooks];
            setTotalEbookCount(combined.length);
            return combined;
          });
        }
      }
      
      // Check if there's more content
      const totalItems = (articlesResponse.status === 'fulfilled' ? articlesResponse.value.data.articles?.length || 0 : 0) + 
                        (ebooksResponse.status === 'fulfilled' ? ebooksResponse.value.data.ebooks?.length || 0 : 0);
      setHasMore(totalItems === articlesPerPage);
    } catch (error) {
      console.error('Error fetching content:', error);
      setError('Failed to load content');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const openRandomArticle = () => {
    const availableArticles = articles.filter(article => article.parent_article_id === null);
    
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

  const filteredEbooks = ebooks.filter(ebook => {
    return ebook.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           ebook.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           ebook.description?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  const handleArticleClick = (article) => {
    console.log('Navigate to article:', article.id);
  };

  const handleEbookClick = (ebook) => {
    navigate(`/ebook/${ebook.id}`);
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    setArticles([]);
    setEbooks([]);
    setTotalArticleCount(0);
    setTotalEbookCount(0);
    fetchContent(true);
  };

  const totalItems = totalArticleCount + totalEbookCount;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Content</h1>
          <p className="text-gray-600">Discover articles and ebooks from our community</p>
        </div>

        {/* Search and Controls */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search Bar */}
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search articles and ebooks..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <button 
                onClick={handleRefresh}
                className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading || refreshing}
              >
                <RefreshCw size={20} className={loading || refreshing ? 'animate-spin text-yellow-600' : 'text-gray-700'} />
              </button>
              
              <button 
                onClick={openRandomArticle}
                className="p-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                disabled={filteredArticles.length === 0 && articles.length === 0}
              >
                <Shuffle size={20} />
              </button>
            </div>
          </div>

          {/* Content Type Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                true
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              All Content ({totalItems})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            {/* Topics Filter */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Filter size={16} className="text-yellow-500" />
                Topics
              </h3>
              
              <div className="space-y-2">
                <button
                  onClick={() => handleTopicSelect(null)}
                  className={`w-full px-3 py-2 rounded-md text-sm font-medium text-left transition-colors ${
                    !selectedTopic 
                      ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  All Topics
                </button>
                
                {topics.map(topic => (
                  <button
                    key={topic.id}
                    onClick={() => handleTopicSelect(topic.id)}
                    className={`w-full px-3 py-2 rounded-md text-sm font-medium text-left transition-colors flex items-center gap-2 ${
                      selectedTopic === topic.id 
                        ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {getTopicIcon(topic.name)}
                    {topic.name}
                  </button>
                ))}
              </div>
            </div>

            {/* View Options */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">View Options</h3>
              
              {/* View Mode */}
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Display Mode</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex-1 p-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                      viewMode === 'grid' 
                        ? 'bg-yellow-500 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Grid size={14} />
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex-1 p-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                      viewMode === 'list' 
                        ? 'bg-yellow-500 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <List size={14} />
                    List
                  </button>
                </div>
              </div>

              {/* Counter Toggle */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Show Counter Opinions</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={showCounters}
                      onChange={handleToggleCounters}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Trending */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp size={16} className="text-yellow-500" />
                Trending
              </h3>
              <TrendingOpinions />
            </div>

            {/* Advertisement */}
            <SidebarAd />
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Active Filters */}
            {selectedTopic && (
              <div className="mb-4 flex items-center gap-2">
                <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-full text-sm font-medium">
                  {getTopicIcon(getSelectedTopicName())}
                  {getSelectedTopicName()}
                  <button
                    onClick={clearTopicFilter}
                    className="hover:bg-yellow-200 rounded-full p-0.5 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                <div className="text-lg font-medium text-red-900 mb-3">{error}</div>
                <button 
                  onClick={handleRefresh}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 font-medium transition-colors rounded-md text-sm"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Loading State */}
            {loading && articles.length === 0 && ebooks.length === 0 && (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-500 mb-4">
                  <RefreshCw className="h-6 w-6 text-white animate-spin" />
                </div>
                <div className="text-lg font-medium text-gray-900">Loading content...</div>
              </div>
            )}

            {/* No Content */}
            {!loading && articles.length === 0 && ebooks.length === 0 && !error && (
              <div className="text-center py-16 bg-white rounded-lg border border-gray-200 p-12">
                <div className="w-16 h-16 mx-auto mb-6 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-yellow-600" />
                </div>
                <div className="text-xl font-medium text-gray-900 mb-3">No Content Yet</div>
                <div className="text-gray-600 mb-6">Be the first to share your perspective!</div>
                <Link to="/write" className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 font-medium transition-colors rounded-md">
                  Start Writing
                  <Zap className="h-4 w-4" />
                </Link>
              </div>
            )}

            {/* No Results */}
            {!loading && (articles.length > 0 || ebooks.length > 0) && 
             filteredArticles.length === 0 && filteredEbooks.length === 0 && (
              <div className="text-center py-16 bg-white rounded-lg border border-gray-200 p-12">
                <Search className="mx-auto mb-6 text-gray-400" size={48} />
                <div className="text-xl font-medium text-gray-900 mb-3">
                  {searchTerm ? 'No Results Found' : "Doesn't Exist Yet"}
                </div>
                <div className="text-gray-600 mb-6">
                  {searchTerm 
                    ? 'Try different keywords or clear your search' 
                    : `No content found for "${getSelectedTopicName()}"`}
                </div>
                <div className="flex items-center justify-center gap-3">
                  {searchTerm ? (
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 font-medium transition-colors rounded-md"
                    >
                      Clear Search
                    </button>
                  ) : (
                    <>
                      <Link 
                        to="/write" 
                        className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2.5 font-medium transition-colors rounded-md"
                      >
                        <Zap className="h-4 w-4" />
                        Write Article
                      </Link>
                      <button 
                        onClick={clearTopicFilter}
                        className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 font-medium transition-colors rounded-md"
                      >
                        Clear Filter
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Content Feed */}
            {((filteredArticles.length > 0 || filteredEbooks.length > 0) && !loading) && (
              <>
                <div className={viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6' 
                  : 'flex flex-col gap-6 mb-6'
                }>
                  {/* Articles */}
                  {filteredArticles.map((article, index) => (
                    <React.Fragment key={article.id}>
                      <ArticleCard
                        article={article}
                        counterCount={showCounters ? counterCounts[article.id] || 0 : null}
                        onClick={handleArticleClick}
                        viewMode={viewMode}
                      />
                      {/* Add In-Feed Ad every 6 articles */}
                      {(index + 1) % 6 === 0 && index !== filteredArticles.length - 1 && (
                        <InFeedAd className={viewMode === 'grid' ? 'sm:col-span-2 lg:col-span-3' : ''} />
                      )}
                    </React.Fragment>
                  ))}
                  
                  {/* Ebooks */}
                  {filteredEbooks.map((ebook) => (
                    <div key={ebook.id} className={viewMode === 'grid' ? '' : 'flex gap-4 bg-white rounded-lg border border-gray-200 p-4'}>
                      {viewMode === 'grid' ? (
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                          <div className="aspect-w-16 aspect-h-9 bg-yellow-50 h-48 flex items-center justify-center">
                            <BookOpen className="w-16 h-16 text-yellow-600" />
                          </div>
                          <div className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-medium text-yellow-600 uppercase tracking-wider">Ebook</span>
                              {ebook.price && (
                                <span className="text-xs font-medium text-green-600">
                                  {ebook.price === '0' ? 'Free' : `$${ebook.price}`}
                                </span>
                              )}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                              {ebook.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              <span>by {ebook.author}</span>
                              <span className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                {ebook.views || 0}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                              {ebook.description?.substring(0, 150) || 'No description available'}
                            </p>
                            <button
                              onClick={() => handleEbookClick(ebook)}
                              className="w-full py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-md transition-colors"
                            >
                              Read Ebook
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="w-24 h-32 bg-yellow-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-12 h-12 text-yellow-600" />
                          </div>
                          <div className="flex-grow">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-medium text-yellow-600 uppercase tracking-wider">Ebook</span>
                              {ebook.price && (
                                <span className="text-xs font-medium text-green-600">
                                  {ebook.price === '0' ? 'Free' : `$${ebook.price}`}
                                </span>
                              )}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {ebook.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              <span>by {ebook.author}</span>
                              <span className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                {ebook.views || 0}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                              {ebook.description?.substring(0, 150) || 'No description available'}
                            </p>
                            <button
                              onClick={() => handleEbookClick(ebook)}
                              className="py-2 px-4 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-md transition-colors"
                            >
                              Read Ebook
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {/* Load More */}
                {!searchTerm && hasMore && (
                  <div className="text-center mb-6">
                    <button
                      onClick={handleLoadMore}
                      disabled={loading}
                      className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-900 px-8 py-3 font-medium transition-colors rounded-md border border-gray-300"
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
                {!searchTerm && !hasMore && (articles.length > 0 || ebooks.length > 0) && (
                  <div className="text-center py-6">
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                      You've seen it all
                    </span>
                  </div>
                )}
              </>
            )}

            {/* CTA Banner */}
            {!loading && (filteredArticles.length > 0 || filteredEbooks.length > 0) && (
              <div className="mt-8 bg-yellow-50 rounded-lg p-8 text-center">
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                  Share Your Voice
                </h2>
                <p className="text-gray-600 mb-6">
                  Join thousands of writers sharing their perspectives on topics that matter
                </p>
                <Link 
                  to="/write" 
                  className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 font-medium transition-colors rounded-md"
                >
                  Start Writing
                  <Zap className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BrowseArticles;