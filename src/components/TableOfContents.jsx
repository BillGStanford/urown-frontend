// src/components/TableOfContents.jsx
import React, { useState, useEffect } from 'react';

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

export default TableOfContents;