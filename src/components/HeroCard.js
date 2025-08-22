import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, User, WifiOff } from 'lucide-react';

const HeroCard = ({ article, isOffline = false }) => {
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Enhanced image path handling for offline mode
  const getImageSrc = (imagePath) => {
    if (!imagePath) return null;
    
    // If offline, always use the assets path
    if (isOffline) {
      // Extract filename from any path format
      let filename;
      if (imagePath.startsWith('/uploads/')) {
        filename = imagePath.replace('/uploads/', '');
      } else if (imagePath.startsWith('/assets/uploads/')) {
        filename = imagePath.replace('/assets/uploads/', '');
      } else if (imagePath.includes('/')) {
        // Extract just the filename from any path
        filename = imagePath.split('/').pop();
      } else {
        // Already just a filename
        filename = imagePath;
      }
      
      // Always return the assets path for offline mode
      return `/assets/uploads/${filename}`;
    }
    
    // Online mode - use original path for backend serving
    if (imagePath.startsWith('/assets/uploads/')) {
      // Convert assets path back to uploads path for backend
      const filename = imagePath.replace('/assets/uploads/', '');
      return `/uploads/${filename}`;
    }
    
    // Return original path if it's already in uploads format
    return imagePath;
  };

  // Enhanced error handler for images
  const handleImageError = (e) => {
    const img = e.target;
    const container = img.parentElement;
    
    // Try alternative path if first attempt fails
    if (isOffline && !img.dataset.retried) {
      img.dataset.retried = 'true';
      
      // If the current src is assets path, try uploads path
      if (img.src.includes('/assets/uploads/')) {
        const filename = img.src.split('/').pop();
        img.src = `/uploads/${filename}`;
        return;
      }
      
      // If the current src is uploads path, try assets path
      if (img.src.includes('/uploads/')) {
        const filename = img.src.split('/').pop();
        img.src = `/assets/uploads/${filename}`;
        return;
      }
    }
    
    // If all attempts fail, show placeholder
    container.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-200 border-2 border-black text-gray-500"><div class="text-center"><div class="text-2xl font-black mb-2">📰</div><p class="text-sm font-black uppercase tracking-wider">NO IMAGE</p></div></div>';
  };

  // Determine badge text based on featured status and author tier
  const getBadgeText = () => {
    if (article.isFeatured) {
      return 'FEATURED';
    }
    const premiumStatuses = ['diamond', 'platinum'];
    return premiumStatuses.includes(article.authorTier?.toLowerCase())
      ? 'PREMIUM'
      : 'Latest';
  };

  return (
    <Link to={`/article/${article.id}`} className="block">
      <article className="relative bg-white border-4 border-black p-6 transition-all duration-300 cursor-pointer group hover:shadow-lg hover:transform hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_0px_#000000]">
        {/* Offline indicator */}
        {isOffline && (
          <div className="absolute top-2 right-2 z-10">
            <span className="bg-yellow-500 text-white px-2 py-1 text-xs font-bold uppercase tracking-wide rounded flex items-center">
              <WifiOff size={10} className="mr-1" />
              Cached
            </span>
          </div>
        )}

        <div className="relative aspect-[3/2] mb-6 overflow-hidden">
          {article.featuredImage ? (
            <>
              <img
                src={getImageSrc(article.featuredImage)}
                alt={article.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                onError={handleImageError}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 border-2 border-black text-gray-500">
              <div className="text-center">
                <div className="text-2xl font-black mb-2">📰</div>
                <p className="text-sm font-black uppercase tracking-wider">
                  NO IMAGE
                </p>
              </div>
            </div>
          )}

          <div className="absolute top-4 left-4">
            <span
              className={`px-4 py-2 text-sm font-black uppercase tracking-wider border-2 border-black transition-colors duration-300 ${
                article.isFeatured
                  ? 'bg-yellow-400 text-black'
                  : 'bg-black text-white'
              }`}
            >
              {getBadgeText()}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {article.category && (
            <div className="inline-block">
              <span className="text-sm font-black uppercase tracking-wider text-gray-600">
                {article.category}
              </span>
            </div>
          )}

          <h2 className="text-2xl md:text-3xl font-black leading-tight tracking-tighter text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
            {article.title}
          </h2>

          {article.subtitle && (
            <h3 className="text-lg font-bold mb-4 text-gray-600 leading-snug">
              {article.subtitle}
            </h3>
          )}

          <p className="text-base font-medium mb-6 text-gray-700 leading-relaxed">
            {article.excerpt}
          </p>

          <div className="flex items-center justify-between border-t-4 border-black pt-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User size={18} className="text-gray-700" />
                <span className="font-black text-gray-900 uppercase tracking-wide text-sm">
                  {article.author}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock size={18} className="text-gray-700" />
                <span className="font-black text-gray-900 uppercase tracking-wide text-sm">
                  {formatDate(article.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default HeroCard;