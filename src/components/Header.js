import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  Trophy,
  Home,
  Compass,
  Library,
  X,
  MoreHorizontal,
  Grid3X3
} from 'lucide-react';

function Header({ user, onLogout }) {
  const { logout } = useUser();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const sidebarRef = useRef(null);

  const isAdmin = useMemo(() => 
    user && (user.role === 'admin' || user.role === 'super-admin'), [user]);
  
  const isEditorialOrAdmin = useMemo(() => 
    user && (user.role === 'editorial-board' || user.role === 'admin' || user.role === 'super-admin'), [user]);

  const handleLogout = useCallback(() => {
    logout();
    onLogout();
    setIsUserDropdownOpen(false);
    setIsSidebarOpen(false);
    setIsMobileMenuOpen(false);
  }, [logout, onLogout]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  const toggleUserDropdown = useCallback(() => {
    setIsUserDropdownOpen(prev => !prev);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await axios.get('/notifications/unread-count');
      setUnreadCount(response.data.count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, []);

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
  }, [user, fetchUnreadCount]);

  const isActive = useCallback((path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  }, [location.pathname]);

  // Navigation items with memoization
  const primaryBottomNavLoggedIn = useMemo(() => [
    {
      to: '/',
      icon: Home,
      label: 'Home',
      gradient: 'from-blue-500 to-cyan-500',
      hoverBg: 'hover:bg-blue-50',
      activeBg: 'bg-blue-50',
      activeColor: 'text-blue-600'
    },
    {
      to: '/browse',
      icon: Compass,
      label: 'Explore',
      gradient: 'from-purple-500 to-pink-500',
      hoverBg: 'hover:bg-purple-50',
      activeBg: 'bg-purple-50',
      activeColor: 'text-purple-600'
    },
    {
      to: '/write',
      icon: PenTool,
      label: 'Write',
      gradient: 'from-orange-500 via-red-500 to-pink-500',
      hoverBg: 'hover:bg-orange-50',
      activeBg: 'bg-orange-50',
      activeColor: 'text-orange-600',
      isPrimary: true
    },
    {
      to: '/notifications',
      icon: Bell,
      label: 'Alerts',
      gradient: 'from-amber-500 to-orange-500',
      hoverBg: 'hover:bg-amber-50',
      activeBg: 'bg-amber-50',
      activeColor: 'text-amber-600',
      badge: unreadCount
    },
    {
      to: '/library',
      icon: Library,
      label: 'Library',
      gradient: 'from-green-500 to-emerald-500',
      hoverBg: 'hover:bg-green-50',
      activeBg: 'bg-green-50',
      activeColor: 'text-green-600'
    }
  ], [unreadCount]);

  const secondaryBottomNavLoggedIn = useMemo(() => [
    {
      to: '/ideology-quiz',
      icon: Sparkles,
      label: 'Quiz',
      gradient: 'from-indigo-500 to-purple-500',
      hoverBg: 'hover:bg-indigo-50',
      activeBg: 'bg-indigo-50',
      activeColor: 'text-indigo-600'
    },
    {
      to: '/leaderboard',
      icon: Trophy,
      label: 'Ranks',
      gradient: 'from-yellow-500 to-amber-500',
      hoverBg: 'hover:bg-yellow-50',
      activeBg: 'bg-yellow-50',
      activeColor: 'text-yellow-600'
    },
    {
      to: '/about',
      icon: Info,
      label: 'About',
      gradient: 'from-blue-500 to-cyan-500',
      hoverBg: 'hover:bg-blue-50',
      activeBg: 'bg-blue-50',
      activeColor: 'text-blue-600'
    },
    {
      to: '/contact',
      icon: Mail,
      label: 'Contact',
      gradient: 'from-purple-500 to-pink-500',
      hoverBg: 'hover:bg-purple-50',
      activeBg: 'bg-purple-50',
      activeColor: 'text-purple-600'
    },
    {
      to: '/partners',
      icon: Globe,
      label: 'Partners',
      gradient: 'from-green-500 to-emerald-500',
      hoverBg: 'hover:bg-green-50',
      activeBg: 'bg-green-50',
      activeColor: 'text-green-600'
    },
    {
      to: '/redflagged',
      icon: FlagIcon,
      label: 'RedFlagged',
      gradient: 'from-red-500 to-rose-500',
      hoverBg: 'hover:bg-red-50',
      activeBg: 'bg-red-50',
      activeColor: 'text-red-600'
    }
  ], []);

  const primaryBottomNavLoggedOut = useMemo(() => [
    {
      to: '/',
      icon: Home,
      label: 'Home',
      gradient: 'from-blue-500 to-cyan-500',
      hoverBg: 'hover:bg-blue-50',
      activeBg: 'bg-blue-50',
      activeColor: 'text-blue-600'
    },
    {
      to: '/browse',
      icon: Compass,
      label: 'Explore',
      gradient: 'from-purple-500 to-pink-500',
      hoverBg: 'hover:bg-purple-50',
      activeBg: 'bg-purple-50',
      activeColor: 'text-purple-600'
    },
    {
      to: '/ideology-quiz',
      icon: Sparkles,
      label: 'Quiz',
      gradient: 'from-indigo-500 to-purple-500',
      hoverBg: 'hover:bg-indigo-50',
      activeBg: 'bg-indigo-50',
      activeColor: 'text-indigo-600'
    },
    {
      to: '/leaderboard',
      icon: Trophy,
      label: 'Ranks',
      gradient: 'from-yellow-500 to-amber-500',
      hoverBg: 'hover:bg-yellow-50',
      activeBg: 'bg-yellow-50',
      activeColor: 'text-yellow-600'
    }
  ], []);

  const secondaryBottomNavLoggedOut = useMemo(() => [
    {
      to: '/about',
      icon: Info,
      label: 'About',
      gradient: 'from-blue-500 to-cyan-500',
      hoverBg: 'hover:bg-blue-50',
      activeBg: 'bg-blue-50',
      activeColor: 'text-blue-600'
    },
    {
      to: '/contact',
      icon: Mail,
      label: 'Contact',
      gradient: 'from-purple-500 to-pink-500',
      hoverBg: 'hover:bg-purple-50',
      activeBg: 'bg-purple-50',
      activeColor: 'text-purple-600'
    },
    {
      to: '/partners',
      icon: Globe,
      label: 'Partners',
      gradient: 'from-green-500 to-emerald-500',
      hoverBg: 'hover:bg-green-50',
      activeBg: 'bg-green-50',
      activeColor: 'text-green-600'
    },
    {
      to: '/redflagged',
      icon: FlagIcon,
      label: 'RedFlagged',
      gradient: 'from-red-500 to-rose-500',
      hoverBg: 'hover:bg-red-50',
      activeBg: 'bg-red-50',
      activeColor: 'text-red-600'
    }
  ], []);

  // Memoized sidebar navigation items
  const sidebarNavItems = useMemo(() => {
    const items = [
      { to: '/browse', icon: Search, label: 'Browse', color: 'orange' },
      { to: '/ideology-quiz', icon: Sparkles, label: 'Ideology Quiz', color: 'purple', isNew: true },
      { to: '/leaderboard', icon: Trophy, label: 'Leaderboard', color: 'yellow' },
      { to: '/about', icon: Info, label: 'About', color: 'blue' },
      { to: '/partners', icon: Globe, label: 'Partners', color: 'green' },
      { to: '/contact', icon: Mail, label: 'Contact', color: 'purple' },
      { to: '/redflagged', icon: FlagIcon, label: 'RedFlagged', color: 'red' }
    ];
    
    if (user) {
      items.push(
        { to: '/library', icon: BookOpen, label: 'Library', color: 'green' },
        { to: `/user/${encodeURIComponent(user.display_name)}`, icon: User, label: 'Profile', color: 'orange' },
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: 'indigo' },
        { to: '/settings', icon: Settings, label: 'Settings', color: 'gray' }
      );
    }
    
    if (isEditorialOrAdmin) {
      items.push({ to: '/editorial', icon: FileText, label: 'Editorial Board', color: 'blue' });
    }
    
    if (isAdmin) {
      items.push(
        { to: '/admin', icon: Shield, label: 'Admin Panel', color: 'red' },
        { to: '/admin/reported-articles', icon: FileText, label: 'View Reports', color: 'red' }
      );
    }
    
    return items;
  }, [user, isEditorialOrAdmin, isAdmin]);

  return (
    <>
      {/* Sidebar Overlay - Desktop Only */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 hidden md:block"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar - Desktop Only */}
      <aside 
        ref={sidebarRef}
        className={`fixed left-0 h-screen bg-white/95 backdrop-blur-xl border-r border-gray-200/50 transition-all duration-500 ease-out z-50 w-80 hidden md:block ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ top: scrolled ? '64px' : '72px' }}
      >
        <div className="flex flex-col h-full overflow-y-auto pb-6">
          {/* Navigation Section */}
          <nav className="py-6 px-4">
            <div className="space-y-2">
              {sidebarNavItems.map((item, index) => {
                const Icon = item.icon;
                const colorClass = `${item.color}-100`;
                const hoverColorClass = `hover:bg-${item.color}-50`;
                const hoverTextClass = `hover:text-${item.color}-600`;
                
                return (
                  <Link 
                    key={item.to}
                    to={item.to} 
                    className={`flex items-center gap-4 px-5 py-4 text-gray-700 ${hoverColorClass} ${hoverTextClass} rounded-2xl transition-all duration-300 group`}
                    onClick={closeSidebar}
                  >
                    <div className={`w-12 h-12 ${colorClass} group-hover:bg-${item.color}-200 rounded-xl flex items-center justify-center transition-colors duration-300`}>
                      <Icon className="h-7 w-7" strokeWidth={2.5} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">{item.label}</span>
                      {item.isNew && (
                        <span className="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full">NEW</span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Logout Section */}
          {user && (
            <>
              <div className="my-4 h-px bg-gray-200" />
              <div className="py-4 px-4">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-4 w-full px-5 py-4 text-red-600 hover:bg-red-50 rounded-2xl transition-all duration-300 group"
                >
                  <div className="w-12 h-12 bg-red-100 group-hover:bg-red-200 rounded-xl flex items-center justify-center transition-colors duration-300">
                    <LogOut className="h-7 w-7" strokeWidth={2.5} />
                  </div>
                  <span className="text-lg font-bold">Log out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* Top Header */}
      <header className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50' 
          : 'bg-white/90 backdrop-blur-lg border-b border-gray-100/50'
      }`}>
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 lg:h-20">
            {/* Left - Menu Button (Desktop Only) + Logo */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              {/* Menu Button - Desktop Only */}
              <button
                onClick={toggleSidebar}
                data-sidebar-toggle
                className="hidden md:block p-2.5 lg:p-3 rounded-xl text-gray-700 hover:bg-orange-50 hover:text-orange-600 focus:outline-none transition-all duration-300"
                aria-label="Toggle menu"
                aria-expanded={isSidebarOpen}
              >
                <Menu className="h-6 w-6 lg:h-7 lg:w-7" strokeWidth={2.5} />
              </button>

              <Link to="/" className="flex items-center gap-2 lg:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg">
                  <Flame className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-white" />
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
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              {user ? (
                <>
                  {/* Notifications - Desktop Only */}
                  <div className="hidden sm:block relative">
                    <Link 
                      to="/notifications" 
                      className="relative p-2.5 lg:p-3 hover:bg-amber-50 rounded-xl transition-all duration-300"
                      title="Notifications"
                    >
                      <Bell className="h-5 w-5 lg:h-6 lg:w-6 text-gray-700" strokeWidth={2.5} />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-md">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </Link>
                  </div>

                  {/* Write Button - Desktop Only */}
                  <Link 
                    to="/write" 
                    className="hidden sm:flex items-center gap-2 px-4 sm:px-5 lg:px-6 py-2.5 lg:py-3 text-sm lg:text-base font-black text-white bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 rounded-xl lg:rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    <PenTool className="h-4 w-4 lg:h-5 lg:w-5" strokeWidth={3} />
                    <span className="hidden md:inline">Write</span>
                  </Link>

                  {/* Browse Button - Desktop Only */}
                  <Link 
                    to="/browse" 
                    className="hidden sm:flex items-center gap-2 px-4 sm:px-5 lg:px-6 py-2.5 lg:py-3 text-sm lg:text-base font-black text-white bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 rounded-xl lg:rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    <Compass className="h-4 w-4 lg:h-5 lg:w-5" strokeWidth={3} />
                    <span className="hidden md:inline">Browse</span>
                  </Link>

                  {/* User Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={toggleUserDropdown}
                      className="flex items-center gap-2 sm:gap-3 lg:gap-4 px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 hover:bg-gray-50 rounded-xl lg:rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      aria-expanded={isUserDropdownOpen}
                      aria-haspopup="true"
                      aria-label="User menu"
                    >
                      <div className="h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 rounded-full bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 flex items-center justify-center text-white text-sm sm:text-base lg:text-base font-black shadow-md">
                        {user.display_name.charAt(0).toUpperCase()}
                      </div>
                      <span className="hidden lg:block max-w-[100px] xl:max-w-[120px] truncate font-bold text-gray-800 text-sm lg:text-base">
                        {user.display_name}
                      </span>
                      <ChevronDown className={`hidden lg:block h-4 w-4 lg:h-5 lg:w-5 text-gray-600 transition-transform duration-300 ${isUserDropdownOpen ? 'rotate-180' : ''}`} strokeWidth={2.5} />
                    </button>

                    {isUserDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 lg:w-64 bg-white/95 backdrop-blur-xl rounded-xl lg:rounded-2xl shadow-2xl border border-gray-100/50 overflow-hidden">
                        <div className="py-2">
                          <Link
                            to={`/user/${encodeURIComponent(user.display_name)}`}
                            className="flex items-center gap-3 px-4 lg:px-5 py-3 text-sm font-bold text-gray-800 hover:bg-orange-50 transition-all duration-150"
                            onClick={() => setIsUserDropdownOpen(false)}
                          >
                            <div className="w-9 h-9 lg:w-10 lg:h-10 bg-gradient-to-r from-orange-100 to-red-100 rounded-xl flex items-center justify-center">
                              <User className="h-5 w-5 text-orange-600" strokeWidth={2.5} />
                            </div>
                            <span>Profile</span>
                          </Link>

                          <Link
                            to="/dashboard"
                            className="flex items-center gap-3 px-4 lg:px-5 py-3 text-sm font-bold text-gray-800 hover:bg-indigo-50 transition-all duration-150"
                            onClick={() => setIsUserDropdownOpen(false)}
                          >
                            <div className="w-9 h-9 lg:w-10 lg:h-10 bg-gradient-to-r from-indigo-100 to-blue-100 rounded-xl flex items-center justify-center">
                              <LayoutDashboard className="h-5 w-5 text-indigo-600" strokeWidth={2.5} />
                            </div>
                            <span>Dashboard</span>
                          </Link>

                          <Link
                            to="/settings"
                            className="flex items-center gap-3 px-4 lg:px-5 py-3 text-sm font-bold text-gray-800 hover:bg-gray-100 transition-all duration-150"
                            onClick={() => setIsUserDropdownOpen(false)}
                          >
                            <div className="w-9 h-9 lg:w-10 lg:h-10 bg-gradient-to-r from-gray-100 to-slate-100 rounded-xl flex items-center justify-center">
                              <Settings className="h-5 w-5 text-gray-600" strokeWidth={2.5} />
                            </div>
                            <span>Settings</span>
                          </Link>

                          {isEditorialOrAdmin && (
                            <>
                              <div className="my-2 h-px bg-gray-200" />
                              <Link
                                to="/editorial"
                                className="flex items-center gap-3 px-4 lg:px-5 py-3 text-sm font-bold text-gray-800 hover:bg-blue-50 transition-all duration-150"
                                onClick={() => setIsUserDropdownOpen(false)}
                              >
                                <div className="w-9 h-9 lg:w-10 lg:h-10 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                                  <FileText className="h-5 w-5 text-blue-600" strokeWidth={2.5} />
                                </div>
                                <span>Editorial Board</span>
                              </Link>
                            </>
                          )}

                          {isAdmin && (
                            <>
                              <Link
                                to="/admin"
                                className="flex items-center gap-3 px-4 lg:px-5 py-3 text-sm font-bold text-gray-800 hover:bg-red-50 transition-all duration-150"
                                onClick={() => setIsUserDropdownOpen(false)}
                              >
                                <div className="w-9 h-9 lg:w-10 lg:h-10 bg-gradient-to-r from-red-100 to-pink-100 rounded-xl flex items-center justify-center">
                                  <Shield className="h-5 w-5 text-red-600" strokeWidth={2.5} />
                                </div>
                                <span>Admin Panel</span>
                              </Link>
                            </>
                          )}

                          <div className="my-2 h-px bg-gray-200" />

                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 lg:px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-all duration-150"
                          >
                            <div className="w-9 h-9 lg:w-10 lg:h-10 bg-gradient-to-r from-red-100 to-rose-100 rounded-xl flex items-center justify-center">
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
                    className="px-4 sm:px-5 lg:px-6 py-2.5 lg:py-3 text-sm lg:text-base font-black text-gray-800 hover:bg-gray-100 rounded-xl lg:rounded-2xl transition-all duration-300"
                  >
                    Log in
                  </Link>
                  <Link 
                    to="/signup" 
                    className="px-4 sm:px-5 lg:px-6 py-2.5 lg:py-3 text-sm lg:text-base font-black text-white bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 rounded-xl lg:rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation - Primary Items Only */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-200/50 shadow-2xl pb-safe">
        <div className="flex items-center justify-around h-16">
          {/* Primary Navigation Items */}
          {(user ? primaryBottomNavLoggedIn : primaryBottomNavLoggedOut).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);
            
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`relative flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 ${
                  active ? item.activeBg : item.hoverBg
                }`}
              >
                {item.isPrimary ? (
                  <div className={`relative flex flex-col items-center justify-center transition-all duration-300 transform active:scale-95 ${
                    active ? 'scale-110' : 'hover:scale-105'
                  }`}>
                    <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} rounded-2xl blur-xl opacity-50 ${
                      active ? 'opacity-75' : ''
                    }`} />
                    <div className={`relative bg-gradient-to-r ${item.gradient} p-3 rounded-2xl shadow-lg ${
                      active ? 'shadow-xl ring-4 ring-white/50' : ''
                    }`}>
                      <Icon className="h-6 w-6 text-white" strokeWidth={3} />
                    </div>
                    <span className="text-xs font-black mt-1 text-gray-700">Write</span>
                  </div>
                ) : (
                  <>
                    <div className={`relative transition-all duration-300 transform active:scale-95 ${
                      active ? 'scale-110' : 'hover:scale-105'
                    }`}>
                      {active && (
                        <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} rounded-xl blur-md opacity-30`} />
                      )}
                      <Icon className={`h-6 w-6 relative transition-colors duration-300 ${
                        active ? item.activeColor : 'text-gray-600'
                      }`} strokeWidth={active ? 3 : 2.5} />
                      {item.badge && item.badge > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold shadow-sm">
                          {item.badge > 9 ? '9+' : item.badge}
                        </span>
                      )}
                    </div>
                    <span className={`text-xs font-bold mt-1 transition-colors duration-300 ${
                      active ? item.activeColor : 'text-gray-600'
                    }`}>{item.label}</span>
                  </>
                )}
              </Link>
            );
          })}

          {/* More Button */}
          <button
            onClick={toggleMobileMenu}
            className="relative flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 hover:bg-gray-50"
          >
            <div className={`relative transition-all duration-300 transform active:scale-95 hover:scale-105`}>
              <Grid3X3 className="h-6 w-6 text-gray-600" strokeWidth={2.5} />
            </div>
            <span className="text-xs font-bold mt-1 text-gray-600">More</span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed bottom-16 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200/50 shadow-2xl z-50 md:hidden rounded-t-3xl">
            <div className="p-4">
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
              <div className="grid grid-cols-3 gap-4">
                {(user ? secondaryBottomNavLoggedIn : secondaryBottomNavLoggedOut).map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.to);
                  
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-300 ${
                        active ? item.activeBg : item.hoverBg
                      }`}
                    >
                      <div className={`relative transition-all duration-300 transform active:scale-95 ${
                        active ? 'scale-110' : 'hover:scale-105'
                      }`}>
                        {active && (
                          <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} rounded-xl blur-md opacity-30`} />
                        )}
                        <Icon className={`h-8 w-8 relative transition-colors duration-300 ${
                          active ? item.activeColor : 'text-gray-600'
                        }`} strokeWidth={active ? 3 : 2.5} />
                      </div>
                      <span className={`text-xs font-bold mt-2 transition-colors duration-300 ${
                        active ? item.activeColor : 'text-gray-600'
                      }`}>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add padding to content to account for fixed bottom nav on mobile */}
      <div className="md:hidden h-16" />
    </>
  );
}

export default Header;