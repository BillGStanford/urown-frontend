// src/pages/DebateCategoryPage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ArticleCard from '../../components/ArticleCard';
import { useUser } from '../../context/UserContext';
import { ArrowLeft, Clock, Users, Edit, Trophy, MessageSquare, Flame, Award, AlertCircle, Shield, CheckCircle, Crown } from 'lucide-react';

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
        
        // Check if user has already posted (for both logged in and anonymous)
        if (user) {
          const userOpinion = opinionsResponse.data.opinions.find(opinion => opinion.user_id === user.id);
          setUserHasOpinion(!!userOpinion);
        } else {
          // Check localStorage for anonymous posting
          const anonymousPosts = JSON.parse(localStorage.getItem('anonymousDebatePosts') || '{}');
          setUserHasOpinion(!!anonymousPosts[id]);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg font-semibold text-gray-700">Loading debate...</div>
        </div>
      </div>
    );
  }

  if (!debateTopic) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="max-w-md w-full mx-auto text-center">
          <MessageSquare className="mx-auto mb-6 text-gray-400" size={64} />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Debate Not Found</h1>
          <p className="text-gray-600 mb-8">This debate topic may have expired or been removed.</p>
          <Link to="/" className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 font-medium rounded-lg transition-colors">
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/" className="inline-flex items-center text-gray-700 mb-8 hover:text-gray-900 transition-colors">
          <ArrowLeft className="mr-2" size={20} />
          Back to Home
        </Link>

        {/* Anonymous Posting Notice */}
        {!user && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-4">
              <AlertCircle className="text-blue-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Posting Anonymously?</h3>
                <p className="text-gray-700 mb-4">
                  You can share your opinion without an account, but consider creating one for a better experience:
                </p>
                <ul className="text-gray-700 space-y-1 mb-4 ml-4">
                  <li>• Build your reputation with a permanent profile</li>
                  <li>• Participate in multiple debates</li>
                  <li>• Track your contributions and views</li>
                  <li>• Edit and manage your content</li>
                </ul>
                <Link 
                  to="/signup" 
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  <Shield size={18} />
                  Create Free Account
                </Link>
              </div>
            </div>
          </div>
        )}
        
        {/* Debate Topic Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-white">
              <Flame size={32} fill="currentColor" />
              <div>
                <div className="text-sm font-bold uppercase tracking-wider">Active Debate</div>
                <div className="text-xs opacity-90">Share your perspective</div>
              </div>
            </div>
            <div className="bg-black bg-opacity-20 text-white px-4 py-2 rounded-lg text-sm font-bold">
              <Clock size={18} className="inline mr-2" />
              {getTimeRemaining(debateTopic.expires_at)}
            </div>
          </div>
          
          {/* Content */}
          <div className="p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              {debateTopic.title}
            </h1>
            
            {/* Fixed description with proper line breaks */}
            <p className="text-lg text-gray-700 mb-8 leading-relaxed whitespace-pre-line">
              {debateTopic.description}
            </p>
            
            {/* Stats and Actions Bar */}
            <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-200">
              <div className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
                <Users className="text-gray-600" size={20} />
                <span className="font-bold text-gray-900">{opinions.length}</span>
                <span className="text-gray-600 font-medium">Opinions</span>
              </div>
              
              {winners.length > 0 && (
                <div className="inline-flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-lg">
                  <Trophy className="text-yellow-600" size={20} />
                  <span className="font-bold text-gray-900">{winners.length}</span>
                  <span className="text-yellow-700 font-medium">Winner{winners.length !== 1 ? 's' : ''}</span>
                </div>
              )}
              
              {!userHasOpinion && (
                <Link 
                  to={`/debate/${id}/write`}
                  className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-lg font-medium transition-colors ml-auto"
                >
                  <Edit size={18} />
                  Write Your Opinion
                </Link>
              )}
              
              {userHasOpinion && (
                <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-lg ml-auto">
                  <CheckCircle className="text-green-600" size={18} />
                  <span className="font-bold text-green-800">You've Contributed</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Opinions Section */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                All Opinions
              </h2>
              <p className="text-gray-600">
                {opinions.length} {opinions.length === 1 ? 'perspective' : 'perspectives'} shared
              </p>
            </div>
            {winners.length > 0 && (
              <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded-lg">
                <Crown size={18} />
                <span className="text-sm font-medium">Winning articles appear in Browse</span>
              </div>
            )}
          </div>
          
          {opinions.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
              <MessageSquare className="mx-auto mb-6 text-gray-300" size={64} />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Opinions Yet</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Be the first to share your thoughts on this debate topic!
              </p>
              {!userHasOpinion && (
                <Link 
                  to={`/debate/${id}/write`}
                  className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  <Edit size={20} />
                  Write Your Opinion
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {opinions.map((opinion) => (
                <div key={opinion.id} className="relative group">
                  {isWinner(opinion.id) && (
                    <div className="absolute -top-3 -right-3 z-10">
                      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
                        <Trophy size={16} fill="currentColor" />
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
                          className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                          {markingWinner.loading && markingWinner.articleId === opinion.id ? 'Removing...' : 'Remove Winner Status'}
                        </button>
                      ) : (
                        <button
                          onClick={() => markAsWinner(opinion.id)}
                          disabled={markingWinner.loading && markingWinner.articleId === opinion.id}
                          className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 shadow-md"
                        >
                          {markingWinner.loading && markingWinner.articleId === opinion.id ? 'Marking...' : 'Crown as Winner'}
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