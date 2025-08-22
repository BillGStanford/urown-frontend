import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Clock, User, Tag, ExternalLink, BookOpen, Share2, Eye, Wifi, WifiOff } from 'lucide-react';

const ArticleReadingPage = ({ user, logout }) => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  const navigate = useNavigate();

  // Load offline articles from local data
  const loadOfflineArticle = async (articleId) => {
    try {
      const response = await import('../data/articles.json');
      const offlineArticles = response.default || [];
      const foundArticle = offlineArticles.find(article => article.id === articleId);
      
      if (!foundArticle) {
        throw new Error('Article not found in offline data');
      }
      
      return foundArticle;
    } catch (error) {
      console.error('Error loading offline article:', error);
      throw error;
    }
  };

  // Fetch article from API
  const fetchOnlineArticle = async (articleId) => {
    const response = await fetch(`/api/articles/${articleId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Article not found');
    }
    
    return await response.json();
  };

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        
        // Try to fetch from API first
        try {
          const onlineArticle = await fetchOnlineArticle(id);
          setArticle(onlineArticle);
          setIsOffline(false);
        } catch (apiError) {
          console.log('API request failed, trying offline data...', apiError.message);
          
          // If API fails, try offline data
          try {
            const offlineArticle = await loadOfflineArticle(id);
            setArticle(offlineArticle);
            setIsOffline(true);
          } catch (offlineError) {
            throw new Error('Article not found online or offline');
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  // Record view if online
  useEffect(() => {
    if (article && !isOffline) {
      fetch(`/api/articles/${id}/view`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      }).catch(err => console.log('Could not record view:', err));
    }
  }, [article, id, isOffline]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-4xl newspaper-heading tracking-tighter loading-pulse">Loading Article...</div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} logout={logout} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="bg-white newspaper-border p-12">
            <div className="text-4xl newspaper-heading text-red-600 mb-4">
              {error || 'Article not found'}
            </div>
            <p className="text-lg mb-8">
              The article you're looking for doesn't exist or couldn't be loaded.
            </p>
            <Link 
              to="/" 
              className="btn-newspaper bg-black text-white px-6 py-3 inline-block hover-lift"
            >
              Return to Home
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const shareUrl = window.location.href;
  const shareTitle = article.title;

  // Handle image paths - use frontend assets path for offline mode
  const getImageSrc = (imagePath) => {
    if (!imagePath) return null;
    
    // If offline and path starts with /uploads, convert to assets path
    if (isOffline && imagePath.startsWith('/uploads/')) {
      const filename = imagePath.replace('/uploads/', '');
      return `/assets/uploads/${filename}`;
    }
    
    // If offline and already assets path, use as is
    if (isOffline && imagePath.startsWith('/assets/uploads/')) {
      return imagePath;
    }
    
    // Online mode - use original path
    return imagePath;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{article.title} - UROWN</title>
        <meta name="description" content={article.excerpt} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={shareUrl} />
        {article.featuredImage && (
          <meta property="og:image" content={`${window.location.origin}${getImageSrc(article.featuredImage)}`} />
        )}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.excerpt} />
        {article.featuredImage && (
          <meta name="twitter:image" content={`${window.location.origin}${getImageSrc(article.featuredImage)}`} />
        )}
        <meta name="author" content={article.author} />
        <meta name="keywords" content={article.tags?.join(', ') || ''} />
      </Helmet>

      <Navbar user={user} logout={logout} />

      {isOffline && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mx-4 mb-4 rounded">
          <div className="flex items-center">
            <WifiOff size={20} className="mr-3" />
            <div className="ml-3">
              <p className="text-sm font-medium">
                📖 Reading cached article - Some features may be limited in offline mode
              </p>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article className="bg-white newspaper-border p-8 md:p-12">
          {/* Category */}
          <div className="mb-4">
            <span className="bg-black text-white px-4 py-2 text-sm font-bold uppercase tracking-wide inline-block newspaper-border-thin">
              {article.category}
            </span>
            {isOffline && (
              <span className="ml-2 bg-yellow-500 text-white px-3 py-1 text-xs font-bold uppercase tracking-wide inline-block newspaper-border-thin">
                <WifiOff size={12} className="inline mr-1" />
                Offline
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl newspaper-heading leading-tight mb-4">
            {article.title}
          </h1>

          {/* Subtitle */}
          {article.subtitle && (
            <h2 className="text-2xl md:text-3xl newspaper-heading text-gray-700 mb-8">
              {article.subtitle}
            </h2>
          )}

          {/* Author, Date, and Engagement */}
          <div className="flex items-center justify-between mb-8 border-b-2 border-black pb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User size={20} />
                <span className="font-bold text-lg">{article.author}</span>
                {article.authorTier && (
                  <span className={`px-2 py-1 text-xs font-bold uppercase rounded ${
                    article.authorTier === 'diamond' ? 'bg-blue-500 text-white' :
                    article.authorTier === 'platinum' ? 'bg-gray-400 text-white' :
                    article.authorTier === 'gold' ? 'bg-yellow-500 text-white' :
                    'bg-gray-300 text-black'
                  }`}>
                    {article.authorTier}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Clock size={20} />
                <span className="font-bold text-lg">{formatDate(article.createdAt)}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <BookOpen size={20} />
                <span className="font-bold text-lg">{article.readingTime} min read</span>
              </div>
              <div className="flex items-center space-x-2">
                <Eye size={20} />
                <span className="font-bold text-lg">
                  {article.views || 0} views
                  {isOffline && <span className="text-xs text-gray-500 ml-1">(cached)</span>}
                </span>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          {article.featuredImage && (
            <div className="mb-12">
              <img 
                src={getImageSrc(article.featuredImage)}
                alt={article.title}
                className="w-full max-w-4xl mx-auto object-cover newspaper-border shadow-lg rounded"
                onError={(e) => {
                  // If image fails to load, hide it
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Content */}
          <div 
            className="article-content content-editor newspaper-body"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-12 mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <Tag size={20} />
                <h3 className="text-xl newspaper-heading">Tags</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="px-4 py-2 bg-gray-100 newspaper-border-thin text-sm font-bold uppercase"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Citations */}
          {article.citations && article.citations.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl newspaper-heading mb-4 flex items-center space-x-2">
                <BookOpen size={20} />
                <span>Citations</span>
              </h3>
              <ol className="list-decimal pl-6 space-y-4">
                {article.citations.map((citation, index) => (
                  <li key={index} className="text-base font-medium newspaper-body">
                    {citation.text} - {citation.source}
                    {citation.page && ` (Page ${citation.page})`}
                    {citation.url && !isOffline && (
                      <a 
                        href={citation.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-600 hover:underline flex items-center inline-flex space-x-1"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                    {citation.url && isOffline && (
                      <span className="ml-2 text-gray-500 text-sm">(Link disabled offline)</span>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Reference Links */}
          {article.links && article.links.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl newspaper-heading mb-4 flex items-center space-x-2">
                <ExternalLink size={20} />
                <span>References</span>
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                {article.links.map((link, index) => (
                  <li key={index}>
                    {!isOffline ? (
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {link.text || link.url}
                      </a>
                    ) : (
                      <span className="text-gray-600 font-medium">
                        {link.text || link.url}
                        <span className="text-gray-500 text-sm ml-2">(Link disabled offline)</span>
                      </span>
                    )}
                    {link.title && <span className="text-gray-600 ml-2">({link.title})</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Share Section */}
          <div className="border-t-2 border-black pt-8 flex items-center justify-between">
            <div className="text-lg newspaper-heading">
              Enjoyed this article? Share it!
            </div>
            <div className="flex space-x-4">
              <a 
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`btn-newspaper hover-lift flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded ${
                  isOffline ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={isOffline ? (e) => e.preventDefault() : undefined}
              >
                <Share2 size={16} />
                <span>Twitter{isOffline && ' (Offline)'}</span>
              </a>
              <a 
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`btn-newspaper hover-lift flex items-center space-x-2 px-4 py-2 bg-blue-700 text-white rounded ${
                  isOffline ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={isOffline ? (e) => e.preventDefault() : undefined}
              >
                <Share2 size={16} />
                <span>Facebook{isOffline && ' (Offline)'}</span>
              </a>
            </div>
          </div>

          {/* Offline Notice */}
          {isOffline && (
            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <div className="flex items-start">
                <WifiOff size={20} className="text-yellow-600 mt-1 mr-3" />
                <div>
                  <h4 className="font-bold text-yellow-800 mb-2">Reading Offline</h4>
                  <p className="text-yellow-700 text-sm">
                    You're reading a cached version of this article. Some features like sharing, 
                    external links, and view counting are disabled. Connect to the internet to 
                    access all features.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-12 pt-8 border-t border-gray-200 text-center">
            <Link 
              to="/" 
              className="btn-newspaper bg-black text-white px-6 py-3 inline-block hover-lift"
            >
              ← Back to Articles
            </Link>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default ArticleReadingPage;