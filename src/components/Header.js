import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Mail
} from 'lucide-react';

function Header({ user, onLogout }) {
  const { logout } = useUser();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isNavDropdownOpen, setIsNavDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef(null);
  const navDropdownRef = useRef(null);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);

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

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      // Focus on the input when opening the search
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      // Clear search when closing
      setSearchQuery('');
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim().length > 0) {
      try {
        const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setSearchSuggestions(data.suggestions);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Error fetching search suggestions:', error);
      }
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    navigate(`/browse?q=${encodeURIComponent(suggestion)}`);
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchSuggestions([]);
    setShowSuggestions(false);
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
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className={`sticky top-0 z-50 bg-white transition-all duration-300 ${
      scrolled ? 'shadow-2xl border-b-2' : 'shadow-lg border-b-4'
    } border-black`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Desktop Layout */}
        <div className="hidden lg:flex items-center justify-between py-4">
          {/* Left Navigation */}
          <nav className="flex items-center space-x-2">
            {/* Search Bar */}
            <div className="relative" ref={searchRef}>
              {isSearchOpen ? (
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search by title, author, or keywords..."
                    className="w-64 px-4 py-2 pr-10 text-sm border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                  <button
                    type="button"
                    onClick={toggleSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  {/* Search Suggestions Dropdown */}
                  {showSuggestions && searchSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-black rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                      {searchSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        >
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  )}
                </form>
              ) : (
                <button
                  onClick={toggleSearch}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  aria-label="Open search"
                >
                  <Search className="h-5 w-5" />
                </button>
              )}
            </div>
            
            <Link 
              to="/browse" 
              className="group relative px-4 py-2 text-sm font-bold text-black hover:text-white transition-all duration-300 uppercase tracking-wide overflow-hidden rounded-lg"
            >
              <span className="absolute inset-0 bg-black transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              <span className="relative flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Browse
              </span>
            </Link>
            <Link 
              to="/contact" 
              className="group relative px-4 py-2 text-sm font-bold text-black hover:text-white transition-all duration-300 uppercase tracking-wide overflow-hidden rounded-lg"
            >
              <span className="absolute inset-0 bg-black transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              <span className="relative flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Contact
              </span>
            </Link>
          </nav>

          {/* Centered Logo */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <Link to="/" className="group flex flex-col items-center">
              <div className="relative">
                <span className="text-5xl font-black text-black group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-yellow-500 group-hover:via-orange-500 group-hover:to-red-500 group-hover:bg-clip-text transition-all duration-500 tracking-tighter">
                  UROWN
                </span>
                <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              </div>
              <span className="text-[10px] text-gray-600 mt-2 font-semibold uppercase tracking-[0.2em] group-hover:text-black transition-colors duration-300">
                Your Opinion • Your Platform
              </span>
            </Link>
          </div>

          {/* Right Navigation */}
          <div className="flex items-center space-x-2">
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="group relative px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-gray-900 to-black hover:from-black hover:to-gray-900 rounded-lg transition-all duration-300 uppercase tracking-wider shadow-md hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <span className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </span>
                </Link>

                <Link 
                  to="/write" 
                  className="group relative px-4 py-2.5 text-xs font-bold text-black bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 rounded-lg transition-all duration-300 uppercase tracking-wider shadow-md hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <span className="flex items-center gap-2">
                    <PenTool className="h-4 w-4" />
                    Write
                  </span>
                </Link>

                {/* Navigation Dropdown */}
                <div className="relative" ref={navDropdownRef}>
                  <button
                    onClick={toggleNavDropdown}
                    className="p-2.5 rounded-lg bg-gradient-to-r from-gray-900 to-black text-white hover:from-black hover:to-gray-900 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 shadow-md hover:shadow-xl transform hover:-translate-y-0.5"
                    aria-expanded={isNavDropdownOpen}
                    aria-haspopup="true"
                    aria-label="Navigation menu"
                  >
                    {isNavDropdownOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                  </button>
                  {isNavDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-dropdown">
                      <div className="py-2">
                        {(user.role === 'editorial-board' || user.role === 'admin' || user.role === 'super-admin') && (
                          <Link
                            to="/editorial"
                            className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50 transition-all duration-200"
                            onClick={() => setIsNavDropdownOpen(false)}
                            role="menuitem"
                          >
                            <FileText className="h-4 w-4" />
                            Editorial
                          </Link>
                        )}
                        {(user.role === 'admin' || user.role === 'super-admin') && (
                          <>
                            <Link
                              to="/admin"
                              className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-all duration-200"
                              onClick={() => setIsNavDropdownOpen(false)}
                              role="menuitem"
                            >
                              <Shield className="h-4 w-4" />
                              Admin
                            </Link>
                            <Link
                              to="/admin/reported-articles"
                              className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-all duration-200"
                              onClick={() => setIsNavDropdownOpen(false)}
                              role="menuitem"
                            >
                              <FileText className="h-4 w-4" />
                              Reported
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={toggleUserDropdown}
                    className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-gray-900 to-black hover:from-black hover:to-gray-900 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 uppercase tracking-wider shadow-md hover:shadow-xl transform hover:-translate-y-0.5"
                    aria-expanded={isUserDropdownOpen}
                    aria-haspopup="true"
                    aria-label="User menu"
                  >
                    <User className="h-4 w-4" />
                    <span className="max-w-[100px] truncate">{user.display_name}</span>
                    <ChevronDown className={`h-3 w-3 transition-transform duration-300 ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isUserDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-dropdown">
                      <div className="py-2">
                        <Link
                          to="/settings"
                          className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-900 hover:bg-gray-50 transition-all duration-200"
                          onClick={() => setIsUserDropdownOpen(false)}
                          role="menuitem"
                        >
                          <Settings className="h-4 w-4" />
                          Settings
                        </Link>
                        <div className="border-t border-gray-100 my-1"></div>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-all duration-200"
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
                  className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-gray-900 to-black hover:from-black hover:to-gray-900 rounded-lg transition-all duration-300 uppercase tracking-wider shadow-md hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <span className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Login
                  </span>
                </Link>
                <Link 
                  to="/signup" 
                  className="px-6 py-2.5 text-xs font-bold text-black bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 rounded-lg transition-all duration-300 uppercase tracking-wider shadow-md hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <span className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Sign Up
                  </span>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile/Tablet Layout */}
        <div className="lg:hidden flex items-center justify-between py-4">
          <div className="flex items-center">
            {/* Mobile Search */}
            <div className="relative mr-2" ref={searchRef}>
              {isSearchOpen ? (
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search..."
                    className="w-40 px-3 py-1 pr-8 text-sm border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                  <button
                    type="button"
                    onClick={toggleSearch}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  {/* Mobile Search Suggestions */}
                  {showSuggestions && searchSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-black rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                      {searchSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        >
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  )}
                </form>
              ) : (
                <button
                  onClick={toggleSearch}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  aria-label="Open search"
                >
                  <Search className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          
          <Link to="/" className="group flex flex-col items-center">
            <div className="relative">
              <span className="text-3xl sm:text-4xl font-black text-black group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-yellow-500 group-hover:via-orange-500 group-hover:to-red-500 group-hover:bg-clip-text transition-all duration-500 tracking-tighter">
                UROWN
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] text-gray-600 mt-1 font-semibold uppercase tracking-[0.15em] group-hover:text-black transition-colors duration-300">
              Your Opinion • Your Platform
            </span>
          </Link>
          <div className="flex-1 flex justify-end">
            <button
              onClick={toggleMobileMenu}
              className="p-3 rounded-xl bg-gradient-to-r from-gray-900 to-black text-white hover:from-black hover:to-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-300 shadow-lg"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <nav className="lg:hidden pb-4 bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-inner animate-slide-down mt-2 border-t-2 border-gray-100">
            <div className="flex flex-col space-y-1 p-2">
              <Link 
                to="/browse" 
                className="flex items-center gap-3 text-sm font-bold text-gray-900 hover:text-white hover:bg-gradient-to-r hover:from-gray-900 hover:to-black py-3 px-4 rounded-xl transition-all duration-200 uppercase tracking-wide"
                onClick={closeMobileMenu}
              >
                <FileText className="h-4 w-4" />
                Browse
              </Link>
              <Link 
                to="/contact" 
                className="flex items-center gap-3 text-sm font-bold text-gray-900 hover:text-white hover:bg-gradient-to-r hover:from-gray-900 hover:to-black py-3 px-4 rounded-xl transition-all duration-200 uppercase tracking-wide"
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
                    className="flex items-center gap-3 text-sm font-bold text-white bg-gradient-to-r from-gray-900 to-black hover:from-black hover:to-gray-900 py-3 px-4 rounded-xl transition-all duration-200 uppercase tracking-wide shadow-md"
                    onClick={closeMobileMenu}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link 
                    to="/write" 
                    className="flex items-center gap-3 text-sm font-bold text-black bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 py-3 px-4 rounded-xl transition-all duration-200 uppercase tracking-wide shadow-md"
                    onClick={closeMobileMenu}
                  >
                    <PenTool className="h-4 w-4" />
                    Write
                  </Link>
                  
                  {(user.role === 'editorial-board' || user.role === 'admin' || user.role === 'super-admin') && (
                    <>
                      <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-2"></div>
                      <Link 
                        to="/editorial" 
                        className="flex items-center gap-3 text-sm font-bold text-blue-600 hover:bg-blue-50 py-3 px-4 rounded-xl transition-all duration-200 uppercase tracking-wide"
                        onClick={closeMobileMenu}
                      >
                        <FileText className="h-4 w-4" />
                        Editorial
                      </Link>
                    </>
                  )}
                  
                  {(user.role === 'admin' || user.role === 'super-admin') && (
                    <>
                      <Link 
                        to="/admin" 
                        className="flex items-center gap-3 text-sm font-bold text-red-600 hover:bg-red-50 py-3 px-4 rounded-xl transition-all duration-200 uppercase tracking-wide"
                        onClick={closeMobileMenu}
                      >
                        <Shield className="h-4 w-4" />
                        Admin
                      </Link>
                      <Link 
                        to="/admin/reported-articles"
                        className="flex items-center gap-3 text-sm font-bold text-red-600 hover:bg-red-50 py-3 px-4 rounded-xl transition-all duration-200 uppercase tracking-wide"
                        onClick={closeMobileMenu}
                      >
                        <FileText className="h-4 w-4" />
                        Reported
                      </Link>
                    </>
                  )}
                  
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-2"></div>
                  
                  <div className="bg-gradient-to-r from-gray-900 to-black text-white px-4 py-2 rounded-xl">
                    <span className="text-xs font-bold flex items-center gap-2 uppercase tracking-wider">
                      <User className="h-4 w-4" />
                      {user.display_name}
                    </span>
                  </div>
                  
                  <Link
                    to="/settings"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200 uppercase tracking-wide"
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
                    className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 uppercase tracking-wide"
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
                    className="flex items-center justify-center gap-3 text-sm font-bold text-white bg-gradient-to-r from-gray-900 to-black hover:from-black hover:to-gray-900 py-3 px-4 rounded-xl transition-all duration-200 uppercase tracking-wide shadow-md"
                    onClick={closeMobileMenu}
                  >
                    <User className="h-4 w-4" />
                    Login
                  </Link>
                  <Link 
                    to="/signup" 
                    className="flex items-center justify-center gap-3 text-sm font-bold text-black bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 py-3 px-4 rounded-xl transition-all duration-200 uppercase tracking-wide shadow-md"
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
          animation: dropdown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-slide-down {
          animation: slide-down 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </header>
  );
}

export default Header;