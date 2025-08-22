import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, User, Eye, WifiOff } from 'lucide-react';

const ArticleCard = ({ article, variant = 'default', isOffline = false }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const truncateSubtitle = (subtitle, maxLength = 100) => {
    if (!subtitle || subtitle.length <= maxLength) return subtitle;
    return `${subtitle.slice(0, maxLength)}...`;
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

  const hasLongSubtitle = article.subtitle && article.subtitle.length > 100;

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
    
    // If all attempts fail, show contact link
    container.innerHTML = `
      <div class="w-full h-full flex items-center justify-center text-gray-500 font-bold text-2xl">
        <div class="text-center">
          <p>Images unavailable offline</p>
          <Link to="/contact" class="text-blue-600 underline">
            Contact us to support keeping our platform live!
          </Link>
        </div>
      </div>
    `;
  };

  if (variant === 'featured') {
    return (
      <Link to={`/article/${article.id}`}>
        <article className="bg-white border-4 border-black p-8 hover:bg-gray-50 transition-colors cursor-pointer w-full max-w-md min-h-[32rem] flex flex-col relative">
          {/* Offline indicator */}
          {isOffline && (
            <div className="absolute top-2 right-2 z-10">
              <span className="bg-yellow-500 text-white px-2 py-1 text-xs font-bold uppercase tracking-wide rounded flex items-center">
                <WifiOff size={10} className="mr-1" />
                Cached
              </span>
            </div>
          )}

          <div className="aspect-video bg-gray-200 border-2 border-black mb-6 overflow-hidden h-48">
            {article.featuredImage ? (
              <img 
                src={getImageSrc(article.featuredImage)}
                alt={article.title}
                className="w-full h-full object-cover"
                onError={handleImageError}
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-2xl">
                <div className="text-center">
                  <p>Images unavailable offline</p>
                  <Link to="/contact" className="text-blue-600 underline">
                    Contact us to support keeping our platform live!
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          <div className="mb-4">
            <span className="bg-black text-white px-3 py-1 text-sm font-bold uppercase tracking-wide">
              {article.category || 'NEWS'}
            </span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-black leading-tight mb-4 tracking-tight line-clamp-2">
            {article.title}
          </h2>
          
          {article.subtitle && (
            <div className="relative mb-6">
              <h3 className="text-lg md:text-xl font-medium leading-snug text-gray-700 line-clamp-3">
                {truncateSubtitle(article.subtitle)}
              </h3>
              {hasLongSubtitle && (
                <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent flex items-end justify-center">
                  <span className="bg-black text-white px-3 py-1 text-sm font-bold uppercase mb-2">
                    READ MORE
                  </span>
                </div>
              )}
            </div>
          )}
          
          <p className="text-lg font-medium mb-6 leading-relaxed text-gray-700 line-clamp-3 flex-grow">
            {article.excerpt}
          </p>
          
          <div className="flex items-center justify-between border-t-2 border-black pt-4 mt-auto">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User size={18} />
                <span className="font-bold">{article.author}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock size={18} />
                <span className="font-bold">{formatDate(article.createdAt)}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Eye size={18} />
                <span className="font-bold">
                  {article.views || 0} views
                  {isOffline && <span className="text-xs text-gray-500 ml-1">(cached)</span>}
                </span>
              </div>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  if (variant === 'trending') {
    return (
      <Link to={`/article/${article.id}`}>
        <article className="bg-white border-2 border-black p-6 hover:bg-gray-50 transition-colors cursor-pointer w-full max-w-md min-h-[24rem] flex flex-col relative">
          {/* Offline indicator */}
          {isOffline && (
            <div className="absolute top-2 right-2 z-10">
              <span className="bg-yellow-500 text-white px-2 py-1 text-xs font-bold uppercase tracking-wide rounded flex items-center">
                <WifiOff size={10} className="mr-1" />
                Cached
              </span>
            </div>
          )}

          <div className="mb-3">
            <span className="bg-gray-900 text-white px-2 py-1 text-xs font-bold uppercase tracking-wide">
              {article.category || 'NEWS'}
            </span>
          </div>
          
          <h3 className="text-xl md:text-2xl font-black leading-tight mb-3 tracking-tight line-clamp-2">
            {article.title}
          </h3>
          
          {article.subtitle && (
            <div className="relative mb-4">
              <h3 className="text-base font-medium leading-snug text-gray-700 line-clamp-2">
                {truncateSubtitle(article.subtitle)}
              </h3>
              {hasLongSubtitle && (
                <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent flex items-end justify-center">
                  <span className="bg-gray-900 text-white px-2 py-1 text-xs font-bold uppercase mb-2">
                    READ MORE
                  </span>
                </div>
              )}
            </div>
          )}
          
          <p className="text-base font-medium mb-4 leading-relaxed text-gray-700 line-clamp-2 flex-grow">
            {article.excerpt}
          </p>
          
          <div className="flex items-center justify-between text-sm mt-auto">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <User size={14} />
                <span className="font-bold">{article.author}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock size={14} />
                <span className="font-bold">{formatDate(article.createdAt)}</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <Eye size={14} />
                <span className="font-bold">
                  {article.views || 0} views
                  {isOffline && <span className="text-xs text-gray-500 ml-1">(cached)</span>}
                </span>
              </div>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link to={`/article/${article.id}`}>
      <article className="bg-white border-2 border-black p-6 hover:bg-gray-50 transition-colors cursor-pointer w-full max-w-md min-h-[24rem] flex flex-col relative">
        {/* Offline indicator */}
        {isOffline && (
          <div className="absolute top-2 right-2 z-10">
            <span className="bg-yellow-500 text-white px-2 py-1 text-xs font-bold uppercase tracking-wide rounded flex items-center">
              <WifiOff size={10} className="mr-1" />
              Cached
            </span>
          </div>
        )}

        <div className="mb-3">
          <span className="bg-gray-900 text-white px-2 py-1 text-xs font-bold uppercase tracking-wide">
            {article.category || 'NEWS'}
          </span>
        </div>
        
        <h3 className="text-xl md:text-2xl font-black leading-tight mb-3 tracking-tight line-clamp-2">
          {article.title}
        </h3>
        
        {article.subtitle && (
          <div className="relative mb-4">
            <h3 className="text-base font-medium leading-snug text-gray-700 line-clamp-2">
              {truncateSubtitle(article.subtitle)}
            </h3>
            {hasLongSubtitle && (
              <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent flex items-end justify-center">
                <span className="bg-gray-900 text-white px-2 py-1 text-xs font-bold uppercase mb-2">
                  READ MORE
                </span>
              </div>
            )}
          </div>
        )}
        
        <p className="text-base font-medium mb-4 leading-relaxed text-gray-700 line-clamp-2 flex-grow">
          {article.excerpt}
        </p>
        
        <div className="flex items-center justify-between text-sm mt-auto">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <User size={14} />
              <span className="font-bold">{article.author}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock size={14} />
              <span className="font-bold">{formatDate(article.createdAt)}</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Eye size={14} />
              <span className="font-bold">
                {article.views || 0} views
                {isOffline && <span className="text-xs text-gray-500 ml-1">(cached)</span>}
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default ArticleCard;