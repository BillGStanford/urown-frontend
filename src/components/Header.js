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
  X, 
  User,
  ChevronDown,
  Shield,
  Mail,
  Globe,
  Info,
  Flame,
  Bell,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';

function Header({ user, onLogout }) {
  const { logout } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const dropdownRef = useRef(null);

  const isAdmin = user && (user.role === 'admin' || user.role === 'super-admin');
  const isEditorialOrAdmin = user && (user.role === 'editorial-board' || user.role === 'admin' || user.role === 'super-admin');

  const handleLogout = () => {
    logout();
    onLogout();
    setIsUserDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
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
      {/* Sidebar - Desktop Only */}
      <aside className={`hidden lg:block fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-30 ${
  isSidebarCollapsed ? 'w-20' : 'w-64'
}`}>
        <div className="flex flex-col h-full">
          {/* Logo - Fixed width container */}
          <div className="h-[88px] border-b border-gray-200 flex items-center justify-center px-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                <Flame className="h-7 w-7 text-white" />
              </div>
              <div className={`flex flex-col transition-all duration-300 overflow-hidden ${
                isSidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
              }`}>
                <span className="text-3xl font-black bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent tracking-tight whitespace-nowrap">
                  UROWN
                </span>
                <span className="text-xs text-gray-600 font-bold tracking-wider uppercase -mt-1 whitespace-nowrap">
                  Your Voice Matters
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <div className="space-y-1">
              <Link 
                to="/browse" 
                className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-all duration-200 group"
                title="Browse"
              >
                <Search className="h-6 w-6 shrink-0" strokeWidth={2.5} />
                {!isSidebarCollapsed && <span className="font-bold">Browse</span>}
              </Link>

              <Link 
                to="/ideology-quiz" 
                className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-xl transition-all duration-200 group relative"
                title="Ideology Quiz"
              >
                <Sparkles className="h-6 w-6 shrink-0" strokeWidth={2.5} />
                {!isSidebarCollapsed && (
                  <div className="flex items-center gap-2">
                    <span className="font-bold">Ideology Quiz</span>
                    <span className="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full">NEW</span>
                  </div>
                )}
              </Link>

              <Link 
                to="/about" 
                className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all duration-200 group"
                title="About"
              >
                <Info className="h-6 w-6 shrink-0" strokeWidth={2.5} />
                {!isSidebarCollapsed && <span className="font-bold">About</span>}
              </Link>

              <Link 
                to="/partners" 
                className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-xl transition-all duration-200 group"
                title="Partners"
              >
                <Globe className="h-6 w-6 shrink-0" strokeWidth={2.5} />
                {!isSidebarCollapsed && <span className="font-bold">Partners</span>}
              </Link>

              <Link 
                to="/contact" 
                className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-xl transition-all duration-200 group"
                title="Contact"
              >
                <Mail className="h-6 w-6 shrink-0" strokeWidth={2.5} />
                {!isSidebarCollapsed && <span className="font-bold">Contact</span>}
              </Link>

              {user && (
                <>
                  <Link 
                    to="/notifications" 
                    className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-xl transition-all duration-200 group relative"
                    title="Notifications"
                  >
                    <div className="relative">
                      <Bell className="h-6 w-6 shrink-0" strokeWidth={2.5} />
                      {unreadCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </div>
                    {!isSidebarCollapsed && <span className="font-bold">Notifications</span>}
                  </Link>

                  <Link 
                    to="/library" 
                    className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-xl transition-all duration-200 group"
                    title="Library"
                  >
                    <BookOpen className="h-6 w-6 shrink-0" strokeWidth={2.5} />
                    {!isSidebarCollapsed && <span className="font-bold">Library</span>}
                  </Link>
                </>
              )}
            </div>
          </nav>

          {/* Bottom Section */}
          {user && (
            <div className="border-t border-gray-200 p-3 space-y-1">
              <Link
                to="/settings"
                className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
                title="Settings"
              >
                <Settings className="h-6 w-6 shrink-0" strokeWidth={2.5} />
                {!isSidebarCollapsed && <span className="font-bold">Settings</span>}
              </Link>

              {isEditorialOrAdmin && (
                <Link
                  to="/editorial"
                  className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all duration-200"
                  title="Editorial Board"
                >
                  <FileText className="h-6 w-6 shrink-0" strokeWidth={2.5} />
                  {!isSidebarCollapsed && <span className="font-bold">Editorial Board</span>}
                </Link>
              )}

              {isAdmin && (
                <>
                  <Link
                    to="/admin"
                    className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200"
                    title="Admin Panel"
                  >
                    <Shield className="h-6 w-6 shrink-0" strokeWidth={2.5} />
                    {!isSidebarCollapsed && <span className="font-bold">Admin Panel</span>}
                  </Link>
                  <Link
                    to="/admin/reported-articles"
                    className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200"
                    title="View Reports"
                  >
                    <FileText className="h-6 w-6 shrink-0" strokeWidth={2.5} />
                    {!isSidebarCollapsed && <span className="font-bold">View Reports</span>}
                  </Link>
                </>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center gap-4 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                title="Log out"
              >
                <LogOut className="h-6 w-6 shrink-0" strokeWidth={2.5} />
                {!isSidebarCollapsed && <span className="font-bold">Log out</span>}
              </button>
            </div>
          )}

          {/* Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="absolute -right-3 top-24 bg-white border border-gray-200 rounded-full p-1.5 hover:bg-gray-50 transition-all duration-200 shadow-lg z-10"
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="h-5 w-5 text-gray-600" />
            ) : (
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>
      </aside>

      {/* Top Header */}
      <header className={`sticky top-0 z-40 transition-all duration-200 ${
  scrolled 
    ? 'bg-white shadow-md border-b border-gray-200' 
    : 'bg-white border-b border-gray-100'
} ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop Layout */}
          <div className="hidden lg:flex items-center justify-between h-20">
            {/* Left - Login/Signup for non-logged users */}
            <div className="flex items-center gap-3">
              {!user && (
                <>
                  <Link 
                    to="/login" 
                    className="px-6 py-3 text-base font-black text-gray-800 hover:bg-gray-100 rounded-2xl transition-all duration-200"
                  >
                    Log in
                  </Link>
                  <Link 
                    to="/signup" 
                    className="px-6 py-3 text-base font-black text-white bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>

            {/* Right Navigation */}
            <div className="flex items-center gap-3 ml-auto">
              {user ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="group flex flex-col items-center gap-1 px-5 py-2 hover:bg-indigo-50 rounded-xl transition-all duration-200"
                  >
                    <LayoutDashboard className="h-6 w-6 text-indigo-600" strokeWidth={2.5} />
                    <span className="text-xs font-bold text-gray-700 group-hover:text-indigo-600 transition-colors">Dashboard</span>
                  </Link>

                  <Link 
                    to="/write" 
                    className="flex items-center gap-2 px-6 py-3 text-base font-black text-white bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    <PenTool className="h-5 w-5" strokeWidth={3} />
                    <span>Write</span>
                  </Link>

                  {/* User Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={toggleUserDropdown}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      aria-expanded={isUserDropdownOpen}
                      aria-haspopup="true"
                      aria-label="User menu"
                    >
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 flex items-center justify-center text-white text-base font-black shadow-md">
                        {user.display_name.charAt(0).toUpperCase()}
                      </div>
                      <span className="max-w-[120px] truncate font-bold text-gray-800">{user.display_name}</span>
                      <ChevronDown className={`h-5 w-5 text-gray-600 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`} strokeWidth={2.5} />
                    </button>
                    {isUserDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="py-2">
                          <Link
                            to={`/user/${encodeURIComponent(user.display_name)}`}
                            className="flex items-center gap-3 px-5 py-3 text-sm font-bold text-gray-800 hover:bg-orange-50 transition-all duration-150"
                            onClick={() => setIsUserDropdownOpen(false)}
                            role="menuitem"
                          >
                            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                              <User className="h-5 w-5 text-orange-600" strokeWidth={2.5} />
                            </div>
                            <span>Profile</span>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          </div>

          {/* Mobile/Tablet Layout */}
          <div className="lg:hidden flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Flame className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent tracking-tight">
                  UROWN
                </span>
                <span className="text-[9px] text-gray-600 font-bold tracking-wider uppercase -mt-0.5">
                  Your Voice Matters
                </span>
              </div>
            </Link>
            <button
              onClick={toggleMobileMenu}
              className="p-3 rounded-xl text-gray-700 hover:bg-orange-50 focus:outline-none transition-all duration-200"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="h-7 w-7" strokeWidth={2.5} /> : <Menu className="h-7 w-7" strokeWidth={2.5} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <nav className="lg:hidden pb-4 border-t border-gray-100 bg-gradient-to-b from-white to-gray-50">
              <div className="flex flex-col pt-4 space-y-2">
                <Link 
                  to="/browse" 
                  className="flex items-center gap-4 text-base font-bold text-gray-800 hover:bg-orange-50 py-4 px-5 rounded-xl transition-all duration-150"
                  onClick={closeMobileMenu}
                >
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Search className="h-6 w-6 text-orange-600" strokeWidth={2.5} />
                  </div>
                  <span>Browse</span>
                </Link>
                
                <Link 
                  to="/ideology-quiz" 
                  className="flex items-center gap-4 text-base font-bold text-gray-800 hover:bg-purple-50 py-4 px-5 rounded-xl transition-all duration-150"
                  onClick={closeMobileMenu}
                >
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-purple-600" strokeWidth={2.5} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Ideology Quiz</span>
                    <span className="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full">NEW</span>
                  </div>
                </Link>
                
                <Link 
                  to="/about" 
                  className="flex items-center gap-4 text-base font-bold text-gray-800 hover:bg-blue-50 py-4 px-5 rounded-xl transition-all duration-150"
                  onClick={closeMobileMenu}
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Info className="h-6 w-6 text-blue-600" strokeWidth={2.5} />
                  </div>
                  <span>About</span>
                </Link>
                <Link 
                  to="/partners" 
                  className="flex items-center gap-4 text-base font-bold text-gray-800 hover:bg-green-50 py-4 px-5 rounded-xl transition-all duration-150"
                  onClick={closeMobileMenu}
                >
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Globe className="h-6 w-6 text-green-600" strokeWidth={2.5} />
                  </div>
                  <span>Partners</span>
                </Link>
                <Link 
                  to="/contact" 
                  className="flex items-center gap-4 text-base font-bold text-gray-800 hover:bg-purple-50 py-4 px-5 rounded-xl transition-all duration-150"
                  onClick={closeMobileMenu}
                >
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Mail className="h-6 w-6 text-purple-600" strokeWidth={2.5} />
                  </div>
                  <span>Contact</span>
                </Link>
                
                {user ? (
                  <>
                    <div className="my-3 mx-5 h-0.5 bg-gradient-to-r from-orange-300 via-red-300 to-pink-300"></div>
                    
                    <Link 
                      to="/dashboard" 
                      className="flex items-center gap-4 text-base font-bold text-gray-800 hover:bg-indigo-50 py-4 px-5 rounded-xl transition-all duration-150"
                      onClick={closeMobileMenu}
                    >
                      <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                        <LayoutDashboard className="h-6 w-6 text-indigo-600" strokeWidth={2.5} />
                      </div>
                      <span>Dashboard</span>
                    </Link>
                    
                    <Link 
                      to="/notifications" 
                      className="flex items-center gap-4 text-base font-bold text-gray-800 hover:bg-amber-50 py-4 px-5 rounded-xl transition-all duration-150 relative"
                      onClick={closeMobileMenu}
                    >
                      <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center relative">
                        <Bell className="h-6 w-6 text-amber-600" strokeWidth={2.5} />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </div>
                      <span>Notifications</span>
                    </Link>
                    
                    <Link 
                      to="/library" 
                      className="flex items-center gap-4 text-base font-bold text-gray-800 hover:bg-green-50 py-4 px-5 rounded-xl transition-all duration-150"
                      onClick={closeMobileMenu}
                    >
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-green-600" strokeWidth={2.5} />
                      </div>
                      <span>Library</span>
                    </Link>
                    
                    <Link 
                      to="/write" 
                      className="flex items-center gap-4 text-base font-black text-white bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 py-4 px-5 rounded-2xl shadow-lg mx-3 justify-center transition-all duration-150"
                      onClick={closeMobileMenu}
                    >
                      <PenTool className="h-6 w-6" strokeWidth={3} />
                      <span>Write</span>
                    </Link>
                    
                    <div className="bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 mx-3 p-5 rounded-2xl border border-orange-200">
                      <Link
                        to={`/user/${encodeURIComponent(user.display_name)}`}
                        className="flex items-center gap-4 text-base font-bold text-gray-800 hover:text-orange-600 transition-colors"
                        onClick={closeMobileMenu}
                      >
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 flex items-center justify-center text-white text-lg font-black shadow-lg">
                          {user.display_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-lg">{user.display_name}</p>
                          <p className="text-sm text-gray-600 font-bold">View profile</p>
                        </div>
                      </Link>
                    </div>
                    
                    {isEditorialOrAdmin && (
                      <Link 
                        to="/editorial" 
                        className="flex items-center gap-4 text-base font-bold text-gray-800 hover:bg-blue-50 py-4 px-5 rounded-xl transition-all duration-150"
                        onClick={closeMobileMenu}
                      >
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <FileText className="h-6 w-6 text-blue-600" strokeWidth={2.5} />
                        </div>
                        <span>Editorial Board</span>
                      </Link>
                    )}
                    
                    {isAdmin && (
                      <>
                        <Link 
                          to="/admin" 
                          className="flex items-center gap-4 text-base font-bold text-gray-800 hover:bg-red-50 py-4 px-5 rounded-xl transition-all duration-150"
                          onClick={closeMobileMenu}
                        >
                          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                            <Shield className="h-6 w-6 text-red-600" strokeWidth={2.5} />
                          </div>
                          <span>Admin Panel</span>
                        </Link>
                        <Link 
                          to="/admin/reported-articles"
                          className="flex items-center gap-4 text-base font-bold text-gray-800 hover:bg-red-50 py-4 px-5 rounded-xl transition-all duration-150"
                          onClick={closeMobileMenu}
                        >
                          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                            <FileText className="h-6 w-6 text-red-600" strokeWidth={2.5} />
                          </div>
                          <span>Reports</span>
                        </Link>
                      </>
                    )}
                    
                    <Link
                      to="/settings"
                      className="flex items-center gap-4 text-base font-bold text-gray-800 hover:bg-gray-100 py-4 px-5 rounded-xl transition-all duration-150"
                      onClick={closeMobileMenu}
                    >
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                        <Settings className="h-6 w-6 text-gray-600" strokeWidth={2.5} />
                      </div>
                      <span>Settings</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        closeMobileMenu();
                      }}
                      className="flex items-center gap-4 w-full text-left text-base font-bold text-red-600 hover:bg-red-50 py-4 px-5 rounded-xl transition-all duration-150"
                    >
                      <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                        <LogOut className="h-6 w-6 text-red-600" strokeWidth={2.5} />
                      </div>
                      <span>Log out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="my-3 mx-5 h-0.5 bg-gradient-to-r from-orange-300 via-red-300 to-pink-300"></div>
                    <Link 
                      to="/login" 
                      className="flex items-center justify-center gap-3 text-base font-bold text-gray-800 hover:bg-gray-100 py-4 px-5 rounded-xl transition-all duration-150"
                      onClick={closeMobileMenu}
                    >
                      <User className="h-6 w-6" strokeWidth={2.5} />
                      <span>Log in</span>
                    </Link>
                    <Link 
                      to="/signup" 
                      className="flex items-center justify-center gap-3 text-base font-black text-white bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 py-4 px-5 rounded-2xl shadow-lg mx-3 transition-all duration-150"
                      onClick={closeMobileMenu}
                    >
                      <User className="h-6 w-6" strokeWidth={3} />
                      <span>Sign up</span>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          )}
        </div>
      </header>
    </>
  );
}

export default Header;