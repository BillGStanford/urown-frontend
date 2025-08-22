import React, { useState, useEffect } from 'react';
import HeroCard from './HeroCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const FeaturedArticles = ({ isOffline = false }) => {
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedArticles = async () => {
      if (isOffline) {
        // Load offline articles from local JSON
        try {
          const response = await import('../data/articles.json');
          const offlineArticles = response.default || [];
          // Filter for featured articles
          const featured = offlineArticles.filter(
            (article) => article.isFeatured && article.status === 'published'
          );
          setFeaturedArticles(featured);
        } catch (error) {
          console.error('Error loading offline featured articles:', error);
          setFeaturedArticles([]);
        } finally {
          setLoading(false);
        }
      } else {
        // Fetch from API
        try {
          const response = await fetch('/api/articles/featured');
          if (response.ok) {
            const articles = await response.json();
            setFeaturedArticles(Array.isArray(articles) ? articles : []);
          } else {
            throw new Error('Failed to fetch featured articles');
          }
        } catch (error) {
          console.error('Error fetching featured articles:', error);
          setFeaturedArticles([]);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchFeaturedArticles();
  }, [isOffline]);

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev === featuredArticles.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? featuredArticles.length - 1 : prev - 1
    );
  };

  if (loading) {
    return <div className="text-center py-8">Loading featured articles...</div>;
  }

  if (featuredArticles.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {isOffline
          ? 'No cached featured articles available.'
          : 'No featured articles found.'}
      </div>
    );
  }

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-3xl font-bold mb-6">
        Featured Articles{' '}
        {isOffline && (
          <span className="text-sm font-normal text-gray-600">(Cached)</span>
        )}
      </h2>
      <div className="relative">
        {/* Carousel Container */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {featuredArticles.map((article) => (
              <div key={article.id} className="w-full flex-shrink-0">
                <HeroCard article={article} isOffline={isOffline} />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        {featuredArticles.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700"
              aria-label="Previous article"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700"
              aria-label="Next article"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default FeaturedArticles;