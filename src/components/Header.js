import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import axios from 'axios';
import { 
  Search, 
  LayoutDashboard, 
  PenTool, 
  FileText, 
  Settings, 
  LogOut, 
  Menu, 
  User,
  ChevronDown,
  Shield,
  Mail,
  Globe,
  Info,
  Flame,
  Bell,
  BookOpen,
  Sparkles,
  FlagIcon,
  Trophy
} from 'lucide-react';

function Header({ user, onLogout }) {
  const { logout } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const sidebarRef = useRef(null);

  const isAdmin = user && (user.role === 'admin' || user.role === 'super-admin');
  const isEditorialOrAdmin = user && (user.role === 'editorial-board' || user.role === 'admin' || user.role === 'super-admin');

  const handleLogout = () => {
    logout();
    onLogout();
    setIsUserDropdownOpen(false);
    setIsSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get('/notifications/unread-count');
      setUnreadCount(response.data.count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && 
          !event.target.closest('[data-sidebar-toggle]')) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <>
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside 
        ref={sidebarRef}
        className={`fixed left-0 h-screen bg-white border-r border-gray-200 transition-transform duration-300 z-50 w-72 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ top: scrolled ? '64px' : '80px' }}
      >
        <div className="flex flex-col h-full overflow-y-auto pb-4">
          {/* Navigation */}
          <nav className="flex-1 py-4 px-3">
            <div className="space-y-1">
              <Link 
                to="/browse" 
                className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-all duration-200"
                onClick={closeSidebar}
              >
                <Search className="h-6 w-6 shrink-0" strokeWidth={2.5} />
                <span className="font-bold">Browse</span>
              </Link>

              <Link 
                to="/ideology-quiz" 
                className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-xl transition-all duration-200"
                onClick={closeSidebar}
              >
                <Sparkles className="h-6 w-6 shrink-0" strokeWidth={2.5} />
                <div className="flex items-center gap-2">
                  <span className="font-bold">Ideology Quiz</span>
                  <span className="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full">NEW</span>
                </div>
              </Link>

              <Link 
                to="/leaderboard" 
                className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-yellow-50 hover:text-yellow-600 rounded-xl transition-all duration-200"
                onClick={closeSidebar}
              >
                <Trophy className="h-6 w-6 shrink-0" strokeWidth={2.5} />
                <span className="font-bold">Leaderboard</span>
              </Link>

              <Link 
                to="/about" 
                className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all duration-200"
                onClick={closeSidebar}
              >
                <Info className="h-6 w-6 shrink-0" strokeWidth={2.5} />
                <span className="font-bold">About</span>
              </Link>

              <Link 
                to="/partners" 
                className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-xl transition-all duration-200"
                onClick={closeSidebar}
              >
                <Globe className="h-6 w-6 shrink-0" strokeWidth={2.5} />
                <span className="font-bold">Partners</span>
              </Link>

              <Link 
                to="/contact" 
                className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-xl transition-all duration-200"
                onClick={closeSidebar}
              >
                <Mail className="h-6 w-6 shrink-0" strokeWidth={2.5} />
                <span className="font-bold">Contact</span>
              </Link>

              <Link 
                to="/redflagged" 
                className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200"
                onClick={closeSidebar}
              >
                <FlagIcon className="h-6 w-6 shrink-0" strokeWidth={2.5} />
                <span className="font-bold">RedFlagged</span>
              </Link>

              {user && (
                <>
                  <div className="my-3 h-px bg-gray-200" />
                  
                  <Link 
                    to="/library" 
                    className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-xl transition-all duration-200"
                    onClick={closeSidebar}
                  >
                    <BookOpen className="h-6 w-6 shrink-0" strokeWidth={2.5} />
                    <span className="font-bold">Library</span>
                  </Link>
                </>
              )}

              {isEditorialOrAdmin && (
                <>
                  <div className="my-3 h-px bg-gray-200" />
                  <Link
                    to="/editorial"
                    className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all duration-200"
                    onClick={closeSidebar}
                  >
                    <FileText className="h-6 w-6 shrink-0" strokeWidth={2.5} />
                    <span className="font-bold">Editorial Board</span>
                  </Link>
                </>
              )}

              {isAdmin && (
                <>
                  <Link
                    to="/admin"
                    className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200"
                    onClick={closeSidebar}
                  >
                    <Shield className="h-6 w-6 shrink-0" strokeWidth={2.5} />
                    <span className="font-bold">Admin Panel</span>
                  </Link>
                  <Link
                    to="/admin/reported-articles"
                    className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200"
                    onClick={closeSidebar}
                  >
                    <FileText className="h-6 w-6 shrink-0" strokeWidth={2.5} />
                    <span className="font-bold">View Reports</span>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </aside>

      {/* Top Header */}
      <header className={`sticky top-0 z-40 transition-all duration-200 ${
        scrolled 
          ? 'bg-white shadow-md border-b border-gray-200' 
          : 'bg-white border-b border-gray-100'
      }`}>
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Left - Menu Button + Logo */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              <button
                onClick={toggleSidebar}
                data-sidebar-toggle
                className="p-2 lg:p-2.5 rounded-xl text-gray-700 hover:bg-orange-50 hover:text-orange-600 focus:outline-none transition-all duration-200"
                aria-label="Toggle menu"
                aria-expanded={isSidebarOpen}
              >
                <Menu className="h-6 w-6 lg:h-7 lg:w-7" strokeWidth={2.5} />
              </button>

              <Link to="/" className="flex items-center gap-2 lg:gap-3">
                <div className="w-9 h-9 lg:w-12 lg:h-12 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg">
                  <Flame className="h-5 w-5 lg:h-7 lg:w-7 text-white" />
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-xl sm:text-2xl lg:text-3xl font-black bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent tracking-tight">
                    UROWN
                  </span>
                  <span className="text-[8px] sm:text-[9px] lg:text-xs text-gray-600 font-bold tracking-wider uppercase -mt-0.5 lg:-mt-1">
                    Your Voice Matters
                  </span>
                </div>
              </Link>
            </div>

            {/* Right - Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3">
              {user ? (
                <>
                  {/* Notifications */}
                  <Link 
                    to="/notifications" 
                    className="relative p-2 lg:p-2.5 hover:bg-amber-50 rounded-xl transition-all duration-200"
                    title="Notifications"
                  >
                    <Bell className="h-5 w-5 lg:h-6 lg:w-6 text-gray-700" strokeWidth={2.5} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>

                  {/* Write Button - Desktop */}
                  <Link 
                    to="/write" 
                    className="hidden sm:flex items-center gap-2 px-3 sm:px-4 lg:px-6 py-2 lg:py-3 text-sm lg:text-base font-black text-white bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 rounded-xl lg:rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    <PenTool className="h-4 w-4 lg:h-5 lg:w-5" strokeWidth={3} />
                    <span className="hidden md:inline">Write</span>
                  </Link>

                  {/* Write Button - Mobile (Icon Only) */}
                  <Link 
                    to="/write" 
                    className="sm:hidden p-2 text-white bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 rounded-xl shadow-lg transition-all duration-200"
                    title="Write"
                  >
                    <PenTool className="h-5 w-5" strokeWidth={3} />
                  </Link>

                  {/* User Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={toggleUserDropdown}
                      className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 px-1.5 sm:px-2 lg:px-4 py-1.5 sm:py-2 hover:bg-gray-50 rounded-xl lg:rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      aria-expanded={isUserDropdownOpen}
                      aria-haspopup="true"
                      aria-label="User menu"
                    >
                      <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-full bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 flex items-center justify-center text-white text-sm lg:text-base font-black shadow-md">
                        {user.display_name.charAt(0).toUpperCase()}
                      </div>
                      <span className="hidden lg:block max-w-[100px] xl:max-w-[120px] truncate font-bold text-gray-800 text-sm lg:text-base">
                        {user.display_name}
                      </span>
                      <ChevronDown className={`hidden lg:block h-4 w-4 lg:h-5 lg:w-5 text-gray-600 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`} strokeWidth={2.5} />
                    </button>

                    {isUserDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 lg:w-64 bg-white rounded-xl lg:rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="py-2">
                          <Link
                            to={`/user/${encodeURIComponent(user.display_name)}`}
                            className="flex items-center gap-3 px-4 lg:px-5 py-3 text-sm font-bold text-gray-800 hover:bg-orange-50 transition-all duration-150"
                            onClick={() => setIsUserDropdownOpen(false)}
                          >
                            <div className="w-9 h-9 lg:w-10 lg:h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                              <User className="h-5 w-5 text-orange-600" strokeWidth={2.5} />
                            </div>
                            <span>Profile</span>
                          </Link>

                          <Link
                            to="/dashboard"
                            className="flex items-center gap-3 px-4 lg:px-5 py-3 text-sm font-bold text-gray-800 hover:bg-indigo-50 transition-all duration-150"
                            onClick={() => setIsUserDropdownOpen(false)}
                          >
                            <div className="w-9 h-9 lg:w-10 lg:h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                              <LayoutDashboard className="h-5 w-5 text-indigo-600" strokeWidth={2.5} />
                            </div>
                            <span>Dashboard</span>
                          </Link>

                          <Link
                            to="/settings"
                            className="flex items-center gap-3 px-4 lg:px-5 py-3 text-sm font-bold text-gray-800 hover:bg-gray-100 transition-all duration-150"
                            onClick={() => setIsUserDropdownOpen(false)}
                          >
                            <div className="w-9 h-9 lg:w-10 lg:h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                              <Settings className="h-5 w-5 text-gray-600" strokeWidth={2.5} />
                            </div>
                            <span>Settings</span>
                          </Link>

                          <div className="my-2 h-px bg-gray-200" />

                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 lg:px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-all duration-150"
                          >
                            <div className="w-9 h-9 lg:w-10 lg:h-10 bg-red-100 rounded-xl flex items-center justify-center">
                              <LogOut className="h-5 w-5 text-red-600" strokeWidth={2.5} />
                            </div>
                            <span>Log out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="px-3 sm:px-4 lg:px-6 py-2 lg:py-3 text-xs sm:text-sm lg:text-base font-black text-gray-800 hover:bg-gray-100 rounded-xl lg:rounded-2xl transition-all duration-200"
                  >
                    Log in
                  </Link>
                  <Link 
                    to="/signup" 
                    className="px-3 sm:px-4 lg:px-6 py-2 lg:py-3 text-xs sm:text-sm lg:text-base font-black text-white bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 rounded-xl lg:rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

export default Header;