// pages/admin/AdminWriteEbook.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { fetchWithDeduplication, createApiRequest } from '../../utils/apiUtils';
import { 
  Save, 
  ArrowLeft, 
  Upload,
  Image,
  Book,
  FileText,
  Eye,
  AlertCircle,
  CheckCircle,
  X,
  Plus,
  Trash2,
  Clock,
  Calendar
} from 'lucide-react';

function AdminWriteEbook() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    cover_image: '',
    license_type: 'standard',
    user_id: null,
    published: false
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [chapters, setChapters] = useState([{ chapter_number: 1, chapter_title: '', content: '' }]);
  const [activeChapter, setActiveChapter] = useState(0);

  // Fetch users for selection
  const fetchUsers = useCallback(async (query) => {
    if (!query.trim()) {
      setUserResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const response = await fetchWithDeduplication(
        `admin-users-search-${query}`,
        createApiRequest(`/admin/users/search?query=${encodeURIComponent(query)}`, { method: 'GET' })
      );
      setUserResults(response.data.users);
    } catch (error) {
      console.error('Error searching users:', error);
      setError('Failed to search users. Please try again later.');
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle user selection
  const handleSelectUser = (user) => {
    setFormData(prev => ({ ...prev, user_id: user.id }));
    setSelectedUser(user);
    setShowUserModal(false);
  };

  // Handle chapter changes
  const handleChapterChange = (index, field, value) => {
    const newChapters = [...chapters];
    newChapters[index][field] = value;
    setChapters(newChapters);
  };

  // Add new chapter
  const addChapter = () => {
    const newChapterNumber = chapters.length > 0 ? Math.max(...chapters.map(c => c.chapter_number)) + 1 : 1;
    setChapters([...chapters, { chapter_number: newChapterNumber, chapter_title: '', content: '' }]);
    setActiveChapter(newChapterNumber - 1);
  };

  // Remove chapter
  const removeChapter = (index) => {
    const newChapters = chapters.filter((_, i) => i !== index);
    setChapters(newChapters);
    if (activeChapter >= newChapters.length) {
      setActiveChapter(Math.max(0, newChapters.length - 1));
    }
  };

  // Save ebook
  const handleSave = async (publish = false) => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }
    
    if (!formData.cover_image.trim()) {
      setError('Cover image is required');
      return;
    }
    
    if (chapters.length === 0 || chapters.every(c => !c.chapter_title.trim() || !c.content.trim())) {
      setError('At least one chapter with title and content is required');
      return;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      const ebookData = {
        ...formData,
        published: publish,
        chapters: chapters.map(c => ({
          chapter_number: c.chapter_number,
          chapter_title: c.chapter_title,
          content: c.content
        }))
      };
      
      await fetchWithDeduplication(
        'admin-create-ebook',
        createApiRequest('/admin/ebooks', {
          method: 'POST',
          data: ebookData
        })
      );
      
      if (publish) {
        setIsPublished(true);
      }
      
      // Navigate to the ebook management page after saving
      navigate('/admin');
    } catch (error) {
      console.error('Error saving ebook:', error);
      setError('Failed to save ebook. Please try again later.');
      setIsSaving(false);
    }
  };

  // Load ebook data for editing
  const loadEbookForEdit = useCallback(async (ebookId) => {
    try {
      const response = await fetchWithDeduplication(
        `admin-ebook-${ebookId}`,
        createApiRequest(`/admin/ebooks/${ebookId}`, { method: 'GET' })
      );
      
      const ebook = response.data.ebook;
      setFormData({
        title: ebook.title || '',
        subtitle: ebook.subtitle || '',
        description: ebook.description || '',
        cover_image: ebook.cover_image || '',
        license_type: ebook.license_type || 'standard',
        user_id: ebook.user_id || null,
        published: ebook.published || false
      });
      
      if (ebook.chapters && ebook.chapters.length > 0) {
        setChapters(ebook.chapters);
      }
      
      if (ebook.published) {
        setIsPublished(true);
      }
    } catch (error) {
      console.error('Error loading ebook:', error);
      setError('Failed to load ebook. Please try again later.');
    }
  }, []);

  // Check for edit mode
  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    
    if (lastPart && lastPart.startsWith('edit-ebook-')) {
      const ebookId = lastPart.split('-')[1];
      loadEbookForEdit(ebookId);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 mx-auto"></div>
          <div className="text-xl font-semibold text-gray-700 mt-4">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'super-admin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-600 mx-auto mb-4" size={64}>
            <AlertCircle />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h1>
          <p className="text-gray-600 mb-6">You do not have permission to access this page.</p>
          <button 
            onClick={() => navigate('/')} 
            className="inline-flex items-center px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/admin')}
              className="mr-4 p-2 rounded-md hover:bg-gray-100 transition"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              {window.location.pathname.includes('edit-ebook-') ? 'Edit Ebook' : 'Create New Ebook'}
            </h1>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle size={20} />
              <span className="font-medium">{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
              <X size={20} />
            </button>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter ebook title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
              <input
                type="text"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter ebook subtitle (optional)"
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter ebook description"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image URL</label>
              <input
                type="text"
                name="cover_image"
                value={formData.cover_image}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter cover image URL"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">License Type</label>
              <select
                name="license_type"
                value={formData.license_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="standard">Standard</option>
                <option value="creative-commons">Creative Commons</option>
                <option value="public-domain">Public Domain</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
            <div className="flex items-center">
              {selectedUser ? (
                <div className="flex items-center bg-blue-50 border border-blue-200 px-3 py-2 rounded-md">
                  <span className="text-sm font-medium text-blue-700">{selectedUser.display_name}</span>
                  <button
                    onClick={() => setShowUserModal(true)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowUserModal(true)}
                  className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-md text-blue-700 hover:bg-blue-100"
                >
                  Select Author
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Chapters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Chapters</h2>
            <button
              onClick={addChapter}
              className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              <Plus size={16} className="mr-2" />
              Add Chapter
            </button>
          </div>
          
          <div className="space-y-4">
            {chapters.map((chapter, index) => (
              <div key={index} className={`border rounded-lg p-4 ${activeChapter === index ? 'border-blue-500' : 'border-gray-200'}`}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium text-gray-900">Chapter {chapter.chapter_number}</h3>
                  <button
                    onClick={() => removeChapter(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chapter Title</label>
                    <input
                      type="text"
                      value={chapter.chapter_title}
                      onChange={(e) => handleChapterChange(index, 'chapter_title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter chapter title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                    <textarea
                      value={chapter.content}
                      onChange={(e) => handleChapterChange(index, 'content', e.target.value)}
                      rows="6"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter chapter content"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => navigate('/admin')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" />
                Save Draft
              </>
            )}
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={isSaving || isPublished}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Publishing...
              </>
            ) : (
              <>
                <Book size={16} className="mr-2" />
                Publish
              </>
            )}
          </button>
        </div>
      </div>

      {/* User Selection Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Ebook Author</h3>
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search users by name or email"
                  autoFocus
                />
                {isSearching && (
                  <div className="absolute right-3 top-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                )}
              </div>
              {userResults.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {userResults.map(user => (
                    <div
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200"
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-200 rounded-full mr-3 flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">{user.display_name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{user.display_name}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => { setShowUserModal(false); setUserSearch(''); setUserResults([]); }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminWriteEbook;