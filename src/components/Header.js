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
  Globe,
  Sparkles,
  Info
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
    <header className={`sticky top-0 z-50 transition-all duration-500 ${
      scrolled 
        ? 'bg-white/90 backdrop-blur-xl shadow-xl border-b border-gray-100' 
        : 'bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Layout */}
        <div className="hidden lg:flex items-center justify-between py-4">
          {/* Left Navigation */}
          <nav className="flex items-center space-x-2">
            <Link 
              to="/browse" 
              className="group relative flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:text-orange-600 transition-all duration-300 rounded-2xl hover:bg-orange-50"
            >
              <Search className="h-4 w-4" />
              <span>Browse</span>
              <div className="absolute inset-0 rounded-2xl bg-orange-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            </Link>
            <Link 
              to="/about" 
              className="group relative flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:text-orange-600 transition-all duration-300 rounded-2xl hover:bg-orange-50"
            >
              <Info className="h-4 w-4" />
              <span>About</span>
              <div className="absolute inset-0 rounded-2xl bg-orange-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            </Link>
            <Link 
              to="/partners" 
              className="group relative flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:text-orange-600 transition-all duration-300 rounded-2xl hover:bg-orange-50"
            >
              <Globe className="h-4 w-4" />
              <span>Partners</span>
              <div className="absolute inset-0 rounded-2xl bg-orange-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            </Link>
            <Link 
              to="/contact" 
              className="group relative flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:text-orange-600 transition-all duration-300 rounded-2xl hover:bg-orange-50"
            >
              <Mail className="h-4 w-4" />
              <span>Contact</span>
              <div className="absolute inset-0 rounded-2xl bg-orange-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            </Link>
          </nav>

          {/* Centered Logo - Now serves as the home button */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <Link to="/" className="group flex flex-col items-center">
              <div className="relative flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <span className="text-4xl font-black bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent group-hover:from-orange-600 group-hover:via-red-600 group-hover:to-pink-600 transition-all duration-300 tracking-tight">
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
                  className="group relative flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-2xl transition-all duration-300"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                  <div className="absolute inset-0 rounded-2xl bg-orange-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                </Link>

                <Link 
                  to="/write" 
                  className="group relative flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <PenTool className="h-4 w-4" />
                  <span>Write</span>
                  <div className="absolute inset-0 rounded-2xl bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                </Link>

                {/* Navigation Dropdown - For Editorial Board and Admins */}
                {isEditorialOrAdmin && (
                  <div className="relative" ref={navDropdownRef}>
                    <button
                      onClick={toggleNavDropdown}
                      className="group relative p-2.5 rounded-2xl text-gray-700 hover:text-orange-600 hover:bg-orange-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                      aria-expanded={isNavDropdownOpen}
                      aria-haspopup="true"
                      aria-label="Navigation menu"
                    >
                      <Menu className="h-5 w-5" />
                      <div className="absolute inset-0 rounded-2xl bg-orange-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    </button>
                    {isNavDropdownOpen && (
                      <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-dropdown">
                        <div className="py-3">
                          <Link
                            to="/editorial"
                            className="group flex items-center gap-3 px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-orange-50 transition-all duration-200"
                            onClick={() => setIsNavDropdownOpen(false)}
                            role="menuitem"
                          >
                            <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                              <FileText className="h-4 w-4 text-blue-600" />
                            </div>
                            <span>Editorial Board</span>
                          </Link>
                          {isAdmin && (
                            <>
                              <div className="mx-5 my-2 h-px bg-gray-100"></div>
                              <Link
                                to="/admin"
                                className="group flex items-center gap-3 px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-red-50 transition-all duration-200"
                                onClick={() => setIsNavDropdownOpen(false)}
                                role="menuitem"
                              >
                                <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center group-hover:bg-red-200 transition-colors">
                                  <Shield className="h-4 w-4 text-red-600" />
                                </div>
                                <span>Admin Panel</span>
                              </Link>
                              <Link
                                to="/admin/reported-articles"
                                className="group flex items-center gap-3 px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-red-50 transition-all duration-200"
                                onClick={() => setIsNavDropdownOpen(false)}
                                role="menuitem"
                              >
                                <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center group-hover:bg-red-200 transition-colors">
                                  <FileText className="h-4 w-4 text-red-600" />
                                </div>
                                <span>Reported Articles</span>
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
                    className="group relative flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                    aria-expanded={isUserDropdownOpen}
                    aria-haspopup="true"
                    aria-label="User menu"
                  >
                    <div className="relative">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
                        {user.display_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <span className="max-w-[120px] truncate">{user.display_name}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                    <div className="absolute inset-0 rounded-2xl bg-orange-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  </button>
                  {isUserDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-72 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-dropdown">
                      <div className="p-2">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-900">Account</p>
                        </div>
                        <div className="py-2">
                          <Link
                            to={`/user/${encodeURIComponent(user.display_name)}`}
                            className="group flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-orange-50 transition-all duration-200 rounded-2xl mx-2"
                            onClick={() => setIsUserDropdownOpen(false)}
                            role="menuitem"
                          >
                            <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                              <User className="h-4 w-4 text-orange-600" />
                            </div>
                            <span>View Profile</span>
                          </Link>
                          <Link
                            to="/settings"
                            className="group flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-orange-50 transition-all duration-200 rounded-2xl mx-2"
                            onClick={() => setIsUserDropdownOpen(false)}
                            role="menuitem"
                          >
                            <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                              <Settings className="h-4 w-4 text-gray-600" />
                            </div>
                            <span>Settings</span>
                          </Link>
                          <div className="mx-4 my-2 h-px bg-gray-100"></div>
                          <button
                            onClick={handleLogout}
                            className="group flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-all duration-200 rounded-2xl mx-2"
                            role="menuitem"
                          >
                            <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center group-hover:bg-red-200 transition-colors">
                              <LogOut className="h-4 w-4 text-red-600" />
                            </div>
                            <span>Logout</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="group relative px-5 py-2.5 text-sm font-semibold text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-2xl transition-all duration-300"
                >
                  <span>Login</span>
                  <div className="absolute inset-0 rounded-2xl bg-orange-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                </Link>
                <Link 
                  to="/signup" 
                  className="group relative px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <span>Sign Up</span>
                  <div className="absolute inset-0 rounded-2xl bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile/Tablet Layout */}
        <div className="lg:hidden flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="group flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-black bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent tracking-tight">
                  UROWN
                </span>
                <p className="text-xs text-gray-500 font-medium tracking-wide">
                  Your Voice Matters
                </p>
              </div>
            </Link>
          </div>
          <button
            onClick={toggleMobileMenu}
            className="p-3 rounded-2xl text-gray-700 hover:text-orange-600 hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <nav className="lg:hidden pb-6 bg-white/95 backdrop-blur-xl rounded-3xl mt-4 border border-gray-100 shadow-2xl animate-slide-down">
            <div className="flex flex-col space-y-2 p-4">
              <Link 
                to="/browse" 
                className="group flex items-center gap-3 text-sm font-semibold text-gray-700 hover:text-orange-600 hover:bg-orange-50 py-3 px-4 rounded-2xl transition-all duration-300"
                onClick={closeMobileMenu}
              >
                <Search className="h-5 w-5" />
                <span>Browse</span>
              </Link>
              <Link 
                to="/about" 
                className="group flex items-center gap-3 text-sm font-semibold text-gray-700 hover:text-orange-600 hover:bg-orange-50 py-3 px-4 rounded-2xl transition-all duration-300"
                onClick={closeMobileMenu}
              >
                <Info className="h-5 w-5" />
                <span>About</span>
              </Link>
              <Link 
                to="/partners" 
                className="group flex items-center gap-3 text-sm font-semibold text-gray-700 hover:text-orange-600 hover:bg-orange-50 py-3 px-4 rounded-2xl transition-all duration-300"
                onClick={closeMobileMenu}
              >
                <Globe className="h-5 w-5" />
                <span>Partners</span>
              </Link>
              <Link 
                to="/contact" 
                className="group flex items-center gap-3 text-sm font-semibold text-gray-700 hover:text-orange-600 hover:bg-orange-50 py-3 px-4 rounded-2xl transition-all duration-300"
                onClick={closeMobileMenu}
              >
                <Mail className="h-5 w-5" />
                <span>Contact</span>
              </Link>
              
              {user ? (
                <>
                  <div className="mx-4 my-3 h-px bg-gray-100"></div>
                  
                  <Link 
                    to="/dashboard" 
                    className="group flex items-center gap-3 text-sm font-semibold text-gray-700 hover:text-orange-600 hover:bg-orange-50 py-3 px-4 rounded-2xl transition-all duration-300"
                    onClick={closeMobileMenu}
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                  <Link 
                    to="/write" 
                    className="group flex items-center gap-3 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-red-500 py-3 px-4 rounded-2xl transition-all duration-300 shadow-lg"
                    onClick={closeMobileMenu}
                  >
                    <PenTool className="h-5 w-5" />
                    <span>Write Article</span>
                  </Link>
                  
                  {isEditorialOrAdmin && (
                    <>
                      <div className="mx-4 my-3 h-px bg-gray-100"></div>
                      <Link 
                        to="/editorial" 
                        className="group flex items-center gap-3 text-sm font-semibold text-blue-600 hover:bg-blue-50 py-3 px-4 rounded-2xl transition-all duration-300"
                        onClick={closeMobileMenu}
                      >
                        <FileText className="h-5 w-5" />
                        <span>Editorial Board</span>
                      </Link>
                    </>
                  )}
                  
                  {isAdmin && (
                    <>
                      <Link 
                        to="/admin" 
                        className="group flex items-center gap-3 text-sm font-semibold text-red-600 hover:bg-red-50 py-3 px-4 rounded-2xl transition-all duration-300"
                        onClick={closeMobileMenu}
                      >
                        <Shield className="h-5 w-5" />
                        <span>Admin Panel</span>
                      </Link>
                      <Link 
                        to="/admin/reported-articles"
                        className="group flex items-center gap-3 text-sm font-semibold text-red-600 hover:bg-red-50 py-3 px-4 rounded-2xl transition-all duration-300"
                        onClick={closeMobileMenu}
                      >
                        <FileText className="h-5 w-5" />
                        <span>Reported Articles</span>
                      </Link>
                    </>
                  )}
                  
                  <div className="mx-4 my-3 h-px bg-gray-100"></div>
                  
                  {/* User Profile Section in Mobile Menu */}
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-2xl border border-orange-100">
                    <Link
                      to={`/user/${encodeURIComponent(user.display_name)}`}
                      className="flex items-center gap-3 text-sm font-semibold text-gray-900 hover:text-orange-600 transition-colors"
                      onClick={closeMobileMenu}
                    >
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
                          {user.display_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div>
                        <p className="font-semibold">{user.display_name}</p>
                        <p className="text-xs text-gray-500">View Profile</p>
                      </div>
                    </Link>
                  </div>
                  
                  <Link
                    to="/settings"
                    className="group flex items-center gap-3 text-sm font-semibold text-gray-700 hover:text-orange-600 hover:bg-orange-50 py-3 px-4 rounded-2xl transition-all duration-300"
                    onClick={closeMobileMenu}
                  >
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      closeMobileMenu();
                    }}
                    className="group flex items-center gap-3 w-full text-left text-sm font-semibold text-red-600 hover:bg-red-50 py-3 px-4 rounded-2xl transition-all duration-300"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="mx-4 my-3 h-px bg-gray-100"></div>
                  <Link 
                    to="/login" 
                    className="group flex items-center justify-center gap-3 text-sm font-semibold text-gray-700 hover:text-orange-600 hover:bg-orange-50 py-3 px-4 rounded-2xl transition-all duration-300"
                    onClick={closeMobileMenu}
                  >
                    <User className="h-5 w-5" />
                    <span>Login</span>
                  </Link>
                  <Link 
                    to="/signup" 
                    className="group flex items-center justify-center gap-3 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-red-500 py-3 px-4 rounded-2xl transition-all duration-300 shadow-lg"
                    onClick={closeMobileMenu}
                  >
                    <User className="h-5 w-5" />
                    <span>Sign Up</span>
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
            max-height: 0;
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1);
            max-height: 1000px;
          }
        }
        .animate-dropdown {
          animation: dropdown 0.3s ease-out forwards;
        }
        .animate-slide-down {
          animation: slide-down 0.4s ease-out forwards;
        }
      `}</style>
    </header>
  );
}

export default Header;