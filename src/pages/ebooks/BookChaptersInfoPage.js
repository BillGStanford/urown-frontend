import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BookChaptersInfoPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [ebook, setEbook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChapters();
  }, [slug]);

  const fetchChapters = async () => {
    setLoading(true);
    try {
      const ebookRes = await axios.get(`/ebooks/slug/${slug}`);
      const chaptersRes = await axios.get(`/ebooks/${ebookRes.data.ebook.id}/chapters`);
      
      setEbook(ebookRes.data.ebook);
      setChapters(chaptersRes.data.chapters);
    } catch (error) {
      console.error('Error fetching chapters:', error);
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

  const totalPages = chapters.reduce((sum, ch) => sum + (ch.page_count || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Back Button */}
        <Link
          to={`/ebooks/${slug}`}
          className="inline-block mb-6 text-amber-700 hover:text-amber-900 font-semibold"
        >
          ← Back to Book Details
        </Link>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-start gap-6">
            {/* Book Cover Thumbnail */}
            <div
              className="w-32 h-48 bg-cover bg-center rounded-lg shadow-md flex-shrink-0"
              style={{ backgroundImage: `url(${ebook.cover_image})` }}
            />

            {/* Book Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-amber-900 mb-2">
                {ebook.title}
              </h1>
              <p className="text-xl text-amber-700 mb-4">
                by {ebook.author_name}
              </p>
              <div className="flex gap-4 text-sm text-amber-700">
                <span>📑 {chapters.length} chapters</span>
                <span>📄 {totalPages} pages</span>
              </div>
            </div>

            {/* Start Reading Button */}
            <Link
              to={`/ebooks/${slug}/read`}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              📖 Start Reading
            </Link>
          </div>
        </div>

        {/* Chapters List */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-amber-900 mb-6">
            Table of Contents
          </h2>

          {chapters.length === 0 ? (
            <p className="text-center text-amber-600 py-8">
              No chapters available
            </p>
          ) : (
            <div className="space-y-3">
              {chapters.map((chapter, index) => (
                <Link
                  key={chapter.id}
                  to={`/ebooks/${slug}/read/${chapter.id}`}
                  className="block group"
                >
                  <div className="p-5 bg-amber-50 hover:bg-amber-100 rounded-lg transition-all border-2 border-amber-100 hover:border-amber-300">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="bg-amber-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                            Chapter {chapter.chapter_number}
                          </span>
                          <h3 className="text-lg font-bold text-amber-900 group-hover:text-amber-700 transition-colors">
                            {chapter.chapter_title}
                          </h3>
                        </div>
                        
                        {/* Chapter Preview */}
                        <p className="text-sm text-amber-700 line-clamp-2 mb-2">
                          {chapter.content.substring(0, 150)}...
                        </p>

                        <div className="flex items-center gap-4 text-xs text-amber-600">
                          <span>📄 {chapter.page_count || 0} pages</span>
                          <span>
                            Updated {new Date(chapter.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Read Icon */}
                      <div className="ml-4">
                        <div className="w-10 h-10 rounded-full bg-amber-600 group-hover:bg-amber-700 flex items-center justify-center text-white transition-colors">
                          →
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-center gap-4">
            <Link
              to={`/ebooks/${slug}`}
              className="bg-white hover:bg-amber-50 text-amber-700 font-bold py-3 px-6 rounded-lg border-2 border-amber-600 transition-colors"
            >
              ℹ️ Book Details
            </Link>
            <Link
              to={`/ebooks/${slug}/read`}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              📖 Start Reading
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookChaptersInfoPage;