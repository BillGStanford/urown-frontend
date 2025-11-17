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

  const primaryBottomNavLoggedIn = useMemo(() => [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/browse', icon: Compass, label: 'Explore' },
    { to: '/write', icon: PenTool, label: 'Write', isPrimary: true },
    { to: '/notifications', icon: Bell, label: 'Alerts', badge: unreadCount },
    { to: '/library', icon: Library, label: 'Library' }
  ], [unreadCount]);

  const secondaryBottomNavLoggedIn = useMemo(() => [
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
    { to: '/ideology-quiz', icon: Sparkles, label: 'Quiz' },
    { to: '/leaderboard', icon: Trophy, label: 'Ranks' }
  ], []);

  const secondaryBottomNavLoggedOut = useMemo(() => [
    { to: '/about', icon: Info, label: 'About' },
    { to: '/contact', icon: Mail, label: 'Contact' },
    { to: '/partners', icon: Globe, label: 'Partners' },
    { to: '/redflagged', icon: Flag, label: 'RedFlagged' }
  ], []);

  const sidebarNavItems = useMemo(() => {
    const items = [
      { to: '/browse', icon: Search, label: 'Browse' },
      { to: '/ideology-quiz', icon: Sparkles, label: 'Ideology Quiz', isNew: true },
      { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
      { to: '/about', icon: Info, label: 'About' },
      { to: '/partners', icon: Globe, label: 'Partners' },
      { to: '/contact', icon: Mail, label: 'Contact' },
      { to: '/redflagged', icon: Flag, label: 'RedFlagged' }
    ];
    
    if (user) {
      items.push(
        { to: '/library', icon: BookOpen, label: 'Library' },
        { to: `/user/${encodeURIComponent(user.display_name)}`, icon: User, label: 'Profile' },
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/settings', icon: Settings, label: 'Settings' }
      );
    }
    
    if (isEditorialOrAdmin) {
      items.push({ to: '/editorial', icon: FileText, label: 'Editorial Board' });
    }
    
    if (isAdmin) {
      items.push(
        { to: '/admin', icon: Shield, label: 'Admin Panel' },
        { to: '/admin/reported-articles', icon: FileText, label: 'View Reports' }
      );
    }
    
    return items;
  }, [user, isEditorialOrAdmin, isAdmin]);

  return (
    <>
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 hidden md:block"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside 
        ref={sidebarRef}
        className={`fixed left-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out z-50 w-72 hidden md:block ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ top: '64px' }}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          <nav className="py-4 px-3">
            <div className="space-y-1">
              {sidebarNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.to);
                
                return (
                  <Link 
                    key={item.to}
                    to={item.to} 
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors font-bold ${
                      active 
                        ? 'bg-orange-50 text-orange-600' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={closeSidebar}
                  >
                    <Icon className="h-5 w-5" strokeWidth={2} />
                    <span className="text-sm">{item.label}</span>
                    {item.isNew && (
                      <span className="ml-auto px-2 py-0.5 text-xs font-bold bg-orange-100 text-orange-600 rounded">
                        NEW
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {user && (
            <>
              <div className="my-2 h-px bg-gray-200 mx-3" />
              <div className="py-2 px-3">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-bold"
                >
                  <LogOut className="h-5 w-5" strokeWidth={2} />
                  <span className="text-sm">Log out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* Top Header */}
      <header className={`sticky top-0 z-40 transition-all duration-200 ${
        scrolled 
          ? 'bg-white shadow-sm border-b border-gray-200' 
          : 'bg-white border-b border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSidebar}
                data-sidebar-toggle
                className="hidden md:flex p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
                aria-expanded={isSidebarOpen}
              >
                <Menu className="h-5 w-5" strokeWidth={2} />
              </button>

              <Link to="/" className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <Flame className="h-5 w-5 text-white" />
                </div>
                <div className="hidden sm:block">
                  <div className="text-xl font-black text-gray-900">UROWN</div>
                  <div className="text-xs text-gray-500 font-bold -mt-0.5">Your Voice Matters</div>
                </div>
              </Link>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  {/* Notifications */}
                  <Link 
                    to="/notifications" 
                    className="hidden sm:flex relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Notifications"
                  >
                    <Bell className="h-5 w-5 text-gray-600" strokeWidth={2} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>

                  {/* Write Button */}
                  <Link 
                    to="/write" 
                    className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-black text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors"
                  >
                    <PenTool className="h-4 w-4" strokeWidth={2} />
                    <span>Write</span>
                  </Link>

                  {/* Browse Button */}
                  <Link 
                    to="/browse" 
                    className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-black text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Compass className="h-4 w-4" strokeWidth={2} />
                    <span>Browse</span>
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
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white text-sm font-black">
                        {user.display_name.charAt(0).toUpperCase()}
                      </div>
                      <span className="hidden lg:block max-w-[100px] truncate font-bold text-gray-900 text-sm">
                        {user.display_name}
                      </span>
                      <ChevronDown className={`hidden lg:block h-4 w-4 text-gray-500 transition-transform ${
                        isUserDropdownOpen ? 'rotate-180' : ''
                      }`} strokeWidth={2} />
                    </button>

                    {isUserDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                        <div className="py-1">
                          <Link
                            to={`/user/${encodeURIComponent(user.display_name)}`}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50"
                            onClick={() => setIsUserDropdownOpen(false)}
                          >
                            <User className="h-4 w-4" strokeWidth={2} />
                            <span>Profile</span>
                          </Link>

                          <Link
                            to="/dashboard"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50"
                            onClick={() => setIsUserDropdownOpen(false)}
                          >
                            <LayoutDashboard className="h-4 w-4" strokeWidth={2} />
                            <span>Dashboard</span>
                          </Link>

                          <Link
                            to="/settings"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50"
                            onClick={() => setIsUserDropdownOpen(false)}
                          >
                            <Settings className="h-4 w-4" strokeWidth={2} />
                            <span>Settings</span>
                          </Link>

                          {isEditorialOrAdmin && (
                            <>
                              <div className="my-1 h-px bg-gray-200" />
                              <Link
                                to="/editorial"
                                className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50"
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
                              className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50"
                              onClick={() => setIsUserDropdownOpen(false)}
                            >
                              <Shield className="h-4 w-4" strokeWidth={2} />
                              <span>Admin Panel</span>
                            </Link>
                          )}

                          <div className="my-1 h-px bg-gray-200" />

                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 text-left"
                          >
                            <LogOut className="h-4 w-4" strokeWidth={2} />
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
                    className="px-4 py-2 text-sm font-black text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Log in
                  </Link>
                  <Link 
                    to="/signup" 
                    className="px-4 py-2 text-sm font-black text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-200">
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
                  <div className="flex flex-col items-center">
                    <div className="bg-orange-500 p-2.5 rounded-xl">
                      <Icon className="h-5 w-5 text-white" strokeWidth={2.5} />
                    </div>
                    <span className="text-xs font-black mt-1 text-gray-700">Write</span>
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
                    <span className={`text-xs font-bold mt-1 ${active ? 'text-orange-500' : 'text-gray-600'}`}>
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
            <span className="text-xs font-bold mt-1 text-gray-600">More</span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden rounded-t-2xl">
            <div className="p-4">
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
              <div className="grid grid-cols-3 gap-3">
                {(user ? secondaryBottomNavLoggedIn : secondaryBottomNavLoggedOut).map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.to);
                  
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex flex-col items-center justify-center p-4 rounded-lg ${
                        active ? 'bg-orange-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`h-6 w-6 ${active ? 'text-orange-500' : 'text-gray-600'}`} strokeWidth={2} />
                      <span className={`text-xs font-bold mt-2 ${active ? 'text-orange-500' : 'text-gray-700'}`}>
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      <div className="md:hidden h-16" />
    </>
  );
}

export default Header;