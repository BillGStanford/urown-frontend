// src/pages/ebooks/ReadEbookChapterPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import EbookReader from '../../components/EbookReader';
import { useUser } from '../../context/UserContext';

const ReadEbookChapterPage = () => {
  const { id, chapterId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  
  const [ebook, setEbook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEbookAndChapters();
  }, [id]);

  useEffect(() => {
    // Update reading progress when chapter changes
    if (user && ebook && chapters.length > 0) {
      saveReadingProgress();
    }
  }, [currentChapterIndex, user, ebook, chapters]);

  const fetchEbookAndChapters = async () => {
    try {
      const [ebookRes, chaptersRes] = await Promise.all([
        axios.get(`/ebooks/${id}`),
        axios.get(`/ebooks/${id}/chapters`)
      ]);
      
      const ebookData = ebookRes.data.ebook;
      const chaptersData = chaptersRes.data.chapters;
      
      setEbook(ebookData);
      setChapters(chaptersData);

      // Determine starting chapter
      if (chapterId) {
        const chapterIndex = chaptersData.findIndex(ch => ch.id === parseInt(chapterId));
        setCurrentChapterIndex(chapterIndex >= 0 ? chapterIndex : 0);
      } else if (user) {
        // Try to load last read position
        try {
          const progressRes = await axios.get(`/ebooks/${id}/reading-progress`);
          if (progressRes.data.progress?.current_chapter_id) {
            const lastChapterIndex = chaptersData.findIndex(
              ch => ch.id === progressRes.data.progress.current_chapter_id
            );
            if (lastChapterIndex >= 0) {
              setCurrentChapterIndex(lastChapterIndex);
            }
          }
        } catch (error) {
          // No saved progress, start from beginning
        }
      }
    } catch (error) {
      console.error('Error fetching ebook:', error);
      alert('Failed to load book');
      navigate('/ebooks');
    } finally {
      setLoading(false);
    }
  };

  const saveReadingProgress = async () => {
    if (!user || chapters.length === 0) return;

    try {
      const currentChapter = chapters[currentChapterIndex];
      const progressPercent = Math.round(
        ((currentChapterIndex + 1) / chapters.length) * 100
      );

      await axios.post(`/ebooks/${id}/reading-progress`, {
        current_chapter_id: currentChapter.id,
        progress_percent: progressPercent
      });
    } catch (error) {
      console.error('Error saving reading progress:', error);
    }
  };

  const handleChapterChange = (newIndex) => {
    if (newIndex >= 0 && newIndex < chapters.length) {
      setCurrentChapterIndex(newIndex);
      
      // Update URL without page reload
      const newChapterId = chapters[newIndex].id;
      window.history.pushState(
        null,
        '',
        `/ebooks/${id}/read/${newChapterId}`
      );
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!ebook || chapters.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Content Available</h2>
          <button
            onClick={() => navigate(`/ebooks/${id}`)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Book
          </button>
        </div>
      </div>
    );
  }

  return (
    <EbookReader
      ebook={ebook}
      chapters={chapters}
      currentChapterIndex={currentChapterIndex}
      onChapterChange={handleChapterChange}
    />
  );
};

export default ReadEbookChapterPage;