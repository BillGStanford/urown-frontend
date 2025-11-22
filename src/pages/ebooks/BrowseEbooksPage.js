// src/pages/ebooks/BrowseEbooksPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BrowseEbooksPage = () => {
  const navigate = useNavigate();
  const [ebooks, setEbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    length: 'all',
    tag: 'all',
    sort: 'recent',
    search: ''
  });

  useEffect(() => {
    fetchEbooks();
  }, [filters]);

  const fetchEbooks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.length !== 'all') params.append('length', filters.length);
      if (filters.tag !== 'all') params.append('tag', filters.tag);
      if (filters.sort) params.append('sort', filters.sort);
      if (filters.search) params.append('search', filters.search);

      const response = await axios.get(`/api/ebooks?${params}`);
      setEbooks(response.data.ebooks);
    } catch (error) {
      console.error('Error fetching ebooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const availableTags = [
    'Fiction', 'Non-fiction', 'Policy', 'Essay', 'Debate', 
    'Anthology', 'Philosophy', 'History', 'Science', 'Technology'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            UROWN | E-Book
          </h1>
          <p className="text-xl mb-6">
            Democratization of Books — Read, Write, Publish
          </p>
          <button
            onClick={() => navigate('/ebooks/write')}
            className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100"
          >
            Start Writing Your Book
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <input
              type="text"
              placeholder="Search books..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg flex-1 min-w-[200px]"
            />

            {/* Length Filter */}
            <select
              value={filters.length}
              onChange={(e) => setFilters({ ...filters, length: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Lengths</option>
              <option value="short">Short Length</option>
              <option value="long">Long Length</option>
            </select>

            {/* Tag Filter */}
            <select
              value={filters.tag}
              onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Tags</option>
              {availableTags.map(tag => (
                <option key={tag} value={tag.toLowerCase()}>{tag}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
              <option value="views">Most Read</option>
            </select>
          </div>
        </div>
      </div>

      {/* Book Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : ebooks.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-600 mb-4">No books found</p>
            <button
              onClick={() => navigate('/ebooks/write')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Be the First to Publish
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {ebooks.map(ebook => (
              <div
                key={ebook.id}
                onClick={() => navigate(`/ebooks/${ebook.id}`)}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer"
              >
                {/* Cover (Placeholder with color) */}
                <div
                  className="h-64 flex items-center justify-center text-white text-6xl font-bold"
                  style={{
                    background: `linear-gradient(135deg, ${
                      ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b'][ebook.id % 5]
                    } 0%, ${
                      ['#764ba2', '#f093fb', '#4facfe', '#43e97b', '#667eea'][ebook.id % 5]
                    } 100%)`
                  }}
                >
                  {ebook.title.charAt(0).toUpperCase()}
                </div>

                {/* Details */}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">
                    {ebook.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    by {ebook.author_name}
                  </p>
                  
                  {ebook.description && (
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                      {ebook.description}
                    </p>
                  )}

                  {/* Tags */}
                  {ebook.tags && ebook.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {ebook.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{ebook.chapter_count || 0} chapters</span>
                    <span>{ebook.views || 0} reads</span>
                  </div>

                  {/* Length Badge */}
                  <div className="mt-2">
                    <span className={`px-2 py-1 text-xs rounded ${
                      ebook.length === 'short'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {ebook.length === 'short' ? 'Short' : 'Long'} Length
                    </span>
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

export default BrowseEbooksPage;