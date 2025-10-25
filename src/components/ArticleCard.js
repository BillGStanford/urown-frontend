// components/ArticleCard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Eye, MessageSquare, Award, Flame, Clock, Tag, User } from 'lucide-react';

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
      <div className={`flex flex-wrap gap-1.5 ${className}`}>
        {topics.slice(0, maxCount).map((topic, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 border border-orange-200 rounded text-xs font-medium"
          >
            <Tag size={10} />
            {typeof topic === 'string' ? topic : topic.name || topic}
          </span>
        ))}
        {topics.length > maxCount && (
          <span className="inline-flex items-center px-2 py-1 bg-gray-50 text-gray-600 border border-gray-200 rounded text-xs font-medium">
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
        className="group bg-white rounded-lg shadow-sm hover:shadow-md border border-gray-200 overflow-hidden cursor-pointer transition-all duration-200"
        onClick={handleClick}
      >
        <div className="flex flex-col sm:flex-row">
          {/* Tier Badge Section */}
          <div className={`sm:w-24 flex items-center justify-center p-5 bg-gradient-to-br ${tierConfig.gradient} relative overflow-hidden`}>
            <div className="absolute inset-0 bg-white/10"></div>
            <div className="text-center relative z-10">
              <div className="text-3xl mb-1.5 drop-shadow-lg">{tierConfig.emoji}</div>
              <div className="text-xs font-bold text-white uppercase tracking-wide drop-shadow">{article.tier}</div>
            </div>
          </div>
          
          {/* Content Section */}
          <div className="flex-1 p-5">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={handleUserClick}
                    className="text-sm font-semibold text-gray-900 hover:text-orange-600 transition-colors flex items-center gap-1"
                  >
                    <User className="w-3.5 h-3.5" />
                    {article.display_name}
                  </button>
                  <span className="text-gray-300">•</span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDate(article.created_at)}
                  </span>
                </div>
                
                {renderTopics(3, "mb-2.5")}
                
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2 mb-2">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                  {truncateContent(article.content, 150)}
                </p>
              </div>
            </div>
            
            {/* Footer */}
            <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-4 text-sm text-gray-600 mr-auto">
                <span className="inline-flex items-center gap-1.5 font-semibold hover:text-gray-900 transition-colors">
                  <Eye className="w-4 h-4" />
                  {formatViews(article.views || 0)}
                </span>
                {counterCount !== null && (
                  <span className="inline-flex items-center gap-1.5 font-semibold hover:text-gray-900 transition-colors">
                    <MessageSquare className="w-4 h-4" />
                    {counterCount}
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                {isDebateOpinion && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 text-white rounded text-xs font-semibold">
                    <Flame className="w-3 h-3" />
                    Debate
                  </span>
                )}
                {isWinner && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-500 text-white rounded text-xs font-semibold">
                    <Trophy className="w-3 h-3" />
                    Winner
                  </span>
                )}
                {article.certified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-600 text-white rounded text-xs font-semibold">
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
        className="group relative bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-xl"
        onClick={handleClick}
      >
        {/* Animated background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="relative p-8 lg:p-10 min-h-[380px] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-4 mb-5">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tierConfig.gradient} flex items-center justify-center shadow-lg`}>
                <span className="text-2xl">{tierConfig.emoji}</span>
              </div>
              <div>
                <button
                  onClick={handleUserClick}
                  className="text-lg font-bold text-white hover:text-orange-300 transition-colors flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  {article.display_name}
                </button>
                <div className="text-sm text-gray-400 uppercase font-semibold tracking-wide">{article.tier} Tier</div>
              </div>
            </div>
            
            {renderTopics(5, "mb-4")}
            
            <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold mb-4 leading-tight group-hover:text-orange-400 transition-colors line-clamp-3">
              {article.title}
            </h2>
            
            <p className="text-base text-gray-300 leading-relaxed line-clamp-3 mb-5">
              {truncateContent(article.content, 200)}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2.5 text-sm">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3.5 py-2 rounded-lg font-semibold border border-white/20">
              <Clock className="w-4 h-4" />
              {formatDate(article.created_at)}
            </div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3.5 py-2 rounded-lg font-semibold border border-white/20">
              <Eye className="w-4 h-4" />
              {formatViews(article.views || 0)}
            </div>
            {counterCount !== null && (
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3.5 py-2 rounded-lg font-semibold border border-white/20">
                <MessageSquare className="w-4 h-4" />
                {counterCount}
              </div>
            )}
            {isDebateOpinion && (
              <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 rounded-lg text-xs font-semibold">
                <Flame className="w-3 h-3" />
                Debate
              </div>
            )}
            {isWinner && (
              <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-yellow-500 rounded-lg text-xs font-semibold">
                <Trophy className="w-3 h-3" />
                Winner
              </div>
            )}
            {article.certified && (
              <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-600 rounded-lg text-xs font-semibold">
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
        className="group bg-white rounded-lg shadow-sm hover:shadow-md border border-gray-200 p-4 cursor-pointer transition-all duration-200 min-h-[220px] flex flex-col"
        onClick={handleClick}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-11 h-11 rounded-lg bg-gradient-to-br ${tierConfig.gradient} flex items-center justify-center shadow-sm`}>
            <span className="text-lg">{tierConfig.emoji}</span>
          </div>
          <div className="min-w-0 flex-1">
            <button
              onClick={handleUserClick}
              className="text-sm font-semibold text-gray-900 truncate hover:text-orange-600 transition-colors flex items-center gap-1"
            >
              <User className="w-3.5 h-3.5" />
              {article.display_name}
            </button>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{article.tier}</div>
          </div>
        </div>
        
        {renderTopics(2, "mb-2.5")}
        
        <h3 className="text-sm font-bold text-gray-900 group-hover:text-orange-600 transition-colors mb-2 leading-snug line-clamp-2">
          {article.title}
        </h3>
        
        <p className="text-xs text-gray-600 mb-3 leading-relaxed flex-grow line-clamp-3">
          {truncateContent(article.content, 120)}
        </p>
        
        <div className="flex flex-wrap items-center gap-2 text-xs mt-auto pt-3 border-t border-gray-100">
          <span className="inline-flex items-center gap-1 text-gray-500 font-medium mr-auto">
            <Clock className="w-3 h-3" />
            {formatDate(article.created_at)}
          </span>
          <span className="inline-flex items-center gap-1 font-semibold text-gray-700">
            <Eye className="w-3 h-3" />
            {formatViews(article.views || 0)}
          </span>
          {counterCount !== null && (
            <span className="inline-flex items-center gap-1 font-semibold text-gray-700">
              <MessageSquare className="w-3 h-3" />
              {counterCount}
            </span>
          )}
        </div>
        
        {(isDebateOpinion || isWinner || article.certified) && (
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
            {isDebateOpinion && (
              <span className="inline-flex items-center px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs font-semibold">
                Debate
              </span>
            )}
            {isWinner && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded text-xs font-semibold">
                <Trophy className="w-2.5 h-2.5" />
                Win
              </span>
            )}
            {article.certified && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-orange-50 text-orange-700 border border-orange-200 rounded text-xs font-semibold">
                <Award className="w-2.5 h-2.5" />
                Cert
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  // Normal Size (Default) - Grid View - Used in Editorial Picks
  return (
    <div 
      className="group bg-white rounded-lg shadow-sm hover:shadow-md border border-gray-100 overflow-hidden cursor-pointer transition-all duration-200 flex flex-col h-[420px]"
      onClick={handleClick}
    >
      {/* Compact Header with Tier */}
      <div className={`relative bg-gradient-to-r ${tierConfig.gradient} px-4 py-3 overflow-hidden`}>
        <div className="absolute inset-0 bg-white/10"></div>
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-sm">
              <span className="text-xl drop-shadow">{tierConfig.emoji}</span>
            </div>
            <div className="min-w-0 flex-1">
              <button
                onClick={handleUserClick}
                className="text-sm font-bold text-white truncate drop-shadow hover:text-orange-100 transition-colors flex items-center gap-1 max-w-full"
              >
                <User className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{article.display_name}</span>
              </button>
              <div className="text-xs font-semibold text-white/80 uppercase tracking-wide">{article.tier}</div>
            </div>
          </div>
          <div className="inline-flex items-center gap-1 text-xs font-semibold text-white/70 whitespace-nowrap bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded">
            <Clock className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{formatDate(article.created_at)}</span>
          </div>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col">
        {renderTopics(2, "mb-2.5")}
        
        <h3 className="text-base font-bold text-gray-900 group-hover:text-orange-600 transition-colors mb-2 leading-snug line-clamp-2">
          {article.title}
        </h3>
        
        <p className="text-sm text-gray-600 mb-3 leading-relaxed flex-grow line-clamp-3">
          {truncateContent(article.content, 120)}
        </p>
        
        {/* Footer */}
        <div className="mt-auto pt-3 border-t border-gray-100 space-y-2.5">
          <div className="flex items-center gap-3 text-sm">
            <span className="inline-flex items-center gap-1.5 font-semibold text-gray-700 hover:text-gray-900 transition-colors">
              <Eye className="w-4 h-4" />
              {formatViews(article.views || 0)}
            </span>
            {counterCount !== null && (
              <span className="inline-flex items-center gap-1.5 font-semibold text-gray-700 hover:text-gray-900 transition-colors">
                <MessageSquare className="w-4 h-4" />
                {counterCount}
              </span>
            )}
          </div>
          
          {/* Badges */}
          {(isDebateOpinion || isWinner || article.certified) && (
            <div className="flex flex-wrap items-center gap-1.5">
              {isDebateOpinion && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 text-white rounded text-xs font-semibold">
                  <Flame className="w-3 h-3" />
                  Debate
                </span>
              )}
              {isWinner && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-500 text-white rounded text-xs font-semibold">
                  <Trophy className="w-3 h-3" />
                  Winner
                </span>
              )}
              {article.certified && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-600 text-white rounded text-xs font-semibold">
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