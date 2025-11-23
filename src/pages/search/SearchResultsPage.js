// src/pages/search/SearchResultsPage.js
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Search, 
  FileText, 
  BookOpen, 
  User,
  Eye,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';

const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://urown-backend.onrender.com/api'  
  : 'http://localhost:5000/api';

const SearchResultsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'all';
  
  const [searchResults, setSearchResults] = useState({ articles: [], ebooks: [], authors: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(type);

  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim()) {
        setSearchResults({ articles: [], ebooks: [], authors: [] });
        setLoading(false);
        return;
      }
      
      try {
        const params = new URLSearchParams();
        params.append('q', query);
        
        let endpoint = `${API_URL}/search`;
        if (type !== 'all') {
          endpoint = `${API_URL}/search/${type}`;
        }
        
        const response = await axios.get(`${endpoint}?${params}`);
        
        if (type === 'all') {
          setSearchResults({
            articles: response.data.articles || [],
            ebooks: response.data.ebooks || [],
            authors: response.data.authors || []
          });
        } else if (type === 'articles') {
          setSearchResults({ articles: response.data.articles || [], ebooks: [], authors: [] });
        } else if (type === 'ebooks') {
          setSearchResults({ articles: [], ebooks: response.data.ebooks || [], authors: [] });
        } else if (type === 'authors') {
          setSearchResults({ articles: [], ebooks: [], authors: response.data.authors || [] });
        }
      } catch (error) {
        console.error('Error performing search:', error);
        setSearchResults({ articles: [], ebooks: [], authors: [] });
      } finally {
        setLoading(false);
      }
    };
    
    performSearch();
  }, [query, type]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const params = new URLSearchParams();
    params.append('q', query);
    if (tab !== 'all') {
      params.append('type', tab);
    }
    navigate(`/search/results?${params.toString()}`);
  };

  const handleResultClick = (result, resultType) => {
    if (resultType === 'article') {
      navigate(`/article/${result.id}`);
    } else if (resultType === 'ebook') {
      navigate(`/ebooks/${result.id}`);
    } else if (resultType === 'author') {
      navigate(`/user/${result.display_name}`);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={query}
                readOnly
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => handleTabChange('all')}
              className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'all' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              All Results
            </button>
            <button
              onClick={() => handleTabChange('articles')}
              className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'articles' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Articles
            </button>
            <button
              onClick={() => handleTabChange('ebooks')}
              className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'ebooks' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Ebooks
            </button>
            <button
              onClick={() => handleTabChange('authors')}
              className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'authors' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Authors
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {searchResults.articles.length === 0 && 
             searchResults.ebooks.length === 0 && 
             searchResults.authors.length === 0 && (
              <div className="text-center py-20">
                <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-500">Try adjusting your search terms</p>
              </div>
            )}
            
            {/* Article Results */}
            {(activeTab === 'all' || activeTab === 'articles') && searchResults.articles.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Articles ({searchResults.articles.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResults.articles.map((article) => (
                    <div
                      key={article.id}
                      onClick={() => handleResultClick(article, 'article')}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-start">
                        <FileText className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-2">{article.title}</h3>
                          <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                            {article.content?.substring(0, 150)}...
                          </p>
                          <div className="flex items-center text-xs text-gray-500">
                            <User className="h-3 w-3 mr-1" />
                            <span className="mr-3">{article.author_name}</span>
                            <Eye className="h-3 w-3 mr-1" />
                            <span>{article.views || 0} views</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Ebook Results */}
            {(activeTab === 'all' || activeTab === 'ebooks') && searchResults.ebooks.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Ebooks ({searchResults.ebooks.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResults.ebooks.map((ebook) => (
                    <div
                      key={ebook.id}
                      onClick={() => handleResultClick(ebook, 'ebook')}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-start">
                        <BookOpen className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-2">{ebook.title}</h3>
                          <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                            {ebook.description || ebook.content?.substring(0, 150)}...
                          </p>
                          <div className="flex items-center text-xs text-gray-500">
                            <User className="h-3 w-3 mr-1" />
                            <span className="mr-3">{ebook.author_name}</span>
                            <Eye className="h-3 w-3 mr-1" />
                            <span>{ebook.views || 0} reads</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Author Results */}
            {(activeTab === 'all' || activeTab === 'authors') && searchResults.authors.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Authors ({searchResults.authors.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResults.authors.map((author) => (
                    <div
                      key={author.id}
                      onClick={() => handleResultClick(author, 'author')}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-start">
                        <User className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-2">{author.display_name}</h3>
                          <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                            {author.bio || 'Author on UROWN'}
                          </p>
                          <div className="flex items-center text-xs text-gray-500">
                            <FileText className="h-3 w-3 mr-1" />
                            <span className="mr-3">{author.article_count || 0} articles</span>
                            <BookOpen className="h-3 w-3 mr-1" />
                            <span>{author.ebook_count || 0} ebooks</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;