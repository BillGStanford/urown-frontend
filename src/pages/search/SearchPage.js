// src/pages/search/SearchPage.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Search, 
  X, 
  FileText, 
  BookOpen, 
  Clock, 
  ChevronRight,
  User,
  Eye,
  Users
} from 'lucide-react';

const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://urown-backend.onrender.com/api'  
  : 'http://localhost:5000/api';

const SearchPage = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('all'); // 'all', 'articles', 'ebooks', 'authors'
  const [searchResults, setSearchResults] = useState({ articles: [], ebooks: [], authors: [] });
  const [suggestions, setSuggestions] = useState({ articles: [], ebooks: [], authors: [] });
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const searchInputRef = useRef(null);
  const searchPageRef = useRef(null);

  // Focus input when search opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current.focus(), 100);
    }
  }, [isOpen]);

  // Load recent searches from localStorage
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      try {
        setRecentSearches(JSON.parse(savedSearches));
      } catch (e) {
        console.error('Error parsing recent searches:', e);
      }
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearch = useCallback((query) => {
    if (!query.trim()) return;
    
    const newRecentSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(newRecentSearches);
    localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
  }, [recentSearches]);

  // Fetch suggestions as user types
  const fetchSuggestions = useCallback(async (query) => {
    if (!query.trim()) {
      setSuggestions({ articles: [], ebooks: [], authors: [] });
      return;
    }

    try {
      const params = new URLSearchParams();
      params.append('q', query);
      params.append('limit', '5');
      
      const [articlesRes, ebooksRes, authorsRes] = await Promise.all([
        axios.get(`${API_URL}/search/suggestions/articles?${params}`),
        axios.get(`${API_URL}/search/suggestions/ebooks?${params}`),
        axios.get(`${API_URL}/search/suggestions/authors?${params}`)
      ]);
      
      setSuggestions({
        articles: articlesRes.data.suggestions || [],
        ebooks: ebooksRes.data.suggestions || [],
        authors: authorsRes.data.suggestions || []
      });
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions({ articles: [], ebooks: [], authors: [] });
    }
  }, []);

  // Handle search input change
  const handleInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim()) {
      fetchSuggestions(query);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // Perform search
  const performSearch = useCallback(async (query) => {
    if (!query.trim()) return;
    
    setLoading(true);
    setShowSuggestions(false);
    saveRecentSearch(query);
    
    try {
      const params = new URLSearchParams();
      params.append('q', query);
      
      let endpoint = `${API_URL}/search`;
      if (searchType !== 'all') {
        endpoint = `${API_URL}/search/${searchType}`;
      }
      
      const response = await axios.get(`${endpoint}?${params}`);
      
      if (searchType === 'all') {
        setSearchResults({
          articles: response.data.articles || [],
          ebooks: response.data.ebooks || [],
          authors: response.data.authors || []
        });
      } else if (searchType === 'articles') {
        setSearchResults({ articles: response.data.articles || [], ebooks: [], authors: [] });
      } else if (searchType === 'ebooks') {
        setSearchResults({ articles: [], ebooks: response.data.ebooks || [], authors: [] });
      } else if (searchType === 'authors') {
        setSearchResults({ articles: [], ebooks: [], authors: response.data.authors || [] });
      }
    } catch (error) {
      console.error('Error performing search:', error);
      setSearchResults({ articles: [], ebooks: [], authors: [] });
    } finally {
      setLoading(false);
    }
  }, [searchType, saveRecentSearch]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion, type) => {
    setSearchQuery(suggestion);
    performSearch(suggestion);
  };

  // Handle recent search click
  const handleRecentSearchClick = (query) => {
    setSearchQuery(query);
    performSearch(query);
  };

  // Handle result click
  const handleResultClick = (result, type) => {
    onClose();
    if (type === 'article') {
      navigate(`/article/${result.id}`);
    } else if (type === 'ebook') {
      navigate(`/ebooks/${result.id}`);
    } else if (type === 'author') {
      navigate(`/user/${result.display_name}`);
    }
  };

  // Close search on escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchPageRef.current && !searchPageRef.current.contains(e.target) && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Search Container */}
      <div 
        ref={searchPageRef}
        className={`absolute top-0 left-0 right-0 bg-white shadow-2xl transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        {/* Search Header */}
        <div className="border-b border-gray-200">
          <div className="max-w-4xl mx-auto p-4">
            <form onSubmit={handleSubmit} className="relative">
              <div className="flex items-center">
                <Search className="absolute left-4 h-5 w-5 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleInputChange}
                  placeholder="Search for articles, ebooks, and authors..."
                  className="w-full pl-12 pr-12 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={onClose}
                  className="absolute right-4 p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* Search Type Tabs */}
              <div className="flex mt-4 space-x-1">
                <button
                  type="button"
                  onClick={() => setSearchType('all')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    searchType === 'all'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setSearchType('articles')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    searchType === 'articles'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Articles
                </button>
                <button
                  type="button"
                  onClick={() => setSearchType('ebooks')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    searchType === 'ebooks'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Ebooks
                </button>
                <button
                  type="button"
                  onClick={() => setSearchType('authors')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    searchType === 'authors'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Authors
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Search Content */}
        <div className="max-w-4xl mx-auto p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}
          
          {/* Suggestions */}
          {!loading && showSuggestions && searchQuery && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">Suggestions</h3>
              <div className="space-y-2">
                {suggestions.articles.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-400 mb-1">Articles</h4>
                    {suggestions.articles.map((suggestion, index) => (
                      <button
                        key={`article-${index}`}
                        onClick={() => handleSuggestionClick(suggestion, 'articles')}
                        className="flex items-center w-full p-2 hover:bg-gray-100 rounded-md text-left"
                      >
                        <FileText className="h-4 w-4 text-gray-400 mr-3" />
                        <span>{suggestion}</span>
                      </button>
                    ))}
                  </div>
                )}
                
                {suggestions.ebooks.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-400 mb-1">Ebooks</h4>
                    {suggestions.ebooks.map((suggestion, index) => (
                      <button
                        key={`ebook-${index}`}
                        onClick={() => handleSuggestionClick(suggestion, 'ebooks')}
                        className="flex items-center w-full p-2 hover:bg-gray-100 rounded-md text-left"
                      >
                        <BookOpen className="h-4 w-4 text-gray-400 mr-3" />
                        <span>{suggestion}</span>
                      </button>
                    ))}
                  </div>
                )}
                
                {suggestions.authors.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-400 mb-1">Authors</h4>
                    {suggestions.authors.map((suggestion, index) => (
                      <button
                        key={`author-${index}`}
                        onClick={() => handleSuggestionClick(suggestion, 'authors')}
                        className="flex items-center w-full p-2 hover:bg-gray-100 rounded-md text-left"
                      >
                        <User className="h-4 w-4 text-gray-400 mr-3" />
                        <span>{suggestion}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Recent Searches */}
          {!loading && !searchQuery && recentSearches.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center mb-3">
                <Clock className="h-4 w-4 text-gray-400 mr-2" />
                <h3 className="text-sm font-semibold text-gray-500">Recent Searches</h3>
              </div>
              <div className="space-y-2">
                {recentSearches.map((query, index) => (
                  <button
                    key={`recent-${index}`}
                    onClick={() => handleRecentSearchClick(query)}
                    className="flex items-center w-full p-2 hover:bg-gray-100 rounded-md text-left"
                  >
                    <Search className="h-4 w-4 text-gray-400 mr-3" />
                    <span>{query}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Search Results */}
          {!loading && searchResults.articles.length === 0 && searchResults.ebooks.length === 0 && searchResults.authors.length === 0 && searchQuery && (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No results found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          )}
          
          {/* Article Results */}
          {!loading && searchResults.articles.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">
                Articles ({searchResults.articles.length})
              </h3>
              <div className="space-y-3">
                {searchResults.articles.map((article) => (
                  <div
                    key={article.id}
                    onClick={() => handleResultClick(article, 'article')}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start">
                      <FileText className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{article.title}</h4>
                        <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                          {article.content?.substring(0, 150)}...
                        </p>
                        <div className="flex items-center text-xs text-gray-500">
                          <User className="h-3 w-3 mr-1" />
                          <span className="mr-3">{article.author_name}</span>
                          <Eye className="h-3 w-3 mr-1" />
                          <span>{article.views || 0} views</span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Ebook Results */}
          {!loading && searchResults.ebooks.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">
                Ebooks ({searchResults.ebooks.length})
              </h3>
              <div className="space-y-3">
                {searchResults.ebooks.map((ebook) => (
                  <div
                    key={ebook.id}
                    onClick={() => handleResultClick(ebook, 'ebook')}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start">
                      <BookOpen className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{ebook.title}</h4>
                        <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                          {ebook.description || ebook.content?.substring(0, 150)}...
                        </p>
                        <div className="flex items-center text-xs text-gray-500">
                          <User className="h-3 w-3 mr-1" />
                          <span className="mr-3">{ebook.author_name}</span>
                          <Eye className="h-3 w-3 mr-1" />
                          <span>{ebook.views || 0} reads</span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Author Results */}
          {!loading && searchResults.authors.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">
                Authors ({searchResults.authors.length})
              </h3>
              <div className="space-y-3">
                {searchResults.authors.map((author) => (
                  <div
                    key={author.id}
                    onClick={() => handleResultClick(author, 'author')}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start">
                      <User className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{author.display_name}</h4>
                        <p className="text-sm text-gray-500 mb-2">
                          {author.bio || 'Author on UROWN'}
                        </p>
                        <div className="flex items-center text-xs text-gray-500">
                          <FileText className="h-3 w-3 mr-1" />
                          <span className="mr-3">{author.article_count || 0} articles</span>
                          <BookOpen className="h-3 w-3 mr-1" />
                          <span>{author.ebook_count || 0} ebooks</span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;