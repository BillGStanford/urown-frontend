import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// 1. Dependency Update: Use useSearchParams for persistent page number in URL
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
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
  AlignLeft,
  AlignCenter,
  AlignJustify
} from 'lucide-react';

// --- CONFIGURATION DATA ---
const themes = {
  Light: { bg: '#f9f7f4', text: '#1a1a1a', accent: '#0070f3', secondary: '#e6e6e6', paper: '#ffffff', shadow: 'rgba(0, 0, 0, 0.08)' },
  Dark: { bg: '#171717', text: '#e0e0e0', accent: '#5c9ce6', secondary: '#333333', paper: '#1f1f1f', shadow: 'rgba(255, 255, 255, 0.05)' },
  Sepia: { bg: '#f4ecd8', text: '#5c4a1f', accent: '#92400e', secondary: '#e7d4a0', paper: '#f5e6d3', shadow: 'rgba(92, 64, 14, 0.2)' },
  Onyx: { bg: '#081014', text: '#bdbdbe', accent: '#0070f3', secondary: '#1c242c', paper: '#0e171b', shadow: 'rgba(0, 0, 0, 0.4)' },
};

const fonts = ['Georgia', 'Times New Roman', 'Palatino', 'Bookman', 'Garamond', 'Arial', 'Helvetica', 'Verdana', 'OpenDyslexic'];


// --- CORE PAGINATION LOGIC (Reverted single-page to scrollable chapter) ---
const splitContentIntoPages = (content, settings) => {
  const sanitizedContent = DOMPurify.sanitize(content);

  // FIX: If in single-page mode, return the ENTIRE content as one page.
  // This bypasses the splitting logic and allows the BookPages component 
  // to expand and become scrollable.
  if (settings.pageMode === '1-page') {
    return [[sanitizedContent]];
  }
  
  // --- START OF 2-PAGE (BOOK-VIEW) PAGINATION LOGIC ---
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.visibility = 'hidden';
  // Use 45% of inner width for two pages
  tempDiv.style.width = `${window.innerWidth * 0.45}px`; 
  tempDiv.style.fontSize = `${settings.fontSize}px`;
  tempDiv.style.lineHeight = settings.lineHeight;
  tempDiv.style.fontFamily = settings.fontFamily;
  tempDiv.style.padding = '24px'; // Must match the BookPages padding
  tempDiv.style.textAlign = settings.textAlign;
  tempDiv.style.wordBreak = 'break-word';
  document.body.appendChild(tempDiv);
  
  // Robust Max Reading Height Calculation for 2-page mode
  const maxReadingHeight = window.innerHeight - 140; 

  // Split content by paragraphs, retaining tags
  const paragraphs = content.split(/<\/p>\s*<p/i);
  const pages = [];
  let currentPageContent = '';
  
  for (let i = 0; i < paragraphs.length; i++) {
    let fullParagraph = paragraphs[i].trim();
    
    // Reconstruct the HTML structure accurately
    if (i > 0) fullParagraph = '<p' + fullParagraph;
    if (i < paragraphs.length - 1) fullParagraph += '</p>'; 
    else if (!fullParagraph.endsWith('</p>')) fullParagraph += '</p>'; // Safety net

    tempDiv.innerHTML = currentPageContent + fullParagraph;
    
    if (tempDiv.offsetHeight > maxReadingHeight) {
      if (currentPageContent.trim()) {
        pages.push(currentPageContent);
        currentPageContent = fullParagraph;
        tempDiv.innerHTML = currentPageContent;
      } 
      
      // If content is still too long (i.e., a single paragraph overflows an empty page)
      if (tempDiv.offsetHeight > maxReadingHeight) {
        
        const rawContent = fullParagraph.replace(/<\/?p>/gi, '').trim(); 
        const words = rawContent.split(/\s+/);
        let partialContent = '';
        
        tempDiv.innerHTML = ''; 

        for (const word of words) {
            tempDiv.innerHTML = `<p>${partialContent} ${word}</p>`; 
            
            if (tempDiv.offsetHeight > maxReadingHeight) {
                if (partialContent.trim()) {
                    pages.push(`<p>${partialContent}</p>`);
                }
                partialContent = word + ' '; 
            } else {
                partialContent += word + ' ';
            }
        }
        
        currentPageContent = `<p>${partialContent.trim()}</p>`; 
        i--;
        
      } else {
        currentPageContent = fullParagraph; 
      }
    } else {
      currentPageContent += fullParagraph;
    }
  }
  
  // Push any remaining content
  if (currentPageContent.trim()) {
    pages.push(currentPageContent);
  }
  
  document.body.removeChild(tempDiv);
  
  // Pair up pages for 2-page mode
  const pairedPages = [];
  for (let i = 0; i < pages.length; i += 2) {
    pairedPages.push([pages[i], pages[i + 1] || null]);
  }
  
  return pairedPages;
};


