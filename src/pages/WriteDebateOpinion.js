// src/pages/WriteDebateOpinion.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { ArrowLeft, Save, AlertCircle, Shield, User, Clock } from 'lucide-react';

function WriteDebateOpinion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [debateTopic, setDebateTopic] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [anonymousUsername, setAnonymousUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetching, setFetching] = useState(true);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaQuestion, setCaptchaQuestion] = useState({ question: '', answer: 0 });

  // Generate simple math captcha
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operations = ['+', '-'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let answer;
    if (operation === '+') {
      answer = num1 + num2;
    } else {
      answer = num1 - num2;
    }
    
    setCaptchaQuestion({
      question: `${num1} ${operation} ${num2} = ?`,
      answer: answer
    });
  };

  useEffect(() => {
    const fetchDebateTopic = async () => {
      try {
        setFetching(true);
        const response = await axios.get(`/debate-topics/${id}`);
        setDebateTopic(response.data.topic);
        
        // Set a default title based on the debate topic
        setTitle(`My Take: ${response.data.topic.title}`);
      } catch (error) {
        console.error('Error fetching debate topic:', error);
        setError('Failed to load debate topic. It may have expired or been removed.');
      } finally {
        setFetching(false);
      }
    };
    
    fetchDebateTopic();
    generateCaptcha();
  }, [id]);

  // Check for profanity in username
  const containsProfanity = (text) => {
    const profanityList = ['fuck', 'shit', 'bitch', 'asshole', 'damn', 'crap', 'bastard', 'dick', 'pussy', 'cock', 'nigga', 'nigger', 'fag', 'retard'];
    const lowerText = text.toLowerCase();
    return profanityList.some(word => lowerText.includes(word));
  };

  const validateSubmission = () => {
    // Check title and content
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return false;
    }

    // Check content length (minimum 100 characters to prevent spam)
    if (content.trim().length < 100) {
      setError('Your opinion must be at least 100 characters long. Please provide a more detailed perspective.');
      return false;
    }

    // For anonymous users
    if (!user) {
      // Check username
      if (!anonymousUsername.trim()) {
        setError('Please enter a username');
        return false;
      }

      if (anonymousUsername.trim().length < 3) {
        setError('Username must be at least 3 characters long');
        return false;
      }

      if (containsProfanity(anonymousUsername)) {
        setError('Username contains inappropriate language. Please choose a different username.');
        return false;
      }

      // Check captcha
      if (!captchaAnswer.trim()) {
        setError('Please solve the math problem to verify you\'re human');
        return false;
      }

      if (parseInt(captchaAnswer) !== captchaQuestion.answer) {
        setError('Incorrect answer to the math problem. Please try again.');
        generateCaptcha(); // Generate new captcha
        setCaptchaAnswer('');
        return false;
      }

      // Check for spam (one post per debate per browser)
      const anonymousPosts = JSON.parse(localStorage.getItem('anonymousDebatePosts') || '{}');
      if (anonymousPosts[id]) {
        setError('You have already posted an opinion for this debate. Only one opinion per person is allowed.');
        return false;
      }

      // Rate limiting check (store timestamp)
      const lastPost = localStorage.getItem('lastAnonymousPost');
      if (lastPost) {
        const timeSinceLastPost = Date.now() - parseInt(lastPost);
        const fiveMinutes = 5 * 60 * 1000;
        if (timeSinceLastPost < fiveMinutes) {
          const minutesRemaining = Math.ceil((fiveMinutes - timeSinceLastPost) / 60000);
          setError(`Please wait ${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''} before posting again.`);
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateSubmission()) {
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Create the opinion
      const response = await axios.post(`/debate-topics/${id}/opinions`, {
        title: title.trim(),
        content: content.trim(),
        anonymousUsername: !user ? anonymousUsername.trim() : null
      });
      
      // For anonymous users, store the post in localStorage
      if (!user) {
        const anonymousPosts = JSON.parse(localStorage.getItem('anonymousDebatePosts') || '{}');
        anonymousPosts[id] = {
          timestamp: Date.now(),
          username: anonymousUsername.trim()
        };
        localStorage.setItem('anonymousDebatePosts', JSON.stringify(anonymousPosts));
        localStorage.setItem('lastAnonymousPost', Date.now().toString());
      }
      
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-10 bg-white/10 rounded w-1/3 mb-6"></div>
            <div className="h-40 bg-white/10 rounded mb-8"></div>
            <div className="h-60 bg-white/10 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!debateTopic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-6 text-white">Debate Topic Not Found</h1>
          <p className="text-xl text-purple-200 mb-8">This debate topic may have expired or been removed.</p>
          <Link to="/" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 px-6 rounded-md transition-colors duration-200">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const getTimeRemaining = (expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry - now;
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <Link to={`/debate/${id}`} className="flex items-center text-purple-200 mb-8 hover:text-white transition-colors group">
          <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" size={20} />
          Back to Debate Hall
        </Link>
        
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-3">Enter the Arena</h1>
          <p className="text-purple-200 text-lg">Make your voice heard on this topic</p>
        </div>

        {/* User Status Banner */}
        {!user && (
          <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-2 border-blue-400/30 rounded-xl p-6 mb-8 backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <AlertCircle className="text-blue-400 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="text-white font-bold text-lg mb-2">Posting Anonymously</h3>
                <p className="text-blue-200 mb-3">
                  Your opinion will be visible to everyone, but you can only post once per debate.
                  Consider <Link to="/signup" className="underline font-bold hover:text-white">creating an account</Link> for more features!
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Debate Topic Context */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur border-2 border-white/20 rounded-xl shadow-xl p-6 mb-8">
          <div className="flex items-center gap-2 text-orange-400 mb-3">
            <Clock size={20} />
            <span className="font-bold">{getTimeRemaining(debateTopic.expires_at)} remaining</span>
          </div>
          <h2 className="text-2xl font-black text-white mb-4">{debateTopic.title}</h2>
          <p className="text-purple-100 leading-relaxed">{debateTopic.description}</p>
          
          <div className="mt-4 text-sm text-yellow-300 bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-md">
            <AlertCircle className="inline mr-2" size={16} />
            Remember: You can only write one opinion per debate. Make it count!
          </div>
        </div>
        
        {/* Opinion Form */}
        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur border-2 border-white/20 rounded-xl shadow-xl p-8">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-md mb-6 backdrop-blur">
              <AlertCircle className="inline mr-2" size={18} />
              {error}
            </div>
          )}
          
          {/* Anonymous Username Field */}
          {!user && (
            <div className="mb-6">
              <label htmlFor="username" className="block text-white font-bold mb-2 flex items-center gap-2">
                <User size={18} />
                Your Username (visible to all)
              </label>
              <input
                type="text"
                id="username"
                value={anonymousUsername}
                onChange={(e) => setAnonymousUsername(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur"
                placeholder="Choose a username (3+ characters, no profanity)"
                maxLength={30}
              />
              <p className="text-purple-300 text-sm mt-2">
                This will be displayed as your name. Keep it respectful!
              </p>
            </div>
          )}
          
          {/* Title Field */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-white font-bold mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur"
              placeholder="Give your opinion a compelling title"
              maxLength={255}
            />
          </div>
          
          {/* Content Field */}
          <div className="mb-6">
            <label htmlFor="content" className="block text-white font-bold mb-2">
              Your Perspective (minimum 100 characters)
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={14}
              className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur resize-none"
              placeholder="Share your detailed thoughts on this debate topic... Be thoughtful and substantive."
            ></textarea>
            <p className="text-purple-300 text-sm mt-2">
              {content.length} / 100 minimum characters
            </p>
          </div>

          {/* Captcha for Anonymous Users */}
          {!user && (
            <div className="mb-6">
              <label htmlFor="captcha" className="block text-white font-bold mb-2 flex items-center gap-2">
                <Shield size={18} />
                Verify you're human
              </label>
              <div className="flex items-center gap-4">
                <div className="bg-white/20 border-2 border-white/30 rounded-lg px-6 py-4 backdrop-blur">
                  <span className="text-white text-2xl font-bold">{captchaQuestion.question}</span>
                </div>
                <input
                  type="number"
                  id="captcha"
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value)}
                  className="w-32 px-4 py-3 bg-white/10 border-2 border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur"
                  placeholder="Answer"
                />
              </div>
            </div>
          )}
          
          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-8 rounded-lg flex items-center font-bold transition-all duration-200 disabled:opacity-50 shadow-lg"
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">
                    <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                  Submitting...
                </>
              ) : (
                <>
                  <Save className="mr-2" size={20} />
                  Submit Your Opinion
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