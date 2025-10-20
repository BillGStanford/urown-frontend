// src/pages/CreateDebateTopic.js
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { ArrowLeft, Save, AlertCircle, Clock, MessageSquare, Bold, Italic, List, ListOrdered } from 'lucide-react';

function CreateDebateTopic() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (!user || (user.role !== 'editorial-board' && user.role !== 'admin' && user.role !== 'super-admin')) {
      navigate('/');
    }
  }, [user, navigate]);

  const insertFormatting = (format) => {
    const textarea = document.getElementById('description');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = description.substring(start, end);
    let formattedText = '';
    
    switch(format) {
      case 'bold':
        formattedText = `**${selectedText || 'bold text'}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText || 'italic text'}*`;
        break;
      case 'list':
        formattedText = `\n- ${selectedText || 'List item'}`;
        break;
      case 'orderedList':
        formattedText = `\n1. ${selectedText || 'List item'}`;
        break;
      default:
        formattedText = selectedText;
    }
    
    const newDescription = description.substring(0, start) + formattedText + description.substring(end);
    setDescription(newDescription);
    
    // Set cursor position after the inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
    }, 0);
  };

  const renderPreview = () => {
    // Simple markdown-like parser
    let html = description
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
      .replace(/^- (.+)$/gm, '<li>$1</li>') // Unordered list
      .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>') // Ordered list
      .replace(/\n/g, '<br>'); // Line breaks
    
    // Wrap list items in proper tags
    html = html.replace(/(<li>.*?<\/li>)/s, '<ul>$1</ul>');
    html = html.replace(/(<ul>.*?<\/li>)(?!<li>)/s, '$1</ul>');
    
    return { __html: html };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      setError('Title and description are required');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Create debate topic with formatted description
      const response = await axios.post('/debate-topics', {
        title: title.trim(),
        description: description.trim()
      });
      
      setSuccess(true);
      
      // Navigate to the debate category page after a short delay
      setTimeout(() => {
        navigate(`/debate/${response.data.topic.id}`);
      }, 1500);
      
    } catch (error) {
      console.error('Error creating debate topic:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error);
      } else {
        setError('Failed to create debate topic. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white py-12 px-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white border-2 border-green-500 rounded-lg p-8 text-center">
          <div className="text-green-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-green-700 mb-2">Debate Topic Created Successfully!</h2>
          <p className="text-gray-600 mb-6">Your debate topic is now live and will be active for 24 hours.</p>
          <p className="text-sm text-gray-500">Redirecting to the debate page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate('/editorial')}
          className="flex items-center text-blue-600 mb-8 hover:text-blue-800"
        >
          <ArrowLeft className="mr-2" size={20} />
          Back to Editorial Board
        </button>
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Create New Debate Topic</h1>
          <p className="text-xl text-gray-600">Start a new debate that will be active for 24 hours</p>
        </div>
        
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start mb-4">
            <MessageSquare className="text-blue-600 mr-3 mt-1" size={24} />
            <div>
              <h3 className="text-lg font-bold text-blue-800">About Debate Topics</h3>
              <p className="text-blue-700">
                Debate topics allow users to share their opinions on current issues. Each topic is active for exactly 24 hours, 
                after which it will be permanently deleted along with all opinions. Users can only write one opinion per topic.
              </p>
            </div>
          </div>
          
          <div className="flex items-start mt-4">
            <Clock className="text-blue-600 mr-3 mt-1" size={24} />
            <div>
              <h3 className="text-lg font-bold text-blue-800">24-Hour Lifecycle</h3>
              <p className="text-blue-700">
                After 24 hours, the debate topic and all opinions will be automatically and permanently deleted from the system. 
                This ensures debates remain current and relevant.
              </p>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-white border-2 border-gray-200 rounded-lg shadow-sm p-8">
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-md mb-6">
              <div className="flex items-center">
                <AlertCircle className="mr-2" size={20} />
                <span className="font-bold">{error}</span>
              </div>
            </div>
          )}
          
          <div className="mb-8">
            <label htmlFor="title" className="block text-gray-700 text-lg font-bold mb-3">
              Debate Topic Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              placeholder="Enter a clear, engaging title for the debate topic"
              maxLength={255}
            />
            <div className="text-sm text-gray-500 mt-2">
              {title.length}/255 characters
            </div>
          </div>
          
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <label htmlFor="description" className="block text-gray-700 text-lg font-bold">
                Description
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewMode(!previewMode)}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    previewMode 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {previewMode ? 'Edit' : 'Preview'}
                </button>
              </div>
            </div>
            
            {!previewMode ? (
              <>
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => insertFormatting('bold')}
                    className="p-2 border border-gray-300 rounded hover:bg-gray-100"
                    title="Bold"
                  >
                    <Bold size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('italic')}
                    className="p-2 border border-gray-300 rounded hover:bg-gray-100"
                    title="Italic"
                  >
                    <Italic size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('list')}
                    className="p-2 border border-gray-300 rounded hover:bg-gray-100"
                    title="Bullet List"
                  >
                    <List size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('orderedList')}
                    className="p-2 border border-gray-300 rounded hover:bg-gray-100"
                    title="Numbered List"
                  >
                    <ListOrdered size={18} />
                  </button>
                </div>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                  placeholder="Provide context, background information, and specific questions to guide the debate. You can use markdown for formatting: **bold**, *italic*, - list items, 1. numbered lists"
                ></textarea>
                <div className="text-sm text-gray-500 mt-2">
                  You can use markdown for formatting. Press the formatting buttons or use markdown syntax directly.
                </div>
              </>
            ) : (
              <div className="border-2 border-gray-300 rounded-md p-4 min-h-[200px] bg-gray-50">
                <div dangerouslySetInnerHTML={renderPreview()} />
              </div>
            )}
          </div>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-bold text-yellow-800 mb-2">Important Information</h3>
                <ul className="list-disc pl-5 space-y-2 text-yellow-700">
                  <li>This debate topic will be active for exactly 24 hours</li>
                  <li>After 24 hours, it will be permanently deleted along with all opinions</li>
                  <li>Users can only write one opinion per debate topic</li>
                  <li>Best opinions may be selected by the editorial board for preservation</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/editorial')}
              disabled={loading}
              className="mr-4 px-6 py-3 border-2 border-gray-300 rounded-md text-gray-700 font-bold hover:bg-gray-100 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim() || !description.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-md flex items-center text-lg font-bold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-3">
                    <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="mr-3" size={20} />
                  Create Debate Topic
                </>
              )}
            </button>
          </div>
        </form>
        
        <div className="mt-12 bg-gray-50 border-2 border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Tips for Creating Effective Debate Topics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-bold text-gray-800 mb-2">🎯 Be Specific</h4>
              <p className="text-gray-600">Clearly define the scope of the debate to keep discussions focused.</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-2">⚖️ Stay Balanced</h4>
              <p className="text-gray-600">Present the topic in a neutral way that doesn't favor one side.</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-2">❓ Ask Questions</h4>
              <p className="text-gray-600">Include specific questions to guide users' responses.</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-2">📚 Provide Context</h4>
              <p className="text-gray-600">Give enough background information for informed opinions.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateDebateTopic;