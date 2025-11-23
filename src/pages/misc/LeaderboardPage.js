// src/pages/LeaderboardPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Trophy, TrendingUp, Award, Star, Flame, Crown, Medal, Zap, Users, ChevronRight, BookOpen } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://urown-backend.onrender.com/api'  
  : 'http://localhost:5000/api';

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserRank, setCurrentUserRank] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch leaderboard
        const leaderboardRes = await axios.get(`${API_URL}/leaderboard`);
        setLeaderboard(leaderboardRes.data.leaderboard);
        
        // Fetch announcements
        const announcementsRes = await axios.get(`${API_URL}/leaderboard/announcements`);
        setAnnouncements(announcementsRes.data.announcements);
        
        // Fetch current user rank if logged in
        const token = localStorage.getItem('token');
        if (token) {
          const rankRes = await axios.get(`${API_URL}/user/rank`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setCurrentUserRank(rankRes.data);
        }
        
        setError(null);
      } catch (err) {
        console.error('Fetch leaderboard error:', err);
        setError('Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getRankIcon = (rank) => {
    switch(rank) {
      case 1:
        return <Crown className="h-8 w-8 text-yellow-500" />;
      case 2:
        return <Medal className="h-7 w-7 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-700" />;
      default:
        return null;
    }
  };

  const getRankBadge = (rank) => {
    switch(rank) {
      case 1:
        return 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-br from-gray-300 to-gray-500 text-white';
      case 3:
        return 'bg-gradient-to-br from-amber-600 to-amber-800 text-white';
      default:
        return 'bg-gradient-to-br from-orange-500 to-orange-600 text-white';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-3 border-b-3 border-orange-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Trophy className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          <div className="mt-6 text-lg font-semibold text-gray-700">Loading leaderboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 pt-16">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
        }}></div>
        
        <div className="container mx-auto px-4 py-16 relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6 border-4 border-white/30">
            <Trophy className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4">
            UROWN Leaderboard
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
            Compete with the best. Earn points by publishing, engaging, and creating impact.
          </p>
          
          {/* Current User Rank Card */}
          {currentUserRank && (
            <div className="max-w-md mx-auto bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30">
              <div className="text-white/90 text-sm font-semibold mb-2">Your Stats</div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-white">{currentUserRank.score}</div>
                  <div className="text-white/80 text-sm">UROWN Score</div>
                </div>
                <div className="w-px h-12 bg-white/30"></div>
                <div>
                  <div className="text-3xl font-bold text-white">#{currentUserRank.rank}</div>
                  <div className="text-white/80 text-sm">Global Rank</div>
                </div>
                <div className="w-px h-12 bg-white/30"></div>
                <div>
                  <div className="text-xl font-bold text-white">{currentUserRank.total_users}</div>
                  <div className="text-white/80 text-sm">Total Users</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Leaderboard */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-red-600 px-6 py-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <TrendingUp className="h-6 w-6" />
                  Top 15 Competitors
                </h2>
              </div>
              
              <div className="divide-y divide-gray-100">
                {leaderboard.map((user, index) => (
                  <Link
                    key={user.id}
                    to={`/user/${user.display_name}`}
                    className="flex items-center gap-4 p-6 hover:bg-gray-50 transition-colors group"
                  >
                    {/* Rank */}
                    <div className="flex-shrink-0 w-16 text-center">
                      {index < 3 ? (
                        <div className="flex items-center justify-center">
                          {getRankIcon(index + 1)}
                        </div>
                      ) : (
                        <div className="text-2xl font-bold text-gray-400">
                          #{index + 1}
                        </div>
                      )}
                    </div>
                    
                    {/* Avatar */}
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 ${getRankBadge(index + 1)}`}>
                      <span className="text-2xl font-bold">
                        {user.display_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    
                    {/* User Info */}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-orange-600 transition-colors">
                          {user.display_name}
                        </h3>
                        {index < 3 && (
                          <Flame className="h-5 w-5 text-orange-500 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4" />
                          {user.tier}
                        </span>
                        <span>•</span>
                        <span>Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}</span>
                      </div>
                    </div>
                    
                    {/* Score */}
                    <div className="flex-shrink-0 text-right">
                      <div className="flex items-center gap-2 justify-end mb-1">
                        <Zap className="h-5 w-5 text-orange-500" />
                        <span className="text-2xl font-bold text-gray-900">
                          {user.urown_score.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">UROWN Score</div>
                    </div>
                    
                    <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Entries */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  New Competitors
                </h3>
              </div>
              
              <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                {announcements.length > 0 ? (
                  announcements.map((announcement, idx) => (
                    <div key={idx} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <Trophy className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="font-bold text-purple-900 truncate">
                            {announcement.display_name}
                          </div>
                          <div className="text-xs text-gray-600">
                            entered at #{announcement.rank_position}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}
                        </span>
                        <span className="font-semibold text-purple-700">
                          {announcement.urown_score} pts
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No recent entries</p>
                  </div>
                )}
              </div>
            </div>

            {/* How to Earn Points */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Earn Points
                </h3>
              </div>
              
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Publish Article</span>
                  <span className="font-bold text-green-600">+10</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Counter Argument</span>
                  <span className="font-bold text-green-600">+12</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Debate Opinion</span>
                  <span className="font-bold text-green-600">+10</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">RedFlagged Post</span>
                  <span className="font-bold text-green-600">+8</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Article Certified</span>
                  <span className="font-bold text-green-600">+20</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">100 Views Milestone</span>
                  <span className="font-bold text-green-600">+5</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Comment</span>
                  <span className="font-bold text-green-600">+2</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Reaction</span>
                  <span className="font-bold text-green-600">+1</span>
                </div>
<div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
  <span className="text-sm text-gray-700 font-semibold flex items-center gap-1">
    <BookOpen className="h-4 w-4 text-blue-600" />
    Posted First Book
  </span>
  <span className="font-bold text-blue-600">+20</span>
</div>
<div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
  <span className="text-sm text-gray-700 font-semibold flex items-center gap-1">
    <BookOpen className="h-4 w-4 text-blue-600" />
    Posted an EBook
  </span>
  <span className="font-bold text-blue-600">+50</span>
</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;