import React from 'react';
import { ExternalLink, Users, Award, Zap, TrendingUp, CheckCircle, ArrowRight, Mail, Globe, MessageSquare } from 'lucide-react';

function PartnersPage() {
  // Add your partners here as they join the program
  const partners = [
    {
      id: 1,
      name: "Israel-Palestine Debate Community (PENDING)",
      description: "A server where individuals engage in discussions about the Israel-Palestine conflict. Build a deeper understanding through dialogue.",
      link: "https://discord.gg/6m9C23Jc",
      memberCount: "1,000+",
      category: "General Discussion",
      status: "verified"
    },
    // Add more partners here as they join
  ];

  const benefits = [
    {
      icon: <Award className="w-6 h-6" />,
      title: "Featured Visibility",
      description: "Your community listed on UROWN's Partners Page with logo and invite link"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Co-Branded Events",
      description: "Host debates and writing competitions with your community"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Member Recognition",
      description: "Top writers from your community featured on UROWN's front page"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Beta Access",
      description: "Early access to upcoming publishing tools and analytics dashboards"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-black text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm border border-yellow-500/30 px-4 py-2 rounded-full mb-6">
              <Users className="w-4 h-4 text-yellow-500" />
              <span className="text-yellow-500 font-semibold text-sm tracking-wider uppercase">Partner Publisher Program</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 leading-tight">
              Our Partner
              <span className="block bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent mt-2">
                Communities
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-400 mb-12 max-w-3xl mx-auto font-light">
              Discover communities aligned with UROWN's mission. These partners collaborate with us to amplify voices, host debates, and champion ideas over algorithms.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a 
                href="https://forms.gle/Ko37ayZrtT7C9h3D6"
                target="_blank"
                rel="noopener noreferrer"
                className="group w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-black bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <span className="flex items-center">
                  Become a Partner
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </a>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-12 md:h-16" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 C300,80 600,80 900,40 L1200,0 L1200,120 L0,120 Z" fill="#f9fafb"></path>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        
        {/* Partner Communities Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-1 h-8 bg-gradient-to-b from-yellow-500 to-orange-500 rounded-full"></div>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900">Partner Communities</h2>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join these incredible communities aligned with UROWN's values
            </p>
          </div>
          
          {/* Partners Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {partners.map((partner) => (
              <div 
                key={partner.id}
                className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-gray-200 hover:border-orange-500 transition-all duration-300 group hover:shadow-3xl"
              >
                {/* Top Bar */}
                <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 h-3"></div>
                
                {/* Content */}
                <div className="p-8 md:p-10">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-2xl md:text-3xl font-black text-gray-900">
                          {partner.name}
                        </h3>
                        {partner.status === 'verified' && (
                          <CheckCircle className="w-7 h-7 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-orange-500/30 px-4 py-2 rounded-full">
                          <Users className="w-4 h-4 text-orange-600" />
                          <span className="text-sm font-bold text-orange-900">{partner.memberCount} Members</span>
                        </div>
                        <div className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
                          <span className="text-sm font-bold text-gray-700">{partner.category}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <p className="text-gray-700 text-lg leading-relaxed mb-8">
                    {partner.description}
                  </p>
                  
                  {/* CTA Button */}
                  <a 
                    href={partner.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-3 w-full px-8 py-4 bg-gradient-to-r from-gray-900 to-black text-white font-bold rounded-xl hover:from-gray-800 hover:to-gray-900 transition-all duration-300 group-hover:gap-4 shadow-lg hover:shadow-2xl"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Join Community
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
                
                {/* Bottom Accent */}
                <div className="bg-gray-50 px-10 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 font-semibold">Official UROWN Partner</span>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-600 font-bold">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* About Section */}
        <section className="mb-20">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border-2 border-gray-200">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6 text-center">About the Partner Program</h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                <p className="text-lg leading-relaxed mb-6">
                  <strong>UROWN</strong> is a digital publishing platform designed for writers, thinkers, and communities that value structured discussion and real opinions. Users can publish articles, share ideas, and counter others' views — creating a living debate ecosystem.
                </p>
                <p className="text-lg leading-relaxed mb-6">
                  We've built UROWN to give power back to creators and communities who care about <strong>ideas, not algorithms</strong>.
                </p>
                <p className="text-lg leading-relaxed">
                  The <strong>Partner Publisher Program</strong> connects Discord servers and online communities with UROWN to share content, run debates, and grow their audience. Partnerships are non-financial and mutually beneficial.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Program Benefits */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Why Partner With Us?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Non-financial partnerships that deliver real value to your community
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 hover:shadow-xl hover:border-orange-500 transition-all duration-300 hover:scale-105"
              >
                <div className="w-14 h-14 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center text-white mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Expectations Section */}
        <section className="mb-20">
          <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-3xl shadow-2xl p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-black mb-8 text-center">Partner Expectations</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-black font-black text-2xl mb-6">
                  1
                </div>
                <h3 className="text-xl font-bold mb-3">Promote UROWN</h3>
                <p className="text-gray-300 leading-relaxed">
                  Share the platform in your community with a simple pinned post or announcement
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-black font-black text-2xl mb-6">
                  2
                </div>
                <h3 className="text-xl font-bold mb-3">Coordinate Events</h3>
                <p className="text-gray-300 leading-relaxed">
                  Allow a UROWN representative to help organize joint events or competitions
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-black font-black text-2xl mb-6">
                  3
                </div>
                <h3 className="text-xl font-bold mb-3">Encourage Publishing</h3>
                <p className="text-gray-300 leading-relaxed">
                  Motivate community members to publish at least once monthly on UROWN
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-8 md:p-16 text-center">
            <h2 className="text-3xl md:text-5xl font-black text-black mb-6">
              Ready to Become a Partner?
            </h2>
            <p className="text-lg md:text-xl text-black/80 mb-10 max-w-2xl mx-auto font-semibold">
              If your community aligns with our mission of valuing ideas over algorithms, we'd love to collaborate.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
              <a 
                href="https://forms.gle/Ko37ayZrtT7C9h3D6"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-white bg-black rounded-xl hover:bg-gray-900 transition-all duration-300 hover:scale-105 shadow-2xl"
              >
                Fill Out Application
                <ArrowRight className="ml-2 w-6 h-6" />
              </a>
            </div>
            
            <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-8 max-w-3xl mx-auto">
              <h3 className="text-xl font-black text-black mb-6">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 hover:bg-white transition-all duration-200">
                  <div className="flex items-center justify-center gap-2 text-gray-900">
                    <Mail className="w-5 h-5 text-orange-600" />
                    <a href="mailto:urowncontact@gmail.com" className="hover:text-orange-600 transition-colors font-bold">
                      Email Us
                    </a>
                  </div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 hover:bg-white transition-all duration-200">
                  <div className="flex items-center justify-center gap-2 text-gray-900">
                    <Globe className="w-5 h-5 text-orange-600" />
                    <a href="https://urown-delta.vercel.app/contact" target="_blank" rel="noopener noreferrer" className="hover:text-orange-600 transition-colors font-bold">
                      Contact Us
                    </a>
                  </div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 hover:bg-white transition-all duration-200">
                  <div className="flex items-center justify-center gap-2 text-gray-900">
                    <MessageSquare className="w-5 h-5 text-orange-600" />
                    <a href="https://discord.gg/uvYCpz8W" target="_blank" rel="noopener noreferrer" className="hover:text-orange-600 transition-colors font-bold">
                      Our Discord
                    </a>
                  </div>
                </div>
              </div>
              <p className="text-black/70 text-sm mt-6 font-semibold">
                <strong>Founder & Lead Developer:</strong> Steven Swanson
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default PartnersPage;