// --- HIGHLIGHTING COMPONENTS (NEW/REFINED) ---

const HighlightToolbar = ({ selectedText, highlightToolbarPosition, currentTheme, addHighlight }) => {
  if (!selectedText) return null;

  return (
    <div 
      className="fixed z-[99] flex gap-2 p-2 rounded-xl shadow-2xl backdrop-blur-sm transition-opacity duration-100"
      style={{ 
        backgroundColor: currentTheme.paper + 'e6',
        border: `1px solid ${currentTheme.secondary}`,
        left: `${highlightToolbarPosition.x}px`,
        top: `${highlightToolbarPosition.y}px`,
        transform: 'translateX(-50%) translateY(-110%)',
      }}
    >
      {['#FFC72C', '#6FCF97', '#56CCF2', '#BB6BD9'].map((color) => (
        <button
          key={color}
          onClick={() => addHighlight(color)}
          className="w-7 h-7 rounded-full border-2 hover:scale-110 transition-transform shadow-md"
          style={{ backgroundColor: color, borderColor: currentTheme.text + '80' }}
          title={`Highlight in ${color}`}
        />
      ))}
    </div>
  );
};


// --- READER UI COMPONENTS (Minimal changes for integration) ---

const ChapterSidebar = ({ showSidebar, setShowSidebar, chapters, currentChapter, setCurrentChapter, setCurrentPage, currentTheme }) => {
  return (
    <div 
      className={`fixed top-0 bottom-0 w-80 shadow-2xl overflow-y-auto z-40 transition-transform duration-300 ease-in-out ${showSidebar ? 'translate-x-0' : 'translate-x-full'}`}
      style={{ 
        backgroundColor: currentTheme.bg, 
        borderLeft: `1px solid ${currentTheme.secondary}`,
        right: 0 
      }}
    >
      <div className="p-6 pt-20">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-serif font-bold">Table of Contents</h3>
          <button
            onClick={() => setShowSidebar(false)}
            className="p-2 rounded-full hover:bg-opacity-50 transition-colors"
            style={{ color: currentTheme.text, backgroundColor: currentTheme.secondary }}
          >
            <X size={20} />
          </button>
        </div>
        <div className="space-y-1">
          {chapters.map((chapter) => (
            <button
              key={chapter.id}
              onClick={() => {
                setCurrentChapter(chapter);
                setCurrentPage(1); 
                setShowSidebar(false);
              }}
              className={`w-full text-left p-3 rounded-lg transition-all border-l-4 ${
                chapter.id === currentChapter?.id 
                  ? 'font-semibold' 
                  : 'hover:bg-opacity-80 opacity-80'
              }`}
              style={{
                backgroundColor: chapter.id === currentChapter?.id ? currentTheme.secondary : 'transparent',
                borderColor: chapter.id === currentChapter?.id ? currentTheme.accent : 'transparent',
                color: currentTheme.text
              }}
            >
              <div className="text-xs opacity-60">Chapter {chapter.chapter_number}</div>
              <div className="text-base truncate">{chapter.chapter_title}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const SettingsPanel = ({ showSettings, setShowSettings, settings, updateSetting, toggleDyslexiaMode, currentTheme, fonts, themes }) => {
  const [activeTab, setActiveTab] = useState('Display');

  const AlignmentButton = ({ icon, alignment }) => (
    <button
      onClick={() => updateSetting('textAlign', alignment)}
      className={`p-3 rounded-lg border flex-1 transition-all ${
        settings.textAlign === alignment ? 'font-bold' : 'opacity-70 hover:opacity-100'
      }`}
      style={{ 
        backgroundColor: settings.textAlign === alignment ? currentTheme.accent + '20' : currentTheme.secondary,
        color: settings.textAlign === alignment ? currentTheme.accent : currentTheme.text,
        borderColor: settings.textAlign === alignment ? currentTheme.accent : currentTheme.secondary,
      }}
      title={`Align ${alignment}`}
    >
      {icon}
    </button>
  );

  return (
    <div 
      className={`fixed top-0 bottom-0 w-80 shadow-2xl overflow-y-auto z-40 transition-transform duration-300 ease-in-out ${showSettings ? 'translate-x-0' : '-translate-x-full'}`}
      style={{ 
        backgroundColor: currentTheme.bg, 
        borderRight: `1px solid ${currentTheme.secondary}`,
        left: 0 
      }}
    >
      <div className="p-6 pt-20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-serif font-bold">Reader Settings</h3>
          <button
            onClick={() => setShowSettings(false)}
            className="p-2 rounded-full hover:bg-opacity-50 transition-colors"
            style={{ color: currentTheme.text, backgroundColor: currentTheme.secondary }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b mb-6" style={{ borderColor: currentTheme.secondary }}>
          <button
            onClick={() => setActiveTab('Display')}
            className={`flex-1 py-2 font-semibold transition-all ${activeTab === 'Display' ? 'border-b-2' : 'opacity-50 hover:opacity-80'}`}
            style={{ borderColor: activeTab === 'Display' ? currentTheme.accent : 'transparent' }}
          >
            <Sun size={16} className="inline mr-1" /> Display
          </button>
          <button
            onClick={() => setActiveTab('Typography')}
            className={`flex-1 py-2 font-semibold transition-all ${activeTab === 'Typography' ? 'border-b-2' : 'opacity-50 hover:opacity-80'}`}
            style={{ borderColor: activeTab === 'Typography' ? currentTheme.accent : 'transparent' }}
          >
            <Type size={16} className="inline mr-1" /> Type
          </button>
        </div>
        
        <div className="space-y-6">

          {activeTab === 'Display' && (
            <>
              <div>
                <label className="block font-semibold text-sm mb-2">Reading Theme</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(themes).map(theme => (
                    <button
                      key={theme}
                      onClick={() => updateSetting('theme', theme)}
                      className={`p-3 rounded-lg border text-sm transition-all text-center flex items-center justify-center ${
                        settings.theme === theme ? 'ring-2' : 'hover:ring-1 opacity-80'
                      }`}
                      style={{
                        backgroundColor: themes[theme].paper,
                        color: themes[theme].text,
                        borderColor: settings.theme === theme ? currentTheme.accent : currentTheme.secondary,
                        boxShadow: `0 2px 4px ${currentTheme.shadow}`
                      }}
                    >
                      {theme === 'Dark' || theme === 'Onyx' ? <Moon size={16} className="inline mr-1" /> : <Sun size={16} className="inline mr-1" />}
                      {theme}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-sm mb-2">Layout</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateSetting('pageMode', '1-page')}
                    className={`p-3 rounded-lg text-sm transition-all border ${
                      settings.pageMode === '1-page' ? 'font-bold' : 'hover:bg-opacity-80 opacity-80'
                    }`}
                    style={{ 
                      backgroundColor: settings.pageMode === '1-page' ? currentTheme.accent + '20' : currentTheme.secondary,
                      color: currentTheme.text,
                      borderColor: settings.pageMode === '1-page' ? currentTheme.accent : 'transparent'
                    }}
                  >
                    Single Page
                  </button>
                  <button
                    onClick={() => updateSetting('pageMode', '2-page')}
                    className={`p-3 rounded-lg text-sm transition-all border ${
                      settings.pageMode === '2-page' ? 'font-bold' : 'hover:bg-opacity-80 opacity-80'
                    }`}
                    style={{ 
                      backgroundColor: settings.pageMode === '2-page' ? currentTheme.accent + '20' : currentTheme.secondary,
                      color: currentTheme.text,
                      borderColor: settings.pageMode === '2-page' ? currentTheme.accent : 'transparent'
                    }}
                  >
                    Book View
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-sm mb-2">Margins</label>
                <div className="grid grid-cols-3 gap-2">
                  {['narrow', 'medium', 'wide'].map(m => (
                    <button
                      key={m}
                      onClick={() => updateSetting('margin', m)}
                      className={`p-3 rounded-lg text-sm transition-all border ${
                        settings.margin === m ? 'font-bold' : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ 
                        backgroundColor: settings.margin === m ? currentTheme.accent + '20' : currentTheme.secondary,
                        color: currentTheme.text,
                        borderColor: settings.margin === m ? currentTheme.accent : 'transparent'
                      }}
                    >
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'Typography' && (
            <>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-semibold text-sm">Font Size</label>
                  <span className="text-sm opacity-70">{settings.fontSize}px</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateSetting('fontSize', Math.max(12, settings.fontSize - 1))}
                    className="p-2 rounded-full hover:bg-opacity-10 transition-colors opacity-80"
                    style={{ color: currentTheme.text, backgroundColor: currentTheme.secondary }}
                  >
                    <Minimize2 size={16} />
                  </button>
                  <input
                    type="range"
                    min="12"
                    max="32"
                    value={settings.fontSize}
                    onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
                    className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                    style={{ backgroundColor: currentTheme.secondary, accentColor: currentTheme.accent }}
                  />
                  <button
                    onClick={() => updateSetting('fontSize', Math.min(32, settings.fontSize + 1))}
                    className="p-2 rounded-full hover:bg-opacity-10 transition-colors opacity-80"
                    style={{ color: currentTheme.text, backgroundColor: currentTheme.secondary }}
                  >
                    <Maximize2 size={16} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-sm mb-2">Font</label>
                <select
                  value={settings.fontFamily}
                  onChange={(e) => updateSetting('fontFamily', e.target.value)}
                  className="w-full p-2 rounded-lg border text-sm focus:ring focus:ring-opacity-50 transition-shadow"
                  style={{ 
                    backgroundColor: currentTheme.secondary, 
                    color: currentTheme.text,
                    borderColor: currentTheme.secondary,
                    fontFamily: settings.fontFamily, 
                    boxShadow: `0 1px 3px ${currentTheme.shadow}`
                  }}
                >
                  {fonts.map(font => (
                    <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-semibold text-sm">Line Spacing</label>
                  <span className="text-sm opacity-70">{(settings.lineHeight).toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="1.2"
                  max="2.5"
                  step="0.1"
                  value={settings.lineHeight}
                  onChange={(e) => updateSetting('lineHeight', parseFloat(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{ backgroundColor: currentTheme.secondary, accentColor: currentTheme.accent }}
                />
              </div>

              <div>
                <label className="block font-semibold text-sm mb-2">Alignment</label>
                <div className="flex gap-2">
                  <AlignmentButton icon={<AlignLeft size={18} />} alignment="left" />
                  <AlignmentButton icon={<AlignCenter size={18} />} alignment="center" />
                  <AlignmentButton icon={<AlignJustify size={18} />} alignment="justify" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2 p-3 rounded-lg transition-colors" style={{ backgroundColor: currentTheme.secondary }}>
                  <label className="font-semibold text-sm">Dyslexia Mode</label>
                  <button
                    onClick={toggleDyslexiaMode}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                      settings.dyslexiaMode ? 'text-white' : 'opacity-80'
                    }`}
                    style={{ 
                      backgroundColor: settings.dyslexiaMode ? currentTheme.accent : currentTheme.paper,
                      color: settings.dyslexiaMode ? '#fff' : currentTheme.text,
                      border: `1px solid ${settings.dyslexiaMode ? 'transparent' : currentTheme.secondary}`
                    }}
                  >
                    {settings.dyslexiaMode ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};


// Reader Header (Minimal changes)
const ReaderHeader = ({ focusMode, setFocusMode, ebook, currentChapter, progress, slug, currentTheme, setShowSidebar, showSidebar, setShowSettings, showSettings }) => {
  if (focusMode) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-sm" 
      style={{ backgroundColor: currentTheme.bg + 'e6', borderBottom: `1px solid ${currentTheme.secondary}` }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        
        <div className="flex items-center gap-4">
          <Link to={`/ebooks/${slug}`} className="flex items-center gap-1 p-2 rounded-full hover:bg-opacity-10 transition-colors opacity-80 hover:opacity-100" style={{ color: currentTheme.text }}>
            <ChevronLeft size={20} />
            <span className="font-medium hidden sm:inline text-sm">Library</span>
          </Link>
          <div className="hidden sm:block">
            <h2 className="font-bold text-base truncate max-w-[200px]" style={{ color: currentTheme.text }}>{ebook?.title}</h2>
            <p className="text-xs opacity-70 truncate max-w-[200px]">Ch. {currentChapter?.chapter_number}: {currentChapter?.chapter_title}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          
          <button
            onClick={() => setFocusMode(true)}
            className="p-2 rounded-full hover:bg-opacity-10 transition-colors opacity-80 hover:opacity-100"
            style={{ color: currentTheme.text }}
            title="Focus Mode"
          >
            <Focus size={20} />
          </button>
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 rounded-full hover:bg-opacity-10 transition-colors opacity-80 hover:opacity-100"
            style={{ color: currentTheme.text }}
            title="Table of Contents"
          >
            <BookOpen size={20} />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-full hover:bg-opacity-10 transition-colors opacity-80 hover:opacity-100"
            style={{ color: currentTheme.text }}
            title="Settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      <div className="h-0.5" style={{ backgroundColor: currentTheme.secondary }}>
        <div 
          className="h-full transition-all duration-500 ease-out"
          style={{ backgroundColor: currentTheme.accent, width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

// Reader Footer 
const ReaderFooter = ({ currentPage, totalPages, chapterIndex, chapters, overallProgress, currentTheme, changePage }) => {
  const isFirstPage = currentPage === 1 && chapterIndex === 0;
  const isLastPage = currentPage === totalPages && chapterIndex === chapters.length - 1;

  // If in 1-page mode, totalPages will be 1, and the controls will be disabled. This is correct.
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-sm" 
      style={{ backgroundColor: currentTheme.bg + 'e6', borderTop: `1px solid ${currentTheme.secondary}` }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between h-12">
        
        <button
          onClick={() => changePage('prev')}
          disabled={isFirstPage}
          className="flex items-center gap-1 text-sm disabled:opacity-30 transition-opacity p-2 rounded-full hover:bg-opacity-20"
          style={{ color: currentTheme.accent }}
        >
          <ChevronLeft size={18} />
          <span className="hidden sm:inline">Previous</span>
        </button>
        
        <div className="text-center flex items-center gap-4">
          <div className="text-sm font-semibold opacity-80">
            {overallProgress.toFixed(0)}% Overall
          </div>
          <div className="text-sm opacity-60 font-mono">
            Page {currentPage} / {totalPages}
          </div>
        </div>
        
        <button
          onClick={() => changePage('next')}
          disabled={isLastPage}
          className="flex items-center gap-1 text-sm disabled:opacity-30 transition-opacity p-2 rounded-full hover:bg-opacity-20"
          style={{ color: currentTheme.accent }}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

// Book Pages (Reading Area - FIXES APPLIED)
const BookPages = ({ settings, currentTheme, pages, currentPage, totalPages, currentChapter, handleTextSelection, handleContentClick, contentRef, leftPageRef, rightPageRef }) => {
  
  const getMarginClass = () => {
    switch (settings.margin) {
      case 'narrow': return 'max-w-6xl';
      case 'medium': return 'max-w-4xl';
      case 'wide': return 'max-w-3xl';
      default: return 'max-w-4xl';
    }
  };

  const commonPageStyle = {
    backgroundColor: currentTheme.paper,
    color: currentTheme.text,
    fontSize: `${settings.fontSize}px`,
    lineHeight: settings.lineHeight,
    textAlign: settings.textAlign,
    fontFamily: settings.fontFamily,
    letterSpacing: settings.letterSpacing,
    boxShadow: `0 8px 30px ${currentTheme.shadow}`, 
    transition: 'all 0.3s ease-in-out'
  };

  const CurrentPageContent = pages[currentPage - 1]; 
  
  return (
    // FIX: Removed unnecessary flex-1 from the outer container to allow its children to determine height
    <div className="h-screen w-screen flex items-center justify-center pt-16 pb-16 sm:pt-20 sm:pb-20 overflow-hidden">
      <div className={`mx-auto h-full w-full ${getMarginClass()}`}>
        
        {settings.pageMode === '2-page' && CurrentPageContent ? (
          // Two-page view (PAGINATED)
          <div className="grid grid-cols-2 gap-10 h-full px-4 md:px-0">
            {/* Left Page */}
            <div
              ref={leftPageRef}
              onMouseUp={handleTextSelection}
              onClick={handleContentClick} 
              className="prose prose-lg max-w-none p-6 rounded-xl h-full overflow-hidden flex flex-col"
              style={commonPageStyle}
            >
              {currentPage === 1 && (
                <div className="mb-8 border-b pb-4" style={{ borderColor: currentTheme.secondary }}>
                  <h1 className="text-3xl font-serif font-bold" style={{ color: currentTheme.text }}>Chapter {currentChapter.chapter_number}</h1>
                  <h2 className="text-xl opacity-80" style={{ color: currentTheme.text }}>{currentChapter.chapter_title}</h2>
                </div>
              )}
              <div 
                dangerouslySetInnerHTML={{ __html: CurrentPageContent[0] || '' }}
                style={{ marginBottom: `${settings.paragraphSpacing}rem` }}
              />
            </div>
            
            {/* Right Page */}
            <div
              ref={rightPageRef}
              onMouseUp={handleTextSelection}
              onClick={handleContentClick} 
              className="prose prose-lg max-w-none p-6 rounded-xl h-full overflow-hidden flex flex-col"
              style={commonPageStyle}
            >
              {CurrentPageContent[1] ? (
                <div 
                  dangerouslySetInnerHTML={{ __html: CurrentPageContent[1] }}
                  style={{ marginBottom: `${settings.paragraphSpacing}rem` }}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center opacity-60">
                    <BookOpen size={48} className="mx-auto" style={{ color: currentTheme.accent }}/>
                    <p className="mt-4 text-sm font-semibold">End of Chapter {currentChapter.chapter_number}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Single page (SCROLLABLE DOCUMENT VIEW - The Fix)
          <div
            ref={contentRef}
            onMouseUp={handleTextSelection}
            onClick={handleContentClick} 
            // The container needs to be scrollable, so we use max-h-full on its parent 
            // and overflow-y-auto on the content itself.
            className="prose prose-lg max-w-none p-6 rounded-xl shadow-2xl mx-4 md:mx-0 w-[90%] md:w-full h-full"
            style={{
                ...commonPageStyle, 
                // FIX: Setting maxHeight to none allows the div to expand based on content
                maxHeight: 'none', 
                // FIX: Setting overflowY to auto enables scrolling within this div
                overflowY: 'auto'
            }}
          >
            {currentPage === 1 && (
              <div className="mb-8 border-b pb-4" style={{ borderColor: currentTheme.secondary }}>
                <h1 className="text-3xl font-serif font-bold" style={{ color: currentTheme.text }}>Chapter {currentChapter.chapter_number}</h1>
                <h2 className="text-2xl opacity-80" style={{ color: currentTheme.text }}>{currentChapter.chapter_title}</h2>
              </div>
            )}
            <div 
              // Since the content is the whole chapter (Page 1 of 1), we render it all.
              dangerouslySetInnerHTML={{ __html: CurrentPageContent ? CurrentPageContent[0] : '' }}
              style={{ marginBottom: `${settings.paragraphSpacing}rem` }}
            />
            
            {currentPage === totalPages && (
              <div className="mt-12 text-center font-bold text-xl opacity-50" style={{ color: currentTheme.accent }}>
                *** END ***
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// --- MAIN COMPONENT (ReadEbookPage) ---
const ReadEbookPage = () => {
  const { slug, chapterId } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Refs
  const contentRef = useRef(null);
  const leftPageRef = useRef(null);
  const rightPageRef = useRef(null);
  
  // Book data
  const [ebook, setEbook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Reader settings 
  const initialSettings = {
    fontSize: 18,
    fontFamily: 'Arial',
    theme: 'Light',
    pageMode: '2-page',
    lineHeight: 1.8,
    paragraphSpacing: 1.5,
    textAlign: 'justify',
    margin: 'medium',
    letterSpacing: 'normal',
    dyslexiaMode: false
  };
  const [settings, setSettings] = useState(initialSettings);
  
  // Reader state
  const [currentPage, setLocalCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [highlights, setHighlights] = useState([]); 
  const [selectedText, setSelectedText] = useState(null);
  const [highlightToolbarPosition, setHighlightToolbarPosition] = useState({ x: 0, y: 0 });
  const [pages, setPages] = useState([[]]);
  
  const [loadLastPage, setLoadLastPage] = useState(false); 

  // Derived Values
  const currentTheme = themes[settings.theme] || themes.Light;
  const chapterIndex = chapters.findIndex(ch => ch.id === currentChapter?.id);
  const overallProgress = chapters.length > 0 ? (((chapterIndex + 1) / chapters.length) * 100) : 0;
  
  // --- UTILITIES ---

  const setCurrentPage = useCallback((newPage) => {
    setLocalCurrentPage(newPage);
    setSearchParams(prev => {
        prev.set('page', newPage);
        return prev;
    }, { replace: true });
  }, [setSearchParams]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const toggleDyslexiaMode = () => {
    const newMode = !settings.dyslexiaMode;
    updateSetting('dyslexiaMode', newMode);
    updateSetting('fontFamily', newMode ? 'OpenDyslexic' : initialSettings.fontFamily);
    updateSetting('letterSpacing', newMode ? '0.1em' : initialSettings.letterSpacing);
  };
  
  // --- DATA FETCHING (Backend code - untouched) ---
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

  useEffect(() => {
    fetchEbookData();
  }, [slug]);

  // Set initial chapter based on URL or first chapter
  useEffect(() => {
    if (chapterId && chapters.length > 0) {
      const chapter = chapters.find(ch => ch.id === parseInt(chapterId));
      if (chapter) {
        setCurrentChapter(chapter);
      }
    } else if (chapters.length > 0 && !currentChapter) {
      setCurrentChapter(chapters[0]);
    }
  }, [chapterId, chapters]);

  // --- PAGINATION EFFECT (Modified to respect '1-page' as single scroll) ---
  useEffect(() => {
    if (currentChapter) {
      const pageContent = splitContentIntoPages(currentChapter.content, settings);
      
      const newTotalPages = pageContent.length > 0 ? pageContent.length : 1;
      
      setPages(pageContent);
      setTotalPages(newTotalPages);

      // If in scrollable mode, always stay on Page 1
      if (settings.pageMode === '1-page') {
          setCurrentPage(1);
          setLocalCurrentPage(1);
          return;
      }
      
      if (loadLastPage) {
          setCurrentPage(newTotalPages);
          setLoadLastPage(false); 
      } else {
          setLocalCurrentPage(p => Math.min(p, newTotalPages));
          setCurrentPage(Math.min(currentPage, newTotalPages));
      }
    }
  }, [currentChapter, settings.pageMode, settings.fontSize, settings.lineHeight, settings.fontFamily, settings.textAlign, settings.letterSpacing, settings.margin, loadLastPage]); 

  // --- NAVIGATION LOGIC (Modified to be disabled in '1-page' mode) ---
  const changePage = (direction) => {
    // Disable navigation if in single-page scroll mode
    if (settings.pageMode === '1-page') return;

    if (direction === 'next') {
      if (currentPage < totalPages) {
        setCurrentPage(currentPage + 1);
      } else {
        const currentIndex = chapters.findIndex(ch => ch.id === currentChapter?.id);
        if (currentIndex < chapters.length - 1) {
          setCurrentChapter(chapters[currentIndex + 1]);
          setCurrentPage(1); 
        }
      }
    } else { // 'prev'
      if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        const currentIndex = chapters.findIndex(ch => ch.id === currentChapter?.id);
        if (currentIndex > 0) {
          setLoadLastPage(true); 
          setCurrentChapter(chapters[currentIndex - 1]); 
        }
      }
    }
  };
  
  // --- HIGHLIGHTING LOGIC (Untouched) ---

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    
    if (!text || text.length === 0) {
        setSelectedText(null);
        return;
    }

    if (text.length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      const readingArea = contentRef.current || leftPageRef.current || rightPageRef.current;
      if (!readingArea || !readingArea.contains(range.startContainer) || !readingArea.contains(range.endContainer)) {
          setSelectedText(null);
          return;
      }

      setSelectedText({ text, range });
      
      setHighlightToolbarPosition({
        x: rect.left + rect.width / 2,
        y: rect.top 
      });
    }
  };

  const addHighlight = (color) => {
    if (!selectedText) return;
    
    const range = selectedText.range;
    const className = `highlighted-text highlight-${color.replace('#', '')}`;
    const highlightId = `h-${Date.now()}`;
    
    const span = document.createElement('span');
    span.style.backgroundColor = color + '99'; 
    span.dataset.highlightId = highlightId;
    span.className = className; 
    span.style.cursor = 'pointer';

    try {
        const rangeClone = range.cloneRange(); 
        rangeClone.surroundContents(span);
        
        const highlight = {
            id: highlightId,
            color,
            chapterId: currentChapter.id,
            page: currentPage
        };
        
        setHighlights(prev => [...prev, highlight]);
        setSelectedText(null);
        window.getSelection().removeAllRanges();
        
    } catch (e) {
        console.warn("Could not surround contents for highlight (boundary error likely):", e);
        setSelectedText(null);
        window.getSelection().removeAllRanges();
    }
  };

  const removeHighlightById = (id) => {
    const span = document.querySelector(`span[data-highlight-id="${id}"]`);
    if (!span) return;
    
    const parent = span.parentNode;
    while (span.firstChild) {
        parent.insertBefore(span.firstChild, span);
    }
    parent.removeChild(span);
    
    setHighlights(prev => prev.filter(h => h.id !== id));
  };
  
  const handleContentClick = (e) => {
    if (e.target.classList.contains('highlighted-text') && e.target.dataset.highlightId) {
        e.stopPropagation();
        removeHighlightById(e.target.dataset.highlightId);
    }
  };

  // --- RENDERING ---

  if (loading || !currentChapter) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center transition-colors duration-500" style={{ backgroundColor: currentTheme.bg, color: currentTheme.text }}>
        <div className="animate-spin rounded-full h-16 w-16 border-4" style={{ borderTopColor: currentTheme.accent, borderColor: currentTheme.secondary }}></div>
        <p className="mt-4 text-lg">Loading Book...</p>
      </div>
    );
  }

  return (
    <div 
      className="h-screen w-screen overflow-hidden relative transition-colors duration-500"
      style={{ 
        backgroundColor: currentTheme.bg,
        color: currentTheme.text,
        fontFamily: settings.fontFamily,
        letterSpacing: settings.letterSpacing,
      }}
      onClick={focusMode ? () => setFocusMode(false) : undefined}
    >
      
      {/* Header and Footer */}
      <div className={`transition-all duration-300 ${focusMode ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}>
        <ReaderHeader 
          focusMode={focusMode} 
          setFocusMode={setFocusMode}
          ebook={ebook}
          currentChapter={currentChapter}
          progress={overallProgress}
          slug={slug}
          currentTheme={currentTheme}
          setShowSidebar={setShowSidebar}
          showSidebar={showSidebar}
          setShowSettings={setShowSettings}
          showSettings={showSettings}
        />
        <ReaderFooter
          currentPage={currentPage}
          totalPages={totalPages}
          chapterIndex={chapterIndex}
          chapters={chapters}
          overallProgress={overallProgress}
          currentTheme={currentTheme}
          changePage={changePage}
        />
      </div>
      
      {/* Main Content Area */}
      {/* The inner BookPages div now controls the scrolling for 1-page mode */}
      <div className="h-screen w-screen flex flex-col"> 
        <BookPages 
          settings={settings}
          currentTheme={currentTheme}
          pages={pages}
          currentPage={currentPage}
          totalPages={totalPages}
          currentChapter={currentChapter}
          handleTextSelection={handleTextSelection}
          handleContentClick={handleContentClick}
          contentRef={contentRef}
          leftPageRef={leftPageRef}
          rightPageRef={rightPageRef}
        />
      </div>

      {/* Sidebars */}
      <ChapterSidebar 
        showSidebar={showSidebar && !focusMode} 
        setShowSidebar={setShowSidebar} 
        chapters={chapters} 
        currentChapter={currentChapter} 
        setCurrentChapter={setCurrentChapter} 
        setCurrentPage={setCurrentPage}
        currentTheme={currentTheme}
      />
      
      <SettingsPanel
        showSettings={showSettings && !focusMode}
        setShowSettings={setShowSettings}
        settings={settings}
        updateSetting={updateSetting}
        toggleDyslexiaMode={toggleDyslexiaMode}
        currentTheme={currentTheme}
        fonts={fonts}
        themes={themes} 
      />

      {/* Highlighting Toolbar */}
      <HighlightToolbar
        selectedText={selectedText}
        highlightToolbarPosition={highlightToolbarPosition}
        currentTheme={currentTheme}
        addHighlight={addHighlight}
      />

      {/* Focus Mode Exit Button */}
      {focusMode && (
        <button
          onClick={(e) => { e.stopPropagation(); setFocusMode(false); }}
          className="fixed top-4 right-4 z-[100] p-3 rounded-full shadow-xl transition-all hover:scale-105"
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