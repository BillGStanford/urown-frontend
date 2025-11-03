// src/pages/DebateCategoryPage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ArticleCard from '../components/ArticleCard';
import { useUser } from '../context/UserContext';
import { ArrowLeft, Clock, Users, Edit, Trophy, MessageSquare, Flame, Award, AlertCircle, Shield } from 'lucide-react';

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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-12 bg-white/10 rounded-lg w-1/3 mb-8"></div>
            <div className="h-64 bg-white/10 rounded-xl mb-10"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/5 rounded-xl p-6 h-80"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!debateTopic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <MessageSquare className="mx-auto mb-6 text-purple-400" size={80} />
          <h1 className="text-5xl font-black mb-6 text-white">Debate Not Found</h1>
          <p className="text-xl text-purple-200 mb-8">This debate topic may have expired or been removed.</p>
          <Link to="/" className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 text-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all rounded-lg shadow-lg">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <Link to="/" className="inline-flex items-center text-purple-200 mb-8 hover:text-white transition-colors font-semibold group">
          <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" size={20} />
          Back to Home
        </Link>
        
        {/* Debate Hall Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full mb-4 shadow-lg">
            <Flame size={24} className="animate-pulse" />
            <span className="font-black text-lg uppercase tracking-wider">The Debate Hall</span>
            <Flame size={24} className="animate-pulse" />
          </div>
          <p className="text-purple-200 text-lg max-w-2xl mx-auto">
            Where ideas clash and perspectives evolve. Join the conversation—no account required!
          </p>
        </div>

        {/* Anonymous Posting Notice */}
        {!user && (
          <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-2 border-blue-400/30 rounded-xl p-6 mb-8 backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <AlertCircle className="text-blue-400 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="text-white font-bold text-lg mb-2">Posting Anonymously?</h3>
                <p className="text-blue-200 mb-3">
                  You can share your opinion without an account, but consider creating one for a better experience:
                </p>
                <ul className="text-blue-200 space-y-1 mb-4 ml-4">
                  <li>• Build your reputation with a permanent profile</li>
                  <li>• Participate in multiple debates</li>
                  <li>• Track your contributions and views</li>
                  <li>• Edit and manage your content</li>
                </ul>
                <Link 
                  to="/signup" 
                  className="inline-flex items-center gap-2 bg-white text-purple-900 px-4 py-2 rounded-lg font-bold hover:bg-blue-50 transition-colors"
                >
                  <Shield size={18} />
                  Create Free Account
                </Link>
              </div>
            </div>
          </div>
        )}
        
        {/* Debate Topic Card */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border-2 border-white/20 rounded-2xl shadow-2xl overflow-hidden mb-12">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-white">
              <Flame size={32} fill="currentColor" className="animate-pulse" />
              <div>
                <div className="text-sm font-bold uppercase tracking-wider">Active Debate</div>
                <div className="text-xs opacity-90">Make your voice heard</div>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 bg-black bg-opacity-30 text-white px-4 py-2 rounded-lg text-sm font-bold">
              <Clock size={18} />
              {getTimeRemaining(debateTopic.expires_at)}
            </div>
          </div>
          
          {/* Content */}
          <div className="p-8">
            <h1 className="text-4xl md:text-5xl font-black mb-6 text-white leading-tight">
              {debateTopic.title}
            </h1>
            
            <p className="text-lg md:text-xl text-purple-100 mb-8 leading-relaxed">
              {debateTopic.description}
            </p>
            
            {/* Stats and Actions Bar */}
            <div className="flex flex-wrap gap-4 pt-6 border-t-2 border-white/20">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2.5 rounded-lg border border-white/20">
                <Users className="text-purple-300" size={22} />
                <span className="font-bold text-white">{opinions.length}</span>
                <span className="text-purple-200 font-medium">Voices</span>
              </div>
              
              {winners.length > 0 && (
                <div className="inline-flex items-center gap-2 bg-yellow-500/20 backdrop-blur px-4 py-2.5 rounded-lg border border-yellow-400/30">
                  <Trophy className="text-yellow-400" size={22} />
                  <span className="font-bold text-white">{winners.length}</span>
                  <span className="text-yellow-200 font-medium">Winner{winners.length !== 1 ? 's' : ''}</span>
                </div>
              )}
              
              {!userHasOpinion && (
                <Link 
                  to={`/debate/${id}/write`}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2.5 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 ml-auto shadow-lg"
                >
                  <Edit size={20} />
                  Join the Debate
                </Link>
              )}
              
              {userHasOpinion && (
                <div className="inline-flex items-center gap-2 bg-green-500/20 backdrop-blur text-green-300 px-4 py-2.5 rounded-lg border border-green-400/30 ml-auto">
                  <MessageSquare size={20} />
                  <span className="font-bold">You've Spoken</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Opinions Section */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-4xl font-black text-white mb-2">
                All Perspectives
              </h2>
              <p className="text-purple-200">
                {opinions.length} {opinions.length === 1 ? 'voice in the hall' : 'voices in the hall'}
              </p>
            </div>
            {winners.length > 0 && (
              <div className="inline-flex items-center gap-2 bg-yellow-500/20 backdrop-blur border-2 border-yellow-400/30 text-yellow-300 px-4 py-2 rounded-lg">
                <Award size={20} />
                <span className="text-sm font-bold">Winning voices appear in Browse</span>
              </div>
            )}
          </div>
          
          {opinions.length === 0 ? (
            <div className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur border-2 border-white/10 rounded-xl p-16 text-center">
              <MessageSquare className="mx-auto text-purple-400/50 mb-6" size={64} strokeWidth={1.5} />
              <h3 className="text-3xl font-black text-white mb-3">The Hall Awaits</h3>
              <p className="text-lg text-purple-200 mb-8 max-w-md mx-auto">
                Be the first to step into the arena and share your perspective!
              </p>
              {!userHasOpinion && (
                <Link 
                  to={`/debate/${id}/write`}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 text-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all rounded-lg shadow-lg"
                >
                  <Edit size={22} />
                  Enter the Debate
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {opinions.map((opinion) => (
                <div key={opinion.id} className="relative group">
                  {isWinner(opinion.id) && (
                    <div className="absolute -top-3 -right-3 z-20">
                      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-3 py-2 rounded-full text-sm font-black flex items-center shadow-lg border-2 border-yellow-600 animate-pulse">
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
                          className="w-full bg-white/10 backdrop-blur border-2 border-white/20 text-white py-2.5 px-4 rounded-lg font-bold hover:bg-white/20 transition-all duration-200 disabled:opacity-50"
                        >
                          {markingWinner.loading && markingWinner.articleId === opinion.id ? 'Removing...' : 'Remove Winner Status'}
                        </button>
                      ) : (
                        <button
                          onClick={() => markAsWinner(opinion.id)}
                          disabled={markingWinner.loading && markingWinner.articleId === opinion.id}
                          className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black py-2.5 px-4 rounded-lg font-black transition-all duration-200 disabled:opacity-50 shadow-lg"
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