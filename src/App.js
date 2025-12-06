// App.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { UserProvider, useUser } from './context/UserContext';
import './utils/debugApi';
import Header from './components/Header';
import Footer from './components/Footer';
import SelectPages from './components/SelectPages'; // Import the new component
import HomePage from './pages/misc/HomePage';
import SignupPage from './pages/auth/SignupPage';
import LoginPage from './pages/auth/LoginPage';
import Dashboard from './pages/user/Dashboard';
import SettingsPage from './pages/user/SettingsPage';
import BrowseArticles from './pages/articles/BrowseArticles';
import WriteArticle from './pages/articles/WriteArticle';
import ArticlePage from './pages/articles/ArticlePage';
import WriteCounterPage from './pages/articles/WriteCounterPage';
import DebateCategoryPage from './pages/debates/DebateCategoryPage';
import WriteDebateOpinion from './pages/debates/WriteDebateOpinion';
import CreateDebateTopic from './pages/debates/CreateDebateTopic';
import AdminWriteArticle from './pages/admin/AdminWriteArticle';
import AdminDashboard from './pages/admin/AdminDashboard';
import EditorialBoard from './pages/admin/EditorialBoard';
import ContactPage from './pages/misc/ContactPage';
import ContactDashboard from './pages/admin/ContactDashboard';
import IdeologyQuiz from './pages/misc/IdeologyQuiz';
import BrowseRedFlaggedPage from './pages/redflagged/BrowseRedFlaggedPage';
import WriteRedFlaggedPage from './pages/redflagged/WriteRedFlaggedPage';
import RedFlaggedPostPage from './pages/redflagged/RedFlaggedPostPage';
import AdminRedFlaggedDashboard from './pages/admin/AdminRedFlaggedDashboard';
import AdminRedFlaggedTopics from './pages/admin/AdminRedFlaggedTopics';
import ReportedArticlesDashboard from './pages/admin/ReportedArticlesDashboard';
import CommunityGuidelines from './pages/info/CommunityGuidelines';
import PartnersPage from './pages/misc/PartnersPage';
import UserProfile from './pages/user/UserProfile';
import NotificationsPage from './pages/user/NotificationsPage';
import About from './pages/misc/AboutUsPage';
import LibraryPage from './pages/misc/LibraryPage';
import CareerPage from './pages/info/CareersPage';
import LeaderboardPage from './pages/misc/LeaderboardPage';
import GlobalError from './components/GlobalError';

// Import ebook-related pages
import BrowseEbookPage from './pages/ebooks/BrowseEbookPage';
import EbookInformationPage from './pages/ebooks/EbookInformationPage';
import BookChaptersInfoPage from './pages/ebooks/BookChaptersInfoPage';
import ReadEbookPage from './pages/ebooks/ReadEbookPage';
import WriteEbookPage from './pages/ebooks/WriteEbookPage';
import EditEbookPage from './pages/ebooks/EditEbookPage';
import AdminWriteEbook from './pages/admin/AdminWriteEbook';

const API_URL = process.env.NODE_ENV === 'production' 
  ? process.env.REACT_APP_API_URL_PROD
  : process.env.REACT_APP_API_URL_DEV;

axios.defaults.baseURL = API_URL;
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function AppRoutes() {
  const { user, loading, logout, authError } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <div className="text-2xl font-bold mt-4">LOADING...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white text-black">
      <GlobalError />
      <Header user={user} onLogout={logout} />
      <main className="flex-grow">
        <Routes>
          {/* Main Routes */}
          <Route path="/" element={<SelectPages />} /> {/* Use SelectPages as default */}
          <Route path="/homepage" element={<HomePage />} /> {/* Add explicit route for HomePage */}
          <Route path="/browse" element={<BrowseArticles />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/article/:id/:slug?" element={<ArticlePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/debate/:id" element={<DebateCategoryPage />} />
          <Route path="/debate/:id/write" element={<WriteDebateOpinion />} />
          <Route path="/user/:display_name" element={<UserProfile />} />
          {/* Auth Routes */}
          <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <SignupPage />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/settings" element={user ? <SettingsPage /> : <Navigate to="/login" />} />
          <Route path="/write" element={user ? <WriteArticle /> : <Navigate to="/login" />} />
          <Route path="/write-counter" element={user ? <WriteCounterPage /> : <Navigate to="/login" />} />

          {/* Ebook Routes */}
          <Route path="/ebooks" element={<BrowseEbookPage />} />
          <Route path="/ebooks/:slug" element={<EbookInformationPage />} />
          <Route path="/ebooks/:slug/chapters" element={<BookChaptersInfoPage />} />
          <Route path="/ebooks/:slug/read" element={<ReadEbookPage />} />
          <Route path="/ebooks/:slug/read/:chapterId" element={<ReadEbookPage />} />
          <Route path="/write-ebook" element={user ? <WriteEbookPage /> : <Navigate to="/login" />} />
          <Route path="/edit-ebook/:id" element={user ? <EditEbookPage /> : <Navigate to="/login" />} />

          {/* Admin Routes */}
          <Route path="/admin" element={user && (user.role === 'admin' || user.role === 'super-admin') ? <AdminDashboard /> : <Navigate to="/" />} />
          <Route path="/admin/contacts" element={user && user.role === 'super-admin' ? <ContactDashboard /> : <Navigate to="/" />} />
          <Route path="/admin/reported-articles" element={user && (user.role === 'admin' || user.role === 'super-admin') ? <ReportedArticlesDashboard /> : <Navigate to="/" />} />
          <Route path="/admin/write-article" element={user && (user.role === 'admin' || user.role === 'super-admin') ? <AdminWriteArticle /> : <Navigate to="/" />} />
          <Route path="/admin/write-ebook" element={user && (user.role === 'admin' || user.role === 'super-admin') ? <AdminWriteEbook /> : <Navigate to="/" />} />

          {/* Editorial Routes */}
          <Route path="/editorial" element={user && (user.role === 'editorial-board' || user.role === 'admin' || user.role === 'super-admin') ? <EditorialBoard /> : <Navigate to="/" />} />
          <Route path="/editorial/create-debate" element={user && (user.role === 'editorial-board' || user.role === 'admin' || user.role === 'super-admin') ? <CreateDebateTopic /> : <Navigate to="/" />} />

          {/* Other Protected Routes */}
          <Route path="/ideology-quiz" element={user ? <IdeologyQuiz /> : <Navigate to="/login" />} />
          <Route path="/notifications" element={user ? <NotificationsPage /> : <Navigate to="/login" />} />
          <Route path="/library" element={user ? <LibraryPage /> : <Navigate to="/login" />} />

          {/* RedFlagged Routes */}
          <Route path="/redflagged" element={<BrowseRedFlaggedPage />} />
          <Route path="/redflagged/write" element={<WriteRedFlaggedPage />} />
          <Route path="/redflagged/:id" element={<RedFlaggedPostPage />} />
          <Route path="/admin/redflagged" element={user && (user.role === 'admin' || user.role === 'super-admin') ? <AdminRedFlaggedDashboard /> : <Navigate to="/" />} />
          <Route path="/admin/redflagged/topics" element={user && (user.role === 'admin' || user.role === 'super-admin' || user.role === 'editorial-board') ? <AdminRedFlaggedTopics /> : <Navigate to="/" />} />

          {/* Info Pages */}
          <Route path="/community-guidelines" element={<CommunityGuidelines />} />
          <Route path="/about" element={<About />} />
          <Route path="/partners" element={<PartnersPage />} />
          <Route path="/careers" element={<CareerPage />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <UserProvider>
      <AppRoutes />
    </UserProvider>
  );
}

export default App;