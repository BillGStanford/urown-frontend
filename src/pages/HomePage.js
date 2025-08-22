import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ArticleCard from '../components/ArticleCard';
import FeaturedArticles from '../components/FeaturedArticles';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const HomePage = ({ user, logout }) => {
  const [articles, setArticles] = useState([]);
  const [trendingArticles, setTrendingArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isOffline, setIsOffline] = useState(false);

  // Load offline articles from local data
  const loadOfflineArticles = async () => {
    try {
      // Try to import the articles from the data folder
      const response = await import('../data/articles.json');
      const offlineArticles = response.default || [];
      
      // Filter and sort articles
      const publishedArticles = offlineArticles
        .filter(article => article.status === 'published')
        .sort((a, b) => {
          const tierPriority = { diamond: 1, platinum: 2, gold: 3, silver: 4 };
          if (tierPriority[a.authorTier] !== tierPriority[b.authorTier]) {
            return tierPriority[a.authorTier] - tierPriority[b.authorTier];
          }
          return new Date(b.createdAt) - new Date(a.createdAt);
        });

      // Get trending articles (most viewed in last week)
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const trending = offlineArticles
        .filter(article => 
          article.status === 'published' && 
          new Date(article.createdAt) >= oneWeekAgo
        )
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 3);

      setArticles(publishedArticles);
      setTrendingArticles(trending);
      setIsOffline(true);
      return true;
    } catch (error) {
      console.error('Error loading offline articles:', error);
      return false;
    }
  };

  // Fetch articles from API
  const fetchOnlineArticles = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };

      const [articlesResponse, trendingResponse] = await Promise.all([
        fetch('/api/articles', { headers }),
        fetch('/api/articles/trending', { headers })
      ]);

      if (!articlesResponse.ok || !trendingResponse.ok) {
        throw new Error('API request failed');
      }

      const articlesData = await articlesResponse.json();
      const trendingData = await trendingResponse.json();

      setArticles(Array.isArray(articlesData) ? articlesData : []);
      setTrendingArticles(Array.isArray(trendingData) ? trendingData : []);
      setIsOffline(false);
      return true;
    } catch (error) {
      console.error('Error fetching online articles:', error);
      return false;
    }
  };

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      
      // First try to fetch from API
      const onlineSuccess = await fetchOnlineArticles();
      
      // If online fetch fails, try offline data
      if (!onlineSuccess) {
        console.log('Backend appears to be offline, loading cached articles...');
        const offlineSuccess = await loadOfflineArticles();
        
        if (!offlineSuccess) {
          // If both fail, set empty arrays
          setArticles([]);
          setTrendingArticles([]);
          setIsOffline(true);
        }
      }
      
      setLoading(false);
    };

    fetchArticles();
  }, []);

  const filteredArticles = selectedCategory === 'ALL'
    ? articles
    : articles.filter((article) => article.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-6xl font-black tracking-tighter animate-pulse">UROWN</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        user={user}
        logout={logout}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {isOffline && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mx-4 mt-4 rounded">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm font-medium">
                No connection? No problem. 💫 We’ve saved some of your favorite articles so you can keep enjoying them anytime, anywhere—even offline. 📚💖

Some features might be resting for now, but your reading journey doesn’t have to stop. 🌸

This is our BETA version, still learning and growing. 🌱 Thank you for your patience and for being part of this adventure with us—you make it all worthwhile. 💌
              </p>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="mb-12">
          <FeaturedArticles isOffline={isOffline} />
        </section>

        {Array.isArray(trendingArticles) && trendingArticles.length > 0 && (
          <section className="mb-12">
            <div className="border-b-4 border-black mb-8 pb-4">
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter">
                TRENDING NOW
                {isOffline && <span className="text-sm font-normal text-gray-600 ml-2">(Cached)</span>}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {trendingArticles.map((article) => (
                <ArticleCard key={article.id} article={article} variant="trending" isOffline={isOffline} />
              ))}
            </div>
          </section>
        )}

        <section className="mb-12">
          <div className="border-b-4 border-black mb-8 pb-4">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter">
              LATEST
              {isOffline && <span className="text-sm font-normal text-gray-600 ml-2">(Cached)</span>}
            </h2>
          </div>

          {filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map((article) => (
                <ArticleCard key={article.id} article={article} variant="featured" isOffline={isOffline} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">
                {isOffline 
                  ? "No cached articles available. Please check your internet connection and refresh the page."
                  : "No articles found in this category."
                }
              </div>
            </div>
          )}
        </section>

        {!user && (
          <section className="bg-black text-white p-12 border-4 border-black">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-black mb-6 tracking-tighter">
                BECOME A UROWN WRITER
              </h2>
              <p className="text-xl font-bold mb-8 max-w-3xl mx-auto">
                JOIN THE WORLD'S BOLDEST PUBLISHING PLATFORM. SHARE YOUR STORIES WITH THE WORLD.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/signup"
                  className={`bg-white text-black px-8 py-4 font-black text-lg border-2 border-white transition-colors ${
                    isOffline 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={isOffline ? (e) => e.preventDefault() : undefined}
                >
                  START WRITING TODAY
                  {isOffline && <span className="text-xs block">(Offline)</span>}
                </Link>
                <Link
                  to="/login"
                  className={`bg-transparent text-white px-8 py-4 font-black text-lg border-2 border-white transition-colors ${
                    isOffline 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-white hover:text-black'
                  }`}
                  onClick={isOffline ? (e) => e.preventDefault() : undefined}
                >
                  ALREADY A WRITER? LOG IN
                  {isOffline && <span className="text-xs block">(Offline)</span>}
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;