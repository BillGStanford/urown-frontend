// src/pages/ebooks/EbookPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../../context/UserContext';

const EbookPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  
  const [ebook, setEbook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [readingProgress, setReadingProgress] = useState(null);

  useEffect(() => {
    fetchEbookDetails();
    if (user) {
      fetchReadingProgress();
    }
  }, [id, user]);

  const fetchEbookDetails = async () => {
    try {
      const [ebookRes, chaptersRes] = await Promise.all([
        axios.get(`/api/ebooks/${id}`),
        axios.get(`/api/ebooks/${id}/chapters`)
      ]);
      
      setEbook(ebookRes.data.ebook);
      setChapters(chaptersRes.data.chapters);
    } catch (error) {
      console.error('Error fetching ebook:', error);
      alert('Book not found');
      navigate('/ebooks');
    } finally {
      setLoading(false);
    }
  };

  const fetchReadingProgress = async () => {
    try {
      const response = await axios.get(`/api/ebooks/${id}/reading-progress`);
      setReadingProgress(response.data.progress);
    } catch (error) {
      // No progress yet, that's fine
    }
  };

  const handleStartReading = () => {
    if (chapters.length === 0) {
      alert('This book has no chapters yet');
      return;
    }

    // Start from last read chapter or first chapter
    const startChapter = readingProgress?.current_chapter_id || chapters[0].id;
    navigate(`/ebooks/${id}/read/${startChapter}`);
  };

  const handleEdit = () => {
    navigate(`/ebooks/edit/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!ebook) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Book Not Found</h2>
          <button
            onClick={() => navigate('/ebooks')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Browse Books
          </button>
        </div>
      </div>
    );
  }

  const isAuthor = user && user.id === ebook.user_id;
  const totalWords = chapters.reduce((sum, ch) => sum + (ch.word_count || 0), 0);
  const estimatedReadingTime = Math.ceil(totalWords / 200);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Cover */}
            <div
              className="w-full lg:w-80 h-96 flex-shrink-0 rounded-lg shadow-2xl flex items-center justify-center text-white text-9xl font-bold"
              style={{
                background: `linear-gradient(135deg, ${ebook.cover_color} 0%, ${ebook.cover_color}dd 100%)`
              }}
            >
              {ebook.title.charAt(0).toUpperCase()}
            </div>

            {/* Book Info */}
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {ebook.title}
              </h1>
              
              {ebook.subtitle && (
                <h2 className="text-2xl text-gray-300 mb-4">
                  {ebook.subtitle}
                </h2>
              )}

              <div className="flex items-center gap-4 mb-6 text-gray-300">
                <span
                  className="hover:underline cursor-pointer"
                  onClick={() => navigate(`/user/${ebook.author_name}`)}
                >
                  by {ebook.author_name}
                </span>
                <span>•</span>
                <span>{chapters.length} chapters</span>
                <span>•</span>
                <span>{totalWords.toLocaleString()} words</span>
              </div>

              {/* Tags */}
              {ebook.tags && ebook.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {ebook.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Reading Progress */}
              {readingProgress && (
                <div className="mb-6 bg-white bg-opacity-10 rounded-lg p-4">
                  <p className="text-sm mb-2">Your Progress</p>
                  <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                    <div
                      className="bg-blue-400 h-2 rounded-full transition-all"
                      style={{ width: `${readingProgress.progress_percent}%` }}
                    />
                  </div>
                  <p className="text-sm mt-2">{readingProgress.progress_percent}% complete</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                {chapters.length > 0 ? (
                  <button
                    onClick={handleStartReading}
                    className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg"
                  >
                    {readingProgress ? 'Continue Reading' : 'Start Reading'}
                  </button>
                ) : (
                  <div className="px-8 py-4 bg-gray-600 text-white rounded-lg">
                    No chapters available
                  </div>
                )}

                {isAuthor && (
                  <button
                    onClick={handleEdit}
                    className="px-8 py-4 bg-white text-gray-900 rounded-lg hover:bg-gray-100 font-semibold text-lg"
                  >
                    Edit Book
                  </button>
                )}
              </div>

              {/* Stats */}
              <div className="mt-6 flex gap-6 text-sm">
                <div>
                  <span className="text-gray-400">Reads:</span>{' '}
                  <span className="font-semibold">{ebook.views || 0}</span>
                </div>
                <div>
                  <span className="text-gray-400">Est. Reading Time:</span>{' '}
                  <span className="font-semibold">{estimatedReadingTime} min</span>
                </div>
                <div>
                  <span className="text-gray-400">Published:</span>{' '}
                  <span className="font-semibold">
                    {new Date(ebook.published_at || ebook.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Description & TOC */}
          <div className="lg:col-span-2">
            {/* Description */}
            {ebook.description && (
              <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-gray-200">
                <h3 className="font-bold text-xl mb-4">About This Book</h3>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {ebook.description}
                </p>
              </div>
            )}

            {/* Table of Contents */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="font-bold text-xl mb-4">Table of Contents</h3>
              
              {chapters.length === 0 ? (
                <p className="text-gray-500">No chapters available yet</p>
              ) : (
                <div className="space-y-2">
                  {chapters.map((chapter, index) => (
                    <div
                      key={chapter.id}
                      onClick={handleStartReading}
                      className="p-4 hover:bg-gray-50 rounded-lg cursor-pointer transition border border-transparent hover:border-gray-200"
                    >
                      <div className="flex items-start gap-4">
                        <span className="text-gray-400 font-mono text-sm mt-1">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {chapter.title}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">
                            {chapter.word_count?.toLocaleString() || 0} words
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Book Details */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="font-bold text-lg mb-4">Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Length:</span>
                  <span className="font-semibold">
                    {ebook.length === 'short' ? 'Short' : 'Long'} Length
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Language:</span>
                  <span className="font-semibold">{ebook.language?.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Chapters:</span>
                  <span className="font-semibold">{chapters.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Words:</span>
                  <span className="font-semibold">{totalWords.toLocaleString()}</span>
                </div>
                {ebook.isbn && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">ISBN:</span>
                    <span className="font-semibold font-mono text-xs">{ebook.isbn}</span>
                  </div>
                )}
              </div>
            </div>

            {/* License */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="font-bold text-lg mb-4">License</h3>
              <p className="text-sm text-gray-700">
                {ebook.license === 'all-rights-reserved' && 'All Rights Reserved'}
                {ebook.license === 'cc-by' && 'Creative Commons BY'}
                {ebook.license === 'cc-by-sa' && 'Creative Commons BY-SA'}
                {ebook.license === 'cc-by-nc' && 'Creative Commons BY-NC'}
                {ebook.license === 'public-domain' && 'Public Domain'}
              </p>
            </div>

            {/* Author */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="font-bold text-lg mb-4">About the Author</h3>
              <div
                onClick={() => navigate(`/user/${ebook.author_name}`)}
                className="cursor-pointer hover:underline"
              >
                <p className="font-semibold text-blue-600">{ebook.author_name}</p>
                <p className="text-sm text-gray-600 mt-1">{ebook.author_tier} Tier</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EbookPage;