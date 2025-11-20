import React from 'react';
import { ExternalLink, Users, Award, Zap, TrendingUp, CheckCircle, ArrowRight, Mail, Globe, MessageSquare, ChevronRight, ChevronLeft } from 'lucide-react';

function PartnersPage() {
  // Add your partners here as they join the program
  const partners = [
    {
      id: 1,
      name: "Israel-Palestine Debate Community",
      description: "A server where individuals engage in discussions about the Israel-Palestine conflict. Build a deeper understanding through dialogue.",
      link: "https://discord.gg/wta86JTm",
      memberCount: "2,000+",
      category: "General Discussion",
      status: "verified"
    },
    // Add more partners here as they join
  ];

  const benefits = [
    {
      icon: <Award className="w-6 h-6 text-orange-600" strokeWidth={2.5} />,
      title: "Featured Visibility",
      description: "Your community listed on UROWN's Partners Page with logo and invite link"
    },
    {
      icon: <Zap className="w-6 h-6 text-orange-600" strokeWidth={2.5} />,
      title: "Co-Branded Events",
      description: "Host debates and writing competitions with your community"
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-orange-600" strokeWidth={2.5} />,
      title: "Member Recognition",
      description: "Top writers from your community featured on UROWN's front page"
    },
    {
      icon: <Users className="w-6 h-6 text-orange-600" strokeWidth={2.5} />,
      title: "Beta Access",
      description: "Early access to upcoming publishing tools and analytics dashboards"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white border-b border-gray-200">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-white"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-28">
          <div className="max-w-4xl mx-auto text-center">
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 bg-white border border-gray-300 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-sm mb-6 sm:mb-8 animate-fade-in">
              <Users className="w-5 h-5 text-orange-600" strokeWidth={2.5} />
              <span className="text-gray-700 font-semibold text-xs sm:text-sm">{partners.length} Active Partners</span>
            </div>
            
            {/* Main Headline */}
            <h1 className="mb-4 sm:mb-6 animate-slide-up text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gray-900">
              Partner with <span className="text-orange-600">UROWN</span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-6 sm:mb-8 lg:mb-10 leading-relaxed max-w-3xl mx-auto animate-slide-up-delay">
              Collaborate to amplify voices, host debates, and champion ideas.
            </p>
            
            {/* CTA Button */}
            <div className="flex justify-center animate-slide-up-delay-2">
              <a 
                href="https://forms.gle/Ko37ayZrtT7C9h3D6"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-bold text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Become a Partner
                <ChevronRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Partner Communities Section */}
        {partners.length > 0 && (
          <section className="mb-12 sm:mb-16">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                  <Users className="w-5 h-5 sm:w-7 sm:h-7 text-white" strokeWidth={2.5} />
                </div>
                Partner Communities
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {partners.map((partner, index) => (
                <a 
                  key={partner.id}
                  href={partner.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-orange-500 transform hover:scale-105 animate-fade-in-up text-left"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    {partner.status === 'verified' && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-600 text-xs font-black rounded-md">
                        <Award className="w-3 h-3" strokeWidth={2.5} />
                        Verified
                      </div>
                    )}
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-md">
                      {partner.category}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-gray-900 mb-3 group-hover:text-orange-600 transition-colors line-clamp-2">
                    {partner.name}
                  </h3>
                  <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-3 font-semibold">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4" strokeWidth={2.5} />
                      {partner.memberCount}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-3">
                    {partner.description}
                  </p>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* About Section */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-4 sm:mb-6 text-center animate-slide-up">
            About the Partner Program
          </h2>
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border-2 border-gray-200 hover:shadow-xl transition-all animate-fade-in-up">
            <p className="text-base sm:text-lg text-gray-600 mb-4">
              UROWN is a digital publishing platform for writers, thinkers, and communities valuing structured discussion.
            </p>
            <p className="text-base sm:text-lg text-gray-600 mb-4">
              The Partner Publisher Program connects Discord servers with UROWN for content sharing and growth.
            </p>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-4 sm:mb-6 text-center animate-slide-up">
            Why Partner With Us?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-orange-500 transform hover:scale-105 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-sm sm:text-base text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Expectations Section */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-4 sm:mb-6 text-center animate-slide-up">
            Partner Expectations
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              { number: 1, title: "Promote UROWN", description: "Share the platform in your community with a simple pinned post or announcement" },
              { number: 2, title: "Coordinate Events", description: "Allow a UROWN representative to help organize joint events or competitions" },
              { number: 3, title: "Encourage Publishing", description: "Motivate community members to publish at least once monthly on UROWN" }
            ].map((expect, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-orange-500 transform hover:scale-105 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-10 h-10 bg-orange-600 text-white font-bold text-xl rounded-lg flex items-center justify-center mb-3 sm:mb-4 shadow-md">
                  {expect.number}
                </div>
                <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-2">{expect.title}</h3>
                <p className="text-sm sm:text-base text-gray-600">{expect.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center py-12 sm:py-16 bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl border-2 border-orange-200 animate-fade-in">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg animate-bounce-slow">
              <Zap className="w-7 h-7 sm:w-10 sm:h-10 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4 sm:mb-6">
            Ready to Partner?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-10 max-w-2xl mx-auto font-medium">
            Join us in shaping intellectual discourse.
          </p>
          <a 
            href="https://forms.gle/Ko37ayZrtT7C9h3D6"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 sm:px-10 py-4 sm:py-5 bg-gray-900 text-white font-black rounded-xl hover:bg-gray-800 transition-all duration-200 text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Apply Now
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </a>
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

export default PartnersPage;