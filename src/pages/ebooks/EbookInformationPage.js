import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../../context/UserContext';

const EbookInformationPage = () => {
  const { slug } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();
  const [ebook, setEbook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEbookDetails();
  }, [slug]);

  const fetchEbookDetails = async () => {
    setLoading(true);
    try {
      const [ebookRes, chaptersRes] = await Promise.all([
        axios.get(`/ebooks/slug/${slug}`),
        axios.get(`/ebooks/slug/${slug}`).then(res => 
          axios.get(`/ebooks/${res.data.ebook.id}/chapters`)
        )
      ]);

      setEbook(ebookRes.data.ebook);
      setChapters(chaptersRes.data.chapters);

      // Get reading progress if user is logged in
      if (user) {
        try {
          const progressRes = await axios.get(`/ebooks/${ebookRes.data.ebook.id}/progress`);
          setProgress(progressRes.data.progress);
        } catch (error) {
          // No progress yet
        }
      }
    } catch (error) {
      console.error('Error fetching ebook:', error);
      navigate('/ebooks');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!ebook) {
    return null;
  }

  const getReadingUrl = () => {
    if (progress && progress.chapter_id) {
      return `/ebooks/${slug}/read/${progress.chapter_id}`;
    }
    return `/ebooks/${slug}/read`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Back Button */}
        <Link
          to="/ebooks"
          className="inline-block mb-6 text-amber-700 hover:text-amber-900 font-semibold"
        >
          ← Back to Browse
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Book Cover & Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
              {/* Book Cover */}
              <div
                className="w-full h-96 bg-cover bg-center rounded-lg shadow-xl mb-6"
                style={{ backgroundImage: `url(${ebook.cover_image})` }}
              />

              {/* Continue Reading or Start Reading */}
              {progress ? (
                <Link
                  to={getReadingUrl()}
                  className="block w-full bg-amber-600 hover:bg-amber-700 text-white text-center font-bold py-4 rounded-lg mb-3 transition-colors"
                >
                  📖 Continue Reading
                  <span className="block text-sm mt-1">
                    {(parseFloat(progress.progress_percentage) || 0).toFixed(0)}% complete
                  </span>
                </Link>
              ) : (
                <Link
                  to={`/ebooks/${slug}/read`}
                  className="block w-full bg-amber-600 hover:bg-amber-700 text-white text-center font-bold py-4 rounded-lg mb-3 transition-colors"
                >
                  📖 Start Reading
                </Link>
              )}

              {/* View Chapters */}
              <Link
                to={`/ebooks/${slug}/chapters`}
                className="block w-full bg-white hover:bg-amber-50 text-amber-700 text-center font-bold py-3 rounded-lg border-2 border-amber-600 transition-colors"
              >
                📑 View Chapters ({chapters.length})
              </Link>

              {/* Stats */}
              <div className="mt-6 pt-6 border-t border-amber-200">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-amber-700">Pages:</span>
                    <span className="font-bold text-amber-900">
                      {ebook.page_count}
                      {ebook.page_count >= 30 && ' ⭐'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-700">Views:</span>
                    <span className="font-bold text-amber-900">
                      {ebook.views}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-700">Chapters:</span>
                    <span className="font-bold text-amber-900">
                      {chapters.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-700">Published:</span>
                    <span className="font-bold text-amber-900">
                      {new Date(ebook.published_at || ebook.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Book Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-8">
              {/* Title & Author */}
              <div className="mb-6">
                <h1 className="text-4xl font-bold text-amber-900 mb-2">
                  {ebook.title}
                </h1>
                {ebook.subtitle && (
                  <h2 className="text-2xl text-amber-700 mb-4">
                    {ebook.subtitle}
                  </h2>
                )}
                <p className="text-xl text-amber-800">
                  by{' '}
                  <Link
                    to={`/user/${ebook.author_display_name || ebook.author_name}`}
                    className="font-bold hover:text-amber-600 transition-colors"
                  >
                    {ebook.author_name}
                  </Link>
                </p>
              </div>

              {/* Tags */}
              {ebook.tags && ebook.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold text-amber-900 mb-2">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {ebook.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-semibold"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="mb-6">
                <h3 className="font-bold text-amber-900 mb-3 text-xl">
                  About This Book
                </h3>
                <p className="text-amber-800 whitespace-pre-wrap leading-relaxed">
                  {ebook.description}
                </p>
              </div>

              {/* License */}
              {ebook.license_type && (
                <div className="mb-6 p-4 bg-amber-50 rounded-lg">
                  <h3 className="font-bold text-amber-900 mb-2">License</h3>
                  <p className="text-sm text-amber-700">
                    {ebook.license_type}
                  </p>
                  <p className="text-xs text-amber-600 mt-2">
                    This book is in the public domain and free to read.
                  </p>
                </div>
              )}

              {/* Chapter Preview */}
              {chapters.length > 0 && (
                <div>
                  <h3 className="font-bold text-amber-900 mb-3 text-xl">
                    First Few Chapters
                  </h3>
                  <div className="space-y-2">
                    {chapters.slice(0, 5).map((chapter, idx) => (
                      <Link
                        key={chapter.id}
                        to={`/ebooks/${slug}/read/${chapter.id}`}
                        className="block p-4 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-semibold text-amber-900">
                              Chapter {chapter.chapter_number}
                            </span>
                            <span className="text-amber-700 ml-2">
                              {chapter.chapter_title}
                            </span>
                          </div>
                          <span className="text-sm text-amber-600">
                            {chapter.page_count} pages
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                  {chapters.length > 5 && (
                    <Link
                      to={`/ebooks/${slug}/chapters`}
                      className="block mt-4 text-center text-amber-700 hover:text-amber-900 font-semibold"
                    >
                      View all {chapters.length} chapters →
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EbookInformationPage;