import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Zap, Globe, Users, Award, ArrowRight, Mail, MessageSquare, Flame, TrendingUp, Shield, Heart, Sparkles, BookOpen, ChevronRight } from 'lucide-react';

function AboutUsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white border-b border-gray-200">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-white"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-28">
          <div className="max-w-4xl mx-auto text-center">
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 bg-white border border-gray-300 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-sm mb-6 sm:mb-8 animate-fade-in">
              <Sparkles className="w-5 h-5 text-orange-600" strokeWidth={2.5} />
              <span className="text-gray-700 font-semibold text-xs sm:text-sm">Est. 2025</span>
            </div>
            
            {/* Main Headline */}
            <h1 className="mb-4 sm:mb-6 animate-slide-up text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gray-900">
              About <span className="text-orange-600">UROWN</span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-6 sm:mb-8 lg:mb-10 leading-relaxed max-w-3xl mx-auto animate-slide-up-delay">
              Where opinions deserve structure, and intelligent debate deserves a home.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-8 sm:mb-12 animate-slide-up-delay-2">
              <Link 
                to="/signup" 
                className="group inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-bold text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Join Now
                <ChevronRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/browse" 
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-bold text-gray-900 bg-white border-2 border-gray-900 rounded-xl hover:bg-gray-50 transition-all duration-200 transform hover:scale-105"
              >
                Explore
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Mission Section */}
        <section className="mb-12 sm:mb-16 grid md:grid-cols-2 gap-6 sm:gap-8 items-center">
          <div className="animate-slide-up">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 flex items-center gap-2 sm:gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-orange-600" strokeWidth={2.5} />
              </div>
              Our Mission
            </h2>
            <p className="text-base sm:text-lg text-gray-600 mb-4">
              Making online discourse meaningful again.
            </p>
            <p className="text-sm sm:text-base text-gray-600">
              UROWN provides a space where ideas are challenged, refined, and respected.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200 animate-fade-in-up">
            <Flame className="w-8 h-8 text-orange-600 mb-4" strokeWidth={2.5} />
            <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-2">The UROWN Difference</h3>
            <ul className="space-y-2 text-sm sm:text-base text-gray-600">
              <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-orange-600" /> Structure over chaos</li>
              <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-orange-600" /> Quality over quantity</li>
              <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-orange-600" /> Debate over dogma</li>
            </ul>
          </div>
        </section>

        {/* What We're Building Section */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-4 sm:mb-6 text-center animate-slide-up">
            What We're Building
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: <BookOpen className="w-6 h-6 text-orange-600" />, title: "Structure", description: "Clear points and evidence." },
              { icon: <Award className="w-6 h-6 text-orange-600" />, title: "Quality", description: "Depth and clarity ensured." },
              { icon: <Users className="w-6 h-6 text-orange-600" />, title: "Community", description: "Respect and rigor." }
            ].map((item, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-orange-500 transform hover:scale-105 animate-fade-in-up text-center"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  {item.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm sm:text-base text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Why We Exist Section */}
        <section className="mb-12 sm:mb-16 grid md:grid-cols-2 gap-6 sm:gap-8 items-center">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200 animate-fade-in-up">
            <Shield className="w-8 h-8 text-orange-600 mb-4" strokeWidth={2.5} />
            <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-2">The Problem We're Solving</h3>
            <ul className="space-y-2 text-sm sm:text-base text-gray-600">
              <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-orange-600" /> Social media rewards outrage</li>
              <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-orange-600" /> Discussions lack integrity</li>
              <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-orange-600" /> Journalism struggles</li>
            </ul>
          </div>
          <div className="animate-slide-up">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 flex items-center gap-2 sm:gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-orange-600" strokeWidth={2.5} />
              </div>
              Why We Exist
            </h2>
            <p className="text-base sm:text-lg text-gray-600 mb-4">
              A hybrid space for true dialogue.
            </p>
            <p className="text-sm sm:text-base text-gray-600">
              Building the foundation for public discourse.
            </p>
          </div>
        </section>

        {/* Vision Section */}
        <section className="mb-12 sm:mb-16 text-center py-12 bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl border-2 border-orange-200 animate-fade-in">
          <Globe className="w-12 h-12 text-orange-600 mx-auto mb-4" strokeWidth={2.5} />
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-4">
            Our Vision
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
            Leading platform for ideas, debate, and thought leadership.
          </p>
        </section>

        {/* Community Partners Section */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-4 sm:mb-6 text-center animate-slide-up">
            Community Partners
          </h2>
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200 text-center animate-fade-in-up">
            <p className="text-base sm:text-lg text-gray-600 mb-4">
              Collaborating with communities for structured dialogue.
            </p>
            <a 
              href="https://urown-delta.vercel.app/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all transform hover:scale-105"
            >
              Contact for Partnerships
              <ChevronRight className="w-5 h-5" />
            </a>
          </div>
        </section>

        {/* Contact Section */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-4 sm:mb-6 text-center animate-slide-up">
            Get In Touch
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: <Mail />, title: "General Inquiries", description: "Questions or feedback?", link: "https://urown-delta.vercel.app/contact", email: "info@urown.world" },
              { icon: <Users />, title: "Partnerships", description: "Collaborate with us", link: "https://urown-delta.vercel.app/contact", email: "partnerships@urown.world" },
              { icon: <MessageSquare />, title: "Press & Media", description: "Media inquiries", link: "https://x.com/UROWNofficial", email: "UROWN OFFICIAL X" }
            ].map((contact, index) => (
              <a 
                key={index}
                href={contact.link}
                className="group bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-orange-500 transform hover:scale-105 animate-fade-in-up text-center"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  {contact.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-2">{contact.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{contact.description}</p>
                <p className="text-orange-600 font-bold">{contact.email}</p>
              </a>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="text-center py-12 sm:py-16 bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl border-2 border-orange-200 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4 sm:mb-6">
            Join the Movement
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-10 max-w-2xl mx-auto font-medium">
            Redefining how ideas are shared and debated.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/signup"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 text-white font-black rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Start Writing
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/browse"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-gray-900 text-gray-900 font-black rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Explore Debates
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-slide-up { animation: slide-up 0.6s ease-out; }
        .animate-slide-up-delay { animation: slide-up 0.6s ease-out 0.2s both; }
        .animate-slide-up-delay-2 { animation: slide-up 0.6s ease-out 0.4s both; }
        .animate-fade-in-up { animation: fade-in-up 0.5s ease-out both; }
        .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

export default AboutUsPage;