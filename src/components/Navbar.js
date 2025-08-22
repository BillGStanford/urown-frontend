import React from 'react';
import { Link } from 'react-router-dom';
import { User, LogOut, Search, PenTool, Shield } from 'lucide-react';

const Navbar = ({ user, logout, selectedCategory, setSelectedCategory }) => {
  const categories = ['ALL', 'TECHNOLOGY', 'ENVIRONMENT', 'FINANCE', 'SCIENCE', 'HEALTH', 'POLITICS', 'SPORTS', 'OPINION', 'ENTERTAINMENT', 'ARTS'];

  return (
    <header className="bg-white border-b-4 border-black sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-4xl md:text-6xl font-black tracking-tighter">
              UROWN
            </Link>
            <div className="hidden md:block text-sm font-bold text-gray-600">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-6">
            <div className="hidden lg:flex items-center space-x-1">
            </div>

            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/write"
                  className="flex items-center space-x-2 bg-black text-white px-4 py-2 font-bold text-sm border-2 border-black hover:bg-gray-800 transition-colors"
                >
                  <PenTool size={16} />
                  <span>WRITE</span>
                </Link>
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 bg-white text-black px-4 py-2 font-bold text-sm border-2 border-black hover:bg-gray-100 transition-colors"
                >
                  <User size={16} />
                  <span>DASHBOARD</span>
                </Link>

                {/* Admin and Super Admin Links */}
                {(user.role === 'admin' || user.role === 'super-admin') && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-2 bg-white text-black px-4 py-2 font-bold text-sm border-2 border-black hover:bg-gray-100 transition-colors"
                  >
                    <Shield size={16} />
                    <span>ADMIN</span>
                  </Link>
                )}
                {user.role === 'super-admin' && (
                  <Link
                    to="/super-admin"
                    className="flex items-center space-x-2 bg-white text-black px-4 py-2 font-bold text-sm border-2 border-black hover:bg-gray-100 transition-colors"
                  >
                    <Shield size={16} />
                    <span>SUPER ADMIN</span>
                  </Link>
                )}

                <button
                  onClick={logout}
                  className="flex items-center space-x-2 bg-gray-100 text-black px-4 py-2 font-bold text-sm border-2 border-black hover:bg-gray-200 transition-colors"
                >
                  <LogOut size={16} />
                  <span>LOGOUT</span>
                </button>
              </div>
            ) : (
              <div className="flex space-x-3">
                <Link
                  to="/login"
                  className="bg-white text-black px-6 py-2 font-bold text-sm border-2 border-black hover:bg-gray-100 transition-colors"
                >
                  LOGIN
                </Link>
                <Link
                  to="/signup"
                  className="bg-black text-white px-6 py-2 font-bold text-sm border-2 border-black hover:bg-gray-800 transition-colors"
                >
                  SIGN UP
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="border-t-2 border-black bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-1 py-3 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 font-bold text-sm whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-gray-200'
                } border-2 border-black mr-2`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;