// src/pages/EBookCatalogPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EBookCard from '../components/EBookCard';

const EBookCatalogPage = () => {
  const [ebooks, setEbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    genre: '',
    type: ''
  });
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    const fetchEbooks = async () => {
      try {
        setLoading(true);
        const params = {};
        if (filters.genre) params.genre = filters.genre;
        if (filters.type) params.type = filters.type;
        
        const response = await axios.get('/api/ebooks', { params });
        setEbooks(response.data.ebooks);
        
        // Extract unique genres
        const uniqueGenres = [...new Set(response.data.ebooks.map(ebook => ebook.genre).filter(Boolean))];
        setGenres(uniqueGenres);
      } catch (err) {
        setError('Failed to fetch e-books');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEbooks();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">E-Book Catalog</h1>
        
        <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Filter E-Books</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Genre</label>
              <select 
                name="genre" 
                value={filters.genre} 
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">All Genres</option>
                {genres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Type</label>
              <select 
                name="type" 
                value={filters.type} 
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">All Types</option>
                <option value="full">Full E-Book</option>
                <option value="mini">Mini E-Book</option>
              </select>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : (
          <>
            {ebooks.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No e-books found</h3>
                <p className="text-gray-600">Try adjusting your filters or check back later for new e-books.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ebooks.map(ebook => (
                  <EBookCard key={ebook.id} ebook={ebook} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default EBookCatalogPage;