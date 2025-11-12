import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  fetchRedFlaggedPosts, 
  fetchTrendingCompanies,
  fetchActiveTopics,
  getExperienceBadgeColor,
  getRatingColor,
  EXPERIENCE_TYPES,
  SORT_OPTIONS
} from '../utils/redFlaggedApi';

const BrowseRedFlaggedPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [trendingCompanies, setTrendingCompanies] = useState([]);
  const [activeTopics, setActiveTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    company: searchParams.get('company') || '',
    experienceType: searchParams.get('experienceType') || '',
    topicId: searchParams.get('topicId') || '',
    minRating: searchParams.get('minRating') || '',
    maxRating: searchParams.get('maxRating') || '',
    sort: searchParams.get('sort') || 'recent'
  });
  const [offset, setOffset] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const limit = 20;
  
  useEffect(() => {
    fetchPosts();
    fetchTrending();
    fetchTopics();
  }, [filters, offset]);
  
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await fetchRedFlaggedPosts({
        ...filters,
        limit,
        offset
      });
      
      setPosts(data.posts);
      setTotal(data.total);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchTrending = async () => {
    try {
      const data = await fetchTrendingCompanies(5);
      setTrendingCompanies(data.companies);
    } catch (error) {
      console.error('Failed to fetch trending companies:', error);
    }
  };
  
  const fetchTopics = async () => {
    try {
      const data = await fetchActiveTopics();
      setActiveTopics(data.topics);
    } catch (error) {
      console.error('Failed to fetch topics:', error);
    }
  };
  
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setOffset(0);
    
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    handleFilterChange('company', searchQuery);
  };
  
  const clearFilters = () => {
    setFilters({
      company: '',
      experienceType: '',
      topicId: '',
      minRating: '',
      maxRating: '',
      sort: 'recent'
    });
    setSearchQuery('');
    setOffset(0);
    setSearchParams({});
  };
  
  const PostCard = ({ post }) => (
    <Link 
      to={`/redflagged/${post.id}`}
      className="block bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden group border-2 border-transparent hover:border-red-500"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-2xl font-black text-gray-900 group-hover:text-red-600 transition mb-2">
              {post.company_name}
            </h3>
            {post.position && (
              <p className="text-sm text-gray-600 mb-2">📍 {post.position}</p>
            )}
            {post.topic_title && (
              <div className="mb-3">
                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                  💭 {post.topic_title}
                </span>
              </div>
            )}
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getExperienceBadgeColor(post.experience_type)}`}>
              {post.experience_type}
            </span>
          </div>
          <div className="text-center ml-4">
            <div className={`text-4xl font-black ${getRatingColor(post.overall_rating)}`}>
              {Number(post.overall_rating).toFixed(1)}
            </div>
            <div className="text-xs text-gray-500 mt-1">★★★★★</div>
          </div>
        </div>
        
        <p className="text-gray-700 mb-4 line-clamp-3 leading-relaxed">
          {post.story}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="font-semibold">👤</span> {post.author_name}
            </span>
            <span className="flex items-center gap-1">
              <span className="font-semibold">👁️</span> {post.views}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="font-semibold">❤️</span> {post.reaction_count}
            </span>
            <span className="flex items-center gap-1">
              <span className="font-semibold">💬</span> {post.comment_count || 0}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 via-red-700 to-orange-600 text-white py-12 px-4 shadow-xl">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-black mb-3 drop-shadow-lg">
            🚩 RedFlagged
          </h1>
          <p className="text-xl md:text-2xl mb-6 opacity-90">
            Where workers speak freely about their workplace experiences
          </p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search companies..."
                className="flex-1 px-6 py-4 rounded-xl text-gray-900 text-lg focus:ring-4 focus:ring-white/50 outline-none"
              />
              <button
                type="submit"
                className="bg-white text-red-600 font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition shadow-lg"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Active Topics */}
        {activeTopics.length > 0 && (
          <div className="mb-8">
            <h2 className="text-3xl font-black text-gray-900 mb-4">
              💭 Topics to Write About
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeTopics.map(topic => (
                <div
                  key={topic.id}
                  className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white shadow-lg hover:shadow-2xl transition-all cursor-pointer group"
                >
                  <h3 className="text-xl font-bold mb-2 group-hover:scale-105 transition-transform">
                    {topic.title}
                  </h3>
                  <p className="text-sm opacity-90 mb-4 line-clamp-2">
                    {topic.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <Link
                      to={`/redflagged/write?topic=${topic.id}`}
                      className="bg-white text-purple-600 font-bold px-4 py-2 rounded-lg hover:bg-gray-100 transition text-sm"
                    >
                      ✍️ Write Response
                    </Link>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleFilterChange('topicId', topic.id);
                      }}
                      className="text-white/80 hover:text-white text-sm underline"
                    >
                      View All →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Compact Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-5 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Filters</h3>
                {(filters.company || filters.experienceType || filters.topicId || filters.minRating || filters.maxRating) && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-red-600 hover:underline font-semibold"
                  >
                    Clear All
                  </button>
                )}
              </div>
              
              {/* Experience Type */}
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Experience</label>
                <select
                  value={filters.experienceType}
                  onChange={(e) => handleFilterChange('experienceType', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
                >
                  <option value="">All Types</option>
                  {EXPERIENCE_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              {/* Rating Range */}
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Rating</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={filters.minRating}
                    onChange={(e) => handleFilterChange('minRating', e.target.value)}
                    placeholder="Min"
                    className="w-1/2 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
                  />
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={filters.maxRating}
                    onChange={(e) => handleFilterChange('maxRating', e.target.value)}
                    placeholder="Max"
                    className="w-1/2 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
              </div>
              
              {/* Sort By */}
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Sort By</label>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
                >
                  {SORT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Trending Companies */}
              {trendingCompanies.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                    🔥 Trending
                  </h4>
                  <div className="space-y-2">
                    {trendingCompanies.map(company => (
                      <button
                        key={company.company_name}
                        onClick={() => handleFilterChange('company', company.company_name)}
                        className="w-full text-left p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg hover:from-red-100 hover:to-orange-100 transition group"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-semibold text-sm group-hover:text-red-600 transition">
                            {company.company_name}
                          </span>
                          <span className="text-xs text-gray-500">{company.post_count} posts</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${getRatingColor(company.avg_rating)}`}>
                            ★ {parseFloat(company.avg_rating).toFixed(1)}
                          </span>
                          <span className="text-xs text-gray-500">
                            👁️ {company.total_views}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Header with Share Button */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black text-gray-900">
                  {total} {total === 1 ? 'Story' : 'Stories'}
                </h2>
                {(filters.company || filters.experienceType || filters.topicId) && (
                  <p className="text-sm text-gray-600 mt-1">
                    {filters.company && `Company: ${filters.company}`}
                    {filters.experienceType && ` • Type: ${filters.experienceType}`}
                    {filters.topicId && ` • Topic filter active`}
                  </p>
                )}
              </div>
              <Link
                to="/redflagged/write"
                className="bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold px-6 py-3 rounded-xl hover:from-red-700 hover:to-orange-700 transition shadow-lg flex items-center gap-2"
              >
                <span className="text-xl">✍️</span>
                Share Your Story
              </Link>
            </div>
            
            {/* Loading State */}
            {loading && (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-500 mx-auto"></div>
                <p className="mt-4 text-gray-600 font-semibold">Loading stories...</p>
              </div>
            )}
            
            {/* Posts Grid */}
            {!loading && (
              <>
                {posts.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">🚩</div>
                    <p className="text-2xl font-bold text-gray-900 mb-2">No stories found</p>
                    <p className="text-gray-600 mb-6">
                      Be the first to share your experience!
                    </p>
                    <Link
                      to="/redflagged/write"
                      className="inline-block bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold px-8 py-4 rounded-xl hover:from-red-700 hover:to-orange-700 transition shadow-lg"
                    >
                      Share Your Story
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {posts.map(post => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                )}
                
                {/* Pagination */}
                {total > limit && (
                  <div className="mt-8 flex justify-center items-center gap-2">
                    <button
                      onClick={() => setOffset(Math.max(0, offset - limit))}
                      disabled={offset === 0}
                      className="px-5 py-3 bg-white rounded-xl font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                    >
                      ← Previous
                    </button>
                    <span className="px-5 py-3 font-semibold">
                      Page {Math.floor(offset / limit) + 1} of {Math.ceil(total / limit)}
                    </span>
                    <button
                      onClick={() => setOffset(offset + limit)}
                      disabled={offset + limit >= total}
                      className="px-5 py-3 bg-white rounded-xl font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowseRedFlaggedPage;