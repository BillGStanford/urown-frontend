// src/pages/WriteDebateOpinion.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Save, AlertCircle, Shield, Clock, FileText } from 'lucide-react';

function WriteDebateOpinion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [debateTopic, setDebateTopic] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetching, setFetching] = useState(true);
  const [hasPosted, setHasPosted] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [mathQuestion, setMathQuestion] = useState({ question: '', answer: 0 });
  const [mathAnswer, setMathAnswer] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  const startTimeRef = useRef(Date.now());
  const lastPostTimeRef = useRef(localStorage.getItem('lastPostTime') || 0);

  // Reduced list of prohibited words (only the most offensive)
const prohibitedWords = [
  // Profanity and offensive terms
  'fuck', 'shit', 'asshole', 'bitch', 'bastard', 'damn', 'dick', 'cock', 'pussy',
  'cunt', 'motherfucker', 'fucker', 'slut', 'whore', 'twat', 'prick', 'wanker', 
  'bollocks', 'bugger', 'arse', 'douche', 'jackass', 'crap', 'bloody', 'jerk',

  // Racial and ethnic slurs
  'nigger', 'nigga', 'kike', 'spic', 'chink', 'gook', 'raghead', 'towelhead', 
  'sandnigger', 'beaner', 'wetback', 'zipperhead', 'gyppo', 'coon', 'jigaboo', 
  'porchmonkey', 'cracker', 'redskin', 'peckerwood', 'paki',

  // Homophobia, transphobia, ableism, and other slurs
  'fag', 'faggot', 'tranny', 'dyke', 'queer', 'homo', 'retard', 'retarded', 
  'spaz', 'cripple', 'lame', 'mongoloid', 'invalid', 'nutcase', 'psycho',

  // Hate speech and violent ideologies
  'kill yourself', 'go die', 'hang yourself', 'commit suicide', 'terrorist', 
  'nazi', 'hitler', 'genocide', 'massacre', 'death to', 'murder', 'lynch', 
  'bomb', 'execute', 'behead', 'exterminate', 'shoot up', 'white power', 
  'ethnic cleansing', 'heil hitler', 'gas them', 'holocaust denial',

  // Inappropriate and sexually explicit content
  'porn', 'xxx', 'sex', 'nude', 'naked', 'explicit', 'erotic', 'orgy', 
  'stripper', 'blowjob', 'handjob', 'rimjob', '69', 'anal', 'cum', 'jizz', 
  'milf', 'bdsm', 'fetish', 'sex tape', 'sex chat', 'onlyfans', 'escort',
  'incest', 'stepmom', 'stepsis', 'deepthroat', 'nsfw', 'squirting',

  // Spam and scam indicators
  'click here', 'buy now', 'free money', 'make money fast', 'limited offer', 
  'act now', 'call now', 'winner', 'congratulations', 'claim your prize', 
  'earn cash', 'guaranteed income', 'fast cash', 'get rich quick', 
  'no experience needed', 'double your money', 'risk-free', 
  'exclusive deal', 'work from home', 'easy money', 'instant payout',

  // Self-harm and suicide references (sensitive)
  'cut myself', 'slit wrists', 'jump off', 
  'overdose', 'painless death', 'end it all', 'die alone', 'worthless', 
  'nobody cares', 'end my life', 'I want to die', 'no way out',

  // Other harmful, abusive, or trolling language
  'kill yourself', 'nobody loves you', 'you should die', 'unlovable', 
  'go to hell', 'burn in hell', 'ugly af', 'fatass', 'loser', 'idiot', 
  'stupid', 'dumbass', 'moron', 'trash', 'garbage', 'failure', 'worthless',

  // Online trolling, harassment, and bullying
  'dox', 'doxx', 'doxxing', 'leak your address', 'swat you', 'swatting', 
  'hacked you', 'post your nudes', 'revenge porn', 'send nudes', 'leaked pics',

  // Impersonation, scams, and misleading terms
  'admin account', 'support team', 'your account is compromised', 
  'reset your password here', 'fake giveaway', 'verify your identity', 
  'login required', 'click to unlock', 'payment pending', 'bitcoin investment',
];

  // Reduced spam patterns
  const spamPatterns = [
    /(.)\1{6,}/, // Repeated characters (7+ times)
    /\b(\w+)(\s+\1){3,}\b/, // Repeated words (4+ times)
    /https?:\/\/[^\s]+/, // URLs
  ];

  useEffect(() => {
    const fetchDebateTopic = async () => {
      try {
        setFetching(true);
        const response = await axios.get(`/debate-topics/${id}`);
        setDebateTopic(response.data.topic);
        setTitle(`My Opinion: ${response.data.topic.title}`);
        
        // Check if user has already posted
        const postedDebates = JSON.parse(localStorage.getItem('postedDebates') || '[]');
        if (postedDebates.includes(id)) {
          setHasPosted(true);
        }
        
        // Generate math question
        generateMathQuestion();
      } catch (error) {
        console.error('Error fetching debate topic:', error);
        setError('Failed to load debate topic. It may have expired or been removed.');
      } finally {
        setFetching(false);
      }
    };
    
    fetchDebateTopic();
    
    // Update time spent every second
    const timer = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    
    return () => clearInterval(timer);
  }, [id]);

  const generateMathQuestion = () => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    const operations = ['+', '-'];
    const op = operations[Math.floor(Math.random() * operations.length)];
    
    let answer;
    switch(op) {
      case '+': answer = a + b; break;
      case '-': answer = a - b; break;
      default: answer = a + b;
    }
    
    setMathQuestion({ question: `${a} ${op} ${b}`, answer });
  };

  const validateContent = (title, content) => {
    const errors = [];
    
    // Reduced time requirement (must spend at least 10 seconds)
    if (timeSpent < 10) {
      errors.push('Please spend at least 10 seconds reading and writing your opinion.');
    }
    
    // Reduced rate limiting (must wait 2 minutes between posts)
    const timeSinceLastPost = Date.now() - parseInt(lastPostTimeRef.current);
    if (timeSinceLastPost < 2 * 60 * 1000) {
      const remainingTime = Math.ceil((2 * 60 * 1000 - timeSinceLastPost) / 1000);
      errors.push(`Please wait ${remainingTime} seconds before posting another opinion.`);
    }
    
    // Reduced title requirements
    if (!title || title.trim().length < 5) {
      errors.push('Title must be at least 5 characters long.');
    }
    if (title.length > 100) {
      errors.push('Title must be less than 100 characters.');
    }
    
    // Reduced content requirements
    const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;
    if (wordCount < 20) {
      errors.push('Content must be at least 20 words long.');
    }
    if (wordCount > 1000) {
      errors.push('Content must be less than 1000 words.');
    }
    
    // Check for prohibited words
    const lowerTitle = title.toLowerCase();
    const lowerContent = content.toLowerCase();
    
    for (const word of prohibitedWords) {
      if (lowerTitle.includes(word) || lowerContent.includes(word)) {
        errors.push('Content contains prohibited words or phrases. Please keep it civil and appropriate.');
        break;
      }
    }
    
    // Check for spam patterns
    for (const pattern of spamPatterns) {
      if (pattern.test(title) || pattern.test(content)) {
        errors.push('Content appears to be spam or contains repetitive patterns. Please write meaningful content.');
        break;
      }
    }
    
    // Reduced sentence requirement
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length < 1) {
      errors.push('Content must contain at least 1 complete sentence.');
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate math answer
    if (parseInt(mathAnswer) !== mathQuestion.answer) {
      setError('Incorrect answer to the math question. Please try again.');
      generateMathQuestion();
      setMathAnswer('');
      return;
    }
    
    // Validate content
    const errors = validateContent(title, content);
    if (errors.length > 0) {
      setValidationErrors(errors);
      setError('Please fix the following issues before submitting:');
      return;
    }
    
    setValidationErrors([]);
    setError('');
    
    try {
      setLoading(true);
      
      // Create the opinion as an article
      const response = await axios.post(`/debate-topics/${id}/opinions`, {
        title: title.trim(),
        content: content.trim(),
        author_name: "Uncreated User"
      });
      
      // Store in localStorage
      const postedDebates = JSON.parse(localStorage.getItem('postedDebates') || '[]');
      postedDebates.push(id);
      localStorage.setItem('postedDebates', JSON.stringify(postedDebates));
      
      // Update last post time
      localStorage.setItem('lastPostTime', Date.now().toString());
      lastPostTimeRef.current = Date.now();
      
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

  if (hasPosted) {
    return (
      <div className="min-h-screen bg-white py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-6">Already Posted</h1>
          <p className="text-xl text-gray-600 mb-8">You have already shared your opinion on this debate topic.</p>
          <Link to={`/debate/${id}`} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md transition-colors duration-200">
            Back to Debate
          </Link>
        </div>
      </div>
    );
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
          <p className="text-sm text-gray-500 mt-2">You're posting as <span className="font-medium">Uncreated User</span></p>
        </div>
        
        {/* Simplified Content Requirements Panel */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3">
            <Shield className="text-blue-600 mt-1" size={24} />
            <div>
              <h3 className="font-bold text-blue-900 mb-3">Simple Guidelines</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Minimum 20 words</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Keep it civil and appropriate</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>No spam or repetitive content</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>2-minute cooldown between posts</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">{debateTopic.title}</h2>
          <p className="text-gray-700">{debateTopic.description}</p>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-yellow-700 bg-yellow-50 p-3 rounded-md flex items-center">
              <AlertCircle className="inline mr-2" size={16} />
              Remember: You can only write one opinion per debate topic. Make it count!
            </div>
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <Clock size={16} />
              Time spent: {formatTime(timeSpent)}
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
              <p className="font-semibold mb-2">{error}</p>
              {validationErrors.length > 0 && (
                <ul className="list-disc list-inside text-sm space-y-1">
                  {validationErrors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
          
          <div className="mb-6">
            <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
              Title <span className="text-gray-500 text-sm">(5-100 characters)</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter a title for your opinion"
              maxLength={100}
            />
            <p className="text-sm text-gray-500 mt-1">{title.length}/100 characters</p>
          </div>
          
          <div className="mb-6">
            <label htmlFor="content" className="block text-gray-700 font-medium mb-2">
              Your Opinion <span className="text-gray-500 text-sm">(20-1000 words)</span>
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Share your thoughts on this debate topic..."
            ></textarea>
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>{content.trim().split(/\s+/).filter(word => word.length > 0).length} words</span>
              <span>{content.split(/[.!?]+/).filter(s => s.trim().length > 0).length} sentences</span>
            </div>
          </div>
          
          {/* Simplified Math Verification */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <label className="block text-gray-700 font-medium mb-2">
              <FileText className="inline mr-2" size={18} />
              Quick verification: What is {mathQuestion.question}?
            </label>
            <input
              type="number"
              value={mathAnswer}
              onChange={(e) => setMathAnswer(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your answer"
              required
            />
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || timeSpent < 10}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md flex items-center transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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