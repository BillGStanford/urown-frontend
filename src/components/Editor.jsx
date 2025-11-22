// src/components/Editor.jsx
import React, { useEffect, useRef, useState } from 'react';

const Editor = ({ 
  content, 
  onChange, 
  placeholder = "Start writing your chapter...",
  autoFocus = false 
}) => {
  const editorRef = useRef(null);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content || '';
    }
  }, [content]);

  useEffect(() => {
    if (autoFocus && editorRef.current) {
      editorRef.current.focus();
    }
  }, [autoFocus]);

  const handleInput = (e) => {
    const html = e.target.innerHTML;
    onChange(html);
    
    // Update word and character count
    const text = e.target.innerText || '';
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    setWordCount(words.length);
    setCharCount(text.length);
  };

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    // Ctrl/Cmd + B for bold
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      execCommand('bold');
    }
    // Ctrl/Cmd + I for italic
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault();
      execCommand('italic');
    }
    // Ctrl/Cmd + U for underline
    if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
      e.preventDefault();
      execCommand('underline');
    }
  };

  return (
    <div className="editor-container">
      <div className="editor-toolbar bg-gray-100 border-b border-gray-300 p-2 flex flex-wrap gap-2 sticky top-0 z-10">
        {/* Text Formatting */}
        <button
          onClick={() => execCommand('bold')}
          className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 font-bold"
          title="Bold (Ctrl+B)"
        >
          B
        </button>
        <button
          onClick={() => execCommand('italic')}
          className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 italic"
          title="Italic (Ctrl+I)"
        >
          I
        </button>
        <button
          onClick={() => execCommand('underline')}
          className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 underline"
          title="Underline (Ctrl+U)"
        >
          U
        </button>
        
        <div className="w-px bg-gray-300" />
        
        {/* Headings */}
        <button
          onClick={() => execCommand('formatBlock', 'h1')}
          className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-lg font-bold"
          title="Heading 1"
        >
          H1
        </button>
        <button
          onClick={() => execCommand('formatBlock', 'h2')}
          className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-base font-bold"
          title="Heading 2"
        >
          H2
        </button>
        <button
          onClick={() => execCommand('formatBlock', 'h3')}
          className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm font-bold"
          title="Heading 3"
        >
          H3
        </button>
        
        <div className="w-px bg-gray-300" />
        
        {/* Lists */}
        <button
          onClick={() => execCommand('insertUnorderedList')}
          className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
          title="Bullet List"
        >
          • List
        </button>
        <button
          onClick={() => execCommand('insertOrderedList')}
          className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
          title="Numbered List"
        >
          1. List
        </button>
        
        <div className="w-px bg-gray-300" />
        
        {/* Quote */}
        <button
          onClick={() => execCommand('formatBlock', 'blockquote')}
          className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
          title="Block Quote"
        >
          " Quote
        </button>
        
        {/* Code */}
        <button
          onClick={() => execCommand('formatBlock', 'pre')}
          className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 font-mono"
          title="Code Block"
        >
          {'</>'}
        </button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        className="editor-content p-6 min-h-[500px] focus:outline-none prose max-w-none"
        style={{
          fontFamily: 'Georgia, serif',
          fontSize: '18px',
          lineHeight: '1.8'
        }}
        placeholder={placeholder}
      />

      <div className="editor-footer bg-gray-50 border-t border-gray-300 p-2 text-sm text-gray-600 flex justify-between">
        <span>Words: {wordCount}</span>
        <span>Characters: {charCount}</span>
      </div>

      <style jsx>{`
        .editor-content:empty:before {
          content: attr(placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        
        .editor-content h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.67em 0;
        }
        
        .editor-content h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.75em 0;
        }
        
        .editor-content h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin: 0.83em 0;
        }
        
        .editor-content blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #6b7280;
        }
        
        .editor-content pre {
          background: #f3f4f6;
          padding: 1rem;
          border-radius: 0.375rem;
          overflow-x: auto;
          font-family: 'Courier New', monospace;
        }
        
        .editor-content ul, .editor-content ol {
          padding-left: 2rem;
          margin: 1rem 0;
        }
        
        .editor-content li {
          margin: 0.5rem 0;
        }
      `}</style>
    </div>
  );
};

export default Editor;