// pages/ArticlePage.js
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { 
  FacebookShareButton, 
  TwitterShareButton, 
  LinkedinShareButton,
  EmailShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  EmailIcon
} from 'react-share';
import { Helmet } from 'react-helmet';
import { 
  Flag, 
  ChevronDown, 
  ChevronUp, 
  Award, 
  MessageSquare, 
  Share2, 
  Copy, 
  Eye, 
  X, 
  Calendar,
  User,
  Clock,
  Bookmark,
  TrendingUp
} from 'lucide-react';

const ArticlePage = () => {
  const { id, slug } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useUser();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [originalArticle, setOriginalArticle] = useState(null);
  const [counterOpinions, setCounterOpinions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [showCounters, setShowCounters] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const abortControllerRef = useRef(null);
  const paywallTimerRef = useRef(null);

  // Generate or retrieve browser fingerprint
  const getBrowserFingerprint = () => {
    let fingerprint = localStorage.getItem('browser_fingerprint');
    
    if (!fingerprint) {
      // Create a simple fingerprint based on browser info
      const userAgent = navigator.userAgent;
      const screenRes = `${screen.width}x${screen.height}`;
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const language = navigator.language;
      const platform = navigator.platform;
      
      // Combine these to create a fingerprint
      fingerprint = btoa(`${userAgent}|${screenRes}|${timezone}|${language}|${platform}`);
      localStorage.setItem('browser_fingerprint', fingerprint);
    }
    
    return fingerprint;
  };

  // Check if article has been viewed by this browser
  const hasViewedArticle = (articleId) => {
    const fingerprint = getBrowserFingerprint();
    const storageKey = `viewed_articles_${fingerprint}`;
    const viewedArticles = JSON.parse(localStorage.getItem(storageKey) || '[]');
    return viewedArticles.includes(articleId);
  };

  // Mark article as viewed
  const markArticleAsViewed = (articleId) => {
    const fingerprint = getBrowserFingerprint();
    const storageKey = `viewed_articles_${fingerprint}`;
    const viewedArticles = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    if (!viewedArticles.includes(articleId)) {
      viewedArticles.push(articleId);
      localStorage.setItem(storageKey, JSON.stringify(viewedArticles));
      
      // Increment view count on the server
      axios.post(`/articles/${articleId}/view`, { fingerprint })
        .catch(err => console.error('Error incrementing view count:', err));
    }
  };

  // Check if paywall has been shown today
  const hasPaywallBeenShownToday = () => {
    const today = new Date().toDateString();
    const lastShown = localStorage.getItem('paywall_last_shown');
    return lastShown === today;
  };

  // Mark paywall as shown today
  const markPaywallAsShown = () => {
    const today = new Date().toDateString();
    localStorage.setItem('paywall_last_shown', today);
  };

  useEffect(() => {
    // Cancel any ongoing request before starting a new one
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create a new AbortController for this request
    abortControllerRef.current = new AbortController();
    
    const fetchArticle = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`/articles/${id}`, {
          signal: abortControllerRef.current.signal
        });
        const currentArticle = response.data.article;
        setArticle(currentArticle);
        
        // Mark article as viewed if not already viewed
        if (!hasViewedArticle(id)) {
          markArticleAsViewed(id);
        }
        
        // If this is a counter opinion, fetch the original article
        if (currentArticle.parent_article_id) {
          try {
            const originalResponse = await axios.get(`/articles/${currentArticle.parent_article_id}`, {
              signal: abortControllerRef.current.signal
            });
            setOriginalArticle(originalResponse.data.article);
          } catch (err) {
            if (!axios.isCancel(err)) {
              console.error('Error fetching original article:', err);
            }
          }
        }
        
        // Fetch counter opinions for this article (the one being viewed)
        const counterResponse = await axios.get(`/articles?parent_article_id=${id}`);
        setCounterOpinions(counterResponse.data.articles);
      } catch (err) {
        // Only set error if it's not a cancellation
        if (!axios.isCancel(err)) {
          setError('Failed to load article');
          console.error('Error fetching article:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();

    // Cleanup function to abort the request if the component unmounts
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (paywallTimerRef.current) {
        clearTimeout(paywallTimerRef.current);
      }
    };
  }, [id]); // Only re-run effect when id changes

  // Set up paywall timer for non-logged in users
  useEffect(() => {
    if (!user && article && !hasPaywallBeenShownToday()) {
      // Clear any existing timer
      if (paywallTimerRef.current) {
        clearTimeout(paywallTimerRef.current);
      }
      
      // Set a new timer to show the paywall after 2 seconds
      paywallTimerRef.current = setTimeout(() => {
        setShowPaywall(true);
        markPaywallAsShown();
      }, 2000);
      
      // Clean up the timer when component unmounts or user logs in
      return () => {
        if (paywallTimerRef.current) {
          clearTimeout(paywallTimerRef.current);
        }
      };
    }
  }, [user, article]);

  // Update document title when article changes
  useEffect(() => {
    if (article) {
      document.title = `${article.title} - UROWN`;
    } else {
      document.title = 'Loading Article - UROWN';
    }
  }, [article]);

  // Redirect to URL with slug if article is loaded and slug doesn't match
  useEffect(() => {
    if (article) {
      const generatedSlug = createSlug(article.title);
      if (!slug || slug !== generatedSlug) {
        navigate(`/article/${id}/${generatedSlug}`, { replace: true });
      }
    }
  }, [article, slug, id, navigate]);

  // Check if we should show a success message after publishing a counter opinion
  useEffect(() => {
    if (searchParams.get('counterPublished') === 'true') {
      // Scroll to counter opinions section
      const counterSection = document.getElementById('counter-opinions-section');
      if (counterSection) {
        counterSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [searchParams]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Function to create a URL-friendly slug from the title
  const createSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim();
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignup = () => {
    navigate('/signup');
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/article/${id}/${createSlug(article.title)}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBookmark = () => {
    if (!user) {
      handleLogin();
      return;
    }
    
    // Toggle bookmark state
    setBookmarked(!bookmarked);
    
    // Here you would typically save the bookmark to your backend
    // For now, we'll just update the local state
  };

  const handleReportArticle = () => {
    if (!user) {
      handleLogin();
      return;
    }
    setShowReportModal(true);
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!reportReason.trim()) {
      setError('Please provide a reason for reporting this article');
      return;
    }

    setReporting(true);
    setError(null);

    try {
      await axios.post(`/articles/${id}/report`, {
        reason: reportReason
      });
      setReporting(false);
      setShowReportModal(false);
      setReportSuccess(true);
      setReportReason('');
    } catch (err) {
      setReporting(false);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to submit report. Please try again.');
      }
    }
  };

  const handleCounterOpinion = () => {
    if (!user) {
      handleLogin();
      return;
    }
    navigate(`/write-counter?originalArticleId=${id}`);
  };

  const getTierEmoji = (tier) => {
    switch (tier?.toLowerCase()) {
      case 'silver':
        return '🥈';
      case 'gold':
        return '🥇';
      case 'platinum':
        return '💎';
      default:
        return '🥈';
    }
  };

  const getTierGradient = (tier) => {
    switch (tier?.toLowerCase()) {
      case 'silver':
        return 'from-gray-400 to-gray-600';
      case 'gold':
        return 'from-yellow-400 to-yellow-600';
      case 'platinum':
        return 'from-cyan-400 to-purple-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  // Format article content with proper HTML rendering
  const formatContent = (content) => {
    return content
      .split('\n\n')
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 0)
      .map((paragraph, index) => {
        // Check if it's a blockquote
        if (paragraph.includes('<blockquote')) {
          return paragraph;
        }
        // Check if it's a list
        else if (paragraph.includes('<ul>') || paragraph.includes('<ol>')) {
          return paragraph;
        }
        // Regular paragraph
        else {
          return `<p key=${index} class="article-paragraph">${paragraph}</p>`;
        }
      })
      .join('');
  };

  // Check if user can write a counter opinion (limit of 5 per article)
  const canWriteCounter = user && counterOpinions.length < 5;

  // Determine if we should show the sidebar
  const showSidebar = originalArticle || counterOpinions.length > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 bg-orange-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="mt-6 text-xl font-serif">Loading article...</div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center max-w-2xl px-4">
          <h1 className="text-4xl font-serif mb-4">Article Not Found</h1>
          <p className="text-xl mb-8 font-serif text-gray-600">The article you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-3 font-serif bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg transform transition-all duration-300 hover:-translate-y-1"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  const shareUrl = `${window.location.origin}/article/${id}/${createSlug(article.title)}`;
  const shareTitle = article.title;

  return (
    <>
      <Helmet>
        <title>{article.title} - UROWN</title>
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.title} />
        <meta property="og:url" content={shareUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content="https://urown-delta.vercel.app/urowncover.jpg" />
        <meta property="og:image:secure_url" content="https://urown-delta.vercel.app/urowncover.jpg" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.title} />
        <meta name="twitter:image" content="https://urown-delta.vercel.app/urowncover.jpg" />
        
        <meta name="description" content={article.title} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Newspaper-style Header */}
        <header className="bg-white border-b-4 border-black shadow-lg">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-black flex items-center justify-center mr-4">
                  <span className="text-white font-bold text-xl">U</span>
                </div>
                <div>
                  <h1 className="text-2xl font-serif font-black tracking-tight">UROWN</h1>
                  <p className="text-xs font-serif italic">Your Voice Matters</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-xs font-serif text-gray-600">TODAY'S PAPER</p>
                  <p className="text-sm font-serif">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Article Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center mb-6">
              <div className="h-px bg-black flex-grow"></div>
              <span className="px-4 text-xs font-serif uppercase tracking-widest text-gray-600">Opinion</span>
              <div className="h-px bg-black flex-grow"></div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-serif font-black leading-tight mb-6">
              {article.title}
            </h1>
            
            <div className="flex flex-wrap items-center justify-between pb-6 border-b border-gray-200">
              <div className="flex items-center mb-4 md:mb-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-gradient-to-r ${getTierGradient(article.tier)}`}>
                  <span className="text-lg">{getTierEmoji(article.tier)}</span>
                </div>
                <div>
                  <div className="flex items-center">
                    <span className="text-lg font-serif">{article.display_name}</span>
                    <div className={`ml-3 px-2 py-1 text-xs font-serif rounded-full bg-gradient-to-r ${getTierGradient(article.tier)} text-white`}>
                      {article.tier?.toUpperCase()} TIER
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 font-serif mt-1">
                    <Calendar className="mr-1" size={14} />
                    <span>{formatDate(article.created_at)}</span>
                    <Eye className="ml-3 mr-1" size={14} />
                    <span>{article.views} views</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBookmark}
                  className={`p-2 rounded-full ${bookmarked ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'} hover:bg-orange-100 hover:text-orange-600 transition-colors`}
                  title="Bookmark"
                >
                  <Bookmark size={18} fill={bookmarked ? "currentColor" : "none"} />
                </button>
                
                <button
                  onClick={handleCopyLink}
                  className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                  title="Copy link"
                >
                  <Copy size={18} />
                </button>
                
                <div className="flex space-x-2">
                  <FacebookShareButton url={shareUrl} quote={shareTitle}>
                    <FacebookIcon size={24} round />
                  </FacebookShareButton>
                  <TwitterShareButton url={shareUrl} title={shareTitle}>
                    <TwitterIcon size={24} round />
                  </TwitterShareButton>
                </div>
              </div>
            </div>
            
            {/* Article tags */}
            <div className="flex flex-wrap gap-2 mt-4">
              {article.certified && (
                <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-serif font-medium flex items-center">
                  <Award className="mr-1" size={12} />
                  Editorial Certified
                </div>
              )}
              {article.featured && (
                <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-serif font-medium flex items-center">
                  <TrendingUp className="mr-1" size={12} />
                  Featured
                </div>
              )}
              {article.is_debate_winner && (
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-serif font-medium flex items-center">
                  <Award className="mr-1" size={12} />
                  Debate Winner
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="prose prose-lg max-w-none">
              <div 
                className="article-content text-gray-800 leading-relaxed font-serif text-lg"
                dangerouslySetInnerHTML={{ __html: formatContent(article.content) }}
              />
            </div>
          </div>
        </div>

        {/* Article Footer */}
        <div className="bg-gray-50 border-t border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
              <div className="mb-4 md:mb-0">
                <h3 className="text-lg font-serif font-bold mb-4 flex items-center">
                  <Share2 className="mr-2" size={18} />
                  Share this article
                </h3>
                <div className="flex space-x-3">
                  <FacebookShareButton url={shareUrl} quote={shareTitle}>
                    <FacebookIcon size={32} round />
                  </FacebookShareButton>
                  <TwitterShareButton url={shareUrl} title={shareTitle}>
                    <TwitterIcon size={32} round />
                  </TwitterShareButton>
                  <LinkedinShareButton url={shareUrl} title={shareTitle}>
                    <LinkedinIcon size={32} round />
                  </LinkedinShareButton>
                  <EmailShareButton url={shareUrl} subject={shareTitle} body={shareTitle}>
                    <EmailIcon size={32} round />
                  </EmailShareButton>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-gray-600 mb-2 font-serif text-sm">Direct link to this article:</p>
                <div className="flex items-center">
                  <input 
                    type="text" 
                    readOnly 
                    value={shareUrl} 
                    className="border border-gray-300 rounded-l-lg px-3 py-2 text-sm w-64 truncate font-serif bg-white"
                  />
                  <button 
                    onClick={handleCopyLink}
                    className="bg-black text-white px-3 py-2 rounded-r-lg text-sm font-serif hover:bg-gray-800 transition-colors"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0">
                  <h3 className="text-lg font-serif font-bold mb-2">Disagree with this opinion?</h3>
                  <button
                    onClick={handleCounterOpinion}
                    disabled={!canWriteCounter}
                    className={`px-6 py-3 font-serif font-bold text-white rounded-lg flex items-center ${
                      canWriteCounter
                        ? 'bg-black hover:bg-gray-800'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <MessageSquare className="mr-2" size={18} />
                    Write a Counter Opinion
                  </button>
                  {!canWriteCounter && user && (
                    <p className="text-red-500 mt-2 font-serif text-sm">Maximum number of counter opinions reached for this article.</p>
                  )}
                </div>
                
                <div className="text-center">
                  {reportSuccess ? (
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4 rounded-lg font-serif">
                      <p className="text-green-700 font-serif">Thank you for reporting this article. Our team will review it shortly.</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-600 mb-2 font-serif text-sm">Found this article concerning?</p>
                      <button 
                        onClick={handleReportArticle}
                        className="px-4 py-2 bg-red-600 text-white font-serif font-bold rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center mx-auto"
                      >
                        <Flag className="mr-2" size={16} />
                        Report Article
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar for Counter Opinions */}
        {showSidebar && (
          <div className="bg-white border-t border-gray-200">
            <div className="max-w-4xl mx-auto px-4 py-8">
              {/* Original Article Section (if viewing a counter opinion) */}
              {originalArticle && (
                <div className="mb-8">
                  <h3 className="text-xl font-serif font-bold mb-4 flex items-center">
                    <span className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center mr-3 text-sm">O</span>
                    Original Piece
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-black">
                    <div className="flex items-center mb-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 bg-gradient-to-r ${getTierGradient(originalArticle.tier)}`}>
                        <span className="text-sm">{getTierEmoji(originalArticle.tier)}</span>
                      </div>
                      <span className="font-serif">{originalArticle.display_name}</span>
                      <div className={`ml-2 px-2 py-0.5 text-xs font-serif rounded-full bg-gradient-to-r ${getTierGradient(originalArticle.tier)} text-white`}>
                        {originalArticle.tier?.toUpperCase()}
                      </div>
                    </div>
                    <h4 className="font-serif text-lg font-bold mb-2">{originalArticle.title}</h4>
                    <div 
                      className="text-gray-700 text-sm mb-4 font-serif"
                      dangerouslySetInnerHTML={{ 
                        __html: formatContent(originalArticle.content.substring(0, 200) + (originalArticle.content.length > 200 ? '...' : ''))
                      }}
                    />
                    <button 
                      onClick={() => navigate(`/article/${originalArticle.id}`)}
                      className="text-black font-serif font-bold flex items-center hover:underline"
                    >
                      Read Original
                      <ChevronDown className="ml-1 rotate-270" size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Counter Opinions Section */}
              {counterOpinions.length > 0 && (
                <div id="counter-opinions-section">
                  <div 
                    className="flex justify-between items-center mb-4 cursor-pointer"
                    onClick={() => setShowCounters(!showCounters)}
                  >
                    <h3 className="text-xl font-serif font-bold flex items-center">
                      <span className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center mr-3 text-sm">C</span>
                      This Has Been Countered
                    </h3>
                    {showCounters ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                  
                  {showCounters && (
                    <div className="space-y-4">
                      {counterOpinions.map(opinion => (
                        <div key={opinion.id} className="bg-gray-50 rounded-lg p-6 border-l-4 border-red-500">
                          <div className="flex items-center mb-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 bg-gradient-to-r ${getTierGradient(opinion.tier)}`}>
                              <span className="text-sm">{getTierEmoji(opinion.tier)}</span>
                            </div>
                            <span className="font-serif">{opinion.display_name}</span>
                            <div className={`ml-2 px-2 py-0.5 text-xs font-serif rounded-full bg-gradient-to-r ${getTierGradient(opinion.tier)} text-white`}>
                              {opinion.tier?.toUpperCase()}
                            </div>
                          </div>
                          <h4 className="font-serif text-lg font-bold mb-2">{opinion.title}</h4>
                          <div 
                            className="text-gray-700 text-sm mb-4 font-serif"
                            dangerouslySetInnerHTML={{ 
                              __html: formatContent(opinion.content.substring(0, 150) + (opinion.content.length > 150 ? '...' : ''))
                            }}
                          />
                          <button 
                            onClick={() => navigate(`/article/${opinion.id}`)}
                            className="text-black font-serif font-bold flex items-center hover:underline"
                          >
                            Read Counter
                            <ChevronDown className="ml-1 rotate-270" size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Newspaper-style Footer */}
        <footer className="bg-black text-white py-8">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 bg-white flex items-center justify-center mr-3">
                    <span className="text-black font-bold text-xl">U</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-black tracking-tight">UROWN</h3>
                    <p className="text-xs font-serif italic">Your Voice Matters</p>
                  </div>
                </div>
                <p className="text-xs font-serif">© {new Date().getFullYear()} UROWN. All rights reserved.</p>
              </div>
              
              <div className="flex space-x-6">
                <a href="/browse" className="text-xs font-serif hover:underline">Browse Articles</a>
                <a href="/contact" className="text-xs font-serif hover:underline">Contact Us</a>
                <a href="/community-guidelines" className="text-xs font-serif hover:underline">Community Guidelines</a>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Paywall Modal for Non-Logged In Users */}
      {showPaywall && !user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with blur effect */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
          
          {/* Paywall Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 z-10">
            {/* Close Button */}
            <button
              onClick={() => setShowPaywall(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={24} />
            </button>
            
            {/* Paywall Message */}
            <div className="text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare size={32} className="text-white" />
                </div>
                <h2 className="text-2xl font-serif font-bold mb-4">Join the Conversation</h2>
                <p className="text-lg font-serif text-gray-700 mb-6">
                  Want to respond or publish your own? Create your free account — it takes 30 seconds.
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleSignup}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-serif font-bold rounded-xl hover:shadow-lg transform transition-all duration-300 hover:-translate-y-1"
                >
                  Create Free Account
                </button>
                <button
                  onClick={() => setShowPaywall(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-800 font-serif font-bold rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Continue Reading
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-serif font-bold mb-4">Report Article</h3>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-lg">
                <p className="text-red-700 font-serif font-bold">{error}</p>
              </div>
            )}
            <form onSubmit={handleSubmitReport}>
              <div className="mb-4">
                <label htmlFor="reportReason" className="block text-sm font-bold text-gray-700 mb-1 font-serif">
                  Reason for reporting
                </label>
                <textarea
                  id="reportReason"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-serif"
                  placeholder="Please explain why you're reporting this article..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowReportModal(false);
                    setReportReason('');
                    setError(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-bold hover:bg-gray-50 font-serif"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reporting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 disabled:opacity-50 font-serif"
                >
                  {reporting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ArticlePage;