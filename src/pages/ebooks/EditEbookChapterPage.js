// src/pages/ebooks/EditEbookChapterPage.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Editor from '../../components/Editor';
import ChapterList from '../../components/ChapterList';

const EditEbookChapterPage = () => {
  const { bookId, chapterId } = useParams();
  const navigate = useNavigate();
  
  const [ebook, setEbook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [currentChapter, setCurrentChapter] = useState({
    title: '',
    content: '',
    status: 'draft'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [errors, setErrors] = useState({});
  
  const autoSaveTimerRef = useRef(null);

  useEffect(() => {
    fetchEbookAndChapters();
    fetchChapter();
  }, [bookId, chapterId]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (hasUnsavedChanges) {
      autoSaveTimerRef.current = setTimeout(() => {
        handleAutoSave();
      }, 30000);
    }
    
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [hasUnsavedChanges, currentChapter]);

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
        axios.get(`/api/ebooks/${bookId}`),
        axios.get(`/api/ebooks/${bookId}/chapters`)
      ]);
      
      setEbook(ebookRes.data.ebook);
      setChapters(chaptersRes.data.chapters);
    } catch (error) {
      console.error('Error fetching ebook:', error);
      alert('Failed to load book. Please try again.');
      navigate(`/ebooks/edit/${bookId}`);
    }
  };

  const fetchChapter = async () => {
    try {
      const response = await axios.get(`/api/ebooks/${bookId}/chapters/${chapterId}`);
      setCurrentChapter(response.data.chapter);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error fetching chapter:', error);
      alert('Failed to load chapter.');
      navigate(`/ebooks/edit/${bookId}`);
    }
  };

  const handleAutoSave = async () => {
    if (!currentChapter.title.trim() || !currentChapter.content.trim()) return;
    
    try {
      setSaving(true);
      
      await axios.put(`/api/ebooks/${bookId}/chapters/${chapterId}`, {
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
      
      // Update existing chapter
      await axios.put(`/api/ebooks/${bookId}/chapters/${chapterId}`, {
        title: currentChapter.title,
        content: currentChapter.content,
        status: currentChapter.status
      });
      
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      
      // Refresh chapters list
      await fetchEbookAndChapters();
    } catch (error) {
      console.error('Error saving chapter:', error);
      setErrors({ submit: error.response?.data?.error || 'Failed to save chapter' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteChapter = async (chapterIdToDelete) => {
    if (!window.confirm('Delete this chapter? This cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/api/ebooks/${bookId}/chapters/${chapterIdToDelete}`);
      
      // If we're deleting the current chapter, navigate to the book edit page
      if (chapterIdToDelete === parseInt(chapterId)) {
        navigate(`/ebooks/edit/${bookId}`);
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
      
      await axios.put(`/api/ebooks/${bookId}/chapters/reorder`, {
        chapter_ids: reorderedChapters.map(ch => ch.id)
      });
    } catch (error) {
      console.error('Error reordering chapters:', error);
      await fetchEbookAndChapters(); // Revert on error
    }
  };

  const handleBackToBook = () => {
    if (hasUnsavedChanges) {
      if (!window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        return;
      }
    }
    navigate(`/ebooks/edit/${bookId}`);
  };

  const handleNavigateToChapter = (newChapterId) => {
    if (hasUnsavedChanges) {
      if (!window.confirm('You have unsaved changes. Are you sure you want to navigate to another chapter?')) {
        return;
      }
    }
    navigate(`/ebooks/${bookId}/edit/chapter/${newChapterId}`);
  };

  const getCurrentChapterIndex = () => {
    return chapters.findIndex(ch => ch.id === parseInt(chapterId));
  };

  const handlePreviousChapter = () => {
    const currentIndex = getCurrentChapterIndex();
    if (currentIndex > 0) {
      handleNavigateToChapter(chapters[currentIndex - 1].id);
    }
  };

  const handleNextChapter = () => {
    const currentIndex = getCurrentChapterIndex();
    if (currentIndex < chapters.length - 1) {
      handleNavigateToChapter(chapters[currentIndex + 1].id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentIndex = getCurrentChapterIndex();
  const isFirstChapter = currentIndex === 0;
  const isLastChapter = currentIndex === chapters.length - 1;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-300 px-4 py-3 flex items-center justify-between">
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
              Editing Chapter {currentIndex + 1} of {chapters.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Chapter Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviousChapter}
              disabled={isFirstChapter}
              className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              title="Previous Chapter"
            >
              ←
            </button>
            <button
              onClick={handleNextChapter}
              disabled={isLastChapter}
              className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              title="Next Chapter"
            >
              →
            </button>
          </div>

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

          {/* Save Button */}
          <button
            onClick={handleSaveChapter}
            disabled={saving || !hasUnsavedChanges}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Chapter'}
          </button>
        </div>
      </div>

      {/* Error Messages */}
      {errors.submit && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3">
          <p className="text-red-700">{errors.submit}</p>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chapter List Sidebar */}
        <div className="w-80 bg-white border-r border-gray-300 overflow-y-auto">
          <ChapterList
            chapters={chapters}
            ebookId={bookId}
            currentChapterId={parseInt(chapterId)}
            onReorder={handleReorderChapters}
            onDelete={handleDeleteChapter}
            onChapterSelect={handleNavigateToChapter}
          />
        </div>

        {/* Editor Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Chapter Title */}
          <div className="bg-white border-b border-gray-300 p-4">
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
            />
            {errors.content && (
              <p className="text-red-500 text-sm mt-1 px-4">{errors.content}</p>
            )}
          </div>

          {/* Chapter Navigation Footer */}
          <div className="bg-white border-t border-gray-300 px-4 py-3 flex justify-between">
            <button
              onClick={handlePreviousChapter}
              disabled={isFirstChapter}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous Chapter
            </button>
            <div className="text-sm text-gray-600">
              Chapter {currentIndex + 1} of {chapters.length}
            </div>
            <button
              onClick={handleNextChapter}
              disabled={isLastChapter}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next Chapter →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEbookChapterPage;