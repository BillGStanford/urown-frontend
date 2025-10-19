import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-white py-12 mt-auto border-t border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Main Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand Section */}
            <div className="flex flex-col items-center md:items-start">
              <h3 className="text-3xl font-black bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent mb-2 tracking-tight">
                UROWN
              </h3>
              <p className="text-sm text-gray-400 font-medium">
                Your Voice Matters
              </p>
            </div>

            {/* Quick Links */}
            <div className="flex flex-col items-center">
              <h4 className="text-sm font-bold text-gray-300 mb-4 uppercase tracking-wider">
                Resources
              </h4>
              <Link
                to="/community-guidelines"
                className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200 mb-2"
              >
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">Community Guidelines</span>
              </Link>
            </div>

            {/* Tagline */}
            <div className="flex flex-col items-center md:items-end justify-center">
              <p className="text-sm text-gray-400 font-medium text-center md:text-right leading-relaxed">
                Your Opinion.<br />
                Your Platform.<br />
                <span className="text-transparent bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text font-bold">
                  UROWN.
                </span>
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-6"></div>

          {/* Bottom Section */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-500 font-medium">
              © {currentYear} UROWN. All rights reserved.
            </p>
            <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
              Made with <Heart className="h-3 w-3 text-red-400 fill-current" /> for voices everywhere
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;