// src/pages/WriteDebateOpinion.js
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

function WriteDebateOpinion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [debateTopic, setDebateTopic] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchDebateTopic = async () => {
      try {
        setFetching(true);
        // Fetch debate topic - removed leading /api/
        const response = await axios.get(`/debate-topics/${id}`);
        setDebateTopic(response.data.topic);
        
        // Set a default title based on the debate topic
        setTitle(`My Opinion: ${response.data.topic.title}`);
      } catch (error) {
        console.error('Error fetching debate topic:', error);
        setError('Failed to load debate topic. It may have expired or been removed.');
      } finally {
        setFetching(false);
      }
    };
    
    fetchDebateTopic();
  }, [id, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Create the opinion as an article - removed leading /api/
      const response = await axios.post(`/debate-topics/${id}/opinions`, {
        title: title.trim(),
        content: content.trim()
      });
      
      // Redirect to the debate category page
      navigate(`/debate/${id}`);
    } catch (error) {
      console.error('Error creating opinion:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error);
      } else {
        setError('Failed to create your opinion. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-white py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-40 bg-gray-200 rounded mb-8"></div>
            <div className="h-60 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!debateTopic) {
    return (
      <div className="min-h-screen bg-white py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-6">Debate Topic Not Found</h1>
          <p className="text-xl text-gray-600 mb-8">This debate topic may have expired or been removed.</p>
          <Link to="/" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md transition-colors duration-200">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <Link to={`/debate/${id}`} className="flex items-center text-blue-600 mb-8 hover:text-blue-800">
          <ArrowLeft className="mr-2" size={20} />
          Back to Debate
        </Link>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Write Your Opinion</h1>
          <p className="text-gray-600">Share your thoughts on: <span className="font-medium">{debateTopic.title}</span></p>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">{debateTopic.title}</h2>
          <p className="text-gray-700">{debateTopic.description}</p>
          
          <div className="mt-4 text-sm text-yellow-700 bg-yellow-50 p-3 rounded-md">
            <AlertCircle className="inline mr-2" size={16} />
            Remember: You can only write one opinion per debate topic. Make it count!
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
              {error}
            </div>
          )}
          
          <div className="mb-6">
            <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter a title for your opinion"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="content" className="block text-gray-700 font-medium mb-2">
              Your Opinion
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Share your thoughts on this debate topic..."
            ></textarea>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md flex items-center transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">
                    <svg className="h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                  Publishing...
                </>
              ) : (
                <>
                  <Save className="mr-2" size={20} />
                  Publish Opinion
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default WriteDebateOpinion;