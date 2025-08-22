// src/components/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t-4 border-black py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-black mb-4 tracking-tighter">UROWN</h3>
            <p className="font-bold text-sm">
              The world's boldest publishing platform. Your words, your voice, your own.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-black mb-3">CATEGORIES</h4>
            <ul className="space-y-2 text-sm font-bold">
              <li><a href="#" className="hover:underline">TECHNOLOGY</a></li>
              <li><a href="#" className="hover:underline">POLITICS</a></li>
              <li><a href="#" className="hover:underline">SCIENCE</a></li>
              <li><a href="#" className="hover:underline">HEALTH</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-black mb-3">FOR WRITERS</h4>
            <ul className="space-y-2 text-sm font-bold">
              <li><Link to="/signup" className="hover:underline">JOIN UROWN</Link></li>
              <li><Link to="/login" className="hover:underline">WRITER LOGIN</Link></li>
              <li><a href="#" className="hover:underline">PUBLISHING GUIDE</a></li>
              <li><a href="#" className="hover:underline">TIER SYSTEM</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-black mb-3">SUPPORT</h4>
            <ul className="space-y-2 text-sm font-bold">
              <li><a href="#" className="hover:underline">HELP CENTER</a></li>
              <li><a href="#" className="hover:underline">CONTACT US</a></li>
              <li><a href="#" className="hover:underline">TERMS OF SERVICE</a></li>
              <li><a href="#" className="hover:underline">PRIVACY POLICY</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t-2 border-black pt-6 text-center">
          <p className="font-bold text-sm">
            © 2025 UROWN. ALL RIGHTS RESERVED. YOUR WORDS, YOUR VOICE, YOUR OWN.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;