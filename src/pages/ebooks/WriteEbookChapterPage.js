// src/pages/ebooks/WriteEbookChapterPage.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Editor component (simplified, keeping same functionality)
const Editor = ({ content, onChange, placeholder = "Start writing your chapter...", autoFocus = false }) => {
  const editorRef = useRef(null);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content || '';
    }
  }, [content]);

  useEffect(() => {
    const handleInput = () => {
      if (!editorRef.current) return;
      
      const html = editorRef.current.innerHTML;
      const text = html.replace(/<[^>]*>/g, '');
      const words = text.trim().split(/\s+/).filter(w => w.length > 0);
      setWordCount(words.length);
      setCharCount(text.length);
      
      if (onChange) {
        onChange(html);
      }
    };

    const element = editorRef.current;
    if (element) {
      element.addEventListener('input', handleInput);
      return () => element.removeEventListener('input', handleInput);
    }
  }, []);

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      execCommand('bold');
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault();
      execCommand('italic');
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
      e.preventDefault();
      execCommand('underline');
    }
  };

  return (
    <div className="editor-container">
      <div className="editor-toolbar bg-gray-50 border-b border-gray-200 p-3 flex flex-wrap gap-2">
        <button onClick={() => execCommand('bold')} className="px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 font-bold" title="Bold (Ctrl+B)">B</button>
        <button onClick={() => execCommand('italic')} className="px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 italic" title="Italic (Ctrl+I)">I</button>
        <button onClick={() => execCommand('underline')} className="px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 underline" title="Underline (Ctrl+U)">U</button>
        <div className="w-px bg-gray-300"></div>
        <button onClick={() => execCommand('formatBlock', 'h1')} className="px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-lg font-bold" title="Heading 1">H1</button>
        <button onClick={() => execCommand('formatBlock', 'h2')} className="px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-base font-bold" title="Heading 2">H2</button>
        <button onClick={() => execCommand('formatBlock', 'h3')} className="px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm font-bold" title="Heading 3">H3</button>
        <div className="w-px bg-gray-300"></div>
        <button onClick={() => execCommand('insertUnorderedList')} className="px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100" title="Bullet List">• List</button>
        <button onClick={() => execCommand('insertOrderedList')} className="px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100" title="Numbered List">1. List</button>
        <div className="w-px bg-gray-300"></div>
        <button onClick={() => execCommand('formatBlock', 'blockquote')} className="px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100" title="Block Quote">" Quote</button>
        <button onClick={() => execCommand('formatBlock', 'pre')} className="px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 font-mono" title="Code Block">{'</>'}</button>
      </div>
      
      <div
        ref={editorRef}
        contentEditable
        className="editor-content p-6 min-h-[500px] focus:outline-none prose prose-lg max-w-none"
        style={{ fontFamily: 'Georgia, serif', fontSize: '18px', lineHeight: '1.8' }}
        placeholder={placeholder}
        autoFocus={autoFocus}
      />
      
      <div className="editor-footer bg-gray-50 border-t border-gray-200 px-4 py-2 flex justify-between text-sm text-gray-600">
        <span>Words: {wordCount}</span>
        <span>Characters: {charCount}</span>
      </div>
      
      <style jsx>{`
        .editor-content:empty:before {
          content: attr(placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        
        .editor-content h1 { font-size: 2em; font-weight: bold; margin: 0.67em 0; }
        .editor-content h2 { font-size: 1.5em; font-weight: bold; margin: 0.83em 0; }
        .editor-content h3 { font-size: 1.17em; font-weight: bold; margin: 1em 0; }
        .editor-content p { margin: 1em 0; }
        .editor-content blockquote { border-left: 4px solid #ddd; padding-left: 1em; margin: 1em 0; color: #666; font-style: italic; }
        .editor-content pre { background: #f4f4f4; padding: 1em; border-radius: 0.375rem; overflow-x: auto; font-family: monospace; }
        .editor-content ul, .editor-content ol { padding-left: 2em; margin: 1em 0; }
        .editor-content li { margin: 0.5em 0; }
      `}</style>
    </div>
  );
};

