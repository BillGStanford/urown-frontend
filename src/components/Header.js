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
  Mail
} from 'lucide-react';

function Header({ user, onLogout }) {
  const { logout } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isNavDropdownOpen, setIsNavDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navDropdownRef = useRef(null);

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
    <header className="bg-white border-b-4 border-black py-3 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Desktop Layout */}
        <div className="hidden lg:flex items-center justify-center">
          <div className="flex items-center justify-between w-full max-w-6xl">
            {/* Left Navigation */}
            <nav className="flex items-center space-x-6">
              <Link 
                to="/browse" 
                className="text-sm font-bold text-black hover:text-gray-700 hover:underline flex items-center transition-colors duration-200 uppercase tracking-wider"
              >
                <Search className="mr-1 h-4 w-4" />
                Browse
              </Link>
              <Link to="/ebooks" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                E-Books
              </Link>
              <Link 
                to="/contact" 
                className="text-sm font-bold text-black hover:text-gray-700 hover:underline flex items-center transition-colors duration-200 uppercase tracking-wider"
              >
                <Mail className="mr-1 h-4 w-4" />
                Contact
              </Link>
            </nav>

            {/* Centered Logo with Branding */}
            <div className="flex flex-col items-center">
              <Link to="/" className="flex flex-col items-center group">
                <span className="text-5xl font-black text-black group-hover:text-gray-800 transition-all duration-300 tracking-tight">
                  UROWN
                </span>
                <span className="text-xs text-gray-700 mt-1 group-hover:text-gray-600 transition-all duration-300 uppercase tracking-widest">
                  Your Opinion. Your Platform. UROWN.
                </span>
              </Link>
            </div>

            {/* Right Navigation and Actions */}
            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  {/* Dashboard Button */}
                  <Link 
                    to="/dashboard" 
                    className="flex items-center text-xs font-bold text-white bg-black hover:bg-gray-800 px-3 py-2 rounded-md transition-all duration-200 hover:scale-105 uppercase tracking-wider"
                  >
                    <LayoutDashboard className="mr-1 h-4 w-4" />
                    Dashboard
                  </Link>

                  {/* Write Button */}
                  <Link 
                    to="/write" 
                    className="flex items-center text-xs font-bold text-white bg-black hover:bg-gray-800 px-3 py-2 rounded-md transition-all duration-200 hover:scale-105 uppercase tracking-wider"
                  >
                    <PenTool className="mr-1 h-4 w-4" />
                    Write
                  </Link>

                  {/* Navigation Dropdown */}
                  <div className="relative" ref={navDropdownRef}>
                    <button
                      onClick={toggleNavDropdown}
                      className="flex items-center text-white bg-black hover:bg-gray-800 px-3 py-2 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      aria-expanded={isNavDropdownOpen}
                      aria-haspopup="true"
                      aria-label="Navigation menu"
                    >
                      {isNavDropdownOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                    </button>
                    {isNavDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white border-2 border-gray-200 rounded-lg shadow-lg z-10 animate-dropdown">
                        {(user.role === 'editorial-board' || user.role === 'admin' || user.role === 'super-admin') && (
                          <Link
                            to="/editorial"
                            className="flex items-center px-4 py-2 text-sm font-bold text-blue-600 hover:bg-gray-100 transition-all duration-200"
                            onClick={() => setIsNavDropdownOpen(false)}
                            role="menuitem"
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            Editorial
                          </Link>
                        )}
                        {(user.role === 'admin' || user.role === 'super-admin') && (
                          <>
                            <Link
                              to="/admin"
                              className="flex items-center px-4 py-2 text-sm font-bold text-red-600 hover:bg-gray-100 transition-all duration-200"
                              onClick={() => setIsNavDropdownOpen(false)}
                              role="menuitem"
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              Admin
                            </Link>
                            <Link
                              to="/admin/reported-articles"
                              className="flex items-center px-4 py-2 text-sm font-bold text-red-600 hover:bg-gray-100 transition-all duration-200"
                              onClick={() => setIsNavDropdownOpen(false)}
                              role="menuitem"
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              Reported
                            </Link>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* User Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={toggleUserDropdown}
                      className="flex items-center text-xs font-bold text-white bg-black hover:bg-gray-800 px-3 py-2 rounded-md transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 uppercase tracking-wider"
                      aria-expanded={isUserDropdownOpen}
                      aria-haspopup="true"
                      aria-label="User menu"
                    >
                      <User className="mr-1 h-4 w-4" />
                      {user.display_name}
                      <ChevronDown className={`ml-1 h-3 w-3 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isUserDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-gray-200 rounded-lg shadow-lg z-10 animate-dropdown">
                        <Link
                          to="/settings"
                          className="flex items-center px-4 py-2 text-sm font-bold text-black hover:bg-gray-100 transition-all duration-200"
                          onClick={() => setIsUserDropdownOpen(false)}
                          role="menuitem"
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full text-left px-4 py-2 text-sm font-bold text-black hover:bg-gray-100 transition-all duration-200"
                          role="menuitem"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="flex items-center text-xs font-bold text-white bg-black hover:bg-gray-800 px-3 py-2 rounded-md transition-all duration-200 hover:scale-105 uppercase tracking-wider"
                  >
                    <User className="mr-1 h-4 w-4" />
                    Login
                  </Link>
                  <Link 
                    to="/signup" 
                    className="flex items-center text-xs font-bold text-white bg-black hover:bg-gray-800 px-3 py-2 rounded-md transition-all duration-200 hover:scale-105 uppercase tracking-wider"
                  >
                    <User className="mr-1 h-4 w-4" />
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Layout */}
        <div className="lg:hidden flex items-center justify-center">
          <div className="flex items-center justify-between w-full max-w-md">
            <div className="flex-1"></div>
            <div className="flex flex-col items-center">
              <Link to="/" className="flex flex-col items-center group">
                <span className="text-3xl font-black text-black group-hover:text-gray-800 transition-all duration-300 tracking-tight">
                  UROWN
                </span>
                <span className="text-xs text-gray-700 mt-1 group-hover:text-gray-600 transition-all duration-300 uppercase tracking-widest">
                  Your Opinion. Your Platform. UROWN.
                </span>
              </Link>
            </div>
            <div className="flex-1 flex justify-end">
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-md bg-black text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200"
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <nav className="lg:hidden mt-4 pb-4 bg-white border-t-2 border-gray-200 animate-slide-down">
            <div className="flex flex-col space-y-2">
              <Link 
                to="/browse" 
                className="flex items-center text-sm font-bold text-black hover:text-gray-700 hover:bg-gray-100 py-2 px-4 rounded-md transition-all duration-200 uppercase tracking-wider"
                onClick={closeMobileMenu}
              >
                <Search className="mr-2 h-4 w-4" />
                Browse
              </Link>
              <Link 
                to="/contact" 
                className="flex items-center text-sm font-bold text-black hover:text-gray-700 hover:bg-gray-100 py-2 px-4 rounded-md transition-all duration-200 uppercase tracking-wider"
                onClick={closeMobileMenu}
              >
                <Mail className="mr-2 h-4 w-4" />
                Contact
              </Link>
              {user ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="flex items-center text-sm font-bold text-white bg-black hover:bg-gray-800 py-2 px-4 rounded-md transition-all duration-200 uppercase tracking-wider"
                    onClick={closeMobileMenu}
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link 
                    to="/write" 
                    className="flex items-center text-sm font-bold text-white bg-black hover:bg-gray-800 py-2 px-4 rounded-md transition-all duration-200 uppercase tracking-wider"
                    onClick={closeMobileMenu}
                  >
                    <PenTool className="mr-2 h-4 w-4" />
                    Write
                  </Link>
                  {(user.role === 'editorial-board' || user.role === 'admin' || user.role === 'super-admin') && (
                    <Link 
                      to="/editorial" 
                      className="flex items-center text-sm font-bold text-blue-600 hover:text-gray-700 hover:bg-gray-100 py-2 px-4 rounded-md transition-all duration-200 uppercase tracking-wider"
                      onClick={closeMobileMenu}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Editorial
                    </Link>
                  )}
                  {(user.role === 'admin' || user.role === 'super-admin') && (
                    <>
                      <Link 
                        to="/admin" 
                        className="flex items-center text-sm font-bold text-red-600 hover:text-gray-700 hover:bg-gray-100 py-2 px-4 rounded-md transition-all duration-200 uppercase tracking-wider"
                        onClick={closeMobileMenu}
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Admin
                      </Link>
                      <Link 
                        to="/admin/reported-articles"
                        className="flex items-center text-sm font-bold text-red-600 hover:text-gray-700 hover:bg-gray-100 py-2 px-4 rounded-md transition-all duration-200 uppercase tracking-wider"
                        onClick={closeMobileMenu}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Reported
                      </Link>
                    </>
                  )}
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <span className="text-sm font-bold text-black flex items-center px-4 py-2 uppercase tracking-wider">
                      <User className="mr-2 h-4 w-4" />
                      {user.display_name}
                    </span>
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-2 text-sm font-bold text-black hover:text-gray-700 hover:bg-gray-100 rounded-md transition-all duration-200 uppercase tracking-wider"
                      onClick={closeMobileMenu}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        closeMobileMenu();
                      }}
                      className="flex items-center w-full text-left px-4 py-2 text-sm font-bold text-black hover:text-gray-700 hover:bg-gray-100 rounded-md transition-all duration-200 uppercase tracking-wider"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col space-y-3 pt-3 border-t border-gray-200">
                  <Link 
                    to="/login" 
                    className="flex items-center justify-center text-sm font-bold text-white bg-black hover:bg-gray-800 px-4 py-2 rounded-md transition-all duration-200 uppercase tracking-wider"
                    onClick={closeMobileMenu}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Login
                  </Link>
                  <Link 
                    to="/signup" 
                    className="flex items-center justify-center text-sm font-bold text-white bg-black hover:bg-gray-800 px-4 py-2 rounded-md transition-all duration-200 uppercase tracking-wider"
                    onClick={closeMobileMenu}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </nav>
        )}
      </div>
      <style jsx>{`
        @keyframes dropdown {
          from { opacity: 0; transform: scale(0.95) translateY(-10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-dropdown {
          animation: dropdown 0.2s ease-out forwards;
        }
      `}</style>
    </header>
  );
}

export default Header;