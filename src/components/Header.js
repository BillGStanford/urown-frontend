// src/components/Header.js - UPDATED WITH SEARCH ICON
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
  Flag,
  Trophy,
  Home,
  Compass,
  Library,
  Grid3X3,
  X
} from 'lucide-react';

function Header({ user, onLogout }) {
  const { logout } = useUser();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
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

  const toggleSearch = useCallback(() => {
    setIsSearchOpen(prev => !prev);
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

  // Categorized sidebar navigation
  const sidebarCategories = useMemo(() => {
    const categories = [
      {
        title: 'Discover',
        items: [
          { to: '/', icon: Home, label: 'Home' },
          { to: '/browse', icon: Compass, label: 'Browse Articles' },
          { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
        ]
      },
      {
        title: 'Content',
        items: [
          { to: '/ebooks', icon: BookOpen, label: 'E-Books' },
          { to: '/library', icon: Library, label: 'My Library', requiresAuth: true },
        ]
      },
      {
        title: 'Tools',
        items: [
          { to: '/ideology-quiz', icon: Sparkles, label: 'Ideology Quiz' },
        ]
      },
      {
        title: 'Information',
        items: [
          { to: '/about', icon: Info, label: 'About Us' },
          { to: '/partners', icon: Globe, label: 'Partners' },
          { to: '/contact', icon: Mail, label: 'Contact' },
          { to: '/redflagged', icon: Flag, label: 'RedFlagged' },
        ]
      }
    ];

    if (user) {
      categories.push({
        title: 'Account',
        items: [
          { to: `/user/${encodeURIComponent(user.display_name)}`, icon: User, label: 'My Profile' },
          { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        ]
      });
    }

    if (isEditorialOrAdmin) {
      categories.push({
        title: 'Editorial',
        items: [
          { to: '/editorial', icon: FileText, label: 'Editorial Board' },
        ]
      });
    }

    if (isAdmin) {
      categories.push({
        title: 'Administration',
        items: [
          { to: '/admin', icon: Shield, label: 'Admin Panel' },
          { to: '/admin/reported-articles', icon: FileText, label: 'View Reports' },
        ]
      });
    }

    return categories.filter(cat => 
      cat.items.some(item => !item.requiresAuth || user)
    );
  }, [user, isEditorialOrAdmin, isAdmin]);

  const primaryBottomNavLoggedIn = useMemo(() => [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/browse', icon: Compass, label: 'Explore' },
    { to: '/write', icon: PenTool, label: 'Write', isPrimary: true },
    { to: '/notifications', icon: Bell, label: 'Alerts', badge: unreadCount },
    { to: '/library', icon: Library, label: 'Library' }
  ], [unreadCount]);

  const secondaryBottomNavLoggedIn = useMemo(() => [
    { to: '/ebooks', icon: BookOpen, label: 'E-Books' },
    { to: '/ideology-quiz', icon: Sparkles, label: 'Quiz' },
    { to: '/leaderboard', icon: Trophy, label: 'Ranks' },
    { to: '/about', icon: Info, label: 'About' },
    { to: '/contact', icon: Mail, label: 'Contact' },
    { to: '/partners', icon: Globe, label: 'Partners' },
    { to: '/redflagged', icon: Flag, label: 'RedFlagged' }
  ], []);

  const primaryBottomNavLoggedOut = useMemo(() => [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/browse', icon: Compass, label: 'Explore' },
    { to: '/ebooks', icon: BookOpen, label: 'E-Books' },
    { to: '/ideology-quiz', icon: Sparkles, label: 'Quiz' }
  ], []);

  const secondaryBottomNavLoggedOut = useMemo(() => [
    { to: '/leaderboard', icon: Trophy, label: 'Ranks' },
    { to: '/about', icon: Info, label: 'About' },
    { to: '/contact', icon: Mail, label: 'Contact' },
    { to: '/partners', icon: Globe, label: 'Partners' },
    { to: '/redflagged', icon: Flag, label: 'RedFlagged' }
  ], []);

  return (
    <>
      {/* Search Page */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsSearchOpen(false)}></div>
          <div className="absolute top-0 left-0 right-0 bg-white shadow-2xl transform transition-transform duration-300 ease-out translate-y-0">
            <div className="max-w-4xl mx-auto p-4">
              <form className="relative" onSubmit={(e) => {
                e.preventDefault();
                const query = e.target.elements.search.value;
                if (query.trim()) {
                  window.location.href = `/search/results?q=${encodeURIComponent(query)}`;
                }
              }}>
                <div className="flex items-center">
                  <Search className="absolute left-4 h-5 w-5 text-gray-400" />
                  <input
                    name="search"
                    type="text"
                    placeholder="Search for articles, ebooks, and authors..."
                    className="w-full pl-12 pr-12 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="absolute right-4 p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-40 hidden md:block backdrop-blur-sm"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside 
        ref={sidebarRef}
        className={`fixed left-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out z-50 w-80 hidden md:block shadow-xl ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ top: '64px' }}
      >
        <div className="flex flex-col h-full overflow-y-auto">

          <nav className="flex-1 py-4 px-4">
            {sidebarCategories.map((category, idx) => (
              <div key={category.title} className={idx > 0 ? 'mt-6' : ''}>
                <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {category.title}
                </h3>
                <div className="space-y-0.5">
                  {category.items.map((item) => {
                    if (item.requiresAuth && !user) return null;
                    
                    const Icon = item.icon;
                    const active = isActive(item.to);
                    
                    return (
                      <Link 
                        key={item.to}
                        to={item.to} 
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                          active 
                            ? 'bg-orange-50 text-orange-600 font-semibold' 
                            : 'text-gray-700 hover:bg-gray-50 font-medium'
                        }`}
                        onClick={closeSidebar}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" strokeWidth={active ? 2.5 : 2} />
                        <span className="text-sm">{item.label}</span>
                        {item.isNew && (
                          <span className="ml-auto px-2 py-0.5 text-[10px] font-bold bg-orange-500 text-white rounded uppercase tracking-wide">
                            New
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {user && (
            <div className="border-t border-gray-200 p-4">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-all font-medium"
              >
                <LogOut className="h-5 w-5" strokeWidth={2} />
                <span className="text-sm">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Top Header */}
      <header className={`sticky top-0 z-40 transition-all duration-200 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-gray-200' 
          : 'bg-white border-b border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              <button
                onClick={toggleSidebar}
                data-sidebar-toggle
                className="hidden md:flex p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
                aria-expanded={isSidebarOpen}
              >
                <Menu className="h-5 w-5" strokeWidth={2} />
              </button>

              <Link to="/" className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-md">
                  <Flame className="h-5 w-5 text-white" strokeWidth={2.5} />
                </div>
                <div className="hidden sm:block">
                  <div className="text-xl font-black text-gray-900 tracking-tight">UROWN</div>
                  <div className="text-[10px] text-gray-500 font-semibold -mt-1 tracking-wide uppercase">Your Voice Matters</div>
                </div>
              </Link>
            </div>

            {/* Center Section - Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-2">
              <Link 
                to="/browse" 
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Compass className="h-4 w-4" strokeWidth={2} />
                <span>Browse</span>
              </Link>
              
              <Link 
                to="/ebooks" 
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <BookOpen className="h-4 w-4" strokeWidth={2} />
                <span>E-Books</span>
              </Link>

              <Link 
                to="/library" 
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Library className="h-4 w-4" strokeWidth={2} />
                <span>Library</span>
              </Link>

              {/* Search Button */}
              <button
                onClick={toggleSearch}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Search"
              >
                <Search className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              {/* Search Button - Mobile */}
              <button
                onClick={toggleSearch}
                className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Search"
              >
                <Search className="h-5 w-5" strokeWidth={2} />
              </button>

              {user ? (
                <>
                  {/* Settings - Desktop */}
                  <Link 
                    to="/settings" 
                    className="hidden md:flex p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Settings"
                  >
                    <Settings className="h-5 w-5 text-gray-600" strokeWidth={2} />
                  </Link>

                  {/* Notifications */}
                  <Link 
                    to="/notifications" 
                    className="hidden sm:flex relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Notifications"
                  >
                    <Bell className="h-5 w-5 text-gray-600" strokeWidth={2} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>

                  {/* Write Button */}
                  <Link 
                    to="/write" 
                    className="hidden sm:flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-lg transition-all shadow-md hover:shadow-lg"
                  >
                    <PenTool className="h-4 w-4" strokeWidth={2.5} />
                    <span>Write</span>
                  </Link>

                  {/* User Menu */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={toggleUserDropdown}
                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      aria-expanded={isUserDropdownOpen}
                      aria-haspopup="true"
                      aria-label="User menu"
                    >
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
                        {user.display_name.charAt(0).toUpperCase()}
                      </div>
                      <span className="hidden lg:block max-w-[120px] truncate font-semibold text-gray-900 text-sm">
                        {user.display_name}
                      </span>
                      <ChevronDown className={`hidden lg:block h-4 w-4 text-gray-500 transition-transform ${
                        isUserDropdownOpen ? 'rotate-180' : ''
                      }`} strokeWidth={2} />
                    </button>

                    {isUserDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
                        {/* User Info Header */}
                        <div className="px-4 py-3 bg-gradient-to-r from-orange-50 to-red-50 border-b border-gray-100">
                          <p className="text-sm font-bold text-gray-900 truncate">{user.display_name}</p>
                          <p className="text-xs text-gray-600 truncate">{user.email}</p>
                        </div>

                        <div className="py-1">
                          <Link
                            to={`/user/${encodeURIComponent(user.display_name)}`}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setIsUserDropdownOpen(false)}
                          >
                            <User className="h-4 w-4" strokeWidth={2} />
                            <span>View Profile</span>
                          </Link>

                          <Link
                            to="/dashboard"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setIsUserDropdownOpen(false)}
                          >
                            <LayoutDashboard className="h-4 w-4" strokeWidth={2} />
                            <span>Dashboard</span>
                          </Link>

                          <Link
                            to="/settings"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setIsUserDropdownOpen(false)}
                          >
                            <Settings className="h-4 w-4" strokeWidth={2} />
                            <span>Settings</span>
                          </Link>

                          {isEditorialOrAdmin && (
                            <>
                              <div className="my-1 h-px bg-gray-200 mx-2" />
                              <Link
                                to="/editorial"
                                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                onClick={() => setIsUserDropdownOpen(false)}
                              >
                                <FileText className="h-4 w-4" strokeWidth={2} />
                                <span>Editorial Board</span>
                              </Link>
                            </>
                          )}

                          {isAdmin && (
                            <Link
                              to="/admin"
                              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                              onClick={() => setIsUserDropdownOpen(false)}
                            >
                              <Shield className="h-4 w-4" strokeWidth={2} />
                              <span>Admin Panel</span>
                            </Link>
                          )}

                          <div className="my-1 h-px bg-gray-200 mx-2" />

                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 text-left transition-colors"
                          >
                            <LogOut className="h-4 w-4" strokeWidth={2} />
                            <span>Sign Out</span>
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
                    className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/signup" 
                    className="px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-lg transition-all shadow-md hover:shadow-lg"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-200 shadow-2xl">
        <div className="flex items-center justify-around h-16 px-2">
          {(user ? primaryBottomNavLoggedIn : primaryBottomNavLoggedOut).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);
            
            return (
              <Link
                key={item.to}
                to={item.to}
                className="flex flex-col items-center justify-center flex-1 h-full"
              >
                {item.isPrimary ? (
                  <div className="flex flex-col items-center -mt-4">
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-2xl shadow-lg">
                      <Icon className="h-6 w-6 text-white" strokeWidth={2.5} />
                    </div>
                    <span className="text-xs font-bold mt-1.5 text-gray-700">Write</span>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <Icon className={`h-6 w-6 ${active ? 'text-orange-500' : 'text-gray-500'}`} strokeWidth={2} />
                      {item.badge && item.badge > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                          {item.badge > 9 ? '9+' : item.badge}
                        </span>
                      )}
                    </div>
                    <span className={`text-xs font-semibold mt-1 ${active ? 'text-orange-500' : 'text-gray-600'}`}>
                      {item.label}
                    </span>
                  </>
                )}
              </Link>
            );
          })}

          <button
            onClick={toggleMobileMenu}
            className="flex flex-col items-center justify-center flex-1 h-full"
          >
            <Grid3X3 className="h-6 w-6 text-gray-500" strokeWidth={2} />
            <span className="text-xs font-semibold mt-1 text-gray-600">More</span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed bottom-16 left-0 right-0 bg-white z-50 md:hidden rounded-t-3xl shadow-2xl max-h-[70vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">More Options</h3>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                {(user ? secondaryBottomNavLoggedIn : secondaryBottomNavLoggedOut).map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.to);
                  
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all ${
                        active ? 'bg-orange-50 shadow-sm' : 'hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`h-7 w-7 ${active ? 'text-orange-500' : 'text-gray-600'}`} strokeWidth={2} />
                      <span className={`text-xs font-semibold mt-2 text-center ${active ? 'text-orange-500' : 'text-gray-700'}`}>
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>

              {user && (
                <>
                  <div className="my-6 h-px bg-gray-200" />
                  <Link
                    to="/settings"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-4 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="h-6 w-6 text-gray-600" strokeWidth={2} />
                    <span className="text-sm font-semibold text-gray-700">Settings</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}

      <div className="md:hidden h-16" />
    </>
  );
}

export default Header;