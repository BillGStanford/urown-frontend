import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
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
  Home,
  Sparkles,
  Bell,
  TrendingUp,
  Award,
  Zap
} from 'lucide-react';

function Header({ user, onLogout }) {
  const { logout } = useUser();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isNavDropdownOpen, setIsNavDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);
  const navDropdownRef = useRef(null);
  const notificationsRef = useRef(null);

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

  const toggleNavDropdown = () => {
    setIsNavDropdownOpen(!isNavDropdownOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
      if (navDropdownRef.current && !navDropdownRef.current.contains(event.target)) {
        setIsNavDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check if a route is active
  const isActive = (path) => location.pathname === path;

  // Get tier badge styling
  const getTierBadge = (tier) => {
    switch (tier?.toLowerCase()) {
      case 'gold':
        return { gradient: 'from-yellow-400 to-yellow-600', emoji: '🥇', text: 'Gold' };
      case 'platinum':
        return { gradient: 'from-purple-400 to-pink-600', emoji: '💎', text: 'Platinum' };
      default:
        return { gradient: 'from-gray-400 to-gray-600', emoji: '🥈', text: 'Silver' };
    }
  };

  const tierBadge = user ? getTierBadge(user.tier) : null;

  return (
    <header className={`sticky top-0 z-50 transition-all duration-500 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-2xl shadow-2xl border-b border-gray-200' 
        : 'bg-white/85 backdrop-blur-xl shadow-lg border-b border-gray-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Layout */}
        <div className="hidden lg:flex items-center justify-between py-3">
          {/* Left Navigation */}
          <nav className="flex items-center space-x-1">
            <Link 
              to="/" 
              className={`group relative flex items-center gap-2 px-4 py-2.5 text-sm font-bold transition-all duration-300 rounded-xl ${
                isActive('/') 
                  ? 'text-orange-600 bg-orange-50' 
                  : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
              {isActive('/') && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
              )}
            </Link>
            <Link 
              to="/browse" 
              className={`group relative flex items-center gap-2 px-4 py-2.5 text-sm font-bold transition-all duration-300 rounded-xl ${
                isActive('/browse') 
                  ? 'text-orange-600 bg-orange-50' 
                  : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50'
              }`}
            >
              <Search className="h-4 w-4" />
              <span>Browse</span>
              {isActive('/browse') && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
              )}
            </Link>
            <Link 
              to="/partners" 
              className={`group relative flex items-center gap-2 px-4 py-2.5 text-sm font-bold transition-all duration-300 rounded-xl ${
                isActive('/partners') 
                  ? 'text-orange-600 bg-orange-50' 
                  : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50'
              }`}
            >
              <Globe className="h-4 w-4" />
              <span>Partners</span>
              {isActive('/partners') && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
              )}
            </Link>
            <Link 
              to="/contact" 
              className={`group relative flex items-center gap-2 px-4 py-2.5 text-sm font-bold transition-all duration-300 rounded-xl ${
                isActive('/contact') 
                  ? 'text-orange-600 bg-orange-50' 
                  : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50'
              }`}
            >
              <Mail className="h-4 w-4" />
              <span>Contact</span>
              {isActive('/contact') && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
              )}
            </Link>
          </nav>

          {/* Centered Logo with Enhanced Design */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <Link to="/" className="group flex flex-col items-center">
              <div className="relative flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-3">
                    <Sparkles className="h-7 w-7 text-white animate-pulse" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-4xl font-black bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent group-hover:from-orange-600 group-hover:via-red-600 group-hover:to-pink-600 transition-all duration-300 tracking-tight leading-none">
                    UROWN
                  </span>
                  <span className="text-xs text-gray-500 mt-0.5 font-semibold tracking-widest group-hover:text-orange-600 transition-colors duration-300 uppercase">
                    Your Voice Matters
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Right Navigation */}
          <div className="flex items-center space-x-2">
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className={`group relative flex items-center gap-2 px-4 py-2.5 text-sm font-bold transition-all duration-300 rounded-xl ${
                    isActive('/dashboard') 
                      ? 'text-orange-600 bg-orange-50' 
                      : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                  {isActive('/dashboard') && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
                  )}
                </Link>

                <Link 
                  to="/write" 
                  className="group relative flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  <PenTool className="h-4 w-4 relative z-10" />
                  <span className="relative z-10">Write</span>
                  <Zap className="h-3 w-3 relative z-10 opacity-75" />
                </Link>

                {/* Notifications Button */}
                <div className="relative" ref={notificationsRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2.5 rounded-xl text-gray-700 hover:text-orange-600 hover:bg-orange-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                    aria-label="Notifications"
                  >
                    <Bell className="h-5 w-5" />
                    {/* Notification Badge */}
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  </button>
                  
                  {showNotifications && (
                    <div className="absolute right-0 mt-3 w-80 bg-white/98 backdrop-blur-2xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-dropdown">
                      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-red-50">
                        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                          <Bell className="h-4 w-4 text-orange-600" />
                          Notifications
                        </h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        <div className="p-4 text-center text-sm text-gray-500">
                          No new notifications
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation Dropdown */}
                {isEditorialOrAdmin && (
                  <div className="relative" ref={navDropdownRef}>
                    <button
                      onClick={toggleNavDropdown}
                      className="group relative p-2.5 rounded-xl text-gray-700 hover:text-orange-600 hover:bg-orange-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                      aria-expanded={isNavDropdownOpen}
                      aria-haspopup="true"
                      aria-label="Navigation menu"
                    >
                      <Menu className="h-5 w-5" />
                    </button>
                    {isNavDropdownOpen && (
                      <div className="absolute right-0 mt-3 w-64 bg-white/98 backdrop-blur-2xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-dropdown">
                        <div className="py-2">
                          <Link
                            to="/editorial"
                            className="group flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-900 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition-all duration-200"
                            onClick={() => setIsNavDropdownOpen(false)}
                          >
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                              <FileText className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <span className="block">Editorial Board</span>
                              <span className="text-xs text-gray-500">Certify articles</span>
                            </div>
                          </Link>
                          {isAdmin && (
                            <>
                              <div className="mx-4 my-2 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                              <Link
                                to="/admin"
                                className="group flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-900 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-200"
                                onClick={() => setIsNavDropdownOpen(false)}
                              >
                                <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center shadow-md">
                                  <Shield className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <span className="block">Admin Panel</span>
                                  <span className="text-xs text-gray-500">Manage platform</span>
                                </div>
                              </Link>
                              <Link
                                to="/admin/reported-articles"
                                className="group flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-900 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-200"
                                onClick={() => setIsNavDropdownOpen(false)}
                              >
                                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-600 rounded-xl flex items-center justify-center shadow-md">
                                  <FileText className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <span className="block">Reports</span>
                                  <span className="text-xs text-gray-500">Review flagged content</span>
                                </div>
                              </Link>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Enhanced User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={toggleUserDropdown}
                    className="group relative flex items-center gap-3 px-3 py-2 text-sm font-bold text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                    aria-expanded={isUserDropdownOpen}
                    aria-haspopup="true"
                    aria-label="User menu"
                  >
                    <div className="relative">
                      <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${tierBadge.gradient} flex items-center justify-center text-white text-sm font-bold shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                        {user.display_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-br from-green-400 to-green-600 rounded-full border-2 border-white shadow-sm"></div>
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="max-w-[100px] truncate leading-tight">{user.display_name}</span>
                      <span className="text-xs text-gray-500 leading-tight">{tierBadge.emoji} {tierBadge.text}</span>
                    </div>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isUserDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-80 bg-white/98 backdrop-blur-2xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-dropdown">
                      {/* User Info Header */}
                      <div className={`px-5 py-4 bg-gradient-to-r ${tierBadge.gradient} border-b border-white/20`}>
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="h-14 w-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-xl font-bold shadow-lg border-2 border-white/30">
                              {user.display_name.charAt(0).toUpperCase()}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-green-400 to-green-600 rounded-full border-2 border-white shadow-sm"></div>
                          </div>
                          <div className="flex-1 text-white">
                            <p className="font-bold text-lg leading-tight">{user.display_name}</p>
                            <p className="text-sm opacity-90 flex items-center gap-1 mt-1">
                              <Award className="h-3 w-3" />
                              {tierBadge.text} Tier Member
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="py-2">
                        <Link
                          to={`/user/${encodeURIComponent(user.display_name)}`}
                          className="group flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-900 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 transition-all duration-200"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <span className="block">View Profile</span>
                            <span className="text-xs text-gray-500">Your public page</span>
                          </div>
                        </Link>
                        
                        <Link
                          to="/settings"
                          className="group flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-900 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
                            <Settings className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <span className="block">Settings</span>
                            <span className="text-xs text-gray-500">Manage account</span>
                          </div>
                        </Link>
                        
                        <div className="mx-4 my-2 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                        
                        <button
                          onClick={handleLogout}
                          className="group flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-200"
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
                            <LogOut className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <span className="block">Logout</span>
                            <span className="text-xs text-red-400">Sign out of account</span>
                          </div>
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
                  className="group relative px-5 py-2.5 text-sm font-bold text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-300"
                >
                  <span>Login</span>
                </Link>
                <Link 
                  to="/signup" 
                  className="group relative px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  <span className="relative z-10 flex items-center gap-2">
                    Sign Up
                    <TrendingUp className="h-4 w-4" />
                  </span>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile/Tablet Layout */}
        <div className="lg:hidden flex items-center justify-between py-3">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"></div>
            </div>
            <div>
              <span className="text-2xl font-black bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent tracking-tight leading-none">
                UROWN
              </span>
              <p className="text-xs text-gray-500 font-semibold tracking-wider uppercase leading-none mt-0.5">
                Your Voice
              </p>
            </div>
          </div>
          <button
            onClick={toggleMobileMenu}
            className="p-3 rounded-xl text-gray-700 hover:text-orange-600 hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          </Link>
        </div>

        {/* Enhanced Mobile Menu */}
        {isMobileMenuOpen && (
          <nav className="lg:hidden pb-4 bg-white/98 backdrop-blur-2xl rounded-2xl mt-3 mb-3 border border-gray-200 shadow-2xl animate-slide-down overflow-hidden">
            <div className="flex flex-col space-y-1 p-3">
              <Link 
                to="/" 
                className={`group flex items-center gap-3 text-sm font-bold hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 py-3 px-4 rounded-xl transition-all duration-300 ${
                  isActive('/') ? 'bg-gradient-to-r from-orange-50 to-orange-100 text-orange-600' : 'text-gray-700'
                }`}
                onClick={closeMobileMenu}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  isActive('/contact') ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-md' : 'bg-gray-100 text-gray-600'
                }`}>
                  <Mail className="h-5 w-5" />
                </div>
                <span>Contact</span>
              </Link>
              
              {user ? (
                <>
                  <div className="mx-2 my-2 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                  
                  <Link 
                    to="/dashboard" 
                    className={`group flex items-center gap-3 text-sm font-bold hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 py-3 px-4 rounded-xl transition-all duration-300 ${
                      isActive('/dashboard') ? 'bg-gradient-to-r from-orange-50 to-orange-100 text-orange-600' : 'text-gray-700'
                    }`}
                    onClick={closeMobileMenu}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                      isActive('/dashboard') ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-md' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <LayoutDashboard className="h-5 w-5" />
                    </div>
                    <span>Dashboard</span>
                  </Link>
                  
                  <Link 
                    to="/write" 
                    className="group flex items-center gap-3 text-sm font-bold text-white bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                    onClick={closeMobileMenu}
                  >
                    <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <PenTool className="h-5 w-5" />
                    </div>
                    <span>Write Article</span>
                    <Zap className="h-4 w-4 ml-auto opacity-75" />
                  </Link>
                  
                  {isEditorialOrAdmin && (
                    <>
                      <div className="mx-2 my-2 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                      <Link 
                        to="/editorial" 
                        className="group flex items-center gap-3 text-sm font-bold text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 py-3 px-4 rounded-xl transition-all duration-300"
                        onClick={closeMobileMenu}
                      >
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <span className="block">Editorial Board</span>
                          <span className="text-xs text-blue-400">Certify articles</span>
                        </div>
                      </Link>
                    </>
                  )}
                  
                  {isAdmin && (
                    <>
                      <Link 
                        to="/admin" 
                        className="group flex items-center gap-3 text-sm font-bold text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 py-3 px-4 rounded-xl transition-all duration-300"
                        onClick={closeMobileMenu}
                      >
                        <div className="w-9 h-9 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center shadow-md">
                          <Shield className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <span className="block">Admin Panel</span>
                          <span className="text-xs text-red-400">Manage platform</span>
                        </div>
                      </Link>
                      <Link 
                        to="/admin/reported-articles"
                        className="group flex items-center gap-3 text-sm font-bold text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 py-3 px-4 rounded-xl transition-all duration-300"
                        onClick={closeMobileMenu}
                      >
                        <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-red-600 rounded-xl flex items-center justify-center shadow-md">
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <span className="block">Reports</span>
                          <span className="text-xs text-red-400">Flagged content</span>
                        </div>
                      </Link>
                    </>
                  )}
                  
                  <div className="mx-2 my-2 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                  
                  {/* Enhanced User Profile Section */}
                  <div className={`bg-gradient-to-r ${tierBadge.gradient} p-4 rounded-xl border-2 border-white/50 shadow-lg mx-2`}>
                    <Link
                      to={`/user/${encodeURIComponent(user.display_name)}`}
                      className="flex items-center gap-3 text-white"
                      onClick={closeMobileMenu}
                    >
                      <div className="relative">
                        <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-lg font-bold shadow-md border-2 border-white/30">
                          {user.display_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-br from-green-400 to-green-600 rounded-full border-2 border-white shadow-sm"></div>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-base leading-tight">{user.display_name}</p>
                        <p className="text-sm opacity-90 flex items-center gap-1 mt-0.5">
                          <Award className="h-3 w-3" />
                          {tierBadge.emoji} {tierBadge.text} Tier
                        </p>
                      </div>
                      <ChevronDown className="h-5 w-5 rotate-270 opacity-75" />
                    </Link>
                  </div>
                  
                  <Link
                    to="/settings"
                    className="group flex items-center gap-3 text-sm font-bold text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 py-3 px-4 rounded-xl transition-all duration-300"
                    onClick={closeMobileMenu}
                  >
                    <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                      <Settings className="h-5 w-5 text-gray-600" />
                    </div>
                    <span>Settings</span>
                  </Link>
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      closeMobileMenu();
                    }}
                    className="group flex items-center gap-3 w-full text-left text-sm font-bold text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 py-3 px-4 rounded-xl transition-all duration-300"
                  >
                    <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center group-hover:bg-red-200 transition-colors">
                      <LogOut className="h-5 w-5 text-red-600" />
                    </div>
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="mx-2 my-2 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                  <Link 
                    to="/login" 
                    className="group flex items-center justify-center gap-3 text-sm font-bold text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 py-3 px-4 rounded-xl transition-all duration-300"
                    onClick={closeMobileMenu}
                  >
                    <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                    <span>Login</span>
                  </Link>
                  <Link 
                    to="/signup" 
                    className="group flex items-center justify-center gap-3 text-sm font-bold text-white bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                    onClick={closeMobileMenu}
                  >
                    <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                    <span>Sign Up</span>
                    <TrendingUp className="h-4 w-4 ml-auto opacity-75" />
                  </Link>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
      
      <style jsx>{`
        @keyframes dropdown {
          from { 
            opacity: 0; 
            transform: translateY(-10px) scale(0.95);
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1);
          }
        }
        @keyframes slide-down {
          from { 
            opacity: 0; 
            transform: translateY(-20px) scale(0.95);
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1);
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        .animate-dropdown {
          animation: dropdown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-slide-down {
          animation: slide-down 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </header>
  );
}

export default Header;