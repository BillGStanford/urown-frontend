// src/pages/EBookReadingPage.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';

const EBookReadingPage = () => {
  const { id } = useParams();
  const [ebook, setEbook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [fontSize, setFontSize] = useState(16); // in pixels
  const [highlightedText, setHighlightedText] = useState({});
  const [showTOC, setShowTOC] = useState(false);
  const contentRef = useRef(null);
  const navigate = useNavigate();

  // Constants for page dimensions
  const PAGE_HEIGHT = 800; // in pixels
  const PAGE_WIDTH = 600; // in pixels

  useEffect(() => {
    const fetchEbook = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/ebooks/${id}`);
        setEbook(response.data.ebook);
      } catch (err) {
        setError('Failed to fetch e-book');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEbook();
  }, [id]);

  // Parse content to extract headers and create TOC
  const parseContent = (content) => {
    const toc = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const headers = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    headers.forEach((header, index) => {
      toc.push({
        id: `header-${index}`,
        level: parseInt(header.tagName.substring(1)),
        text: header.textContent,
        // We'll assign a page number later
        page: 0
      });
    });
    
    return toc;
  };

  // Split content into pages
  const splitIntoPages = (content) => {
    // This is a very simplified pagination.
    // In a real app, you'd need a more sophisticated algorithm that considers the actual rendering.
    
    // We'll split by words and then form pages without breaking words.
    const words = content.split(/\s+/);
    const pages = [];
    let currentPageWords = [];
    let currentCharCount = 0;
    const maxCharsPerPage = 2000; // Approximate, adjust based on font size and page dimensions
    
    words.forEach(word => {
      if (currentCharCount + word.length + 1 > maxCharsPerPage) {
        pages.push(currentPageWords.join(' '));
        currentPageWords = [word];
        currentCharCount = word.length;
      } else {
        currentPageWords.push(word);
        currentCharCount += word.length + 1;
      }
    });
    
    if (currentPageWords.length > 0) {
      pages.push(currentPageWords.join(' '));
    }
    
    return pages;
  };

  // Handle highlighting
  const handleHighlight = () => {
    const selection = window.getSelection();
    if (selection.toString().trim() === '') return;
    
    const range = selection.getRangeAt(0);
    const selectedText = selection.toString();
    
    // Generate a unique ID for this highlight
    const highlightId = `highlight-${Date.now()}`;
    
    // Store the highlighted text (not in database, just in state)
    setHighlightedText(prev => ({
      ...prev,
      [highlightId]: {
        text: selectedText,
        startOffset: range.startOffset,
        endOffset: range.endOffset,
        // We would need more info to recreate the highlight, but this is simplified
      }
    }));
    
    // Clear selection
    selection.removeAllRanges();
  };

  // Handle page navigation
  const goToNextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <div className="text-2xl font-bold mt-4">LOADING...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-500 mb-4">Error</div>
          <div className="text-lg">{error}</div>
          <button 
            onClick={() => navigate('/ebooks')}
            className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-md transition-colors duration-300"
          >
            Back to E-Books
          </button>
        </div>
      </div>
    );
  }

  if (!ebook) {
    return null;
  }

  const toc = parseContent(ebook.content);
  const pages = splitIntoPages(ebook.content);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">{ebook.title}</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowTOC(!showTOC)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors duration-300"
            >
              {showTOC ? 'Hide TOC' : 'Show TOC'}
            </button>
            <button
              onClick={handleHighlight}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300"
            >
              Highlight
            </button>
          </div>
        </div>
        
        <div className="flex">
          {/* Table of Contents */}
          {showTOC && (
            <div className="w-1/4 pr-6">
              <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
                <h2 className="text-xl font-semibold mb-4">Table of Contents</h2>
                <ul>
                  {toc.map((item, index) => (
                    <li key={index} className={`mb-2 ${item.level > 1 ? 'ml-4' : ''}`}>
                      <a 
                        href={`#header-${index}`} 
                        className="text-blue-500 hover:text-blue-700"
                        onClick={(e) => {
                          e.preventDefault();
                          // In a real app, we would scroll to the header
                          // For now, we'll just go to the page where the header is
                          // This is simplified
                        }}
                      >
                        {item.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          {/* Book Content */}
          <div className={`${showTOC ? 'w-3/4' : 'w-full'}`}>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <button 
                    onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-1 px-3 rounded-md transition-colors duration-300"
                  >
                    A-
                  </button>
                  <button 
                    onClick={() => setFontSize(Math.min(24, fontSize + 2))}
                    className="ml-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-1 px-3 rounded-md transition-colors duration-300"
                  >
                    A+
                  </button>
                </div>
                <div className="text-gray-600">
                  Page {currentPage + 1} of {pages.length}
                </div>
              </div>
              
              <div className="flex justify-center">
                <div 
                  className="book-container"
                  style={{ 
                    display: 'flex',
                    justifyContent: 'center',
                    perspective: '2000px'
                  }}
                >
                  {/* Left Page */}
                  {currentPage > 0 && (
                    <div 
                      className="book-page"
                      style={{
                        width: `${PAGE_WIDTH}px`,
                        height: `${PAGE_HEIGHT}px`,
                        padding: '20px',
                        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                        backgroundColor: '#f9f9f9',
                        transform: 'rotateY(5deg)',
                        transformStyle: 'preserve-3d',
                        marginRight: '10px',
                        fontSize: `${fontSize}px`,
                        lineHeight: '1.6',
                        overflow: 'hidden'
                      }}
                    >
                      <div 
                        dangerouslySetInnerHTML={{ __html: pages[currentPage - 1] }}
                        style={{ height: '100%', overflow: 'hidden' }}
                      />
                    </div>
                  )}
                  
                  {/* Right Page (Current) */}
                  <div 
                    className="book-page"
                    style={{
                      width: `${PAGE_WIDTH}px`,
                      height: `${PAGE_HEIGHT}px`,
                      padding: '20px',
                      boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                      backgroundColor: '#ffffff',
                      transform: 'rotateY(-5deg)',
                      transformStyle: 'preserve-3d',
                      marginLeft: '10px',
                      fontSize: `${fontSize}px`,
                      lineHeight: '1.6',
                      overflow: 'hidden'
                    }}
                  >
                    <div 
                      dangerouslySetInnerHTML={{ __html: pages[currentPage] }}
                      style={{ height: '100%', overflow: 'hidden' }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between mt-6">
                <button
                  onClick={goToPrevPage}
                  disabled={currentPage === 0}
                  className={`py-2 px-6 rounded-md transition-colors duration-300 ${currentPage === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
                >
                  Previous
                </button>
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === pages.length - 1}
                  className={`py-2 px-6 rounded-md transition-colors duration-300 ${currentPage === pages.length - 1 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EBookReadingPage;