// src/App.js - UPDATED EBOOK ROUTES
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { UserProvider, useUser } from './context/UserContext';
import './utils/debugApi';
import Header from './components/Header';
import Footer from './components/Footer';
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

// EBOOK IMPORTS - These are the only ebook files you need
import BrowseEbooksPage from './pages/ebooks/BrowseEbooksPage';
import WriteEbookPage from './pages/ebooks/WriteEbookPage';
import WriteEbookChapterPage from './pages/ebooks/WriteEbookChapterPage';
import EbookPage from './pages/ebooks/EbookPage';
import ReadEbookChapterPage from './pages/ebooks/ReadEbookChapterPage';
import EditEbookPage from './pages/ebooks/EditEbookPage';

import GlobalError from './components/GlobalError';

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
          <Route path="/" element={<HomePage />} />
          <Route path="/browse" element={<BrowseArticles />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/article/:id/:slug?" element={<ArticlePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/debate/:id" element={<DebateCategoryPage />} />
          <Route path="/debate/:id/write" element={<WriteDebateOpinion />} />
          <Route path="/user/:display_name" element={<UserProfile />} />

          {/* EBOOK ROUTES - Simplified and Fixed */}
          {/* Public browsing */}
          <Route path="/ebooks" element={<BrowseEbooksPage />} />
          <Route path="/ebooks/:id" element={<EbookPage />} />
          <Route path="/ebooks/:id/read" element={<ReadEbookChapterPage />} />
          <Route path="/ebooks/:id/read/:chapterId" element={<ReadEbookChapterPage />} />
          
          {/* Protected writing/editing routes */}
          <Route path="/ebooks/write" element={user ? <WriteEbookPage /> : <Navigate to="/login" />} />
          <Route path="/ebooks/write/:ebookId/chapter" element={user ? <WriteEbookChapterPage /> : <Navigate to="/login" />} />
          <Route path="/ebooks/edit/:id" element={user ? <EditEbookPage /> : <Navigate to="/login" />} />

          {/* Auth Routes */}
          <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <SignupPage />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/settings" element={user ? <SettingsPage /> : <Navigate to="/login" />} />
          <Route path="/write" element={user ? <WriteArticle /> : <Navigate to="/login" />} />
          <Route path="/write-counter" element={user ? <WriteCounterPage /> : <Navigate to="/login" />} />

          {/* Admin Routes */}
          <Route path="/admin" element={user && (user.role === 'admin' || user.role === 'super-admin') ? <AdminDashboard /> : <Navigate to="/" />} />
          <Route path="/admin/contacts" element={user && user.role === 'super-admin' ? <ContactDashboard /> : <Navigate to="/" />} />
          <Route path="/admin/reported-articles" element={user && (user.role === 'admin' || user.role === 'super-admin') ? <ReportedArticlesDashboard /> : <Navigate to="/" />} />
          <Route path="/admin/write-article" element={user && (user.role === 'admin' || user.role === 'super-admin') ? <AdminWriteArticle /> : <Navigate to="/" />} />

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