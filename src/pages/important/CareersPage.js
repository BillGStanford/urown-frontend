// src/pages/CareersPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, Clock, Users, ArrowRight, MessageSquare, Sparkles, TrendingUp, Award, Heart, Zap, Globe, Search, Filter, X } from 'lucide-react';

function CareersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Job listings data
  const jobListings = [
    {
      id: 1,
      title: 'Editorial Contributor',
      department: 'Editorial',
      type: 'Part-Time',
      location: 'Remote',
      team: 'Editorial Board',
      status: 'NOW HIRING',
      featured: true,
      applicationLink: 'https://forms.gle/uG9kdWTqhgfCorat7',
      description: 'Join our Editorial Board and help shape the future of UROWN. As an Editorial Contributor, you\'ll review, curate, and certify high-quality content while maintaining our standards for meaningful discourse.',
      responsibilities: [
        'Review and certify articles submitted by the community',
        'Curate high-quality content for featured sections',
        'Create debate topics and moderate discussions',
        'Collaborate with the team to maintain editorial standards',
        'Help build and shape UROWN\'s editorial voice'
      ],
      requirements: [
        'Strong writing and editing skills',
        'Passion for meaningful discourse and debate',
        'Ability to evaluate arguments objectively and fairly',
        'Understanding of diverse perspectives and topics',
        'Self-motivated and able to work independently',
        'Experience with content management systems'
      ],
      perks: [
        { icon: Zap, title: 'Flexible Schedule', desc: 'Work on your own time' },
        { icon: Globe, title: '100% Remote', desc: 'Work from anywhere' },
        { icon: Award, title: 'Editorial Board Access', desc: 'Full privileges' },
        { icon: Users, title: 'Growing Community', desc: 'Join our passionate team' }
      ]
    }
    // Additional job listings can be added here in the future
  ];

  // Filter jobs based on search term and selected filters
  useEffect(() => {
    let filtered = jobListings;
    
    if (searchTerm) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(job => job.department === selectedDepartment);
    }
    
    if (selectedType !== 'all') {
      filtered = filtered.filter(job => job.type === selectedType);
    }
    
    setFilteredJobs(filtered);
  }, [searchTerm, selectedDepartment, selectedType]);

  // Get unique departments for filter
  const departments = ['all', ...new Set(jobListings.map(job => job.department))];
  const jobTypes = ['all', ...new Set(jobListings.map(job => job.type))];

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

        {/* Search and Filter Section */}
        <div className="max-w-4xl mx-auto mb-10">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by title, department..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Filter Toggle Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Filter className="w-5 h-5" />
                Filters
                {(selectedDepartment !== 'all' || selectedType !== 'all') && (
                  <span className="ml-1 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {selectedDepartment !== 'all' && selectedType !== 'all' ? '2' : '1'}
                  </span>
                )}
              </button>
            </div>
            
            {/* Filter Options */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                    >
                      {departments.map(dept => (
                        <option key={dept} value={dept}>
                          {dept === 'all' ? 'All Departments' : dept}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                    >
                      {jobTypes.map(type => (
                        <option key={type} value={type}>
                          {type === 'all' ? 'All Types' : type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Clear Filters Button */}
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => {
                      setSelectedDepartment('all');
                      setSelectedType('all');
                      setSearchTerm('');
                    }}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                  >
                    <X className="w-4 h-4" />
                    Clear all filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="max-w-4xl mx-auto mb-6">
          <p className="text-gray-600">
            {filteredJobs.length} {filteredJobs.length === 1 ? 'position' : 'positions'} found
          </p>
        </div>

        {/* Job Listings */}
        <div className="max-w-4xl mx-auto space-y-8">
          {filteredJobs.length > 0 ? (
            filteredJobs.map(job => (
              <div key={job.id} className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-gray-200 hover:border-orange-500 transition-all duration-300 group">
                {/* Job Header */}
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-8">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full mb-4">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span className="text-white text-sm font-bold">{job.status}</span>
                      </div>
                      <h3 className="text-3xl md:text-4xl font-black text-white mb-3">
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                          <MapPin className="w-4 h-4 text-white" />
                          <span className="text-white text-sm font-semibold">{job.location}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                          <Clock className="w-4 h-4 text-white" />
                          <span className="text-white text-sm font-semibold">{job.type}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                          <Users className="w-4 h-4 text-white" />
                          <span className="text-white text-sm font-semibold">{job.team}</span>
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
                      {job.description}
                    </p>
                  </div>

                  {/* What You'll Do */}
                  <div className="mb-8">
                    <h4 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
                      What You'll Do
                    </h4>
                    <ul className="space-y-3">
                      {job.responsibilities.map((item, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700 text-lg">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* What We're Looking For */}
                  <div className="mb-8">
                    <h4 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-1 h-8 bg-gradient-to-b from-red-500 to-pink-500 rounded-full"></div>
                      What We're Looking For
                    </h4>
                    <ul className="space-y-3">
                      {job.requirements.map((item, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700 text-lg">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Perks */}
                  <div className="mb-10">
                    <h4 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-1 h-8 bg-gradient-to-b from-yellow-500 to-orange-500 rounded-full"></div>
                      Perks & Benefits
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {job.perks.map((perk, index) => (
                        <div key={index} className="flex items-start gap-3 bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200">
                          <perk.icon className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-gray-900">{perk.title}</p>
                            <p className="text-sm text-gray-600">{perk.desc}</p>
                          </div>
                        </div>
                      ))}
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
                          Ready to join our team? Complete our application form to get started:
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-4 mb-8">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-yellow-500 text-black rounded-full flex items-center justify-center font-black">1</div>
                        <div>
                          <p className="font-bold text-white mb-1">Complete the Application Form</p>
                          <p className="text-gray-400 text-sm">Fill out our comprehensive application form with your details</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-black rounded-full flex items-center justify-center font-black">2</div>
                        <div>
                          <p className="font-bold text-white mb-1">Submit Your Information</p>
                          <p className="text-gray-400 text-sm">Our team will review your application and qualifications</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-red-500 text-black rounded-full flex items-center justify-center font-black">3</div>
                        <div>
                          <p className="font-bold text-white mb-1">Interview Process</p>
                          <p className="text-gray-400 text-sm">Selected candidates will be contacted for the next steps</p>
                        </div>
                      </div>
                    </div>

                    <a 
                      href={job.applicationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative w-full flex items-center justify-center gap-3 px-8 py-5 text-lg font-bold text-black bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl hover:from-yellow-400 hover:to-orange-400 transition-all duration-300 hover:scale-105 shadow-2xl"
                    >
                      <MessageSquare className="w-6 h-6" />
                      Complete Application Form
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </a>
                    <p className="text-gray-400 text-sm text-center mt-4">
                      Applications reviewed on a rolling basis
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">No positions found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search or filters to find what you're looking for.</p>
              <button
                onClick={() => {
                  setSelectedDepartment('all');
                  setSelectedType('all');
                  setSearchTerm('');
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-lg hover:from-yellow-400 hover:to-orange-400 transition-all"
              >
                Clear Filters
              </button>
            </div>
          )}
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