// src/pages/DebateCategoryPage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ArticleCard from '../components/ArticleCard';
import { useUser } from '../context/UserContext';
import { ArrowLeft, Clock, Users, Edit, Trophy, MessageSquare, Flame, Award } from 'lucide-react';

function DebateCategoryPage() {
  const { id } = useParams();
  const [debateTopic, setDebateTopic] = useState(null);
  const [opinions, setOpinions] = useState([]);
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const [userHasOpinion, setUserHasOpinion] = useState(false);
  const [markingWinner, setMarkingWinner] = useState({ loading: false, articleId: null });

  useEffect(() => {
    const fetchDebateData = async () => {
      try {
        setLoading(true);
        
        const topicResponse = await axios.get(`/debate-topics/${id}`);
        setDebateTopic(topicResponse.data.topic);
        
        const opinionsResponse = await axios.get(`/debate-topics/${id}/opinions`);
        setOpinions(opinionsResponse.data.opinions);
        
        const winnersResponse = await axios.get(`/debate-topics/${id}/winners`);
        setWinners(winnersResponse.data.winners);
        
        // Check if user has posted using localStorage
        const postedDebates = JSON.parse(localStorage.getItem('postedDebates') || '[]');
        if (postedDebates.includes(id)) {
          setUserHasOpinion(true);
        } else if (user) {
          // Still check for logged-in users who might have posted before this change
          const userOpinion = opinionsResponse.data.opinions.find(opinion => opinion.user_id === user.id);
          setUserHasOpinion(!!userOpinion);
        }
      } catch (error) {
        console.error('Error fetching debate data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDebateData();
  }, [id, user]);

  const getTimeRemaining = (expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry - now;
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const isWinner = (articleId) => {
    return winners.some(winner => winner.id === articleId);
  };

  const markAsWinner = async (articleId) => {
    if (markingWinner.loading) return;
    
    try {
      setMarkingWinner({ loading: true, articleId });
      
      await axios.post(`/debate-topics/${id}/winners/${articleId}`);
      
      const winnersResponse = await axios.get(`/debate-topics/${id}/winners`);
      setWinners(winnersResponse.data.winners);
    } catch (error) {
      console.error('Error marking article as winner:', error);
      alert('Failed to mark article as winner. Please try again.');
    } finally {
      setMarkingWinner({ loading: false, articleId: null });
    }
  };

  const removeWinnerStatus = async (articleId) => {
    if (markingWinner.loading) return;
    
    try {
      setMarkingWinner({ loading: true, articleId });
      
      await axios.delete(`/debate-topics/${id}/winners/${articleId}`);
      
      const winnersResponse = await axios.get(`/debate-topics/${id}/winners`);
      setWinners(winnersResponse.data.winners);
    } catch (error) {
      console.error('Error removing winner status:', error);
      alert('Failed to remove winner status. Please try again.');
    } finally {
      setMarkingWinner({ loading: false, articleId: null });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded-lg w-1/3 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded-xl mb-10"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-100 rounded-xl p-6 h-80"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!debateTopic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <MessageSquare className="mx-auto mb-6 text-gray-400" size={80} />
          <h1 className="text-5xl font-black mb-6 text-gray-900">Debate Not Found</h1>
          <p className="text-xl text-gray-600 mb-8">This debate topic may have expired or been removed.</p>
          <Link to="/" className="inline-block bg-black text-white px-8 py-4 text-lg font-bold hover:bg-gray-800 transition-colors">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const isEditorialBoard = user && (
    user.role === 'editorial-board' || 
    user.role === 'admin' || 
    user.role === 'super-admin'
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <Link to="/" className="inline-flex items-center text-gray-700 mb-8 hover:text-black transition-colors font-semibold group">
          <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" size={20} />
          Back to Home
        </Link>
        
        {/* Debate Topic Header Card */}
        <div className="bg-white border-2 border-black rounded-xl shadow-xl overflow-hidden mb-12">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-red-600 to-orange-600 px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-white">
              <Flame size={32} fill="currentColor" />
              <div>
                <div className="text-sm font-bold uppercase tracking-wider">Active Debate</div>
                <div className="text-xs opacity-90">Share your perspective</div>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 bg-black bg-opacity-30 text-white px-4 py-2 rounded-lg text-sm font-bold">
              <Clock size={18} />
              {getTimeRemaining(debateTopic.expires_at)}
            </div>
          </div>
          
          {/* Content */}
          <div className="p-8">
            <h1 className="text-4xl md:text-5xl font-black mb-6 text-gray-900 leading-tight">
              {debateTopic.title}
            </h1>
            
            <p className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed">
              {debateTopic.description}
            </p>
            
            {/* Stats and Actions Bar */}
            <div className="flex flex-wrap gap-4 pt-6 border-t-2 border-gray-200">
              <div className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2.5 rounded-lg">
                <Users className="text-gray-600" size={22} />
                <span className="font-bold text-gray-900">{opinions.length}</span>
                <span className="text-gray-600 font-medium">Opinions</span>
              </div>
              
              {winners.length > 0 && (
                <div className="inline-flex items-center gap-2 bg-yellow-100 px-4 py-2.5 rounded-lg">
                  <Trophy className="text-yellow-600" size={22} />
                  <span className="font-bold text-gray-900">{winners.length}</span>
                  <span className="text-gray-700 font-medium">Winner{winners.length !== 1 ? 's' : ''}</span>
                </div>
              )}
              
              {!userHasOpinion && (
                <Link 
                  to={`/debate/${id}/write`}
                  className="inline-flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-lg font-bold hover:bg-gray-800 transition-all duration-200 ml-auto"
                >
                  <Edit size={20} />
                  Write Your Opinion
                </Link>
              )}
              
              {userHasOpinion && (
                <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2.5 rounded-lg ml-auto">
                  <MessageSquare size={20} />
                  <span className="font-bold">You've Contributed</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Opinions Section */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-4xl font-black text-gray-900 mb-2">
                All Opinions
              </h2>
              <p className="text-gray-600">
                {opinions.length} {opinions.length === 1 ? 'perspective' : 'perspectives'} shared
              </p>
            </div>
            {winners.length > 0 && (
              <div className="inline-flex items-center gap-2 bg-yellow-50 border-2 border-yellow-400 text-yellow-800 px-4 py-2 rounded-lg">
                <Award size={20} />
                <span className="text-sm font-bold">Winning articles appear in Browse</span>
              </div>
            )}
          </div>
          
          {opinions.length === 0 ? (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-16 text-center">
              <MessageSquare className="mx-auto text-gray-300 mb-6" size={64} strokeWidth={1.5} />
              <h3 className="text-3xl font-black text-gray-900 mb-3">No Opinions Yet</h3>
              <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                Be the first to share your thoughts on this debate topic!
              </p>
              {!userHasOpinion && (
                <Link 
                  to={`/debate/${id}/write`}
                  className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 text-lg font-bold hover:bg-gray-800 transition-colors rounded-lg"
                >
                  <Edit size={22} />
                  Write Your Opinion
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {opinions.map((opinion) => (
                <div key={opinion.id} className="relative group">
                  {isWinner(opinion.id) && (
                    <div className="absolute -top-3 -right-3 z-20">
                      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-3 py-2 rounded-full text-sm font-black flex items-center shadow-lg border-2 border-yellow-600">
                        <Trophy className="mr-1.5" size={16} fill="currentColor" />
                        WINNER
                      </div>
                    </div>
                  )}
                  
                  <ArticleCard
                    article={opinion}
                    onClick={() => window.location.href = `/article/${opinion.id}`}
                  />
                  
                  {isEditorialBoard && (
                    <div className="mt-3 flex justify-center">
                      {isWinner(opinion.id) ? (
                        <button
                          onClick={() => removeWinnerStatus(opinion.id)}
                          disabled={markingWinner.loading && markingWinner.articleId === opinion.id}
                          className="w-full bg-white border-2 border-gray-300 text-gray-700 py-2.5 px-4 rounded-lg font-bold hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
                        >
                          {markingWinner.loading && markingWinner.articleId === opinion.id ? 'Removing...' : 'Remove Winner Status'}
                        </button>
                      ) : (
                        <button
                          onClick={() => markAsWinner(opinion.id)}
                          disabled={markingWinner.loading && markingWinner.articleId === opinion.id}
                          className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black py-2.5 px-4 rounded-lg font-black transition-all duration-200 disabled:opacity-50 shadow-lg"
                        >
                          {markingWinner.loading && markingWinner.articleId === opinion.id ? 'Marking...' : 'Mark as Winner'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DebateCategoryPage;