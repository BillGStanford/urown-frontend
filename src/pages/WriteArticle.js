// pages/WriteArticle.js (Updated)
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { axios } from '../utils/apiUtils';
import { useUser } from '../context/UserContext';
import RichTextEditor from '../components/RichTextEditor';
import { Moon, Sun, Save, FileText, Send, Trash2, Lightbulb, CheckCircle, AlertCircle } from 'lucide-react';

function WriteArticle() {
  const navigate = useNavigate();
  const userContext = useUser();
  
  // Add safety check for context
  if (!userContext) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Context Error</h1>
          <p className="text-gray-700">This component must be wrapped in UserProvider</p>
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
  const [grammarChecking, setGrammarChecking] = useState(false);
  const [grammarSuggestions, setGrammarSuggestions] = useState([]);
  const [showGrammarPanel, setShowGrammarPanel] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [applyingSuggestion, setApplyingSuggestion] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showTips, setShowTips] = useState(false);

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
    // Extract text from HTML content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = formData.content;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    
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

  const checkGrammar = async () => {
    if (!formData.content.trim()) {
      setError('Please write some content before checking grammar');
      return;
    }

    setGrammarChecking(true);
    setShowGrammarPanel(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const suggestions = [];
      // Extract text from HTML content for grammar checking
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = formData.content;
      const text = tempDiv.textContent || tempDiv.innerText || '';
      
      // Mock grammar suggestions
      const passiveVoiceRegex = /\b(am|is|are|was|were|be|being|been)\s+\w+ed\b/gi;
      let match;
      while ((match = passiveVoiceRegex.exec(text)) !== null) {
        suggestions.push({
          id: `passive-${match.index}`,
          type: 'passive',
          message: 'Consider using active voice for more direct writing',
          text: match[0],
          offset: match.index,
          length: match[0].length,
          suggestions: [{
            text: 'Rephrase with active voice',
            description: 'Active voice is more direct and engaging'
          }]
        });
      }
      
      setGrammarSuggestions(suggestions);
      
      if (suggestions.length === 0) {
        setSuccess('No grammar issues found! Great job!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Grammar check error:', error);
      setError('Failed to check grammar. Please try again.');
    } finally {
      setGrammarChecking(false);
    }
  };

  const applySuggestion = (suggestion) => {
    if (!suggestion) return;
    
    setSelectedSuggestion(suggestion);
    setApplyingSuggestion(true);
    
    try {
      // Extract text from HTML content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = formData.content;
      const text = tempDiv.textContent || tempDiv.innerText || '';
      
      const start = suggestion.offset;
      const end = start + suggestion.length;
      const beforeText = text.substring(0, start);
      const afterText = text.substring(end);
      const newText = beforeText + suggestion.text + afterText;
      
      // For simplicity, we're replacing the entire content
      // In a real implementation, you'd need to preserve HTML structure
      setFormData(prev => ({
        ...prev,
        content: newText
      }));
      
      setGrammarSuggestions(prev => 
        prev.filter(s => s.id !== suggestion.id)
      );
      
      setSuccess('Suggestion applied!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (error) {
      console.error('Error applying suggestion:', error);
      setError('Failed to apply suggestion. Please try again.');
    } finally {
      setApplyingSuggestion(false);
      setSelectedSuggestion(null);
    }
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

      await axios.post('/articles', {
        title: getFullTitle() || 'Untitled Draft',
        content: formData.content,
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
    
    if (name === 'content' && grammarSuggestions.length > 0) {
      setGrammarSuggestions([]);
    }
  };

  const handleContentChange = (content) => {
    if (content.length > maxChars) {
      return;
    }
    
    // Clean up the HTML content
    let cleanContent = content
      // Remove empty paragraphs
      .replace(/<p><\/p>/g, '')
      .replace(/<p>\s*<\/p>/g, '')
      // Remove empty divs
      .replace(/<div><\/div>/g, '')
      .replace(/<div>\s*<\/div>/g, '')
      // Normalize line breaks
      .trim();
    
    setFormData(prev => ({
      ...prev,
      content: cleanContent
    }));
    
    if (error) setError('');
    if (success) setSuccess('');
    
    if (grammarSuggestions.length > 0) {
      setGrammarSuggestions([]);
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
    
    if (!formData.title.trim()) {
      return 'Article title is required';
    }
    
    if (fullTitle.length > maxTitleLength) {
      return `Title must be ${maxTitleLength} characters or less`;
    }
    
    if (!formData.content.trim()) {
      return 'Article content is required';
    }
    
    if (wordCount < minWords) {
      return `Article must be at least ${minWords} words long (currently ${wordCount} words)`;
    }
    
    if (charCount > maxChars) {
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

    setIsSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('You must be logged in to save articles');
        setIsSaving(false);
        return;
      }

      const response = await axios.post('/articles', {
        title: getFullTitle(),
        content: formData.content,
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
      setIsSaving(false);
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

    setIsPublishing(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('You must be logged in to publish articles');
        setIsPublishing(false);
        return;
      }

      const response = await axios.post('/articles', {
        title: getFullTitle(),
        content: formData.content,
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
      setIsPublishing(false);
    }
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all content? This action cannot be undone.')) {
      setFormData({ title: '', content: '', topicIds: [] });
      setError('');
      setSuccess('');
      setGrammarSuggestions([]);
    }
  };

  // Show loading while user context is loading
  if (userLoading || topicsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not logged in
  if (!user) {
    return null;
  }

  const getWordCountColor = () => {
    if (wordCount < minWords) return 'text-red-500';
    if (wordCount >= minWords && wordCount <= minWords + 50) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getCharCountColor = () => {
    const percentage = (charCount / maxChars) * 100;
    if (percentage > 90) return 'text-red-500';
    if (percentage > 70) return 'text-yellow-500';
    return 'text-gray-500';
  };

  const silverLimit = 2;
  const remainingArticles = silverLimit - (user?.weekly_articles_count || 0);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b sticky top-0 z-10`}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Create Article</h1>
            {autoSaveStatus && (
              <div className="flex items-center text-sm text-gray-500">
                <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-blue-500 mr-2"></div>
                {autoSaveStatus}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowTips(!showTips)}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'} transition-colors`}
              title="Writing Tips"
            >
              <Lightbulb size={20} />
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-yellow-400' : 'hover:bg-gray-100 text-gray-600'} transition-colors`}
              title={darkMode ? 'Light Mode' : 'Dark Mode'}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Title Input */}
            <div className={`mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Article Title</label>
              <div className="relative">
                <div className={`flex items-center border rounded-lg overflow-hidden ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'}`}>
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3">
                    <span className="font-medium">Opinion |</span>
                  </div>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter a compelling title for your opinion piece..."
                    className={`flex-1 px-4 py-3 text-lg focus:outline-none ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
                    maxLength={maxTitleLength - titlePrefix.length}
                    disabled={loading}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Make it bold and attention-grabbing
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {formData.title.length}/{maxTitleLength - titlePrefix.length}
                  </div>
                </div>
              </div>
            </div>

            {/* Rich Text Editor */}
            <div className={`mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
              <div className="flex justify-between items-center mb-4">
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Article Content</label>
                <button
                  onClick={checkGrammar}
                  disabled={grammarChecking || !formData.content.trim()}
                  className="text-sm font-medium bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {grammarChecking ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Checking...
                    </>
                  ) : (
                    'Check Grammar'
                  )}
                </button>
              </div>
              
              <RichTextEditor
                value={formData.content}
                onChange={handleContentChange}
                placeholder="Start writing your opinion here...

Tips for great opinion pieces:
• Start with a strong hook or surprising fact
• Present your main argument clearly
• Support your points with evidence or examples  
• Address counterarguments
• End with a powerful conclusion that reinforces your viewpoint
• Keep paragraphs focused and readable

Remember: This is YOUR space to share what YOU think. Be authentic, be bold, be thoughtful."
                maxLength={maxChars}
                minHeight="500px"
                darkMode={darkMode}
              />
              
              {/* Writing Stats */}
              <div className="flex justify-between mt-4">
                <div className="flex items-center space-x-6">
                  <div className={`text-sm font-medium ${getWordCountColor()}`}>
                    Words: {wordCount.toLocaleString()}
                    {wordCount < minWords && (
                      <span className="ml-1">
                        (min: {minWords})
                      </span>
                    )}
                  </div>
                  <div className={`text-sm font-medium ${getCharCountColor()}`}>
                    Characters: {charCount.toLocaleString()}/{maxChars.toLocaleString()}
                  </div>
                </div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  GENRE: OPINION
                </div>
              </div>
              
              {/* Character limit warning */}
              {charCount >= maxChars * 0.9 && (
                <div className="mt-2 text-sm text-red-500 font-medium">
                  {charCount >= maxChars 
                    ? "You've reached the maximum character limit. Please shorten your article."
                    : "You're approaching the maximum character limit."}
                </div>
              )}
            </div>

            {/* Grammar Suggestions Panel */}
            {showGrammarPanel && (
              <div className={`mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Grammar & Style Suggestions
                    {grammarSuggestions.length > 0 && (
                      <span className="ml-2 text-sm font-normal text-gray-500">
                        ({grammarSuggestions.length} found)
                      </span>
                    )}
                  </h3>
                  <button
                    onClick={() => setShowGrammarPanel(false)}
                    className={`p-1 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                
                {grammarChecking ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-gray-500">Checking grammar and style...</p>
                  </div>
                ) : grammarSuggestions.length > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {grammarSuggestions.map((suggestion) => (
                      <div 
                        key={suggestion.id}
                        className={`p-4 border rounded-lg ${
                          selectedSuggestion?.id === suggestion.id 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                            : `${darkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center mb-1">
                              <span className="text-sm font-medium px-2 py-1 rounded text-red-600 bg-red-100 dark:bg-red-900/20">
                                {suggestion.type}
                              </span>
                              <span className="ml-2 text-gray-700 dark:text-gray-300">"{suggestion.text}"</span>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 mb-2">{suggestion.message}</p>
                            
                            {suggestion.suggestions && suggestion.suggestions.length > 0 && (
                              <div className="mt-2">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Suggestions:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                  {suggestion.suggestions.map((rec, index) => (
                                    <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                                      {rec.text}: {rec.description}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex space-x-2">
                            <button
                              onClick={() => applySuggestion(suggestion)}
                              disabled={applyingSuggestion}
                              className="text-sm bg-blue-500 text-white hover:bg-blue-600 px-3 py-1 rounded disabled:opacity-50 transition-colors"
                            >
                              {applyingSuggestion ? 'Applying...' : 'Apply'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="flex items-center justify-center text-green-500 mb-2">
                      <CheckCircle size={24} />
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 font-medium">No grammar or style issues found!</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your writing looks great!</p>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              <div className="flex space-x-4">
                <button
                  onClick={handleSaveDraft}
                  disabled={isSaving || (!formData.title.trim() && !formData.content.trim())}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center ${
                    isSaving || (!formData.title.trim() && !formData.content.trim())
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : `${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`
                  }`}
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-700 mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} className="mr-2" />
                      Save Draft
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleClear}
                  disabled={isSaving || isPublishing}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center ${
                    isSaving || isPublishing
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                >
                  <Trash2 size={18} className="mr-2" />
                  Clear All
                </button>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  {remainingArticles > 0 ? (
                    <div className="text-sm font-medium text-green-500">
                      Ready to publish!
                    </div>
                  ) : (
                    <div className="text-sm font-medium text-red-500">
                      Weekly limit reached
                    </div>
                  )}
                </div>
                
                <button
                  onClick={handlePublish}
                  disabled={isPublishing || remainingArticles <= 0 || wordCount < minWords}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center ${
                    isPublishing || remainingArticles <= 0 || wordCount < minWords
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {isPublishing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Send size={18} className="mr-2" />
                      Publish
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Article Requirements */}
            <div className={`mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
              <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Article Requirements</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Minimum Words</span>
                    <span className={`text-sm font-medium ${wordCount >= minWords ? 'text-green-500' : 'text-red-500'}`}>
                      {wordCount} / {minWords}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (wordCount / minWords) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Maximum Characters</span>
                    <span className={`text-sm font-medium ${getCharCountColor()}`}>
                      {charCount.toLocaleString()} / {maxChars.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        charCount > maxChars * 0.9 ? 'bg-red-500' : 
                        charCount > maxChars * 0.7 ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(100, (charCount / maxChars) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Topics Selection */}
            <div className={`mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
              <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Select Topics (Up to 3)</h3>
              
              {topicsLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading topics...</p>
                </div>
              ) : (
                <div>
                  <div className="space-y-2">
                    {topics.map(topic => (
                      <div key={topic.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`topic-${topic.id}`}
                          checked={formData.topicIds.includes(topic.id)}
                          onChange={() => handleTopicToggle(topic.id)}
                          disabled={loading || (!formData.topicIds.includes(topic.id) && formData.topicIds.length >= 3)}
                          className="mr-2 h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label 
                          htmlFor={`topic-${topic.id}`} 
                          className={`text-sm font-medium cursor-pointer ${
                            formData.topicIds.includes(topic.id) ? 'text-blue-500' : darkMode ? 'text-gray-300' : 'text-gray-700'
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

            {/* Weekly Limit Status */}
            <div className={`mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
              <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Weekly Limit</h3>
              
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Articles Remaining</span>
                <span className={`text-sm font-medium ${remainingArticles > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {remainingArticles} / {silverLimit}
                </span>
              </div>
              
              <div className="flex items-center justify-center py-2">
                <div className="text-center">
                  <div className="text-2xl mb-1">🥈</div>
                  <div className="text-sm font-medium text-gray-500">SILVER TIER</div>
                </div>
              </div>
            </div>

            {/* Writing Tips */}
            {showTips && (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
                <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Writing Tips</h3>
                
                <div className="space-y-3">
                  <div>
                    <h4 className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Structure</h4>
                    <ul className="text-sm text-gray-500 space-y-1">
                      <li>• Hook readers with an engaging opening</li>
                      <li>• State your main argument clearly</li>
                      <li>• Use evidence to support your points</li>
                      <li>• Address opposing viewpoints</li>
                      <li>• End with a memorable conclusion</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Style</h4>
                    <ul className="text-sm text-gray-500 space-y-1">
                      <li>• Write with confidence and conviction</li>
                      <li>• Use concrete examples and data</li>
                      <li>• Keep sentences clear and direct</li>
                      <li>• Show your unique perspective</li>
                      <li>• Edit ruthlessly for clarity</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="fixed bottom-4 right-4 max-w-md bg-red-500 text-white p-4 rounded-lg shadow-lg flex items-start">
          <AlertCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium">Error</h4>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="fixed bottom-4 right-4 max-w-md bg-green-500 text-white p-4 rounded-lg shadow-lg flex items-start">
          <CheckCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium">Success</h4>
            <p className="text-sm">{success}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default WriteArticle;