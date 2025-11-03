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
  Bell
} from 'lucide-react';

function Header({ user, onLogout }) {
  const { logout } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
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

const fetchUnreadCount = async () => {
  try {
    // FIXED: Remove /api prefix
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
      const interval = setInterval(fetchUnreadCount, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-200 ${
      scrolled 
        ? 'bg-white shadow-lg border-b-2 border-orange-200' 
        : 'bg-white border-b border-gray-100'
    }`}>
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Layout */}
        <div className="hidden lg:flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-200">
              <Flame className="h-7 w-7 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-black bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent tracking-tight">
                UROWN
              </span>
              <span className="text-xs text-gray-600 font-bold tracking-wider uppercase -mt-1">
                Your Voice Matters
              </span>
            </div>
          </Link>

          {/* Center Navigation */}
          <nav className="flex items-center gap-2 absolute left-1/2 transform -translate-x-1/2">
            <Link 
              to="/browse" 
              className="group flex flex-col items-center gap-1 px-5 py-2 hover:bg-orange-50 rounded-xl transition-all duration-200"
            >
              <Search className="h-6 w-6 text-orange-600" strokeWidth={2.5} />
              <span className="text-xs font-bold text-gray-700 group-hover:text-orange-600 transition-colors">Browse</span>
            </Link>
            <Link 
              to="/about" 
              className="group flex flex-col items-center gap-1 px-5 py-2 hover:bg-blue-50 rounded-xl transition-all duration-200"
            >
              <Info className="h-6 w-6 text-blue-600" strokeWidth={2.5} />
              <span className="text-xs font-bold text-gray-700 group-hover:text-blue-600 transition-colors">About</span>
            </Link>
            <Link 
              to="/partners" 
              className="group flex flex-col items-center gap-1 px-5 py-2 hover:bg-green-50 rounded-xl transition-all duration-200"
            >
              <Globe className="h-6 w-6 text-green-600" strokeWidth={2.5} />
              <span className="text-xs font-bold text-gray-700 group-hover:text-green-600 transition-colors">Partners</span>
            </Link>
            <Link 
              to="/contact" 
              className="group flex flex-col items-center gap-1 px-5 py-2 hover:bg-purple-50 rounded-xl transition-all duration-200"
            >
              <Mail className="h-6 w-6 text-purple-600" strokeWidth={2.5} />
              <span className="text-xs font-bold text-gray-700 group-hover:text-purple-600 transition-colors">Contact</span>
            </Link>
          </nav>

          {/* Right Navigation */}
          <div className="flex items-center gap-3 shrink-0">
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
                  to="/notifications" 
                  className="group flex flex-col items-center gap-1 px-5 py-2 hover:bg-amber-50 rounded-xl transition-all duration-200 relative"
                >
                  <Bell className="h-6 w-6 text-amber-600" strokeWidth={2.5} />
                  <span className="text-xs font-bold text-gray-700 group-hover:text-amber-600 transition-colors">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                <Link 
                  to="/write" 
                  className="flex items-center gap-2 px-6 py-3 text-base font-black text-white bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
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
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border-2 border-gray-100 overflow-hidden">
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
                        <Link
                          to="/settings"
                          className="flex items-center gap-3 px-5 py-3 text-sm font-bold text-gray-800 hover:bg-gray-100 transition-all duration-150"
                          onClick={() => setIsUserDropdownOpen(false)}
                          role="menuitem"
                        >
                          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                            <Settings className="h-5 w-5 text-gray-600" strokeWidth={2.5} />
                          </div>
                          <span>Settings</span>
                        </Link>
                        {isEditorialOrAdmin && (
                          <>
                            <div className="my-2 mx-5 h-0.5 bg-gray-200"></div>
                            <Link
                              to="/editorial"
                              className="flex items-center gap-3 px-5 py-3 text-sm font-bold text-gray-800 hover:bg-blue-50 transition-all duration-150"
                              onClick={() => setIsUserDropdownOpen(false)}
                              role="menuitem"
                            >
                              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
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
                              className="flex items-center gap-3 px-5 py-3 text-sm font-bold text-gray-800 hover:bg-red-50 transition-all duration-150"
                              onClick={() => setIsUserDropdownOpen(false)}
                              role="menuitem"
                            >
                              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                                <Shield className="h-5 w-5 text-red-600" strokeWidth={2.5} />
                              </div>
                              <span>Admin Panel</span>
                            </Link>
                            <Link
                              to="/admin/reported-articles"
                              className="flex items-center gap-3 px-5 py-3 text-sm font-bold text-gray-800 hover:bg-red-50 transition-all duration-150"
                              onClick={() => setIsUserDropdownOpen(false)}
                              role="menuitem"
                            >
                              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                                <FileText className="h-5 w-5 text-red-600" strokeWidth={2.5} />
                              </div>
                              <span>Reports</span>
                            </Link>
                          </>
                        )}
                        <div className="my-2 mx-5 h-0.5 bg-gray-200"></div>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full text-left px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-all duration-150"
                          role="menuitem"
                        >
                          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
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
                  className="px-6 py-3 text-base font-black text-gray-800 hover:bg-gray-100 rounded-2xl transition-all duration-200"
                >
                  Log in
                </Link>
                <Link 
                  to="/signup" 
                  className="px-6 py-3 text-base font-black text-white bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
                >
                  Sign up
                </Link>
              </>
            )}
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
          <nav className="lg:hidden pb-4 border-t-2 border-gray-100 bg-gradient-to-b from-white to-gray-50">
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
                    to="/write" 
                    className="flex items-center gap-4 text-base font-black text-white bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 py-4 px-5 rounded-2xl shadow-xl mx-3 justify-center transition-all duration-150"
                    onClick={closeMobileMenu}
                  >
                    <PenTool className="h-6 w-6" strokeWidth={3} />
                    <span>Write</span>
                  </Link>
                  
                  {/* User Profile Section in Mobile Menu */}
                  <div className="bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 mx-3 p-5 rounded-2xl border-2 border-orange-200">
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
                    className="flex items-center justify-center gap-3 text-base font-black text-white bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 py-4 px-5 rounded-2xl shadow-xl mx-3 transition-all duration-150"
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
  );
}

export default Header;