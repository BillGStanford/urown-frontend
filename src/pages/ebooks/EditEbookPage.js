import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../../context/UserContext';

const EditEbookPage = () => {
  const { id } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();
  
  const [ebook, setEbook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [activeChapter, setActiveChapter] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  
  // Editable fields
  const [description, setDescription] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [licenseType, setLicenseType] = useState('Public Domain');
  
  const bookBackgrounds = [
    '/book-backgrounds/classic-book-1.jpg',
    '/book-backgrounds/classic-book-2.jpg',
    '/book-backgrounds/modern-abstract-1.jpg',
    '/book-backgrounds/modern-abstract-2.jpg',
    '/book-backgrounds/nature-1.jpg',
    '/book-backgrounds/nature-2.jpg',
    '/book-backgrounds/minimal-1.jpg',
    '/book-backgrounds/minimal-2.jpg',
    '/book-backgrounds/vintage-1.jpg',
    '/book-backgrounds/vintage-2.jpg'
  ];

  useEffect(() => {
    fetchEbook();
  }, [id]);

  useEffect(() => {
    if (ebook) {
      const autosaveInterval = setInterval(() => {
        saveChanges();
      }, 5000);
      
      return () => clearInterval(autosaveInterval);
    }
  }, [ebook, chapters, activeChapter, description, subtitle, coverImage, licenseType]);

  const fetchEbook = async () => {
    setLoading(true);
    try {
      const [ebookRes, chaptersRes] = await Promise.all([
        axios.get(`/user/ebooks`),
        axios.get(`/ebooks/${id}/chapters`)
      ]);
      
      const foundEbook = ebookRes.data.ebooks.find(b => b.id === parseInt(id));
      
      if (!foundEbook) {
        alert('Ebook not found or you do not have permission to edit it');
        navigate('/dashboard');
        return;
      }
      
      setEbook(foundEbook);
      setDescription(foundEbook.description);
      setSubtitle(foundEbook.subtitle || '');
      setCoverImage(foundEbook.cover_image);
      setLicenseType(foundEbook.license_type || 'Public Domain');
      
      const loadedChapters = chaptersRes.data.chapters.map(ch => ({
        id: ch.id,
        number: ch.chapter_number,
        title: ch.chapter_title,
        content: ch.content,
        page_count: ch.page_count
      }));
      
      setChapters(loadedChapters);
    } catch (error) {
      console.error('Error fetching ebook:', error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const saveChanges = async () => {
    if (!ebook) return;
    
    setSaving(true);
    try {
      // Save ebook metadata
      await axios.put(`/ebooks/${id}`, {
        description,
        subtitle,
        cover_image: coverImage,
        license_type: licenseType
      });
      
      // Save current chapter
      if (chapters.length > 0) {
        const chapter = chapters[activeChapter];
        const wordCount = chapter.content.trim().split(/\s+/).length;
        const pageCount = Math.max(1, Math.ceil(wordCount / 250));
        
        await axios.post(`/ebooks/${id}/chapters`, {
          chapter_number: chapter.number,
          chapter_title: chapter.title,
          content: chapter.content,
          page_count: pageCount
        });
      }
      
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving changes:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateChapter = (field, value) => {
    const newChapters = [...chapters];
    newChapters[activeChapter][field] = value;
    setChapters(newChapters);
  };

  const addChapter = () => {
    const newChapterNumber = chapters.length + 1;
    setChapters([...chapters, {
      number: newChapterNumber,
      title: `Chapter ${newChapterNumber}`,
      content: ''
    }]);
    setActiveChapter(chapters.length);
  };

  const deleteChapter = async (index) => {
    if (chapters.length === 1) {
      alert('You must have at least one chapter');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this chapter?')) {
      return;
    }
    
    const chapter = chapters[index];
    
    if (chapter.id) {
      try {
        await axios.delete(`/ebooks/${id}/chapters/${chapter.id}`);
      } catch (error) {
        console.error('Error deleting chapter:', error);
        alert('Failed to delete chapter');
        return;
      }
    }
    
    const newChapters = chapters.filter((_, i) => i !== index);
    newChapters.forEach((ch, idx) => {
      ch.number = idx + 1;
    });
    
    setChapters(newChapters);
    setActiveChapter(Math.max(0, activeChapter - 1));
  };

  const getTotalPages = () => {
    return chapters.reduce((sum, ch) => {
      const wordCount = ch.content.trim().split(/\s+/).length;
      return sum + Math.max(1, Math.ceil(wordCount / 250));
    }, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!ebook) {
    return null;
  }

  const currentChapterData = chapters[activeChapter];
  const totalPages = getTotalPages();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r-2 border-amber-200 overflow-y-auto">
          <div className="p-4 border-b-2 border-amber-200">
            <Link
              to="/dashboard"
              className="text-sm text-amber-700 hover:text-amber-900 block mb-4"
            >
              ← Back to Dashboard
            </Link>
            <h2 className="font-bold text-amber-900">{ebook.title}</h2>
            <p className="text-xs text-red-600 mb-2">Title cannot be changed</p>
            <p className="text-sm text-amber-700">{totalPages} pages total</p>
          </div>

          {/* Chapters */}
          <div className="p-4">
            <h3 className="font-bold text-amber-900 mb-3">Chapters</h3>
            <div className="space-y-2 mb-4">
              {chapters.map((chapter, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded cursor-pointer transition-colors ${
                    idx === activeChapter
                      ? 'bg-amber-100 border-2 border-amber-600'
                      : 'bg-amber-50 hover:bg-amber-100'
                  }`}
                  onClick={() => setActiveChapter(idx)}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-sm text-amber-900">
                      Chapter {chapter.number}
                    </span>
                    {chapters.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChapter(idx);
                        }}
                        className="text-red-600 hover:text-red-800 text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-amber-700 truncate">{chapter.title}</p>
                </div>
              ))}
            </div>

            <button
              onClick={addChapter}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 rounded transition-colors"
            >
              + Add Chapter
            </button>
          </div>

          {/* Metadata Edit */}
          <div className="p-4 border-t-2 border-amber-200 space-y-4">
            <h3 className="font-bold text-amber-900">Book Details</h3>
            
            <div>
              <label className="block text-sm font-semibold text-amber-900 mb-1">
                Subtitle
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full px-3 py-2 border-2 border-amber-200 rounded focus:border-amber-500 outline-none text-sm"
                placeholder="Optional subtitle"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-amber-900 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border-2 border-amber-200 rounded focus:border-amber-500 outline-none text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-amber-900 mb-2">
                Cover Image
              </label>
              <div className="grid grid-cols-3 gap-2">
                {bookBackgrounds.slice(0, 6).map((bg, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCoverImage(bg)}
                    className={`h-16 bg-cover bg-center rounded border-2 transition-all ${
                      coverImage === bg
                        ? 'border-amber-600 ring-2 ring-amber-200'
                        : 'border-transparent hover:border-amber-300'
                    }`}
                    style={{ backgroundImage: `url(${bg})` }}
                  />
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-amber-900 mb-1">
                License
              </label>
              <select
                value={licenseType}
                onChange={(e) => setLicenseType(e.target.value)}
                className="w-full px-3 py-2 border-2 border-amber-200 rounded focus:border-amber-500 outline-none text-sm"
              >
                <option value="Public Domain">Public Domain</option>
                <option value="Creative Commons Zero">Creative Commons Zero (CC0)</option>
                <option value="Creative Commons BY">Creative Commons BY</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Editor */}
        <div className="flex-1 flex flex-col">
          {/* Editor Header */}
          <div className="bg-white border-b-2 border-amber-200 p-4 flex justify-between items-center">
            <div className="flex-1">
              <input
                type="text"
                value={currentChapterData?.title || ''}
                onChange={(e) => updateChapter('title', e.target.value)}
                className="text-xl font-bold text-amber-900 border-2 border-transparent hover:border-amber-200 focus:border-amber-500 rounded px-2 py-1 w-full max-w-md outline-none"
                placeholder="Chapter Title"
              />
            </div>
            <div className="flex items-center gap-3 text-sm text-amber-700">
              {saving ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-amber-600"></div>
                  Saving...
                </span>
              ) : lastSaved ? (
                <span>Saved ✓ {lastSaved.toLocaleTimeString()}</span>
              ) : null}
            </div>
          </div>

          {/* Editor Content */}
          <div className="flex-1 overflow-y-auto p-8">
            <textarea
              value={currentChapterData?.content || ''}
              onChange={(e) => updateChapter('content', e.target.value)}
              placeholder="Write your chapter content..."
              className="w-full h-full min-h-[600px] p-6 border-2 border-amber-200 rounded-lg focus:border-amber-500 outline-none resize-none text-lg font-serif leading-relaxed"
              style={{ fontFamily: 'Georgia, serif' }}
            />
          </div>

          {/* Save Notice */}
          <div className="bg-white border-t-2 border-amber-200 p-4 text-center text-sm text-amber-700">
            Changes are automatically saved every 5 seconds
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEbookPage;