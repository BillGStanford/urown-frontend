// src/components/DebateHallSection.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { fetchWithRetry, getCachedData, setCachedData } from '../utils/apiUtils';
import { MessageSquare, Clock, Users, Flame, ArrowRight } from 'lucide-react';

function DebateHallSection() {
  const [debateTopics, setDebateTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDebateTopics = async () => {
      try {
        setLoading(true);
        
        const cacheKey = 'debate-topics';
        let data = getCachedData(cacheKey);
        
        if (!data) {
          const response = await fetchWithRetry(() => 
            axios.get('/debate-topics')
          );
          data = response.data.topics;
          setCachedData(cacheKey, data, 5 * 60 * 1000);
        }
        
        setDebateTopics(data);
      } catch (error) {
        console.error('Error fetching debate topics:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDebateTopics();
  }, []);

  const getTimeRemaining = (expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry - now;
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-4xl font-black flex items-center text-gray-900">
            <MessageSquare className="mr-3 text-red-600" size={36} strokeWidth={2.5} />
            DEBATE HALL
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 rounded-xl p-6 h-64 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (debateTopics.length === 0) {
    return (
      <div className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-4xl font-black flex items-center text-gray-900">
            <MessageSquare className="mr-3 text-red-600" size={36} strokeWidth={2.5} />
            DEBATE HALL
          </h2>
        </div>
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-12 text-center border-2 border-gray-200">
          <MessageSquare className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-xl font-semibold text-gray-600">No active debates at the moment</p>
          <p className="text-gray-500 mt-2">Check back soon for new topics!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-4xl font-black flex items-center text-gray-900 mb-2">
            <MessageSquare className="mr-3 text-red-600" size={36} strokeWidth={2.5} />
            DEBATE HALL
          </h2>
          <p className="text-gray-600 ml-12">Join the conversation on today's hottest topics</p>
        </div>
        <div className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-bold">
          <Clock size={16} />
          24 HOUR LIMIT
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {debateTopics.map((topic) => (
          <div 
            key={topic.id} 
            className="group bg-white border-2 border-black rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
          >
            {/* Header with flame indicator */}
            <div className="bg-gradient-to-r from-red-600 to-orange-600 px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Flame size={18} fill="currentColor" />
                <span className="text-sm font-bold uppercase tracking-wide">Active Debate</span>
              </div>
              <div className="text-white text-xs font-bold bg-black bg-opacity-30 px-2 py-1 rounded">
                {getTimeRemaining(topic.expires_at)}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="text-xl font-bold mb-3 leading-tight line-clamp-2 text-gray-900 group-hover:text-red-600 transition-colors">
                {topic.title}
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed flex-1 text-sm">
                {topic.description}
              </p>
              
              {/* Stats */}
              <div className="flex items-center gap-4 mb-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <Users size={16} />
                  <span className="font-semibold">{topic.opinions_count}</span>
                  <span>opinions</span>
                </div>
              </div>
              
              {/* CTA Button */}
              <Link 
                to={`/debate/${topic.id}`}
                className="block w-full text-center bg-black text-white py-3 px-4 font-bold uppercase tracking-wide hover:bg-gray-800 transition-all duration-200 group-hover:bg-red-600 flex items-center justify-center gap-2"
              >
                Join Debate
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DebateHallSection;