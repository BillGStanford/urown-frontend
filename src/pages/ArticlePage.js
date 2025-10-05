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
import { Flag, ChevronDown, ChevronUp, Award, MessageSquare, Share2, Copy, Eye } from 'lucide-react';

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
  const abortControllerRef = useRef(null);

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
    };
  }, [id]); // Only re-run effect when id changes

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

  const getStatusGradient = (status) => {
    switch (status) {
      case 'debate':
        return 'from-blue-500 to-blue-700';
      case 'certified':
        return 'from-purple-500 to-purple-700';
      case 'winner':
        return 'from-yellow-500 to-orange-500';
      default:
        return 'from-gray-500 to-gray-700';
    }
  };

  // Format article content with proper line breaks
  const formatContent = (content) => {
    return content
      .split('\n\n')
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 0)
      .map((paragraph, index) => `<p key=${index} class="mb-6 text-lg leading-relaxed font-serif text-gray-800">${paragraph}</p>`)
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
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gradient-to-r from-yellow-500 to-orange-500 mx-auto"></div>
          <div className="text-2xl mt-4 font-serif font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 to-orange-600">Loading article...</div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center max-w-2xl px-4">
          <h1 className="text-4xl font-serif mb-4 font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600">Article Not Found</h1>
          <p className="text-xl mb-8 font-serif text-gray-600">The article you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-3 font-serif font-bold text-white bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl hover:shadow-lg transform transition-all duration-300 hover:-translate-y-1"
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
        <meta property="og:description" content={article.content.substring(0, 160)} />
        <meta property="og:url" content={shareUrl} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.content.substring(0, 160)} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Non-intrusive auth banner for non-logged users */}
        {!user && (
          <div className="bg-white/80 backdrop-blur-md py-3 px-4 flex justify-between items-center border-b border-gray-200 sticky top-0 z-10">
            <div className="text-sm font-serif text-gray-700">
              Enjoying this article? <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600">Sign up</span> to save articles to read later.
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={handleLogin}
                className="text-sm bg-white border border-gray-300 px-3 py-1 rounded-lg font-serif font-medium hover:bg-gray-50 transition-all duration-300 hover:shadow-sm"
              >
                Log In
              </button>
              <button 
                onClick={handleSignup}
                className="text-sm bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-lg font-serif font-bold hover:shadow-md transform transition-all duration-300 hover:-translate-y-0.5"
              >
                Sign Up
              </button>
            </div>
          </div>
        )}

        {/* Article Header */}
        <header className="max-w-4xl mx-auto px-4 py-8 md:py-12">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 md:p-8 border border-white/70 mb-8 transform transition-all duration-300 hover:shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <div className="flex items-center mb-4 md:mb-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-gradient-to-r ${getTierGradient(article.tier)} shadow-md`}>
                  <span className="text-xl">{getTierEmoji(article.tier)}</span>
                </div>
                <div>
                  <span className="text-xl font-bold">{article.display_name}</span>
                  <div className={`inline-block ml-3 px-2 py-1 text-xs font-bold rounded-full bg-gradient-to-r ${getTierGradient(article.tier)} text-white shadow-sm`}>
                    {article.tier?.toUpperCase()} TIER
                  </div>
                </div>
              </div>
              
              <div className="flex items-center text-gray-600 text-sm md:text-base font-serif">
                <div className="flex items-center mr-4">
                  <Eye className="mr-1" size={16} />
                  <span>{article.views} views</span>
                </div>
                <span>{formatDate(article.created_at)}</span>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-serif font-black mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">
              {article.title}
            </h1>
            
            {/* Article meta tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              <div className="bg-gradient-to-r from-gray-600 to-gray-800 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center shadow-md">
                <MessageSquare className="mr-1" size={14} />
                Opinion
              </div>
              {article.certified && (
                <div className={`bg-gradient-to-r ${getStatusGradient('certified')} text-white px-3 py-1 rounded-full text-sm font-bold flex items-center shadow-md`}>
                  <Award className="mr-1" size={14} />
                  Editorial Certified
                </div>
              )}
              {article.featured && (
                <div className={`bg-gradient-to-r ${getStatusGradient('winner')} text-white px-3 py-1 rounded-full text-sm font-bold flex items-center shadow-md`}>
                  <Award className="mr-1" size={14} />
                  Featured
                </div>
              )}
            </div>
            
            {/* Share buttons */}
            <div className="flex space-x-4">
              <div className="p-1 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 shadow-md transform transition-all duration-300 hover:scale-105">
                <FacebookShareButton url={shareUrl} quote={shareTitle}>
                  <FacebookIcon size={32} round className="bg-white" />
                </FacebookShareButton>
              </div>
              <div className="p-1 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 shadow-md transform transition-all duration-300 hover:scale-105">
                <TwitterShareButton url={shareUrl} title={shareTitle}>
                  <TwitterIcon size={32} round className="bg-white" />
                </TwitterShareButton>
              </div>
              <div className="p-1 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 shadow-md transform transition-all duration-300 hover:scale-105">
                <LinkedinShareButton url={shareUrl} title={shareTitle}>
                  <LinkedinIcon size={32} round className="bg-white" />
                </LinkedinShareButton>
              </div>
              <div className="p-1 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 shadow-md transform transition-all duration-300 hover:scale-105">
                <EmailShareButton url={shareUrl} subject={shareTitle} body={shareTitle}>
                  <EmailIcon size={32} round className="bg-white" />
                </EmailShareButton>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content and Sidebar */}
        <div className="max-w-4xl mx-auto px-4 pb-16">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className={`${showSidebar ? 'lg:w-2/3' : 'w-full'}`}>
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 md:p-8 border border-white/70 transform transition-all duration-300 hover:shadow-xl">
                <div 
                  className="text-gray-800 leading-relaxed font-serif"
                  dangerouslySetInnerHTML={{ __html: formatContent(article.content) }}
                />
              </div>

              {/* Counter Opinion Button */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-center bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-white/70">
                  <h2 className="text-2xl font-serif font-bold mb-4 sm:mb-0">Disagree with this opinion?</h2>
                  <button
                    onClick={handleCounterOpinion}
                    disabled={!canWriteCounter}
                    className={`px-6 py-3 font-serif font-bold text-white rounded-xl transform transition-all duration-300 flex items-center ${
                      canWriteCounter
                        ? 'bg-gradient-to-r from-blue-500 to-blue-700 hover:shadow-lg hover:-translate-y-1'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <MessageSquare className="mr-2" size={18} />
                    Counter Opinion
                  </button>
                </div>
                {!canWriteCounter && user && (
                  <p className="text-red-500 mt-2 font-serif font-medium">Maximum number of counter opinions reached for this article.</p>
                )}
              </div>
            </div>

            {/* Sidebar */}
            {showSidebar && (
              <div className="lg:w-1/3 space-y-6">
                {/* Original Article Section (if viewing a counter opinion) */}
                {originalArticle && (
                  <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-white/70 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    <h3 className="text-xl font-serif font-bold mb-4">Original Piece</h3>
                    <div className="flex items-center mb-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 bg-gradient-to-r ${getTierGradient(originalArticle.tier)} shadow-sm`}>
                        <span className="text-lg">{getTierEmoji(originalArticle.tier)}</span>
                      </div>
                      <span className="font-bold">{originalArticle.display_name}</span>
                      <div className={`ml-2 px-2 py-0.5 text-xs font-bold rounded-full bg-gradient-to-r ${getTierGradient(originalArticle.tier)} text-white`}>
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
                      className="text-blue-600 hover:text-blue-800 font-bold flex items-center"
                    >
                      Read Original
                      <ChevronDown className="ml-1 rotate-270" size={16} />
                    </button>
                  </div>
                )}

                {/* Counter Opinions Dropdown - Only show if there are counter opinions */}
                {counterOpinions.length > 0 && (
                  <div id="counter-opinions-section" className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/70 overflow-hidden transform transition-all duration-300 hover:shadow-xl">
                    <div 
                      className="flex justify-between items-center p-4 cursor-pointer"
                      onClick={() => setShowCounters(!showCounters)}
                    >
                      <h3 className="text-xl font-serif font-bold">This Has Been Countered</h3>
                      {showCounters ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                    
                    {showCounters && (
                      <div className="px-4 pb-4 space-y-4">
                        {counterOpinions.map(opinion => (
                          <div key={opinion.id} className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow transform transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                            <div className="flex items-center mb-2">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center mr-2 bg-gradient-to-r ${getTierGradient(opinion.tier)} shadow-sm`}>
                                <span className="text-sm">{getTierEmoji(opinion.tier)}</span>
                              </div>
                              <span className="font-bold">{opinion.display_name}</span>
                              <div className={`ml-2 px-2 py-0.5 text-xs font-bold rounded-full bg-gradient-to-r ${getTierGradient(opinion.tier)} text-white`}>
                                {opinion.tier?.toUpperCase()}
                              </div>
                            </div>
                            <h4 className="font-serif font-bold mb-2">{opinion.title}</h4>
                            <div 
                              className="text-gray-700 text-sm mb-3 font-serif"
                              dangerouslySetInnerHTML={{ 
                                __html: formatContent(opinion.content.substring(0, 150) + (opinion.content.length > 150 ? '...' : ''))
                              }}
                            />
                            <button 
                              onClick={() => navigate(`/article/${opinion.id}`)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-bold flex items-center"
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
            )}
          </div>
        </div>

        {/* Article Footer */}
        <footer className="bg-white/80 backdrop-blur-md border-t border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
              <div className="mb-4 md:mb-0">
                <h3 className="text-lg font-serif font-bold mb-2 flex items-center">
                  <Share2 className="mr-2" size={18} />
                  Share this article
                </h3>
                <div className="flex space-x-4">
                  <div className="p-1 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 shadow-md transform transition-all duration-300 hover:scale-105">
                    <FacebookShareButton url={shareUrl} quote={shareTitle}>
                      <FacebookIcon size={32} round className="bg-white" />
                    </FacebookShareButton>
                  </div>
                  <div className="p-1 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 shadow-md transform transition-all duration-300 hover:scale-105">
                    <TwitterShareButton url={shareUrl} title={shareTitle}>
                      <TwitterIcon size={32} round className="bg-white" />
                    </TwitterShareButton>
                  </div>
                  <div className="p-1 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 shadow-md transform transition-all duration-300 hover:scale-105">
                    <LinkedinShareButton url={shareUrl} title={shareTitle}>
                      <LinkedinIcon size={32} round className="bg-white" />
                    </LinkedinShareButton>
                  </div>
                  <div className="p-1 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 shadow-md transform transition-all duration-300 hover:scale-105">
                    <EmailShareButton url={shareUrl} subject={shareTitle} body={shareTitle}>
                      <EmailIcon size={32} round className="bg-white" />
                    </EmailShareButton>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-gray-600 mb-2 font-serif">Direct link to this article:</p>
                <div className="flex items-center">
                  <input 
                    type="text" 
                    readOnly 
                    value={shareUrl} 
                    className="border border-gray-300 rounded-l-lg px-3 py-2 text-sm w-64 truncate font-serif bg-white/80 backdrop-blur-sm"
                  />
                  <button 
                    onClick={handleCopyLink}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-2 rounded-r-lg text-sm font-bold hover:shadow-md transform transition-all duration-300 hover:-translate-y-0.5 flex items-center"
                  >
                    <Copy className="mr-1" size={14} />
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-8 text-center">
              {reportSuccess ? (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4 rounded-lg font-serif">
                  <p className="text-green-700 font-bold">Thank you for reporting this article. Our team will review it shortly.</p>
                </div>
              ) : (
                <>
                  <p className="text-gray-600 mb-4 font-serif">Found this article concerning? Report it to our moderators.</p>
                  <button 
                    onClick={handleReportArticle}
                    className="bg-gradient-to-r from-red-500 to-red-700 text-white px-6 py-3 font-serif font-bold hover:shadow-lg transform transition-all duration-300 hover:-translate-y-1 flex items-center justify-center mx-auto rounded-xl"
                  >
                    <Flag className="mr-2" size={18} />
                    Report Article
                  </button>
                </>
              )}
            </div>
          </div>
        </footer>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl max-w-md w-full p-6 border border-white/70 transform transition-all duration-300">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-serif bg-white/80 backdrop-blur-sm"
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
                  className="px-4 py-2 border border-gray-300 rounded-lg font-bold hover:bg-gray-50 font-serif transform transition-all duration-300 hover:-translate-y-0.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reporting}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-lg font-bold hover:shadow-lg transform transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 font-serif"
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