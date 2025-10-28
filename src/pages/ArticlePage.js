// pages/ArticlePage.js (Completely Redesigned)
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
  Clock, 
  Shuffle, 
  Moon, 
  Sun,
  User,
  Calendar,
  Bookmark,
  BookmarkCheck,
  TrendingUp,
  BarChart3
} from 'lucide-react';

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
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showTableOfContents, setShowTableOfContents] = useState(false);
  const [activeSection, setActiveSection] = useState('');
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

  // Handle scroll for reading progress and active section
  useEffect(() => {
    const handleScroll = () => {
      if (!articleContentRef.current) return;
      
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const trackLength = documentHeight - windowHeight;
      const progress = (scrollTop / trackLength) * 100;
      
      setReadingProgress(Math.min(progress, 100));
      
      // Update active section for table of contents
      const headings = articleContentRef.current.querySelectorAll('h1, h2, h3');
      let currentSection = '';
      
      headings.forEach(heading => {
        const rect = heading.getBoundingClientRect();
        if (rect.top <= 100) {
          currentSection = heading.id || heading.textContent;
        }
      });
      
      if (currentSection !== activeSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSection]);

  // Extract headings for table of contents
  const extractHeadings = (content) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const headings = Array.from(tempDiv.querySelectorAll('h1, h2, h3'));
    
    return headings.map((heading, index) => {
      const text = heading.textContent;
      const id = `heading-${index}`;
      heading.id = id;
      
      return {
        id,
        text,
        level: parseInt(heading.tagName.substring(1))
      };
    });
  };

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
        
        // Extract headings for table of contents
        const headings = extractHeadings(currentArticle.content);
        if (headings.length > 0) {
          setShowTableOfContents(true);
        }
        
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

  const handleBookmark = () => {
    if (!user) {
      handleLogin();
      return;
    }
    
    setIsBookmarked(!isBookmarked);
    // In a real implementation, you would call an API to save/unsave the article
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

  // Enhanced content formatting with proper HTML rendering
  const formatContent = (content) => {
    // Create a temporary div to parse the HTML content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    // Add IDs to headings for table of contents
    const headings = tempDiv.querySelectorAll('h1, h2, h3');
    headings.forEach((heading, index) => {
      heading.id = `heading-${index}`;
    });
    
    return tempDiv.innerHTML;
  };

  const canWriteCounter = user && counterOpinions.length < 5;
  const showSidebar = originalArticle || counterOpinions.length > 0 || relatedArticles.length > 0;

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className={`mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h1 className={`text-2xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Article Not Found</h1>
          <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>The article you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200 dark:bg-gray-700">
        <div 
          className="h-full bg-blue-500 transition-all duration-150"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
        {/* Header */}
        <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b sticky top-0 z-10`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}
              >
                UROWN
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRandomArticle}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'} transition-colors`}
                title="Random Article"
              >
                <Shuffle size={20} />
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-yellow-400' : 'hover:bg-gray-100 text-gray-600'} transition-colors`}
                title={darkMode ? 'Light Mode' : 'Dark Mode'}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>
        </header>

        {/* Auth Banner */}
        {!user && (
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-blue-50'} py-3 px-4`}>
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Enjoying this article? <span className="font-medium text-blue-500">Sign up</span> to save articles and write your own opinions.
              </p>
              <div className="flex space-x-2">
                <button 
                  onClick={handleLogin}
                  className={`text-sm px-3 py-1 rounded-lg font-medium ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-700 hover:bg-gray-50'} transition-colors`}
                >
                  Log In
                </button>
                <button 
                  onClick={handleSignup}
                  className="text-sm px-3 py-1 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Article Content */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Article Header */}
          <header className="mb-8">
            <div className="flex items-center mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-gradient-to-r ${getTierGradient(article.tier)}`}>
                <span className="text-lg">{getTierEmoji(article.tier)}</span>
              </div>
              <div>
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{article.display_name}</span>
                <div className="inline-block ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
                  {article.tier?.toUpperCase()} TIER
                </div>
              </div>
            </div>
            
            <div className="flex items-center text-sm text-gray-500 mb-6">
              <Calendar className="mr-1" size={14} />
              <span>{formatDate(article.created_at)}</span>
              <span className="mx-2">•</span>
              <Clock className="mr-1" size={14} />
              <span>{readingTime} min read</span>
              <span className="mx-2">•</span>
              <Eye className="mr-1" size={14} />
              <span>{article.views} views</span>
            </div>
            
            <h1 className={`text-3xl md:text-4xl font-bold mb-6 leading-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {article.title}
            </h1>
            
            <div className="flex flex-wrap gap-2 mb-6">
              <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <MessageSquare className="mr-1" size={14} />
                Opinion
              </div>
              {article.certified && (
                <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                  <Award className="mr-1" size={14} />
                  Editorial Certified
                </div>
              )}
              {article.featured && (
                <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                  <Award className="mr-1" size={14} />
                  Featured
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex space-x-4">
                <FacebookShareButton url={shareUrl} quote={shareTitle}>
                  <FacebookIcon size={28} round className="hover:scale-110 transition-transform" />
                </FacebookShareButton>
                <TwitterShareButton url={shareUrl} title={shareTitle}>
                  <TwitterIcon size={28} round className="hover:scale-110 transition-transform" />
                </TwitterShareButton>
                <LinkedinShareButton url={shareUrl} title={shareTitle}>
                  <LinkedinIcon size={28} round className="hover:scale-110 transition-transform" />
                </LinkedinShareButton>
                <EmailShareButton url={shareUrl} subject={shareTitle} body={shareTitle}>
                  <EmailIcon size={28} round className="hover:scale-110 transition-transform" />
                </EmailShareButton>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleBookmark}
                  className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                  title={isBookmarked ? "Remove bookmark" : "Bookmark this article"}
                >
                  {isBookmarked ? (
                    <BookmarkCheck size={20} className={darkMode ? "text-yellow-400" : "text-yellow-500"} />
                  ) : (
                    <Bookmark size={20} className={darkMode ? "text-gray-400" : "text-gray-600"} />
                  )}
                </button>
                <button
                  onClick={handleCopyLink}
                  className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                  title="Copy link"
                >
                  <Copy size={20} className={darkMode ? "text-gray-400" : "text-gray-600"} />
                </button>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Table of Contents */}
            {showTableOfContents && (
              <div className="lg:col-span-1">
                <div className={`sticky top-24 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-4`}>
                  <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Table of Contents</h3>
                  <nav>
                    <ul className="space-y-2">
                      {extractHeadings(article.content).map((heading) => (
                        <li key={heading.id} className={`${heading.level > 2 ? 'ml-4' : ''}`}>
                          <a
                            href={`#${heading.id}`}
                            className={`text-sm ${activeSection === heading.text ? 'text-blue-500 font-medium' : darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
                            onClick={(e) => {
                              e.preventDefault();
                              document.getElementById(heading.id).scrollIntoView({ behavior: 'smooth' });
                            }}
                          >
                            {heading.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className={`${showTableOfContents ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
              <div 
                ref={articleContentRef}
                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6 md:p-8`}
              >
                <div 
                  className={`prose prose-lg max-w-none ${darkMode ? 'prose-invert' : ''}`}
                  dangerouslySetInnerHTML={{ __html: formatContent(article.content) }}
                />
              </div>

              {/* Counter Opinion Section */}
              <div className={`mt-8 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                  <h2 className={`text-xl font-medium mb-4 sm:mb-0 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Disagree with this opinion?</h2>
                  <button
                    onClick={handleCounterOpinion}
                    disabled={!canWriteCounter}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
                      canWriteCounter
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <MessageSquare className="mr-2" size={18} />
                    Write Counter Opinion
                  </button>
                </div>
                {!canWriteCounter && user && (
                  <p className="text-sm text-red-500">Maximum number of counter opinions reached for this article.</p>
                )}
              </div>

              {/* Tags */}
              <div className={`mt-8 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
                <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {article.topics && article.topics.map(topic => (
                    <span
                      key={topic.id}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                    >
                      {topic.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Full Counter Opinions Section */}
          {counterOpinions.length > 0 && (
            <div id="counter-opinions-section" className={`mt-12 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
              <h2 className={`text-xl font-medium mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Counter Opinions ({counterOpinions.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {counterOpinions.map(opinion => (
                  <div 
                    key={opinion.id} 
                    className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 hover:shadow-md transition-all cursor-pointer`}
                    onClick={() => navigate(`/article/${opinion.id}`)}
                  >
                    <div className="flex items-center mb-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 bg-gradient-to-r ${getTierGradient(opinion.tier)}`}>
                        <span className="text-sm">{getTierEmoji(opinion.tier)}</span>
                      </div>
                      <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{opinion.display_name}</span>
                      <div className={`ml-auto px-2 py-0.5 text-xs font-medium rounded-full bg-gradient-to-r ${getTierGradient(opinion.tier)} text-white`}>
                        {opinion.tier?.toUpperCase()}
                      </div>
                    </div>
                    <h3 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{opinion.title}</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} line-clamp-3`}>
                      {opinion.content.replace(/<[^>]*>?/gm, '').substring(0, 150) + (opinion.content.length > 150 ? '...' : '')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className={`mt-12 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
              <h2 className={`text-xl font-medium mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedArticles.map(related => (
                  <div 
                    key={related.id}
                    className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg overflow-hidden hover:shadow-md transition-all cursor-pointer`}
                    onClick={() => navigate(`/article/${related.id}`)}
                  >
                    <div className="p-4">
                      <div className="flex items-center mb-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 bg-gradient-to-r ${getTierGradient(related.tier)}`}>
                          <span className="text-xs">{getTierEmoji(related.tier)}</span>
                        </div>
                        <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{related.display_name}</span>
                      </div>
                      <h3 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{related.title}</h3>
                      <div className="flex items-center text-xs text-gray-500">
                        <Eye className="mr-1" size={12} />
                        <span>{related.views} views</span>
                        <span className="mx-2">•</span>
                        <Clock className="mr-1" size={12} />
                        <span>{calculateReadingTime(related.content)} min read</span>
                      </div>
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
                <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Share this article</h3>
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
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Direct link to this article:</p>
                <div className="flex items-center">
                  <input 
                    type="text" 
                    readOnly 
                    value={shareUrl} 
                    className={`${darkMode ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-white text-gray-800 border-gray-300'} border rounded-l-lg px-3 py-2 text-sm w-64 truncate`}
                  />
                  <button 
                    onClick={handleCopyLink}
                    className="bg-blue-500 text-white px-3 py-2 rounded-r-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
            
            <div className={`${darkMode ? 'border-gray-700' : 'border-gray-200'} border-t pt-6 text-center`}>
              {reportSuccess ? (
                <div className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 p-4 rounded-lg mb-4">
                  <p className="font-medium">Thank you for reporting this article. Our team will review it shortly.</p>
                </div>
              ) : (
                <>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>Found this article concerning? Report it to our moderators.</p>
                  <button 
                    onClick={handleReportArticle}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center justify-center mx-auto"
                  >
                    <Flag className="mr-2" size={16} />
                    Report Article
                  </button>
                </>
              )}
            </div>
          </footer>
        </article>
      </div>

      {/* Paywall Modal */}
      {showPaywall && !user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60"></div>
          
          <div className={`relative ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl max-w-md w-full p-8 z-10`}>
            <button
              onClick={() => setShowPaywall(false)}
              className={`absolute top-4 right-4 ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
            >
              <X size={24} />
            </button>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={32} className="text-blue-500" />
              </div>
              <h2 className={`text-2xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Join the Conversation</h2>
              <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-6`}>
                Want to respond or publish your own? Create your free account — it takes 30 seconds.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleSignup}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                >
                  Create Free Account
                </button>
                <button
                  onClick={() => setShowPaywall(false)}
                  className={`px-6 py-3 ${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} rounded-lg font-medium transition-colors`}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60"></div>
          <div className={`relative ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl max-w-md w-full p-6 z-10`}>
            <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Report Article</h3>
            {error && (
              <div className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-3 rounded-lg mb-4">
                <p className="text-sm">{error}</p>
              </div>
            )}
            <form onSubmit={handleSubmitReport}>
              <div className="mb-4">
                <label htmlFor="reportReason" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Reason for reporting
                </label>
                <textarea
                  id="reportReason"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  required
                  rows={4}
                  className={`w-full px-3 py-2 ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500`}
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
                  className={`px-4 py-2 ${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} rounded-lg font-medium transition-colors`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reporting}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
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