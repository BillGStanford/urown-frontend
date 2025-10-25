// components/ArticleCard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Eye, MessageSquare, Award, Flame, Clock, Sparkles, Tag, User } from 'lucide-react';

function ArticleCard({ article, size = 'normal', counterCount = null, viewMode = 'grid' }) {
  const navigate = useNavigate();
  
  const getTierConfig = (tier) => {
    switch (tier?.toLowerCase()) {
      case 'silver':
        return { 
          emoji: '🥈', 
          gradient: 'from-gray-300 via-gray-400 to-gray-500',
          textColor: 'text-gray-700',
          bgAccent: 'bg-gray-100',
          borderColor: 'border-gray-300'
        };
      case 'gold':
        return { 
          emoji: '🥇', 
          gradient: 'from-yellow-300 via-yellow-400 to-yellow-500',
          textColor: 'text-yellow-700',
          bgAccent: 'bg-yellow-50',
          borderColor: 'border-yellow-300'
        };
      case 'platinum':
        return { 
          emoji: '💎', 
          gradient: 'from-cyan-300 via-blue-400 to-purple-500',
          textColor: 'text-purple-700',
          bgAccent: 'bg-purple-50',
          borderColor: 'border-purple-300'
        };
      default:
        return { 
          emoji: '🥈', 
          gradient: 'from-gray-300 via-gray-400 to-gray-500',
          textColor: 'text-gray-700',
          bgAccent: 'bg-gray-100',
          borderColor: 'border-gray-300'
        };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = (now - date) / (1000 * 60);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m ago`;
    
    const diffInHours = diffInMinutes / 60;
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    
    const diffInDays = diffInHours / 24;
    if (diffInDays < 7) return `${Math.floor(diffInDays)}d ago`;
    
    // For older posts, show actual date
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const formatViews = (views) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views;
  };

  const truncateContent = (content, maxLength) => {
    if (!content) return '';
    const stripped = content.replace(/<[^>]*>/g, '');
    if (stripped.length <= maxLength) return stripped;
    return stripped.substring(0, maxLength).trim() + '...';
  };

  const handleClick = () => {
    navigate(`/article/${article.id}`);
  };

  // Navigate to user profile when username is clicked
  const handleUserClick = (e) => {
    e.stopPropagation(); // Prevent the card click from firing
    navigate(`/user/${encodeURIComponent(article.display_name)}`);
  };

  const isDebateOpinion = article.debate_topic_id !== null;
  const isWinner = article.is_debate_winner;
  const tierConfig = getTierConfig(article.tier);
  
  // Get topics array, handling both array and string formats
  const topics = article.topics ? 
    (Array.isArray(article.topics) ? article.topics : 
      typeof article.topics === 'string' ? article.topics.split(',') : []) : [];

  // Render topics as tags
  const renderTopics = (maxCount = 3, className = "") => {
    if (!topics || topics.length === 0) return null;
    
    return (
      <div className={`flex flex-wrap gap-1 ${className}`}>
        {topics.slice(0, maxCount).map((topic, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium"
          >
            <Tag size={10} />
            {typeof topic === 'string' ? topic : topic.name || topic}
          </span>
        ))}
        {topics.length > maxCount && (
          <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
            +{topics.length - maxCount}
          </span>
        )}
      </div>
    );
  };

  // List View Mode
  if (viewMode === 'list') {
    return (
      <div 
        className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-gray-200 overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1"
        onClick={handleClick}
      >
        <div className="flex flex-col sm:flex-row">
          {/* Tier Badge Section */}
          <div className={`sm:w-28 flex items-center justify-center p-6 bg-gradient-to-br ${tierConfig.gradient} relative overflow-hidden`}>
            <div className="absolute inset-0 bg-white/10"></div>
            <div className="text-center relative z-10">
              <div className="text-4xl mb-2 drop-shadow-lg">{tierConfig.emoji}</div>
              <div className="text-xs font-black text-white uppercase tracking-wider drop-shadow">{article.tier}</div>
            </div>
          </div>
          
          {/* Content Section */}
          <div className="flex-1 p-6">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  {/* Make username clickable */}
                  <button
                    onClick={handleUserClick}
                    className="text-sm font-bold text-gray-900 hover:text-orange-600 transition-colors flex items-center gap-1"
                  >
                    <User className="w-3 h-3" />
                    {article.display_name}
                  </button>
                  <span className="text-gray-300">•</span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500">
                    <Clock className="w-3 h-3" />
                    {formatDate(article.created_at)}
                  </span>
                </div>
                
                {/* Topics in List View */}
                {renderTopics(3, "mb-2")}
                
                <h3 className="text-xl font-black text-gray-900 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-red-500 group-hover:bg-clip-text transition-all duration-300 line-clamp-2 mb-2">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                  {truncateContent(article.content, 150)}
                </p>
              </div>
            </div>
            
            {/* Footer */}
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <div className="flex items-center gap-4 text-sm text-gray-600 mr-auto">
                <span className="inline-flex items-center gap-1.5 font-bold hover:text-gray-900 transition-colors">
                  <Eye className="w-4 h-4" />
                  {formatViews(article.views || 0)}
                </span>
                {counterCount !== null && (
                  <span className="inline-flex items-center gap-1.5 font-bold hover:text-gray-900 transition-colors">
                    <MessageSquare className="w-4 h-4" />
                    {counterCount}
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                {isDebateOpinion && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-xs font-bold shadow-md">
                    <Flame className="w-3 h-3" />
                    Debate
                  </span>
                )}
                {isWinner && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-full text-xs font-bold shadow-md">
                    <Trophy className="w-3 h-3" />
                    Winner
                  </span>
                )}
                {article.certified && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full text-xs font-bold shadow-md">
                    <Award className="w-3 h-3" />
                    Certified
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Hero Size
  if (size === 'hero') {
    return (
      <div 
        className="group relative bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]"
        onClick={handleClick}
      >
        {/* Animated background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="relative p-8 lg:p-12 min-h-[400px] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tierConfig.gradient} flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform`}>
                <span className="text-3xl">{tierConfig.emoji}</span>
              </div>
              <div>
                {/* Make username clickable */}
                <button
                  onClick={handleUserClick}
                  className="text-xl font-black text-white hover:text-orange-300 transition-colors flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  {article.display_name}
                </button>
                <div className="text-sm text-gray-400 uppercase font-bold tracking-wider">{article.tier} Tier</div>
              </div>
            </div>
            
            {/* Topics in Hero View */}
            {renderTopics(5, "mb-4")}
            
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-black mb-6 leading-tight group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-yellow-500 group-hover:to-orange-500 group-hover:bg-clip-text transition-all duration-300 line-clamp-3">
              {article.title}
            </h2>
            
            <p className="text-lg text-gray-300 leading-relaxed line-clamp-3 mb-6">
              {truncateContent(article.content, 200)}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl font-bold border border-white/20">
              <Clock className="w-4 h-4" />
              {formatDate(article.created_at)}
            </div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl font-bold border border-white/20">
              <Eye className="w-4 h-4" />
              {formatViews(article.views || 0)}
            </div>
            {counterCount !== null && (
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl font-bold border border-white/20">
                <MessageSquare className="w-4 h-4" />
                {counterCount}
              </div>
            )}
            {isDebateOpinion && (
              <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-xs font-bold shadow-lg">
                <Flame className="w-3 h-3" />
                Debate
              </div>
            )}
            {isWinner && (
              <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg text-xs font-bold shadow-lg">
                <Trophy className="w-3 h-3" />
                Winner
              </div>
            )}
            {article.certified && (
              <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg text-xs font-bold shadow-lg">
                <Award className="w-3 h-3" />
                Certified
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Sidebar Size
  if (size === 'sidebar') {
    return (
      <div 
        className="group bg-white rounded-xl shadow-md hover:shadow-xl border border-gray-200 p-4 cursor-pointer transition-all duration-300 hover:-translate-y-1 min-h-[240px] flex flex-col"
        onClick={handleClick}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tierConfig.gradient} flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform`}>
            <span className="text-xl">{tierConfig.emoji}</span>
          </div>
          <div className="min-w-0 flex-1">
            {/* Make username clickable */}
            <button
              onClick={handleUserClick}
              className="text-sm font-bold text-gray-900 truncate hover:text-orange-600 transition-colors flex items-center gap-1"
            >
              <User className="w-3 h-3" />
              {article.display_name}
            </button>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">{article.tier}</div>
          </div>
        </div>
        
        {/* Topics in Sidebar View */}
        {renderTopics(2, "mb-2")}
        
        <h3 className="text-base font-bold text-gray-900 group-hover:text-orange-600 transition-colors mb-2 leading-tight line-clamp-2">
          {article.title}
        </h3>
        
        <p className="text-sm text-gray-600 mb-3 leading-relaxed flex-grow line-clamp-3">
          {truncateContent(article.content, 120)}
        </p>
        
        <div className="flex flex-wrap items-center gap-2 text-xs mt-auto pt-3 border-t border-gray-100">
          <span className="inline-flex items-center gap-1 text-gray-500 font-semibold mr-auto">
            <Clock className="w-3 h-3" />
            {formatDate(article.created_at)}
          </span>
          <span className="inline-flex items-center gap-1 font-bold text-gray-700">
            <Eye className="w-3 h-3" />
            {formatViews(article.views || 0)}
          </span>
          {counterCount !== null && (
            <span className="inline-flex items-center gap-1 font-bold text-gray-700">
              <MessageSquare className="w-3 h-3" />
              {counterCount}
            </span>
          )}
        </div>
        
        {(isDebateOpinion || isWinner || article.certified) && (
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {isDebateOpinion && (
              <span className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                Debate
              </span>
            )}
            {isWinner && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                <Trophy className="w-2.5 h-2.5" />
                Win
              </span>
            )}
            {article.certified && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                <Award className="w-2.5 h-2.5" />
                Cert
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  // Normal Size (Default) - Grid View
  return (
    <div 
      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-gray-200 overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 flex flex-col min-h-[400px]"
      onClick={handleClick}
    >
      {/* Gradient Header with Tier */}
      <div className={`relative bg-gradient-to-r ${tierConfig.gradient} px-6 py-5 overflow-hidden`}>
        <div className="absolute inset-0 bg-white/10"></div>
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
              <span className="text-2xl drop-shadow-lg">{tierConfig.emoji}</span>
            </div>
            <div className="min-w-0 flex-1">
              {/* Make username clickable */}
              <button
                onClick={handleUserClick}
                className="text-base font-black text-white truncate drop-shadow hover:text-orange-200 transition-colors flex items-center gap-1"
              >
                <User className="w-4 h-4" />
                {article.display_name}
              </button>
              <div className="text-xs font-bold text-white/80 uppercase tracking-wider">{article.tier} Tier</div>
            </div>
          </div>
          <div className="inline-flex items-center gap-1 text-xs font-bold text-white/70 whitespace-nowrap bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
            <Clock className="w-3 h-3" />
            {formatDate(article.created_at)}
          </div>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Topics in Normal View */}
        {renderTopics(3, "mb-3")}
        
        <h3 className="text-xl font-black text-gray-900 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-red-500 group-hover:bg-clip-text transition-all duration-300 mb-3 leading-tight line-clamp-2">
          {article.title}
        </h3>
        
        <p className="text-sm text-gray-600 mb-4 leading-relaxed flex-grow line-clamp-4">
          {truncateContent(article.content, 150)}
        </p>
        
        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-gray-100 space-y-3">
          <div className="flex items-center gap-4 text-sm">
            <span className="inline-flex items-center gap-2 font-bold text-gray-700 hover:text-gray-900 transition-colors">
              <Eye className="w-4 h-4" />
              {formatViews(article.views || 0)}
            </span>
            {counterCount !== null && (
              <span className="inline-flex items-center gap-2 font-bold text-gray-700 hover:text-gray-900 transition-colors">
                <MessageSquare className="w-4 h-4" />
                {counterCount}
              </span>
            )}
          </div>
          
          {/* Badges */}
          {(isDebateOpinion || isWinner || article.certified) && (
            <div className="flex flex-wrap items-center gap-2">
              {isDebateOpinion && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-xs font-bold shadow-md transform hover:scale-105 transition-transform">
                  <Flame className="w-3 h-3" />
                  Debate
                </span>
              )}
              {isWinner && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-full text-xs font-bold shadow-md transform hover:scale-105 transition-transform">
                  <Trophy className="w-3 h-3" />
                  Winner
                </span>
              )}
              {article.certified && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full text-xs font-bold shadow-md transform hover:scale-105 transition-transform">
                  <Award className="w-3 h-3" />
                  Certified
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ArticleCard;