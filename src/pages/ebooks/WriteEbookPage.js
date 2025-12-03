import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../../context/UserContext';
import PublishEbookModal from '../../components/ebooks/PublishEbookModal';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// --- ICONS (Using simple SVG placeholders for a modern feel) ---
const Icon = {
  Pen: (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>,
  Book: (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18s-3.332.477-4.5 1.253"></path></svg>,
  Settings: (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>,
  Save: (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>,
  Plus: (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>,
  Delete: (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>,
  Home: (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>,
  Publish: (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>,
};


// Utility function to calculate word count
const getWordCount = (content) => {
  if (!content) return 0;
  // Remove HTML tags for accurate word count
  const textContent = content.replace(/<[^>]*>/g, '');
  return textContent.trim().split(/\s+/).filter(word => word.length > 0).length;
};

// Utility function to calculate approximate pages (250 words/page)
const getApproxPageCount = (wordCount) => {
  return Math.max(1, Math.ceil(wordCount / 250));
};

const WriteEbookPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  // --- Global State (KEPT AS IS) ---
  const [view, setView] = useState('list'); // 'list', 'create', 'write'
  const [myEbooks, setMyEbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- Create/Settings State (KEPT AS IS) ---
  const [bookFormData, setBookFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    cover_image: '/book-backgrounds/classic-book-1.jpg',
    license_type: 'Public Domain',
    terms_agreed: false,
    public_domain_agreed: false
  });

  // --- Writing State (KEPT AS IS) ---
  const [currentEbook, setCurrentEbook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [editorSubView, setEditorSubView] = useState('editor'); // 'editor', 'settings'
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);

  const bookBackgrounds = useMemo(() => ([
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
  ]), []);

  // --- Effects & Fetching (KEPT AS IS) ---
  useEffect(() => {
    if (view === 'list') {
      fetchMyEbooks();
    }
  }, [view]);

  useEffect(() => {
    if (view === 'write' && editorSubView === 'settings' && currentEbook) {
      setBookFormData(currentEbook);
    }
  }, [view, editorSubView, currentEbook]);

  const fetchMyEbooks = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/user/ebooks');
      setMyEbooks(response.data.ebooks);
    } catch (error) {
      console.error('Error fetching ebooks:', error);
      setError('Failed to fetch your ebooks. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // --- CRUD Operations (KEPT AS IS) ---

  const createNewEbook = async () => {
    if (!bookFormData.title.trim() || !bookFormData.description.trim() || !bookFormData.terms_agreed || !bookFormData.public_domain_agreed) {
      setError('Please fill out all required fields and agree to the terms.');
      return;
    }

    try {
      const response = await axios.post('/ebooks', bookFormData);
      const newBook = response.data.ebook;
      
      const initialChapter = { number: 1, title: 'Chapter 1', content: '' };
      
      const chapterResponse = await axios.post(`/ebooks/${newBook.id}/chapters`, {
        chapter_number: initialChapter.number,
        chapter_title: initialChapter.title,
        content: initialChapter.content,
        page_count: 1
      });

      setCurrentEbook(newBook);
      setChapters([{ ...initialChapter, id: chapterResponse.data.chapter.id }]);
      setActiveChapterIndex(0);
      setView('write');
      setEditorSubView('editor'); 
    } catch (error) {
      console.error('Error creating ebook:', error);
      setError(error.response?.data?.error || 'Failed to create ebook. Please try again.');
    }
  };
  
  const loadEbookForEditing = async (ebook) => {
    try {
      const response = await axios.get(`/ebooks/${ebook.id}/chapters`);
      const loadedChapters = response.data.chapters.map(ch => ({
        id: ch.id,
        number: ch.chapter_number,
        title: ch.chapter_title,
        content: ch.content,
        word_count: getWordCount(ch.content) || 0, 
      }));

      setCurrentEbook(ebook);
      setBookFormData(ebook); 
      setChapters(loadedChapters.length > 0 ? loadedChapters : [{ number: 1, title: 'Chapter 1', content: '', word_count: 0 }]);
      setActiveChapterIndex(0);
      setView('write');
      setEditorSubView('editor');
    } catch (error) {
      console.error('Error loading ebook:', error);
      setError('Failed to load ebook. Please try again.');
    }
  };
  
  const saveChapter = useCallback(async (chapterToSave) => {
    if (!currentEbook || !chapterToSave) return;
    
    setSaving(true);
    setError(null);
    setErrorDetails(null);
    
    try {
      const wordCount = getWordCount(chapterToSave.content);
      const pageCount = getApproxPageCount(wordCount);

      const chapterData = {
        chapter_number: chapterToSave.number,
        chapter_title: chapterToSave.title,
        content: chapterToSave.content,
        page_count: pageCount,
      };

      let response;
      if (chapterToSave.id) {
        // Update existing chapter
        try {
          response = await axios.put(`/ebooks/${currentEbook.id}/chapters/${chapterToSave.id}`, chapterData);
        } catch (error) {
          if (error.response && error.response.status === 404) {
            response = await axios.post(`/ebooks/${currentEbook.id}/chapters`, chapterData);
          } else {
            throw new Error(`Failed to update chapter: ${error.response?.data?.error || error.message}`);
          }
        }
      } else {
        // Create new chapter
        try {
          response = await axios.post(`/ebooks/${currentEbook.id}/chapters`, chapterData);
        } catch (error) {
          throw new Error(`Failed to create chapter: ${error.response?.data?.error || error.message}`);
        }
      }
      
      const savedChapter = response.data.chapter;
      
      setChapters(prevChapters => {
        const newChapters = [...prevChapters];
        const index = newChapters.findIndex(c => c.number === chapterToSave.number);
        
        if (index !== -1) {
          newChapters[index] = {
            ...chapterToSave,
            id: savedChapter.id,
            word_count: wordCount,
          };
        }
        return newChapters;
      });

      setLastSaved(new Date());
      
      if (savedChapter.book_page_count) {
          setCurrentEbook(prevEbook => ({
              ...prevEbook,
              page_count: savedChapter.book_page_count,
              chapter_count: savedChapter.book_chapter_count || prevEbook.chapter_count
          }));
      }

    } catch (error) {
      console.error('Error saving chapter:', error);
      setError(error.message || 'Failed to save chapter. Please try again.');
      setErrorDetails(error.response?.data?.error || error.message);
    } finally {
      setSaving(false);
    }
  }, [currentEbook]);
  
  // Autosave when switching chapters or every 5 seconds (KEPT AS IS)
  useEffect(() => {
    if (view !== 'write' || editorSubView !== 'editor' || !currentEbook || chapters.length === 0) return;
    
    const chapterToSave = chapters[activeChapterIndex];
    
    const autosaveInterval = setInterval(() => {
        if (getWordCount(chapterToSave.content) > 0) {
            saveChapter(chapterToSave);
        }
    }, 5000); 

    return () => clearInterval(autosaveInterval);
  }, [view, editorSubView, currentEbook, chapters, activeChapterIndex, saveChapter]);

  const updateEbookMetadata = async () => {
    if (!currentEbook) return;

    try {
      await axios.put(`/ebooks/${currentEbook.id}`, bookFormData);
      setCurrentEbook(bookFormData); 
      setEditorSubView('editor'); 
      setError(null);
      setErrorDetails(null);
    } catch (error) {
      console.error('Error updating ebook metadata:', error);
      setError(error.response?.data?.error || 'Failed to update book settings. Please try again.');
    }
  };

  // --- Chapter Management (KEPT AS IS) ---

  const addChapter = () => {
    const newChapterNumber = chapters.length + 1;
    const newChapter = {
      number: newChapterNumber,
      title: `Chapter ${newChapterNumber}`,
      content: '',
      word_count: 0,
      id: null 
    };
    
    setChapters([...chapters, newChapter]);
    setActiveChapterIndex(chapters.length);
    // Auto-save the previous chapter when a new one is added
    saveChapter(chapters[activeChapterIndex]);
  };

  const deleteChapter = async (index) => {
    if (chapters.length === 1) {
      setError('You must have at least one chapter.');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this chapter? This action is irreversible.')) {
      return;
    }
    
    const chapter = chapters[index];
    
    if (chapter.id) {
      try {
        await axios.delete(`/ebooks/${currentEbook.id}/chapters/${chapter.id}`);
      } catch (error) {
        console.error('Error deleting chapter:', error);
        setError('Failed to delete chapter from the server. Please try again.');
        return;
      }
    }
    
    const newChapters = chapters.filter((_, i) => i !== index).map((ch, idx) => ({
        ...ch,
        number: idx + 1,
        title: ch.title.startsWith('Chapter') ? `Chapter ${idx + 1}` : ch.title,
    }));
    
    setChapters(newChapters);
    setActiveChapterIndex(Math.max(0, activeChapterIndex > index ? activeChapterIndex - 1 : activeChapterIndex - 1));
  };

  const updateChapter = (field, value) => {
    setChapters(prevChapters => {
      const newChapters = [...prevChapters];
      if (newChapters.length > activeChapterIndex) {
        newChapters[activeChapterIndex] = { 
          ...newChapters[activeChapterIndex], 
          [field]: value,
          ...(field === 'content' && { word_count: getWordCount(value) })
        };
      }
      return newChapters;
    });
  };

  const switchChapter = (newIndex) => {
    if (newIndex === activeChapterIndex) return;

    // Save the current chapter before switching
    saveChapter(chapters[activeChapterIndex]);
    setActiveChapterIndex(newIndex);
    setEditorSubView('editor'); 
  };

  // --- Utility Calculations (KEPT AS IS) ---

  const getTotalPages = () => {
    return chapters.reduce((sum, ch) => sum + getApproxPageCount(ch.word_count || getWordCount(ch.content)), 0);
  };

  const totalPages = getTotalPages();
  const canPublish = totalPages >= 30;
  const currentChapterData = chapters[activeChapterIndex];

  // Quill editor modules configuration for toolbar (KEPT AS IS)
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['link', 'clean']
    ]
  };

  // Quill editor formats configuration (KEPT AS IS)
  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent', 'script', 'align', 'direction',
    'color', 'background', 'font', 'link', 'code-block'
  ];

  // --- RENDER FUNCTIONS ---

  // Component for displaying errors uniformly
  const ErrorAlert = ({ message, details, onDismiss }) => (
    <div className="bg-red-50 border border-red-300 text-red-800 p-4 rounded-lg flex justify-between items-center shadow-sm">
        <div>
            <strong>Error:</strong> {message}
            {details && <div className="text-sm mt-1 opacity-80">{details}</div>}
        </div>
        <button 
            onClick={onDismiss}
            className="text-red-600 hover:text-red-900 ml-4 font-semibold"
        >
            Dismiss
        </button>
    </div>
  );

  // LIST VIEW - Professional Dashboard Style
  if (view === 'list') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4 flex items-center gap-4">
            <Icon.Book className="w-8 h-8 text-indigo-600" /> Ebook Writing Studio
          </h1>
          <p className="text-xl text-gray-500 mb-10">Manage your drafts and start new projects.</p>

          {error && <div className="mb-8"><ErrorAlert message={error} details={errorDetails} onDismiss={() => { setError(null); setErrorDetails(null); }} /></div>}
          
          {/* Create New Book CTA */}
          <div className="bg-white border-2 border-dashed border-indigo-200 rounded-xl shadow-lg p-6 mb-12 flex justify-between items-center transition-all hover:border-indigo-400">
            <div>
              <h2 className="text-2xl font-bold text-indigo-700 mb-2">Start a New Ebook</h2>
              <p className="text-gray-600">Click to set up your title, description, and cover image.</p>
            </div>
            <button
              onClick={() => { 
                setError(null); setBookFormData({ title: '', subtitle: '', description: '', cover_image: bookBackgrounds[0], license_type: 'Public Domain', terms_agreed: false, public_domain_agreed: false }); 
                setView('create'); 
              }}
              className="bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <Icon.Plus className="w-5 h-5" /> New Project
            </button>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-6">Active Drafts ({myEbooks.filter(book => !book.published).length})</h2>
          
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
            </div>
          ) : myEbooks.filter(book => !book.published).length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center text-gray-500 border border-gray-100">
              <p className="text-lg">You have no active drafts. Begin your writing journey above!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {myEbooks.filter(book => !book.published).map(book => (
                <div
                  key={book.id}
                  className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100 transform hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 ease-out cursor-pointer"
                  onClick={() => {
                    setError(null);
                    loadEbookForEditing(book);
                  }}
                >
                  <div
                    className="h-48 bg-cover bg-center relative"
                    style={{ backgroundImage: `url(${book.cover_image})` }}
                  >
                     <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-end p-4 text-white">
                        <h3 className="font-extrabold text-xl line-clamp-2 drop-shadow-md">
                            {book.title}
                        </h3>
                        <p className="text-sm opacity-80 mt-1">
                            {book.chapter_count || 0} chapters • {book.page_count} pages
                        </p>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{book.description}</p>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <span className="text-xs text-gray-400">Updated: {new Date(book.updated_at).toLocaleDateString()}</span>
                      <span className="text-indigo-600 font-bold text-sm flex items-center gap-1">
                        Continue <Icon.Pen className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // CREATE VIEW - Minimal and Focused
  if (view === 'create') {
    // Re-use the existing logic structure for consistency but with the new clean UI
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <button
            onClick={() => { setError(null); setView('list'); }}
            className="text-gray-600 hover:text-indigo-600 font-medium mb-8 flex items-center gap-2"
          >
            <Icon.Home className="w-4 h-4" /> Back to Dashboard
          </button>

          <h1 className="text-4xl font-bold text-gray-900 mb-10">Start Your New Project</h1>

          {error && <div className="mb-8"><ErrorAlert message={error} details={errorDetails} onDismiss={() => { setError(null); setErrorDetails(null); }} /></div>}

          <div className="bg-white rounded-xl shadow-2xl p-10 border border-gray-100">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                
                {/* Book Details */}
                <div className="md:col-span-2 space-y-6">
                    <h2 className="text-2xl font-semibold text-gray-700 border-b pb-3 mb-6">Book Information</h2>
                    
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Book Title <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={bookFormData.title}
                            onChange={(e) => setBookFormData({ ...bookFormData, title: e.target.value })}
                            placeholder="A captivating title..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                        />
                        <p className="text-xs text-red-500 mt-1">
                            *Title cannot be changed after creation.
                        </p>
                    </div>

                    {/* Subtitle */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle (Optional)</label>
                        <input
                            type="text"
                            value={bookFormData.subtitle}
                            onChange={(e) => setBookFormData({ ...bookFormData, subtitle: e.target.value })}
                            placeholder="An engaging subtitle..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    
                    {/* Author (locked to username) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                        <input
                            type="text"
                            value={user.display_name}
                            disabled
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-600"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Book Description <span className="text-red-500">*</span></label>
                        <textarea
                            value={bookFormData.description}
                            onChange={(e) => setBookFormData({ ...bookFormData, description: e.target.value })}
                            placeholder="Introduce your book, its genre, and main themes..."
                            rows={5}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    {/* License */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">License Type</label>
                        <select
                            value={bookFormData.license_type}
                            onChange={(e) => setBookFormData({ ...bookFormData, license_type: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        >
                            <option value="Public Domain">Public Domain (Default & Recommended)</option>
                            <option value="Creative Commons Zero">Creative Commons Zero (CC0)</option>
                            <option value="Creative Commons BY">Creative Commons BY</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            Selecting a license defines how others can use your work.
                        </p>
                    </div>
                </div>

                {/* Cover Image Preview and Selection */}
                <div className="md:col-span-1">
                    <h2 className="text-2xl font-semibold text-gray-700 border-b pb-3 mb-6">Cover Visual</h2>
                    
                    {/* Live Preview */}
                    <div className="mb-8 flex justify-center">
                        <div
                            className="w-56 h-80 bg-cover bg-center rounded-lg shadow-2xl relative border-4 border-gray-100"
                            style={{ backgroundImage: `url(${bookFormData.cover_image})` }}
                        >
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center p-4 text-white text-shadow-lg">
                                <h2 className="text-2xl font-extrabold text-center line-clamp-3">
                                    {bookFormData.title || 'Your Book Title'}
                                </h2>
                                {bookFormData.subtitle && (
                                    <p className="text-base text-center mt-1">
                                        {bookFormData.subtitle}
                                    </p>
                                )}
                                <p className="text-xs mt-auto">
                                    by {user.display_name}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Background Selection Grid */}
                    <div className="grid grid-cols-5 gap-2">
                        {bookBackgrounds.map((bg, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => setBookFormData({ ...bookFormData, cover_image: bg })}
                                className={`h-12 w-full bg-cover bg-center rounded-md border-2 transition-all focus:outline-none ${
                                    bookFormData.cover_image === bg
                                        ? 'border-indigo-500 ring-2 ring-indigo-200'
                                        : 'border-gray-200 hover:border-indigo-300'
                                }`}
                                style={{ backgroundImage: `url(${bg})` }}
                                title={`Cover Style ${idx + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <hr className="my-10 border-gray-200" />

            {/* Agreements */}
            <div className="space-y-4">
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={bookFormData.terms_agreed}
                            onChange={(e) => setBookFormData({ ...bookFormData, terms_agreed: e.target.checked })}
                            className="mt-1 h-5 w-5 text-indigo-600 border-indigo-300 rounded focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">
                            I agree to the Community Guidelines and certify this work is original.
                        </span>
                    </label>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={bookFormData.public_domain_agreed}
                            onChange={(e) => setBookFormData({ ...bookFormData, public_domain_agreed: e.target.checked })}
                            className="mt-1 h-5 w-5 text-red-600 border-red-300 rounded focus:ring-red-500"
                        />
                        <span className="text-sm text-red-700 font-medium">
                            I confirm this book is **Public Domain** and contains no restricted or third-party copyrighted material. <span className="text-red-500">*</span>
                        </span>
                    </label>
                </div>
            </div>

            {/* Create Button */}
            <button
                onClick={createNewEbook}
                disabled={!bookFormData.title || !bookFormData.description || !bookFormData.terms_agreed || !bookFormData.public_domain_agreed}
                className="w-full mt-10 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-extrabold py-4 rounded-xl shadow-lg transition-colors text-xl flex items-center justify-center gap-3"
            >
                <Icon.Pen className="w-6 h-6" /> Start Writing Chapter 1
            </button>
          </div>
        </div>
      </div>
    );
  }

  // WRITE VIEW - The Google Docs/Distraction-Free Editor
  if (view === 'write' && currentEbook) {
    
    // RENDER: Book Settings View
    if (editorSubView === 'settings') {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto px-6 py-16">
                    
                    <button
                        onClick={() => setEditorSubView('editor')}
                        className="text-gray-600 hover:text-indigo-600 font-medium mb-8 flex items-center gap-2"
                    >
                        <Icon.Pen className="w-4 h-4" /> Back to Editor
                    </button>
                    
                    <h1 className="text-4xl font-bold text-gray-900 mb-10 flex items-center gap-3">
                        <Icon.Settings className="w-6 h-6 text-indigo-600" /> Book Settings: {currentEbook.title}
                    </h1>

                    {error && <div className="mb-8"><ErrorAlert message={error} details={errorDetails} onDismiss={() => { setError(null); setErrorDetails(null); }} /></div>}

                    {/* Re-using the create form structure for consistency */}
                    <div className="bg-white rounded-xl shadow-2xl p-10 border border-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                {/* Title (Disabled) */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Book Title</label>
                                    <input
                                        type="text"
                                        value={bookFormData.title}
                                        disabled
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-600 text-lg"
                                    />
                                    <p className="text-xs text-red-500 mt-1">Title cannot be changed.</p>
                                </div>

                                {/* Subtitle */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                                    <input
                                        type="text"
                                        value={bookFormData.subtitle}
                                        onChange={(e) => setBookFormData({ ...bookFormData, subtitle: e.target.value })}
                                        placeholder="Add a catchy subtitle..."
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                
                                {/* Description */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Book Description</label>
                                    <textarea
                                        value={bookFormData.description}
                                        onChange={(e) => setBookFormData({ ...bookFormData, description: e.target.value })}
                                        placeholder="Describe your book..."
                                        rows={6}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>

                                {/* License */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">License Type</label>
                                    <select
                                        value={bookFormData.license_type}
                                        onChange={(e) => setBookFormData({ ...bookFormData, license_type: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                    >
                                        <option value="Public Domain">Public Domain</option>
                                        <option value="Creative Commons Zero">Creative Commons Zero (CC0)</option>
                                        <option value="Creative Commons BY">Creative Commons BY</option>
                                    </select>
                                </div>
                            </div>
                            
                            {/* Cover Image Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-4">Select Book Cover Background</label>
                                
                                {/* Live Preview (Simplified) */}
                                <div className="mb-6 flex justify-center">
                                    <div
                                        className="w-48 h-72 bg-cover bg-center rounded-lg shadow-lg relative border-4 border-gray-100"
                                        style={{ backgroundImage: `url(${bookFormData.cover_image})` }}
                                    >
                                        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-end p-3 text-white">
                                            <h2 className="text-xl font-extrabold text-center line-clamp-3">
                                                {bookFormData.title || 'Your Book Title'}
                                            </h2>
                                        </div>
                                    </div>
                                </div>

                                {/* Background Selection Grid */}
                                <div className="grid grid-cols-5 gap-2">
                                    {bookBackgrounds.map((bg, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setBookFormData({ ...bookFormData, cover_image: bg })}
                                            className={`h-12 w-full bg-cover bg-center rounded-md border-2 transition-all focus:outline-none ${
                                                bookFormData.cover_image === bg
                                                    ? 'border-indigo-500 ring-2 ring-indigo-200'
                                                    : 'border-gray-200 hover:border-indigo-300'
                                            }`}
                                            style={{ backgroundImage: `url(${bg})` }}
                                            title={`Cover Style ${idx + 1}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <hr className="my-8 border-gray-200" />
                        
                        {/* Save Button */}
                        <button
                            onClick={updateEbookMetadata}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-extrabold py-4 rounded-xl shadow-lg transition-colors text-lg flex items-center justify-center gap-3"
                        >
                            <Icon.Save className="w-5 h-5" /> Update Book Settings
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
    // RENDER: Main Editor View (Two-Pane, Distraction-Free)
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        
        {/* Top Bar / Menu (Sticky) */}
        <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
            <div className="flex justify-between items-center px-6 py-3">
                
                {/* Book Title & Navigation */}
                <div className="flex items-center space-x-4">
                    <Link
                        to="/write"
                        onClick={() => { 
                          saveChapter(chapters[activeChapterIndex]); 
                          setView('list'); 
                        }}
                        className="text-gray-400 hover:text-indigo-600 p-2 rounded-full transition-colors"
                        title="Back to Dashboard"
                    >
                        <Icon.Home className="w-6 h-6" />
                    </Link>
                    <div className="text-lg font-bold text-gray-800 truncate max-w-xs" title={currentEbook.title}>{currentEbook.title}</div>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center space-x-4">
                    
                    {/* Status Indicator */}
                    <div className={`flex items-center text-sm font-semibold p-2 rounded-lg ${
                        saving ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                        {saving ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-yellow-500 mr-2"></div>
                                Auto-Saving...
                            </>
                        ) : (
                            lastSaved ? `Saved ${lastSaved.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: false })}` : 'Draft'
                        )}
                    </div>
                    
                    <button 
                        onClick={() => setEditorSubView('settings')}
                        className="flex items-center gap-2 p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                        title="Book Settings"
                    >
                        <Icon.Settings className="w-5 h-5" /> Settings
                    </button>
                    
                    <button
                        onClick={() => { 
                          saveChapter(chapters[activeChapterIndex]); 
                          setShowPublishModal(true); 
                        }}
                        disabled={!canPublish}
                        className={`font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 ${
                          canPublish
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                        title={canPublish ? 'Publish Your Book' : `Requires 30 pages (currently ${totalPages})`}
                    >
                        <Icon.Publish className="w-5 h-5" /> Publish
                    </button>
                </div>
            </div>
        </div>
        
        {/* Main Workspace: Chapters + Editor */}
        {/* This container uses flex-1 and overflow-hidden to fill the remaining screen height, ensuring both children (sidebar and editor) are always visible. */}
        <div className="flex flex-1 overflow-hidden"> 
          
          {/* Sidebar - Chapters & Metrics */}
          {/* w-80 (fixed width), flex-shrink-0 (won't shrink), overflow-y-auto (scrolls internally) */}
          <div className="w-80 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-y-auto custom-scrollbar">
            
            <div className="p-4 border-b border-gray-100 flex-shrink-0">
                <h3 className="text-sm font-semibold text-gray-500 mb-2">Book Progress</h3>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xl font-bold text-gray-800">Total Pages:</span>
                    <span className={`text-xl font-extrabold ${canPublish ? 'text-green-600' : 'text-indigo-600'}`}>{totalPages} / 30</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-500 ease-out ${canPublish ? 'bg-green-500' : 'bg-indigo-500'}`}
                        style={{ width: `${Math.min(100, (totalPages / 30) * 100)}%` }}
                    />
                </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
              <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">Chapters ({chapters.length})</h3>
              <div className="space-y-3">
                {chapters.map((chapter, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg cursor-pointer transition-all border ${
                      idx === activeChapterIndex
                        ? 'bg-indigo-50 border-indigo-400 shadow-md'
                        : 'bg-white border-gray-100 hover:bg-gray-50'
                    }`}
                    onClick={() => switchChapter(idx)}
                  >
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-500 font-medium">Chapter {chapter.number}</p>
                      {chapters.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteChapter(idx);
                          }}
                          className="text-gray-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors"
                          title="Delete Chapter"
                        >
                          <Icon.Delete className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-base text-gray-800 truncate font-semibold mt-0.5">{chapter.title || 'Untitled Chapter'}</p>
                    <p className="text-xs text-gray-400 mt-1">{chapter.word_count || getWordCount(chapter.content)} words · {getApproxPageCount(chapter.word_count || getWordCount(chapter.content))} pages</p>
                  </div>
                ))}
              </div>
              
              <button
                onClick={addChapter}
                className="w-full mt-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2 border border-gray-200"
              >
                <Icon.Plus className="w-5 h-5" /> Add Chapter
              </button>
            </div>
          </div>

          {/* Main Editor Area (Simulating a document) */}
          {/* flex-1 (fills remaining width), overflow-y-auto (scrolls editor content internally) */}
          <div className="flex-1 overflow-y-auto p-8 bg-gray-100">
            
            {/* Local Error Message */}
            {error && <div className="mb-6"><ErrorAlert message={error} details={errorDetails} onDismiss={() => { setError(null); setErrorDetails(null); }} /></div>}

            {/* Editor Container - Fixed Width, Centered, White Page Look */}
            <div className="max-w-3xl mx-auto bg-white p-10 shadow-xl rounded-lg border border-gray-200 min-h-[90%]">
              
              {/* Chapter Title Input */}
              <input
                  type="text"
                  value={currentChapterData?.title || ''}
                  onChange={(e) => updateChapter('title', e.target.value)}
                  className="text-4xl font-extrabold text-gray-900 border-b-2 border-transparent focus:border-indigo-400 w-full mb-8 outline-none transition-colors px-1 py-1"
                  placeholder={`Chapter ${currentChapterData?.number || ''} Title`}
              />
              
              {/* Quill Editor */}
              <div className="prose max-w-none">
                  <ReactQuill
                    theme="snow"
                    value={currentChapterData?.content || ''}
                    onChange={(value) => updateChapter('content', value)}
                    modules={quillModules}
                    formats={quillFormats}
                    placeholder="The story begins here. Write your masterpiece..."
                    // A class-based solution for full-height is better than fixed style here
                    className="min-h-[500px] quill-modern-editor"
                  />
              </div>
              
              {/* Floating Status Bar (New Feature) */}
              <div className="sticky bottom-0 mt-8 py-2 text-right text-sm text-gray-500 border-t border-gray-100">
                  Current Chapter: {currentChapterData?.word_count || getWordCount(currentChapterData?.content)} Words
              </div>
            </div>
          </div>
        </div>

        {/* Publish Modal (KEPT AS IS) */}
        {showPublishModal && (
          <PublishEbookModal
            ebook={currentEbook}
            totalPages={totalPages}
            onClose={() => setShowPublishModal(false)}
            onSuccess={() => {
              setShowPublishModal(false);
              navigate('/dashboard');
            }}
          />
        )}
        
        {/* Add custom CSS to style Quill to look more like a clean doc */}
        <style jsx="true">{`
            .quill-modern-editor .ql-container {
                border: none !important;
                font-size: 1.1rem;
                line-height: 1.7;
            }
            .quill-modern-editor .ql-toolbar {
                border-top: none !important;
                border-left: none !important;
                border-right: none !important;
                border-bottom: 1px solid #e5e7eb !important; /* light gray border */
                margin-bottom: 20px;
                padding: 10px 0;
                position: sticky;
                top: 0;
                background-color: white;
                z-index: 10;
            }
            .quill-modern-editor .ql-editor {
                padding: 0; /* Remove Quill's default padding */
                min-height: 500px;
            }
            /* Custom Scrollbar for better look */
            .custom-scrollbar::-webkit-scrollbar {
                width: 8px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #e5e7eb;
                border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: #d1d5db;
            }
        `}</style>
      </div>
    );
  }

  return null;
};

export default WriteEbookPage;