import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Zap, Globe, Users, Award, ArrowRight, Mail, MessageSquare, Flame, TrendingUp, Shield, Heart, Sparkles, BookOpen } from 'lucide-react';

function AboutUsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-black text-white overflow-hidden">
        {/* Animated mesh gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm border border-yellow-500/30 px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span className="text-yellow-500 font-semibold text-sm tracking-wider uppercase">Est. 2025</span>
            </div>
            
            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
              About
              <span className="block bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent mt-2">
                UROWN
              </span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-lg sm:text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto font-light">
              Where opinions deserve structure, and intelligent debate deserves a home.
            </p>
          </div>
        </div>
        
        {/* Bottom wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-12 md:h-16" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 C300,80 600,80 900,40 L1200,0 L1200,120 L0,120 Z" fill="#f9fafb"></path>
          </svg>
        </div>
      </div>

      {/* Mission Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 px-4 py-2 rounded-full mb-6">
              <Target className="w-5 h-5 text-orange-500" />
              <span className="text-orange-600 font-bold text-sm uppercase tracking-wider">Our Mission</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-6 leading-tight">
              Making Online Discourse
              <span className="block bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent mt-2">
                Meaningful Again
              </span>
            </h2>
            <div className="space-y-4 text-gray-700 text-lg">
              <p>
                UROWN was founded on a simple belief — that opinions deserve structure, and intelligent debate deserves a home. In a digital world dominated by noise, UROWN provides a space where ideas are challenged, refined, and respected.
              </p>
              <p>
                We're building the first open discourse platform that merges writing, debate, and media into one experience — allowing anyone to share their perspective and engage in meaningful conversation that actually matters.
              </p>
            </div>
          </div>
          
          <div className="relative">
            <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-transform duration-300">
              <div className="bg-black text-white rounded-2xl p-8">
                <Flame className="w-12 h-12 text-yellow-500 mb-4" />
                <h3 className="text-2xl font-black mb-4">The UROWN Difference</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-300">Structure over chaos</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-300">Quality over quantity</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-300">Debate over dogma</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We're Building Section */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 px-4 py-2 rounded-full mb-6">
              <Zap className="w-5 h-5 text-orange-500" />
              <span className="text-orange-600 font-bold text-sm uppercase tracking-wider">What We're Building</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-6">
              The Next Generation of
              <span className="block bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent mt-2">
                Public Discourse
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A publishing and debate network designed for clarity and credibility. Writers, students, professionals, and readers come together to exchange perspectives across politics, culture, economics, and global issues.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Structure Card */}
            <div className="group bg-gray-50 rounded-2xl p-8 hover:bg-gradient-to-br hover:from-yellow-500 hover:to-orange-500 transition-all duration-300 hover:shadow-2xl hover:scale-105">
              <div className="bg-gradient-to-br from-yellow-500 to-orange-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white transition-colors duration-300">
                <BookOpen className="w-8 h-8 text-white group-hover:text-orange-500" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4 group-hover:text-white">Structure</h3>
              <p className="text-gray-700 group-hover:text-white/90">Every argument is formatted with clear points and evidence. No more scrolling through endless threads to find substance.</p>
            </div>

            {/* Quality Card */}
            <div className="group bg-gray-50 rounded-2xl p-8 hover:bg-gradient-to-br hover:from-orange-500 hover:to-red-500 transition-all duration-300 hover:shadow-2xl hover:scale-105">
              <div className="bg-gradient-to-br from-orange-500 to-red-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white transition-colors duration-300">
                <Award className="w-8 h-8 text-white group-hover:text-orange-500" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4 group-hover:text-white">Quality</h3>
              <p className="text-gray-700 group-hover:text-white/90">Character limits ensure depth and clarity. Our editorial board helps surface the best content to the community.</p>
            </div>

            {/* Community Card */}
            <div className="group bg-gray-50 rounded-2xl p-8 hover:bg-gradient-to-br hover:from-red-500 hover:to-pink-500 transition-all duration-300 hover:shadow-2xl hover:scale-105">
              <div className="bg-gradient-to-br from-red-500 to-pink-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white transition-colors duration-300">
                <Users className="w-8 h-8 text-white group-hover:text-red-500" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4 group-hover:text-white">Community</h3>
              <p className="text-gray-700 group-hover:text-white/90">Verified editors and community reviewers create a space where respect and rigor coexist.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why We Exist Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-3xl p-10 shadow-2xl">
              <Shield className="w-12 h-12 text-yellow-500 mb-6" />
              <h3 className="text-2xl font-black mb-6">The Problem We're Solving</h3>
              <div className="space-y-4 text-gray-300">
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Social media rewards speed and outrage, not thought</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Online discussions have lost integrity</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Journalism struggles to remain independent</p>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-gray-700">
                <p className="text-lg font-bold text-yellow-500">UROWN bridges that gap.</p>
              </div>
            </div>
          </div>
          
          <div className="order-1 md:order-2">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 px-4 py-2 rounded-full mb-6">
              <Heart className="w-5 h-5 text-orange-500" />
              <span className="text-orange-600 font-bold text-sm uppercase tracking-wider">Why We Exist</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-6 leading-tight">
              A Hybrid Space for
              <span className="block bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent mt-2">
                True Dialogue
              </span>
            </h2>
            <div className="space-y-4 text-gray-700 text-lg">
              <p>
                We believe the future of public conversation isn't in comments, but in structured, respectful debate — powered by writers, readers, and communities that value depth over noise.
              </p>
              <p>
                UROWN creates a hybrid space where writing meets dialogue, and every voice can stand on equal ground. Our goal isn't to create another social network — it's to build the foundation for the next era of public discourse.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="bg-gradient-to-br from-yellow-500 to-orange-500 py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Globe className="w-16 h-16 text-white mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-6">
            Our Vision
          </h2>
          <p className="text-xl md:text-2xl text-white/90 font-light max-w-3xl mx-auto leading-relaxed">
            To become the world's leading platform for ideas, debate, and thought leadership — a digital environment where truth, creativity, and open expression can thrive without bias or manipulation.
          </p>
        </div>
      </section>


      {/* Community Partners Section */}
      <section className="bg-gray-900 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full mb-6">
              <TrendingUp className="w-5 h-5 text-yellow-500" />
              <span className="text-yellow-500 font-bold text-sm uppercase tracking-wider">Partners</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6">
              Community
              <span className="block bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent mt-2">
                Partners
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              We're proud to collaborate with online communities and organizations that believe in structured dialogue and civil discourse.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-10 max-w-4xl mx-auto">
            <p className="text-lg text-gray-300 mb-8 text-center">
              Our partners help bring real conversations into the UROWN ecosystem, connecting people from all backgrounds to debate, write, and learn together.
            </p>
            <div className="text-center">
              <p className="text-gray-400 mb-4">If you manage a community or media organization and want to collaborate:</p>
              <a 
                href="https://urown-delta.vercel.app/contact" 
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-xl hover:from-yellow-400 hover:to-orange-400 transition-all duration-300 hover:scale-105"
              >
                <Mail className="w-5 h-5" />
                partnerships@urown.world
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 px-4 py-2 rounded-full mb-6">
            <MessageSquare className="w-5 h-5 text-orange-500" />
            <span className="text-orange-600 font-bold text-sm uppercase tracking-wider">Get In Touch</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-6">
            Let's Start a
            <span className="block bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent mt-2">
              Conversation
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <a 
            href="https://urown-delta.vercel.app/contact"
            className="group bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-yellow-500 hover:shadow-xl transition-all duration-300"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">General Inquiries</h3>
            <p className="text-gray-600 text-sm mb-3">Questions, feedback, or just want to say hi?</p>
            <p className="text-orange-600 font-bold">info@urown.world</p>
          </a>

          <a 
            href="https://urown-delta.vercel.app/contact"
            className="group bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-orange-500 hover:shadow-xl transition-all duration-300"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Partnerships</h3>
            <p className="text-gray-600 text-sm mb-3">Collaborate with us to build better discourse</p>
            <p className="text-orange-600 font-bold">partnerships@urown.world</p>
          </a>

          <a 
            href="https://x.com/UROWNofficial"
            className="group bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-red-500 hover:shadow-xl transition-all duration-300"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Press & Media</h3>
            <p className="text-gray-600 text-sm mb-3">Media inquiries and press releases</p>
            <p className="text-orange-600 font-bold">UROWN OFFICIAL X ACCOUNT</p>
          </a>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="bg-black text-white py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-64 h-64 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6">
            Ready to Join
            <span className="block bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent mt-2">
              The Movement?
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Be part of the platform that's redefining how ideas are shared and debated online.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/signup"
              className="inline-flex items-center justify-center gap-3 px-10 py-5 text-lg font-bold text-black bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl hover:from-yellow-400 hover:to-orange-400 transition-all duration-300 hover:scale-105 shadow-2xl"
            >
              Start Writing
              <ArrowRight className="w-6 h-6" />
            </Link>
            <Link 
              to="/browse"
              className="inline-flex items-center justify-center gap-3 px-10 py-5 text-lg font-bold text-white bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              Explore Debates
              <BookOpen className="w-6 h-6" />
            </Link>
          </div>
          <p className="text-gray-500 text-sm mt-8">
            <span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent font-bold">
              UROWN — Where Opinions Become Conversations
            </span>
          </p>
        </div>
      </section>
    </div>
  );
}

export default AboutUsPage;