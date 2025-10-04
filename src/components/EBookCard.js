// src/components/EBookCard.js
import React from 'react';
import { Link } from 'react-router-dom';

const EBookCard = ({ ebook }) => {
  const { id, title, genre, ebook_type, display_name, created_at } = ebook;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${ebook_type === 'full' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
            {ebook_type === 'full' ? 'Full E-Book' : 'Mini E-Book'}
          </span>
        </div>
        {genre && (
          <div className="mb-3">
            <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">
              {genre}
            </span>
          </div>
        )}
        <p className="text-gray-600 mb-4">By {display_name}</p>
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-sm">
            {new Date(created_at).toLocaleDateString()}
          </span>
          <Link 
            to={`/ebook/${id}`} 
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300"
          >
            Read
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EBookCard;