// src/components/EbookReader.jsx
import React, { useState, useEffect, useRef } from 'react';
import FontSettingsPanel from './FontSettingsPanel';
import TableOfContents from './TableOfContents';

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

export default EbookReader;