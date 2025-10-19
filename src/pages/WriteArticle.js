// pages/WriteArticle.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { axios } from '../utils/apiUtils';
import { useUser } from '../context/UserContext';

function WriteArticle() {
  const navigate = useNavigate();
  const userContext = useUser();
  const textareaRef = useRef(null);
  
  // Add safety check for context
  if (!userContext) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Context Error</h1>
        <p className="text-xl">This component must be wrapped in UserProvider</p>
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
    const words = formData.content.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    setCharCount(formData.content.length);
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
      const text = formData.content;
      
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
    if (!suggestion || !textareaRef.current) return;
    
    setSelectedSuggestion(suggestion);
    setApplyingSuggestion(true);
    
    try {
      const textarea = textareaRef.current;
      const start = suggestion.offset;
      const end = start + suggestion.length;
      const text = formData.content;
      const beforeText = text.substring(0, start);
      const afterText = text.substring(end);
      const newText = beforeText + suggestion.text + afterText;
      
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

  const highlightSuggestion = (suggestion) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    textarea.focus();
    textarea.setSelectionRange(suggestion.offset, suggestion.offset + suggestion.length);
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

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('You must be logged in to save articles');
        setLoading(false);
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
      setLoading(false);
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
      <div className="max-w-5xl mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl font-bold mb-4">Loading...</h1>
        <p className="text-xl">Please wait while we verify your session and load topics</p>
      </div>
    );
  }

  // Redirect if not logged in
  if (!user) {
    return null;
  }

  const getWordCountColor = () => {
    if (wordCount < minWords) return 'text-red-600';
    if (wordCount >= minWords && wordCount <= minWords + 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getCharCountColor = () => {
    const percentage = (charCount / maxChars) * 100;
    if (percentage > 90) return 'text-red-600';
    if (percentage > 70) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const silverLimit = 2;
  const remainingArticles = silverLimit - (user?.weekly_articles_count || 0);

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold mb-6">WRITE YOUR OPINION</h1>
        <p className="text-2xl font-bold text-gray-600 mb-4">
          Share your thoughts with the world
        </p>
        
        {/* Article Requirements */}
        <div className="bg-gray-50 border-2 border-black p-6 mb-6">
          <div className="flex justify-center items-center space-x-8">
            <div className="text-xl font-bold">
              MINIMUM WORDS: 
              <span className={`ml-2 ${wordCount >= minWords ? 'text-green-600' : 'text-red-600'}`}>
                {wordCount} / {minWords}
              </span>
            </div>
            <div className="text-xl font-bold">
              MAXIMUM CHARACTERS: 
              <span className={`ml-2 ${getCharCountColor()}`}>
                {charCount.toLocaleString()} / {maxChars.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
        
        {/* Weekly Limit Status */}
        <div className="bg-gray-50 border-2 border-black p-6">
          <div className="flex justify-center items-center space-x-8">
            <div className="text-xl font-bold">
              ARTICLES REMAINING THIS WEEK: 
              <span className={`ml-2 ${remainingArticles > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {remainingArticles} / {silverLimit}
              </span>
            </div>
            <div className="text-lg font-bold text-gray-600">
              🥈 SILVER TIER
            </div>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="error-message text-center text-2xl mb-8">
          {error}
        </div>
      )}

      {success && (
        <div className="success-message text-center text-2xl mb-8">
          {success}
        </div>
      )}

      {/* Auto-save Status */}
      {autoSaveStatus && (
        <div className="text-center mb-4">
          <span className="text-lg font-bold text-gray-600">
            {autoSaveStatus}
          </span>
        </div>
      )}

      {/* Writing Form */}
      <div className="bg-white border-2 border-black p-8">
        {/* Title Input */}
        <div className="mb-8">
          <label className="form-label">ARTICLE TITLE *</label>
          <div className="relative">
            <div className="flex items-center border-2 border-black rounded-lg overflow-hidden bg-white">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3">
                <span className="text-2xl font-bold">Opinion |</span>
              </div>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter a compelling title for your opinion piece..."
                className="flex-1 px-4 py-3 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={maxTitleLength - titlePrefix.length}
                disabled={loading}
                style={{ border: 'none' }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <div className="text-lg font-bold text-gray-600">
                Make it bold and attention-grabbing
              </div>
              <div className="text-lg font-bold text-gray-500">
                {formData.title.length}/{maxTitleLength - titlePrefix.length}
              </div>
            </div>
          </div>
        </div>

        {/* Topics Selection */}
        <div className="mb-8">
          <label className="form-label">SELECT TOPICS (UP TO 3)</label>
          <div className="border-2 border-black rounded-lg p-4 bg-gray-50">
            {topicsLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading topics...</p>
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
                        className="mr-2 h-5 w-5"
                      />
                      <label 
                        htmlFor={`topic-${topic.id}`} 
                        className={`text-lg font-bold cursor-pointer ${
                          formData.topicIds.includes(topic.id) ? 'text-blue-600' : 'text-gray-700'
                        } ${
                          !formData.topicIds.includes(topic.id) && formData.topicIds.length >= 3 ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {topic.name}
                      </label>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-sm font-bold text-gray-600">
                  Selected: {formData.topicIds.length}/3 topics
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content Textarea */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <label className="form-label">ARTICLE CONTENT *</label>
            <button
              onClick={checkGrammar}
              disabled={grammarChecking || !formData.content.trim()}
              className="text-sm font-bold bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {grammarChecking ? 'Checking...' : 'Check Grammar'}
            </button>
          </div>
          
          <textarea
            ref={textareaRef}
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Start writing your opinion here... 

Tips for great opinion pieces:
• Start with a strong hook or surprising fact
• Present your main argument clearly
• Support your points with evidence or examples  
• Address counterarguments
• End with a powerful conclusion that reinforces your viewpoint
• Keep paragraphs focused and readable

Remember: This is YOUR space to share what YOU think. Be authentic, be bold, be thoughtful."
            className="input-field resize-none"
            rows={20}
            style={{ minHeight: '500px', fontSize: '18px', lineHeight: '1.6' }}
            disabled={loading}
          />
          
          {/* Writing Stats */}
          <div className="flex justify-between mt-4">
            <div className="flex items-center space-x-6">
              <div className={`text-lg font-bold ${getWordCountColor()}`}>
                Words: {wordCount.toLocaleString()}
                {wordCount < minWords && (
                  <span className="text-red-600 ml-2">
                    (min: {minWords})
                  </span>
                )}
              </div>
              <div className={`text-lg font-bold ${getCharCountColor()}`}>
                Characters: {charCount.toLocaleString()}/{maxChars.toLocaleString()}
              </div>
            </div>
            <div className="text-lg font-bold text-gray-600">
              GENRE: OPINION
            </div>
          </div>
          
          {/* Character limit warning */}
          {charCount >= maxChars * 0.9 && (
            <div className="mt-2 text-red-600 font-bold">
              {charCount >= maxChars 
                ? "You've reached the maximum character limit. Please shorten your article."
                : "You're approaching the maximum character limit."}
            </div>
          )}
        </div>

        {/* Grammar Suggestions Panel */}
        {showGrammarPanel && (
          <div className="mb-8 border-2 border-blue-500 bg-blue-50 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                Grammar & Style Suggestions
                {grammarSuggestions.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-600">
                    ({grammarSuggestions.length} found)
                  </span>
                )}
              </h3>
              <button
                onClick={() => setShowGrammarPanel(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            {grammarChecking ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">Checking grammar and style...</p>
              </div>
            ) : grammarSuggestions.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {grammarSuggestions.map((suggestion) => (
                  <div 
                    key={suggestion.id}
                    className={`p-4 border rounded-lg ${
                      selectedSuggestion?.id === suggestion.id 
                        ? 'border-blue-500 bg-blue-100' 
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center mb-1">
                          <span className="text-sm font-bold px-2 py-1 rounded text-red-600 bg-opacity-10">
                            {suggestion.type}
                          </span>
                          <span className="ml-2 text-gray-700">"{suggestion.text}"</span>
                        </div>
                        <p className="text-gray-700 mb-2">{suggestion.message}</p>
                        
                        {suggestion.suggestions && suggestion.suggestions.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-bold text-gray-700 mb-1">Suggestions:</p>
                            <ul className="list-disc pl-5 space-y-1">
                              {suggestion.suggestions.map((rec, index) => (
                                <li key={index} className="text-sm text-gray-600">
                                  {rec.text}: {rec.description}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => highlightSuggestion(suggestion)}
                          className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
                        >
                          Highlight
                        </button>
                        <button
                          onClick={() => applySuggestion(suggestion)}
                          disabled={applyingSuggestion}
                          className="text-sm bg-blue-600 text-white hover:bg-blue-700 px-3 py-1 rounded disabled:opacity-50"
                        >
                          {applyingSuggestion ? 'Applying...' : 'Apply'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-green-600">
                <p className="font-bold">✓ No grammar or style issues found!</p>
                <p className="text-sm mt-1">Your writing looks great!</p>
              </div>
            )}
          </div>
        )}

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="text-lg font-bold mb-2">WRITING PROGRESS</div>
          <div className="w-full bg-gray-200 border-2 border-black">
            <div 
              className="bg-black h-4 transition-all duration-300"
              style={{ 
                width: `${Math.min(100, (wordCount / minWords) * 100)}%` 
              }}
            ></div>
          </div>
          <div className="text-sm font-bold text-gray-600 mt-2">
            {wordCount >= minWords ? 
              'Ready to publish!' : 
              `${minWords - wordCount} more words needed to publish`
            }
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            <button
              onClick={handleSaveDraft}
              disabled={loading || (!formData.title.trim() && !formData.content.trim())}
              className="btn-secondary text-xl px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'SAVING...' : 'SAVE DRAFT'}
            </button>
            
            <button
              onClick={handleClear}
              disabled={loading}
              className="bg-red-600 text-white px-8 py-4 text-xl font-bold border-2 border-red-600 hover:bg-white hover:text-red-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              CLEAR ALL
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              {remainingArticles > 0 ? (
                <div className="text-lg font-bold text-green-600">
                  Ready to publish!
                </div>
              ) : (
                <div className="text-lg font-bold text-red-600">
                  Weekly limit reached
                </div>
              )}
            </div>
            
            <button
              onClick={handlePublish}
              disabled={loading || remainingArticles <= 0 || wordCount < minWords}
              className="btn-primary text-xl px-12 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'PUBLISHING...' : 'PUBLISH ARTICLE'}
            </button>
          </div>
        </div>
      </div>

      {/* Writing Tips */}
      <div className="mt-12 bg-gray-50 border-2 border-black p-8">
        <h2 className="text-3xl font-bold mb-6 text-center">WRITING TIPS FOR POWERFUL OPINIONS</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">📝 STRUCTURE</h3>
            <ul className="space-y-2 text-lg font-bold">
              <li>• Hook readers with an engaging opening</li>
              <li>• State your main argument clearly</li>
              <li>• Use evidence to support your points</li>
              <li>• Address opposing viewpoints</li>
              <li>• End with a memorable conclusion</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-2xl font-bold mb-4">🎯 STYLE</h3>
            <ul className="space-y-2 text-lg font-bold">
              <li>• Write with confidence and conviction</li>
              <li>• Use concrete examples and data</li>
              <li>• Keep sentences clear and direct</li>
              <li>• Show your unique perspective</li>
              <li>• Edit ruthlessly for clarity</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WriteArticle;