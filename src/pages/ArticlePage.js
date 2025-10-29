import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Flag, 
  ChevronDown, 
  ChevronUp, 
  Award, 
  MessageSquare, 
  Share2, 
  Copy, 
  Eye, 
  X, 
  Clock, 
  Shuffle, 
  Moon, 
  Sun,
  BookmarkPlus,
  Bookmark,
  TrendingUp,
  Users,
  Calendar,
  Check,
  ExternalLink,
  MoreHorizontal
} from 'lucide-react';

// Mock data for demonstration
const mockArticle = {
  id: 1,
  title: "Opinion | The Future of Digital Publishing: Why Independent Voices Matter More Than Ever",
  content: `The landscape of digital publishing has undergone a seismic shift over the past decade. Traditional media outlets, once the gatekeepers of public discourse, now find themselves competing with a democratized ecosystem of independent creators, citizen journalists, and opinion leaders who command audiences in the millions.

This transformation isn't just about technology—it's about trust. Recent studies show that 67% of readers prefer independent voices over traditional media brands, citing authenticity and diverse perspectives as primary factors. The old model of one-way communication from publisher to reader has been replaced by dynamic, participatory platforms where the audience isn't just consuming content—they're shaping it.

Consider the rise of Substack writers who've left prestigious publications to build direct relationships with their readers. Or the podcast hosts who've cultivated communities that rival cable news audiences. These aren't anomalies; they're harbingers of journalism's future.

The implications are profound. When writers own their relationship with readers, when they're not beholden to advertisers or editorial boards with conflicting interests, the quality of discourse improves. Nuance returns. Complexity is embraced rather than flattened for mass appeal.

Critics argue this model lacks the institutional rigor of traditional journalism—the fact-checkers, editors, and legal teams that ensure accuracy. But this criticism misses the point. The new model doesn't eliminate gatekeeping; it distributes it. Readers become the editors, using their attention and subscriptions to signal quality. Communities self-moderate. Bad actors are identified and marginalized not by institutional decree but by collective judgment.

This isn't to say the transition is without challenges. The same democratization that empowers authentic voices also enables misinformation. The economics of attention can reward sensationalism over substance. Platform algorithms can create echo chambers that reinforce rather than challenge our beliefs.

Yet these challenges aren't arguments against the new model—they're calls to refine it. We need better tools for verification, more sophisticated recommendation algorithms, and stronger community standards. We need platforms that reward depth alongside engagement, that value long-form analysis as much as viral moments.

The future of publishing isn't about choosing between institutional media and independent creators. It's about building an ecosystem that harnesses the strengths of both: the resources and accountability of institutions combined with the authenticity and agility of independents.

What excites me most isn't the technology—it's the renaissance of ideas this moment enables. When anyone with something meaningful to say can reach an audience, when readers can directly support the voices they value, we create conditions for a more vibrant, diverse, and ultimately more truthful public discourse.

The question isn't whether independent publishing will succeed. It already has. The question is whether we'll build the infrastructure—social, technical, and economic—to help it reach its full potential. That's the work ahead, and it's work worth doing.`,
  display_name: "Sarah Mitchell",
  tier: "gold",
  views: 12847,
  created_at: "2025-01-15T10:30:00Z",
  certified: true,
  featured: true,
  topics: ["Media", "Technology", "Journalism"],
  reading_time: 8,
  engagement_score: 94
};

const mockCounterOpinions = [
  {
    id: 2,
    title: "Opinion | Traditional Media Still Matters: Why Institutional Journalism Can't Be Replaced",
    display_name: "David Chen",
    tier: "platinum",
    content: "While independent voices have merit, we're witnessing a dangerous erosion of professional standards...",
    views: 8234,
    engagement_score: 87
  },
  {
    id: 3,
    title: "Opinion | The Middle Path: Combining Independent Spirit with Editorial Rigor",
    display_name: "Maria Rodriguez",
    tier: "gold",
    content: "Neither extreme serves readers well. The future lies in hybrid models that preserve the best of both worlds...",
    views: 6521,
    engagement_score: 82
  }
];

const mockRelatedArticles = [
  {
    id: 4,
    title: "Opinion | How Social Media Algorithms Are Reshaping Public Opinion",
    display_name: "James Anderson",
    tier: "silver",
    views: 15234,
    reading_time: 6
  },
  {
    id: 5,
    title: "Opinion | The Economics of Attention in the Digital Age",
    display_name: "Lisa Park",
    tier: "gold",
    views: 11456,
    reading_time: 7
  }
];

const ArticlePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article] = useState(mockArticle);
  const [counterOpinions] = useState(mockCounterOpinions);
  const [relatedArticles] = useState(mockRelatedArticles);
  const [darkMode, setDarkMode] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [showCounters, setShowCounters] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [activeSection, setActiveSection] = useState('article');
  const articleContentRef = useRef(null);

  // Handle scroll for reading progress
  useEffect(() => {
    const handleScroll = () => {
      if (!articleContentRef.current) return;
      
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const trackLength = documentHeight - windowHeight;
      const progress = (scrollTop / trackLength) * 100;
      
      setReadingProgress(Math.min(progress, 100));

      // Determine active section
      const sections = ['article', 'discussion', 'related'];
      sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getTierColor = (tier) => {
    switch (tier?.toLowerCase()) {
      case 'silver': return 'from-gray-400 to-gray-600';
      case 'gold': return 'from-yellow-400 to-yellow-600';
      case 'platinum': return 'from-cyan-400 to-purple-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getTierEmoji = (tier) => {
    switch (tier?.toLowerCase()) {
      case 'silver': return '🥈';
      case 'gold': return '🥇';
      case 'platinum': return '💎';
      default: return '🥈';
    }
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const title = article.title;
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format content with proper typography
  const formatContent = (content) => {
    return content.split('\n\n').map((paragraph, index) => {
      if (index === 0) {
        // Drop cap for first paragraph
        return (
          <p key={index} className="mb-8 text-xl leading-relaxed first-letter:text-7xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-1">
            {paragraph}
          </p>
        );
      }
      
      // Pull quote every 4th paragraph
      if (index > 0 && index % 4 === 0 && paragraph.length > 100) {
        return (
          <div key={index}>
            <blockquote className={`my-12 py-6 px-8 border-l-4 ${darkMode ? 'border-yellow-500 bg-gray-800/50' : 'border-yellow-500 bg-yellow-50/50'} rounded-r-lg`}>
              <p className="text-2xl font-serif italic leading-relaxed">
                "{paragraph.substring(0, 150)}..."
              </p>
            </blockquote>
            <p className="mb-8 text-xl leading-relaxed">{paragraph}</p>
          </div>
        );
      }
      
      return (
        <p key={index} className="mb-8 text-xl leading-relaxed">
          {paragraph}
        </p>
      );
    });
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-950' : 'bg-gray-50'} transition-colors duration-300`}>
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200 dark:bg-gray-800">
        <div 
          className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-150 shadow-lg"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Floating Action Bar */}
      <div className="fixed top-20 right-8 z-40 flex flex-col gap-3">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-3 rounded-full shadow-xl ${darkMode ? 'bg-gray-800 text-yellow-400' : 'bg-white text-gray-700'} hover:scale-110 transition-all duration-300 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
          title={darkMode ? 'Light Mode' : 'Dark Mode'}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button
          onClick={() => setBookmarked(!bookmarked)}
          className={`p-3 rounded-full shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} hover:scale-110 transition-all duration-300 border ${darkMode ? 'border-gray-700' : 'border-gray-200'} ${bookmarked ? 'text-yellow-500' : darkMode ? 'text-gray-400' : 'text-gray-600'}`}
          title={bookmarked ? 'Remove Bookmark' : 'Bookmark Article'}
        >
          {bookmarked ? <Bookmark size={20} fill="currentColor" /> : <BookmarkPlus size={20} />}
        </button>
        <div className="relative">
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className={`p-3 rounded-full shadow-xl ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-600'} hover:scale-110 transition-all duration-300 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
            title="Share Article"
          >
            <Share2 size={20} />
          </button>
          {showShareMenu && (
            <div className={`absolute right-full mr-3 top-0 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-2xl p-4 border min-w-[200px]`}>
              <div className="space-y-2">
                <button onClick={() => handleShare('twitter')} className={`w-full text-left px-3 py-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors flex items-center gap-2`}>
                  <ExternalLink size={16} />
                  <span>Share on Twitter</span>
                </button>
                <button onClick={() => handleShare('linkedin')} className={`w-full text-left px-3 py-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors flex items-center gap-2`}>
                  <ExternalLink size={16} />
                  <span>Share on LinkedIn</span>
                </button>
                <button onClick={() => handleShare('facebook')} className={`w-full text-left px-3 py-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors flex items-center gap-2`}>
                  <ExternalLink size={16} />
                  <span>Share on Facebook</span>
                </button>
                <button onClick={() => handleShare('email')} className={`w-full text-left px-3 py-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors flex items-center gap-2`}>
                  <ExternalLink size={16} />
                  <span>Share via Email</span>
                </button>
                <hr className={`my-2 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`} />
                <button onClick={handleCopyLink} className={`w-full text-left px-3 py-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors flex items-center gap-2`}>
                  {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                  <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={() => navigate(`/article/${Math.floor(Math.random() * 100)}`)}
          className={`p-3 rounded-full shadow-xl ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-600'} hover:scale-110 transition-all duration-300 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
          title="Random Article"
        >
          <Shuffle size={20} />
        </button>
      </div>

      {/* Main Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Article Header */}
        <header id="article" className="mb-12">
          {/* Topic Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {article.topics?.map((topic, index) => (
              <span key={index} className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                {topic}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className={`text-5xl md:text-6xl font-serif font-bold mb-8 leading-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {article.title}
          </h1>

          {/* Author & Meta Info */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br ${getTierColor(article.tier)} shadow-lg`}>
                <span className="text-2xl">{getTierEmoji(article.tier)}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {article.display_name}
                  </h3>
                  {article.certified && (
                    <Award size={16} className="text-purple-500" title="Editorial Certified" />
                  )}
                </div>
                <div className={`flex items-center gap-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r ${getTierColor(article.tier)} text-white`}>
                    {article.tier?.toUpperCase()}
                  </span>
                  <span>{article.engagement_score}% engagement</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className={`flex flex-wrap items-center gap-6 py-4 border-y ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className="flex items-center gap-2">
              <Calendar size={16} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {formatDate(article.created_at)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {article.reading_time} min read
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Eye size={16} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {article.views.toLocaleString()} views
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Trending
              </span>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <div ref={articleContentRef} className={`prose prose-xl max-w-none mb-16 ${darkMode ? 'prose-invert' : ''}`}>
          <div className={`font-serif ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            {formatContent(article.content)}
          </div>
        </div>

        {/* Engagement Section */}
        <div className={`p-8 rounded-2xl ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border shadow-xl mb-12`}>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h3 className={`text-2xl font-serif font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Have a different perspective?
              </h3>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Join the discussion by writing a counter opinion.
              </p>
            </div>
            <button
              onClick={() => navigate('/write-counter')}
              className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2 whitespace-nowrap"
            >
              <MessageSquare size={20} />
              Write Counter Opinion
            </button>
          </div>
        </div>

        {/* Counter Opinions Section */}
        {counterOpinions.length > 0 && (
          <section id="discussion" className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-3xl font-serif font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Counter Opinions ({counterOpinions.length})
              </h2>
              <button
                onClick={() => setShowCounters(!showCounters)}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
              >
                {showCounters ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>

            {showCounters && (
              <div className="grid gap-6">
                {counterOpinions.map(opinion => (
                  <div
                    key={opinion.id}
                    onClick={() => navigate(`/article/${opinion.id}`)}
                    className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900 border-gray-800 hover:border-gray-700' : 'bg-white border-gray-200 hover:border-gray-300'} border cursor-pointer transition-all duration-300 hover:shadow-xl group`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br ${getTierColor(opinion.tier)} shadow-lg`}>
                          <span className="text-xl">{getTierEmoji(opinion.tier)}</span>
                        </div>
                        <div>
                          <h4 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {opinion.display_name}
                          </h4>
                          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {opinion.tier?.toUpperCase()} • {opinion.engagement_score}% engagement
                          </span>
                        </div>
                      </div>
                      <ExternalLink size={16} className={`${darkMode ? 'text-gray-600' : 'text-gray-400'} group-hover:text-yellow-500 transition-colors`} />
                    </div>
                    <h3 className={`text-xl font-serif font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'} group-hover:text-yellow-600 transition-colors`}>
                      {opinion.title}
                    </h3>
                    <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {opinion.content}
                    </p>
                    <div className="flex items-center gap-4 text-xs">
                      <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        <Eye size={14} />
                        {opinion.views.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section id="related" className="mb-12">
            <h2 className={`text-3xl font-serif font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Related Articles
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {relatedArticles.map(related => (
                <div
                  key={related.id}
                  onClick={() => navigate(`/article/${related.id}`)}
                  className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900 border-gray-800 hover:border-gray-700' : 'bg-white border-gray-200 hover:border-gray-300'} border cursor-pointer transition-all duration-300 hover:shadow-xl group`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br ${getTierColor(related.tier)}`}>
                      <span className="text-sm">{getTierEmoji(related.tier)}</span>
                    </div>
                    <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {related.display_name}
                    </span>
                  </div>
                  <h3 className={`text-lg font-serif font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'} group-hover:text-yellow-600 transition-colors`}>
                    {related.title}
                  </h3>
                  <div className="flex items-center gap-4 text-xs">
                    <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      <Clock size={14} />
                      {related.reading_time} min
                    </span>
                    <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      <Eye size={14} />
                      {related.views.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer Actions */}
        <footer className={`pt-8 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <button
              onClick={() => setShowReportModal(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${darkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'} transition-colors`}
            >
              <Flag size={16} />
              <span className="text-sm font-medium">Report Article</span>
            </button>
            <div className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
              © 2025 UROWN. All opinions expressed are those of the author.
            </div>
          </div>
        </footer>
      </article>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-2xl shadow-2xl max-w-md w-full p-8 relative`}>
            <button
              onClick={() => setShowReportModal(false)}
              className={`absolute top-4 right-4 ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
            >
              <X size={24} />
            </button>
            <h3 className={`text-2xl font-serif font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Report Article
            </h3>
            <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Help us maintain quality by reporting problematic content.
            </p>
            <textarea
              className={`w-full px-4 py-3 rounded-xl ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} border focus:outline-none focus:ring-2 focus:ring-yellow-500 mb-4`}
              rows={4}
              placeholder="Please describe why you're reporting this article..."
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowReportModal(false)}
                className={`flex-1 px-4 py-3 rounded-xl ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'} font-medium transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowReportModal(false);
                  alert('Report submitted. Thank you for helping us maintain quality.');
                }}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold hover:shadow-xl transition-all duration-300"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticlePage;