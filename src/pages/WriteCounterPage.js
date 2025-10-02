// pages/WriteCounterPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/UserContext';

const WriteCounterPage = () => {
  const [searchParams] = useSearchParams();
  const originalArticleId = searchParams.get('originalArticleId');
  const { user } = useUser();
  const navigate = useNavigate();
  const [originalArticle, setOriginalArticle] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!originalArticleId) {
      navigate('/');
      return;
    }

    const fetchOriginalArticle = async () => {
      try {
        const response = await axios.get(`/articles/${originalArticleId}`);
        setOriginalArticle(response.data.article);
        setTitle(`Counter to: ${response.data.article.title}`);
      } catch (err) {
        setError('Failed to load original article');
        console.error(err);
      }
    };

    fetchOriginalArticle();
  }, [originalArticleId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await axios.post('/articles', {
        title: title.trim(),
        content: content.trim(),
        published: true,
        parent_article_id: originalArticleId
      });

      // After publishing, navigate back to the original article page
      navigate(`/article/${originalArticleId}?counterPublished=true`);
    } catch (err) {
      setLoading(false);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to publish counter opinion');
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-2xl px-4">
          <h1 className="text-4xl font-bold mb-4">Login Required</h1>
          <p className="text-xl mb-8">You need to be logged in to write a counter opinion.</p>
          <button 
            onClick={() => navigate('/login')}
            className="bg-black text-white px-6 py-3 font-bold hover:bg-gray-800 transition-colors"
          >
            LOG IN
          </button>
        </div>
      </div>
    );
  }

  if (!originalArticle && !error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <div className="text-2xl font-bold mt-4">LOADING ARTICLE...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Write a Counter Opinion</h1>
        
        {originalArticle && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Countering:</h2>
            <p className="text-xl font-bold">{originalArticle.title}</p>
            <p className="text-gray-600 mt-1">By {originalArticle.display_name}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Your Counter Opinion
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'PUBLISHING...' : 'PUBLISH COUNTER OPINION'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WriteCounterPage;