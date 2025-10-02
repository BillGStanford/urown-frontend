// src/components/ArticleCard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy } from 'lucide-react';

function ArticleCard({ article, size = 'normal', counterCount = null }) {
  const navigate = useNavigate();
  
  const getTierEmoji = (tier) => {
    switch (tier?.toLowerCase()) {
      case 'silver':
        return '🥈';
      case 'gold':
        return '🥇';
      case 'platinum':
        return '💎';
      default:
        return '🥈';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const truncateContent = (content, maxLength) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  const truncateTitle = (title, maxLength) => {
    if (!title) return '';
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength).trim() + '...';
  };

  const truncateName = (name, maxLength) => {
    if (!name) return '';
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength).trim() + '...';
  };

  const handleClick = () => {
    navigate(`/article/${article.id}`);
  };

  const isDebateOpinion = article.debate_topic_id !== null;
  const isWinner = article.is_debate_winner;

  if (size === 'hero') {
    return (
      <div 
        className="bg-black text-white p-4 md:p-6 lg:p-8 xl:p-12 cursor-pointer hover:bg-gray-900 transition-colors duration-200 flex flex-col justify-between h-full min-h-[280px] md:min-h-[320px] lg:min-h-[360px]"
        onClick={handleClick}
      >
        <div className="flex items-start md:items-center mb-3 md:mb-4 lg:mb-6">
          <span className="text-xl md:text-2xl lg:text-3xl mr-2 md:mr-3 flex-shrink-0">{getTierEmoji(article.tier)}</span>
          <div className="min-w-0 flex-1">
            <div className="text-base md:text-lg lg:text-xl xl:text-2xl font-bold truncate">
              {truncateName(article.display_name, 25)}
            </div>
            <div className="text-xs md:text-sm lg:text-base xl:text-lg font-bold text-gray-300">
              {article.tier?.toUpperCase()} TIER
            </div>
          </div>
        </div>
        
        <h2 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-3 md:mb-4 lg:mb-6 leading-tight line-clamp-2 md:line-clamp-3">
          {article.title}
        </h2>
        
        <p className="text-sm md:text-base lg:text-lg xl:text-xl font-bold mb-3 md:mb-4 lg:mb-6 text-gray-200 leading-relaxed line-clamp-2 md:line-clamp-3">
          {truncateContent(article.content.replace(/<[^>]*>/g, ''), 150)}
        </p>
        
        <div className="flex flex-wrap items-center gap-2 md:gap-3 lg:gap-4 text-xs md:text-sm lg:text-base">
          <div className="font-bold text-gray-400 mr-auto">
            {formatDate(article.created_at)}
          </div>
          <div className="flex items-center">
            <span className="mr-1">👁️</span>
            <span>{article.views || 0}</span>
          </div>
          {counterCount !== null && (
            <div className="flex items-center">
              <span className="mr-1">💬</span>
              <span>{counterCount}</span>
            </div>
          )}
          {isDebateOpinion && (
            <div className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap">
              DEBATE
            </div>
          )}
          {isWinner && (
            <div className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center whitespace-nowrap">
              <Trophy className="mr-1" size={10} />
              WINNER
            </div>
          )}
          {article.certified && (
            <div className="bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap">
              CERTIFIED
            </div>
          )}
        </div>
      </div>
    );
  }

  if (size === 'sidebar') {
    return (
      <div 
        className="bg-white border-2 border-black p-3 md:p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200 flex flex-col h-full min-h-[200px]"
        onClick={handleClick}
      >
        <div className="flex items-start mb-3">
          <span className="text-lg md:text-xl mr-2 flex-shrink-0">{getTierEmoji(article.tier)}</span>
          <div className="min-w-0 flex-1">
            <div className="text-sm md:text-base font-bold truncate">
              {truncateName(article.display_name, 20)}
            </div>
            <div className="text-xs font-bold text-gray-600">
              {article.tier?.toUpperCase()}
            </div>
          </div>
        </div>
        
        <h3 className="text-base md:text-lg font-bold mb-2 leading-tight line-clamp-2">
          {article.title}
        </h3>
        
        <p className="text-xs md:text-sm font-bold text-gray-700 mb-3 leading-relaxed flex-grow line-clamp-3">
          {truncateContent(article.content.replace(/<[^>]*>/g, ''), 100)}
        </p>
        
        <div className="flex flex-wrap items-center gap-2 text-xs mt-auto">
          <div className="font-bold text-gray-500 mr-auto">
            {formatDate(article.created_at)}
          </div>
          <div className="flex items-center">
            <span className="mr-1">👁️</span>
            <span>{article.views || 0}</span>
          </div>
          {counterCount !== null && (
            <div className="flex items-center">
              <span className="mr-1">💬</span>
              <span>{counterCount}</span>
            </div>
          )}
          {isDebateOpinion && (
            <div className="bg-blue-600 text-white px-1.5 py-0.5 rounded-full text-xs font-bold">
              DEBATE
            </div>
          )}
          {isWinner && (
            <div className="bg-yellow-500 text-white px-1.5 py-0.5 rounded-full text-xs font-bold flex items-center">
              <Trophy className="mr-1" size={8} />
              WIN
            </div>
          )}
          {article.certified && (
            <div className="bg-purple-600 text-white px-1.5 py-0.5 rounded-full text-xs font-bold">
              CERT
            </div>
          )}
        </div>
      </div>
    );
  }

  // Normal size (default) - Optimized for responsiveness
  return (
    <div 
      className="bg-white border-2 border-black p-4 md:p-5 lg:p-6 cursor-pointer hover:bg-gray-50 transition-all duration-200 hover:shadow-lg flex flex-col h-full min-h-[320px] md:min-h-[340px] lg:min-h-[360px]"
      onClick={handleClick}
    >
      {/* Header Section */}
      <div className="flex items-start justify-between mb-3 md:mb-4 gap-2">
        <div className="flex items-start min-w-0 flex-1">
          <span className="text-xl md:text-2xl mr-2 md:mr-3 flex-shrink-0">{getTierEmoji(article.tier)}</span>
          <div className="min-w-0 flex-1">
            <div className="text-sm md:text-base lg:text-lg font-bold truncate">
              {truncateName(article.display_name, 20)}
            </div>
            <div className="text-xs md:text-sm font-bold text-gray-600">
              {article.tier?.toUpperCase()} TIER
            </div>
          </div>
        </div>
        <div className="text-xs md:text-sm font-bold text-gray-500 whitespace-nowrap flex-shrink-0">
          {formatDate(article.created_at)}
        </div>
      </div>
      
      {/* Title */}
      <h3 className="text-base md:text-lg lg:text-xl xl:text-2xl font-bold mb-2 md:mb-3 leading-tight line-clamp-2 md:line-clamp-3">
        {article.title}
      </h3>
      
      {/* Content Preview */}
      <p className="text-sm md:text-base lg:text-lg font-bold text-gray-700 mb-3 md:mb-4 leading-relaxed flex-grow line-clamp-3 md:line-clamp-4">
        {truncateContent(article.content.replace(/<[^>]*>/g, ''), 150)}
      </p>
      
      {/* Footer Section */}
      <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-auto pt-3 border-t border-gray-200">
        {/* Stats */}
        <div className="flex items-center gap-3 md:gap-4 mr-auto">
          <div className="flex items-center text-xs md:text-sm">
            <span className="mr-1 text-base md:text-lg">👁️</span>
            <span className="font-bold">{article.views || 0}</span>
          </div>
          {counterCount !== null && (
            <div className="flex items-center text-xs md:text-sm">
              <span className="mr-1 text-base md:text-lg">💬</span>
              <span className="font-bold">{counterCount}</span>
            </div>
          )}
        </div>
        
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-1 md:gap-2">
          {isDebateOpinion && (
            <div className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap">
              DEBATE
            </div>
          )}
          {isWinner && (
            <div className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center whitespace-nowrap">
              <Trophy className="mr-1" size={10} />
              WINNER
            </div>
          )}
          {article.certified && (
            <div className="bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap">
              CERTIFIED
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ArticleCard;