// ChapterList component (simplified, keeping same functionality)
const ChapterList = ({ chapters, currentChapterId, onReorder, onDelete, onChapterSelect }) => {
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newChapters = [...chapters];
    const draggedChapter = newChapters[draggedIndex];
    newChapters.splice(draggedIndex, 1);
    newChapters.splice(index, 0, draggedChapter);
    
    onReorder(newChapters);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="chapter-list bg-white rounded-lg shadow-sm border border-gray-200 h-full overflow-hidden flex flex-col">
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <h3 className="font-semibold text-gray-900">Chapters ({chapters.length})</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {chapters.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-2">No chapters yet</p>
            <p className="text-sm">Create your first chapter to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {chapters.map((chapter, index) => (
              <div
                key={chapter.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`p-4 border rounded-lg cursor-move transition-all ${
                  currentChapterId === chapter.id 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => onChapterSelect && onChapterSelect(chapter.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-gray-400 font-mono text-sm">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <h4 className="font-semibold text-gray-900 truncate">
                        {chapter.title || 'Untitled Chapter'}
                      </h4>
                    </div>
                    <div className="text-sm text-gray-500">
                      {chapter.word_count?.toLocaleString() || 0} words
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onChapterSelect && onChapterSelect(chapter.id);
                      }}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit chapter"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Delete this chapter? This cannot be undone.')) {
                          onDelete(chapter.id);
                        }
                      }}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                      title="Delete chapter"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Main WriteEbookChapterPage component
const WriteEbookChapterPage = () => {
  const { ebookId } = useParams();
  const navigate = useNavigate();
  
  const [ebook, setEbook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [currentChapter, setCurrentChapter] = useState({
    title: '',
    content: '',
    status: 'draft'
  });
  const [selectedChapterId, setSelectedChapterId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [errors, setErrors] = useState({});
  const [activeView, setActiveView] = useState('editor'); // 'editor' or 'list'
  
  const autoSaveTimerRef = useRef(null);

  useEffect(() => {
    fetchEbookAndChapters();
  }, [ebookId]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (hasUnsavedChanges && selectedChapterId) {
      autoSaveTimerRef.current = setTimeout(() => {
        handleAutoSave();
      }, 30000);
    }
    
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [hasUnsavedChanges, currentChapter, selectedChapterId]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const fetchEbookAndChapters = async () => {
    try {
      const [ebookRes, chaptersRes] = await Promise.all([
        axios.get(`/api/ebooks/${ebookId}`),
        axios.get(`/api/ebooks/${ebookId}/chapters`)
      ]);
      
      setEbook(ebookRes.data.ebook);
      setChapters(chaptersRes.data.chapters);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching ebook:', error);
      alert('Failed to load book. Please try again.');
      navigate('/ebooks');
    }
  };

  const handleChapterChange = (field, value) => {
    setCurrentChapter(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSaveChapter = async () => {
    if (!currentChapter.title.trim()) {
      setErrors({ title: 'Chapter title is required' });
      return;
    }

    if (!currentChapter.content.trim()) {
      setErrors({ content: 'Chapter content is required' });
      return;
    }

    try {
      setSaving(true);
      setErrors({});
      
      if (selectedChapterId) {
        // Update existing chapter
        await axios.put(`/api/ebooks/${ebookId}/chapters/${selectedChapterId}`, {
          title: currentChapter.title,
          content: currentChapter.content,
          status: currentChapter.status
        });
        
        // Update chapters list
        setChapters(prev => prev.map(ch => 
          ch.id === selectedChapterId 
            ? { ...ch, ...currentChapter }
            : ch
        ));
      } else {
        // Create new chapter
        const response = await axios.post(`/api/ebooks/${ebookId}/chapters`, {
          title: currentChapter.title,
          content: currentChapter.content,
          status: currentChapter.status
        });
        
        // Add to chapters list
        setChapters(prev => [...prev, response.data.chapter]);
        
        // Select the newly created chapter
        setSelectedChapterId(response.data.chapter.id);
      }
      
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving chapter:', error);
      setErrors({ submit: error.response?.data?.error || 'Failed to save chapter' });
    } finally {
      setSaving(false);
    }
  };

  const handleAutoSave = async () => {
    if (!selectedChapterId || !currentChapter.title.trim() || !currentChapter.content.trim()) return;
    
    try {
      await axios.put(`/api/ebooks/${ebookId}/chapters/${selectedChapterId}`, {
        title: currentChapter.title,
        content: currentChapter.content,
        status: currentChapter.status
      });
      
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  const handleDeleteChapter = async (chapterId) => {
    try {
      await axios.delete(`/api/ebooks/${ebookId}/chapters/${chapterId}`);
      
      // Remove from chapters list
      setChapters(prev => prev.filter(ch => ch.id !== chapterId));
      
      // If we were editing this chapter, reset the form
      if (selectedChapterId === chapterId) {
        setSelectedChapterId(null);
        setCurrentChapter({
          title: '',
          content: '',
          status: 'draft'
        });
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      console.error('Error deleting chapter:', error);
      alert('Failed to delete chapter');
    }
  };

  const handleReorderChapters = async (reorderedChapters) => {
    try {
      await axios.put(`/api/ebooks/${ebookId}/chapters/reorder`, {
        chapter_ids: reorderedChapters.map(ch => ch.id)
      });
      
      setChapters(reorderedChapters);
    } catch (error) {
      console.error('Error reordering chapters:', error);
      alert('Failed to reorder chapters');
    }
  };

  const handleChapterSelect = (chapterId) => {
    if (hasUnsavedChanges) {
      if (!window.confirm('You have unsaved changes. Are you sure you want to switch chapters?')) {
        return;
      }
    }
    
    const chapter = chapters.find(ch => ch.id === chapterId);
    if (chapter) {
      setSelectedChapterId(chapterId);
      setCurrentChapter({
        title: chapter.title,
        content: chapter.content,
        status: chapter.status
      });
      setHasUnsavedChanges(false);
      setErrors({});
      setActiveView('editor');
    }
  };

  const handleNewChapter = () => {
    if (hasUnsavedChanges) {
      if (!window.confirm('You have unsaved changes. Are you sure you want to create a new chapter?')) {
        return;
      }
    }
    
    setSelectedChapterId(null);
    setCurrentChapter({
      title: '',
      content: '',
      status: 'draft'
    });
    setHasUnsavedChanges(false);
    setErrors({});
    setActiveView('editor');
  };

  const handleBackToBook = () => {
    if (hasUnsavedChanges) {
      if (!window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        return;
      }
    }
    
    navigate(`/ebooks/edit/${ebookId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading book...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar with Chapter List */}
      <div className="w-80 bg-white border-r border-gray-200 flex-shrink-0">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-2">{ebook?.title || 'Untitled Book'}</h2>
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveView('list')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                activeView === 'list' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Chapters
            </button>
            <button
              onClick={() => setActiveView('editor')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                activeView === 'editor' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Editor
            </button>
          </div>
        </div>
        
        {activeView === 'list' ? (
          <ChapterList
            chapters={chapters}
            currentChapterId={selectedChapterId}
            onReorder={handleReorderChapters}
            onDelete={handleDeleteChapter}
            onChapterSelect={handleChapterSelect}
          />
        ) : (
          <div className="p-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-blue-900 mb-2">Current Chapter</h3>
              <p className="text-blue-700 truncate">
                {currentChapter.title || 'Untitled Chapter'}
              </p>
              <div className="flex justify-between mt-2">
                <span className="text-sm text-blue-600">
                  {currentChapter.word_count || 0} words
                </span>
                <button
                  onClick={() => setActiveView('editor')}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Edit
                </button>
              </div>
            </div>
            
            <button
              onClick={handleNewChapter}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              + Create New Chapter
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              {selectedChapterId ? 'Edit Chapter' : 'Create New Chapter'}
            </h1>
            <button
              onClick={handleBackToBook}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
            >
              ← Back to Book
            </button>
          </div>
        </div>

        {/* Editor or Chapter List */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {activeView === 'editor' ? (
            <div className="flex-1 flex flex-col">
              {/* Chapter Title */}
              <div className="bg-white border-b border-gray-200 px-6 py-4">
                <input
                  type="text"
                  value={currentChapter.title}
                  onChange={(e) => handleChapterChange('title', e.target.value)}
                  placeholder="Chapter Title..."
                  className={`w-full text-xl font-semibold px-4 py-2 border-b-2 focus:outline-none focus:border-blue-500 ${
                    errors.title ? 'border-red-500' : 'border-transparent'
                  }`}
                  maxLength={255}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              {/* Editor */}
              <div className="flex-1 overflow-hidden">
                <Editor
                  content={currentChapter.content}
                  onChange={handleChapterChange}
                  placeholder="Start writing your chapter..."
                  autoFocus={!selectedChapterId}
                />
              </div>

              {/* Save Status */}
              <div className="bg-gray-50 border-t border-gray-200 px-6 py-3 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {saving ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-t border-b border-blue-600"></div>
                        Saving...
                      </span>
                    ) : lastSaved ? (
                      <span>Saved {new Date(lastSaved).toLocaleTimeString()}</span>
                    ) : hasUnsavedChanges ? (
                      <span className="text-orange-600">Unsaved changes</span>
                    ) : null}
                  </div>
                  <div className="flex gap-3">
                    {selectedChapterId && (
                      <button
                        onClick={handleSaveChapter}
                        disabled={saving || !hasUnsavedChanges}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    )}
                    <button
                      onClick={handleNewChapter}
                      disabled={saving}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      + New Chapter
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <ChapterList
              chapters={chapters}
              currentChapterId={selectedChapterId}
              onReorder={handleReorderChapters}
              onDelete={handleDeleteChapter}
              onChapterSelect={handleChapterSelect}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default WriteEbookChapterPage;