// src/pages/WriteCounterPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { 
  MessageSquare, 
  ArrowLeft, 
  Send, 
  AlertCircle, 
  CheckCircle,
  Clock,
  Eye,
  User,
  Hash,
  X,
  FileText,
  PenTool,
  Sparkles,
  Zap,
  Quote,
  Bold,
  Italic,
  List,
  Link
} from 'lucide-react';

const WriteCounterPage = () => {
  const [searchParams] = useSearchParams();
  const originalArticleId = searchParams.get('originalArticleId');
  const { user } = useUser();
  const navigate = useNavigate();
  const [originalArticle, setOriginalArticle] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState('write');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [selectedText, setSelectedText] = useState('');
  const [showFormattingToolbar, setShowFormattingToolbar] = useState(false);

  useEffect(() => {
    const fetchOriginalArticle = async () => {
      if (!originalArticleId) return;
      
      try {
        const response = await axios.get(`/articles/${originalArticleId}`);
        setOriginalArticle(response.data.article);
        
        // Pre-fill the counter title with "Counter to: [Original Title]"
        setTitle(`Counter to: ${response.data.article.title}`);
      } catch (err) {
        setError('Failed to load original article');
        console.error('Error fetching original article:', err);
      }
    };

    fetchOriginalArticle();
  }, [originalArticleId]);

  useEffect(() => {
    // Update word and character count
    setWordCount(content.trim().split(/\s+/).filter(word => word.length > 0).length);
    setCharCount(content.length);
  }, [content]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await axios.post('/articles', {
        title: title.trim(),
        content: content.trim(),
        published: true,
        parent_article_id: originalArticleId
      });

      setSuccess(true);
      // After publishing, navigate back to the original article page
      setTimeout(() => {
        navigate(`/article/${originalArticleId}?counterPublished=true`);
      }, 2000);
    } catch (err) {
      setLoading(false);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to publish counter opinion');
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatContent = (htmlContent) => {
    // Simple HTML to text conversion for display
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  const handleTextSelection = () => {
    const textarea = document.getElementById('content');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    setSelectedText(selectedText);
    setShowFormattingToolbar(selectedText.length > 0);
  };

  const applyFormatting = (format) => {
    const textarea = document.getElementById('content');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let formattedText = '';
    switch(format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'quote':
        formattedText = `> ${selectedText}`;
        break;
      case 'list':
        formattedText = `\n- ${selectedText}`;
        break;
      case 'link':
        formattedText = `[${selectedText}](url)`;
        break;
      default:
        formattedText = selectedText;
    }
    
    const newContent = content.substring(0, start) + formattedText + content.substring(end);
    setContent(newContent);
    setShowFormattingToolbar(false);
    
    // Set cursor position after formatted text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
    }, 0);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h1>
          <p className="text-gray-600 mb-6">You need to be logged in to write a counter opinion.</p>
          <button 
            onClick={() => navigate('/login')}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-3 px-4 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200"
          >
            LOG IN
          </button>
        </div>
      </div>
    );
  }

  if (!originalArticle && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading Article</h1>
          <p className="text-gray-600">Please wait while we fetch the original article...</p>
        </div>
      </div>
    );
  }

  if (error && !originalArticle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => navigate(-1)}
            className="w-full bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-xl hover:bg-gray-300 transition-all duration-200"
          >
            GO BACK
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Write Counter Opinion</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('write')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'write' 
                    ? 'bg-orange-100 text-orange-600' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <PenTool className="w-4 h-4 mr-2" />
                Write
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'preview' 
                    ? 'bg-orange-100 text-orange-600' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Success Message */}
      {success && (
        <div className="fixed top-20 right-4 max-w-sm bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 animate-fade-in">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span className="font-medium">Counter opinion published successfully!</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Original Article Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-24">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Original Article
                </h2>
              </div>
              
              {originalArticle && (
                <div className="p-6">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{originalArticle.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{originalArticle.display_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(originalArticle.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{originalArticle.views?.toLocaleString() || 0}</span>
                      </div>
                    </div>
                    {originalArticle.topics && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {originalArticle.topics.map((topic, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                            #{topic}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="prose prose-sm max-h-96 overflow-y-auto pr-2">
                    <div 
                      dangerouslySetInnerHTML={{ __html: originalArticle.content }} 
                      className="text-gray-700 leading-relaxed"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Writing Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 text-white">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <PenTool className="w-5 h-5" />
                  Your Counter Opinion
                </h2>
              </div>
              
              <div className="p-6">
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                    <p className="font-medium">{error}</p>
                  </div>
                )}
                
                {activeTab === 'write' ? (
                  <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Enter your counter opinion title..."
                        required
                      />
                    </div>
                    
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                          Content
                        </label>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{wordCount} words</span>
                          <span>{charCount} characters</span>
                        </div>
                      </div>
                      
                      {/* Formatting Toolbar */}
                      <div className="mb-2 p-2 bg-gray-50 rounded-t-lg border border-gray-300 border-b-0 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => applyFormatting('bold')}
                          className="p-2 rounded hover:bg-gray-200 transition-colors"
                          title="Bold"
                        >
                          <Bold className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => applyFormatting('italic')}
                          className="p-2 rounded hover:bg-gray-200 transition-colors"
                          title="Italic"
                        >
                          <Italic className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => applyFormatting('quote')}
                          className="p-2 rounded hover:bg-gray-200 transition-colors"
                          title="Quote"
                        >
                          <Quote className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => applyFormatting('list')}
                          className="p-2 rounded hover:bg-gray-200 transition-colors"
                          title="List"
                        >
                          <List className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => applyFormatting('link')}
                          className="p-2 rounded hover:bg-gray-200 transition-colors"
                          title="Link"
                        >
                          <Link className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onSelect={handleTextSelection}
                        rows={12}
                        className="w-full px-4 py-3 border border-gray-300 rounded-b-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                        placeholder="Write your counter opinion..."
                        required
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-t-2 border-r-2 border-white rounded-full animate-spin mr-2"></div>
                            PUBLISHING...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            PUBLISH COUNTER OPINION
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div>
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">{title || "Untitled Counter Opinion"}</h2>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{user.display_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(new Date().toISOString())}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Hash className="w-4 h-4" />
                          <span>{wordCount} words</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="prose max-w-none">
                      <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                        {content || "Your counter opinion will appear here..."}
                      </div>
                    </div>
                    
                    <div className="mt-8 flex justify-end gap-4">
                      <button
                        onClick={() => setActiveTab('write')}
                        className="px-6 py-2 bg-gray-200 text-gray-800 font-medium rounded-xl hover:bg-gray-300 transition-all duration-200"
                      >
                        CONTINUE EDITING
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-8 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-t-2 border-r-2 border-white rounded-full animate-spin mr-2"></div>
                            PUBLISHING...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            PUBLISH COUNTER OPINION
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WriteCounterPage;