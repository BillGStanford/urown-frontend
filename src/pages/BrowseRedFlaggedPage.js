// src/pages/BrowseRedFlaggedPage.js
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const BrowseRedFlaggedPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [trendingCompanies, setTrendingCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    company: searchParams.get('company') || '',
    experienceType: searchParams.get('experienceType') || '',
    minRating: searchParams.get('minRating') || '',
    maxRating: searchParams.get('maxRating') || '',
    sort: searchParams.get('sort') || 'recent'
  });
  const [offset, setOffset] = useState(0);
  const limit = 20;
  
  const experienceTypes = [
    'Toxic Management',
    'Pay Issues',
    'Poor Culture',
    'Overworked',
    'Discrimination',
    'Harassment',
    'Lack of Growth',
    'Great Experience',
    'Fair Treatment',
    'Good Benefits',
    'Work-Life Balance',
    'Other'
  ];
  
  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'controversial', label: 'Most Discussed' },
    { value: 'highest-rated', label: 'Highest Rated' },
    { value: 'lowest-rated', label: 'Lowest Rated' }
  ];
  
  useEffect(() => {
    fetchPosts();
    fetchTrendingCompanies();
  }, [filters, offset]);
  
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...filters,
        limit,
        offset
      });
      
      // Remove empty params
      Object.keys(filters).forEach(key => {
        if (!filters[key]) params.delete(key);
      });
      
      const response = await axios.get(`/api/redflagged?${params}`);
      setPosts(response.data.posts);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchTrendingCompanies = async () => {
    try {
      const response = await axios.get('/api/redflagged/trending/companies?limit=10');
      setTrendingCompanies(response.data.companies);
    } catch (error) {
      console.error('Failed to fetch trending companies:', error);
    }
  };
  
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setOffset(0);
    
    // Update URL params
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };
  
  const clearFilters = () => {
    setFilters({
      company: '',
      experienceType: '',
      minRating: '',
      maxRating: '',
      sort: 'recent'
    });
    setOffset(0);
    setSearchParams({});
  };
  
  const getExperienceBadgeColor = (type) => {
    const negativeTypes = ['Toxic Management', 'Pay Issues', 'Poor Culture', 'Overworked', 'Discrimination', 'Harassment', 'Lack of Growth'];
    return negativeTypes.includes(type) ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700';
  };
  
  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  const PostCard = ({ post }) => (
    <Link 
      to={`/redflagged/${post.id}`}
      className="block bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-red-600 transition mb-2">
              {post.company_name}
            </h3>
            {post.position && (
              <p className="text-sm text-gray-600">{post.position}</p>
            )}
          </div>
          <div className="text-right">
            <div className={`text-3xl font-black ${getRatingColor(post.overall_rating)}`}>
              {post.overall_rating.toFixed(1)}
            </div>
            <div className="text-xs text-gray-500">★ ★ ★ ★ ★</div>
          </div>
        </div>
        
        {/* Experience Badge */}
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 ${getExperienceBadgeColor(post.experience_type)}`}>
          {post.experience_type}
        </span>
        
        {/* Story Preview */}
        <p className="text-gray-700 mb-4 line-clamp-3">
          {post.story}
        </p>
        
        {/* Footer */}
        <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
          <div className="flex items-center gap-4">
            <span>👤 {post.author_name}</span>
            <span>👁️ {post.views} views</span>
            <span>💬 {post.reaction_count} reactions</span>
          </div>
          <span>{new Date(post.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </Link>
  );
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl font-black mb-4">
            🚩 RedFlagged by UROWN
          </h1>
          <p className="text-xl mb-8">
            Where workers speak freely about their workplace experiences
          </p>
          <Link
            to="/redflagged/write"
            className="inline-block bg-white text-red-600 font-bold px-8 py-4 rounded-lg hover:bg-gray-100 transition shadow-lg"
          >
            Share Your Story
          </Link>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Filters & Trending */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
              <h3 className="text-xl font-bold mb-4">Filters</h3>
              
              {/* Company Search */}
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Company</label>
                <input
                  type="text"
                  value={filters.company}
                  onChange={(e) => handleFilterChange('company', e.target.value)}
                  placeholder="Search companies..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>
              
              {/* Experience Type */}
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Experience Type</label>
                <select
                  value={filters.experienceType}
                  onChange={(e) => handleFilterChange('experienceType', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                >
                  <option value="">All Types</option>
                  {experienceTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              {/* Rating Range */}
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Rating Range</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={filters.minRating}
                    onChange={(e) => handleFilterChange('minRating', e.target.value)}
                    placeholder="Min"
                    className="w-1/2 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={filters.maxRating}
                    onChange={(e) => handleFilterChange('maxRating', e.target.value)}
                    placeholder="Max"
                    className="w-1/2 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
              
              {/* Sort By */}
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Sort By</label>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Clear Filters */}
              <button
                onClick={clearFilters}
                className="w-full py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-sm font-semibold"
              >
                Clear Filters
              </button>
              
              {/* Trending Companies */}
              <div className="mt-8">
                <h4 className="text-lg font-bold mb-4">🔥 Trending Companies</h4>
                <div className="space-y-2">
                  {trendingCompanies.map(company => (
                    <button
                      key={company.company_name}
                      onClick={() => handleFilterChange('company', company.company_name)}
                      className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-sm">{company.company_name}</span>
                        <span className="text-xs text-gray-500">{company.post_count} posts</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-sm ${getRatingColor(company.avg_rating)}`}>
                          ★ {parseFloat(company.avg_rating).toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {company.total_views} views
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content - Posts */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {total} {total === 1 ? 'Post' : 'Posts'}
              </h2>
              <Link
                to="/redflagged/write"
                className="bg-red-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-red-700 transition"
              >
                + Share Your Story
              </Link>
            </div>
            
            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading posts...</p>
              </div>
            )}
            
            {/* Posts Grid */}
            {!loading && (
              <>
                {posts.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <p className="text-xl text-gray-600 mb-4">No posts found</p>
                    <p className="text-gray-500 mb-6">
                      Be the first to share your experience!
                    </p>
                    <Link
                      to="/redflagged/write"
                      className="inline-block bg-red-600 text-white font-bold px-8 py-4 rounded-lg hover:bg-red-700 transition"
                    >
                      Share Your Story
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {posts.map(post => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                )}
                
                {/* Pagination */}
                {total > limit && (
                  <div className="mt-8 flex justify-center gap-2">
                    <button
                      onClick={() => setOffset(Math.max(0, offset - limit))}
                      disabled={offset === 0}
                      className="px-4 py-2 bg-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2">
                      Page {Math.floor(offset / limit) + 1} of {Math.ceil(total / limit)}
                    </span>
                    <button
                      onClick={() => setOffset(offset + limit)}
                      disabled={offset + limit >= total}
                      className="px-4 py-2 bg-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                    >
                      Next
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