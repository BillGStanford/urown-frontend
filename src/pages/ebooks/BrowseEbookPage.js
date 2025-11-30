import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../../context/UserContext';
import { BookOpen, Search, Filter, Clock, User, Eye, Calendar, ChevronRight, Star, ArrowLeft, ArrowRight, Bookmark, Heart, MessageSquare, Zap } from 'lucide-react';

const BrowseEbookPage = () => {
  const { user } = useUser();
  const [ebooks, setEbooks] = useState([]);
  const [continueReading, setContinueReading] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: 'all', // all, short, long
    sort: 'recent', // recent, popular, title
    search: '',
    tagId: null
  });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 12;

  useEffect(() => {
    fetchTags();
    if (user) {
      fetchContinueReading();
    }
  }, [user]);

  useEffect(() => {
    fetchEbooks();
  }, [filters, page]);

  const fetchTags = async () => {
    try {
      const response = await axios.get('/ebooks/tags');
      setTags(response.data.tags || []);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const fetchContinueReading = async () => {
    try {
      const response = await axios.get('/user/continue-reading');
      setContinueReading(response.data.books || []);
    } catch (error) {
      console.error('Error fetching continue reading:', error);
    }
  };

  const fetchEbooks = async () => {
    setLoading(true);
    try {
      const params = {
        limit,
        offset: (page - 1) * limit
      };
      
      if (filters.search) params.search = filters.search;
      if (filters.type !== 'all') params.type = filters.type;
      if (filters.sort !== 'recent') params.sort = filters.sort;
      if (filters.tagId) params.tagId = filters.tagId;
      
      const response = await axios.get('/ebooks', { params });
      setEbooks(response.data.ebooks || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error('Error fetching ebooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
            <BookOpen className="w-8 h-8 text-yellow-500" />
            Browse Ebooks
          </h1>
          <p className="text-gray-600">Discover books from our community of writers</p>
        </div>

        {/* Continue Reading Section */}
        {user && continueReading.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-yellow-500" />
              Continue Reading
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {continueReading.map(book => (
                <Link
                  key={book.id}
                  to={`/ebooks/${book.slug}/read/${book.chapter_id}`}
                  className="group block bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                >
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-md mb-3 overflow-hidden">
                    {book.cover_image ? (
                      <img 
                        src={book.cover_image} 
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-yellow-600 transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {book.author_name}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {Math.round((parseFloat(book.progress_percentage) || 0) * 100)}% complete
                    </span>
                    <span className="text-xs text-gray-500">
                      {book.chapter_title}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search by title or author..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Book Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Book Length</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value="all">All Books</option>
                <option value="short">Short Books (&lt;30 pages)</option>
                <option value="long">Long Books (30+ pages)</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value="recent">Most Recent</option>
                <option value="popular">Most Popular</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </div>

            {/* Tag Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Genre</label>
              <select
                value={filters.tagId || ''}
                onChange={(e) => handleFilterChange('tagId', e.target.value || null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value="">All Genres</option>
                {tags.map(tag => (
                  <option key={tag.id} value={tag.id}>{tag.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-gray-600">
          Showing {ebooks.length} of {total} books
        </div>

        {/* Book Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-200"></div>
          </div>
        ) : ebooks.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No books found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters or be the first to write a book!</p>
            {user && (
              <Link
                to="/write-ebook"
                className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                <Zap className="w-4 h-4" />
                Write Your Book
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {ebooks.map(book => (
                <Link
                  key={book.id}
                  to={`/ebooks/${book.slug}`}
                  className="group block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all hover:-translate-y-1"
                >
                  <div className="aspect-w-16 aspect-h-9 bg-gray-100 h-48 flex items-center justify-center">
                    {book.cover_image ? (
                      <img 
                        src={book.cover_image} 
                        alt={book.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <BookOpen className="w-16 h-16 text-gray-400" />
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-yellow-600 transition-colors">
                        {book.title}
                      </h3>
                      {book.page_count >= 30 && (
                        <div className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full font-medium">
                          Featured
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      by {book.author_name}
                    </p>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {book.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {book.views || 0} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(book.published_at || book.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <span className="text-gray-700 font-medium">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}

        {/* CTA Section */}
        {!user && (
          <div className="bg-yellow-50 rounded-xl p-8 text-center mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Share Your Story
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Join our community of authors and share your knowledge with the world.
            </p>
            <Link
              to="/write-ebook"
              className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              <Zap className="w-5 h-5" />
              Start Writing
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseEbookPage;