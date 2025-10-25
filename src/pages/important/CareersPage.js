// src/pages/CareersPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, Clock, Users, ArrowRight, MessageSquare, Sparkles, TrendingUp, Award, Heart, Zap, Globe } from 'lucide-react';

function CareersPage() {
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
              <Briefcase className="w-4 h-4 text-yellow-500" />
              <span className="text-yellow-500 font-semibold text-sm tracking-wider uppercase">Join Our Team</span>
            </div>
            
            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
              Build the Future of
              <span className="block bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent mt-2">
                Public Discourse
              </span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-lg sm:text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto font-light">
              Join a team that's redefining how ideas are shared, debated, and respected online. We're looking for passionate individuals who believe in meaningful conversation.
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

      {/* Why Join Us Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 px-4 py-2 rounded-full mb-6">
            <Heart className="w-5 h-5 text-orange-500" />
            <span className="text-orange-600 font-bold text-sm uppercase tracking-wider">Why UROWN</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-6">
            Why Work
            <span className="block bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent mt-2">
              With Us
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Impact Card */}
          <div className="group bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-yellow-500">
            <div className="bg-gradient-to-br from-yellow-500 to-orange-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-4">Real Impact</h3>
            <p className="text-gray-700">Shape the future of online discourse. Your work will directly influence how millions engage in meaningful debate.</p>
          </div>

          {/* Remote Card */}
          <div className="group bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-orange-500">
            <div className="bg-gradient-to-br from-orange-500 to-red-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-4">Work Anywhere</h3>
            <p className="text-gray-700">Fully remote positions. Work from anywhere in the world and collaborate with a diverse, global team.</p>
          </div>

          {/* Growth Card */}
          <div className="group bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-red-500">
            <div className="bg-gradient-to-br from-red-500 to-pink-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-4">Career Growth</h3>
            <p className="text-gray-700">Join a fast-growing startup. Learn, grow, and advance as we build something revolutionary together.</p>
          </div>
        </div>
      </section>

      {/* Open Positions Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-5 h-5 text-orange-500" />
            <span className="text-orange-600 font-bold text-sm uppercase tracking-wider">Open Positions</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-6">
            Current
            <span className="block bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent mt-2">
              Openings
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're currently hiring for the following position. More roles coming soon!
          </p>
        </div>

        {/* Job Listing Card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-gray-200 hover:border-orange-500 transition-all duration-300 group">
            {/* Job Header */}
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-8">
              <div className="flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full mb-4">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="text-white text-sm font-bold">NOW HIRING</span>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-black text-white mb-3">
                    Editorial Contributor
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                      <MapPin className="w-4 h-4 text-white" />
                      <span className="text-white text-sm font-semibold">Remote</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                      <Clock className="w-4 h-4 text-white" />
                      <span className="text-white text-sm font-semibold">Part-Time / Flexible</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                      <Users className="w-4 h-4 text-white" />
                      <span className="text-white text-sm font-semibold">Editorial Board</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Content */}
            <div className="p-8 md:p-10">
              {/* About the Role */}
              <div className="mb-8">
                <h4 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-1 h-8 bg-gradient-to-b from-yellow-500 to-orange-500 rounded-full"></div>
                  About the Role
                </h4>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Join our Editorial Board and help shape the future of UROWN. As an Editorial Contributor, you'll review, curate, and certify high-quality content while maintaining our standards for meaningful discourse. This is a remote, flexible position perfect for passionate individuals who believe in the power of structured debate.
                </p>
              </div>

              {/* What You'll Do */}
              <div className="mb-8">
                <h4 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
                  What You'll Do
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 text-lg">Review and certify articles submitted by the community</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 text-lg">Curate high-quality content for featured sections</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 text-lg">Create debate topics and moderate discussions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 text-lg">Collaborate with the team to maintain editorial standards</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 text-lg">Help build and shape UROWN's editorial voice</span>
                  </li>
                </ul>
              </div>

              {/* What We're Looking For */}
              <div className="mb-8">
                <h4 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-1 h-8 bg-gradient-to-b from-red-500 to-pink-500 rounded-full"></div>
                  What We're Looking For
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 text-lg">Strong writing and editing skills</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 text-lg">Passion for meaningful discourse and debate</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 text-lg">Ability to evaluate arguments objectively and fairly</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 text-lg">Understanding of diverse perspectives and topics</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 text-lg">Self-motivated and able to work independently</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 text-lg">Active on Discord or willing to learn</span>
                  </li>
                </ul>
              </div>

              {/* Perks */}
              <div className="mb-10">
                <h4 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-1 h-8 bg-gradient-to-b from-yellow-500 to-orange-500 rounded-full"></div>
                  Perks & Benefits
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200">
                    <Zap className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-gray-900">Flexible Schedule</p>
                      <p className="text-sm text-gray-600">Work on your own time</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200">
                    <Globe className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-gray-900">100% Remote</p>
                      <p className="text-sm text-gray-600">Work from anywhere</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200">
                    <Award className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-gray-900">Editorial Board Access</p>
                      <p className="text-sm text-gray-600">Full privileges</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200">
                    <Users className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-gray-900">Growing Community</p>
                      <p className="text-sm text-gray-600">Join our passionate team</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* How to Apply */}
              <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-2xl p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black mb-2">How to Apply</h4>
                    <p className="text-gray-300 text-lg">
                      Ready to join our Editorial Board? The application process is simple:
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4 mb-8">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-yellow-500 text-black rounded-full flex items-center justify-center font-black">1</div>
                    <div>
                      <p className="font-bold text-white mb-1">Create a Discord Account</p>
                      <p className="text-gray-400 text-sm">If you don't already have one, sign up at discord.com</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-black rounded-full flex items-center justify-center font-black">2</div>
                    <div>
                      <p className="font-bold text-white mb-1">Join Our Server</p>
                      <p className="text-gray-400 text-sm">Click the button below to join and introduce yourself</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-red-500 text-black rounded-full flex items-center justify-center font-black">3</div>
                    <div>
                      <p className="font-bold text-white mb-1">Start Your Interview</p>
                      <p className="text-gray-400 text-sm">Our team will reach out to begin the conversation</p>
                    </div>
                  </div>
                </div>

                <a 
                  href="https://discord.gg/eSJ37GKy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative w-full flex items-center justify-center gap-3 px-8 py-5 text-lg font-bold text-black bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl hover:from-yellow-400 hover:to-orange-400 transition-all duration-300 hover:scale-105 shadow-2xl"
                >
                  <MessageSquare className="w-6 h-6" />
                  Join Discord & Apply
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </a>
                <p className="text-gray-400 text-sm text-center mt-4">
                  Applications reviewed on a rolling basis
                </p>
              </div>
            </div>
          </div>
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
            Don't See Your Role?
            <span className="block bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent mt-2">
              Let's Talk Anyway
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            We're always looking for talented people who are passionate about meaningful discourse. Reach out even if you don't see a perfect fit.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:careers@urown.world"
              className="inline-flex items-center justify-center gap-3 px-10 py-5 text-lg font-bold text-black bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl hover:from-yellow-400 hover:to-orange-400 transition-all duration-300 hover:scale-105 shadow-2xl"
            >
              Email Us
              <ArrowRight className="w-6 h-6" />
            </a>
            <Link 
              to="/"
              className="inline-flex items-center justify-center gap-3 px-10 py-5 text-lg font-bold text-white bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              Back to Home
              <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default CareersPage;