import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
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
  Globe
} from 'lucide-react';

function Header({ user, onLogout }) {
  const { logout } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isNavDropdownOpen, setIsNavDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const navDropdownRef = useRef(null);

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
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200' 
        : 'bg-white shadow-md'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Layout */}
        <div className="hidden lg:flex items-center justify-between py-5">
          {/* Left Navigation */}
          <nav className="flex items-center space-x-1">
            <Link 
              to="/browse" 
              className="group relative px-5 py-2.5 text-sm font-semibold text-gray-700 hover:text-black transition-colors duration-200 rounded-lg hover:bg-gray-50"
            >
              <span className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Browse
              </span>
            </Link>
            <Link 
              to="/partners" 
              className="group relative px-5 py-2.5 text-sm font-semibold text-gray-700 hover:text-black transition-colors duration-200 rounded-lg hover:bg-gray-50"
            >
              <span className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Partners
              </span>
            </Link>
            <Link 
              to="/contact" 
              className="group relative px-5 py-2.5 text-sm font-semibold text-gray-700 hover:text-black transition-colors duration-200 rounded-lg hover:bg-gray-50"
            >
              <span className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Contact
              </span>
            </Link>
          </nav>

          {/* Centered Logo */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <Link to="/" className="group flex flex-col items-center">
              <div className="relative">
                <span className="text-5xl font-black bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent group-hover:from-orange-600 group-hover:via-red-600 group-hover:to-pink-600 transition-all duration-300 tracking-tight">
                  UROWN
                </span>
              </div>
              <span className="text-xs text-gray-500 mt-1.5 font-medium tracking-wide group-hover:text-gray-700 transition-colors duration-300">
                Your Voice Matters
              </span>
            </Link>
          </div>

          {/* Right Navigation */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:text-black hover:bg-gray-50 rounded-lg transition-all duration-200"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>

                <Link 
                  to="/write" 
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <PenTool className="h-4 w-4" />
                  Write
                </Link>

                {/* Navigation Dropdown - For Editorial Board and Admins */}
                {isEditorialOrAdmin && (
                  <div className="relative" ref={navDropdownRef}>
                    <button
                      onClick={toggleNavDropdown}
                      className="p-2.5 rounded-lg text-gray-700 hover:text-black hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                      aria-expanded={isNavDropdownOpen}
                      aria-haspopup="true"
                      aria-label="Navigation menu"
                    >
                      <Menu className="h-5 w-5" />
                    </button>
                    {isNavDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden animate-dropdown">
                        <div className="py-2">
                          <Link
                            to="/editorial"
                            className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors duration-150"
                            onClick={() => setIsNavDropdownOpen(false)}
                            role="menuitem"
                          >
                            <FileText className="h-4 w-4 text-blue-500" />
                            Editorial
                          </Link>
                          {isAdmin && (
                            <>
                              <div className="border-t border-gray-100 my-1"></div>
                              <Link
                                to="/admin"
                                className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors duration-150"
                                onClick={() => setIsNavDropdownOpen(false)}
                                role="menuitem"
                              >
                                <Shield className="h-4 w-4 text-red-500" />
                                Admin Panel
                              </Link>
                              <Link
                                to="/admin/reported-articles"
                                className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors duration-150"
                                onClick={() => setIsNavDropdownOpen(false)}
                                role="menuitem"
                              >
                                <FileText className="h-4 w-4 text-red-500" />
                                Reported Articles
                              </Link>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={toggleUserDropdown}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:text-black hover:bg-gray-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                    aria-expanded={isUserDropdownOpen}
                    aria-haspopup="true"
                    aria-label="User menu"
                  >
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                      {user.display_name.charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-[120px] truncate">{user.display_name}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isUserDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden animate-dropdown">
                      <div className="py-2">
                        {/* New Profile Link */}
                        <Link
                          to={`/user/${encodeURIComponent(user.display_name)}`}
                          className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors duration-150"
                          onClick={() => setIsUserDropdownOpen(false)}
                          role="menuitem"
                        >
                          <User className="h-4 w-4" />
                          View Profile
                        </Link>
                        <div className="border-t border-gray-100 my-1"></div>
                        <Link
                          to="/settings"
                          className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors duration-150"
                          onClick={() => setIsUserDropdownOpen(false)}
                          role="menuitem"
                        >
                          <Settings className="h-4 w-4" />
                          Settings
                        </Link>
                        <div className="border-t border-gray-100 my-1"></div>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors duration-150"
                          role="menuitem"
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
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
                  className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:text-black hover:bg-gray-50 rounded-lg transition-all duration-200"
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile/Tablet Layout */}
        <div className="lg:hidden flex items-center justify-between py-4">
          <div className="flex-1"></div>
          <Link to="/" className="group flex flex-col items-center">
            <div className="relative">
              <span className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent tracking-tight">
                UROWN
              </span>
            </div>
            <span className="text-[10px] text-gray-500 mt-1 font-medium tracking-wide">
              Your Voice Matters
            </span>
          </Link>
          <div className="flex-1 flex justify-end">
            <button
              onClick={toggleMobileMenu}
              className="p-3 rounded-xl text-gray-700 hover:text-black hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <nav className="lg:hidden pb-4 bg-gray-50 rounded-2xl animate-slide-down mt-2 border-t border-gray-200">
            <div className="flex flex-col space-y-1 p-2">
              <Link 
                to="/browse" 
                className="flex items-center gap-3 text-sm font-semibold text-gray-700 hover:text-black hover:bg-white py-3 px-4 rounded-xl transition-all duration-200"
                onClick={closeMobileMenu}
              >
                <Search className="h-4 w-4" />
                Browse
              </Link>
              <Link 
                to="/partners" 
                className="flex items-center gap-3 text-sm font-semibold text-gray-700 hover:text-black hover:bg-white py-3 px-4 rounded-xl transition-all duration-200"
                onClick={closeMobileMenu}
              >
                <Globe className="h-4 w-4" />
                Partners
              </Link>
              <Link 
                to="/contact" 
                className="flex items-center gap-3 text-sm font-semibold text-gray-700 hover:text-black hover:bg-white py-3 px-4 rounded-xl transition-all duration-200"
                onClick={closeMobileMenu}
              >
                <Mail className="h-4 w-4" />
                Contact
              </Link>
              
              {user ? (
                <>
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-2"></div>
                  
                  <Link 
                    to="/dashboard" 
                    className="flex items-center gap-3 text-sm font-semibold text-gray-700 hover:text-black hover:bg-white py-3 px-4 rounded-xl transition-all duration-200"
                    onClick={closeMobileMenu}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link 
                    to="/write" 
                    className="flex items-center gap-3 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-red-500 py-3 px-4 rounded-xl transition-all duration-200 shadow-sm"
                    onClick={closeMobileMenu}
                  >
                    <PenTool className="h-4 w-4" />
                    Write Article
                  </Link>
                  
                  {isEditorialOrAdmin && (
                    <>
                      <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-2"></div>
                      <Link 
                        to="/editorial" 
                        className="flex items-center gap-3 text-sm font-semibold text-blue-600 hover:bg-blue-50 py-3 px-4 rounded-xl transition-all duration-200"
                        onClick={closeMobileMenu}
                      >
                        <FileText className="h-4 w-4" />
                        Editorial
                      </Link>
                    </>
                  )}
                  
                  {isAdmin && (
                    <>
                      <Link 
                        to="/admin" 
                        className="flex items-center gap-3 text-sm font-semibold text-red-600 hover:bg-red-50 py-3 px-4 rounded-xl transition-all duration-200"
                        onClick={closeMobileMenu}
                      >
                        <Shield className="h-4 w-4" />
                        Admin Panel
                      </Link>
                      <Link 
                        to="/admin/reported-articles"
                        className="flex items-center gap-3 text-sm font-semibold text-red-600 hover:bg-red-50 py-3 px-4 rounded-xl transition-all duration-200"
                        onClick={closeMobileMenu}
                      >
                        <FileText className="h-4 w-4" />
                        Reported Articles
                      </Link>
                    </>
                  )}
                  
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-2"></div>
                  
                  {/* User Profile Section in Mobile Menu */}
                  <div className="bg-white px-4 py-3 rounded-xl border border-gray-200">
                    <Link
                      to={`/user/${encodeURIComponent(user.display_name)}`}
                      className="text-sm font-semibold flex items-center gap-2 text-gray-900 hover:text-orange-600 transition-colors"
                      onClick={closeMobileMenu}
                    >
                      <div className="h-6 w-6 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                        {user.display_name.charAt(0).toUpperCase()}
                      </div>
                      {user.display_name}
                    </Link>
                  </div>
                  
                  <Link
                    to="/settings"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:text-black hover:bg-white rounded-xl transition-all duration-200"
                    onClick={closeMobileMenu}
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      closeMobileMenu();
                    }}
                    className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-2"></div>
                  <Link 
                    to="/login" 
                    className="flex items-center justify-center gap-3 text-sm font-semibold text-gray-700 hover:text-black hover:bg-white py-3 px-4 rounded-xl transition-all duration-200"
                    onClick={closeMobileMenu}
                  >
                    <User className="h-4 w-4" />
                    Login
                  </Link>
                  <Link 
                    to="/signup" 
                    className="flex items-center justify-center gap-3 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-red-500 py-3 px-4 rounded-xl transition-all duration-200 shadow-sm"
                    onClick={closeMobileMenu}
                  >
                    <User className="h-4 w-4" />
                    Sign Up
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
            transform: translateY(-8px);
          }
          to { 
            opacity: 1; 
            transform: translateY(0);
          }
        }
        @keyframes slide-down {
          from { 
            opacity: 0; 
            transform: translateY(-10px);
            max-height: 0;
          }
          to { 
            opacity: 1; 
            transform: translateY(0);
            max-height: 1000px;
          }
        }
        .animate-dropdown {
          animation: dropdown 0.2s ease-out forwards;
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out forwards;
        }
      `}</style>
    </header>
  );
}

export default Header;