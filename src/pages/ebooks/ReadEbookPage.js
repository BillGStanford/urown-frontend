import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../../context/UserContext';
import DOMPurify from 'dompurify';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Settings, 
  BookOpen, 
  Focus,
  Sun,
  Moon,
  Type,
  Maximize2,
  Minimize2,
  Bookmark,
  Home,
  Search,
  Menu,
  RotateCcw
} from 'lucide-react';

const ReadEbookPage = () => {
  const { slug, chapterId } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();
  const contentRef = useRef(null);
  const bookRef = useRef(null);

  // Book data
  const [ebook, setEbook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [loading, setLoading] = useState(true);

  // Reader settings
  const [settings, setSettings] = useState({
    fontSize: 18,
    fontFamily: 'Georgia',
    theme: 'Sepia',
    pageMode: 'single', // single or double
    lineHeight: 1.6,
    brightness: 100,
    margin: 'medium',
    autoSaveProgress: true
  });

  // Reader state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [pageContent, setPageContent] = useState('');
  const [isPageTurning, setIsPageTurning] = useState(false);
  const [pageTurnDirection, setPageTurnDirection] = useState('next');

  // Theme definitions
  const themes = {
    Light: { 
      bg: '#f8f9fa', 
      text: '#212529', 
      accent: '#0d6efd', 
      secondary: '#e9ecef',
      paper: '#ffffff',
      shadow: 'rgba(0, 0, 0, 0.1)'
    },
    Dark: { 
      bg: '#212529', 
      text: '#f8f9fa', 
      accent: '#0d6efd', 
      secondary: '#343a40',
      paper: '#2c3034',
      shadow: 'rgba(0, 0, 0, 0.3)'
    },
    Sepia: { 
      bg: '#f4ecd8', 
      text: '#5c4a1f', 
      accent: '#92400e', 
      secondary: '#e7d4a0',
      paper: '#f5e6d3',
      shadow: 'rgba(92, 64, 14, 0.2)'
    },
    Paper: { 
      bg: '#fef6e4', 
      text: '#2d2424', 
      accent: '#b45309', 
      secondary: '#f0e6d2',
      paper: '#ffffff',
      shadow: 'rgba(0, 0, 0, 0.15)'
    }
  };

  const fonts = ['Georgia', 'Times New Roman', 'Palatino', 'Bookman', 'Garamond', 'Arial', 'Helvetica', 'Verdana'];

  // Fetch ebook data
  useEffect(() => {
    fetchEbookData();
  }, [slug]);

  // Set current chapter when chapters are loaded or chapterId changes
  useEffect(() => {
    if (chapterId && chapters.length > 0) {
      const chapter = chapters.find(ch => ch.id === parseInt(chapterId));
      if (chapter) {
        setCurrentChapter(chapter);
      }
    } else if (chapters.length > 0) {
      setCurrentChapter(chapters[0]);
    }
  }, [chapterId, chapters]);

  // Process content when chapter changes
  useEffect(() => {
    if (currentChapter) {
      // Sanitize HTML content
      const sanitizedContent = DOMPurify.sanitize(currentChapter.content);
      
      // Calculate pages and set content
      calculatePages(sanitizedContent);
      
      // Reset to page 1 when changing chapters
      setCurrentPage(1);
    }
  }, [currentChapter, settings.fontSize, settings.lineHeight, settings.fontFamily, settings.pageMode]);

  // Save reading progress
  useEffect(() => {
    if (currentChapter && user && settings.autoSaveProgress) {
      saveProgress();
    }
  }, [currentPage, currentChapter]);

  const fetchEbookData = async () => {
    setLoading(true);
    try {
      const ebookRes = await axios.get(`/ebooks/slug/${slug}`);
      const chaptersRes = await axios.get(`/ebooks/${ebookRes.data.ebook.id}/chapters`);
      
      setEbook(ebookRes.data.ebook);
      setChapters(chaptersRes.data.chapters);
    } catch (error) {
      console.error('Error fetching ebook:', error);
      navigate('/ebooks');
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = async () => {
    if (!user || !ebook || !currentChapter) return;
    
    try {
      const chapterIndex = chapters.findIndex(ch => ch.id === currentChapter.id);
      const progress = ((chapterIndex + (currentPage / totalPages)) / chapters.length) * 100;
      
      await axios.post(`/ebooks/${ebook.id}/progress`, {
        chapter_id: currentChapter.id,
        page_number: currentPage,
        progress_percentage: progress
      });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  // Calculate pages based on content and settings
  const calculatePages = (content) => {
    // Create a temporary div to measure content
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.visibility = 'hidden';
    tempDiv.style.width = settings.pageMode === 'double' ? '45%' : '90%';
    tempDiv.style.fontSize = `${settings.fontSize}px`;
    tempDiv.style.lineHeight = settings.lineHeight;
    tempDiv.style.fontFamily = settings.fontFamily;
    tempDiv.style.padding = '20px';
    tempDiv.style.maxHeight = '80vh';
    tempDiv.style.overflow = 'hidden';
    document.body.appendChild(tempDiv);
    
    // Add chapter title
    const chapterTitle = `<h1 class="text-2xl font-bold mb-4">Chapter ${currentChapter.chapter_number}: ${currentChapter.chapter_title}</h1>`;
    tempDiv.innerHTML = chapterTitle + content;
    
    // Check if content fits in one page
    if (tempDiv.scrollHeight <= tempDiv.clientHeight) {
      setTotalPages(1);
      setPageContent(chapterTitle + content);
    } else {
      // Content doesn't fit, need to split into pages
      // For simplicity, we'll just estimate pages based on height ratio
      const estimatedPages = Math.ceil(tempDiv.scrollHeight / tempDiv.clientHeight);
      setTotalPages(estimatedPages);
      
      // For now, we'll just store the full content and handle page display in the render
      setPageContent(chapterTitle + content);
    }
    
    // Clean up
    document.body.removeChild(tempDiv);
  };

  // Navigate to previous/next page
  const changePage = useCallback((direction) => {
    if (isPageTurning) return;
    
    setIsPageTurning(true);
    setPageTurnDirection(direction);
    
    setTimeout(() => {
      if (direction === 'next') {
        if (currentPage < totalPages) {
          setCurrentPage(p => p + 1);
        } else {
          // Go to next chapter
          const currentIndex = chapters.findIndex(ch => ch.id === currentChapter.id);
          if (currentIndex < chapters.length - 1) {
            const nextChapter = chapters[currentIndex + 1];
            setCurrentChapter(nextChapter);
            navigate(`/ebooks/${slug}/chapter/${nextChapter.id}`);
          }
        }
      } else {
        if (currentPage > 1) {
          setCurrentPage(p => p - 1);
        } else {
          // Go to previous chapter
          const currentIndex = chapters.findIndex(ch => ch.id === currentChapter.id);
          if (currentIndex > 0) {
            const prevChapter = chapters[currentIndex - 1];
            setCurrentChapter(prevChapter);
            navigate(`/ebooks/${slug}/chapter/${prevChapter.id}`);
          }
        }
      }
      
      setIsPageTurning(false);
    }, 300); // Duration of the page turn animation
  }, [currentPage, totalPages, currentChapter, chapters, isPageTurning, navigate, slug]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        changePage('next');
      } else if (e.key === 'ArrowLeft') {
        changePage('prev');
      } else if (e.key === 'Escape') {
        if (showSidebar) setShowSidebar(false);
        if (showSettings) setShowSettings(false);
        if (showSearch) setShowSearch(false);
        if (focusMode) setFocusMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [changePage, showSidebar, showSettings, showSearch, focusMode]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const toggleBookmark = () => {
    const bookmark = {
      chapterId: currentChapter.id,
      pageNumber: currentPage,
      timestamp: new Date().toISOString()
    };
    
    const existingIndex = bookmarks.findIndex(
      b => b.chapterId === currentChapter.id && b.pageNumber === currentPage
    );
    
    if (existingIndex >= 0) {
      setBookmarks(prev => prev.filter((_, i) => i !== existingIndex));
    } else {
      setBookmarks(prev => [...prev, bookmark]);
    }
  };

  const searchInEbook = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    // This is a simplified search - in a real app, you'd use a more sophisticated approach
    const results = [];
    chapters.forEach(chapter => {
      const content = DOMPurify.sanitize(chapter.content);
      if (content.toLowerCase().includes(searchQuery.toLowerCase())) {
        results.push({
          chapterId: chapter.id,
          chapterTitle: chapter.chapterTitle,
          chapterNumber: chapter.chapter_number
        });
      }
    });
    
    setSearchResults(results);
  };

  const getMarginClass = () => {
    switch (settings.margin) {
      case 'narrow': return 'px-8';
      case 'medium': return 'px-16';
      case 'wide': return 'px-24';
      default: return 'px-16';
    }
  };

  const currentTheme = themes[settings.theme];
  const chapterIndex = chapters.findIndex(ch => ch.id === currentChapter?.id);
  const progress = chapters.length > 0 ? ((chapterIndex + (currentPage / totalPages)) / chapters.length * 100) : 0;
  const isBookmarked = bookmarks.some(b => b.chapterId === currentChapter?.id && b.pageNumber === currentPage);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center" style={{ backgroundColor: currentTheme.bg }}>
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2" style={{ borderColor: currentTheme.accent }}></div>
          <div className="mt-4 text-lg font-medium" style={{ color: currentTheme.text }}>Loading your book...</div>
        </div>
      </div>
    );
  }

  if (!ebook || !currentChapter) {
    return null;
  }

  return (
    <div 
      className="h-screen w-screen overflow-hidden relative"
      style={{ 
        backgroundColor: currentTheme.bg,
        color: currentTheme.text,
        fontFamily: settings.fontFamily
      }}
    >
      {/* Top Bar - Hidden in focus mode */}
      {!focusMode && (
        <div className="fixed top-0 left-0 right-0 z-50 shadow-md" style={{ backgroundColor: currentTheme.bg, borderBottom: `1px solid ${currentTheme.secondary}` }}>
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={`/ebooks/${slug}`} className="flex items-center gap-2 hover:opacity-70" style={{ color: currentTheme.text }}>
                <ChevronLeft size={20} />
                <span className="font-medium">Back</span>
              </Link>
              <div className="hidden md:block">
                <h2 className="font-bold text-lg">{ebook.title}</h2>
                <p className="text-sm opacity-70">Chapter {currentChapter.chapter_number}: {currentChapter.chapter_title}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 rounded-md hover:bg-opacity-10 transition-colors"
                style={{ color: currentTheme.text }}
                title="Search"
              >
                <Search size={20} />
              </button>
              <button
                onClick={toggleBookmark}
                className="p-2 rounded-md hover:bg-opacity-10 transition-colors"
                style={{ color: isBookmarked ? currentTheme.accent : currentTheme.text }}
                title={isBookmarked ? "Remove Bookmark" : "Add Bookmark"}
              >
                <Bookmark size={20} fill={isBookmarked ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2 rounded-md hover:bg-opacity-10 transition-colors"
                style={{ color: currentTheme.text }}
                title="Chapters"
              >
                <BookOpen size={20} />
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-md hover:bg-opacity-10 transition-colors"
                style={{ color: currentTheme.text }}
                title="Settings"
              >
                <Settings size={20} />
              </button>
              <button
                onClick={() => setFocusMode(true)}
                className="p-2 rounded-md hover:bg-opacity-10 transition-colors"
                style={{ color: currentTheme.text }}
                title="Focus Mode"
              >
                <Focus size={20} />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-1" style={{ backgroundColor: currentTheme.secondary }}>
            <div 
              className="h-full transition-all"
              style={{ backgroundColor: currentTheme.accent, width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Chapter Sidebar - Hidden in focus mode */}
      {!focusMode && showSidebar && (
        <div 
          className="fixed top-16 right-0 bottom-0 w-80 shadow-xl overflow-y-auto z-40 p-6"
          style={{ backgroundColor: currentTheme.bg, borderLeft: `1px solid ${currentTheme.secondary}` }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Chapters</h3>
            <button
              onClick={() => setShowSidebar(false)}
              className="p-1 rounded-md hover:bg-opacity-10 transition-colors"
              style={{ color: currentTheme.text }}
            >
              <X size={20} />
            </button>
          </div>
          <div className="space-y-2">
            {chapters.map((chapter) => (
              <button
                key={chapter.id}
                onClick={() => {
                  setCurrentChapter(chapter);
                  setCurrentPage(1);
                  setShowSidebar(false);
                  navigate(`/ebooks/${slug}/chapter/${chapter.id}`);
                }}
                className={`w-full text-left p-3 rounded-md transition-all ${
                  chapter.id === currentChapter.id ? 'font-bold' : ''
                }`}
                style={{
                  backgroundColor: chapter.id === currentChapter.id ? currentTheme.accent + '20' : 'transparent'
                }}
              >
                <div className="font-semibold">Chapter {chapter.chapter_number}</div>
                <div className="text-sm opacity-70">{chapter.chapter_title}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Panel - Hidden in focus mode */}
      {!focusMode && showSearch && (
        <div 
          className="fixed top-16 right-0 bottom-0 w-80 shadow-xl overflow-y-auto z-40 p-6"
          style={{ backgroundColor: currentTheme.bg, borderLeft: `1px solid ${currentTheme.secondary}` }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Search</h3>
            <button
              onClick={() => setShowSearch(false)}
              className="p-1 rounded-md hover:bg-opacity-10 transition-colors"
              style={{ color: currentTheme.text }}
            >
              <X size={20} />
            </button>
          </div>
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchInEbook()}
                placeholder="Search in this book..."
                className="w-full p-3 rounded-md border"
                style={{ 
                  backgroundColor: currentTheme.secondary, 
                  color: currentTheme.text,
                  borderColor: currentTheme.secondary
                }}
              />
              <button
                onClick={searchInEbook}
                className="absolute right-2 top-2 p-2 rounded-md"
                style={{ backgroundColor: currentTheme.accent, color: '#fff' }}
              >
                <Search size={16} />
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {searchResults.length > 0 ? (
              searchResults.map((result, index) => (
                <button
                  key={index}
                  onClick={() => {
                    const chapter = chapters.find(ch => ch.id === result.chapterId);
                    if (chapter) {
                      setCurrentChapter(chapter);
                      setCurrentPage(1);
                      setShowSearch(false);
                      navigate(`/ebooks/${slug}/chapter/${chapter.id}`);
                    }
                  }}
                  className="w-full text-left p-3 rounded-md transition-all"
                  style={{ backgroundColor: currentTheme.secondary }}
                >
                  <div className="font-semibold">Chapter {result.chapterNumber}</div>
                  <div className="text-sm opacity-70">{result.chapterTitle}</div>
                </button>
              ))
            ) : (
              <div className="text-center py-8 opacity-70">
                {searchQuery ? 'No results found' : 'Enter a search term to find content'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings Panel - Fixed positioning to avoid overlap with header */}
      {!focusMode && showSettings && (
        <div 
          className="fixed top-16 left-0 bottom-0 w-80 shadow-xl overflow-y-auto z-40 p-6"
          style={{ backgroundColor: currentTheme.bg, borderRight: `1px solid ${currentTheme.secondary}` }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Reader Settings</h3>
            <button
              onClick={() => setShowSettings(false)}
              className="p-1 rounded-md hover:bg-opacity-10 transition-colors"
              style={{ color: currentTheme.text }}
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Font Size */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-semibold">Font Size</label>
                <span className="text-sm opacity-70">{settings.fontSize}px</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateSetting('fontSize', Math.max(12, settings.fontSize - 2))}
                  className="p-1 rounded-md hover:bg-opacity-10 transition-colors"
                  style={{ color: currentTheme.text }}
                >
                  <Minimize2 size={16} />
                </button>
                <input
                  type="range"
                  min="12"
                  max="32"
                  value={settings.fontSize}
                  onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
                  className="flex-1"
                />
                <button
                  onClick={() => updateSetting('fontSize', Math.min(32, settings.fontSize + 2))}
                  className="p-1 rounded-md hover:bg-opacity-10 transition-colors"
                  style={{ color: currentTheme.text }}
                >
                  <Maximize2 size={16} />
                </button>
              </div>
            </div>

            {/* Font Family */}
            <div>
              <label className="block font-semibold mb-2">Font</label>
              <select
                value={settings.fontFamily}
                onChange={(e) => updateSetting('fontFamily', e.target.value)}
                className="w-full p-2 rounded-md border"
                style={{ 
                  backgroundColor: currentTheme.secondary, 
                  color: currentTheme.text,
                  borderColor: currentTheme.secondary
                }}
              >
                {fonts.map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
            </div>

            {/* Theme */}
            <div>
              <label className="block font-semibold mb-2">Theme</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(themes).map(theme => (
                  <button
                    key={theme}
                    onClick={() => updateSetting('theme', theme)}
                    className={`p-2 rounded-md border text-sm flex items-center justify-center gap-2 ${
                      settings.theme === theme ? 'font-bold' : ''
                    }`}
                    style={{
                      backgroundColor: themes[theme].bg,
                      color: themes[theme].text,
                      borderColor: settings.theme === theme ? currentTheme.accent : 'transparent'
                    }}
                  >
                    {theme === 'Light' && <Sun size={16} />}
                    {theme === 'Dark' && <Moon size={16} />}
                    {theme}
                  </button>
                ))}
              </div>
            </div>

            {/* Page Mode */}
            <div>
              <label className="block font-semibold mb-2">Page Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateSetting('pageMode', 'single')}
                  className={`p-2 rounded-md text-sm ${
                    settings.pageMode === 'single' ? 'font-bold' : ''
                  }`}
                  style={{ 
                    backgroundColor: settings.pageMode === 'single' ? currentTheme.accent + '20' : currentTheme.secondary,
                    color: currentTheme.text
                  }}
                >
                  Single Page
                </button>
                <button
                  onClick={() => updateSetting('pageMode', 'double')}
                  className={`p-2 rounded-md text-sm ${
                    settings.pageMode === 'double' ? 'font-bold' : ''
                  }`}
                  style={{ 
                    backgroundColor: settings.pageMode === 'double' ? currentTheme.accent + '20' : currentTheme.secondary,
                    color: currentTheme.text
                  }}
                >
                  Double Page
                </button>
              </div>
            </div>

            {/* Line Height */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-semibold">Line Height</label>
                <span className="text-sm opacity-70">{settings.lineHeight}</span>
              </div>
              <input
                type="range"
                min="1"
                max="2.5"
                step="0.1"
                value={settings.lineHeight}
                onChange={(e) => updateSetting('lineHeight', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Brightness */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-semibold">Brightness</label>
                <span className="text-sm opacity-70">{settings.brightness}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="120"
                value={settings.brightness}
                onChange={(e) => updateSetting('brightness', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Margin */}
            <div>
              <label className="block font-semibold mb-2">Margins</label>
              <select
                value={settings.margin}
                onChange={(e) => updateSetting('margin', e.target.value)}
                className="w-full p-2 rounded-md border"
                style={{ 
                  backgroundColor: currentTheme.secondary, 
                  color: currentTheme.text,
                  borderColor: currentTheme.secondary
                }}
              >
                <option value="narrow">Narrow</option>
                <option value="medium">Medium</option>
                <option value="wide">Wide</option>
              </select>
            </div>

            {/* Auto Save Progress */}
            <div>
              <div className="flex items-center justify-between">
                <label className="font-semibold">Auto Save Progress</label>
                <button
                  onClick={() => updateSetting('autoSaveProgress', !settings.autoSaveProgress)}
                  className={`px-3 py-1 rounded-md text-sm ${
                    settings.autoSaveProgress ? 'font-bold' : ''
                  }`}
                  style={{ 
                    backgroundColor: settings.autoSaveProgress ? currentTheme.accent + '20' : currentTheme.secondary,
                    color: currentTheme.text
                  }}
                >
                  {settings.autoSaveProgress ? 'On' : 'Off'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area with Fixed Height and Paper Background */}
      <div className="h-screen w-screen flex flex-col pt-16">
        {/* Book Container with Professional UI */}
        <div className="flex-1 flex items-center justify-center py-8">
          <div className={`max-w-7xl mx-auto ${getMarginClass()} h-full relative`}>
            <div 
              ref={bookRef}
              className="relative h-full"
              style={{ 
                filter: `brightness(${settings.brightness}%)`,
                perspective: '1000px'
              }}
            >
              {/* Book Pages with Page Turn Animation */}
              <div className="relative h-full">
                {/* Previous Page (for animation) */}
                {isPageTurning && pageTurnDirection === 'next' && (
                  <div 
                    className="absolute inset-0 rounded-lg shadow-lg overflow-hidden"
                    style={{
                      backgroundColor: currentTheme.paper,
                      transform: 'rotateY(-90deg)',
                      transformOrigin: 'right center',
                      transition: 'transform 0.3s ease-in-out',
                      zIndex: 1
                    }}
                  >
                    <div 
                      className="h-full p-8 overflow-hidden"
                      style={{
                        color: currentTheme.text,
                        fontSize: `${settings.fontSize}px`,
                        lineHeight: settings.lineHeight,
                        fontFamily: settings.fontFamily
                      }}
                    >
                      <div dangerouslySetInnerHTML={{ __html: pageContent }} />
                    </div>
                  </div>
                )}
                
                {/* Current Page */}
                <div 
                  className={`h-full rounded-lg shadow-lg overflow-hidden ${
                    isPageTurning ? 'transition-all duration-300' : ''
                  }`}
                  style={{
                    backgroundColor: currentTheme.paper,
                    transform: isPageTurning 
                      ? pageTurnDirection === 'next' 
                        ? 'rotateY(-90deg)' 
                        : 'rotateY(90deg)'
                      : 'rotateY(0)',
                    transformOrigin: pageTurnDirection === 'next' ? 'left center' : 'right center',
                    zIndex: isPageTurning ? 0 : 2
                  }}
                >
                  <div 
                    className="h-full p-8 overflow-y-auto"
                    style={{
                      color: currentTheme.text,
                      fontSize: `${settings.fontSize}px`,
                      lineHeight: settings.lineHeight,
                      fontFamily: settings.fontFamily
                    }}
                  >
                    {settings.pageMode === 'single' ? (
                      <div>
                        <div dangerouslySetInnerHTML={{ __html: pageContent }} />
                        
                        {/* Chapter Marker at end of chapter */}
                        {currentPage === totalPages && (
                          <div className="mt-8 text-center font-bold text-xl opacity-70" style={{ color: currentTheme.accent }}>
                            END OF CHAPTER {currentChapter.chapter_number}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-8 h-full">
                        <div className="overflow-y-auto">
                          <div dangerouslySetInnerHTML={{ __html: pageContent }} />
                        </div>
                        <div className="overflow-y-auto">
                          {currentPage === totalPages ? (
                            <div className="flex items-center justify-center h-full">
                              <div className="text-center">
                                <div className="text-6xl font-bold opacity-20" style={{ color: currentTheme.accent }}>
                                  END
                                </div>
                                <div className="mt-2 text-lg opacity-70">Chapter {currentChapter.chapter_number}</div>
                              </div>
                            </div>
                          ) : (
                            <div dangerouslySetInnerHTML={{ __html: pageContent }} />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Next Page (for animation) */}
                {isPageTurning && pageTurnDirection === 'prev' && (
                  <div 
                    className="absolute inset-0 rounded-lg shadow-lg overflow-hidden"
                    style={{
                      backgroundColor: currentTheme.paper,
                      transform: 'rotateY(90deg)',
                      transformOrigin: 'left center',
                      transition: 'transform 0.3s ease-in-out',
                      zIndex: 1
                    }}
                  >
                    <div 
                      className="h-full p-8 overflow-hidden"
                      style={{
                        color: currentTheme.text,
                        fontSize: `${settings.fontSize}px`,
                        lineHeight: settings.lineHeight,
                        fontFamily: settings.fontFamily
                      }}
                    >
                      <div dangerouslySetInnerHTML={{ __html: pageContent }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Navigation Bar - Always Visible */}
      <div className="fixed bottom-0 left-0 right-0 z-50 shadow-md" style={{ backgroundColor: currentTheme.bg, borderTop: `1px solid ${currentTheme.secondary}` }}>
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => changePage('prev')}
            disabled={currentPage === 1 && chapterIndex === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-md font-medium disabled:opacity-30 transition-colors"
            style={{ 
              backgroundColor: currentPage === 1 && chapterIndex === 0 ? currentTheme.secondary : currentTheme.accent, 
              color: currentPage === 1 && chapterIndex === 0 ? currentTheme.text : '#fff' 
            }}
          >
            <ChevronLeft size={20} />
            Previous
          </button>
          
          <div className="text-center">
            <div className="text-sm opacity-70">
              Page {currentPage} of {totalPages}
            </div>
            <div className="font-bold">
              {progress.toFixed(0)}% Complete
            </div>
          </div>
          
          <button
            onClick={() => changePage('next')}
            disabled={currentPage === totalPages && chapterIndex === chapters.length - 1}
            className="flex items-center gap-2 px-4 py-2 rounded-md font-medium disabled:opacity-30 transition-colors"
            style={{ 
              backgroundColor: currentPage === totalPages && chapterIndex === chapters.length - 1 ? currentTheme.secondary : currentTheme.accent, 
              color: currentPage === totalPages && chapterIndex === chapters.length - 1 ? currentTheme.text : '#fff' 
            }}
          >
            Next
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Focus Mode Exit Button - Only visible in focus mode */}
      {focusMode && (
        <button
          onClick={() => setFocusMode(false)}
          className="fixed top-4 right-4 z-50 p-3 rounded-full shadow-lg"
          style={{ backgroundColor: currentTheme.accent, color: '#fff' }}
          title="Exit Focus Mode"
        >
          <X size={24} />
        </button>
      )}
    </div>
  );
};

export default ReadEbookPage;