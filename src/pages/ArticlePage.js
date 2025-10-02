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
import { Flag, ChevronDown, ChevronUp } from 'lucide-react';

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

  // Format article content with proper line breaks
  const formatContent = (content) => {
    return content
      .split('\n\n')
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 0)
      .map((paragraph, index) => `<p key=${index} class="mb-6 text-lg leading-relaxed font-serif">${paragraph}</p>`)
      .join('');
  };

  // Check if user can write a counter opinion (limit of 5 per article)
  const canWriteCounter = user && counterOpinions.length < 5;

  // Determine if we should show the sidebar
  const showSidebar = originalArticle || counterOpinions.length > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <div className="text-2xl mt-4 font-serif">Loading article...</div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-2xl px-4">
          <h1 className="text-4xl font-serif mb-4">Article Not Found</h1>
          <p className="text-xl mb-8 font-serif">The article you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-black text-white px-6 py-3 font-serif hover:bg-gray-800 transition-colors"
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

      <div className="min-h-screen bg-white">
        {/* Non-intrusive auth banner for non-logged users */}
        {!user && (
          <div className="bg-gray-50 py-3 px-4 flex justify-between items-center border-b border-gray-200">
            <div className="text-sm font-serif">
              Enjoying this article? <span className="font-medium">Sign up</span> to save articles to read later.
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={handleLogin}
                className="text-sm bg-white border border-gray-300 px-3 py-1 rounded font-serif hover:bg-gray-50 transition-colors"
              >
                Log In
              </button>
              <button 
                onClick={handleSignup}
                className="text-sm bg-black text-white px-3 py-1 rounded font-serif hover:bg-gray-800 transition-colors"
              >
                Sign Up
              </button>
            </div>
          </div>
        )}

        {/* Article Header */}
        <header className="max-w-4xl mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div className="flex items-center mb-4 md:mb-0">
              <span className="text-3xl mr-3">{getTierEmoji(article.tier)}</span>
              <div>
                <span className="text-xl font-medium">{article.display_name}</span>
                <span className="text-lg font-medium ml-4 text-gray-600">
                  {article.tier?.toUpperCase()} TIER
                </span>
              </div>
            </div>
            
            <div className="text-gray-500 text-sm md:text-base font-serif">
              <span>{formatDate(article.created_at)}</span>
              <span className="mx-2">•</span>
              <span>{article.views} views</span>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-serif mb-6 leading-tight">{article.title}</h1>
          
          {/* Article meta tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
              Opinion
            </span>
            {article.certified && (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                Editorial Certified
              </span>
            )}
            {article.featured && (
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                Featured
              </span>
            )}
          </div>
          
          {/* Share buttons */}
          <div className="flex space-x-4">
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
        </header>

        {/* Main Content and Sidebar */}
        <div className="max-w-4xl mx-auto px-4 pb-16">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className={`${showSidebar ? 'lg:w-2/3' : 'w-full'}`}>
              <div className="prose prose-lg max-w-none">
                <div 
                  className="text-gray-800 leading-relaxed font-serif"
                  dangerouslySetInnerHTML={{ __html: formatContent(article.content) }}
                />
              </div>

              {/* Counter Opinion Button */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-serif">Disagree with this opinion?</h2>
                  <button
                    onClick={handleCounterOpinion}
                    disabled={!canWriteCounter}
                    className={`px-6 py-3 font-serif transition-colors ${
                      canWriteCounter
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Counter Opinion
                  </button>
                </div>
                {!canWriteCounter && user && (
                  <p className="text-red-500 mt-2 font-serif">Maximum number of counter opinions reached for this article.</p>
                )}
              </div>
            </div>

            {/* Sidebar */}
            {showSidebar && (
              <div className="lg:w-1/3">
                {/* Original Article Section (if viewing a counter opinion) */}
                {originalArticle && (
                  <div className="mb-8 bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h3 className="text-xl font-serif mb-4">Original Piece</h3>
                    <div className="mb-3">
                      <span className="text-xl mr-2">{getTierEmoji(originalArticle.tier)}</span>
                      <span className="font-medium">{originalArticle.display_name}</span>
                      <span className="text-gray-600 ml-2 text-sm">
                        {originalArticle.tier?.toUpperCase()} TIER
                      </span>
                    </div>
                    <h4 className="font-serif text-lg mb-2">{originalArticle.title}</h4>
                    <div 
                      className="text-gray-800 text-sm mb-4 font-serif"
                      dangerouslySetInnerHTML={{ 
                        __html: formatContent(originalArticle.content.substring(0, 200) + (originalArticle.content.length > 200 ? '...' : ''))
                      }}
                    />
                    <button 
                      onClick={() => navigate(`/article/${originalArticle.id}`)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Read Original
                    </button>
                  </div>
                )}

                {/* Counter Opinions Dropdown - Only show if there are counter opinions */}
                {counterOpinions.length > 0 && (
                  <div className="bg-gray-50 rounded-lg border border-gray-200">
                    <div 
                      className="flex justify-between items-center p-4 cursor-pointer"
                      onClick={() => setShowCounters(!showCounters)}
                    >
                      <h3 className="text-xl font-serif">This Has Been Countered</h3>
                      {showCounters ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                    
                    {showCounters && (
                      <div className="px-4 pb-4 space-y-4">
                        {counterOpinions.map(opinion => (
                          <div key={opinion.id} className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center mb-2">
                              <span className="text-lg mr-2">{getTierEmoji(opinion.tier)}</span>
                              <span className="font-medium">{opinion.display_name}</span>
                              <span className="text-gray-600 ml-2 text-sm">
                                {opinion.tier?.toUpperCase()} TIER
                              </span>
                            </div>
                            <h4 className="font-serif mb-2">{opinion.title}</h4>
                            <div 
                              className="text-gray-800 text-sm mb-3 font-serif"
                              dangerouslySetInnerHTML={{ 
                                __html: formatContent(opinion.content.substring(0, 150) + (opinion.content.length > 150 ? '...' : ''))
                              }}
                            />
                            <button 
                              onClick={() => navigate(`/article/${opinion.id}`)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Read Counter
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
        <footer className="bg-gray-50 border-t border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
              <div className="mb-4 md:mb-0">
                <h3 className="text-lg font-serif mb-2">Share this article</h3>
                <div className="flex space-x-4">
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
                <p className="text-gray-500 mb-2 font-serif">Direct link to this article:</p>
                <div className="flex items-center">
                  <input 
                    type="text" 
                    readOnly 
                    value={shareUrl} 
                    className="border border-gray-300 rounded-l px-3 py-2 text-sm w-64 truncate font-serif"
                  />
                  <button 
                    onClick={handleCopyLink}
                    className="bg-gray-800 text-white px-3 py-2 rounded-r text-sm font-medium hover:bg-gray-700 transition-colors font-serif"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-8 text-center">
              {reportSuccess ? (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4 font-serif">
                  Thank you for reporting this article. Our team will review it shortly.
                </div>
              ) : (
                <>
                  <p className="text-gray-600 mb-4 font-serif">Found this article concerning? Report it to our moderators.</p>
                  <button 
                    onClick={handleReportArticle}
                    className="bg-red-600 text-white px-6 py-3 font-serif hover:bg-red-700 transition-colors flex items-center justify-center mx-auto"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-serif mb-4">Report Article</h3>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <p className="text-red-700 font-serif">{error}</p>
              </div>
            )}
            <form onSubmit={handleSubmitReport}>
              <div className="mb-4">
                <label htmlFor="reportReason" className="block text-sm font-medium text-gray-700 mb-1 font-serif">
                  Reason for reporting
                </label>
                <textarea
                  id="reportReason"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 font-serif"
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
                  className="px-4 py-2 border border-gray-300 rounded-md font-medium hover:bg-gray-50 font-serif"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reporting}
                  className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 disabled:opacity-50 font-serif"
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