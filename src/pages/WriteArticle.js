// pages/WriteArticle.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { axios } from '../utils/apiUtils';
import { useUser } from '../context/UserContext';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Quote, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Type,
  Palette,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';

function WriteArticle() {
  const navigate = useNavigate();
  const userContext = useUser();
  const editorRef = useRef(null);
  
  // Add safety check for context
  if (!userContext) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border border-white/30">
          <h1 className="text-4xl font-black bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent mb-4">Context Error</h1>
          <p className="text-xl text-gray-700">This component must be wrapped in UserProvider</p>
        </div>
      </div>
    );
  }

  const { user, updateUser, loading: userLoading } = userContext;
  
  // Fixed prefix for all article titles
  const titlePrefix = "Opinion | ";
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    topicIds: []
  });
  const [charCount, setCharCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const [topics, setTopics] = useState([]);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [selectedFontSize, setSelectedFontSize] = useState('16px');

  const minWords = 100;
  const maxChars = 50000;
  const maxTitleLength = 255;

  // Fetch topics on component mount
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await axios.get('/topics');
        setTopics(response.data.topics || []);
      } catch (error) {
        console.error('Error fetching topics:', error);
      } finally {
        setTopicsLoading(false);
      }
    };

    fetchTopics();
  }, []);

  // Calculate word and character counts
  useEffect(() => {
    const text = editorRef.current ? editorRef.current.innerText : formData.content;
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    setCharCount(text.length);
  }, [formData.content]);

  // Auto-save as draft every 30 seconds
  useEffect(() => {
    if (!formData.title.trim() && !formData.content.trim()) return;
    
    const autoSaveInterval = setInterval(() => {
      handleAutoSave();
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [formData]);

  // Redirect if not logged in
  useEffect(() => {
    if (!userLoading && !user) {
      navigate('/login');
    }
  }, [user, userLoading, navigate]);

  // Get the full title with prefix
  const getFullTitle = () => {
    return titlePrefix + formData.title;
  };

  const handleAutoSave = async () => {
    if (!formData.title.trim() && !formData.content.trim()) return;
    
    try {
      setAutoSaveStatus('Saving...');
      const token = localStorage.getItem('token');
      
      if (!token) {
        setAutoSaveStatus('Not logged in');
        setTimeout(() => setAutoSaveStatus(''), 3000);
        return;
      }

      const content = editorRef.current ? editorRef.current.innerHTML : formData.content;
      
      await axios.post('/articles', {
        title: getFullTitle() || 'Untitled Draft',
        content: content,
        published: false,
        topicIds: formData.topicIds
      });
      setAutoSaveStatus('Draft saved');
      setTimeout(() => setAutoSaveStatus(''), 3000);
    } catch (error) {
      console.error('Auto-save error:', error);
      setAutoSaveStatus('Save failed');
      setTimeout(() => setAutoSaveStatus(''), 3000);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'content' && value.length > maxChars) {
      return;
    }
    
    if (name === 'title' && (titlePrefix + value).length > maxTitleLength) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      setFormData(prev => ({
        ...prev,
        content: content
      }));
      
      if (error) setError('');
      if (success) setSuccess('');
    }
  };

  const handleTopicToggle = (topicId) => {
    setFormData(prev => {
      const { topicIds } = prev;
      
      if (topicIds.includes(topicId)) {
        return {
          ...prev,
          topicIds: topicIds.filter(id => id !== topicId)
        };
      } else {
        if (topicIds.length < 3) {
          return {
            ...prev,
            topicIds: [...topicIds, topicId]
          };
        } else {
          setError('You can select a maximum of 3 topics');
          setTimeout(() => setError(''), 3000);
          return prev;
        }
      }
    });
  };

  const validateForm = () => {
    const fullTitle = getFullTitle();
    const content = editorRef.current ? editorRef.current.innerHTML : formData.content;
    
    if (!formData.title.trim()) {
      return 'Article title is required';
    }
    
    if (fullTitle.length > maxTitleLength) {
      return `Title must be ${maxTitleLength} characters or less`;
    }
    
    if (!content.trim() || content === '<p><br></p>') {
      return 'Article content is required';
    }
    
    // Strip HTML tags for word count
    const textContent = content.replace(/<[^>]*>/g, '');
    const words = textContent.trim().split(/\s+/).filter(word => word.length > 0);
    
    if (words.length < minWords) {
      return `Article must be at least ${minWords} words long (currently ${words.length} words)`;
    }
    
    if (textContent.length > maxChars) {
      return `Article must be ${maxChars} characters or less`;
    }

    return null;
  };

  const handleSaveDraft = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('You must be logged in to save articles');
        setLoading(false);
        return;
      }

      const content = editorRef.current ? editorRef.current.innerHTML : formData.content;
      
      const response = await axios.post('/articles', {
        title: getFullTitle(),
        content: content,
        published: false,
        topicIds: formData.topicIds
      });

      if (response.data.user) {
        updateUser(response.data.user);
      }

      setSuccess('Article saved as draft!');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error) {
      console.error('Save draft error:', error);
      if (error.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
        navigate('/login');
      } else {
        setError(error.response?.data?.error || 'Failed to save draft');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    const silverLimit = 2;
    const remainingArticles = silverLimit - (user?.weekly_articles_count || 0);
    
    if (remainingArticles <= 0) {
      setError('You have reached your weekly article limit. Try again after your limit resets.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('You must be logged in to publish articles');
        setLoading(false);
        return;
      }

      const content = editorRef.current ? editorRef.current.innerHTML : formData.content;
      
      const response = await axios.post('/articles', {
        title: getFullTitle(),
        content: content,
        published: true,
        topicIds: formData.topicIds
      });

      if (response.data.user) {
        updateUser(response.data.user);
      }

      setSuccess('Article published successfully!');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error) {
      console.error('Publish error:', error);
      if (error.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
        navigate('/login');
      } else {
        setError(error.response?.data?.error || 'Failed to publish article');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all content? This action cannot be undone.')) {
      setFormData({ title: '', content: '', topicIds: [] });
      if (editorRef.current) {
        editorRef.current.innerHTML = '<p><br></p>';
      }
      setError('');
      setSuccess('');
    }
  };

  // Text formatting functions
  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
  };

  const insertList = (type) => {
    const command = type === 'bullet' ? 'insertUnorderedList' : 'insertOrderedList';
    document.execCommand(command, false, null);
    editorRef.current.focus();
  };

  const insertQuote = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString();
      
      const blockquote = document.createElement('blockquote');
      blockquote.className = 'border-l-4 border-orange-500 pl-4 py-2 my-4 bg-orange-50 italic';
      blockquote.textContent = selectedText || 'Your quote here';
      
      range.deleteContents();
      range.insertNode(blockquote);
      
      // Move cursor after the blockquote
      range.setStartAfter(blockquote);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      
      editorRef.current.focus();
    }
  };

  const changeFontSize = (size) => {
    document.execCommand('fontSize', false, '7');
    const fontElements = document.getElementsByTagName('font');
    for (let i = 0; i < fontElements.length; i++) {
      if (fontElements[i].size === '7') {
        fontElements[i].removeAttribute('size');
        fontElements[i].style.fontSize = size;
      }
    }
    editorRef.current.focus();
  };

  const changeTextColor = (color) => {
    document.execCommand('foreColor', false, color);
    editorRef.current.focus();
    setSelectedColor(color);
    setShowColorPicker(false);
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection.toString().length > 0) {
      setSelectedText(selection.toString());
    } else {
      setSelectedText('');
    }
  };

  // Show loading while user context is loading
  if (userLoading || topicsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-orange-500 animate-pulse" />
            </div>
          </div>
          <div className="mt-6 text-xl font-semibold text-gray-700">Loading...</div>
        </div>
      </div>
    );
  }

  // Redirect if not logged in
  if (!user) {
    return null;
  }

  const getWordCountColor = () => {
    const content = editorRef.current ? editorRef.current.innerHTML : formData.content;
    const textContent = content.replace(/<[^>]*>/g, '');
    const words = textContent.trim().split(/\s+/).filter(word => word.length > 0);
    
    if (words.length < minWords) return 'text-red-600';
    if (words.length >= minWords && words.length <= minWords + 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getCharCountColor = () => {
    const content = editorRef.current ? editorRef.current.innerHTML : formData.content;
    const textContent = content.replace(/<[^>]*>/g, '');
    const percentage = (textContent.length / maxChars) * 100;
    
    if (percentage > 90) return 'text-red-600';
    if (percentage > 70) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const silverLimit = 2;
  const remainingArticles = silverLimit - (user?.weekly_articles_count || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-lg shadow-xl border-b border-white/30">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="text-center">
            <div className="flex justify-center items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
                UROWN
              </h1>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Write Your Opinion</h2>
            <p className="text-lg text-gray-600">Share your thoughts with the world</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Status Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-red-600 font-bold text-xs">!</span>
            </div>
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-green-600 font-bold">✓</span>
            </div>
            <p className="text-green-700 font-medium">{success}</p>
          </div>
        )}

        {/* Auto-save Status */}
        {autoSaveStatus && (
          <div className="text-center mb-4">
            <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              {autoSaveStatus}
            </span>
          </div>
        )}

        {/* Writing Form */}
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
          {/* Title Input */}
          <div className="p-6 border-b border-gray-100">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Article Title</label>
            <div className="relative">
              <div className="flex items-center border-2 border-gray-300 rounded-xl overflow-hidden bg-white focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-200 transition-all">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-3">
                  <span className="text-lg font-bold">Opinion |</span>
                </div>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter a compelling title for your opinion piece..."
                  className="flex-1 px-4 py-3 text-lg font-bold focus:outline-none"
                  maxLength={maxTitleLength - titlePrefix.length}
                  disabled={loading}
                />
              </div>
              <div className="flex justify-between mt-2">
                <div className="text-sm text-gray-500">
                  Make it bold and attention-grabbing
                </div>
                <div className="text-sm text-gray-500">
                  {formData.title.length}/{maxTitleLength - titlePrefix.length}
                </div>
              </div>
            </div>
          </div>

          {/* Topics Selection */}
          <div className="p-6 border-b border-gray-100">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Select Topics (Up to 3)</label>
            <div className="bg-gray-50 rounded-xl p-4">
              {topicsLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Loading topics...</p>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {topics.map(topic => (
                      <div key={topic.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`topic-${topic.id}`}
                          checked={formData.topicIds.includes(topic.id)}
                          onChange={() => handleTopicToggle(topic.id)}
                          disabled={loading || (!formData.topicIds.includes(topic.id) && formData.topicIds.length >= 3)}
                          className="mr-2 h-4 w-4 text-orange-600 rounded focus:ring-orange-500"
                        />
                        <label 
                          htmlFor={`topic-${topic.id}`} 
                          className={`text-sm font-medium cursor-pointer ${
                            formData.topicIds.includes(topic.id) ? 'text-orange-600' : 'text-gray-700'
                          } ${
                            !formData.topicIds.includes(topic.id) && formData.topicIds.length >= 3 ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {topic.name}
                        </label>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-sm text-gray-500">
                    Selected: {formData.topicIds.length}/3 topics
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Content Editor */}
          <div className="p-6">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-semibold text-gray-700">Article Content</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isPreviewMode 
                      ? 'bg-orange-100 text-orange-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {isPreviewMode ? <EyeOff size={16} /> : <Eye size={16} />}
                  {isPreviewMode ? 'Edit' : 'Preview'}
                </button>
              </div>
            </div>
            
            {!isPreviewMode && (
              <div className="border-2 border-gray-300 rounded-xl overflow-hidden bg-white focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-200 transition-all">
                {/* Formatting Toolbar */}
                <div className="bg-gray-50 border-b border-gray-200 p-2 flex flex-wrap items-center gap-1">
                  <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
                    <button
                      onClick={() => formatText('bold')}
                      className="p-2 rounded hover:bg-gray-200 transition-colors"
                      title="Bold"
                    >
                      <Bold size={16} />
                    </button>
                    <button
                      onClick={() => formatText('italic')}
                      className="p-2 rounded hover:bg-gray-200 transition-colors"
                      title="Italic"
                    >
                      <Italic size={16} />
                    </button>
                    <button
                      onClick={() => formatText('underline')}
                      className="p-2 rounded hover:bg-gray-200 transition-colors"
                      title="Underline"
                    >
                      <Underline size={16} />
                    </button>
                  </div>
                  
                  <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
                    <button
                      onClick={() => insertList('bullet')}
                      className="p-2 rounded hover:bg-gray-200 transition-colors"
                      title="Bullet List"
                    >
                      <List size={16} />
                    </button>
                    <button
                      onClick={() => insertList('number')}
                      className="p-2 rounded hover:bg-gray-200 transition-colors"
                      title="Numbered List"
                    >
                      <ListOrdered size={16} />
                    </button>
                    <button
                      onClick={insertQuote}
                      className="p-2 rounded hover:bg-gray-200 transition-colors"
                      title="Quote"
                    >
                      <Quote size={16} />
                    </button>
                  </div>
                  
                  <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
                    <button
                      onClick={() => formatText('justifyLeft')}
                      className="p-2 rounded hover:bg-gray-200 transition-colors"
                      title="Align Left"
                    >
                      <AlignLeft size={16} />
                    </button>
                    <button
                      onClick={() => formatText('justifyCenter')}
                      className="p-2 rounded hover:bg-gray-200 transition-colors"
                      title="Align Center"
                    >
                      <AlignCenter size={16} />
                    </button>
                    <button
                      onClick={() => formatText('justifyRight')}
                      className="p-2 rounded hover:bg-gray-200 transition-colors"
                      title="Align Right"
                    >
                      <AlignRight size={16} />
                    </button>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="relative">
                      <button
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className="p-2 rounded hover:bg-gray-200 transition-colors flex items-center gap-1"
                        title="Text Color"
                      >
                        <Palette size={16} />
                        <div 
                          className="w-4 h-4 rounded border border-gray-300" 
                          style={{ backgroundColor: selectedColor }}
                        ></div>
                      </button>
                      
                      {showColorPicker && (
                        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10">
                          <div className="grid grid-cols-6 gap-1">
                            {['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', 
                              '#00FFFF', '#FFA500', '#800080', '#FFC0CB', '#A52A2A', '#808080'].map(color => (
                              <button
                                key={color}
                                onClick={() => changeTextColor(color)}
                                className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                                style={{ backgroundColor: color }}
                                title={color}
                              ></button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <select
                      onChange={(e) => changeFontSize(e.target.value)}
                      className="ml-2 px-2 py-1 border border-gray-300 rounded text-sm"
                      title="Font Size"
                    >
                      <option value="12px">Small</option>
                      <option value="16px" selected>Normal</option>
                      <option value="20px">Large</option>
                      <option value="24px">Extra Large</option>
                    </select>
                  </div>
                </div>
                
                {/* Editor Content */}
                <div
                  ref={editorRef}
                  contentEditable
                  onInput={handleContentChange}
                  onMouseUp={handleTextSelection}
                  onKeyUp={handleTextSelection}
                  className="min-h-[400px] p-4 focus:outline-none"
                  style={{ fontSize: '16px', lineHeight: '1.6' }}
                  dangerouslySetInnerHTML={{ __html: formData.content || '<p><br></p>' }}
                ></div>
              </div>
            )}
            
            {isPreviewMode && (
              <div className="border-2 border-gray-300 rounded-xl p-6 bg-white min-h-[400px] prose prose-lg max-w-none">
                <div dangerouslySetInnerHTML={{ __html: formData.content || '<p>Start writing to see preview...</p>' }}></div>
              </div>
            )}
            
            {/* Writing Stats */}
            <div className="flex justify-between mt-4">
              <div className="flex items-center space-x-6">
                <div className={`text-sm font-medium ${getWordCountColor()}`}>
                  Words: {wordCount.toLocaleString()}
                  {wordCount < minWords && (
                    <span className="text-red-600 ml-1">
                      (min: {minWords})
                    </span>
                  )}
                </div>
                <div className={`text-sm font-medium ${getCharCountColor()}`}>
                  Characters: {charCount.toLocaleString()}/{maxChars.toLocaleString()}
                </div>
              </div>
              <div className="text-sm font-medium text-gray-600">
                GENRE: OPINION
              </div>
            </div>
            
            {/* Character limit warning */}
            {charCount >= maxChars * 0.9 && (
              <div className="mt-2 text-red-600 text-sm font-medium">
                {charCount >= maxChars 
                  ? "You've reached the maximum character limit. Please shorten your article."
                  : "You're approaching the maximum character limit."}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="p-6 bg-gray-50 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <div className="flex space-x-3">
                <button
                  onClick={handleSaveDraft}
                  disabled={loading}
                  className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : 'Save Draft'}
                </button>
                
                <button
                  onClick={handleClear}
                  disabled={loading}
                  className="px-6 py-3 bg-white border border-gray-300 text-red-600 font-medium rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear All
                </button>
              </div>

              <div className="flex items-center space-x-3">
                <div className="text-right">
                  {remainingArticles > 0 ? (
                    <div className="text-sm font-medium text-green-600">
                      Ready to publish!
                    </div>
                  ) : (
                    <div className="text-sm font-medium text-red-600">
                      Weekly limit reached
                    </div>
                  )}
                </div>
                
                <button
                  onClick={handlePublish}
                  disabled={loading || remainingArticles <= 0 || wordCount < minWords}
                  className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {loading ? 'Publishing...' : 'Publish Article'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Writing Tips */}
        <div className="mt-8 bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl border border-white/30 p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Writing Tips for Powerful Opinions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-orange-600 font-bold">1</span>
                </span>
                Structure
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  Hook readers with an engaging opening
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  State your main argument clearly
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  Use evidence to support your points
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  Address opposing viewpoints
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  End with a memorable conclusion
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <span className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-red-600 font-bold">2</span>
                </span>
                Style
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  Write with confidence and conviction
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  Use concrete examples and data
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  Keep sentences clear and direct
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  Show your unique perspective
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  Edit ruthlessly for clarity
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WriteArticle;