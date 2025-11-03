import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { ArrowLeft, Save, AlertCircle, Shield, User, Clock, Edit, Flame } from 'lucide-react';

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

  const containsProfanity = (text) => {
    const profanityList = ['fuck', 'shit', 'bitch', 'asshole', 'damn', 'crap', 'bastard', 'dick', 'pussy', 'cock', 'nigga', 'nigger', 'fag', 'retard'];
    const lowerText = text.toLowerCase();
    return profanityList.some(word => lowerText.includes(word));
  };

  const validateSubmission = () => {
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return false;
    }

    if (content.trim().length < 100) {
      setError('Your opinion must be at least 100 characters long. Please provide a more detailed perspective.');
      return false;
    }

    if (!user) {
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

      if (!captchaAnswer.trim()) {
        setError('Please solve the math problem to verify you\'re human');
        return false;
      }

      if (parseInt(captchaAnswer) !== captchaQuestion.answer) {
        setError('Incorrect answer to the math problem. Please try again.');
        generateCaptcha();
        setCaptchaAnswer('');
        return false;
      }

      const anonymousPosts = JSON.parse(localStorage.getItem('anonymousDebatePosts') || '{}');
      if (anonymousPosts[id]) {
        setError('You have already posted an opinion for this debate. Only one opinion per person is allowed.');
        return false;
      }

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
    
    if (!validateSubmission()) return;
    
    try {
      setLoading(true);
      setError('');
      
      await axios.post(`/debate-topics/${id}/opinions`, {
        title: title.trim(),
        content: content.trim(),
        anonymousUsername: !user ? anonymousUsername.trim() : null
      });
      
      if (!user) {
        const anonymousPosts = JSON.parse(localStorage.getItem('anonymousDebatePosts') || '{}');
        anonymousPosts[id] = { timestamp: Date.now(), username: anonymousUsername.trim() };
        localStorage.setItem('anonymousDebatePosts', JSON.stringify(anonymousPosts));
        localStorage.setItem('lastAnonymousPost', Date.now().toString());
      }
      
      navigate(`/debate/${id}`);
    } catch (error) {
      console.error('Error creating opinion:', error);
      setError(error.response?.data?.error || 'Failed to create your opinion. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTimeRemaining = (expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry - now;
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded-lg w-1/3 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded-xl mb-10"></div>
            <div className="bg-gray-100 rounded-xl p-8 h-96"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!debateTopic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <AlertCircle className="mx-auto mb-6 text-gray-400" size={80} />
          <h1 className="text-5xl font-black mb-6 text-gray-900">Debate Not Found</h1>
          <p className="text-xl text-gray-600 mb-8">This debate topic may have expired or been removed.</p>
          <Link to="/" className="inline-block bg-black text-white px-8 py-4 text-lg font-bold hover:bg-gray-800 transition-colors">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <Link to={`/debate/${id}`} className="inline-flex items-center text-gray-700 mb-8 hover:text-black transition-colors font-semibold group">
          <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" size={20} />
          Back to Debate
        </Link>

        {/* Anonymous Posting Notice */}
        {!user && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <AlertCircle className="text-blue-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="text-gray-900 font-bold text-lg mb-2">Posting Anonymously?</h3>
                <p className="text-gray-700 mb-3">
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
                  className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-800 transition-colors"
                >
                  <Shield size={18} />
                  Create Free Account
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Debate Topic Header Card */}
        <div className="bg-white border-2 border-black rounded-xl shadow-xl overflow-hidden mb-10">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-red-600 to-orange-600 px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-white">
              <Flame size={32} fill="currentColor" />
              <div>
                <div className="text-sm font-bold uppercase tracking-wider">Active Debate</div>
                <div className="text-xs opacity-90">Write your opinion</div>
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
            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 text-yellow-800">
              <AlertCircle className="inline mr-2" size={18} />
              <strong>One opinion per person.</strong> Make it thoughtful and substantive.
            </div>
          </div>
        </div>

        {/* Write Opinion Form */}
        <div className="bg-white border-2 border-black rounded-xl shadow-xl p-8 mb-12">
          <h2 className="text-3xl font-black text-gray-900 mb-6">Write Your Opinion</h2>

          {error && (
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-6 text-red-700">
              <AlertCircle className="inline mr-2" size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Anonymous Username */}
            {!user && (
              <div>
                <label htmlFor="username" className="block text-gray-900 font-bold mb-2 flex items-center gap-2">
                  <User size={18} />
                  Your Username (visible to all)
                </label>
                <input
                  type="text"
                  id="username"
                  value={anonymousUsername}
                  onChange={(e) => setAnonymousUsername(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                  placeholder="Choose a username (3+ characters)"
                  maxLength={30}
                />
                <p className="text-gray-600 text-sm mt-2">Keep it respectful. No profanity.</p>
              </div>
            )}

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-gray-900 font-bold mb-2">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                placeholder="Give your opinion a compelling title"
                maxLength={255}
              />
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-gray-900 font-bold mb-2">
                Your Perspective (minimum 100 characters)
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all resize-none"
                placeholder="Share your detailed thoughts... Be thoughtful, clear, and substantive."
              ></textarea>
              <p className="text-gray-600 text-sm mt-2">
                {content.length} / 100 minimum characters
              </p>
            </div>

            {/* Captcha */}
            {!user && (
              <div>
                <label className="block text-gray-900 font-bold mb-2 flex items-center gap-2">
                  <Shield size={18} />
                  Verify you're human
                </label>
                <div className="flex items-center gap-4">
                  <div className="bg-gray-100 border-2 border-gray-300 rounded-lg px-6 py-3 font-bold text-lg">
                    {captchaQuestion.question}
                  </div>
                  <input
                    type="number"
                    value={captchaAnswer}
                    onChange={(e) => setCaptchaAnswer(e.target.value)}
                    className="w-32 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                    placeholder="?"
                  />
                </div>
              </div>
            )}

            {/* Submit */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 bg-black text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 shadow-lg"
              >
                {loading ? (
                  <>
                    <span className="animate-spin">
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                    </span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Submit Opinion
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default WriteDebateOpinion;