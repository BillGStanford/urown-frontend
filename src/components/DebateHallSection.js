// src/components/DebateHallSection.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { fetchWithRetry, getCachedData, setCachedData } from '../utils/apiUtils';
import { MessageSquare, Clock, Users, ArrowRight } from 'lucide-react';

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
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Active Debates | Debate Hall
            </h2>
            <p className="text-gray-600 text-sm">Time-limited discussion topics</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 rounded-lg p-6 h-64 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (debateTopics.length === 0) {
    return (
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Active Debates | Debate Hall
            </h2>
            <p className="text-gray-600 text-sm">Time-limited discussion topics</p>
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <MessageSquare className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-lg font-semibold text-gray-900">No Active Debates | Debate Hall at the moment</p>
          <p className="text-gray-600 text-sm mt-2">Check back soon for new topics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Active Debates | Debate Hall
          </h2>
          <p className="text-gray-600 text-sm">Join time-limited discussions on pressing topics</p>
        </div>
        <div className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold">
          <Clock size={16} />
          24 Hour Limit
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {debateTopics.map((topic) => (
          <div 
            key={topic.id} 
            className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 hover:border-gray-300 flex flex-col"
          >
            {/* Header */}
            <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs font-semibold uppercase tracking-wide">Active</span>
              </div>
              <div className="text-gray-600 text-xs font-semibold flex items-center gap-1.5">
                <Clock size={14} />
                {getTimeRemaining(topic.expires_at)}
              </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="text-lg font-bold mb-3 leading-tight line-clamp-2 text-gray-900 group-hover:text-orange-600 transition-colors">
                {topic.title}
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed flex-1 text-sm">
                {topic.description}
              </p>
              
              {/* Stats */}
              <div className="flex items-center gap-4 mb-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <Users size={16} />
                  <span className="font-semibold">{topic.opinions_count}</span>
                  <span className="text-gray-500">voices</span>
                </div>
              </div>
              
              {/* CTA Button */}
              <Link 
                to={`/debate/${topic.id}`}
                className="flex items-center justify-center gap-2 w-full text-center bg-gray-900 text-white py-2.5 px-4 text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors duration-200"
              >
                Join Discussion
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DebateHallSection;