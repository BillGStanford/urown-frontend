// src/components/PublishModal.jsx
import React, { useState } from 'react';

const PublishModal = ({ isOpen, onClose, onPublish, ebook, weeklyPublishedCount = 0 }) => {
  const [length, setLength] = useState(ebook?.length || 'short');
  const [tags, setTags] = useState(ebook?.tags || []);
  const [customTag, setCustomTag] = useState('');
  const [license, setLicense] = useState(ebook?.license || 'all-rights-reserved');
  const [isbn, setIsbn] = useState(ebook?.isbn || '');

  const MAX_WEEKLY_BOOKS = 2;
  const canPublish = weeklyPublishedCount < MAX_WEEKLY_BOOKS;

  const availableTags = [
    'Fiction',
    'Non-fiction',
    'Policy',
    'Essay',
    'Debate',
    'Anthology',
    'Memoir',
    'Biography',
    'History',
    'Philosophy',
    'Science',
    'Technology',
    'Self-help',
    'Business',
    'Education'
  ];

  const handleAddTag = (tag) => {
    if (tags.length < 5 && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const handleRemoveTag = (tag) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleAddCustomTag = () => {
    if (customTag.trim() && tags.length < 5 && !tags.includes(customTag.trim())) {
      setTags([...tags, customTag.trim()]);
      setCustomTag('');
    }
  };

  const handlePublish = () => {
    onPublish({
      length,
      tags,
      license,
      isbn: isbn.trim() || null
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold">Publish Book</h2>
          <p className="text-gray-600 mt-2">
            Review your book details before publishing
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Weekly Limit Warning */}
          {!canPublish && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-semibold">
                ⚠️ Weekly Limit Reached
              </p>
              <p className="text-red-700 text-sm mt-1">
                You've published {weeklyPublishedCount} of {MAX_WEEKLY_BOOKS} books this week. 
                Please wait until next week to publish more books.
              </p>
            </div>
          )}

          {/* Book Info Display */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-bold text-lg mb-2">{ebook?.title}</h3>
            {ebook?.description && (
              <p className="text-gray-700 text-sm">{ebook.description}</p>
            )}
            <div className="mt-3 text-sm text-gray-600">
              <span className="font-semibold">Chapters:</span> {ebook?.chapter_count || 0}
            </div>
          </div>

          {/* Length Selection */}
          <div>
            <label className="block font-semibold mb-2">Book Length</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="short"
                  checked={length === 'short'}
                  onChange={(e) => setLength(e.target.value)}
                  className="mr-2"
                />
                Short Length
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="long"
                  checked={length === 'long'}
                  onChange={(e) => setLength(e.target.value)}
                  className="mr-2"
                />
                Long Length
              </label>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block font-semibold mb-2">
              Tags (Select up to 5)
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {availableTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleAddTag(tag)}
                  disabled={tags.includes(tag) || tags.length >= 5}
                  className={`px-3 py-1 rounded text-sm ${
                    tags.includes(tag)
                      ? 'bg-blue-600 text-white'
                      : tags.length >= 5
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Custom Tag Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddCustomTag()}
                placeholder="Add custom tag..."
                maxLength={20}
                disabled={tags.length >= 5}
                className="flex-1 px-3 py-2 border border-gray-300 rounded"
              />
              <button
                onClick={handleAddCustomTag}
                disabled={!customTag.trim() || tags.length >= 5}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>

            {/* Selected Tags */}
            {tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm flex items-center gap-2"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* License */}
          <div>
            <label className="block font-semibold mb-2">License</label>
            <select
              value={license}
              onChange={(e) => setLicense(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            >
              <option value="all-rights-reserved">All Rights Reserved</option>
              <option value="cc-by">Creative Commons BY</option>
              <option value="cc-by-sa">Creative Commons BY-SA</option>
              <option value="cc-by-nc">Creative Commons BY-NC</option>
              <option value="public-domain">Public Domain</option>
            </select>
          </div>

          {/* ISBN (Optional) */}
          <div>
            <label className="block font-semibold mb-2">
              ISBN (Optional)
            </label>
            <input
              type="text"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              placeholder="978-3-16-148410-0"
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
            <p className="text-xs text-gray-500 mt-1">
              If you have an ISBN for this book, you can add it here
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handlePublish}
            disabled={!canPublish}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {canPublish ? 'Publish Book' : 'Cannot Publish'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublishModal;