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
    if (autoFocus && editorRef.current) {
      editorRef.current.focus();
    }
  }, [autoFocus]);

  const handleInput = (e) => {
    const html = e.target.innerHTML;
    onChange(html);
    
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
      <div className="editor-toolbar bg-gray-100 border-b border-gray-300 p-2 flex flex-wrap gap-2 sticky top-0 z-10">
        <button onClick={() => execCommand('bold')} className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 font-bold" title="Bold (Ctrl+B)">B</button>
        <button onClick={() => execCommand('italic')} className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 italic" title="Italic (Ctrl+I)">I</button>
        <button onClick={() => execCommand('underline')} className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 underline" title="Underline (Ctrl+U)">U</button>
        <div className="w-px bg-gray-300" />
        <button onClick={() => execCommand('formatBlock', 'h1')} className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-lg font-bold" title="Heading 1">H1</button>
        <button onClick={() => execCommand('formatBlock', 'h2')} className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-base font-bold" title="Heading 2">H2</button>
        <button onClick={() => execCommand('formatBlock', 'h3')} className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm font-bold" title="Heading 3">H3</button>
        <div className="w-px bg-gray-300" />
        <button onClick={() => execCommand('insertUnorderedList')} className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50" title="Bullet List">• List</button>
        <button onClick={() => execCommand('insertOrderedList')} className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50" title="Numbered List">1. List</button>
        <div className="w-px bg-gray-300" />
        <button onClick={() => execCommand('formatBlock', 'blockquote')} className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50" title="Block Quote">" Quote</button>
        <button onClick={() => execCommand('formatBlock', 'pre')} className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 font-mono" title="Code Block">{'</>'}</button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        className="editor-content p-6 min-h-[500px] focus:outline-none prose max-w-none"
        style={{ fontFamily: 'Georgia, serif', fontSize: '18px', lineHeight: '1.8' }}
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
        .editor-content h1 { font-size: 2em; font-weight: bold; margin: 0.67em 0; }
        .editor-content h2 { font-size: 1.5em; font-weight: bold; margin: 0.75em 0; }
        .editor-content h3 { font-size: 1.17em; font-weight: bold; margin: 0.83em 0; }
        .editor-content blockquote { border-left: 4px solid #e5e7eb; padding-left: 1rem; margin: 1rem 0; font-style: italic; color: #6b7280; }
        .editor-content pre { background: #f3f4f6; padding: 1rem; border-radius: 0.375rem; overflow-x: auto; font-family: 'Courier New', monospace; }
        .editor-content ul, .editor-content ol { padding-left: 2rem; margin: 1rem 0; }
        .editor-content li { margin: 0.5rem 0; }
      `}</style>
    </div>
  );
};

// ChapterList component
const ChapterList = ({ chapters, ebookId, onReorder, onDelete, currentChapterId, onChapterSelect }) => {
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
    
    setDraggedIndex(index);
    onReorder(newChapters);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="chapter-list bg-white border border-gray-300 rounded-lg h-full overflow-hidden flex flex-col">
      <div className="p-4 border-b border-gray-300 flex justify-between items-center flex-shrink-0">
        <h3 className="font-bold text-lg">Chapters ({chapters.length})</h3>
      </div>

      <div className="flex-1 overflow-y-auto">
        {chapters.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="mb-2">No chapters yet.</p>
            <p className="text-sm">Create your first chapter below!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {chapters.map((chapter, index) => (
              <div
                key={chapter.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`p-4 cursor-move hover:bg-gray-50 transition ${
                  currentChapterId === chapter.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => onChapterSelect && onChapterSelect(chapter.id)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 font-mono text-sm">{String(index + 1).padStart(2, '0')}</span>
                      <span className="font-semibold text-gray-900">{chapter.title || 'Untitled Chapter'}</span>
                    </div>
                    <div className="mt-1 text-sm text-gray-500 flex gap-4">
                      <span>{chapter.word_count || 0} words</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Delete this chapter? This cannot be undone.')) {
                        onDelete(chapter.id);
                      }
                    }}
                    className="px-3 py-1 text-red-600 hover:bg-red-50 rounded text-sm"
                  >
                    Delete
                  </button>
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
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [errors, setErrors] = useState({});
  
  const autoSaveTimerRef = useRef(null);

  useEffect(() => {
    fetchEbookAndChapters();
  }, [ebookId]);

  useEffect(() => {
    if (selectedChapterId) {
      fetchChapter(selectedChapterId);
    }
  }, [selectedChapterId]);

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
        axios.get(`/ebooks/${ebookId}`),
        axios.get(`/ebooks/${ebookId}/chapters`)
      ]);
      
      setEbook(ebookRes.data.ebook);
      setChapters(chaptersRes.data.chapters);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching ebook:', error);
      alert('Failed to load book. Please try again.');
      navigate('/dashboard');
    }
  };

  const fetchChapter = async (chapterId) => {
    try {
      const response = await axios.get(`/ebooks/${ebookId}/chapters/${chapterId}`);
      setCurrentChapter(response.data.chapter);
      setHasUnsavedChanges(false);
      setErrors({});
    } catch (error) {
      console.error('Error fetching chapter:', error);
      alert('Failed to load chapter.');
    }
  };

  const handleAutoSave = async () => {
    if (!currentChapter.title.trim() || !currentChapter.content.trim() || !selectedChapterId) return;
    
    try {
      setSaving(true);
      
      await axios.put(`/ebooks/${ebookId}/chapters/${selectedChapterId}`, {
        title: currentChapter.title,
        content: currentChapter.content,
        status: currentChapter.status
      });
      
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateChapter = async (e) => {
    e.preventDefault();
    
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
      
      const response = await axios.post(`/ebooks/${ebookId}/chapters`, {
        title: currentChapter.title,
        content: currentChapter.content,
        status: 'draft'
      });
      
      // Add the new chapter to the list
      const newChapter = response.data.chapter;
      setChapters(prev => [...prev, newChapter]);
      
      // Select the new chapter
      setSelectedChapterId(newChapter.id);
      
      // Reset form for next chapter
      setCurrentChapter({
        title: '',
        content: '',
        status: 'draft'
      });
      
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      
      alert('Chapter created successfully!');
    } catch (error) {
      console.error('Error creating chapter:', error);
      setErrors({ submit: error.response?.data?.error || 'Failed to create chapter' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateChapter = async () => {
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
      
      await axios.put(`/ebooks/${ebookId}/chapters/${selectedChapterId}`, {
        title: currentChapter.title,
        content: currentChapter.content,
        status: currentChapter.status
      });
      
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      
      // Refresh chapters list
      await fetchEbookAndChapters();
      
      alert('Chapter updated successfully!');
    } catch (error) {
      console.error('Error updating chapter:', error);
      setErrors({ submit: error.response?.data?.error || 'Failed to update chapter' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteChapter = async (chapterIdToDelete) => {
    try {
      await axios.delete(`/ebooks/${ebookId}/chapters/${chapterIdToDelete}`);
      
      // If we're deleting the currently selected chapter, deselect it
      if (chapterIdToDelete === selectedChapterId) {
        setSelectedChapterId(null);
        setCurrentChapter({
          title: '',
          content: '',
          status: 'draft'
        });
        setHasUnsavedChanges(false);
      }
      
      await fetchEbookAndChapters();
    } catch (error) {
      console.error('Error deleting chapter:', error);
      alert('Failed to delete chapter');
    }
  };

  const handleReorderChapters = async (reorderedChapters) => {
    try {
      setChapters(reorderedChapters);
      
      await axios.put(`/ebooks/${ebookId}/chapters/reorder`, {
        chapter_ids: reorderedChapters.map(ch => ch.id)
      });
    } catch (error) {
      console.error('Error reordering chapters:', error);
      await fetchEbookAndChapters(); // Revert on error
    }
  };

  const handleChapterSelect = (chapterId) => {
    if (hasUnsavedChanges) {
      if (!window.confirm('You have unsaved changes. Are you sure you want to switch chapters?')) {
        return;
      }
    }
    setSelectedChapterId(chapterId);
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-300 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackToBook}
            className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
          >
            ← Back to Book
          </button>
          <div>
            <h1 className="font-bold text-lg">{ebook?.title}</h1>
            <p className="text-sm text-gray-600">
              {selectedChapterId ? 'Editing Chapter' : 'Create New Chapter'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Save Status */}
          <div className="text-sm text-gray-600">
            {saving ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600"></div>
                Saving...
              </span>
            ) : lastSaved ? (
              <span>Saved {new Date(lastSaved).toLocaleTimeString()}</span>
            ) : hasUnsavedChanges ? (
              <span className="text-orange-600">Unsaved changes</span>
            ) : null}
          </div>

          {/* Action Buttons */}
          {selectedChapterId ? (
            <>
              <button
                onClick={handleUpdateChapter}
                disabled={saving || !hasUnsavedChanges}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={handleNewChapter}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                + New Chapter
              </button>
            </>
          ) : (
            <button
              onClick={handleCreateChapter}
              disabled={saving}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {saving ? 'Creating...' : 'Create Chapter'}
            </button>
          )}
        </div>
      </div>

      {/* Error Messages */}
      {errors.submit && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3 flex-shrink-0">
          <p className="text-red-700">{errors.submit}</p>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chapter List Sidebar */}
        <div className="w-80 bg-white border-r border-gray-300 flex-shrink-0">
          <ChapterList
            chapters={chapters}
            ebookId={ebookId}
            currentChapterId={selectedChapterId}
            onReorder={handleReorderChapters}
            onDelete={handleDeleteChapter}
            onChapterSelect={handleChapterSelect}
          />
        </div>

        {/* Editor Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Chapter Title */}
          <div className="bg-white border-b border-gray-300 p-4 flex-shrink-0">
            <input
              type="text"
              value={currentChapter.title}
              onChange={(e) => {
                setCurrentChapter(prev => ({ ...prev, title: e.target.value }));
                setHasUnsavedChanges(true);
                if (errors.title) {
                  setErrors(prev => ({ ...prev, title: '' }));
                }
              }}
              placeholder="Chapter Title..."
              className={`w-full text-2xl font-bold px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              maxLength={255}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Editor */}
          <div className="flex-1 overflow-y-auto bg-white">
            <Editor
              content={currentChapter.content}
              onChange={(content) => {
                setCurrentChapter(prev => ({ ...prev, content }));
                setHasUnsavedChanges(true);
                if (errors.content) {
                  setErrors(prev => ({ ...prev, content: '' }));
                }
              }}
              placeholder="Start writing your chapter..."
              autoFocus={!selectedChapterId}
            />
            {errors.content && (
              <p className="text-red-500 text-sm mt-1 px-4">{errors.content}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WriteEbookChapterPage;