// src/pages/ebooks/ReadEbookChapterPage.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../../context/UserContext';

// FontSettingsPanel component
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
    localStorage.setItem('ebookReaderSettings', JSON.stringify(newSettings));
    if (onSettingsChange) {
      onSettingsChange(newSettings);
    }
  };

  const fonts = [
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Merriweather', value: '"Merriweather", serif' },
    { name: 'Palatino', value: 'Palatino, serif' },
    { name: 'Garamond', value: 'Garamond, serif' },
    { name: 'Inter', value: 'Inter, sans-serif' },
    { name: 'Open Sans', value: '"Open Sans", sans-serif' }
  ];

  const themes = [
    { name: 'Light', value: 'light', bg: '#fefefe', text: '#1a1a1a', icon: '☀️' },
    { name: 'Sepia', value: 'sepia', bg: '#f4ecd8', text: '#5c4633', icon: '📜' },
    { name: 'Dark', value: 'dark', bg: '#1a1a1a', text: '#e8e8e8', icon: '🌙' },
    { name: 'Night', value: 'night', bg: '#0d1117', text: '#c9d1d9', icon: '🌃' }
  ];

  const widths = [
    { name: 'Narrow', value: 'narrow', max: '600px' },
    { name: 'Normal', value: 'normal', max: '750px' },
    { name: 'Wide', value: 'wide', max: '900px' }
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg flex items-center gap-2 text-sm transition-all"
        title="Reader Settings"
      >
        <span>⚙️</span>
        <span className="hidden sm:inline">Settings</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-12 z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-6 w-80 max-h-[80vh] overflow-y-auto">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <span>📖</span> Reading Settings
            </h3>

            {/* Font Size */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                Font Size: <span className="text-blue-600">{settings.fontSize}px</span>
              </label>
              <input
                type="range"
                min="14"
                max="32"
                step="2"
                value={settings.fontSize}
                onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span className="text-sm">Aa</span>
                <span className="text-2xl">Aa</span>
              </div>
            </div>

            {/* Line Height */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                Line Spacing: <span className="text-blue-600">{settings.lineHeight}</span>
              </label>
              <input
                type="range"
                min="1.4"
                max="2.4"
                step="0.2"
                value={settings.lineHeight}
                onChange={(e) => updateSetting('lineHeight', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Compact</span>
                <span>Spacious</span>
              </div>
            </div>

            {/* Font Family */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                Font Family
              </label>
              <div className="grid grid-cols-2 gap-2">
                {fonts.map(font => (
                  <button
                    key={font.name}
                    onClick={() => updateSetting('fontFamily', font.value)}
                    className={`px-3 py-2.5 rounded-lg text-sm border transition-all ${
                      settings.fontFamily === font.value
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 shadow-sm'
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
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
              <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                Color Theme
              </label>
              <div className="grid grid-cols-2 gap-2">
                {themes.map(theme => (
                  <button
                    key={theme.value}
                    onClick={() => updateSetting('theme', theme.value)}
                    className={`px-3 py-3 rounded-lg text-sm border transition-all ${
                      settings.theme === theme.value
                        ? 'border-blue-600 ring-2 ring-blue-200 dark:ring-blue-800 shadow-sm'
                        : 'border-gray-300 dark:border-gray-600 hover:shadow-md'
                    }`}
                    style={{
                      backgroundColor: theme.bg,
                      color: theme.text
                    }}
                  >
                    <span className="mr-1">{theme.icon}</span>
                    {theme.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Width */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                Content Width
              </label>
              <div className="flex gap-2">
                {widths.map(width => (
                  <button
                    key={width.value}
                    onClick={() => updateSetting('width', width.value)}
                    className={`flex-1 px-3 py-2.5 rounded-lg text-sm border transition-all ${
                      settings.width === width.value
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 shadow-sm'
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
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
              className="w-full px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 transition-all"
            >
              Reset to Defaults
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// TableOfContents component
const TableOfContents = ({ chapters, currentChapterId, onChapterSelect, onClose }) => {
  const [activeChapter, setActiveChapter] = useState(currentChapterId);

  useEffect(() => {
    setActiveChapter(currentChapterId);
  }, [currentChapterId]);

  const handleChapterClick = (chapterId) => {
    setActiveChapter(chapterId);
    onChapterSelect(chapterId);
    if (onClose) onClose();
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <span>📚</span> Table of Contents
          </h3>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/50 dark:hover:bg-gray-700/50"
            >
              ✕
            </button>
          )}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {chapters.length} {chapters.length === 1 ? 'chapter' : 'chapters'}
        </p>
      </div>

      {/* Chapter List */}
      <div className="flex-1 overflow-y-auto">
        {chapters.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <p>No chapters available</p>
          </div>
        ) : (
          <nav className="p-3">
            {chapters.map((chapter, index) => (
              <button
                key={chapter.id}
                onClick={() => handleChapterClick(chapter.id)}
                className={`
                  w-full text-left px-4 py-3 rounded-xl mb-2
                  transition-all duration-200 group
                  ${
                    activeChapter === chapter.id
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg scale-[1.02]'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-md'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <span className={`text-xs font-mono mt-1 ${
                    activeChapter === chapter.id ? 'text-white/80' : 'text-gray-400'
                  }`}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold truncate ${
                      activeChapter === chapter.id ? 'text-white' : 'group-hover:text-blue-600 dark:group-hover:text-blue-400'
                    }`}>
                      {chapter.title || 'Untitled Chapter'}
                    </p>
                    {chapter.word_count > 0 && (
                      <p className={`text-xs mt-1 ${
                        activeChapter === chapter.id ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {chapter.word_count.toLocaleString()} words · {Math.ceil(chapter.word_count / 200)} min read
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
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2">
              <span>📖</span> Total Chapters
            </span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">{chapters.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2">
              <span>📝</span> Total Words
            </span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {chapters.reduce((sum, ch) => sum + (ch.word_count || 0), 0).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2">
              <span>⏱️</span> Reading Time
            </span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {Math.ceil(chapters.reduce((sum, ch) => sum + (ch.word_count || 0), 0) / 200)} min
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// EbookReader component
const EbookReader = ({ ebook, chapters, currentChapterIndex = 0, onChapterChange }) => {
  const [settings, setSettings] = useState({});
  const [progress, setProgress] = useState(0);
  const [showTOC, setShowTOC] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const contentRef = useRef(null);
  const hideControlsTimeout = useRef(null);

  const currentChapter = chapters[currentChapterIndex];

  useEffect(() => {
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      switch(e.key) {
        case 'ArrowLeft':
          handlePreviousChapter();
          break;
        case 'ArrowRight':
          handleNextChapter();
          break;
        case 'f':
        case 'F':
          setFocusMode(!focusMode);
          break;
        case 't':
        case 'T':
          setShowTOC(!showTOC);
          break;
        case 'Escape':
          if (focusMode) setFocusMode(false);
          if (showTOC) setShowTOC(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [focusMode, showTOC, currentChapterIndex]);

  // Auto-hide controls in focus mode
  useEffect(() => {
    if (!focusMode) return;

    const handleMouseMove = () => {
      setShowControls(true);
      
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
      
      hideControlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
    };
  }, [focusMode]);

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
    light: { backgroundColor: '#fefefe', color: '#1a1a1a' },
    sepia: { backgroundColor: '#f4ecd8', color: '#5c4633' },
    dark: { backgroundColor: '#1a1a1a', color: '#e8e8e8' },
    night: { backgroundColor: '#0d1117', color: '#c9d1d9' }
  };

  const widthStyles = {
    narrow: '600px',
    normal: '750px',
    wide: '900px'
  };

  const theme = themeStyles[settings.theme] || themeStyles.light;
  const maxWidth = widthStyles[settings.width] || widthStyles.normal;

  return (
    <div className="ebook-reader-container flex flex-col h-screen overflow-hidden" style={theme}>
      {/* Header */}
      <div 
        className={`border-b border-gray-200/50 dark:border-gray-700/50 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 transition-all duration-300 ${
          focusMode && !showControls ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'
        }`}
        style={{ 
          borderBottomColor: settings.theme === 'dark' || settings.theme === 'night' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
        }}
      >
        <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            <button
              onClick={() => setShowTOC(!showTOC)}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg text-sm transition-all flex items-center gap-2"
              title="Table of Contents (T)"
            >
              <span className="text-lg">☰</span>
              <span className="hidden sm:inline">Chapters</span>
            </button>
            
            <div className="hidden md:block flex-1 min-w-0">
              <h2 className="font-bold text-base sm:text-lg truncate">{ebook.title}</h2>
              <p className="text-xs sm:text-sm opacity-70 truncate">
                Chapter {currentChapterIndex + 1} of {chapters.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFocusMode(!focusMode)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                focusMode 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-white/10 hover:bg-white/20 backdrop-blur-sm'
              }`}
              title="Focus Mode (F)"
            >
              <span>{focusMode ? '👁️' : '🎯'}</span>
              <span className="hidden sm:inline">{focusMode ? 'Exit Focus' : 'Focus'}</span>
            </button>
            
            <FontSettingsPanel
              initialSettings={settings}
              onSettingsChange={setSettings}
            />
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div 
        className={`h-1 bg-gray-200/50 dark:bg-gray-700/50 transition-all duration-300 ${
          focusMode && !showControls ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden flex relative">
        {/* Table of Contents Sidebar */}
        <div
          className={`
            fixed lg:relative inset-y-0 left-0 z-50 w-80 
            transform transition-transform duration-300 ease-in-out
            ${showTOC ? 'translate-x-0' : '-translate-x-full lg:hidden'}
            border-r border-gray-200/50 dark:border-gray-700/50
          `}
          style={{
            backgroundColor: theme.backgroundColor,
            borderRightColor: settings.theme === 'dark' || settings.theme === 'night' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
          }}
        >
          <TableOfContents
            chapters={chapters}
            currentChapterId={currentChapter?.id}
            onChapterSelect={(chapterId) => {
              const index = chapters.findIndex(ch => ch.id === chapterId);
              if (index >= 0) onChapterChange(index);
            }}
            onClose={() => setShowTOC(false)}
          />
        </div>

        {/* Backdrop for mobile TOC */}
        {showTOC && (
          <div
            onClick={() => setShowTOC(false)}
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
        )}

        {/* Main Reading Area */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto scroll-smooth"
          style={theme}
        >
          <div className="min-h-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <article
              className="mx-auto book-page"
              style={{
                maxWidth,
                fontSize: `${settings.fontSize || 18}px`,
                lineHeight: settings.lineHeight || 1.8,
                fontFamily: settings.fontFamily || 'Georgia, serif'
              }}
            >
              {/* Chapter Title */}
              <header className="mb-8 sm:mb-12">
                <div className="text-xs sm:text-sm uppercase tracking-wider opacity-50 mb-2 sm:mb-4 font-semibold">
                  Chapter {currentChapterIndex + 1}
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 leading-tight">
                  {currentChapter?.title || 'Untitled Chapter'}
                </h1>
                {currentChapter?.word_count > 0 && (
                  <div className="text-xs sm:text-sm opacity-60">
                    {currentChapter.word_count.toLocaleString()} words · {Math.ceil(currentChapter.word_count / 200)} min read
                  </div>
                )}
              </header>

              {/* Chapter Content */}
              <div
                className="chapter-content prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: currentChapter?.content || '' }}
              />

              {/* Chapter Navigation */}
              <nav className="mt-12 sm:mt-16 pt-8 border-t border-gray-300/50 dark:border-gray-700/50">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <button
                    onClick={handlePreviousChapter}
                    disabled={currentChapterIndex === 0}
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-105 disabled:hover:scale-100 flex items-center justify-center gap-2"
                  >
                    <span>←</span>
                    <span>Previous Chapter</span>
                  </button>

                  <div className="text-sm opacity-70 font-mono">
                    {currentChapterIndex + 1} / {chapters.length}
                  </div>

                  <button
                    onClick={handleNextChapter}
                    disabled={currentChapterIndex === chapters.length - 1}
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-105 disabled:hover:scale-100 flex items-center justify-center gap-2"
                  >
                    <span>Next Chapter</span>
                    <span>→</span>
                  </button>
                </div>
              </nav>
            </article>
          </div>
        </div>

        {/* Floating Navigation (Focus Mode) */}
        {focusMode && (
          <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30 transition-all duration-300 ${
            showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}>
            <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-full shadow-2xl px-4 py-3 flex items-center gap-3">
              <button
                onClick={handlePreviousChapter}
                disabled={currentChapterIndex === 0}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Previous Chapter (←)"
              >
                ←
              </button>
              
              <div className="text-xs font-mono px-4 border-x border-gray-300 dark:border-gray-700">
                {currentChapterIndex + 1} / {chapters.length}
              </div>
              
              <button
                onClick={handleNextChapter}
                disabled={currentChapterIndex === chapters.length - 1}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Next Chapter (→)"
              >
                →
              </button>
              
              <button
                onClick={() => setFocusMode(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                title="Exit Focus Mode (F)"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div 
        className={`border-t border-gray-200/50 dark:border-gray-700/50 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 px-4 py-3 text-center text-xs sm:text-sm opacity-70 transition-all duration-300 ${
          focusMode && !showControls ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'
        }`}
        style={{ 
          borderTopColor: settings.theme === 'dark' || settings.theme === 'night' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
        }}
      >
        <p className="flex items-center justify-center gap-2 flex-wrap">
          <span>{ebook.author_name}</span>
          <span className="hidden sm:inline">•</span>
          <span>{progress}% complete</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">Press F for focus mode</span>
        </p>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .book-page {
          animation: fadeIn 0.5s ease-in;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .chapter-content {
          text-align: justify;
          hyphens: auto;
        }
        
        .chapter-content h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 1.5em 0 0.75em;
          line-height: 1.2;
        }
        
        .chapter-content h2 {
          font-size: 1.6em;
          font-weight: bold;
          margin: 1.5em 0 0.75em;
          line-height: 1.3;
        }
        
        .chapter-content h3 {
          font-size: 1.3em;
          font-weight: bold;
          margin: 1.5em 0 0.75em;
          line-height: 1.4;
        }
        
        .chapter-content p {
          margin: 1.2em 0;
          text-indent: 2em;
        }
        
        .chapter-content p:first-of-type,
        .chapter-content h1 + p,
        .chapter-content h2 + p,
        .chapter-content h3 + p {
          text-indent: 0;
        }
        
        .chapter-content p:first-of-type::first-letter {
          font-size: 3.5em;
          font-weight: bold;
          float: left;
          line-height: 0.85;
          margin: 0.1em 0.1em 0 0;
        }
        
        .chapter-content blockquote {
          border-left: 4px solid currentColor;
          padding-left: 1.5em;
          margin: 1.5em 0;
          opacity: 0.85;
          font-style: italic;
          text-indent: 0;
        }
        
        .chapter-content blockquote p {
          text-indent: 0;
        }
        
        .chapter-content pre {
          background: rgba(0, 0, 0, 0.05);
          padding: 1em;
          border-radius: 0.5rem;
          overflow-x: auto;
          font-family: 'Courier New', monospace;
          margin: 1.5em 0;
        }
        
        .chapter-content code {
          background: rgba(0, 0, 0, 0.05);
          padding: 0.2em 0.4em;
          border-radius: 0.25rem;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
        }
        
        .chapter-content pre code {
          background: none;
          padding: 0;
        }
        
        .chapter-content ul, .chapter-content ol {
          padding-left: 2em;
          margin: 1.2em 0;
        }
        
        .chapter-content li {
          margin: 0.5em 0;
        }
        
        .chapter-content li p {
          text-indent: 0;
        }
        
        .chapter-content a {
          color: #3b82f6;
          text-decoration: underline;
          text-decoration-color: rgba(59, 130, 246, 0.3);
          text-underline-offset: 2px;
          transition: all 0.2s;
        }
        
        .chapter-content a:hover {
          text-decoration-color: rgba(59, 130, 246, 1);
        }
        
        .chapter-content hr {
          margin: 2em auto;
          border: none;
          text-align: center;
        }
        
        .chapter-content hr::before {
          content: "***";
          letter-spacing: 1em;
          opacity: 0.5;
        }
        
        .chapter-content img {
          max-width: 100%;
          height: auto;
          margin: 2em auto;
          display: block;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .chapter-content table {
          width: 100%;
          margin: 1.5em 0;
          border-collapse: collapse;
        }
        
        .chapter-content th,
        .chapter-content td {
          padding: 0.75em;
          border: 1px solid rgba(0, 0, 0, 0.1);
          text-align: left;
        }
        
        .chapter-content th {
          background: rgba(0, 0, 0, 0.05);
          font-weight: bold;
        }
        
        /* Smooth scrolling */
        .overflow-y-auto {
          scroll-behavior: smooth;
        }
        
        /* Custom scrollbar */
        .overflow-y-auto::-webkit-scrollbar {
          width: 10px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 5px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
        }
        
        /* Dark mode scrollbar */
        .dark .overflow-y-auto::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        
        .dark .overflow-y-auto::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
        }
        
        .dark .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        
        /* Selection color based on theme */
        ::selection {
          background: rgba(59, 130, 246, 0.3);
        }
        
        /* Responsive typography */
        @media (max-width: 640px) {
          .chapter-content p:first-of-type::first-letter {
            font-size: 2.5em;
          }
          
          .chapter-content p {
            text-indent: 1.5em;
          }
        }
        
        /* Print styles */
        @media print {
          .ebook-reader-container > *:not(.flex-1) {
            display: none !important;
          }
          
          .chapter-content {
            text-align: left;
          }
          
          .chapter-content p {
            text-indent: 1.5em;
          }
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

      if (chapterId) {
        const chapterIndex = chaptersData.findIndex(ch => ch.id === parseInt(chapterId));
        setCurrentChapterIndex(chapterIndex >= 0 ? chapterIndex : 0);
      } else if (user) {
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
          // No saved progress
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
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading your book...</p>
        </div>
      </div>
    );
  }

  if (!ebook || chapters.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">No Content Available</h2>
          <p className="text-gray-600 mb-6">This book doesn't have any chapters yet.</p>
          <button
            onClick={() => navigate(`/ebooks/${id}`)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all transform hover:scale-105"
          >
            Back to Book Details
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