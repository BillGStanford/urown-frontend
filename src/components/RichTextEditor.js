// components/RichTextEditor.js (Updated)
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  List, 
  ListOrdered,
  Quote,
  Link,
  Code,
  Type,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Minus,
  ChevronDown,
  Eraser
} from 'lucide-react';

const RichTextEditor = ({ 
  value, 
  onChange, 
  placeholder, 
  disabled = false,
  maxLength = 50000,
  minHeight = '500px',
  darkMode = false
}) => {
  const editorRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [charCount, setCharCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [showFormatDropdown, setShowFormatDropdown] = useState(false);
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    justifyLeft: false,
    justifyCenter: false,
    justifyRight: false,
    justifyFull: false,
    insertUnorderedList: false,
    insertOrderedList: false,
    formatBlock: 'p'
  });

  // Initialize editor with content
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      // Clean the HTML before setting it
      const cleanHTML = cleanHTML(value);
      editorRef.current.innerHTML = cleanHTML;
      updateCounts();
    }
  }, [value]);

  // Clean HTML function to remove unwanted tags and formatting
  const cleanHTML = (html) => {
    if (!html) return '';
    
    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Remove all div and br tags that are just for spacing
    const divs = tempDiv.querySelectorAll('div');
    divs.forEach(div => {
      // Check if div is empty or only contains whitespace
      if (!div.textContent.trim()) {
        div.remove();
      } else {
        // Convert div to p if it's not already a block element
        const p = document.createElement('p');
        while (div.firstChild) {
          p.appendChild(div.firstChild);
        }
        div.parentNode.replaceChild(p, div);
      }
    });
    
    // Remove excessive br tags
    const brs = tempDiv.querySelectorAll('br');
    brs.forEach(br => {
      // Remove br if it's followed by another br or a block element
      const nextSibling = br.nextSibling;
      if (nextSibling && (nextSibling.nodeName === 'BR' || ['P', 'DIV', 'H1', 'H2', 'H3', 'BLOCKQUOTE'].includes(nextSibling.nodeName))) {
        br.remove();
      }
    });
    
    return tempDiv.innerHTML;
  };

  // Update character and word counts
  const updateCounts = useCallback(() => {
    if (!editorRef.current) return;
    
    const text = editorRef.current.innerText || '';
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    setCharCount(text.length);
    setWordCount(words.length);
  }, []);

  // Save to history for undo/redo
  const saveToHistory = useCallback(() => {
    if (!editorRef.current) return;
    
    const content = editorRef.current.innerHTML;
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(content);
    
    // Limit history to 50 states
    if (newHistory.length > 50) {
      newHistory.shift();
    }
    
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  // Handle content change
  const handleContentChange = useCallback(() => {
    if (!editorRef.current) return;
    
    // Get the HTML content and clean it
    let content = editorRef.current.innerHTML;
    content = cleanHTML(content);
    
    // Update the editor with cleaned content
    if (content !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content;
    }
    
    onChange(content);
    updateCounts();
    saveToHistory();
    updateActiveFormats();
  }, [onChange, updateCounts, saveToHistory, cleanHTML]);

  // Update active formats
  const updateActiveFormats = useCallback(() => {
    if (!editorRef.current) return;
    
    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strikethrough: document.queryCommandState('strikeThrough'),
      justifyLeft: document.queryCommandState('justifyLeft'),
      justifyCenter: document.queryCommandState('justifyCenter'),
      justifyRight: document.queryCommandState('justifyRight'),
      justifyFull: document.queryCommandState('justifyFull'),
      insertUnorderedList: document.queryCommandState('insertUnorderedList'),
      insertOrderedList: document.queryCommandState('insertOrderedList'),
      formatBlock: document.queryCommandValue('formatBlock')
    });
  }, []);

  // Execute command
  const execCommand = useCallback((command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
    handleContentChange();
  }, [handleContentChange]);

  // Format text
  const formatText = useCallback((command, value = null) => {
    execCommand(command, value);
  }, [execCommand]);

  // Insert link
  const insertLink = useCallback(() => {
    if (!linkUrl) return;
    
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString() || linkText;
      
      const linkElement = document.createElement('a');
      linkElement.href = linkUrl;
      linkElement.target = '_blank';
      linkElement.rel = 'noopener noreferrer';
      linkElement.textContent = selectedText;
      
      range.deleteContents();
      range.insertNode(linkElement);
      
      // Clear selection
      selection.removeAllRanges();
      
      handleContentChange();
      setShowLinkModal(false);
      setLinkUrl('');
      setLinkText('');
    }
  }, [linkUrl, linkText, handleContentChange]);

  // Insert horizontal rule
  const insertHorizontalRule = useCallback(() => {
    const hr = document.createElement('hr');
    editorRef.current.appendChild(hr);
    handleContentChange();
  }, [handleContentChange]);

  // Clear formatting
  const clearFormatting = useCallback(() => {
    execCommand('removeFormat');
    execCommand('unlink');
  }, [execCommand]);

  // Undo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      editorRef.current.innerHTML = history[newIndex];
      handleContentChange();
    }
  }, [history, historyIndex, handleContentChange]);

  // Redo
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      editorRef.current.innerHTML = history[newIndex];
      handleContentChange();
    }
  }, [history, historyIndex, handleContentChange]);

  // Handle paste to strip formatting
  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    handleContentChange();
  }, [handleContentChange]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          formatText('bold');
          break;
        case 'i':
          e.preventDefault();
          formatText('italic');
          break;
        case 'u':
          e.preventDefault();
          formatText('underline');
          break;
        case 'k':
          e.preventDefault();
          setShowLinkModal(true);
          break;
        case 'z':
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
          break;
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertText', false, '    ');
      handleContentChange();
    }
  }, [formatText, undo, redo, handleContentChange]);

  // Initialize history on mount
  useEffect(() => {
    if (editorRef.current && history.length === 0) {
      setHistory([editorRef.current.innerHTML]);
      setHistoryIndex(0);
    }
  }, [history.length]);

  // Update active formats when editor is focused
  useEffect(() => {
    if (isFocused) {
      updateActiveFormats();
      
      const handleSelectionChange = () => {
        updateActiveFormats();
      };
      
      document.addEventListener('selectionchange', handleSelectionChange);
      
      return () => {
        document.removeEventListener('selectionchange', handleSelectionChange);
      };
    }
  }, [isFocused, updateActiveFormats]);

  return (
    <div className={`rich-text-editor ${darkMode ? 'dark' : ''}`}>
      <div className={`flex flex-col h-full ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} border rounded-lg overflow-hidden transition-all duration-200 ${isFocused ? 'ring-2 ring-blue-500' : ''}`}>
        {/* Toolbar */}
        <div className={`toolbar flex flex-wrap items-center p-2 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} border-b`}>
          {/* Undo/Redo */}
          <div className="toolbar-group flex items-center mr-2 mb-1">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className={`p-2 rounded transition-all duration-200 ${historyIndex <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              title="Undo (Ctrl+Z)"
            >
              <Undo size={18} />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className={`p-2 rounded transition-all duration-200 ${historyIndex >= history.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              title="Redo (Ctrl+Shift+Z)"
            >
              <Redo size={18} />
            </button>
          </div>

          <div className={`h-8 w-px ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} mx-1 mb-1`}></div>

          {/* Text Formatting */}
          <div className="toolbar-group flex items-center mr-2 mb-1">
            <button
              onClick={() => formatText('bold')}
              className={`p-2 rounded transition-all duration-200 ${activeFormats.bold ? 'bg-blue-200 dark:bg-blue-800 text-blue-600 dark:text-blue-300' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              title="Bold (Ctrl+B)"
            >
              <Bold size={18} />
            </button>
            <button
              onClick={() => formatText('italic')}
              className={`p-2 rounded transition-all duration-200 ${activeFormats.italic ? 'bg-blue-200 dark:bg-blue-800 text-blue-600 dark:text-blue-300' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              title="Italic (Ctrl+I)"
            >
              <Italic size={18} />
            </button>
            <button
              onClick={() => formatText('underline')}
              className={`p-2 rounded transition-all duration-200 ${activeFormats.underline ? 'bg-blue-200 dark:bg-blue-800 text-blue-600 dark:text-blue-300' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              title="Underline (Ctrl+U)"
            >
              <Underline size={18} />
            </button>
            <button
              onClick={() => formatText('strikeThrough')}
              className={`p-2 rounded transition-all duration-200 ${activeFormats.strikethrough ? 'bg-blue-200 dark:bg-blue-800 text-blue-600 dark:text-blue-300' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              title="Strikethrough"
            >
              <Strikethrough size={18} />
            </button>
          </div>

          <div className={`h-8 w-px ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} mx-1 mb-1`}></div>

          {/* Format Dropdown */}
          <div className="toolbar-group flex items-center mr-2 mb-1 relative">
            <button
              onClick={() => setShowFormatDropdown(!showFormatDropdown)}
              className={`p-2 rounded transition-all duration-200 flex items-center ${showFormatDropdown ? 'bg-blue-200 dark:bg-blue-800 text-blue-600 dark:text-blue-300' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              title="Text Format"
            >
              <Type size={18} />
              <ChevronDown size={14} className="ml-1" />
            </button>
            
            {showFormatDropdown && (
              <div className={`absolute top-full left-0 mt-1 p-1 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} border rounded shadow-lg z-10 min-w-[150px]`}>
                <button
                  onClick={() => {
                    formatText('formatBlock', '<p>');
                    setShowFormatDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors ${activeFormats.formatBlock === 'p' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : ''}`}
                >
                  Paragraph
                </button>
                <button
                  onClick={() => {
                    formatText('formatBlock', '<h1>');
                    setShowFormatDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors ${activeFormats.formatBlock === 'h1' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : ''}`}
                >
                  Heading 1
                </button>
                <button
                  onClick={() => {
                    formatText('formatBlock', '<h2>');
                    setShowFormatDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors ${activeFormats.formatBlock === 'h2' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : ''}`}
                >
                  Heading 2
                </button>
                <button
                  onClick={() => {
                    formatText('formatBlock', '<h3>');
                    setShowFormatDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors ${activeFormats.formatBlock === 'h3' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : ''}`}
                >
                  Heading 3
                </button>
                <button
                  onClick={() => {
                    formatText('formatBlock', '<blockquote>');
                    setShowFormatDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors ${activeFormats.formatBlock === 'blockquote' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : ''}`}
                >
                  Blockquote
                </button>
                <button
                  onClick={() => {
                    formatText('formatBlock', '<pre>');
                    setShowFormatDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors ${activeFormats.formatBlock === 'pre' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : ''}`}
                >
                  Code
                </button>
              </div>
            )}
          </div>

          <div className={`h-8 w-px ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} mx-1 mb-1`}></div>

          {/* Text Alignment */}
          <div className="toolbar-group flex items-center mr-2 mb-1">
            <button
              onClick={() => formatText('justifyLeft')}
              className={`p-2 rounded transition-all duration-200 ${activeFormats.justifyLeft ? 'bg-blue-200 dark:bg-blue-800 text-blue-600 dark:text-blue-300' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              title="Align Left"
            >
              <AlignLeft size={18} />
            </button>
            <button
              onClick={() => formatText('justifyCenter')}
              className={`p-2 rounded transition-all duration-200 ${activeFormats.justifyCenter ? 'bg-blue-200 dark:bg-blue-800 text-blue-600 dark:text-blue-300' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              title="Align Center"
            >
              <AlignCenter size={18} />
            </button>
            <button
              onClick={() => formatText('justifyRight')}
              className={`p-2 rounded transition-all duration-200 ${activeFormats.justifyRight ? 'bg-blue-200 dark:bg-blue-800 text-blue-600 dark:text-blue-300' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              title="Align Right"
            >
              <AlignRight size={18} />
            </button>
            <button
              onClick={() => formatText('justifyFull')}
              className={`p-2 rounded transition-all duration-200 ${activeFormats.justifyFull ? 'bg-blue-200 dark:bg-blue-800 text-blue-600 dark:text-blue-300' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              title="Justify"
            >
              <AlignJustify size={18} />
            </button>
          </div>

          <div className={`h-8 w-px ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} mx-1 mb-1`}></div>

          {/* Lists */}
          <div className="toolbar-group flex items-center mr-2 mb-1">
            <button
              onClick={() => formatText('insertUnorderedList')}
              className={`p-2 rounded transition-all duration-200 ${activeFormats.insertUnorderedList ? 'bg-blue-200 dark:bg-blue-800 text-blue-600 dark:text-blue-300' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              title="Unordered List"
            >
              <List size={18} />
            </button>
            <button
              onClick={() => formatText('insertOrderedList')}
              className={`p-2 rounded transition-all duration-200 ${activeFormats.insertOrderedList ? 'bg-blue-200 dark:bg-blue-800 text-blue-600 dark:text-blue-300' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              title="Ordered List"
            >
              <ListOrdered size={18} />
            </button>
          </div>

          <div className={`h-8 w-px ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} mx-1 mb-1`}></div>

          {/* Other Elements */}
          <div className="toolbar-group flex items-center mr-2 mb-1">
            <button
              onClick={() => formatText('formatBlock', '<blockquote>')}
              className={`p-2 rounded transition-all duration-200 ${activeFormats.formatBlock === 'blockquote' ? 'bg-blue-200 dark:bg-blue-800 text-blue-600 dark:text-blue-300' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              title="Quote"
            >
              <Quote size={18} />
            </button>
            <button
              onClick={insertHorizontalRule}
              className="p-2 rounded transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-700"
              title="Horizontal Rule"
            >
              <Minus size={18} />
            </button>
          </div>

          <div className={`h-8 w-px ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} mx-1 mb-1`}></div>

          {/* Link */}
          <div className="toolbar-group flex items-center mr-2 mb-1">
            <button
              onClick={() => setShowLinkModal(true)}
              className="p-2 rounded transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-700"
              title="Insert Link (Ctrl+K)"
            >
              <Link size={18} />
            </button>
          </div>

          <div className={`h-8 w-px ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} mx-1 mb-1`}></div>

          {/* Clear Formatting */}
          <div className="toolbar-group flex items-center mr-2 mb-1">
            <button
              onClick={clearFormatting}
              className="p-2 rounded transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-700"
              title="Clear Formatting"
            >
              <Eraser size={18} />
            </button>
          </div>
        </div>

        {/* Editor */}
        <div 
          className={`editor-container flex-1 overflow-auto ${darkMode ? 'bg-gray-900' : 'bg-white'}`}
          style={{ minHeight }}
        >
          <div
            ref={editorRef}
            contentEditable={!disabled}
            onInput={handleContentChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`editor-content p-6 outline-none ${darkMode ? 'text-gray-200' : 'text-gray-800'} prose prose-lg max-w-none`}
            style={{ 
              minHeight: '400px',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              fontWeight: 'normal', // Ensure default font weight is normal
              fontFamily: 'inherit' // Use inherited font family
            }}
            suppressContentEditableWarning={true}
          />
          {/* Custom placeholder */}
          {!value && !isFocused && (
            <div 
              className={`absolute top-6 left-6 pointer-events-none ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}
              style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
            >
              {placeholder}
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className={`status-bar flex justify-between items-center px-4 py-2 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} border-t text-sm`}>
          <div className="flex items-center space-x-4">
            <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Words: {wordCount}
            </span>
            <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Characters: {charCount}/{maxLength}
            </span>
            {charCount >= maxLength * 0.9 && (
              <span className="text-red-500 font-medium">
                {charCount >= maxLength ? 'Limit reached' : 'Approaching limit'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg p-6 w-96 max-w-full mx-4 shadow-xl`}>
            <h3 className="text-lg font-bold mb-4">Insert Link</h3>
            
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>URL</label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className={`w-full p-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
                autoFocus
              />
            </div>
            
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Text (optional)</label>
              <input
                type="text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Link text"
                className={`w-full p-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowLinkModal(false);
                  setLinkUrl('');
                  setLinkText('');
                }}
                className={`px-4 py-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} rounded transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={insertLink}
                disabled={!linkUrl}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .editor-container {
          position: relative;
        }
        
        .editor-content:focus {
          outline: none;
        }
        
        .editor-content a {
          color: #3B82F6;
          text-decoration: underline;
        }
        
        .editor-content blockquote {
          border-left: 4px solid #D1D5DB;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: ${darkMode ? '#D1D5DB' : '#6B7280'};
        }
        
        .editor-content pre {
          background-color: ${darkMode ? '#374151' : '#F3F4F6'};
          padding: 0.75rem;
          border-radius: 0.375rem;
          font-family: monospace;
          overflow-x: auto;
        }
        
        .editor-content hr {
          border: none;
          border-top: 1px solid ${darkMode ? '#4B5563' : '#E5E7EB'};
          margin: 1.5rem 0;
        }
        
        .editor-content h1, .editor-content h2, .editor-content h3 {
          font-weight: bold;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        
        .editor-content h1 {
          font-size: 2.25rem;
          line-height: 2.5rem;
        }
        
        .editor-content h2 {
          font-size: 1.875rem;
          line-height: 2.25rem;
        }
        
        .editor-content h3 {
          font-size: 1.5rem;
          line-height: 2rem;
        }
        
        .editor-content ul, .editor-content ol {
          margin-left: 1.5rem;
          margin-bottom: 1rem;
        }
        
        .editor-content li {
          margin-bottom: 0.25rem;
        }
        
        /* Ensure normal font weight for paragraphs */
        .editor-content p {
          font-weight: normal;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;