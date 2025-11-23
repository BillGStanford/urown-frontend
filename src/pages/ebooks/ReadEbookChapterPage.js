// src/pages/ebooks/ReadEbookChapterPage.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../../context/UserContext';

// FontSettingsPanel component (moved from components)
const FontSettingsPanel = ({ onSettingsChange, initialSettings = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    fontSize: initialSettings.fontSize || 18,
    lineHeight: initialSettings.lineHeight || 1.8,
    fontFamily: initialSettings.fontFamily || 'Georgia',
    theme: initialSettings.theme || 'light',
    width: initialSettings.width || 'normal',
    ...initialSettings
  });

  useEffect(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem('ebookReaderSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Failed to load reader settings');
      }
    }
  }, []);

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // Save to localStorage
    localStorage.setItem('ebookReaderSettings', JSON.stringify(newSettings));
    
    // Notify parent
    if (onSettingsChange) {
      onSettingsChange(newSettings);
    }
  };

  const fonts = [
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Times New Roman', value: '"Times New Roman", serif' },
    { name: 'Palatino', value: 'Palatino, serif' },
    { name: 'Garamond', value: 'Garamond, serif' },
    { name: 'Arial', value: 'Arial, sans-serif' },
    { name: 'Helvetica', value: 'Helvetica, sans-serif' },
    { name: 'Verdana', value: 'Verdana, sans-serif' }
  ];

  const themes = [
    { name: 'Light', value: 'light', bg: '#ffffff', text: '#000000' },
    { name: 'Sepia', value: 'sepia', bg: '#f4ecd8', text: '#5c4a34' },
    { name: 'Dark', value: 'dark', bg: '#1a1a1a', text: '#e0e0e0' }
  ];

  const widths = [
    { name: 'Narrow', value: 'narrow', max: '600px' },
    { name: 'Normal', value: 'normal', max: '800px' },
    { name: 'Wide', value: 'wide', max: '1000px' }
  ];

  return (
    <div className="relative">
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 text-sm"
        title="Reader Settings"
      >
        <span>⚙️</span>
        <span className="hidden sm:inline">Settings</span>
      </button>

      {/* Settings Panel */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-12 z-50 bg-white border border-gray-300 rounded-lg shadow-xl p-6 w-80">
            <h3 className="font-bold text-lg mb-4">Reading Settings</h3>

            {/* Font Size */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">
                Font Size: {settings.fontSize}px
              </label>
              <input
                type="range"
                min="14"
                max="28"
                step="2"
                value={settings.fontSize}
                onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>A</span>
                <span className="text-lg">A</span>
              </div>
            </div>

            {/* Line Height */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">
                Line Height: {settings.lineHeight}
              </label>
              <input
                type="range"
                min="1.4"
                max="2.4"
                step="0.2"
                value={settings.lineHeight}
                onChange={(e) => updateSetting('lineHeight', parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Compact</span>
                <span>Spacious</span>
              </div>
            </div>

            {/* Font Family */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">
                Font
              </label>
              <div className="grid grid-cols-2 gap-2">
                {fonts.map(font => (
                  <button
                    key={font.name}
                    onClick={() => updateSetting('fontFamily', font.value)}
                    className={`px-3 py-2 rounded text-sm border ${
                      settings.fontFamily === font.value
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                    style={{ fontFamily: font.value }}
                  >
                    {font.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">
                Theme
              </label>
              <div className="flex gap-2">
                {themes.map(theme => (
                  <button
                    key={theme.value}
                    onClick={() => updateSetting('theme', theme.value)}
                    className={`flex-1 px-3 py-2 rounded text-sm border ${
                      settings.theme === theme.value
                        ? 'border-blue-600 ring-2 ring-blue-200'
                        : 'border-gray-300'
                    }`}
                    style={{
                      backgroundColor: theme.bg,
                      color: theme.text
                    }}
                  >
                    {theme.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Width */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">
                Content Width
              </label>
              <div className="flex gap-2">
                {widths.map(width => (
                  <button
                    key={width.value}
                    onClick={() => updateSetting('width', width.value)}
                    className={`flex-1 px-3 py-2 rounded text-sm border ${
                      settings.width === width.value
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {width.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset Button */}
            <button
              onClick={() => {
                const defaultSettings = {
                  fontSize: 18,
                  lineHeight: 1.8,
                  fontFamily: 'Georgia, serif',
                  theme: 'light',
                  width: 'normal'
                };
                setSettings(defaultSettings);
                localStorage.setItem('ebookReaderSettings', JSON.stringify(defaultSettings));
                if (onSettingsChange) {
                  onSettingsChange(defaultSettings);
                }
              }}
              className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
            >
              Reset to Defaults
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// TableOfContents component (moved from components)
const TableOfContents = ({ chapters, currentChapterId, onChapterSelect, position = 'fixed' }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeChapter, setActiveChapter] = useState(currentChapterId);

  useEffect(() => {
    setActiveChapter(currentChapterId);
  }, [currentChapterId]);

  const handleChapterClick = (chapterId) => {
    setActiveChapter(chapterId);
    onChapterSelect(chapterId);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700"
      >
        {isOpen ? '×' : '☰'}
      </button>

      {/* TOC Panel */}
      <div
        className={`
          ${position === 'fixed' ? 'fixed' : 'sticky'} 
          top-0 left-0 h-screen bg-white border-r border-gray-300 
          transition-transform duration-300 z-40
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 w-80 flex flex-col
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">Table of Contents</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {chapters.length} {chapters.length === 1 ? 'chapter' : 'chapters'}
          </p>
        </div>

        {/* Chapter List */}
        <div className="flex-1 overflow-y-auto">
          {chapters.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No chapters available</p>
            </div>
          ) : (
            <nav className="p-2">
              {chapters.map((chapter, index) => (
                <button
                  key={chapter.id}
                  onClick={() => handleChapterClick(chapter.id)}
                  className={`
                    w-full text-left px-4 py-3 rounded-lg mb-1
                    transition-colors duration-150
                    ${
                      activeChapter === chapter.id
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                        : 'hover:bg-gray-50 text-gray-700'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-sm font-mono text-gray-400 mt-0.5">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">
                        {chapter.title || 'Untitled Chapter'}
                      </p>
                      {chapter.word_count > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {chapter.word_count.toLocaleString()} words
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </nav>
          )}
        </div>

        {/* Footer Stats */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>Total Chapters:</span>
              <span className="font-semibold">{chapters.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Words:</span>
              <span className="font-semibold">
                {chapters.reduce((sum, ch) => sum + (ch.word_count || 0), 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Est. Reading Time:</span>
              <span className="font-semibold">
                {Math.ceil(chapters.reduce((sum, ch) => sum + (ch.word_count || 0), 0) / 200)} min
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
        />
      )}
    </>
  );
};

// EbookReader component (moved from components)
const EbookReader = ({ ebook, chapters, currentChapterIndex = 0, onChapterChange }) => {
  const [settings, setSettings] = useState({});
  const [progress, setProgress] = useState(0);
  const [showTOC, setShowTOC] = useState(false);
  const contentRef = useRef(null);

  const currentChapter = chapters[currentChapterIndex];

  useEffect(() => {
    // Load reader settings from localStorage
    const saved = localStorage.getItem('ebookReaderSettings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        setSettings({});
      }
    }
  }, []);

  useEffect(() => {
    // Track scroll progress
    const handleScroll = () => {
      if (!contentRef.current) return;
      
      const element = contentRef.current;
      const scrolled = element.scrollTop;
      const height = element.scrollHeight - element.clientHeight;
      const progressPercent = height > 0 ? (scrolled / height) * 100 : 0;
      setProgress(Math.round(progressPercent));
    };

    const element = contentRef.current;
    if (element) {
      element.addEventListener('scroll', handleScroll);
      return () => element.removeEventListener('scroll', handleScroll);
    }
  }, [currentChapterIndex]);

  const handlePreviousChapter = () => {
    if (currentChapterIndex > 0) {
      onChapterChange(currentChapterIndex - 1);
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
    }
  };

  const handleNextChapter = () => {
    if (currentChapterIndex < chapters.length - 1) {
      onChapterChange(currentChapterIndex + 1);
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
    }
  };

  const themeStyles = {
    light: { backgroundColor: '#ffffff', color: '#000000' },
    sepia: { backgroundColor: '#f4ecd8', color: '#5c4a34' },
    dark: { backgroundColor: '#1a1a1a', color: '#e0e0e0' }
  };

  const widthStyles = {
    narrow: '600px',
    normal: '800px',
    wide: '1000px'
  };

  const theme = themeStyles[settings.theme] || themeStyles.light;
  const maxWidth = widthStyles[settings.width] || widthStyles.normal;

  return (
    <div className="ebook-reader flex flex-col h-screen" style={theme}>
      {/* Header */}
      <div className="border-b border-gray-300 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowTOC(!showTOC)}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
            style={{ backgroundColor: settings.theme === 'dark' ? '#333' : undefined }}
          >
            ☰ Chapters
          </button>
          <div className="hidden md:block">
            <h2 className="font-bold text-lg">{ebook.title}</h2>
            <p className="text-sm opacity-70">
              Chapter {currentChapterIndex + 1} of {chapters.length}
            </p>
          </div>
        </div>

        <FontSettingsPanel
          initialSettings={settings}
          onSettingsChange={setSettings}
        />
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-gray-200">
        <div
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Table of Contents (Desktop) */}
        {showTOC && (
          <div className="w-80 border-r border-gray-300 overflow-y-auto" style={theme}>
            <TableOfContents
              chapters={chapters}
              currentChapterId={currentChapter?.id}
              onChapterSelect={(index) => {
                onChapterChange(chapters.findIndex(ch => ch.id === index));
                setShowTOC(false);
              }}
              position="relative"
            />
          </div>
        )}

        {/* Main Reading Area */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto px-6 py-8"
          style={theme}
        >
          <div
            className="mx-auto"
            style={{
              maxWidth,
              fontSize: `${settings.fontSize || 18}px`,
              lineHeight: settings.lineHeight || 1.8,
              fontFamily: settings.fontFamily || 'Georgia, serif'
            }}
          >
            {/* Chapter Title */}
            <h1 className="text-3xl font-bold mb-8">
              {currentChapter?.title || 'Untitled Chapter'}
            </h1>

            {/* Chapter Content */}
            <div
              className="chapter-content prose max-w-none"
              dangerouslySetInnerHTML={{ __html: currentChapter?.content || '' }}
            />

            {/* Chapter Navigation */}
            <div className="mt-12 pt-8 border-t border-gray-300 flex justify-between items-center">
              <button
                onClick={handlePreviousChapter}
                disabled={currentChapterIndex === 0}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                ← Previous Chapter
              </button>

              <span className="text-sm opacity-70">
                {currentChapterIndex + 1} / {chapters.length}
              </span>

              <button
                onClick={handleNextChapter}
                disabled={currentChapterIndex === chapters.length - 1}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Next Chapter →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-300 p-3 text-center text-sm opacity-70">
        <p>{ebook.author_name} • {progress}% complete</p>
      </div>

      <style jsx>{`
        .chapter-content h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 1em 0 0.5em;
        }
        
        .chapter-content h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 1em 0 0.5em;
        }
        
        .chapter-content h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin: 1em 0 0.5em;
        }
        
        .chapter-content p {
          margin: 1em 0;
        }
        
        .chapter-content blockquote {
          border-left: 4px solid currentColor;
          padding-left: 1.5em;
          margin: 1.5em 0;
          opacity: 0.8;
          font-style: italic;
        }
        
        .chapter-content pre {
          background: rgba(0, 0, 0, 0.05);
          padding: 1em;
          border-radius: 0.375rem;
          overflow-x: auto;
          font-family: 'Courier New', monospace;
        }
        
        .chapter-content ul, .chapter-content ol {
          padding-left: 2em;
          margin: 1em 0;
        }
        
        .chapter-content li {
          margin: 0.5em 0;
        }
      `}</style>
    </div>
  );
};

// Main ReadEbookChapterPage component
const ReadEbookChapterPage = () => {
  const { id, chapterId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  
  const [ebook, setEbook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEbookAndChapters();
  }, [id]);

  useEffect(() => {
    // Update reading progress when chapter changes
    if (user && ebook && chapters.length > 0) {
      saveReadingProgress();
    }
  }, [currentChapterIndex, user, ebook, chapters]);

  const fetchEbookAndChapters = async () => {
    try {
      const [ebookRes, chaptersRes] = await Promise.all([
        axios.get(`/ebooks/${id}`),
        axios.get(`/ebooks/${id}/chapters`)
      ]);
      
      const ebookData = ebookRes.data.ebook;
      const chaptersData = chaptersRes.data.chapters;
      
      setEbook(ebookData);
      setChapters(chaptersData);

      // Determine starting chapter
      if (chapterId) {
        const chapterIndex = chaptersData.findIndex(ch => ch.id === parseInt(chapterId));
        setCurrentChapterIndex(chapterIndex >= 0 ? chapterIndex : 0);
      } else if (user) {
        // Try to load last read position
        try {
          const progressRes = await axios.get(`/ebooks/${id}/reading-progress`);
          if (progressRes.data.progress?.current_chapter_id) {
            const lastChapterIndex = chaptersData.findIndex(
              ch => ch.id === progressRes.data.progress.current_chapter_id
            );
            if (lastChapterIndex >= 0) {
              setCurrentChapterIndex(lastChapterIndex);
            }
          }
        } catch (error) {
          // No saved progress, start from beginning
        }
      }
    } catch (error) {
      console.error('Error fetching ebook:', error);
      alert('Failed to load book');
      navigate('/ebooks');
    } finally {
      setLoading(false);
    }
  };

  const saveReadingProgress = async () => {
    if (!user || chapters.length === 0) return;

    try {
      const currentChapter = chapters[currentChapterIndex];
      const progressPercent = Math.round(
        ((currentChapterIndex + 1) / chapters.length) * 100
      );

      await axios.post(`/ebooks/${id}/reading-progress`, {
        current_chapter_id: currentChapter.id,
        progress_percent: progressPercent
      });
    } catch (error) {
      console.error('Error saving reading progress:', error);
    }
  };

  const handleChapterChange = (newIndex) => {
    if (newIndex >= 0 && newIndex < chapters.length) {
      setCurrentChapterIndex(newIndex);
      
      // Update URL without page reload
      const newChapterId = chapters[newIndex].id;
      window.history.pushState(
        null,
        '',
        `/ebooks/${id}/read/${newChapterId}`
      );
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!ebook || chapters.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Content Available</h2>
          <button
            onClick={() => navigate(`/ebooks/${id}`)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Book
          </button>
        </div>
      </div>
    );
  }

  return (
    <EbookReader
      ebook={ebook}
      chapters={chapters}
      currentChapterIndex={currentChapterIndex}
      onChapterChange={handleChapterChange}
    />
  );
};

export default ReadEbookChapterPage;