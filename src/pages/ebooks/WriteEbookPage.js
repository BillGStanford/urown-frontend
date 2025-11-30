import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../../context/UserContext';
import PublishEbookModal from '../../components/ebooks/PublishEbookModal';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

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

  // --- Global State ---
  const [view, setView] = useState('list'); // 'list', 'create', 'write'
  const [myEbooks, setMyEbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- Create/Settings State ---
  const [bookFormData, setBookFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    cover_image: '/book-backgrounds/classic-book-1.jpg',
    license_type: 'Public Domain',
    terms_agreed: false,
    public_domain_agreed: false
  });

  // --- Writing State ---
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

  // --- Effects & Fetching ---

  useEffect(() => {
    if (view === 'list') {
      fetchMyEbooks();
    }
  }, [view]);

  // Load book data into form state when entering 'settings'
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

  // --- CRUD Operations ---

  const createNewEbook = async () => {
    if (!bookFormData.title.trim() || !bookFormData.description.trim() || !bookFormData.terms_agreed || !bookFormData.public_domain_agreed) {
      setError('Please fill out all required fields and agree to the terms.');
      return;
    }

    try {
      const response = await axios.post('/ebooks', bookFormData);
      const newBook = response.data.ebook;
      
      // Initialize a first chapter automatically
      const initialChapter = { number: 1, title: 'Chapter 1', content: '' };
      
      // Save the initial chapter to get an ID
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
      setEditorSubView('editor'); // Default to editor view
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
        word_count: getWordCount(ch.content) || 0, // Add word count on load
      }));

      setCurrentEbook(ebook);
      setBookFormData(ebook); // Populate the form state as well
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
        console.log(`Updating chapter ${chapterToSave.id} for ebook ${currentEbook.id}`);
        try {
          response = await axios.put(`/ebooks/${currentEbook.id}/chapters/${chapterToSave.id}`, chapterData);
        } catch (error) {
          console.error('Error updating chapter:', error);
          // If PUT fails with 404, try POST to create a new chapter
          if (error.response && error.response.status === 404) {
            console.log('Chapter not found, creating new chapter instead');
            try {
              response = await axios.post(`/ebooks/${currentEbook.id}/chapters`, chapterData);
            } catch (postError) {
              throw new Error(`Failed to update or create chapter: ${postError.response?.data?.error || postError.message}`);
            }
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
          // Update the chapter with the new ID and latest data from the server
          newChapters[index] = {
            ...chapterToSave,
            id: savedChapter.id,
            word_count: wordCount,
          };
        }
        return newChapters;
      });

      setLastSaved(new Date());
      
      // Update the main ebook list data (e.g., total page count on the book object) in the background
      // This is a minimal update, ideally, the server returns the updated book metadata
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
  
  // Autosave when switching chapters or every 5 seconds
  useEffect(() => {
    if (view !== 'write' || editorSubView !== 'editor' || !currentEbook || chapters.length === 0) return;
    
    const chapterToSave = chapters[activeChapterIndex];
    
    // Autosave interval
    const autosaveInterval = setInterval(() => {
        // Only save if the chapter content is not empty
        if (getWordCount(chapterToSave.content) > 0) {
            saveChapter(chapterToSave);
        }
    }, 5000); // Autosave every 5 seconds

    return () => clearInterval(autosaveInterval);
  }, [view, editorSubView, currentEbook, chapters, activeChapterIndex, saveChapter]);

  const updateEbookMetadata = async () => {
    if (!currentEbook) return;

    try {
      await axios.put(`/ebooks/${currentEbook.id}`, bookFormData);
      setCurrentEbook(bookFormData); // Update local state immediately
      setEditorSubView('editor'); // Switch back to editor
      setError(null);
      setErrorDetails(null);
    } catch (error) {
      console.error('Error updating ebook metadata:', error);
      setError(error.response?.data?.error || 'Failed to update book settings. Please try again.');
    }
  };

  // --- Chapter Management ---

  const addChapter = () => {
    // Save the current chapter first (optional, but good practice)
    // saveChapter(chapters[activeChapterIndex]);
    
    const newChapterNumber = chapters.length + 1;
    const newChapter = {
      number: newChapterNumber,
      title: `Chapter ${newChapterNumber}`,
      content: '',
      word_count: 0,
      id: null // Will be populated on first save
    };
    
    setChapters([...chapters, newChapter]);
    setActiveChapterIndex(chapters.length);
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
    
    // Attempt to delete on the server if it has an ID
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
        // Optional: Re-title if it's the default "Chapter X" title
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
          // Recalculate word count if content changes
          ...(field === 'content' && { word_count: getWordCount(value) })
        };
      }
      return newChapters;
    });
  };

  // Switch chapters, saving the current one first
  const switchChapter = (newIndex) => {
    if (newIndex === activeChapterIndex) return;

    // Save the current chapter before switching
    saveChapter(chapters[activeChapterIndex]);
    setActiveChapterIndex(newIndex);
    setEditorSubView('editor'); // Always go back to editor when switching chapter
  };

  // --- Utility Calculations ---

  const getTotalPages = () => {
    return chapters.reduce((sum, ch) => sum + getApproxPageCount(ch.word_count || getWordCount(ch.content)), 0);
  };

  const totalPages = getTotalPages();
  const canPublish = totalPages >= 30;
  const currentChapterData = chapters[activeChapterIndex];

  // Quill editor modules configuration for toolbar - removed image and video
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

  // Quill editor formats configuration - removed image and video
  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent', 'script', 'align', 'direction',
    'color', 'background', 'font', 'link', 'code-block'
  ];

  // --- Render Functions ---

  // LIST VIEW - Show existing drafts and create button
  if (view === 'list') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-extrabold text-amber-900 mb-8 flex items-center gap-3">
            <span role="img" aria-label="pen">✍️</span> Your Ebook Studio
          </h1>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              <strong>Error:</strong> {error}
              {errorDetails && <div className="text-sm mt-1">{errorDetails}</div>}
              <button 
                onClick={() => { setError(null); setErrorDetails(null); }}
                className="ml-2 text-red-600 hover:text-red-800"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Create New Book CTA (Improved) */}
          <div className="bg-gradient-to-r from-amber-500 to-amber-700 rounded-xl shadow-2xl p-8 mb-10 text-white transform hover:scale-[1.01] transition-transform duration-300 ease-out">
            <h2 className="text-3xl font-bold mb-4">📚 Ready to Start a New Masterpiece?</h2>
            <p className="text-lg mb-6 opacity-90">
              The world is waiting for your story. Publish your work for free in public domain.
            </p>
            <button
              onClick={() => { 
                setError(null);
                setErrorDetails(null);
                setBookFormData({
                  title: '', subtitle: '', description: '', cover_image: bookBackgrounds[0], license_type: 'Public Domain', terms_agreed: false, public_domain_agreed: false
                }); 
                setView('create'); 
              }}
              className="bg-white text-amber-700 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-amber-100 transition-colors"
            >
              + Create New Book
            </button>
          </div>
          
          <hr className="border-amber-200 mb-8" />

          {/* Existing Drafts */}
          <h2 className="text-2xl font-bold text-amber-900 mb-6">Your Active Drafts ({myEbooks.filter(book => !book.published).length})</h2>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-amber-600"></div>
            </div>
          ) : myEbooks.filter(book => !book.published).length === 0 ? (
            <div className="bg-white rounded-xl shadow p-10 text-center text-amber-600 border-4 border-dashed border-amber-100">
              <p className="text-lg">No drafts yet. Click the "Create New Book" button above to begin your writing journey!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {myEbooks.filter(book => !book.published).map(book => (
                <div
                  key={book.id}
                  className="bg-white rounded-xl shadow-xl overflow-hidden transform hover:scale-[1.03] transition-all duration-300 ease-out cursor-pointer"
                  onClick={() => {
                    setError(null);
                    setErrorDetails(null);
                    loadEbookForEditing(book);
                  }}
                >
                  <div
                    className="h-56 bg-cover bg-center relative group"
                    style={{ backgroundImage: `url(${book.cover_image})` }}
                  >
                     <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col justify-end p-4 text-white">
                        <h3 className="font-extrabold text-2xl line-clamp-2 drop-shadow-md">
                            {book.title}
                        </h3>
                        <p className="text-sm opacity-80">
                            {book.chapter_count || 0} chapters • {book.page_count} pages
                        </p>
                    </div>
                  </div>
                  <div className="p-4 flex justify-between items-center">
                    <span className="text-sm text-gray-500">Last saved: {new Date(book.updated_at).toLocaleDateString()}</span>
                    <span className="text-amber-600 font-bold hover:text-amber-800">
                      Continue Writing →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // CREATE VIEW - Set up new book
  if (view === 'create') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <button
            onClick={() => { 
              setError(null);
              setErrorDetails(null);
              setView('list'); 
            }}
            className="text-amber-700 hover:text-amber-900 font-semibold mb-6 flex items-center gap-2"
          >
            <span className="text-xl">←</span> Back to Drafts
          </button>

          <h1 className="text-4xl font-bold text-amber-900 mb-8">Set Up Your New Book</h1>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              <strong>Error:</strong> {error}
              {errorDetails && <div className="text-sm mt-1">{errorDetails}</div>}
              <button 
                onClick={() => { setError(null); setErrorDetails(null); }}
                className="ml-2 text-red-600 hover:text-red-800"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-2xl p-10">
            
            {/* Main Form Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    {/* Title */}
                    <div className="mb-6">
                        <label className="block font-bold text-amber-900 mb-2">Book Title *</label>
                        <input
                            type="text"
                            value={bookFormData.title}
                            onChange={(e) => setBookFormData({ ...bookFormData, title: e.target.value })}
                            placeholder="Enter your book title..."
                            className="w-full px-4 py-3 border-2 border-amber-300 rounded-lg focus:border-amber-600 focus:ring-1 focus:ring-amber-600 outline-none text-xl"
                        />
                        <p className="text-xs text-red-500 mt-1">
                            *Title cannot be changed after creation. Choose wisely!
                        </p>
                    </div>

                    {/* Subtitle */}
                    <div className="mb-6">
                        <label className="block font-bold text-amber-900 mb-2">Subtitle (Optional)</label>
                        <input
                            type="text"
                            value={bookFormData.subtitle}
                            onChange={(e) => setBookFormData({ ...bookFormData, subtitle: e.target.value })}
                            placeholder="Add a catchy subtitle..."
                            className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:border-amber-500 outline-none"
                        />
                    </div>
                    
                    {/* Author (locked to username) */}
                    <div className="mb-6">
                        <label className="block font-bold text-amber-900 mb-2">Author</label>
                        <input
                            type="text"
                            value={user.display_name}
                            disabled
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-100 text-gray-600"
                        />
                        <p className="text-xs text-amber-600 mt-1">
                            Author name is automatically set to your username.
                        </p>
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                        <label className="block font-bold text-amber-900 mb-2">Book Description *</label>
                        <textarea
                            value={bookFormData.description}
                            onChange={(e) => setBookFormData({ ...bookFormData, description: e.target.value })}
                            placeholder="Describe your book, its genre, and what readers can expect..."
                            rows={6}
                            className="w-full px-4 py-3 border-2 border-amber-300 rounded-lg focus:border-amber-600 focus:ring-1 focus:ring-amber-600 outline-none"
                        />
                    </div>

                    {/* License */}
                    <div className="mb-6">
                        <label className="block font-bold text-amber-900 mb-2">License Type</label>
                        <select
                            value={bookFormData.license_type}
                            onChange={(e) => setBookFormData({ ...bookFormData, license_type: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:border-amber-500 outline-none bg-white"
                        >
                            <option value="Public Domain">Public Domain (Default & Recommended)</option>
                            <option value="Creative Commons Zero">Creative Commons Zero (CC0)</option>
                            <option value="Creative Commons BY">Creative Commons BY</option>
                        </select>
                        <p className="text-xs text-amber-600 mt-1">
                            Selecting a license allows others to know how they can use your work.
                        </p>
                    </div>
                </div>

                {/* Cover Image Preview and Selection */}
                <div className="mt-8 md:mt-0">
                    <label className="block font-bold text-amber-900 mb-4">
                        Select Book Cover Background *
                    </label>
                    
                    {/* Live Preview */}
                    <div className="mb-6 flex justify-center">
                        <div
                            className="w-64 h-96 bg-cover bg-center rounded-lg shadow-2xl relative border-4 border-amber-100"
                            style={{ backgroundImage: `url(${bookFormData.cover_image})` }}
                        >
                            <div className="absolute inset-0 bg-black bg-opacity-45 flex flex-col justify-center items-center p-6 text-white text-shadow-lg">
                                <h2 className="text-3xl font-extrabold text-center mb-2">
                                    {bookFormData.title || 'Your Book Title'}
                                </h2>
                                {bookFormData.subtitle && (
                                    <p className="text-xl text-center mb-4">
                                        {bookFormData.subtitle}
                                    </p>
                                )}
                                <p className="text-sm mt-auto">
                                    by {user.display_name}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Background Selection Grid */}
                    <div className="grid grid-cols-5 gap-3">
                        {bookBackgrounds.map((bg, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => setBookFormData({ ...bookFormData, cover_image: bg })}
                                className={`h-16 w-full bg-cover bg-center rounded-lg border-4 transition-all focus:outline-none ${
                                    bookFormData.cover_image === bg
                                        ? 'border-amber-600 ring-4 ring-amber-200 shadow-lg'
                                        : 'border-transparent hover:border-amber-300 shadow-md'
                                }`}
                                style={{ backgroundImage: `url(${bg})` }}
                                title={`Cover Style ${idx + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <hr className="my-8 border-amber-100" />

            {/* Agreements */}
            <div className="mb-8 space-y-4">
                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={bookFormData.terms_agreed}
                            onChange={(e) => setBookFormData({ ...bookFormData, terms_agreed: e.target.checked })}
                            className="mt-1 h-5 w-5 text-amber-600 border-amber-300 rounded focus:ring-amber-500"
                        />
                        <span className="text-sm text-amber-900">
                            I agree to the{' '}
                            <Link to="/community-guidelines" className="text-amber-700 font-bold underline hover:text-amber-900">
                                Community Guidelines
                            </Link> and certify this work is original.
                        </span>
                    </label>
                </div>

                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={bookFormData.public_domain_agreed}
                            onChange={(e) => setBookFormData({ ...bookFormData, public_domain_agreed: e.target.checked })}
                            className="mt-1 h-5 w-5 text-red-600 border-red-300 rounded focus:ring-red-500"
                        />
                        <span className="text-sm text-red-900 font-medium">
                            I confirm this book is **Public Domain** and contains no restricted or third-party copyrighted material.
                        </span>
                    </label>
                </div>
            </div>

            {/* Create Button */}
            <button
                onClick={createNewEbook}
                disabled={!bookFormData.title || !bookFormData.description || !bookFormData.terms_agreed || !bookFormData.public_domain_agreed}
                className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-extrabold py-5 rounded-xl shadow-xl transition-colors text-xl"
            >
                Start Writing Chapter 1
            </button>
          </div>
        </div>
      </div>
    );
  }

  // WRITE VIEW - Chapter editor / Settings view
  if (view === 'write' && currentEbook) {
    
    // RENDER: Book Settings View
    if (editorSubView === 'settings') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50">
                <div className="max-w-4xl mx-auto px-4 py-12">
                    <h1 className="text-4xl font-bold text-amber-900 mb-8">⚙️ Book Settings: {currentEbook.title}</h1>
                    
                    <button
                        onClick={() => setEditorSubView('editor')}
                        className="text-amber-700 hover:text-amber-900 font-semibold mb-6 flex items-center gap-2"
                    >
                        <span className="text-xl">←</span> Back to Editor
                    </button>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                            <strong>Error:</strong> {error}
                            {errorDetails && <div className="text-sm mt-1">{errorDetails}</div>}
                            <button 
                                onClick={() => { setError(null); setErrorDetails(null); }}
                                className="ml-2 text-red-600 hover:text-red-800"
                            >
                                Dismiss
                            </button>
                        </div>
                    )}

                    <div className="bg-white rounded-xl shadow-2xl p-10">
                        {/* Form similar to the 'create' view but with update logic */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                {/* Title (Disabled post-creation) */}
                                <div className="mb-6">
                                    <label className="block font-bold text-amber-900 mb-2">Book Title</label>
                                    <input
                                        type="text"
                                        value={bookFormData.title}
                                        disabled
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-100 text-gray-600 text-xl"
                                    />
                                    <p className="text-xs text-red-500 mt-1">Title cannot be changed.</p>
                                </div>

                                {/* Subtitle */}
                                <div className="mb-6">
                                    <label className="block font-bold text-amber-900 mb-2">Subtitle</label>
                                    <input
                                        type="text"
                                        value={bookFormData.subtitle}
                                        onChange={(e) => setBookFormData({ ...bookFormData, subtitle: e.target.value })}
                                        placeholder="Add a catchy subtitle..."
                                        className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:border-amber-500 outline-none"
                                    />
                                </div>
                                
                                {/* Description */}
                                <div className="mb-6">
                                    <label className="block font-bold text-amber-900 mb-2">Book Description</label>
                                    <textarea
                                        value={bookFormData.description}
                                        onChange={(e) => setBookFormData({ ...bookFormData, description: e.target.value })}
                                        placeholder="Describe your book..."
                                        rows={6}
                                        className="w-full px-4 py-3 border-2 border-amber-300 rounded-lg focus:border-amber-600 outline-none"
                                    />
                                </div>

                                {/* License */}
                                <div className="mb-6">
                                    <label className="block font-bold text-amber-900 mb-2">License Type</label>
                                    <select
                                        value={bookFormData.license_type}
                                        onChange={(e) => setBookFormData({ ...bookFormData, license_type: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:border-amber-500 outline-none bg-white"
                                    >
                                        <option value="Public Domain">Public Domain</option>
                                        <option value="Creative Commons Zero">Creative Commons Zero (CC0)</option>
                                        <option value="Creative Commons BY">Creative Commons BY</option>
                                    </select>
                                </div>
                            </div>
                            
                            {/* Cover Image Selection */}
                            <div className="mt-8 md:mt-0">
                                <label className="block font-bold text-amber-900 mb-4">Select Book Cover Background</label>
                                
                                {/* Live Preview */}
                                <div className="mb-6 flex justify-center">
                                    <div
                                        className="w-64 h-96 bg-cover bg-center rounded-lg shadow-2xl relative border-4 border-amber-100"
                                        style={{ backgroundImage: `url(${bookFormData.cover_image})` }}
                                    >
                                        <div className="absolute inset-0 bg-black bg-opacity-45 flex flex-col justify-center items-center p-6 text-white text-shadow-lg">
                                            <h2 className="text-3xl font-extrabold text-center mb-2">
                                                {bookFormData.title || 'Your Book Title'}
                                            </h2>
                                            <p className="text-sm mt-auto">
                                                by {user.display_name}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Background Selection Grid */}
                                <div className="grid grid-cols-5 gap-3">
                                    {bookBackgrounds.map((bg, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setBookFormData({ ...bookFormData, cover_image: bg })}
                                            className={`h-16 w-full bg-cover bg-center rounded-lg border-4 transition-all focus:outline-none ${
                                                bookFormData.cover_image === bg
                                                    ? 'border-amber-600 ring-4 ring-amber-200 shadow-lg'
                                                    : 'border-transparent hover:border-amber-300 shadow-md'
                                            }`}
                                            style={{ backgroundImage: `url(${bg})` }}
                                            title={`Cover Style ${idx + 1}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <hr className="my-8 border-amber-100" />
                        
                        {/* Save Button */}
                        <button
                            onClick={updateEbookMetadata}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-extrabold py-4 rounded-xl shadow-xl transition-colors text-lg"
                        >
                            Save Book Settings
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
    // RENDER: Main Editor View
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex h-screen">
          
          {/* Sidebar - Chapters & Metrics */}
          <div className="w-80 bg-white border-r-4 border-amber-100 flex flex-col">
            <div className="p-6 border-b-4 border-amber-100">
              <Link
                to="/write"
                onClick={() => { 
                  saveChapter(chapters[activeChapterIndex]); 
                  setView('list'); 
                }}
                className="text-sm text-amber-700 hover:text-amber-900 block mb-4 font-semibold"
              >
                ← Back to Drafts
              </Link>
              <h2 className="font-extrabold text-2xl text-amber-900 truncate mb-1" title={currentEbook.title}>{currentEbook.title}</h2>
              <p className="text-sm text-amber-700">by {user.display_name}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2 mb-4">
                {chapters.map((chapter, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl shadow-md cursor-pointer transition-all border-2 ${
                      idx === activeChapterIndex
                        ? 'bg-amber-100 border-amber-600 shadow-lg'
                        : 'bg-white border-gray-100 hover:bg-amber-50'
                    }`}
                    onClick={() => switchChapter(idx)}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-extrabold text-sm text-amber-900">
                        Chapter {chapter.number}
                      </span>
                      {chapters.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteChapter(idx);
                          }}
                          className="text-red-600 hover:text-red-800 text-sm p-1 rounded-full hover:bg-red-100 transition-colors"
                          title="Delete Chapter"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <p className="text-base text-amber-800 truncate font-medium">{chapter.title || 'Untitled Chapter'}</p>
                    <div className="flex justify-between mt-1">
                      <p className="text-xs text-gray-500">{chapter.word_count || getWordCount(chapter.content)} words</p>
                      <p className="text-xs text-amber-600 font-semibold">{getApproxPageCount(chapter.word_count || getWordCount(chapter.content))} pages</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={addChapter}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg"
              >
                + Add New Chapter
              </button>
            </div>

            {/* Publish Section (Pinned to bottom) */}
            <div className="p-6 border-t-4 border-amber-100 bg-amber-50">
              <h3 className="font-bold text-lg text-amber-900 mb-3">Publish Readiness</h3>
              <div className="mb-4 text-sm">
                <div className="flex justify-between text-amber-800 mb-1">
                  <span>Total Pages (by word count):</span>
                  <span className="font-bold">{totalPages} / 30</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-amber-600 transition-all ${canPublish ? 'bg-green-600' : 'bg-amber-600'}`}
                    style={{ width: `${Math.min(100, (totalPages / 30) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-amber-700 mt-1">Pages are calculated based on word count (250 words per page)</p>
              </div>

              <button
                onClick={() => { 
                  saveChapter(chapters[activeChapterIndex]); 
                  setShowPublishModal(true); 
                }}
                disabled={!canPublish}
                className={`w-full font-bold py-3 rounded-xl transition-colors shadow-xl text-lg ${
                  canPublish
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                }`}
              >
                {canPublish ? '🚀 Publish EBook Now' : `Need ${30 - totalPages} more pages`}
              </button>
            </div>
          </div>

          {/* Main Editor Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Editor Top Bar */}
            <div className="bg-white border-b-4 border-amber-100 p-4 flex justify-between items-center shadow-md z-10">
              <div className="flex-1">
                <input
                  type="text"
                  value={currentChapterData?.title || ''}
                  onChange={(e) => updateChapter('title', e.target.value)}
                  className="text-2xl font-extrabold text-amber-900 border-2 border-transparent hover:border-amber-200 focus:border-amber-500 rounded px-2 py-1 w-full max-w-lg outline-none transition-colors"
                  placeholder={`Chapter ${currentChapterData?.number || ''} Title`}
                />
              </div>
              
              <div className="flex items-center gap-4 text-sm text-amber-700">
                <button 
                    onClick={() => setEditorSubView('settings')}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-amber-100 transition-colors font-semibold"
                >
                    <span role="img" aria-label="settings">⚙️</span> Settings
                </button>
                
                <button 
                    onClick={() => saveChapter(chapters[activeChapterIndex])}
                    disabled={saving}
                    className="flex items-center gap-2 p-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors font-semibold disabled:bg-gray-400"
                >
                    {saving ? 'Saving...' : 'Manual Save'}
                </button>

                {lastSaved && (
                  <span className="text-green-600 font-semibold">
                    Saved ✓ {lastSaved.toLocaleTimeString()}
                  </span>
                )}
                
                <div className="flex flex-col items-end">
                  <span className="text-amber-900 font-bold">
                      {currentChapterData?.word_count || getWordCount(currentChapterData?.content)} Words
                  </span>
                  <span className="text-amber-700 text-xs">
                      {getApproxPageCount(currentChapterData?.word_count || getWordCount(currentChapterData?.content))} Pages
                  </span>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-4 mt-4 flex justify-between items-center">
                <div>
                  <strong>Error:</strong> {error}
                  {errorDetails && <div className="text-sm mt-1">{errorDetails}</div>}
                </div>
                <button 
                  onClick={() => { setError(null); setErrorDetails(null); }}
                  className="text-red-600 hover:text-red-800"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Editor Content Area */}
            <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
              <div className="bg-white rounded-lg shadow-inner p-6 min-h-full">
                <ReactQuill
                  theme="snow"
                  value={currentChapterData?.content || ''}
                  onChange={(value) => updateChapter('content', value)}
                  modules={quillModules}
                  formats={quillFormats}
                  placeholder="Start writing your chapter here. Use the toolbar to format your text."
                  style={{ height: 'calc(100% - 42px)', minHeight: '500px' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Publish Modal */}
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
      </div>
    );
  }

  return null;
};

export default WriteEbookPage;