import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/UserContext';
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
  BookmarkPlus,
  Bookmark,
  TrendingUp,
  Users,
  Calendar,
  Check,
  ExternalLink,
  MoreHorizontal,
  Highlighter,
  Maximize2,
  StickyNote,
  Type,
  Minus,
  Plus,
  AlignLeft,
  AlignCenter,
  ChevronLeft,
  ChevronRight,
  Settings,
  Palette
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
  const [darkMode, setDarkMode] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [showCounters, setShowCounters] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reporting, setReporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [activeSection, setActiveSection] = useState('article');
  const articleContentRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Premium Reading Features
  const [focusMode, setFocusMode] = useState(false);
  const [fontSize, setFontSize] = useState(20);
  const [fontFamily, setFontFamily] = useState('sans'); // Changed from 'serif' to 'sans'
  const [lineHeight, setLineHeight] = useState(1.8);
  const [contentWidth, setContentWidth] = useState('max'); // Default wide setting
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [highlightColor, setHighlightColor] = useState('#fef08a');
  const [highlights, setHighlights] = useState([]);
  const [showHighlighter, setShowHighlighter] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [readingMode, setReadingMode] = useState('comfortable');
  const [notePosition, setNotePosition] = useState('left');
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [notePos, setNotePos] = useState({ x: 32, y: 128 });
  const [annotatedHighlights, setAnnotatedHighlights] = useState([]); // New state for annotated highlights
  const [showNoteInput, setShowNoteInput] = useState(false); // State to show/hide note input
  const [currentHighlight, setCurrentHighlight] = useState(null); // Currently selected highlight for annotation
  const [noteText, setNoteText] = useState(''); // Text for the current note
  const notePanelRef = useRef(null);

  const generateSlug = (title) => {
    return title
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  const getBrowserFingerprint = () => {
    let fingerprint = sessionStorage.getItem('browser_fingerprint');
    
    if (!fingerprint) {
      const userAgent = navigator.userAgent;
      const screenRes = `${screen.width}x${screen.height}`;
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const language = navigator.language;
      const platform = navigator.platform;
      
      fingerprint = btoa(`${userAgent}|${screenRes}|${timezone}|${language}|${platform}`);
      sessionStorage.setItem('browser_fingerprint', fingerprint);
    }
    
    return fingerprint;
  };

  const hasViewedArticle = (articleId) => {
    const fingerprint = getBrowserFingerprint();
    const storageKey = `viewed_articles_${fingerprint}`;
    const viewedArticles = JSON.parse(sessionStorage.getItem(storageKey) || '[]');
    return viewedArticles.includes(articleId);
  };

  const markArticleAsViewed = (articleId) => {
    const fingerprint = getBrowserFingerprint();
    const storageKey = `viewed_articles_${fingerprint}`;
    const viewedArticles = JSON.parse(sessionStorage.getItem(storageKey) || '[]');
    
    if (!viewedArticles.includes(articleId)) {
      viewedArticles.push(articleId);
      sessionStorage.setItem(storageKey, JSON.stringify(viewedArticles));
      
      axios.post(`/articles/${articleId}/view`, { fingerprint })
        .catch(err => console.error('Error incrementing view count:', err));
    }
  };

  const calculateReadingTime = (text) => {
    const wordsPerMinute = 200;
    const words = text.trim().split(/\s+/).length;
    const time = Math.ceil(words / wordsPerMinute);
    return time;
  };

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

  const fetchRelatedArticles = async (articleTitle, currentArticleId) => {
    try {
      const keywords = articleTitle.toLowerCase().split(' ')
        .filter(word => word.length > 4)
        .slice(0, 3);
      
      const response = await axios.get('/articles', {
        params: { limit: 4 }
      });
      
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

  const handleRandomArticle = async () => {
    try {
      const response = await axios.get('/articles', { params: { limit: 100 } });
      const articles = response.data.articles;
      if (articles.length > 0) {
        const randomArticle = articles[Math.floor(Math.random() * articles.length)];
        navigate(`/article/${randomArticle.id}/${generateSlug(randomArticle.title)}`);
      }
    } catch (err) {
      console.error('Error fetching random article:', err);
    }
  };

  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (!user || !article) return;
      
      try {
        const response = await axios.get(`/articles/${id}/bookmark`);
        setBookmarked(response.data.bookmarked);
      } catch (err) {
        console.error('Error checking bookmark status:', err);
      }
    };
    
    checkBookmarkStatus();
  }, [user, article, id]);

  const handleBookmarkToggle = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setBookmarkLoading(true);
    try {
      if (bookmarked) {
        await axios.delete(`/articles/${id}/bookmark`);
        setBookmarked(false);
      } else {
        await axios.post(`/articles/${id}/bookmark`);
        setBookmarked(true);
      }
    } catch (err) {
      console.error('Error toggling bookmark:', err);
      setError('Failed to update bookmark');
    } finally {
      setBookmarkLoading(false);
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
        
        const correctSlug = generateSlug(currentArticle.title);
        
        if (!slug || slug !== correctSlug) {
          navigate(`/article/${id}/${correctSlug}`, { replace: true });
          return;
        }
        
        const time = calculateReadingTime(currentArticle.content);
        currentArticle.reading_time = time;
        
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
    };
  }, [id, slug, navigate]);

  useEffect(() => {
    if (article) {
      document.title = `${article.title} - UROWN`;
    } else {
      document.title = 'Loading Article - UROWN';
    }
  }, [article]);

  useEffect(() => {
    if (searchParams.get('counterPublished') === 'true') {
      const counterSection = document.getElementById('discussion');
      if (counterSection) {
        counterSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [searchParams]);

  const getTierColor = (tier) => {
    switch (tier?.toLowerCase()) {
      case 'silver': return 'from-gray-400 to-gray-600';
      case 'gold': return 'from-yellow-400 to-yellow-600';
      case 'platinum': return 'from-cyan-400 to-purple-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getTierEmoji = (tier) => {
    switch (tier?.toLowerCase()) {
      case 'silver': return '🥈';
      case 'gold': return '🥇';
      case 'platinum': return '💎';
      default: return '🥈';
    }
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const title = article.title;
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleReportArticle = () => {
    if (!user) {
      navigate('/login');
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
      navigate('/login');
      return;
    }
    navigate(`/write-counter?originalArticleId=${id}`);
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    if (selectedText && showHighlighter) {
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      span.style.backgroundColor = highlightColor;
      span.style.padding = '2px 0';
      span.style.borderRadius = '2px';
      span.className = 'highlight-span';
      span.dataset.highlightId = `highlight-${Date.now()}`;
      
      try {
        range.surroundContents(span);
        
        // Add click handler to the highlight
        span.addEventListener('click', (e) => {
          e.stopPropagation();
          const highlightId = span.dataset.highlightId;
          const existingAnnotation = annotatedHighlights.find(h => h.id === highlightId);
          
          if (existingAnnotation) {
            // Show existing annotation
            alert(`Note: ${existingAnnotation.note}`);
          } else {
            // Prompt for new annotation
            const note = prompt('Add a note for this highlight:');
            if (note) {
              setAnnotatedHighlights([...annotatedHighlights, {
                id: highlightId,
                text: selectedText,
                color: highlightColor,
                note: note
              }]);
              
              // Add visual indicator that this highlight has a note
              span.style.borderBottom = '2px dotted #333';
            }
          }
        });
        
        setHighlights([...highlights, { 
          id: span.dataset.highlightId,
          text: selectedText, 
          color: highlightColor 
        }]);
      } catch (e) {
        console.log('Could not highlight selection');
      }
    }
  };

  const clearHighlights = () => {
    const highlightedElements = document.querySelectorAll('.highlight-span');
    highlightedElements.forEach(el => {
      const parent = el.parentNode;
      while (el.firstChild) {
        parent.insertBefore(el.firstChild, el);
      }
      parent.removeChild(el);
    });
    setHighlights([]);
    setAnnotatedHighlights([]);
  };

  const getContentWidthClass = () => {
    switch (contentWidth) {
      case 'narrow': return 'max-w-2xl';
      case 'comfortable': return 'max-w-3xl';
      case 'max': return 'max-w-6xl'; // Increased width for default wide setting
      default: return 'max-w-6xl'; // Increased width for default wide setting
    }
  };

  const formatContent = (content) => {
    return content.split('\n\n').map((paragraph, index) => {
      if (index === 0) {
        return (
          <p 
            key={index} 
            className={`mb-8 leading-relaxed first-letter:text-7xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-1 ${darkMode ? 'first-letter:text-yellow-400' : 'first-letter:text-gray-900'}`}
            style={{ fontSize: `${fontSize}px`, lineHeight }}
          >
            {paragraph}
          </p>
        );
      }
      
      return (
        <p 
          key={index} 
          className="mb-8 leading-relaxed"
          style={{ fontSize: `${fontSize}px`, lineHeight }}
        >
          {paragraph}
        </p>
      );
    });
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-950' : 'bg-white'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-500 mx-auto"></div>
          <div className={`text-2xl mt-4 font-serif font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Loading article...</div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-950' : 'bg-white'} flex items-center justify-center`}>
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

  const fontFamilyClass = fontFamily === 'serif' ? 'font-serif' : fontFamily === 'sans' ? 'font-sans' : 'font-mono';

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-950' : 'bg-white'} transition-all duration-300`}>
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200/50">
        <div 
          className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-150 shadow-lg"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Floating Toolbar */}
      {!focusMode && (
        <div className="fixed top-24 right-8 z-40 flex flex-col gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-3 rounded-full shadow-xl ${darkMode ? 'bg-gray-900 text-gray-300 border border-gray-800' : 'bg-white text-gray-700 border border-gray-200'} hover:scale-110 transition-all duration-300`}
            title="Reading Settings"
          >
            <Settings size={20} />
          </button>
          
          {showSettings && (
            <div className={`absolute right-full mr-3 top-0 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} rounded-2xl shadow-2xl p-6 border w-80`}>
              <h3 className={`font-bold mb-4 text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>Reading Settings</h3>
              
              <div className="space-y-6">
                <div>
                  <label className={`text-sm font-medium mb-2 block ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Font Size</label>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setFontSize(Math.max(14, fontSize - 2))} className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}>
                      <Minus size={16} />
                    </button>
                    <span className={`text-sm font-mono ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{fontSize}px</span>
                    <button onClick={() => setFontSize(Math.min(32, fontSize + 2))} className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}>
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className={`text-sm font-medium mb-2 block ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Font Family</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => setFontFamily('serif')} className={`p-2 rounded-lg text-sm font-serif ${fontFamily === 'serif' ? 'bg-yellow-500 text-white' : `${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}`}>
                      Serif
                    </button>
                    <button onClick={() => setFontFamily('sans')} className={`p-2 rounded-lg text-sm font-sans ${fontFamily === 'sans' ? 'bg-yellow-500 text-white' : `${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}`}>
                      Sans
                    </button>
                    <button onClick={() => setFontFamily('mono')} className={`p-2 rounded-lg text-sm font-mono ${fontFamily === 'mono' ? 'bg-yellow-500 text-white' : `${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}`}>
                      Mono
                    </button>
                  </div>
                </div>

                <div>
                  <label className={`text-sm font-medium mb-2 block ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Width</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => setContentWidth('narrow')} className={`p-2 rounded-lg text-xs ${contentWidth === 'narrow' ? 'bg-yellow-500 text-white' : `${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}`}>
                      Narrow
                    </button>
                    <button onClick={() => setContentWidth('comfortable')} className={`p-2 rounded-lg text-xs ${contentWidth === 'comfortable' ? 'bg-yellow-500 text-white' : `${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}`}>
                      Comfy
                    </button>
                    <button onClick={() => setContentWidth('max')} className={`p-2 rounded-lg text-xs ${contentWidth === 'max' ? 'bg-yellow-500 text-white' : `${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}`}>
                      Wide
                    </button>
                  </div>
                </div>

                <div>
                  <label className={`text-sm font-medium mb-2 block ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Line Height</label>
                  <input 
                    type="range" 
                    min="1.4" 
                    max="2.2" 
                    step="0.1" 
                    value={lineHeight} 
                    onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Tight</span>
                    <span>Loose</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => setShowHighlighter(!showHighlighter)}
            className={`p-3 rounded-full shadow-xl ${showHighlighter ? 'bg-yellow-500 text-white' : `${darkMode ? 'bg-gray-900 text-gray-300 border border-gray-800' : 'bg-white text-gray-700 border border-gray-200'}`} hover:scale-110 transition-all duration-300`}
            title="Highlighter"
          >
            <Highlighter size={20} />
          </button>

          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`p-3 rounded-full shadow-xl ${showNotes ? 'bg-yellow-500 text-white' : `${darkMode ? 'bg-gray-900 text-gray-300 border border-gray-800' : 'bg-white text-gray-700 border border-gray-200'}`} hover:scale-110 transition-all duration-300`}
            title="Notes"
          >
            <StickyNote size={20} />
          </button>

          <button
            onClick={() => setFocusMode(!focusMode)}
            className={`p-3 rounded-full shadow-xl ${darkMode ? 'bg-gray-900 text-gray-300 border border-gray-800' : 'bg-white text-gray-700 border border-gray-200'} hover:scale-110 transition-all duration-300`}
            title="Focus Mode"
          >
            <Maximize2 size={20} />
          </button>

          <div className="h-px bg-gray-300 my-1"></div>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-3 rounded-full shadow-xl ${darkMode ? 'bg-gray-900 text-yellow-400 border border-gray-800' : 'bg-white text-gray-700 border border-gray-200'} hover:scale-110 transition-all duration-300`}
            title={darkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className={`p-3 rounded-full shadow-xl ${darkMode ? 'bg-gray-900 text-gray-300 border border-gray-800' : 'bg-white text-gray-600 border border-gray-200'} hover:scale-110 transition-all duration-300`}
              title="Share Article"
            >
              <Share2 size={20} />
            </button>
            {showShareMenu && (
              <div className={`absolute right-full mr-3 top-0 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} rounded-xl shadow-2xl p-4 border min-w-[200px]`}>
                <div className="space-y-2">
                  <button onClick={() => handleShare('twitter')} className={`w-full text-left px-3 py-2 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'} transition-colors flex items-center gap-2`}>
                    <ExternalLink size={16} />
                    <span>Twitter</span>
                  </button>
                  <button onClick={() => handleShare('linkedin')} className={`w-full text-left px-3 py-2 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'} transition-colors flex items-center gap-2`}>
                    <ExternalLink size={16} />
                    <span>LinkedIn</span>
                  </button>
                  <button onClick={() => handleShare('facebook')} className={`w-full text-left px-3 py-2 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'} transition-colors flex items-center gap-2`}>
                    <ExternalLink size={16} />
                    <span>Facebook</span>
                  </button>
                  <button onClick={() => handleShare('email')} className={`w-full text-left px-3 py-2 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'} transition-colors flex items-center gap-2`}>
                    <ExternalLink size={16} />
                    <span>Email</span>
                  </button>
                  <hr className={`my-2 ${darkMode ? 'border-gray-800' : 'border-gray-200'}`} />
                  <button onClick={handleCopyLink} className={`w-full text-left px-3 py-2 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'} transition-colors flex items-center gap-2`}>
                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                    <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Focus Mode Exit Button */}
      {focusMode && (
        <button
          onClick={() => setFocusMode(false)}
          className="fixed top-8 right-8 z-50 p-3 rounded-full bg-gray-900/80 backdrop-blur-sm text-white hover:bg-gray-800 transition-all duration-300"
          title="Exit Focus Mode"
        >
          <X size={24} />
        </button>
      )}

      {/* Notes Panel */}
      {showNotes && (
        <div className={`fixed left-8 top-32 z-40 w-80 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border rounded-2xl shadow-2xl p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>Quick Notes</h3>
            <button onClick={() => setShowNotes(false)} className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>
              <X size={20} />
            </button>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Take notes while reading..."
            className={`w-full h-64 p-4 rounded-xl ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'} border focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none`}
          />
          <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Notes are temporary and will be cleared when you leave
          </p>
          {highlights.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className={`text-sm font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Highlights ({highlights.length})
                </h4>
                <button onClick={clearHighlights} className="text-xs text-red-500 hover:text-red-600">
                  Clear All
                </button>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {highlights.map((highlight, idx) => (
                  <div key={idx} className={`p-2 rounded-lg text-xs ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`} style={{ borderLeft: `3px solid ${highlight.color}` }}>
                    {highlight.text.substring(0, 80)}...
                  </div>
                ))}
              </div>
            </div>
          )}
          {annotatedHighlights.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className={`text-sm font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Annotated Highlights ({annotatedHighlights.length})
                </h4>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {annotatedHighlights.map((annotation, idx) => (
                  <div key={idx} className={`p-2 rounded-lg text-xs ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`} style={{ borderLeft: `3px solid ${annotation.color}` }}>
                    <div className="font-medium mb-1">{annotation.text.substring(0, 40)}...</div>
                    <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Note: {annotation.note}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Highlighter Color Picker */}
      {showHighlighter && (
        <div className={`fixed left-8 bottom-8 z-40 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border rounded-2xl shadow-2xl p-4`}>
          <p className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Select text to highlight</p>
          <div className="flex gap-2">
            <button 
              onClick={() => setHighlightColor('#fef08a')} 
              className={`w-8 h-8 rounded-full bg-yellow-200 border-2 ${highlightColor === '#fef08a' ? 'border-gray-900 scale-125' : 'border-gray-300'} hover:scale-110 transition-transform`} 
              title="Yellow" 
            />
            <button 
              onClick={() => setHighlightColor('#bfdbfe')} 
              className={`w-8 h-8 rounded-full bg-blue-200 border-2 ${highlightColor === '#bfdbfe' ? 'border-gray-900 scale-125' : 'border-gray-300'} hover:scale-110 transition-transform`} 
              title="Blue" 
            />
            <button 
              onClick={() => setHighlightColor('#bbf7d0')} 
              className={`w-8 h-8 rounded-full bg-green-200 border-2 ${highlightColor === '#bbf7d0' ? 'border-gray-900 scale-125' : 'border-gray-300'} hover:scale-110 transition-transform`} 
              title="Green" 
            />
            <button 
              onClick={() => setHighlightColor('#fecaca')} 
              className={`w-8 h-8 rounded-full bg-red-200 border-2 ${highlightColor === '#fecaca' ? 'border-gray-900 scale-125' : 'border-gray-300'} hover:scale-110 transition-transform`} 
              title="Red" 
            />
            <button 
              onClick={() => setHighlightColor('#e9d5ff')} 
              className={`w-8 h-8 rounded-full bg-purple-200 border-2 ${highlightColor === '#e9d5ff' ? 'border-gray-900 scale-125' : 'border-gray-300'} hover:scale-110 transition-transform`} 
              title="Purple" 
            />
          </div>
          <div className={`mt-3 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Click on highlighted text to add a note
          </div>
        </div>
      )}

      {/* Main Content */}
      <article className={`${getContentWidthClass()} mx-auto px-4 sm:px-6 lg:px-8 ${focusMode ? 'pt-32' : 'lg:pt-24 pt-20'} pb-16`}>
        {/* Article Header */}
        {!focusMode && (
          <header id="article" className="mb-16">
            {/* Topic Tags */}
            {article.topics && article.topics.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {article.topics.map((topic, index) => (
                  <span key={index} className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${darkMode ? 'bg-gray-900 text-gray-400 border border-gray-800' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                    {topic}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className={`text-5xl md:text-7xl font-serif font-bold mb-10 leading-[1.1] tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {article.title}
            </h1>

            {/* Subtitle/Excerpt if available */}
            {article.excerpt && (
              <p className={`text-2xl mb-10 leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {article.excerpt}
              </p>
            )}

            {/* Author & Meta Info */}
   <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8 pb-8 border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br ${getTierColor(article.tier)} shadow-lg ring-4 ${darkMode ? 'ring-gray-900' : 'ring-white'}`}>
                  <span className="text-2xl">{getTierEmoji(article.tier)}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-bold text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {article.display_name}
                    </h3>
                    {article.certified && (
                      <Award size={18} className="text-purple-500" title="Editorial Certified" />
                    )}
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${getTierColor(article.tier)} text-white`}>
                      {article.tier?.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className={`flex flex-wrap items-center gap-6 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <div className="flex items-center gap-2">
                  <Calendar size={18} />
                  <span>{formatDate(article.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={18} />
                  <span>{article.reading_time} min read</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye size={18} />
                  <span>{article.views?.toLocaleString() || 0}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleBookmarkToggle}
                disabled={bookmarkLoading}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-300 ${
                  bookmarked 
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600 shadow-lg' 
                    : `${darkMode ? 'bg-gray-900 text-gray-300 hover:bg-gray-800 border border-gray-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'}`
                } ${bookmarkLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {bookmarkLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent border-yellow-500"></div>
                ) : (
                  <>
                    {bookmarked ? <Bookmark size={18} /> : <BookmarkPlus size={18} />}
                    <span>{bookmarked ? 'Saved' : 'Save'}</span>
                  </>
                )}
              </button>
              
              <button
                onClick={handleRandomArticle}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium ${darkMode ? 'bg-gray-900 text-gray-300 hover:bg-gray-800 border border-gray-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'} transition-all duration-300`}
              >
                <Shuffle size={18} />
                <span>Random</span>
              </button>
            </div>
          </header>
        )}

        {/* Article Content */}
        <div 
          ref={articleContentRef} 
          className={`${fontFamilyClass} ${darkMode ? 'text-gray-200' : 'text-gray-800'} ${focusMode ? 'pt-16' : ''}`}
          onMouseUp={handleTextSelection}
        >
          {formatContent(article.content)}
        </div>

        {/* Engagement Section */}
        {!focusMode && (
          <>
            <div className={`mt-20 mb-16 p-10 rounded-3xl ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800' : 'bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200'} shadow-xl`}>
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-center md:text-left">
                  <h3 className={`text-3xl font-serif font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Have a different perspective?
                  </h3>
                  <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Join the discussion by writing a counter opinion.
                  </p>
                </div>
                <button
                  onClick={handleCounterOpinion}
                  className="px-10 py-5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-lg rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-3 whitespace-nowrap"
                >
                  <MessageSquare size={24} />
                  Write Counter Opinion
                </button>
              </div>
            </div>

            {/* Original Article */}
            {originalArticle && (
              <section className="mb-16">
                <h2 className={`text-4xl font-serif font-bold mb-8 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Original Article
                </h2>
                <div
                  onClick={() => navigate(`/article/${originalArticle.id}/${generateSlug(originalArticle.title)}`)}
                  className={`p-8 rounded-2xl ${darkMode ? 'bg-gray-900 border-gray-800 hover:border-gray-700' : 'bg-gray-50 border-gray-200 hover:border-yellow-500'} border cursor-pointer transition-all duration-300 hover:shadow-2xl group`}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br ${getTierColor(originalArticle.tier)} shadow-lg`}>
                      <span className="text-2xl">{getTierEmoji(originalArticle.tier)}</span>
                    </div>
                    <div>
                      <h4 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {originalArticle.display_name}
                      </h4>
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {originalArticle.tier?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <h3 className={`text-2xl font-serif font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'} group-hover:text-yellow-600 transition-colors`}>
                    {originalArticle.title}
                  </h3>
                  <p className={`mb-4 leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {originalArticle.content.substring(0, 200)}...
                  </p>
                  <div className="flex items-center gap-6">
                    <span className={`flex items-center gap-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      <Eye size={16} />
                      {originalArticle.views?.toLocaleString() || 0}
                    </span>
                    <span className={`flex items-center gap-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      <Clock size={16} />
                      {calculateReadingTime(originalArticle.content)} min
                    </span>
                  </div>
                </div>
              </section>
            )}

            {/* Counter Opinions */}
            {counterOpinions.length > 0 && (
              <section id="discussion" className="mb-16">
                <div className="flex items-center justify-between mb-8">
                  <h2 className={`text-4xl font-serif font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Counter Opinions <span className={`text-2xl ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>({counterOpinions.length})</span>
                  </h2>
                  <button
                    onClick={() => setShowCounters(!showCounters)}
                    className={`p-3 rounded-xl ${darkMode ? 'hover:bg-gray-900' : 'hover:bg-gray-100'} transition-colors`}
                  >
                    {showCounters ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                  </button>
                </div>

                {showCounters && (
                  <div className="grid gap-6">
                    {counterOpinions.map(opinion => (
                      <div
                        key={opinion.id}
                        onClick={() => navigate(`/article/${opinion.id}/${generateSlug(opinion.title)}`)}
                        className={`p-8 rounded-2xl ${darkMode ? 'bg-gray-900 border-gray-800 hover:border-gray-700' : 'bg-gray-50 border-gray-200 hover:border-yellow-500'} border cursor-pointer transition-all duration-300 hover:shadow-2xl group`}
                      >
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br ${getTierColor(opinion.tier)} shadow-lg`}>
                              <span className="text-2xl">{getTierEmoji(opinion.tier)}</span>
                            </div>
                            <div>
                              <h4 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {opinion.display_name}
                              </h4>
                            </div>
                          </div>
                          <ExternalLink size={20} className={`${darkMode ? 'text-gray-600' : 'text-gray-400'} group-hover:text-yellow-500 transition-colors`} />
                        </div>
                        <h3 className={`text-2xl font-serif font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'} group-hover:text-yellow-600 transition-colors`}>
                          {opinion.title}
                        </h3>
                        <p className={`mb-4 leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {opinion.content.substring(0, 200)}...
                        </p>
                        <div className="flex items-center gap-6">
                          <span className={`flex items-center gap-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            <Eye size={16} />
                            {opinion.views?.toLocaleString() || 0}
                          </span>
                          <span className={`flex items-center gap-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            <Clock size={16} />
                            {calculateReadingTime(opinion.content)} min
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <section id="related" className="mb-16">
                <h2 className={`text-4xl font-serif font-bold mb-8 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Related Reading
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedArticles.map(related => (
                    <div
                      key={related.id}
                      onClick={() => navigate(`/article/${related.id}/${generateSlug(related.title)}`)}
                      className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-900 border-gray-800 hover:border-gray-700' : 'bg-gray-50 border-gray-200 hover:border-yellow-500'} border cursor-pointer transition-all duration-300 hover:shadow-xl group`}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br ${getTierColor(related.tier)}`}>
                          <span className="text-xl">{getTierEmoji(related.tier)}</span>
                        </div>
                        <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {related.display_name}
                        </span>
                      </div>
                      <h3 className={`text-xl font-serif font-bold mb-3 leading-tight ${darkMode ? 'text-white' : 'text-gray-900'} group-hover:text-yellow-600 transition-colors`}>
                        {related.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm">
                        <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          <Clock size={14} />
                          {calculateReadingTime(related.content)} min
                        </span>
                        <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          <Eye size={14} />
                          {related.views?.toLocaleString() || 0}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Footer */}
            <footer className={`pt-12 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
              <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                <button
                  onClick={handleReportArticle}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full ${darkMode ? 'text-gray-400 hover:bg-gray-900' : 'text-gray-600 hover:bg-gray-100'} transition-colors`}
                >
                  <Flag size={18} />
                  <span className="font-medium">Report Article</span>
                </button>
                <div className={`text-sm ${darkMode ? 'text-gray-600' : 'text-gray-500'}`}>
                  © 2025 UROWN. All opinions expressed are those of the author.
                </div>
              </div>
            </footer>
          </>
        )}
      </article>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-3xl shadow-2xl max-w-md w-full p-8 relative`}>
            <button
              onClick={() => setShowReportModal(false)}
              className={`absolute top-6 right-6 ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
            >
              <X size={24} />
            </button>
            <h3 className={`text-3xl font-serif font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Report Article
            </h3>
            {reportSuccess ? (
              <div className={`${darkMode ? 'bg-green-900/50 border-green-700' : 'bg-green-50 border-green-500'} border-l-4 p-6 mb-4 rounded-xl`}>
                <p className={`${darkMode ? 'text-green-400' : 'text-green-700'} font-medium text-lg`}>Thank you for your report. Our team will review it shortly.</p>
              </div>
            ) : (
              <>
                <p className={`mb-6 text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Help us maintain quality by reporting problematic content.
                </p>
                <textarea
                  className={`w-full px-4 py-3 rounded-xl ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} border focus:outline-none focus:ring-2 focus:ring-yellow-500 mb-4`}
                  rows={5}
                  placeholder="Please describe why you're reporting this article..."
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                />
                {error && (
                  <div className={`${darkMode ? 'bg-red-900/50 border-red-700' : 'bg-red-50 border-red-500'} border-l-4 p-4 mb-4 rounded-xl`}>
                    <p className={`${darkMode ? 'text-red-400' : 'text-red-700'} font-medium`}>{error}</p>
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowReportModal(false)}
                    className={`flex-1 px-6 py-3 rounded-xl font-medium ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitReport}
                    disabled={reporting}
                    className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                  >
                    {reporting ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticlePage;