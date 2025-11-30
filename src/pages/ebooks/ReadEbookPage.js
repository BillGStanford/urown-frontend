import React, { useState, useEffect, useRef } from 'react';
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
  Minimize2
} from 'lucide-react';

const ReadEbookPage = () => {
  const { slug, chapterId } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();
  const contentRef = useRef(null);
  const leftPageRef = useRef(null);
  const rightPageRef = useRef(null);

  // Book data
  const [ebook, setEbook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [loading, setLoading] = useState(true);

  // Reader settings
  const [settings, setSettings] = useState({
    fontSize: 18,
    fontFamily: 'Arial',
    theme: 'Light',
    pageMode: '2-page', // 1-page or 2-page
    lineHeight: 1.8,
    paragraphSpacing: 1.5,
    textAlign: 'justify',
    margin: 'medium',
    letterSpacing: 'normal',
    dyslexiaMode: false
  });

  // Reader state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [highlights, setHighlights] = useState([]);
  const [selectedText, setSelectedText] = useState(null);
  const [highlightToolbarPosition, setHighlightToolbarPosition] = useState({ x: 0, y: 0 });
  const [pages, setPages] = useState([[]]); // Array of page content arrays

  // Theme definitions
  const themes = {
    Light: { 
      bg: '#f8f5e6', 
      text: '#333333', 
      accent: '#3b82f6', 
      secondary: '#f3f4f6',
      paper: '#ffffff',
      shadow: 'rgba(0, 0, 0, 0.1)'
    },
    Dark: { 
      bg: '#1a1a1a', 
      text: '#e5e5e5', 
      accent: '#3b82f6', 
      secondary: '#374151',
      paper: '#2d2d2d',
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
    },
    AMOLED: { 
      bg: '#000000', 
      text: '#ffffff', 
      accent: '#3b82f6', 
      secondary: '#1f2937',
      paper: '#111111',
      shadow: 'rgba(0, 0, 0, 0.4)'
    },
    Solarized: { 
      bg: '#fdf6e3', 
      text: '#657b83', 
      accent: '#cb4b16', 
      secondary: '#eee8d5',
      paper: '#eee8d5',
      shadow: 'rgba(203, 75, 22, 0.2)'
    }
  };

  const fonts = ['Georgia', 'Times New Roman', 'Palatino', 'Bookman', 'Garamond', 'Arial', 'Helvetica', 'Verdana', 'Comic Sans MS'];

  useEffect(() => {
    fetchEbookData();
  }, [slug]);

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

  useEffect(() => {
    if (currentChapter && user) {
      saveProgress();
    }
  }, [currentChapter, currentPage]);

  // Process content and split into pages when chapter changes
  useEffect(() => {
    if (currentChapter) {
      // Sanitize HTML content
      const sanitizedContent = DOMPurify.sanitize(currentChapter.content);
      
      // Split content into pages
      const pageContent = splitContentIntoPages(sanitizedContent);
      setPages(pageContent);
      setTotalPages(pageContent.length);
      setCurrentPage(1);
    }
  }, [currentChapter, settings.pageMode, settings.fontSize, settings.lineHeight, settings.fontFamily]);

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
      const progress = ((chapterIndex + 1) / chapters.length) * 100;
      
      await axios.post(`/ebooks/${ebook.id}/progress`, {
        chapter_id: currentChapter.id,
        page_number: currentPage,
        progress_percentage: progress
      });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const changePage = (direction) => {
    if (direction === 'next') {
      if (currentPage < totalPages) {
        setCurrentPage(p => p + 1);
      } else {
        // Go to next chapter
        const currentIndex = chapters.findIndex(ch => ch.id === currentChapter.id);
        if (currentIndex < chapters.length - 1) {
          setCurrentChapter(chapters[currentIndex + 1]);
          setCurrentPage(1);
        }
      }
    } else {
      if (currentPage > 1) {
        setCurrentPage(p => p - 1);
      } else {
        // Go to previous chapter
        const currentIndex = chapters.findIndex(ch => ch.id === currentChapter.id);
        if (currentIndex > 0) {
          setCurrentChapter(chapters[currentIndex - 1]);
        }
      }
    }
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    
    if (text && text.length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      setSelectedText({
        text,
        range: range
      });
      
      // Position the highlight toolbar near the selection
      setHighlightToolbarPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 50
      });
    } else {
      setSelectedText(null);
    }
  };

  const addHighlight = (color) => {
    if (!selectedText) return;
    
    const highlight = {
      text: selectedText.text,
      color,
      timestamp: new Date().toISOString(),
      chapterId: currentChapter.id,
      range: {
        startOffset: selectedText.range.startOffset,
        endOffset: selectedText.range.endOffset,
        startContainerPath: getNodePath(selectedText.range.startContainer),
        endContainerPath: getNodePath(selectedText.range.endContainer)
      }
    };
    
    setHighlights(prev => [...prev, highlight]);
    setSelectedText(null);
    window.getSelection().removeAllRanges();
  };

  const removeHighlight = (index) => {
    setHighlights(prev => prev.filter((_, i) => i !== index));
  };

  // Helper function to get a path to a DOM node
  const getNodePath = (node) => {
    if (!node) return null;
    
    const path = [];
    let current = node;
    
    while (current && current !== contentRef.current) {
      const parent = current.parentNode;
      if (parent) {
        const index = Array.from(parent.childNodes).indexOf(current);
        path.unshift(index);
      }
      current = parent;
    }
    
    return path;
  };

  // Helper function to find a node from a path
  const getNodeFromPath = (path) => {
    if (!path || !contentRef.current) return null;
    
    let node = contentRef.current;
    for (const index of path) {
      if (node.childNodes[index]) {
        node = node.childNodes[index];
      } else {
        return null;
      }
    }
    
    return node;
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const toggleDyslexiaMode = () => {
    if (settings.dyslexiaMode) {
      // Turn off dyslexia mode
      updateSetting('dyslexiaMode', false);
      updateSetting('fontFamily', 'Arial');
      updateSetting('letterSpacing', 'normal');
    } else {
      // Turn on dyslexia mode
      updateSetting('dyslexiaMode', true);
      updateSetting('fontFamily', 'Comic Sans MS');
      updateSetting('letterSpacing', '0.1em');
    }
  };

  const getMarginClass = () => {
    switch (settings.margin) {
      case 'narrow': return 'px-8';
      case 'medium': return 'px-16';
      case 'wide': return 'px-24';
      default: return 'px-16';
    }
  };

  // Split content into pages based on available space
  const splitContentIntoPages = (content) => {
    // Create a temporary div to measure content
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.visibility = 'hidden';
    tempDiv.style.width = settings.pageMode === '2-page' ? '45%' : '90%';
    tempDiv.style.fontSize = `${settings.fontSize}px`;
    tempDiv.style.lineHeight = settings.lineHeight;
    tempDiv.style.fontFamily = settings.fontFamily;
    tempDiv.style.padding = '20px';
    document.body.appendChild(tempDiv);
    
    // Split content by paragraphs
    const paragraphs = content.split(/<\/p>/i);
    const pages = [];
    let currentPageContent = '';
    
    for (const paragraph of paragraphs) {
      // Add back the closing p tag if it was split
      const fullParagraph = paragraph + (paragraph.includes('<p') ? '' : '</p>');
      
      // Test if adding this paragraph would exceed page height
      tempDiv.innerHTML = currentPageContent + fullParagraph;
      
      if (tempDiv.offsetHeight > window.innerHeight * 0.6) {
        // If current page is not empty, save it and start a new one
        if (currentPageContent.trim()) {
          pages.push(currentPageContent);
          currentPageContent = fullParagraph;
        } else {
          // If the paragraph itself is too long for a page, split it
          const words = fullParagraph.split(' ');
          let partialParagraph = '';
          
          for (const word of words) {
            tempDiv.innerHTML = partialParagraph + word + ' ';
            
            if (tempDiv.offsetHeight > window.innerHeight * 0.6) {
              if (partialParagraph.trim()) {
                pages.push(partialParagraph);
                partialParagraph = word + ' ';
              } else {
                // If a single word is too long, just add it
                partialParagraph += word + ' ';
              }
            } else {
              partialParagraph += word + ' ';
            }
          }
          
          currentPageContent = partialParagraph;
        }
      } else {
        currentPageContent += fullParagraph;
      }
    }
    
    // Add the last page if it has content
    if (currentPageContent.trim()) {
      pages.push(currentPageContent);
    }
    
    // Clean up
    document.body.removeChild(tempDiv);
    
    // If in 2-page mode, pair up pages
    if (settings.pageMode === '2-page') {
      const pairedPages = [];
      for (let i = 0; i < pages.length; i += 2) {
        pairedPages.push([pages[i], pages[i + 1] || null]);
      }
      return pairedPages;
    }
    
    return pages.map(page => [page]);
  };

  const currentTheme = themes[settings.theme];
  const chapterIndex = chapters.findIndex(ch => ch.id === currentChapter?.id);
  const progress = chapters.length > 0 ? ((chapterIndex + 1) / chapters.length * 100) : 0;

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center" style={{ backgroundColor: currentTheme.bg }}>
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2" style={{ borderColor: currentTheme.accent }}></div>
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
        fontFamily: settings.fontFamily,
        letterSpacing: settings.letterSpacing
      }}
    >
      {/* Top Bar - Hidden in focus mode */}
      {!focusMode && (
        <div className="fixed top-0 left-0 right-0 z-50 shadow-md" style={{ backgroundColor: currentTheme.bg, borderBottom: `1px solid ${currentTheme.secondary}` }}>
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
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

            {/* Dyslexia-Friendly Mode */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-semibold">Dyslexia-Friendly Mode</label>
                <button
                  onClick={toggleDyslexiaMode}
                  className={`px-3 py-1 rounded-md text-sm ${
                    settings.dyslexiaMode ? 'font-bold' : ''
                  }`}
                  style={{ 
                    backgroundColor: settings.dyslexiaMode ? currentTheme.accent + '20' : currentTheme.secondary,
                    color: currentTheme.text
                  }}
                >
                  {settings.dyslexiaMode ? 'On' : 'Off'}
                </button>
              </div>
              <p className="text-xs opacity-70">
                Changes font to Comic Sans and adjusts letter spacing for better readability
              </p>
            </div>

            {/* Theme */}
            <div>
              <label className="block font-semibold mb-2">Theme</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.keys(themes).map(theme => (
                  <button
                    key={theme}
                    onClick={() => updateSetting('theme', theme)}
                    className={`p-2 rounded-md border text-sm ${
                      settings.theme === theme ? 'font-bold' : ''
                    }`}
                    style={{
                      backgroundColor: themes[theme].bg,
                      color: themes[theme].text,
                      borderColor: settings.theme === theme ? currentTheme.accent : 'transparent'
                    }}
                  >
                    {theme === 'Light' && <Sun size={16} className="inline mr-1" />}
                    {theme === 'Dark' && <Moon size={16} className="inline mr-1" />}
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
                  onClick={() => updateSetting('pageMode', '1-page')}
                  className={`p-2 rounded-md text-sm ${
                    settings.pageMode === '1-page' ? 'font-bold' : ''
                  }`}
                  style={{ 
                    backgroundColor: settings.pageMode === '1-page' ? currentTheme.accent + '20' : currentTheme.secondary,
                    color: currentTheme.text
                  }}
                >
                  Single Page
                </button>
                <button
                  onClick={() => updateSetting('pageMode', '2-page')}
                  className={`p-2 rounded-md text-sm ${
                    settings.pageMode === '2-page' ? 'font-bold' : ''
                  }`}
                  style={{ 
                    backgroundColor: settings.pageMode === '2-page' ? currentTheme.accent + '20' : currentTheme.secondary,
                    color: currentTheme.text
                  }}
                >
                  Two Pages
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
                max="3"
                step="0.1"
                value={settings.lineHeight}
                onChange={(e) => updateSetting('lineHeight', parseFloat(e.target.value))}
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
          </div>
        </div>
      )}

      {/* Highlight Toolbar */}
      {selectedText && (
        <div 
          className="fixed z-50 flex gap-2 p-2 rounded-lg shadow-lg"
          style={{ 
            backgroundColor: currentTheme.bg,
            border: `1px solid ${currentTheme.secondary}`,
            left: `${highlightToolbarPosition.x}px`,
            top: `${highlightToolbarPosition.y}px`,
            transform: 'translateX(-50%)'
          }}
        >
          {['yellow', 'green', 'blue', 'pink', 'orange'].map(color => (
            <button
              key={color}
              onClick={() => addHighlight(color)}
              className="w-8 h-8 rounded-full border-2 hover:scale-110 transition-transform"
              style={{ backgroundColor: color, borderColor: currentTheme.text }}
              title={`Highlight in ${color}`}
            />
          ))}
        </div>
      )}

      {/* Main Content Area with Fixed Height and Paper Background */}
      <div className="h-screen w-screen flex flex-col">
        {/* Book Container with Paper Background */}
        <div className="flex-1 flex items-center justify-center py-20">
          <div className={`max-w-7xl mx-auto ${getMarginClass()} h-full`}>
            {settings.pageMode === '2-page' ? (
              // Two-page view with paper background
              <div className="grid grid-cols-2 gap-8 h-full">
                {pages[currentPage - 1] && (
                  <>
                    {/* Left Page */}
                    <div
                      ref={leftPageRef}
                      onMouseUp={handleTextSelection}
                      className="prose prose-lg max-w-none p-6 rounded-lg shadow-md h-full overflow-hidden"
                      style={{
                        backgroundColor: currentTheme.paper,
                        color: currentTheme.text,
                        fontSize: `${settings.fontSize}px`,
                        lineHeight: settings.lineHeight,
                        textAlign: settings.textAlign,
                        fontFamily: settings.fontFamily,
                        letterSpacing: settings.letterSpacing,
                        boxShadow: `0 4px 8px ${currentTheme.shadow}`
                      }}
                    >
                      {currentPage === 1 && (
                        <>
                          <h1 className="text-3xl font-bold mb-4">
                            Chapter {currentChapter.chapter_number}
                          </h1>
                          <h2 className="text-2xl mb-6 opacity-80">
                            {currentChapter.chapter_title}
                          </h2>
                        </>
                      )}
                      <div 
                        dangerouslySetInnerHTML={{ __html: pages[currentPage - 1][0] }}
                        style={{ marginBottom: `${settings.paragraphSpacing}rem` }}
                      />
                    </div>
                    
                    {/* Right Page */}
                    <div
                      ref={rightPageRef}
                      onMouseUp={handleTextSelection}
                      className="prose prose-lg max-w-none p-6 rounded-lg shadow-md h-full overflow-hidden"
                      style={{
                        backgroundColor: currentTheme.paper,
                        color: currentTheme.text,
                        fontSize: `${settings.fontSize}px`,
                        lineHeight: settings.lineHeight,
                        textAlign: settings.textAlign,
                        fontFamily: settings.fontFamily,
                        letterSpacing: settings.letterSpacing,
                        boxShadow: `0 4px 8px ${currentTheme.shadow}`
                      }}
                    >
                      {pages[currentPage - 1][1] ? (
                        <div 
                          dangerouslySetInnerHTML={{ __html: pages[currentPage - 1][1] }}
                          style={{ marginBottom: `${settings.paragraphSpacing}rem` }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <div className="text-6xl font-bold opacity-20" style={{ color: currentTheme.accent }}>
                              {currentPage}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ) : (
              // Single page view with paper background
              <div
                ref={contentRef}
                onMouseUp={handleTextSelection}
                className="prose prose-lg max-w-none p-6 rounded-lg shadow-md h-full overflow-hidden"
                style={{
                  backgroundColor: currentTheme.paper,
                  color: currentTheme.text,
                  fontSize: `${settings.fontSize}px`,
                  lineHeight: settings.lineHeight,
                  textAlign: settings.textAlign,
                  fontFamily: settings.fontFamily,
                  letterSpacing: settings.letterSpacing,
                  boxShadow: `0 4px 8px ${currentTheme.shadow}`
                }}
              >
                <h1 className="text-3xl font-bold mb-4">
                  Chapter {currentChapter.chapter_number}
                </h1>
                <h2 className="text-2xl mb-6 opacity-80">
                  {currentChapter.chapter_title}
                </h2>
                <div 
                  dangerouslySetInnerHTML={{ __html: pages[currentPage - 1][0] }}
                  style={{ marginBottom: `${settings.paragraphSpacing}rem` }}
                />
                
                {/* Chapter Marker at end of chapter */}
                {currentPage === totalPages && (
                  <div className="mt-8 text-center font-bold text-xl opacity-70" style={{ color: currentTheme.accent }}>
                    END OF CHAPTER {currentChapter.chapter_number}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Navigation Bar - Always Visible */}
      <div className="fixed bottom-0 left-0 right-0 z-50 shadow-md" style={{ backgroundColor: currentTheme.bg, borderTop: `1px solid ${currentTheme.secondary}` }}>
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => changePage('prev')}
            disabled={currentPage === 1 && chapterIndex === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-md font-medium disabled:opacity-30 hover:bg-opacity-10 transition-colors"
            style={{ backgroundColor: currentTheme.accent, color: '#fff' }}
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
            className="flex items-center gap-2 px-4 py-2 rounded-md font-medium disabled:opacity-30 hover:bg-opacity-10 transition-colors"
            style={{ backgroundColor: currentTheme.accent, color: '#fff' }}
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