import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Bold, Italic, Quote, Link as LinkIcon, Image, Type, 
  Heading1, Heading2, Heading3, Upload, Save, Eye, 
  ArrowLeft, Plus, Trash2, ExternalLink, FileText, 
  AlignLeft, AlignCenter, AlignRight, List, ListOrdered,
  Underline, Code, Palette, Moon, Sun, Undo, Redo,
  Download, Share2, Settings, BookOpen, Target
} from 'lucide-react';

const WritersPage = ({ user, logout }) => {
  const navigate = useNavigate();
  const [article, setArticle] = useState({
    title: '',
    subtitle: '',
    category: 'TECHNOLOGY',
    tags: [],
    featuredImage: null,
    content: '',
    citations: [],
    links: [],
    excerpt: '',
    status: 'draft',
    readingTime: 0,
    lastSaved: null
  });
  
  const [editorState, setEditorState] = useState({
    selectedText: '',
    showFormatting: false,
    currentSelection: null,
    undoStack: [],
    redoStack: [],
    isDarkMode: false,
    fontSize: 'medium',
    fontFamily: 'serif',
    showPreview: false,
    isFullscreen: false
  });
  
  const [modals, setModals] = useState({
    imageUpload: null,
    linkDialog: null,
    citationDialog: false,
    settingsDialog: false,
    publishDialog: false
  });
  
  const [currentInputs, setCurrentInputs] = useState({
    link: { text: '', url: '', title: '' },
    citation: { text: '', source: '', url: '', page: '' },
    tag: ''
  });
  
  const [wordCount, setWordCount] = useState(0);
  const [autoSave, setAutoSave] = useState(true);
  const contentRef = useRef(null);
  const fileInputRef = useRef(null);
  const autoSaveInterval = useRef(null);
  
  const categories = [
    'TECHNOLOGY', 'POLITICS', 'SCIENCE', 'HEALTH', 'ENVIRONMENT', 
    'FINANCE', 'SPORTS', 'CULTURE', 'LIFESTYLE', 'BUSINESS',
    'EDUCATION', 'ENTERTAINMENT', 'TRAVEL', 'OPINION', 'BREAKING'
  ];

  const fontSizes = {
    small: { editor: 'text-base', preview: 'text-sm' },
    medium: { editor: 'text-lg', preview: 'text-base' },
    large: { editor: 'text-xl', preview: 'text-lg' }
  };

  const fontFamilies = {
    serif: 'font-serif',
    'sans-serif': 'font-sans',
    mono: 'font-mono'
  };

  useEffect(() => {
    if (autoSave) {
      autoSaveInterval.current = setInterval(() => {
        saveArticle(true);
      }, 30000);
    }
    
    return () => {
      if (autoSaveInterval.current) {
        clearInterval(autoSaveInterval.current);
      }
    };
  }, [autoSave, article]);

  useEffect(() => {
    if (contentRef.current) {
      const text = contentRef.current.innerText || '';
      const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
      setWordCount(words);
      
      const readingTime = Math.ceil(words / 200);
      setArticle(prev => ({ ...prev, readingTime }));
    }
  }, [article.content]);

  useEffect(() => {
    const handleKeyboard = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'b':
            e.preventDefault();
            applyFormatting('bold');
            break;
          case 'i':
            e.preventDefault();
            applyFormatting('italic');
            break;
          case 'u':
            e.preventDefault();
            applyFormatting('underline');
            break;
          case 's':
            e.preventDefault();
            saveArticle();
            break;
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 'Enter':
            e.preventDefault();
            publishArticle();
            break;
          case 'p':
            e.preventDefault();
            togglePreview();
            break;
          case 'f':
            e.preventDefault();
            toggleFullscreen();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  }, []);

  const saveToUndoStack = () => {
    if (contentRef.current) {
      setEditorState(prev => ({
        ...prev,
        undoStack: [...prev.undoStack.slice(-19), contentRef.current.innerHTML],
        redoStack: []
      }));
    }
  };

  const undo = () => {
    if (editorState.undoStack.length > 0) {
      const lastState = editorState.undoStack[editorState.undoStack.length - 1];
      const currentState = contentRef.current.innerHTML;
      
      contentRef.current.innerHTML = lastState;
      setEditorState(prev => ({
        ...prev,
        undoStack: prev.undoStack.slice(0, -1),
        redoStack: [...prev.redoStack, currentState]
      }));
      
      handleContentChange();
    }
  };

  const redo = () => {
    if (editorState.redoStack.length > 0) {
      const nextState = editorState.redoStack[editorState.redoStack.length - 1];
      const currentState = contentRef.current.innerHTML;
      
      contentRef.current.innerHTML = nextState;
      setEditorState(prev => ({
        ...prev,
        redoStack: prev.redoStack.slice(0, -1),
        undoStack: [...prev.undoStack, currentState]
      }));
      
      handleContentChange();
    }
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection.toString();
    
    setEditorState(prev => ({
      ...prev,
      selectedText: text,
      showFormatting: text.length > 0,
      currentSelection: selection.rangeCount > 0 ? selection.getRangeAt(0) : null
    }));
  };

  const applyFormatting = (command, value = null) => {
    saveToUndoStack();
    document.execCommand(command, false, value);
    contentRef.current.focus();
    handleContentChange();
  };

  const insertElement = (tagName, className = '', content = '') => {
    saveToUndoStack();
    const selection = window.getSelection();
    
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const element = document.createElement(tagName);
      
      if (className) element.className = className;
      element.innerHTML = content || (selection.toString() || `New ${tagName}`);
      
      range.deleteContents();
      range.insertNode(element);
      
      const newRange = document.createRange();
      newRange.selectNodeContents(element);
      newRange.collapse(false);
      selection.removeAllRanges();
      selection.addRange(newRange);
    }
    
    handleContentChange();
  };

  const insertHeading = (level) => {
    const classes = {
      1: 'text-4xl md:text-5xl font-black mb-6 mt-8 leading-tight tracking-tight',
      2: 'text-3xl md:text-4xl font-black mb-4 mt-6 leading-tight',
      3: 'text-2xl md:text-3xl font-black mb-3 mt-4 leading-snug'
    };
    
    insertElement(`h${level}`, classes[level], `Heading ${level}`);
  };

  const insertQuote = () => {
    insertElement('blockquote', 
      'border-l-4 border-black pl-6 my-6 italic text-xl font-medium bg-gray-50 p-4 relative',
      'Enter your quote here...'
    );
  };

  const insertCodeBlock = () => {
    insertElement('pre', 
      'bg-gray-900 text-green-400 p-4 rounded border-2 border-black my-4 overflow-x-auto font-mono text-sm',
      '<code>// Your code here</code>'
    );
  };

  const insertDivider = () => {
    saveToUndoStack();
    const selection = window.getSelection();
    
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const divider = document.createElement('hr');
      divider.className = 'border-t-4 border-black my-8';
      
      range.insertNode(divider);
    }
    
    handleContentChange();
  };

  const applyTextAlign = (alignment) => {
    saveToUndoStack();
    const alignments = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right'
    };
    
    applyFormatting('justify' + alignment.charAt(0).toUpperCase() + alignment.slice(1));
  };

  const insertImage = (src, alt = '', caption = '') => {
    saveToUndoStack();
    const selection = window.getSelection();
    
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const container = document.createElement('figure');
      container.className = 'my-8 text-center';
      
      const img = document.createElement('img');
      img.src = src;
      img.alt = alt;
      img.className = 'w-full max-w-4xl mx-auto border-2 border-black rounded shadow-lg';
      
      container.appendChild(img);
      
      if (caption) {
        const figcaption = document.createElement('figcaption');
        figcaption.className = 'mt-2 text-sm font-medium text-gray-600 italic';
        figcaption.textContent = caption;
        container.appendChild(figcaption);
      }
      
      range.insertNode(container);
    }
    
    closeModal('imageUpload');
    handleContentChange();
  };

  const insertLink = () => {
    if (currentInputs.link.text && currentInputs.link.url) {
      saveToUndoStack();
      const selection = window.getSelection();
      
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const link = document.createElement('a');
        link.href = currentInputs.link.url;
        link.textContent = currentInputs.link.text;
        link.title = currentInputs.link.title;
        link.className = 'text-blue-600 underline font-semibold hover:text-blue-800 transition-colors';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        
        range.deleteContents();
        range.insertNode(link);
      }
    }
    
    resetCurrentInputs('link');
    closeModal('linkDialog');
    handleContentChange();
  };

  const addCitation = () => {
    if (currentInputs.citation.text && currentInputs.citation.source) {
      setArticle(prev => ({
        ...prev,
        citations: [...prev.citations, { 
          ...currentInputs.citation, 
          id: Date.now(),
          timestamp: new Date().toISOString()
        }]
      }));
    }
    
    resetCurrentInputs('citation');
    closeModal('citationDialog');
  };

  const addReferenceLink = () => {
    if (currentInputs.link.text && currentInputs.link.url) {
      setArticle(prev => ({
        ...prev,
        links: [...prev.links, { 
          ...currentInputs.link, 
          id: Date.now(),
          timestamp: new Date().toISOString()
        }]
      }));
    }
    
    resetCurrentInputs('link');
    closeModal('linkDialog');
  };

  const addTag = () => {
    if (currentInputs.tag && !article.tags.includes(currentInputs.tag)) {
      setArticle(prev => ({
        ...prev,
        tags: [...prev.tags, currentInputs.tag]
      }));
      setCurrentInputs(prev => ({ ...prev, tag: '' }));
    }
  };

  const removeTag = (tagToRemove) => {
    setArticle(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const removeCitation = (id) => {
    setArticle(prev => ({
      ...prev,
      citations: prev.citations.filter(citation => citation.id !== id)
    }));
  };

  const removeLink = (id) => {
    setArticle(prev => ({
      ...prev,
      links: prev.links.filter(link => link.id !== id)
    }));
  };

  const handleContentChange = () => {
    if (contentRef.current) {
      setArticle(prev => ({
        ...prev,
        content: contentRef.current.innerHTML
      }));
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        if (modals.imageUpload === 'featured') {
          setArticle(prev => ({ ...prev, featuredImage: file }));
          closeModal('imageUpload');
        } else {
          insertImage(e.target.result, file.name);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const saveArticle = async (isAutoSave = false) => {
    try {
      if (!article.excerpt && contentRef.current) {
        const textContent = contentRef.current.innerText || '';
        const excerpt = textContent.substring(0, 200).trim() + '...';
        setArticle(prev => ({ ...prev, excerpt }));
      }
      
      const savedArticle = {
        ...article,
        lastSaved: new Date().toISOString(),
        content: contentRef.current?.innerHTML || ''
      };
      
      console.log('Saving article:', savedArticle);
      
      if (!isAutoSave) {
        alert('Article saved successfully!');
      }
      
      setArticle(prev => ({ ...prev, lastSaved: new Date().toISOString() }));
      
    } catch (error) {
      console.error('Error saving article:', error);
      if (!isAutoSave) {
        alert('Error saving article. Please try again.');
      }
    }
  };

  const publishArticle = () => {
    setModals(prev => ({ ...prev, publishDialog: true }));
  };

  const confirmPublish = async () => {
    try {
      const formData = new FormData();
      formData.append('title', article.title);
      formData.append('subtitle', article.subtitle);
      formData.append('content', contentRef.current?.innerHTML || '');
      formData.append('category', article.category);
      formData.append('tags', JSON.stringify(article.tags));
      formData.append('excerpt', article.excerpt);
      formData.append('citations', JSON.stringify(article.citations));
      formData.append('links', JSON.stringify(article.links));
      formData.append('status', 'published');
      if (article.featuredImage) {
        formData.append('featuredImage', article.featuredImage);
      }
      
      const response = await fetch('/api/articles/publish', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to publish article');
      }
      
      setArticle(prev => ({ ...prev, status: 'published' }));
      closeModal('publishDialog');
      alert('Article published successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error publishing article:', error);
      alert(`Error publishing article: ${error.message}. Please try again.`);
    }
  };

  const exportArticle = () => {
    const exportData = {
      ...article,
      content: contentRef.current?.innerHTML || '',
      exportDate: new Date().toISOString(),
      wordCount,
      version: '1.0'
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${article.title.replace(/\s+/g, '-').toLowerCase() || 'article'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const togglePreview = () => {
    setEditorState(prev => ({ ...prev, showPreview: !prev.showPreview }));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setEditorState(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }));
  };

  const toggleDarkMode = () => {
    setEditorState(prev => ({ ...prev, isDarkMode: !prev.isDarkMode }));
  };

  const openModal = (modalName, data = null) => {
    setModals(prev => ({ ...prev, [modalName]: data || true }));
  };

  const closeModal = (modalName) => {
    setModals(prev => ({ ...prev, [modalName]: null || false }));
  };

  const resetCurrentInputs = (type) => {
    setCurrentInputs(prev => ({
      ...prev,
      [type]: type === 'link' ? { text: '', url: '', title: '' } : 
              type === 'citation' ? { text: '', source: '', url: '', page: '' } : ''
    }));
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const themeClasses = editorState.isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900';
  const editorThemeClasses = editorState.isDarkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-900 border-black';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${themeClasses}`}>
      <header className={`border-b-4 sticky top-0 z-50 transition-colors ${editorState.isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-black'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center space-x-6">
              <Link 
                to="/" 
                className="flex items-center space-x-2 hover:opacity-70 transition-opacity"
              >
                <ArrowLeft size={20} />
                <span className="font-bold text-sm">BACK</span>
              </Link>
              <div className="text-2xl font-black tracking-tighter">UROWN WRITER</div>
              {article.lastSaved && (
                <div className="text-xs font-medium opacity-60">
                  Last saved: {formatTimestamp(article.lastSaved)}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="hidden md:flex items-center space-x-2 text-sm font-medium">
                <span>{wordCount} words</span>
                <span>•</span>
                <span>{article.readingTime} min read</span>
                <span>•</span>
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  article.status === 'published' ? 'bg-green-100 text-green-800' :
                  article.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {article.status.toUpperCase()}
                </span>
              </div>
              
              <button
                onClick={() => setAutoSave(!autoSave)}
                className={`px-3 py-1 text-xs font-bold border-2 rounded transition-colors ${
                  autoSave 
                    ? 'bg-green-100 border-green-400 text-green-800' 
                    : 'bg-gray-100 border-gray-400 text-gray-800'
                }`}
                title="Toggle auto-save"
              >
                {autoSave ? 'AUTO-SAVE ON' : 'AUTO-SAVE OFF'}
              </button>
              
              <button
                onClick={toggleDarkMode}
                className="p-2 border-2 border-current rounded hover:bg-opacity-10 hover:bg-current transition-colors"
                title="Toggle dark mode"
              >
                {editorState.isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              
              <button
                onClick={togglePreview}
                className={`flex items-center space-x-1 px-3 py-2 font-bold text-sm border-2 rounded transition-colors ${
                  editorState.showPreview 
                    ? 'bg-blue-100 border-blue-400 text-blue-800' 
                    : 'border-current hover:bg-opacity-10 hover:bg-current'
                }`}
              >
                <Eye size={14} />
                <span className="hidden md:inline">PREVIEW</span>
              </button>
              
              <button
                onClick={() => openModal('settingsDialog')}
                className="p-2 border-2 border-current rounded hover:bg-opacity-10 hover:bg-current transition-colors"
                title="Settings"
              >
                <Settings size={16} />
              </button>
              
              <button
                onClick={saveArticle}
                className={`flex items-center space-x-1 px-4 py-2 font-bold text-sm border-2 rounded transition-colors ${
                  editorState.isDarkMode
                    ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'
                    : 'bg-black border-black text-white hover:bg-gray-800'
                }`}
              >
                <Save size={14} />
                <span>SAVE</span>
              </button>
              
              <button
                onClick={publishArticle}
                className="flex items-center space-x-1 px-4 py-2 font-bold text-sm bg-green-600 border-2 border-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                <Target size={14} />
                <span>PUBLISH</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className={`grid ${editorState.showPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 lg:grid-cols-4'} gap-6`}>
          <div className={editorState.showPreview ? 'lg:col-span-1' : 'lg:col-span-3'}>
            <div className={`border-4 rounded-lg p-6 transition-colors ${editorThemeClasses}`}>
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Enter your headline..."
                  value={article.title}
                  onChange={(e) => setArticle(prev => ({ ...prev, title: e.target.value }))}
                  className={`w-full text-3xl md:text-4xl font-black leading-tight tracking-tight border-none outline-none placeholder-opacity-50 mb-4 bg-transparent ${
                    editorState.isDarkMode ? 'placeholder-gray-400' : 'placeholder-gray-500'
                  }`}
                />
                
                <input
                  type="text"
                  placeholder="Add a compelling subtitle..."
                  value={article.subtitle}
                  onChange={(e) => setArticle(prev => ({ ...prev, subtitle: e.target.value }))}
                  className={`w-full text-xl font-medium opacity-80 border-none outline-none placeholder-opacity-50 mb-4 bg-transparent ${
                    editorState.isDarkMode ? 'placeholder-gray-400' : 'placeholder-gray-500'
                  }`}
                />
                
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <select
                    value={article.category}
                    onChange={(e) => setArticle(prev => ({ ...prev, category: e.target.value }))}
                    className={`px-4 py-2 font-bold border-2 rounded transition-colors ${
                      editorState.isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-black border-black text-white'
                    }`}
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  
                  <button
                    onClick={() => openModal('imageUpload', 'featured')}
                    className="flex items-center space-x-2 px-4 py-2 font-bold border-2 border-current rounded hover:bg-opacity-10 hover:bg-current transition-colors"
                  >
                    <Image size={16} />
                    <span>FEATURED IMAGE</span>
                  </button>
                  
                  <button
                    onClick={exportArticle}
                    className="flex items-center space-x-2 px-4 py-2 font-bold border-2 border-current rounded hover:bg-opacity-10 hover:bg-current transition-colors"
                    title="Export article"
                  >
                    <Download size={16} />
                    <span className="hidden md:inline">EXPORT</span>
                  </button>
                </div>

                <div className="mb-4">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {article.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-2 hover:text-red-600 transition-colors"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Add tags..."
                      value={currentInputs.tag}
                      onChange={(e) => setCurrentInputs(prev => ({ ...prev, tag: e.target.value }))}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      className={`flex-1 px-3 py-2 border-2 rounded font-medium bg-transparent ${
                        editorState.isDarkMode ? 'border-gray-600' : 'border-gray-300'
                      }`}
                    />
                    <button
                      onClick={addTag}
                      className="px-4 py-2 bg-blue-600 text-white font-bold border-2 border-blue-600 rounded hover:bg-blue-700 transition-colors"
                    >
                      ADD
                    </button>
                  </div>
                </div>

                {article.featuredImage && (
                  <div className="mb-6">
                    <img 
                      src={URL.createObjectURL(article.featuredImage)} 
                      alt="Featured" 
                      className="w-full max-h-96 object-cover border-2 border-current rounded shadow-lg"
                    />
                    <button
                      onClick={() => setArticle(prev => ({ ...prev, featuredImage: null }))}
                      className="mt-2 text-red-600 font-bold text-sm hover:underline"
                    >
                      Remove Featured Image
                    </button>
                  </div>
                )}
              </div>

              <div className={`border-t-2 border-b-2 py-4 mb-6 ${editorState.isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase mb-2 opacity-60">FORMAT</h4>
                    <div className="flex space-x-1">
                      <button onClick={() => applyFormatting('bold')} className="toolbar-btn" title="Bold (Ctrl+B)">
                        <Bold size={16} />
                      </button>
                      <button onClick={() => applyFormatting('italic')} className="toolbar-btn" title="Italic (Ctrl+I)">
                        <Italic size={16} />
                      </button>
                      <button onClick={() => applyFormatting('underline')} className="toolbar-btn" title="Underline (Ctrl+U)">
                        <Underline size={16} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase mb-2 opacity-60">HEADINGS</h4>
                    <div className="flex space-x-1">
                      <button onClick={() => insertHeading(1)} className="toolbar-btn" title="Heading 1">
                        <Heading1 size={16} />
                      </button>
                      <button onClick={() => insertHeading(2)} className="toolbar-btn" title="Heading 2">
                        <Heading2 size={16} />
                      </button>
                      <button onClick={() => insertHeading(3)} className="toolbar-btn" title="Heading 3">
                        <Heading3 size={16} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase mb-2 opacity-60">ELEMENTS</h4>
                    <div className="flex space-x-1">
                      <button onClick={insertQuote} className="toolbar-btn" title="Quote">
                        <Quote size={16} />
                      </button>
                      <button onClick={() => openModal('imageUpload', 'inline')} className="toolbar-btn" title="Image">
                        <Image size={16} />
                      </button>
                      <button onClick={() => openModal('linkDialog', 'inline')} className="toolbar-btn" title="Link">
                        <LinkIcon size={16} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase mb-2 opacity-60">TOOLS</h4>
                    <div className="flex space-x-1">
                      <button 
                        onClick={undo} 
                        className="toolbar-btn" 
                        title="Undo (Ctrl+Z)"
                        disabled={editorState.undoStack.length === 0}
                      >
                        <Undo size={16} />
                      </button>
                      <button 
                        onClick={redo} 
                        className="toolbar-btn" 
                        title="Redo (Ctrl+Shift+Z)"
                        disabled={editorState.redoStack.length === 0}
                      >
                        <Redo size={16} />
                      </button>
                      <button onClick={insertCodeBlock} className="toolbar-btn" title="Code Block">
                        <Code size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button onClick={() => applyTextAlign('left')} className="toolbar-btn" title="Align Left">
                    <AlignLeft size={16} />
                  </button>
                  <button onClick={() => applyTextAlign('center')} className="toolbar-btn" title="Align Center">
                    <AlignCenter size={16} />
                  </button>
                  <button onClick={() => applyTextAlign('right')} className="toolbar-btn" title="Align Right">
                    <AlignRight size={16} />
                  </button>
                  <button onClick={() => applyFormatting('insertUnorderedList')} className="toolbar-btn" title="Bullet List">
                    <List size={16} />
                  </button>
                  <button onClick={() => applyFormatting('insertOrderedList')} className="toolbar-btn" title="Numbered List">
                    <ListOrdered size={16} />
                  </button>
                  <button onClick={insertDivider} className="toolbar-btn" title="Divider">
                    <span className="font-bold">—</span>
                  </button>
                </div>
              </div>

              <div className="relative">
                <div
                  ref={contentRef}
                  contentEditable
                  onInput={handleContentChange}
                  onMouseUp={handleTextSelection}
                  onKeyUp={handleTextSelection}
                  className={`min-h-96 outline-none leading-relaxed content-editor ${
                    fontSizes[editorState.fontSize].editor
                  } ${fontFamilies[editorState.fontFamily]}`}
                  style={{ 
                    minHeight: '600px',
                    lineHeight: '1.7'
                  }}
                  suppressContentEditableWarning={true}
                >
                  <p className="opacity-50 italic">
                    Start writing your story... Use the toolbar above to format your text, add images, quotes, and more.
                  </p>
                </div>

                {editorState.showFormatting && editorState.selectedText && (
                  <div className="absolute z-10 bg-gray-900 text-white p-2 rounded shadow-lg border-2 border-gray-700 flex space-x-1">
                    <button onClick={() => applyFormatting('bold')} className="p-1 hover:bg-gray-700 rounded">
                      <Bold size={14} />
                    </button>
                    <button onClick={() => applyFormatting('italic')} className="p-1 hover:bg-gray-700 rounded">
                      <Italic size={14} />
                    </button>
                    <button onClick={() => openModal('linkDialog', 'selection')} className="p-1 hover:bg-gray-700 rounded">
                      <LinkIcon size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {editorState.showPreview && (
            <div className="lg:col-span-1">
              <div className={`border-4 rounded-lg p-6 h-full overflow-y-auto ${editorThemeClasses}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-black">PREVIEW</h3>
                  <button
                    onClick={togglePreview}
                    className="text-sm font-bold opacity-60 hover:opacity-100 transition-opacity"
                  >
                    CLOSE
                  </button>
                </div>
                
                <div className={`prose max-w-none ${editorState.isDarkMode ? 'prose-invert' : ''}`}>
                  {article.featuredImage && (
                    <img 
                      src={URL.createObjectURL(article.featuredImage)} 
                      alt="Featured" 
                      className="w-full rounded border-2 border-current mb-6"
                    />
                  )}
                  
                  <div className="mb-2">
                    <span className="bg-current text-white px-2 py-1 text-xs font-bold rounded">
                      {article.category}
                    </span>
                  </div>
                  
                  {article.title && (
                    <h1 className="text-3xl font-black leading-tight mb-4">
                      {article.title}
                    </h1>
                  )}
                  
                  {article.subtitle && (
                    <h2 className="text-xl font-medium opacity-80 mb-6">
                      {article.subtitle}
                    </h2>
                  )}
                  
                  {article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-6">
                      {article.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div 
                    dangerouslySetInnerHTML={{ __html: article.content }}
                    className={`${fontSizes[editorState.fontSize].preview} ${fontFamilies[editorState.fontFamily]}`}
                  />
                </div>
              </div>
            </div>
          )}

          {!editorState.showPreview && (
            <div className="space-y-6">
              <div className={`border-4 rounded-lg p-6 ${editorThemeClasses}`}>
                <h3 className="text-xl font-black mb-4 flex items-center space-x-2">
                  <BookOpen size={20} />
                  <span>STATS</span>
                </h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-black">{wordCount}</div>
                    <div className="text-xs font-bold opacity-60">WORDS</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black">{article.readingTime}</div>
                    <div className="text-xs font-bold opacity-60">MIN READ</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black">{article.citations.length}</div>
                    <div className="text-xs font-bold opacity-60">CITATIONS</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black">{article.links.length}</div>
                    <div className="text-xs font-bold opacity-60">LINKS</div>
                  </div>
                </div>
              </div>

              <div className={`border-4 rounded-lg p-6 ${editorThemeClasses}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-black">CITATIONS</h3>
                  <button
                    onClick={() => openModal('citationDialog')}
                    className="p-2 bg-current text-white rounded hover:opacity-80 transition-opacity"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {article.citations.map((citation, index) => (
                    <div key={citation.id} className={`border-2 rounded p-4 ${editorState.isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-sm bg-current text-white px-2 py-1 rounded">[{index + 1}]</span>
                        <button
                          onClick={() => removeCitation(citation.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <p className="text-sm mb-2 leading-relaxed">{citation.text}</p>
                      <p className="text-xs font-bold opacity-80 mb-1">{citation.source}</p>
                      {citation.page && (
                        <p className="text-xs opacity-60 mb-2">Page {citation.page}</p>
                      )}
                      {citation.url && (
                        <a 
                          href={citation.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline flex items-center space-x-1"
                        >
                          <ExternalLink size={12} />
                          <span>View Source</span>
                        </a>
                      )}
                    </div>
                  ))}
                  
                  {article.citations.length === 0 && (
                    <p className="opacity-50 text-sm text-center py-8">
                      No citations added yet. Click + to add your first citation.
                    </p>
                  )}
                </div>
              </div>

              <div className={`border-4 rounded-lg p-6 ${editorThemeClasses}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-black">LINKS</h3>
                  <button
                    onClick={() => openModal('linkDialog', 'reference')}
                    className="p-2 bg-current text-white rounded hover:opacity-80 transition-opacity"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {article.links.map((link) => (
                    <div key={link.id} className={`border-2 rounded p-3 ${editorState.isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-sm">{link.text}</span>
                        <button
                          onClick={() => removeLink(link.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      {link.title && (
                        <p className="text-xs opacity-80 mb-1">{link.title}</p>
                      )}
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center space-x-1"
                      >
                        <ExternalLink size={12} />
                        <span className="break-all">{link.url}</span>
                      </a>
                    </div>
                  ))}
                  
                  {article.links.length === 0 && (
                    <p className="opacity-50 text-sm text-center py-8">
                      No reference links added yet. Click + to add your first link.
                    </p>
                  )}
                </div>
              </div>

              <div className={`border-4 rounded-lg p-6 ${editorState.isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'}`}>
                <h3 className="text-lg font-black mb-4 flex items-center space-x-2">
                  <FileText size={18} />
                  <span>PRO TIPS</span>
                </h3>
                <ul className="text-sm font-medium space-y-2 opacity-80">
                  <li>• Craft compelling headlines that grab attention</li>
                  <li>• Use short paragraphs for better readability</li>
                  <li>• Include credible sources and citations</li>
                  <li>• Break up text with images and quotes</li>
                  <li>• Structure content with clear headings</li>
                  <li>• Write in your authentic, unique voice</li>
                  <li>• Edit ruthlessly - every word should count</li>
                </ul>
                
                <div className="mt-4 pt-4 border-t border-current border-opacity-20">
                  <h4 className="text-sm font-black mb-2">KEYBOARD SHORTCUTS</h4>
                  <div className="text-xs space-y-1 font-mono opacity-60">
                    <div>Ctrl+B - Bold</div>
                    <div>Ctrl+I - Italic</div>
                    <div>Ctrl+S - Save</div>
                    <div>Ctrl+P - Preview</div>
                    <div>Ctrl+Enter - Publish</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {modals.imageUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`border-4 rounded-lg p-8 max-w-md w-full mx-4 ${editorThemeClasses}`}>
            <h3 className="text-2xl font-black mb-6">
              {modals.imageUpload === 'featured' ? 'FEATURED IMAGE' : 'INSERT IMAGE'}
            </h3>
            
            <div className="mb-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full p-3 border-2 border-current rounded font-medium bg-transparent"
              />
              <p className="text-xs opacity-60 mt-2">
                Supported formats: JPG, PNG, GIF, WebP. Max size: 5MB
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 bg-current text-white px-4 py-3 font-bold border-2 border-current rounded hover:opacity-80 transition-opacity"
              >
                UPLOAD IMAGE
              </button>
              <button
                onClick={() => closeModal('imageUpload')}
                className="flex-1 border-2 border-current px-4 py-3 font-bold rounded hover:bg-opacity-10 hover:bg-current transition-colors"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {modals.linkDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`border-4 rounded-lg p-8 max-w-md w-full mx-4 ${editorThemeClasses}`}>
            <h3 className="text-2xl font-black mb-6">
              {modals.linkDialog === 'inline' ? 'INSERT LINK' : 
               modals.linkDialog === 'reference' ? 'ADD REFERENCE LINK' : 'ADD LINK'}
            </h3>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Link text"
                value={currentInputs.link.text}
                onChange={(e) => setCurrentInputs(prev => ({ 
                  ...prev, 
                  link: { ...prev.link, text: e.target.value }
                }))}
                className="w-full p-3 border-2 border-current rounded font-medium bg-transparent"
              />
              
              <input
                type="url"
                placeholder="https://example.com"
                value={currentInputs.link.url}
                onChange={(e) => setCurrentInputs(prev => ({ 
                  ...prev, 
                  link: { ...prev.link, url: e.target.value }
                }))}
                className="w-full p-3 border-2 border-current rounded font-medium bg-transparent"
              />
              
              <input
                type="text"
                placeholder="Link title (optional)"
                value={currentInputs.link.title}
                onChange={(e) => setCurrentInputs(prev => ({ 
                  ...prev, 
                  link: { ...prev.link, title: e.target.value }
                }))}
                className="w-full p-3 border-2 border-current rounded font-medium bg-transparent"
              />
            </div>
            
            <div className="flex space-x-4 mt-6">
              <button
                onClick={modals.linkDialog === 'inline' ? insertLink : addReferenceLink}
                className="flex-1 bg-current text-white px-4 py-3 font-bold border-2 border-current rounded hover:opacity-80 transition-opacity"
              >
                ADD LINK
              </button>
              <button
                onClick={() => {
                  closeModal('linkDialog');
                  resetCurrentInputs('link');
                }}
                className="flex-1 border-2 border-current px-4 py-3 font-bold rounded hover:bg-opacity-10 hover:bg-current transition-colors"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

{modals.citationDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`border-4 rounded-lg p-8 max-w-md w-full mx-4 ${editorThemeClasses}`}>
            <h3 className="text-2xl font-black mb-6">ADD CITATION</h3>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Citation text"
                value={currentInputs.citation.text}
                onChange={(e) => setCurrentInputs(prev => ({ 
                  ...prev, 
                  citation: { ...prev.citation, text: e.target.value }
                }))}
                className="w-full p-3 border-2 border-current rounded font-medium bg-transparent"
              />
              
              <input
                type="text"
                placeholder="Source (e.g., book title, article)"
                value={currentInputs.citation.source}
                onChange={(e) => setCurrentInputs(prev => ({ 
                  ...prev, 
                  citation: { ...prev.citation, source: e.target.value }
                }))}
                className="w-full p-3 border-2 border-current rounded font-medium bg-transparent"
              />
              
              <input
                type="url"
                placeholder="Source URL (optional)"
                value={currentInputs.citation.url}
                onChange={(e) => setCurrentInputs(prev => ({ 
                  ...prev, 
                  citation: { ...prev.citation, url: e.target.value }
                }))}
                className="w-full p-3 border-2 border-current rounded font-medium bg-transparent"
              />
              
              <input
                type="text"
                placeholder="Page number (optional)"
                value={currentInputs.citation.page}
                onChange={(e) => setCurrentInputs(prev => ({ 
                  ...prev, 
                  citation: { ...prev.citation, page: e.target.value }
                }))}
                className="w-full p-3 border-2 border-current rounded font-medium bg-transparent"
              />
            </div>
            
            <div className="flex space-x-4 mt-6">
              <button
                onClick={addCitation}
                className="flex-1 bg-current text-white px-4 py-3 font-bold border-2 border-current rounded hover:opacity-80 transition-opacity"
              >
                ADD CITATION
              </button>
              <button
                onClick={() => {
                  closeModal('citationDialog');
                  resetCurrentInputs('citation');
                }}
                className="flex-1 border-2 border-current px-4 py-3 font-bold rounded hover:bg-opacity-10 hover:bg-current transition-colors"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {modals.settingsDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`border-4 rounded-lg p-8 max-w-md w-full mx-4 ${editorThemeClasses}`}>
            <h3 className="text-2xl font-black mb-6">EDITOR SETTINGS</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold mb-2">Font Size</label>
                <select
                  value={editorState.fontSize}
                  onChange={(e) => setEditorState(prev => ({ ...prev, fontSize: e.target.value }))}
                  className="w-full p-3 border-2 border-current rounded font-medium bg-transparent"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2">Font Family</label>
                <select
                  value={editorState.fontFamily}
                  onChange={(e) => setEditorState(prev => ({ ...prev, fontFamily: e.target.value }))}
                  className="w-full p-3 border-2 border-current rounded font-medium bg-transparent"
                >
                  <option value="serif">Serif</option>
                  <option value="sans-serif">Sans Serif</option>
                  <option value="mono">Monospace</option>
                </select>
              </div>
              
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={autoSave}
                    onChange={() => setAutoSave(!autoSave)}
                    className="form-checkbox h-5 w-5 text-current"
                  />
                  <span className="font-bold">Enable Auto-save</span>
                </label>
              </div>
            </div>
            
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => closeModal('settingsDialog')}
                className="flex-1 bg-current text-white px-4 py-3 font-bold border-2 border-current rounded hover:opacity-80 transition-opacity"
              >
                SAVE SETTINGS
              </button>
              <button
                onClick={() => closeModal('settingsDialog')}
                className="flex-1 border-2 border-current px-4 py-3 font-bold rounded hover:bg-opacity-10 hover:bg-current transition-colors"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {modals.publishDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`border-4 rounded-lg p-8 max-w-md w-full mx-4 ${editorThemeClasses}`}>
            <h3 className="text-2xl font-black mb-6">PUBLISH ARTICLE</h3>
            
            <p className="text-base font-medium mb-6">
              Are you sure you want to publish this article? Once published, it will be visible to all readers.
            </p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-bold mb-2">Excerpt (Preview Text)</label>
                <textarea
                  value={article.excerpt}
                  onChange={(e) => setArticle(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Enter a brief excerpt (200 characters max)..."
                  maxLength={200}
                  className="w-full p-3 border-2 border-current rounded font-medium bg-transparent h-24 resize-none"
                />
                <p className="text-xs opacity-60 mt-1">
                  {article.excerpt.length}/200 characters
                </p>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={confirmPublish}
                className="flex-1 bg-green-600 text-white px-4 py-3 font-bold border-2 border-green-600 rounded hover:bg-green-700 transition-colors"
              >
                PUBLISH NOW
              </button>
              <button
                onClick={() => closeModal('publishDialog')}
                className="flex-1 border-2 border-current px-4 py-3 font-bold rounded hover:bg-opacity-10 hover:bg-current transition-colors"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WritersPage;