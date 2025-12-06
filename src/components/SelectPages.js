// components/SelectPages.js
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { 
  ChevronRight, 
  ChevronLeft, 
  Flame, 
  Award, 
  Users, 
  TrendingUp, 
  Eye, 
  MessageSquare, 
  Calendar, 
  Star, 
  Zap, 
  ArrowRight, 
  Briefcase, 
  DollarSign, 
  Trophy, 
  Pizza, 
  Plane, 
  Laptop, 
  Heart, 
  Film, 
  Microscope, 
  Globe, 
  Sparkles, 
  Medal,
  BookOpen,
  Clock,
  Bookmark,
  Search,
  Grid3X3,
  List,
  PenTool,
  BarChart3,
  Brain,
  FileText,
  Home,
  Book,
  Flag,
  Bell,
  Settings,
  Shield,
  HelpCircle,
  Library,
  Edit,
  User,
  FileCheck,
  UserCheck,
  MessageSquareMore,
  ChevronDown,
  LayoutGrid,
  FolderOpen,
  Tag,
  Hash
} from 'lucide-react';

function SelectPages() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [featuredApps, setFeaturedApps] = useState([]);
  const scrollRef = useRef(null);

  // App categories
  const categories = [
    { id: 'all', name: 'All Apps', icon: Grid3X3 },
    { id: 'content', name: 'Content', icon: FileText },
    { id: 'community', name: 'Community', icon: Users },
    { id: 'tools', name: 'Tools', icon: PenTool },
    { id: 'resources', name: 'Resources', icon: Library }
  ];

  // Define all available apps
  const allApps = [
    {
      id: 'homepage',
      title: 'Homepage',
      description: 'Discover what\'s new and trending on our platform',
      icon: Home,
      color: 'from-blue-500 to-blue-600',
      category: 'content',
      route: '/homepage',
      featured: true,
      views: '38K+',
      rating: 4.9,
      isNew: false
    },
    {
      id: 'browse',
      title: 'Browse Articles',
      description: 'Explore articles on various topics from our community',
      icon: FileText,
      color: 'from-green-500 to-green-600',
      category: 'content',
      route: '/browse',
      featured: true,
      views: '24K+',
      rating: 4.8,
      isNew: false
    },
    {
      id: 'ebooks',
      title: 'E-Books Library',
      description: 'Read and explore our collection of e-books',
      icon: BookOpen,
      color: 'from-purple-500 to-purple-600',
      category: 'resources',
      route: '/ebooks',
      featured: true,
      views: '15K+',
      rating: 4.7,
      isNew: false
    },
    {
      id: 'debates',
      title: 'Debates',
      description: 'Join discussions and debates on important topics',
      icon: MessageSquare,
      color: 'from-red-500 to-red-600',
      category: 'community',
      route: '/debate',
      featured: true,
      views: '19K+',
      rating: 4.6,
      isNew: false
    },
    {
      id: 'redflagged',
      title: 'Red Flagged',
      description: 'View controversial content and discussions',
      icon: Flag,
      color: 'from-red-600 to-red-700',
      category: 'content',
      route: '/redflagged',
      featured: false,
      views: '8K+',
      rating: 4.3,
      isNew: false
    },
    {
      id: 'leaderboard',
      title: 'Leaderboard',
      description: 'Top contributors and creators on our platform',
      icon: Trophy,
      color: 'from-yellow-500 to-yellow-600',
      category: 'community',
      route: '/leaderboard',
      featured: true,
      views: '12K+',
      rating: 4.5,
      isNew: false
    },
    {
      id: 'profile',
      title: 'Profile',
      description: 'View and edit your profile and settings',
      icon: User,
      color: 'from-indigo-500 to-indigo-600',
      category: 'tools',
      route: user ? '/dashboard' : '/login',
      featured: false,
      views: 'N/A',
      rating: 4.9,
      isNew: false,
      requiresAuth: true
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Stay updated with latest activities',
      icon: Bell,
      color: 'from-pink-500 to-pink-600',
      category: 'tools',
      route: user ? '/notifications' : '/login',
      featured: false,
      views: 'N/A',
      rating: 4.7,
      isNew: false,
      requiresAuth: true
    },
    {
      id: 'write',
      title: 'Write Article',
      description: 'Share your thoughts with the world',
      icon: PenTool,
      color: 'from-teal-500 to-teal-600',
      category: 'tools',
      route: user ? '/write' : '/login',
      featured: true,
      views: 'N/A',
      rating: 4.8,
      isNew: false,
      requiresAuth: true
    },
    {
      id: 'write-ebook',
      title: 'Write E-Book',
      description: 'Create and publish your own e-book',
      icon: Edit,
      color: 'from-purple-600 to-purple-700',
      category: 'tools',
      route: user ? '/write-ebook' : '/login',
      featured: true,
      views: 'N/A',
      rating: 4.6,
      isNew: true,
      requiresAuth: true
    },
    {
      id: 'ideology-quiz',
      title: 'Ideology Quiz',
      description: 'Discover your political and social ideology',
      icon: Brain,
      color: 'from-cyan-500 to-cyan-600',
      category: 'tools',
      route: user ? '/ideology-quiz' : '/login',
      featured: true,
      views: '22K+',
      rating: 4.9,
      isNew: false,
      requiresAuth: true
    },
    {
      id: 'library',
      title: 'Library',
      description: 'Your personal collection of saved content',
      icon: Library,
      color: 'from-amber-500 to-amber-600',
      category: 'resources',
      route: user ? '/library' : '/login',
      featured: false,
      views: 'N/A',
      rating: 4.7,
      isNew: false,
      requiresAuth: true
    },
    {
      id: 'guidelines',
      title: 'Community Guidelines',
      description: 'Learn about our community standards',
      icon: Shield,
      color: 'from-gray-500 to-gray-600',
      category: 'resources',
      route: '/community-guidelines',
      featured: false,
      views: '5K+',
      rating: 4.5,
      isNew: false
    },
    {
      id: 'about',
      title: 'About Us',
      description: 'Learn more about our platform and mission',
      icon: Users,
      color: 'from-blue-600 to-blue-700',
      category: 'resources',
      route: '/about',
      featured: false,
      views: '7K+',
      rating: 4.6,
      isNew: false
    },
    {
      id: 'contact',
      title: 'Help & Support',
      description: 'Get answers to your questions',
      icon: HelpCircle,
      color: 'from-orange-500 to-orange-600',
      category: 'resources',
      route: '/contact',
      featured: false,
      views: '3K+',
      rating: 4.4,
      isNew: false
    }
  ];

  // Filter apps based on selected category and search query
  const filteredApps = allApps.filter(app => {
    const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
    const matchesSearch = app.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          app.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  // Set featured apps on mount
  useEffect(() => {
    const featured = allApps.filter(app => app.featured);
    setFeaturedApps(featured);
    
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  // Scroll functions
  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 340; // Card width + gap
      const newScrollPosition = scrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollRef.current.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      });
    }
  };

  // Handle app click
  const handleAppClick = (app) => {
    // If app requires authentication and user is not logged in, redirect to login
    if (app.requiresAuth && !user) {
      navigate('/login');
      return;
    }
    
    navigate(app.route);
  };

  // Loading animation
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-gradient-to-br from-gray-50 to-white">
        <div className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-yellow-200 rounded-full"></div>
              <div className="w-24 h-24 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <div className="mt-8 text-center">
              <h1 className="text-3xl font-black text-gray-900 mb-2">Loading Platform</h1>
              <p className="text-gray-600">Preparing your experience...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gradient-to-br from-gray-50 to-white">
      {/* Header Section */}
      <div className="bg-white shadow-sm p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900">
                Welcome to <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">UROWN</span>
              </h1>
              <p className="text-gray-600 mt-1">Choose where you'd like to explore</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-yellow-100 text-yellow-600' : 'text-gray-500 hover:bg-gray-100'}`}
                aria-label="Grid view"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-yellow-100 text-yellow-600' : 'text-gray-500 hover:bg-gray-100'}`}
                aria-label="List view"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for apps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>
          
          {/* Category Filter */}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                    selectedCategory === category.id
                      ? 'bg-yellow-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="font-medium">{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Featured Apps Section */}
          {featuredApps.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                  Featured Apps
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => scroll('left')}
                    className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => scroll('right')}
                    className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
                    aria-label="Scroll right"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="relative">
                <div ref={scrollRef} className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide scroll-smooth">
                  <div className="flex gap-4" style={{ minWidth: 'min-content' }}>
                    {featuredApps.map((app) => {
                      const IconComponent = app.icon;
                      return (
                        <div
                          key={app.id}
                          onClick={() => handleAppClick(app)}
                          className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 overflow-hidden flex-shrink-0 w-64"
                        >
                          <div className={`h-32 bg-gradient-to-br ${app.color} p-4 flex items-center justify-center relative`}>
                            <IconComponent className="w-12 h-12 text-white" />
                            {app.isNew && (
                              <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                NEW
                              </div>
                            )}
                            {app.requiresAuth && !user && (
                              <div className="absolute top-2 right-2 bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded-full">
                                LOGIN
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <h3 className="font-bold text-gray-900 text-lg mb-1">{app.title}</h3>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{app.description}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${i < Math.floor(app.rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-600">{app.rating}</span>
                              </div>
                              <span className="text-sm text-gray-500">{app.views}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* All Apps Grid/List */}
          <section>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-4">
              All Apps
              <span className="ml-2 text-sm font-normal text-gray-600">({filteredApps.length})</span>
            </h2>
            
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredApps.map((app) => {
                  const IconComponent = app.icon;
                  return (
                    <div
                      key={app.id}
                      onClick={() => handleAppClick(app)}
                      className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 overflow-hidden"
                    >
                      <div className={`h-24 bg-gradient-to-br ${app.color} p-4 flex items-center justify-center relative`}>
                        <IconComponent className="w-10 h-10 text-white" />
                        {app.isNew && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            NEW
                          </div>
                        )}
                        {app.requiresAuth && !user && (
                          <div className="absolute top-2 right-2 bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded-full">
                            LOGIN
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="font-bold text-gray-900 mb-1">{app.title}</h3>
                        <p className="text-gray-600 text-xs line-clamp-2 mb-2">{app.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${i < Math.floor(app.rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">{app.views}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredApps.map((app) => {
                  const IconComponent = app.icon;
                  return (
                    <div
                      key={app.id}
                      onClick={() => handleAppClick(app)}
                      className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer p-4 flex items-center gap-4"
                    >
                      <div className={`w-16 h-16 bg-gradient-to-br ${app.color} rounded-xl p-3 flex items-center justify-center flex-shrink-0 relative`}>
                        <IconComponent className="w-8 h-8 text-white" />
                        {app.isNew && (
                          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            NEW
                          </div>
                        )}
                        {app.requiresAuth && !user && (
                          <div className="absolute -top-1 -right-1 bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded-full">
                            LOGIN
                          </div>
                        )}
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-bold text-gray-900 text-lg">{app.title}</h3>
                        <p className="text-gray-600 text-sm">{app.description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < Math.floor(app.rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                            />
                          ))}
                          <span className="text-sm text-gray-600 ml-1">{app.rating}</span>
                        </div>
                        <span className="text-sm text-gray-500">{app.views}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Footer Section */}
      <div className="bg-white shadow-sm p-4 text-center">
        <p className="text-sm text-gray-600">
          Need help? <span className="text-yellow-600 cursor-pointer hover:underline font-medium">Contact Support</span>
        </p>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scroll-smooth {
          scroll-behavior: smooth;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

export default SelectPages;