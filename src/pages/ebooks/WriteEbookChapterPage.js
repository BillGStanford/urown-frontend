// src/pages/ebooks/WriteEbookChapterPage.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Editor from '../../components/Editor';
import ChapterList from '../../components/ChapterList';

const WriteEbookChapterPage = () => {
  const { ebookId, chapterId } = useParams();
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
  
  const autoSaveTimerRef = useRef(null);
  const isNewChapter = !chapterId;

  useEffect(() => {
    fetchEbookAndChapters();
  }, [ebookId]);

  useEffect(() => {
    if (chapterId) {
      fetchChapter();
    }
  }, [chapterId]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (hasUnsavedChanges && !isNewChapter) {
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
        axios.get(`/api/ebooks/${ebookId}`),
        axios.get(`/api/ebooks/${ebookId}/chapters`)
      ]);
      
      setEbook(ebookRes.data.ebook);
      setChapters(chaptersRes.data.chapters);
    } catch (error) {
      console.error('Error fetching ebook:', error);
      alert('Failed to load book. Please try again.');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchChapter = async () => {
    try {
      const response = await axios.get(`/api/ebooks/${ebookId}/chapters/${chapterId}`);
      setCurrentChapter(response.data.chapter);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error fetching chapter:', error);
      alert('Failed to load chapter.');
    }
  };

  const handleAutoSave = async () => {
    if (!currentChapter.title.trim() || !currentChapter.content.trim()) return;
    
    try {
      setSaving(true);
      
      if (isNewChapter) {
        // Don't auto-save new chapters
        return;
      }
      
      await axios.put(`/api/ebooks/${ebookId}/chapters/${chapterId}`, {
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
      alert('Please enter a chapter title');
      return;
    }

    if (!currentChapter.content.trim()) {
      alert('Please add some content to the chapter');
      return;
    }

    try {
      setSaving(true);
      
      if (isNewChapter) {
        // Create new chapter
        const response = await axios.post(`/api/ebooks/${ebookId}/chapters`, {
          title: currentChapter.title,
          content: currentChapter.content,
          status: currentChapter.status
        });
        
        // Navigate to edit mode for this chapter
        navigate(`/ebooks/edit/${ebookId}/chapter/${response.data.chapter.id}`);
      } else {
        // Update existing chapter
        await axios.put(`/api/ebooks/${ebookId}/chapters/${chapterId}`, {
          title: currentChapter.title,
          content: currentChapter.content,
          status: currentChapter.status
        });
      }
      
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      
      // Refresh chapters list
      await fetchEbookAndChapters();
    } catch (error) {
      console.error('Error saving chapter:', error);
      alert(error.response?.data?.error || 'Failed to save chapter');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteChapter = async (chapterIdToDelete) => {
    try {
      await axios.delete(`/api/ebooks/${ebookId}/chapters/${chapterIdToDelete}`);
      
      // If we're deleting the current chapter, navigate away
      if (chapterIdToDelete === parseInt(chapterId)) {
        navigate(`/ebooks/write/${ebookId}/chapter`);
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
      
      await axios.put(`/api/ebooks/${ebookId}/chapters/reorder`, {
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
              {isNewChapter ? 'New Chapter' : 'Editing Chapter'}
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

          {/* Save Button */}
          <button
            onClick={handleSaveChapter}
            disabled={saving || (!isNewChapter && !hasUnsavedChanges)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isNewChapter ? 'Create Chapter' : 'Save Chapter'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chapter List Sidebar */}
        <div className="w-80 bg-white border-r border-gray-300 overflow-y-auto">
          <ChapterList
            chapters={chapters}
            ebookId={ebookId}
            currentChapterId={chapterId ? parseInt(chapterId) : null}
            onReorder={handleReorderChapters}
            onDelete={handleDeleteChapter}
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
              }}
              placeholder="Chapter Title..."
              className="w-full text-2xl font-bold px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={255}
            />
          </div>

          {/* Editor */}
          <div className="flex-1 overflow-y-auto bg-white">
            <Editor
              content={currentChapter.content}
              onChange={(content) => {
                setCurrentChapter(prev => ({ ...prev, content }));
                setHasUnsavedChanges(true);
              }}
              placeholder="Start writing your chapter..."
              autoFocus={isNewChapter}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WriteEbookChapterPage;