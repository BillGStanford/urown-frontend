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
import { Flag, ChevronDown, ChevronUp, Award, MessageSquare, Share2, Copy, Eye, X, Clock, Shuffle, Moon, Sun, TrendingUp, ExternalLink } from 'lucide-react';

const ArticlePage = () => {
  const { id, slug } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useUser();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [originalArticle, setOriginalArticle] = useState(null);
  const [counterOpinions, setCounterOpinions] = useState([]);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [showCounters, setShowCounters] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const abortControllerRef = useRef(null);
  const paywallTimerRef = useRef(null);
  const articleContentRef = useRef(null);

  // Generate or retrieve browser fingerprint
  const getBrowserFingerprint = () => {
    let fingerprint = localStorage.getItem('browser_fingerprint');
    
    if (!fingerprint) {
      const userAgent = navigator.userAgent;
      const screenRes = `${screen.width}x${screen.height}`;
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const language = navigator.language;
      const platform = navigator.platform;
      
      fingerprint = btoa(`${userAgent}|${screenRes}|${timezone}|${language}|${platform}`);
      localStorage.setItem('browser_fingerprint', fingerprint);
    }
    
    return fingerprint;
  };

  const hasViewedArticle = (articleId) => {
    const fingerprint = getBrowserFingerprint();
    const storageKey = `viewed_articles_${fingerprint}`;
    const viewedArticles = JSON.parse(localStorage.getItem(storageKey) || '[]');
    return viewedArticles.includes(articleId);
  };

  const markArticleAsViewed = (articleId) => {
    const fingerprint = getBrowserFingerprint();
    const storageKey = `viewed_articles_${fingerprint}`;
    const viewedArticles = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    if (!viewedArticles.includes(articleId)) {
      viewedArticles.push(articleId);
      localStorage.setItem(storageKey, JSON.stringify(viewedArticles));
      
      axios.post(`/articles/${articleId}/view`, { fingerprint })
        .catch(err => console.error('Error incrementing view count:', err));
    }
  };

  const hasPaywallBeenShownToday = () => {
    const today = new Date().toDateString();
    const lastShown = localStorage.getItem('paywall_last_shown');
    return lastShown === today;
  };

  const markPaywallAsShown = () => {
    const today = new Date().toDateString();
    localStorage.setItem('paywall_last_shown', today);
  };

  // Calculate reading time
  const calculateReadingTime = (text) => {
    const wordsPerMinute = 200;
    const words = text.trim().split(/\s+/).length;
    const time = Math.ceil(words / wordsPerMinute);
    return time;
  };

  // Handle scroll for reading progress
  useEffect(() => {
    const handleScroll = () => {
      if (!articleContentRef.current) return;
      
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const trackLength = documentHeight - windowHeight;
      const progress = (scrollTop / trackLength) * 100;
      
      setReadingProgress(Math.min(progress, 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch related articles based on keywords
  const fetchRelatedArticles = async (articleTitle, currentArticleId) => {
    try {
      // Extract keywords from title (simple approach)
      const keywords = articleTitle.toLowerCase().split(' ')
        .filter(word => word.length > 4) // Only use words longer than 4 characters
        .slice(0, 3); // Take first 3 keywords
      
      const response = await axios.get('/articles', {
        params: { limit: 4 }
      });
      
      // Filter articles that share keywords and exclude current article
      const related = response.data.articles
        .filter(a => a.id !== parseInt(currentArticleId))
        .filter(a => {
          const lowerTitle = a.title.toLowerCase();
          return keywords.some(keyword => lowerTitle.includes(keyword));
        })
        .slice(0, 3);
      
      setRelatedArticles(related);
    } catch (err) {
      console.error('Error fetching related articles:', err);
    }
  };

  // Random article navigation
  const handleRandomArticle = async () => {
    try {
      const response = await axios.get('/articles', { params: { limit: 100 } });
      const articles = response.data.articles;
      if (articles.length > 0) {
        const randomArticle = articles[Math.floor(Math.random() * articles.length)];
        navigate(`/article/${randomArticle.id}`);
      }
    } catch (err) {
      console.error('Error fetching random article:', err);
    }
  };

  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

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
        
        // Calculate reading time
        const time = calculateReadingTime(currentArticle.content);
        setReadingTime(time);
        
        // Fetch related articles
        fetchRelatedArticles(currentArticle.title, id);
        
        if (!hasViewedArticle(id)) {
          markArticleAsViewed(id);
        }
        
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
        
        const counterResponse = await axios.get(`/articles?parent_article_id=${id}`);
        setCounterOpinions(counterResponse.data.articles);
      } catch (err) {
        if (!axios.isCancel(err)) {
          setError('Failed to load article');
          console.error('Error fetching article:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (paywallTimerRef.current) {
        clearTimeout(paywallTimerRef.current);
      }
    };
  }, [id]);

  useEffect(() => {
    if (!user && article && !hasPaywallBeenShownToday()) {
      if (paywallTimerRef.current) {
        clearTimeout(paywallTimerRef.current);
      }
      
      paywallTimerRef.current = setTimeout(() => {
        setShowPaywall(true);
        markPaywallAsShown();
      }, 2000);
      
      return () => {
        if (paywallTimerRef.current) {
          clearTimeout(paywallTimerRef.current);
        }
      };
    }
  }, [user, article]);

  useEffect(() => {
    if (article) {
      document.title = `${article.title} - UROWN`;
    } else {
      document.title = 'Loading Article - UROWN';
    }
  }, [article]);

  useEffect(() => {
    if (article) {
      const generatedSlug = createSlug(article.title);
      if (!slug || slug !== generatedSlug) {
        navigate(`/article/${id}/${generatedSlug}`, { replace: true });
      }
    }
  }, [article, slug, id, navigate]);

  useEffect(() => {
    if (searchParams.get('counterPublished') === 'true') {
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

  const createSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
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

  // Enhanced content formatting with drop cap and pull quotes
  const formatContent = (content) => {
    const paragraphs = content.split('\n\n').map(p => p.trim()).filter(p => p.length > 0);
    
    return paragraphs.map((paragraph, index) => {
      // Add drop cap to first paragraph
      if (index === 0) {
        const firstLetter = paragraph.charAt(0);
        const restOfParagraph = paragraph.substring(1);
        return `
          <p key=${index} class="mb-10 text-xl leading-loose font-serif ${darkMode ? 'text-gray-200' : 'text-gray-800'}">
            <span class="float-left text-6xl font-bold leading-none mr-2 mt-1 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}">${firstLetter}</span>${restOfParagraph}
          </p>
        `;
      }
      
      // Create pull quote for longer paragraphs (every 4th paragraph)
      if (index > 0 && index % 4 === 0 && paragraph.length > 100) {
        const excerpt = paragraph.substring(0, 120) + '...';
        return `
          <div key=${index} class="my-12">
            <div class="border-l-4 ${darkMode ? 'border-yellow-500 bg-gray-800' : 'border-yellow-500 bg-yellow-50'} pl-6 pr-6 py-4 italic text-2xl leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'} font-serif">
              "${excerpt}"
            </div>
          </div>
          <p key=${index}-p class="mb-10 text-xl leading-loose font-serif ${darkMode ? 'text-gray-200' : 'text-gray-800'}">${paragraph}</p>
        `;
      }
      
      return `<p key=${index} class="mb-10 text-xl leading-loose font-serif ${darkMode ? 'text-gray-200' : 'text-gray-800'}">${paragraph}</p>`;
    }).join('');
  };

  const canWriteCounter = user && counterOpinions.length < 5;
  const showSidebar = originalArticle || counterOpinions.length > 0 || relatedArticles.length > 0;

  // Format view count with commas
  const formatViewCount = (count) => {
    return count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-white'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-500 mx-auto"></div>
          <div className={`text-2xl mt-4 font-serif font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Loading article...</div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-white'} flex items-center justify-center`}>
        <div className="text-center max-w-2xl px-4">
          <h1 className={`text-4xl font-serif mb-4 font-black ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Article Not Found</h1>
          <p className={`text-xl mb-8 font-serif ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>The article you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-3 font-serif font-bold text-white bg-yellow-500 rounded-xl hover:bg-yellow-600 transition-colors duration-300"
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

      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200">
        <div 
          className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-150"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-white'} transition-colors duration-300`}>
        {/* Floating Action Bar (Right Side) */}
        <div className="fixed top-20 right-4 z-40 flex flex-col gap-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-3 rounded-full shadow-lg ${darkMode ? 'bg-gray-800 text-yellow-400' : 'bg-white text-gray-800'} hover:scale-110 transition-all duration-300 hover:shadow-xl`}
            title={darkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <div className="relative">
            <button
              onClick={() => setShareMenuOpen(!shareMenuOpen)}
              className={`p-3 rounded-full shadow-lg ${darkMode ? 'bg-gray-800 text-blue-400' : 'bg-white text-blue-600'} hover:scale-110 transition-all duration-300 hover:shadow-xl`}
              title="Share Article"
            >
              <Share2 size={20} />
            </button>
            
            {shareMenuOpen && (
              <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} overflow-hidden z-50`}>
                <div className="p-2">
                  <FacebookShareButton url={shareUrl} quote={shareTitle} className="flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <FacebookIcon size={20} round className="mr-2" />
                    <span className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Facebook</span>
                  </FacebookShareButton>
                  <TwitterShareButton url={shareUrl} title={shareTitle} className="flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <TwitterIcon size={20} round className="mr-2" />
                    <span className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Twitter</span>
                  </TwitterShareButton>
                  <LinkedinShareButton url={shareUrl} title={shareTitle} className="flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <LinkedinIcon size={20} round className="mr-2" />
                    <span className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>LinkedIn</span>
                  </LinkedinShareButton>
                  <EmailShareButton url={shareUrl} subject={shareTitle} body={shareTitle} className="flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <EmailIcon size={20} round className="mr-2" />
                    <span className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Email</span>
                  </EmailShareButton>
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors w-full text-left"
                  >
                    <Copy size={20} className="mr-2" />
                    <span className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{copied ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={handleRandomArticle}
            className={`p-3 rounded-full shadow-lg ${darkMode ? 'bg-gray-800 text-green-400' : 'bg-white text-green-600'} hover:scale-110 transition-all duration-300 hover:shadow-xl`}
            title="Random Article"
          >
            <Shuffle size={20} />
          </button>
        </div>

        {/* Auth Banner */}
        {!user && (
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-yellow-50'} py-3 px-4 flex justify-between items-center ${darkMode ? 'border-gray-700' : 'border-yellow-200'} border-b sticky top-0 z-10 mt-1`}>
            <div className={`text-sm font-serif ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Enjoying this article? <span className="font-bold text-yellow-600">Sign up</span> to save articles to read later.
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={handleLogin}
                className={`text-sm ${darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'bg-white border-gray-300 hover:bg-gray-50'} border px-3 py-1 rounded-lg font-serif font-medium transition-all duration-300`}
              >
                Log In
              </button>
              <button 
                onClick={handleSignup}
                className="text-sm bg-yellow-500 text-white px-3 py-1 rounded-lg font-serif font-bold hover:bg-yellow-600 transition-colors duration-300"
              >
                Sign Up
              </button>
            </div>
          </div>
        )}

        {/* Article Header */}
        <header className="max-w-4xl mx-auto px-4 py-8 md:py-12">
          {/* Topic Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              Technology
            </span>
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Innovation
            </span>
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              Future
            </span>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-gradient-to-r ${getTierGradient(article.tier)}`}>
                <span className="text-xl">{getTierEmoji(article.tier)}</span>
              </div>
              <div>
                <span className={`text-lg font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{article.display_name}</span>
                <div className="inline-block ml-3 px-2 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
                  {article.tier?.toUpperCase()} TIER
                </div>
              </div>
            </div>
            
            {/* Comprehensive Stats Bar */}
            <div className="flex items-center text-sm text-gray-500 mb-4">
              <Clock className="mr-1" size={14} />
              <span>{readingTime} min read</span>
              <span className="mx-2">•</span>
              <Eye className="mr-1" size={14} />
              <span>{formatViewCount(article.views)} views</span>
              <span className="mx-2">•</span>
              <span>{formatDate(article.created_at)}</span>
              {article.trending && (
                <>
                  <span className="mx-2">•</span>
                  <div className="flex items-center text-red-500">
                    <TrendingUp className="mr-1" size={14} />
                    <span>Trending</span>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <h1 className={`text-4xl md:text-6xl font-serif font-black mb-6 leading-tight ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            {article.title}
          </h1>
          
          <div className="flex flex-wrap gap-2 mb-6">
            <div className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
              <MessageSquare className="mr-1" size={14} />
              Opinion
            </div>
            {article.certified && (
              <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
                <Award className="mr-1" size={14} />
                Editorial Certified
              </div>
            )}
            {article.featured && (
              <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
                <Award className="mr-1" size={14} />
                Featured
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 pb-16">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className={`${showSidebar ? 'lg:w-3/4' : 'w-full'}`}>
              <div 
                ref={articleContentRef}
                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-8 md:p-12`}
              >
                <div 
                  className={`${darkMode ? 'text-gray-200' : 'text-gray-800'} leading-relaxed font-serif`}
                  dangerouslySetInnerHTML={{ __html: formatContent(article.content) }}
                />
              </div>

              {/* Engagement Section */}
              <div className={`mt-8 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
                <div className="flex flex-col sm:flex-row justify-between items-center">
                  <h2 className={`text-2xl font-serif font-bold mb-4 sm:mb-0 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Disagree with this Article?</h2>
                  <button
                    onClick={handleCounterOpinion}
                    disabled={!canWriteCounter}
                    className={`px-6 py-3 font-serif font-bold text-white rounded-lg transition-all duration-300 flex items-center ${
                      canWriteCounter
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 hover:shadow-lg transform hover:-translate-y-1'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <MessageSquare className="mr-2" size={18} />
                    Write a Counter Opinion
                  </button>
                </div>
                {!canWriteCounter && user && (
                  <p className="text-red-500 mt-2 font-serif font-medium">Maximum number of counter opinions reached for this article.</p>
                )}
              </div>
            </div>

            {/* Sidebar */}
            {showSidebar && (
              <div className="lg:w-1/4">
                <div className="sticky top-24 space-y-6">
                  {/* Original Article */}
                  {originalArticle && (
                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-4`}>
                      <h3 className={`text-lg font-serif font-bold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Original Piece</h3>
                      <div className="flex items-center mb-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 bg-gradient-to-r ${getTierGradient(originalArticle.tier)}`}>
                          <span className="text-xs">{getTierEmoji(originalArticle.tier)}</span>
                        </div>
                        <span className={`text-sm font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{originalArticle.display_name}</span>
                      </div>
                      <h4 className={`font-serif text-sm font-bold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{originalArticle.title}</h4>
                      <p className={`text-xs mb-3 font-serif ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                        {originalArticle.content.substring(0, 100) + (originalArticle.content.length > 100 ? '...' : '')}
                      </p>
                      <button 
                        onClick={() => navigate(`/article/${originalArticle.id}`)}
                        className="text-yellow-600 hover:text-yellow-700 font-bold text-sm flex items-center"
                      >
                        Read Original
                        <ExternalLink size={14} className="ml-1" />
                      </button>
                    </div>
                  )}

                  {/* Counter Opinions */}
                  {counterOpinions.length > 0 && (
                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-4`}>
                      <div 
                        className={`flex justify-between items-center mb-3 cursor-pointer`}
                        onClick={() => setShowCounters(!showCounters)}
                      >
                        <h3 className={`text-lg font-serif font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Counter Opinions</h3>
                        {showCounters ? <ChevronUp size={16} className={darkMode ? 'text-gray-400' : 'text-gray-600'} /> : <ChevronDown size={16} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />}
                      </div>
                      
                      {showCounters && (
                        <div className="space-y-3">
                          {counterOpinions.slice(0, 3).map(opinion => (
                            <div key={opinion.id} className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-3 cursor-pointer hover:bg-opacity-80 transition-all group`}
                              onClick={() => navigate(`/article/${opinion.id}`)}
                            >
                              <div className="flex items-center mb-1">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-1 bg-gradient-to-r ${getTierGradient(opinion.tier)}`}>
                                  <span className="text-xs">{getTierEmoji(opinion.tier)}</span>
                                </div>
                                <span className={`text-xs font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{opinion.display_name}</span>
                              </div>
                              <h4 className={`font-serif text-xs font-bold mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{opinion.title}</h4>
                              <div className="flex items-center text-xs text-gray-500">
                                <Eye size={12} className="mr-1" />
                                <span>{formatViewCount(opinion.views)} views</span>
                              </div>
                              <ExternalLink size={12} className={`ml-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'} opacity-0 group-hover:opacity-100 transition-opacity`} />
                            </div>
                          ))}
                          {counterOpinions.length > 3 && (
                            <button 
                              onClick={() => document.getElementById('counter-opinions-section').scrollIntoView({ behavior: 'smooth' })}
                              className="text-yellow-600 hover:text-yellow-700 font-bold text-sm"
                            >
                              View all {counterOpinions.length} counter opinions
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Related Articles */}
                  {relatedArticles.length > 0 && (
                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-4`}>
                      <h3 className={`text-lg font-serif font-bold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Related Articles</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {relatedArticles.map(related => (
                          <div 
                            key={related.id}
                            className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-3 rounded-lg cursor-pointer hover:bg-opacity-80 transition-all group`}
                            onClick={() => navigate(`/article/${related.id}`)}
                          >
                            <div className="flex items-center mb-1">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-1 bg-gradient-to-r ${getTierGradient(related.tier)}`}>
                                <span className="text-xs">{getTierEmoji(related.tier)}</span>
                              </div>
                              <span className={`text-xs font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{related.display_name}</span>
                            </div>
                            <h4 className={`font-serif text-xs font-bold mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{related.title}</h4>
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {formatViewCount(related.views)} views • {calculateReadingTime(related.content)} min
                            </p>
                            <ExternalLink size={12} className={`ml-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'} opacity-0 group-hover:opacity-100 transition-opacity mt-1`} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Full Counter Opinions Section */}
          {counterOpinions.length > 0 && (
            <div id="counter-opinions-section" className={`mt-8 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
              <h3 className={`text-2xl font-serif font-bold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>All Counter Opinions ({counterOpinions.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {counterOpinions.map(opinion => (
                  <div key={opinion.id} className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 hover:bg-opacity-80 transition-all cursor-pointer group`}
                    onClick={() => navigate(`/article/${opinion.id}`)}
                  >
                    <div className="flex items-center mb-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center mr-2 bg-gradient-to-r ${getTierGradient(opinion.tier)}`}>
                        <span className="text-sm">{getTierEmoji(opinion.tier)}</span>
                      </div>
                      <span className={`font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{opinion.display_name}</span>
                      <div className={`ml-2 px-2 py-0.5 text-xs font-bold rounded-full bg-gradient-to-r ${getTierGradient(opinion.tier)} text-white`}>
                        {opinion.tier?.toUpperCase()}
                      </div>
                    </div>
                    <h4 className={`font-serif font-bold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{opinion.title}</h4>
                    <p className={`text-sm mb-3 font-serif ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                      {opinion.content.substring(0, 150) + (opinion.content.length > 150 ? '...' : '')}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <Eye size={14} className="mr-1" />
                        <span>{formatViewCount(opinion.views)} views</span>
                      </div>
                      <ExternalLink size={14} className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} opacity-0 group-hover:opacity-100 transition-opacity`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Article Footer */}
          <footer className={`mt-12 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
              <div className="mb-4 md:mb-0">
                <h3 className={`text-lg font-serif font-bold mb-2 flex items-center ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  <Share2 className="mr-2" size={18} />
                  Share this article
                </h3>
                <div className="flex space-x-4">
                  <FacebookShareButton url={shareUrl} quote={shareTitle}>
                    <FacebookIcon size={32} round className="hover:scale-110 transition-transform" />
                  </FacebookShareButton>
                  <TwitterShareButton url={shareUrl} title={shareTitle}>
                    <TwitterIcon size={32} round className="hover:scale-110 transition-transform" />
                  </TwitterShareButton>
                  <LinkedinShareButton url={shareUrl} title={shareTitle}>
                    <LinkedinIcon size={32} round className="hover:scale-110 transition-transform" />
                  </LinkedinShareButton>
                  <EmailShareButton url={shareUrl} subject={shareTitle} body={shareTitle}>
                    <EmailIcon size={32} round className="hover:scale-110 transition-transform" />
                  </EmailShareButton>
                </div>
              </div>
              
              <div className="text-center">
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2 font-serif`}>Direct link to this article:</p>
                <div className="flex items-center">
                  <input 
                    type="text" 
                    readOnly 
                    value={shareUrl} 
                    className={`${darkMode ? 'border-gray-600 bg-gray-700 text-gray-300' : 'border-gray-300 bg-white text-gray-800'} border rounded-l-lg px-3 py-2 text-sm w-64 truncate font-serif`}
                  />
                  <button 
                    onClick={handleCopyLink}
                    className="bg-yellow-500 text-white px-3 py-2 rounded-r-lg text-sm font-bold hover:bg-yellow-600 transition-colors duration-300 flex items-center"
                  >
                    <Copy className="mr-1" size={14} />
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
            
            <div className={`${darkMode ? 'border-gray-700' : 'border-gray-200'} border-t pt-6 text-center`}>
              {reportSuccess ? (
                <div className={`${darkMode ? 'bg-green-900/50 border-green-700' : 'bg-green-50 border-green-500'} border-l-4 p-4 mb-4 rounded-lg font-serif`}>
                  <p className={`${darkMode ? 'text-green-400' : 'text-green-700'} font-bold`}>Thank you for reporting this article. Our team will review it shortly.</p>
                </div>
              ) : (
                <>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4 font-serif`}>Found this article concerning? Report it to our moderators.</p>
                  <button 
                    onClick={handleReportArticle}
                    className="bg-red-500 text-white px-6 py-3 font-serif font-bold hover:bg-red-600 transition-colors duration-300 flex items-center justify-center mx-auto rounded-lg"
                  >
                    <Flag className="mr-2" size={18} />
                    Report Article
                  </button>
                </>
              )}
            </div>
          </footer>
        </div>
      </div>

      {/* Paywall Modal */}
      {showPaywall && !user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
          
          <div className={`relative ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl max-w-md w-full p-8 z-10`}>
            <button
              onClick={() => setShowPaywall(false)}
              className={`absolute top-4 right-4 ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
            >
              <X size={24} />
            </button>
            
            <div className="text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare size={32} className="text-white" />
                </div>
                <h2 className={`text-2xl font-serif font-bold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Join the Conversation</h2>
                <p className={`text-lg font-serif ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-6`}>
                  Want to respond or publish your own? Create your free account — it takes 30 seconds.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleSignup}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-serif font-bold rounded-xl hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                >
                  Create Free Account
                </button>
                <button
                  onClick={() => setShowPaywall(false)}
                  className={`px-6 py-3 ${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} font-serif font-bold rounded-xl transition-colors`}
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
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl max-w-md w-full p-6`}>
            <h3 className={`text-xl font-serif font-bold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Report Article</h3>
            {error && (
              <div className={`${darkMode ? 'bg-red-900/50 border-red-700' : 'bg-red-50 border-red-500'} border-l-4 p-4 mb-4 rounded-lg`}>
                <p className={`${darkMode ? 'text-red-400' : 'text-red-700'} font-serif font-bold`}>{error}</p>
              </div>
            )}
            <form onSubmit={handleSubmitReport}>
              <div className="mb-4">
                <label htmlFor="reportReason" className={`block text-sm font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1 font-serif`}>
                  Reason for reporting
                </label>
                <textarea
                  id="reportReason"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  required
                  rows={4}
                  className={`w-full px-3 py-2 ${darkMode ? 'border-gray-600 bg-gray-700 text-gray-200' : 'border-gray-300 bg-white text-gray-800'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-serif`}
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
                  className={`px-4 py-2 ${darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'} border rounded-lg font-bold font-serif transition-colors`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reporting}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-colors duration-300 disabled:opacity-50 font-serif"
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