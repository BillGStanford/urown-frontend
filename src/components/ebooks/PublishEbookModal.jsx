import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PublishEbookModal = ({ ebook, totalPages, onClose, onSuccess }) => {
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [agreedToGuidelines, setAgreedToGuidelines] = useState(false);
  const [booksRemaining, setBooksRemaining] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTags();
    checkPublishingLimit();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await axios.get('/ebooks/tags');
      setTags(response.data.tags);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const checkPublishingLimit = async () => {
    try {
      // This would need a backend endpoint to check weekly limit
      // For now, we'll set it to 2
      setBooksRemaining(2);
    } catch (error) {
      console.error('Error checking limit:', error);
    }
  };

  const toggleTag = (tagId) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId));
    } else if (selectedTags.length < 5) {
      setSelectedTags([...selectedTags, tagId]);
    } else {
      alert('You can select a maximum of 5 tags');
    }
  };

  const handlePublish = async () => {
    if (totalPages < 30) {
      alert('Your book must have at least 30 pages to publish');
      return;
    }

    if (selectedTags.length === 0) {
      alert('Please select at least 1 tag');
      return;
    }

    if (!agreedToGuidelines) {
      alert('Please agree to the Community Guidelines');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`/ebooks/${ebook.id}/publish`, {
        tagIds: selectedTags
      });
      
      alert('🎉 Your book has been published successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error publishing ebook:', error);
      alert(error.response?.data?.error || 'Failed to publish ebook');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-amber-900">📚 Publish Your Book</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Page Requirement Check */}
          <div className={`p-4 rounded-lg mb-6 ${totalPages >= 30 ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
            <div className="flex items-center justify-between">
              <span className="font-semibold">
                {totalPages >= 30 ? '✅' : '❌'} Page Requirement
              </span>
              <span className={`font-bold ${totalPages >= 30 ? 'text-green-700' : 'text-red-700'}`}>
                {totalPages} / 30 pages
              </span>
            </div>
            {totalPages < 30 && (
              <p className="text-sm text-red-700 mt-2">
                Your book needs at least 30 pages to be published. Please add more content.
              </p>
            )}
          </div>

          {/* Publishing Limits */}
          {booksRemaining !== null && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800">
                <strong>Weekly Publishing Limit:</strong> You can publish {booksRemaining} more {booksRemaining === 1 ? 'book' : 'books'} this week
              </p>
            </div>
          )}

          {/* Select Tags */}
          <div className="mb-6">
            <h3 className="font-bold text-amber-900 mb-3">
              Select Tags (1-5 required)
            </h3>
            <p className="text-sm text-amber-700 mb-3">
              Selected: {selectedTags.length} / 5
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-2 border-2 border-amber-200 rounded-lg">
              {tags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    selectedTags.includes(tag.id)
                      ? 'bg-amber-600 text-white'
                      : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          {/* License */}
          <div className="mb-6 p-4 bg-amber-50 rounded-lg">
            <h3 className="font-bold text-amber-900 mb-2">License</h3>
            <p className="text-sm text-amber-800">
              {ebook.license_type}
            </p>
          </div>

          {/* Agreements */}
          <div className="mb-6 space-y-4">
            <label className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg cursor-pointer hover:bg-amber-100">
              <input
                type="checkbox"
                checked={agreedToGuidelines}
                onChange={(e) => setAgreedToGuidelines(e.target.checked)}
                className="mt-1"
              />
              <span className="text-sm text-amber-800">
                I agree to the Community Guidelines and confirm that this book is Public Domain and contains no copyrighted material
              </span>
            </label>

            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
              <h4 className="font-bold text-yellow-900 mb-2">⚠️ Important Information</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Publishing is final - your book will be visible to everyone</li>
                <li>• Edits after publishing may require re-review</li>
                <li>• Your cover, title, and content will appear publicly</li>
                <li>• The platform can remove books that violate guidelines</li>
                <li>• You can only publish 2 books per week</li>
              </ul>
            </div>
          </div>

          {/* Publish Button */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePublish}
              disabled={totalPages < 30 || selectedTags.length === 0 || !agreedToGuidelines || loading}
              className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors"
            >
              {loading ? 'Publishing...' : '📚 Publish Book'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublishEbookModal;