import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { 
  BookmarkPlus, 
  Clock, 
  Eye, 
  Calendar,
  Trash2,
  Award,
  Search,
  Filter,
  BookOpen,
  TrendingUp,
  Sparkles
} from 'lucide-react';

const LibraryPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState([]);
  const [filteredBookmarks, setFilteredBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTopic, setFilterTopic] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchBookmarks();
  }, [user, navigate]);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/bookmarks');
      setBookmarks(response.data.bookmarks);
      setFilteredBookmarks(response.data.bookmarks);
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
      setError('Failed to load bookmarked articles');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (articleId, e) => {
    e.stopPropagation();
    try {
      await axios.delete(`/articles/${articleId}/bookmark`);
      const updatedBookmarks = bookmarks.filter(b => b.id !== articleId);
      setBookmarks(updatedBookmarks);
      filterAndSortBookmarks(updatedBookmarks, searchQuery, filterTopic, sortBy);
    } catch (err) {
      console.error('Error removing bookmark:', err);
      setError('Failed to remove bookmark');
    }
  };

  const filterAndSortBookmarks = (items, search, topic, sort) => {
    let filtered = [...items];

    // Search filter
    if (search) {
      filtered = filtered.filter(bookmark =>
        bookmark.title.toLowerCase().includes(search.toLowerCase()) ||
        bookmark.display_name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Topic filter
    if (topic !== 'all') {
      filtered = filtered.filter(bookmark =>
        bookmark.topics?.includes(topic)
      );
    }

    // Sort
    if (sort === 'recent') {
      filtered.sort((a, b) => new Date(b.bookmarked_at) - new Date(a.bookmarked_at));
    } else if (sort === 'oldest') {
      filtered.sort((a, b) => new Date(a.bookmarked_at) - new Date(b.bookmarked_at));
    } else if (sort === 'views') {
      filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else if (sort === 'title') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    setFilteredBookmarks(filtered);
  };

  useEffect(() => {
    filterAndSortBookmarks(bookmarks, searchQuery, filterTopic, sortBy);
  }, [searchQuery, filterTopic, sortBy, bookmarks]);

  const generateSlug = (title) => {
    return title
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  const getTierColor = (tier) => {
    switch (tier?.toLowerCase()) {
      case 'silver': return 'from-gray-400 to-gray-600';
      case 'gold': return 'from-yellow-400 to-yellow-600';
      case 'platinum': return 'from-cyan-400 to-purple-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getTierEmoji = (tier) => {
    switch (tier?.toLowerCase()) {
      case 'silver': return '🥈';
      case 'gold': return '🥇';
      case 'display_name': return '🥇';
      case 'platinum': return '💎';
      default: return '🥈';
    }
  };

  const calculateReadingTime = (text) => {
    const wordsPerMinute = 200;
    const words = text.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get unique topics from bookmarks
  const allTopics = [...new Set(bookmarks.flatMap(b => b.topics || []))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-500 mx-auto"></div>
          <div className="text-2xl font-bold mt-4 text-gray-800">Loading your library...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-yellow-500" />
            <h1 className="text-4xl font-black text-gray-900">My Library</h1>
          </div>
          <p className="text-gray-600">Your collection of saved articles</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-yellow-500">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <BookmarkPlus className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">{bookmarks.length}</div>
                <div className="text-sm text-gray-600">Total Bookmarks</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-500">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">
                  {bookmarks.reduce((acc, b) => acc + calculateReadingTime(b.content), 0)}
                </div>
                <div className="text-sm text-gray-600">Minutes of Reading</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-green-500">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">
                  {bookmarks.filter(b => b.certified).length}
                </div>
                <div className="text-sm text-gray-600">Certified Articles</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search bookmarks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            {/* Topic Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterTopic}
                onChange={(e) => setFilterTopic(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 appearance-none bg-white"
              >
                <option value="all">All Topics</option>
                {allTopics.map(topic => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="relative">
              <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 appearance-none bg-white"
              >
                <option value="recent">Recently Bookmarked</option>
                <option value="oldest">Oldest First</option>
                <option value="views">Most Viewed</option>
                <option value="title">Alphabetical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-lg">
            <p className="text-red-700 font-bold">{error}</p>
          </div>
        )}

        {/* Bookmarks Grid */}
        {filteredBookmarks.length === 0 ? (
          <div className="bg-white rounded-xl p-12 shadow-lg text-center">
            <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {bookmarks.length === 0 ? 'No Bookmarks Yet' : 'No Results Found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {bookmarks.length === 0 
                ? 'Start building your library by bookmarking articles you want to read later'
                : 'Try adjusting your search or filters'}
            </p>
            {bookmarks.length === 0 && (
              <button
                onClick={() => navigate('/browse')}
                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl hover:shadow-xl transition-all duration-300"
              >
                Browse Articles
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                onClick={() => navigate(`/article/${bookmark.id}/${generateSlug(bookmark.title)}`)}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer border border-gray-200 hover:border-yellow-500 group"
              >
                {/* Article Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br ${getTierColor(bookmark.tier)} shadow-lg`}>
                        <span className="text-xl">{getTierEmoji(bookmark.tier)}</span>
                      </div>
                      <div>
                        <div className="font-bold text-sm text-gray-900">{bookmark.display_name}</div>
                        <div className="text-xs text-gray-500">{bookmark.tier?.toUpperCase()}</div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleRemoveBookmark(bookmark.id, e)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove Bookmark"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {/* Topics */}
                  {bookmark.topics && bookmark.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {bookmark.topics.map((topic, idx) => (
                        <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-yellow-600 transition-colors">
                    {bookmark.title}
                  </h3>

                  {/* Content Preview */}
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                    {bookmark.content.substring(0, 150)}...
                  </p>

                  {/* Badges */}
                  <div className="flex items-center gap-2 mb-4">
                    {bookmark.certified && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                        <Award size={12} />
                        Certified
                      </div>
                    )}
                    {bookmark.is_debate_winner && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                        <Award size={12} />
                        Winner
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryPage;