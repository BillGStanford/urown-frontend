// src/components/ChapterList.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ChapterList = ({ chapters, ebookId, onReorder, onDelete, currentChapterId }) => {
  const navigate = useNavigate();
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

  const handleChapterClick = (chapterId) => {
    navigate(`/ebooks/edit/${ebookId}/chapter/${chapterId}`);
  };

  const handleAddChapter = () => {
    navigate(`/ebooks/write/${ebookId}/chapter`);
  };

  return (
    <div className="chapter-list bg-white border border-gray-300 rounded-lg">
      <div className="p-4 border-b border-gray-300 flex justify-between items-center">
        <h3 className="font-bold text-lg">Chapters</h3>
        <button
          onClick={handleAddChapter}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          + Add Chapter
        </button>
      </div>

      {chapters.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <p>No chapters yet.</p>
          <button
            onClick={handleAddChapter}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create First Chapter
          </button>
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
                  onClick={() => handleChapterClick(chapter.id)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 font-mono text-sm">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="font-semibold text-gray-900">
                      {chapter.title || 'Untitled Chapter'}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-gray-500 flex gap-4">
                    <span>{chapter.word_count || 0} words</span>
                    <span>{chapter.status === 'draft' ? 'Draft' : 'Published'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleChapterClick(chapter.id)}
                    className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm"
                  >
                    Edit
                  </button>
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
                  <div className="cursor-move text-gray-400 pl-2">
                    ⋮⋮
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChapterList;