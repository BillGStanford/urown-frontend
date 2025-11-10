// src/components/RedFlaggedBanner.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const RedFlaggedBanner = () => {
  const [trendingCompanies, setTrendingCompanies] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  
  useEffect(() => {
    fetchTrending();
  }, []);
  
  const fetchTrending = async () => {
    try {
      const [companiesRes, postsRes] = await Promise.all([
        axios.get('/api/redflagged/trending/companies?limit=3'),
        axios.get('/api/redflagged?sort=recent&limit=3')
      ]);
      
      setTrendingCompanies(companiesRes.data.companies);
      setRecentPosts(postsRes.data.posts);
    } catch (error) {
      console.error('Failed to fetch trending:', error);
    }
  };
  
  return (
    <div className="bg-gradient-to-br from-red-600 via-orange-600 to-red-700 text-white py-16 px-4 my-12 rounded-3xl shadow-2xl relative overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute transform rotate-45 -left-12 -top-12 w-64 h-64 bg-white rounded-full"></div>
        <div className="absolute transform rotate-45 -right-12 -bottom-12 w-96 h-96 bg-white rounded-full"></div>
      </div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <div className="text-6xl mb-4 animate-bounce">🚩</div>
          <h2 className="text-5xl font-black mb-4">
            Introducing RedFlagged
          </h2>
          <p className="text-xl mb-6 max-w-2xl mx-auto">
            The honest place for workers to share their experiences. 
            Expose the truth. Support the good. Make work better.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/redflagged"
              className="bg-white text-red-600 font-bold px-8 py-4 rounded-lg hover:bg-gray-100 transition shadow-xl transform hover:scale-105"
            >
              Browse Stories
            </Link>
            <Link
              to="/redflagged/write"
              className="bg-yellow-400 text-gray-900 font-bold px-8 py-4 rounded-lg hover:bg-yellow-300 transition shadow-xl transform hover:scale-105"
            >
              Share Your Experience
            </Link>
          </div>
        </div>
        
        {/* Trending Companies */}
        {trendingCompanies.length > 0 && (
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-4 text-center">🔥 Trending Now</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {trendingCompanies.map(company => (
                <Link
                  key={company.company_name}
                  to={`/redflagged?company=${encodeURIComponent(company.company_name)}`}
                  className="bg-white bg-opacity-20 backdrop-blur-lg p-6 rounded-xl hover:bg-opacity-30 transition transform hover:scale-105"
                >
                  <div className="text-2xl font-black mb-2">{company.company_name}</div>
                  <div className="flex items-center justify-between text-sm">
                    <span>⭐ {parseFloat(company.avg_rating).toFixed(1)}/5</span>
                    <span>{company.post_count} stories</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        
        {/* Recent Posts Preview */}
        {recentPosts.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold mb-4 text-center">📰 Latest Stories</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentPosts.map(post => (
                <Link
                  key={post.id}
                  to={`/redflagged/${post.id}`}
                  className="bg-white bg-opacity-20 backdrop-blur-lg p-6 rounded-xl hover:bg-opacity-30 transition transform hover:scale-105"
                >
                  <div className="font-black text-lg mb-2">{post.company_name}</div>
                  <p className="text-sm line-clamp-3 mb-3 opacity-90">
                    {post.story}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span>by {post.author_name}</span>
                    <span>⭐ {post.overall_rating.toFixed(1)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RedFlaggedBanner;

// Add this to your HomePage.js:
// import RedFlaggedBanner from '../components/RedFlaggedBanner';
// <RedFlaggedBanner />