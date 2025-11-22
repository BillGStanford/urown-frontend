// src/pages/ebooks/UserEbooksPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../../context/UserContext';

const UserEbooksPage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  
  const [profile, setProfile] = useState(null);
  const [ebooks, setEbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, published, draft
  const [viewMode, setViewMode] = useState('grid'); // grid, list

  useEffect(() => {
    fetchUserEbooks();
  }, [username]);

  const fetchUserEbooks = async () => {
    try {
      // If viewing own profile, use authenticated endpoint
      if (user && user.display_name === username) {
        const response = await axios.get('/user/ebooks');
        setEbooks(response.data.ebooks);
        setProfile({
          display_name: user.display_name,
          tier: user.tier,
          isOwn: true
        });
      } else {
        // Public view
        const response = await axios.get(`/users/${username}/ebooks`);
        setEbooks(response.data.ebooks);
        setProfile({
          display_name: response.data.user.display_name,
          tier: response.data.user.tier,
          isOwn: false
        });
      }
    } catch (error) {
      console.error('Error fetching ebooks:', error);
      alert('Failed to load books');
      navigate('/ebooks');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEbook = async (ebookId) => {
    if (!window.confirm('Are you sure you want to delete this book? This cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/ebooks/${ebookId}`);
      setEbooks(ebooks.filter(e => e.id !== ebookId));
    } catch (error) {
      console.error('Error deleting ebook:', error);
      alert('Failed to delete book');
    }
  };

  const filteredEbooks = ebooks.filter(ebook => {
    if (filter === 'published') return ebook.published;
    if (filter === 'draft') return !ebook.published;
    return true;
  });

  const publishedCount = ebooks.filter(e => e.published).length;
  const draftCount = ebooks.filter(e => !e.published).length;
  const totalViews = ebooks.reduce((sum, e) => sum + (e.views || 0), 0);

  // EbookCard component (inlined)
  const EbookCard = ({ ebook }) => (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition">
      {/* Cover */}
      <div
        onClick={() => navigate(
          ebook.published ? `/ebooks/${ebook.id}` : `/ebooks/edit/${ebook.id}`
        )}
        className="h-64 flex items-center justify-center text-white text-6xl font-bold cursor-pointer"
        style={{
          background: `linear-gradient(135deg, ${ebook.cover_color} 0%, ${ebook.cover_color}dd 100%)`
        }}
      >
        {ebook.title.charAt(0).toUpperCase()}
      </div>

      {/* Details */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 
            className="font-bold text-lg line-clamp-2 flex-1 cursor-pointer hover:text-blue-600"
            onClick={() => navigate(
              ebook.published ? `/ebooks/${ebook.id}` : `/ebooks/edit/${ebook.id}`
            )}
          >
            {ebook.title}
          </h3>
          {!ebook.published && (
            <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
              Draft
            </span>
          )}
        </div>

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
        <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
          <span>{ebook.chapter_count || 0} chapters</span>
          {ebook.published && <span>{ebook.views || 0} reads</span>}
        </div>

        {/* Actions */}
        {profile?.isOwn && (
          <div className="flex gap-2 pt-3 border-t border-gray-200">
            <button
              onClick={() => navigate(`/ebooks/edit/${ebook.id}`)}
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Edit
            </button>
            {ebook.published && (
              <button
                onClick={() => navigate(`/ebooks/${ebook.id}`)}
                className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
              >
                View
              </button>
            )}
            <button
              onClick={() => handleDeleteEbook(ebook.id)}
              className="px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // EbookListItem component (inlined)
  const EbookListItem = ({ ebook }) => (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition">
      <div className="flex">
        {/* Cover */}
        <div
          onClick={() => navigate(
            ebook.published ? `/ebooks/${ebook.id}` : `/ebooks/edit/${ebook.id}`
          )}
          className="w-32 h-32 flex-shrink-0 flex items-center justify-center text-white text-3xl font-bold cursor-pointer"
          style={{
            background: `linear-gradient(135deg, ${ebook.cover_color} 0%, ${ebook.cover_color}dd 100%)`
          }}
        >
          {ebook.title.charAt(0).toUpperCase()}
        </div>

        {/* Details */}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 
                className="font-bold text-lg cursor-pointer hover:text-blue-600"
                onClick={() => navigate(
                  ebook.published ? `/ebooks/${ebook.id}` : `/ebooks/edit/${ebook.id}`
                )}
              >
                {ebook.title}
              </h3>
              {ebook.subtitle && (
                <p className="text-sm text-gray-600">{ebook.subtitle}</p>
              )}
            </div>
            {!ebook.published && (
              <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                Draft
              </span>
            )}
          </div>

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
          <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
            <span>{ebook.chapter_count || 0} chapters</span>
            <span>{ebook.word_count?.toLocaleString() || 0} words</span>
            {ebook.published && <span>{ebook.views || 0} reads</span>}
          </div>

          {/* Actions */}
          {profile?.isOwn && (
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/ebooks/edit/${ebook.id}`)}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Edit
              </button>
              {ebook.published && (
                <button
                  onClick={() => navigate(`/ebooks/${ebook.id}`)}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
                >
                  View
                </button>
              )}
              <button
                onClick={() => handleDeleteEbook(ebook.id)}
                className="px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {profile?.isOwn ? 'My Books' : `${profile?.display_name}'s Books`}
              </h1>
              <p className="text-gray-600">
                {profile?.tier} Tier • {ebooks.length} {ebooks.length === 1 ? 'book' : 'books'}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="flex border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 rounded-l-lg ${
                    viewMode === 'grid' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                  title="Grid View"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM13 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded-r-lg ${
                    viewMode === 'list' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                  title="List View"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {profile?.isOwn && (
                <button
                  onClick={() => navigate('/ebooks/write')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  + Write New Book
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Total Books</p>
              <p className="text-2xl font-bold">{ebooks.length}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Published</p>
              <p className="text-2xl font-bold">{publishedCount}</p>
            </div>
            {profile?.isOwn && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Drafts</p>
                <p className="text-2xl font-bold">{draftCount}</p>
              </div>
            )}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Total Reads</p>
              <p className="text-2xl font-bold">{totalViews}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {profile?.isOwn && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({ebooks.length})
              </button>
              <button
                onClick={() => setFilter('published')}
                className={`px-4 py-2 rounded-lg ${
                  filter === 'published'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Published ({publishedCount})
              </button>
              <button
                onClick={() => setFilter('draft')}
                className={`px-4 py-2 rounded-lg ${
                  filter === 'draft'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Drafts ({draftCount})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Books Grid/List */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {filteredEbooks.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-600 mb-4">
              {filter === 'draft' ? 'No drafts' : 'No books yet'}
            </p>
            {profile?.isOwn && (
              <button
                onClick={() => navigate('/ebooks/write')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Write Your First Book
              </button>
            )}
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEbooks.map(ebook => (
                  <EbookCard key={ebook.id} ebook={ebook} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEbooks.map(ebook => (
                  <EbookListItem key={ebook.id} ebook={ebook} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserEbooksPage;