import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { axios } from '../utils/apiUtils';
import ArticleCard from '../components/ArticleCard';
import { fetchWithRetry, getCachedData, setCachedData } from '../utils/apiUtils';
import TrendingOpinions from '../components/TrendingOpinions';
import { Shuffle, RefreshCw, Search, Filter, TrendingUp, Zap, Grid, List, X, ChevronDown, Sparkles, Briefcase, DollarSign, Trophy, Pizza, Plane, Laptop, Heart, Film, Microscope, Globe, Dice, Lightbulb, Coffee, Music, Smile, Sun, Moon, Cloud } from 'lucide-react';

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
  const [selectedMood, setSelectedMood] = useState(null);
  const [isMoodFilterOpen, setIsMoodFilterOpen] = useState(false);
  const [dailyPrompt, setDailyPrompt] = useState('');
  const articlesPerPage = 12;
  const navigate = useNavigate();
  const location = useLocation();

  // Daily prompts for inspiration
  const dailyPrompts = [
    "If you could have dinner with any historical figure, who would it be and why?",
    "What's a small thing that made you happy today?",
    "Describe your perfect weekend in 3 sentences",
    "What's a skill you'd love to learn and why?",
    "If you could solve one world problem, what would it be?",
    "What's the best advice you've ever received?",
    "Create a new holiday and describe its traditions",
    "What's something you've changed your mind about recently?",
    "If you could time travel, would you go to the past or future?",
    "What's a book/movie that changed your perspective?"
  ];

  // Moods for filtering
  const moods = [
    { id: 'inspired', name: 'Inspired', icon: Lightbulb, color: 'yellow' },
    { id: 'thoughtful', name: 'Thoughtful', icon: Coffee, color: 'brown' },
    { id: 'playful', name: 'Playful', icon: Smile, color: 'pink' },
    { id: 'relaxed', name: 'Relaxed', icon: Cloud, color: 'blue' },
    { id: 'energetic', name: 'Energetic', icon: Zap, color: 'orange' },
    { id: 'creative', name: 'Creative', icon: Music, color: 'purple' }
  ];

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
    
    // Set a random daily prompt
    const randomPrompt = dailyPrompts[Math.floor(Math.random() * dailyPrompts.length)];
    setDailyPrompt(randomPrompt);
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
  }, [selectedTopic, selectedMood]);

  // Fetch more articles when page changes
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
      
      const cacheKey = `articles-${articlesPerPage}-${offset}-false-${selectedTopic || 'all'}-${selectedMood || 'all'}`;
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
        
        if (selectedMood) {
          params.mood = selectedMood;
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

  const handleMoodSelect = (moodId) => {
    setIsMoodFilterOpen(false);
    setSelectedMood(moodId);
  };

  const clearTopicFilter = () => {
    setIsTopicFilterOpen(false);
    navigate('/browse');
  };

  const clearMoodFilter = () => {
    setIsMoodFilterOpen(false);
    setSelectedMood(null);
  };

  const toggleTopicFilter = () => {
    setIsTopicFilterOpen(!isTopicFilterOpen);
  };

  const toggleMoodFilter = () => {
    setIsMoodFilterOpen(!isMoodFilterOpen);
  };

  const getSelectedTopicName = () => {
    if (!selectedTopic) return 'All Topics';
    const topic = topics.find(t => t.id === selectedTopic);
    return topic ? topic.name : 'Unknown Topic';
  };

  const getSelectedMoodName = () => {
    if (!selectedMood) return 'All Moods';
    const mood = moods.find(m => m.id === selectedMood);
    return mood ? mood.name : 'Unknown Mood';
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

  const getMoodIcon = (moodId) => {
    const mood = moods.find(m => m.id === moodId);
    if (!mood) return <Sparkles className="w-4 h-4" strokeWidth={2.5} />;
    const IconComponent = mood.icon;
    return <IconComponent className="w-4 h-4" strokeWidth={2.5} />;
  };

  const getMoodColor = (moodId) => {
    const mood = moods.find(m => m.id === moodId);
    if (!mood) return 'gray';
    return mood.color;
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

  const handleNewPrompt = () => {
    const newPrompt = dailyPrompts[Math.floor(Math.random() * dailyPrompts.length)];
    setDailyPrompt(newPrompt);
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
                  {searchTerm ? filteredArticles.length : totalArticleCount} {searchTerm ? 'Results' : 'Thoughts'}
                </span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4 sm:mb-6 text-gray-900 leading-tight">
                Discover Ideas
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl">
                Explore thoughts, stories, and perspectives from our creative community
              </p>
              
              {/* Search Bar */}
              <div className="relative max-w-2xl">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search for ideas, stories, or people..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-12 pr-4 py-3.5 text-base border-2 border-gray-300 focus:border-gray-900 focus:outline-none transition-all rounded-xl bg-white shadow-sm"
                />
              </div>
            </div>

            {/* Daily Prompt Card */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 mb-8 border-2 border-purple-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200 rounded-full filter blur-3xl opacity-30 -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-pink-200 rounded-full filter blur-3xl opacity-30 -ml-20 -mb-20"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Lightbulb className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                  <h2 className="text-xl font-black text-gray-900">Daily Inspiration</h2>
                </div>
                
                <p className="text-lg text-gray-800 font-medium mb-4">{dailyPrompt}</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link 
                    to="/write" 
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
                  >
                    <PenTool className="w-4 h-4" strokeWidth={2.5} />
                    Write About This
                  </Link>
                  <button 
                    onClick={handleNewPrompt}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-bold rounded-xl transition-all text-sm"
                  >
                    <Dice className="w-4 h-4" strokeWidth={2.5} />
                    Get Another Prompt
                  </button>
                </div>
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
                  {selectedMood && (
                    <div className={`flex items-center gap-2 bg-${getMoodColor(selectedMood)}-50 border border-${getMoodColor(selectedMood)}-200 px-3 py-2 rounded-lg`}>
                      {getMoodIcon(selectedMood)}
                      <span className={`text-sm font-bold text-${getMoodColor(selectedMood)}-700`}>{getSelectedMoodName()}</span>
                      <button
                        onClick={clearMoodFilter}
                        className={`text-${getMoodColor(selectedMood)}-600 hover:text-${getMoodColor(selectedMood)}-700 ml-1`}
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
                    <span className="hidden sm:inline">Surprise Me</span>
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

                {/* Mood Filter */}
                <div>
                  <button
                    onClick={toggleMoodFilter}
                    className="flex items-center justify-between w-full sm:w-auto sm:min-w-[200px] px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Smile size={16} className="text-gray-600" strokeWidth={2.5} />
                      <span className="text-sm font-bold text-gray-700">Mood: {getSelectedMoodName()}</span>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform ${isMoodFilterOpen ? 'rotate-180' : ''}`} strokeWidth={2.5} />
                  </button>
                  
                  {isMoodFilterOpen && (
                    <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <button
                          onClick={() => handleMoodSelect(null)}
                          className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                            !selectedMood 
                              ? 'bg-gray-600 text-white' 
                              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                          }`}
                        >
                          All Moods
                        </button>
                        {moods.map(mood => (
                          <button
                            key={mood.id}
                            onClick={() => handleMoodSelect(mood.id)}
                            className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${
                              selectedMood === mood.id 
                                ? `bg-${mood.color}-600 text-white` 
                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                            }`}
                          >
                            <mood.icon className="w-4 h-4" strokeWidth={2.5} />
                            {mood.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Counter Opinions Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-700">Show Responses Only</span>
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
                <div className="text-xl font-bold text-gray-900">Loading thoughts...</div>
              </div>
            )}

            {/* No Articles State */}
            {!loading && articles.length === 0 && !error && (
              <div className="text-center py-16 sm:py-20 bg-white rounded-2xl shadow-lg border border-gray-200 p-8 sm:p-12">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-orange-600" strokeWidth={2.5} />
                </div>
                <div className="text-2xl sm:text-3xl font-black mb-4 text-gray-900">No Thoughts Yet</div>
                <div className="text-base sm:text-lg text-gray-600 mb-8">
                  Be the first to share your perspective!
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
                    : `No thoughts found for "${getSelectedTopicName()}". Be the first to write about it!`}
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
                        Share a Thought
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
            {!loading && filteredArticles.length > 0 && (
              <div className="bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white rounded-2xl p-8 sm:p-12 text-center mt-8 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-1/4 w-64 h-64 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
                  <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
                </div>
                
                <div className="relative z-10">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
                    Share Your Perspective
                  </h2>
                  <p className="text-base sm:text-lg md:text-xl mb-8 text-gray-300 max-w-2xl mx-auto">
                    Join the conversation. Your unique voice matters here.
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
                  <p className="text-sm text-orange-100">Popular conversations today</p>
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