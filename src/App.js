// src/App.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { UserProvider, useUser } from './context/UserContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import SettingsPage from './pages/SettingsPage';
import BrowseArticles from './pages/BrowseArticles';
import WriteArticle from './pages/WriteArticle';
import ArticlePage from './pages/ArticlePage';
import WriteCounterPage from './pages/WriteCounterPage';
import DebateCategoryPage from './pages/DebateCategoryPage';
import WriteDebateOpinion from './pages/WriteDebateOpinion';
import CreateDebateTopic from './pages/CreateDebateTopic';
import AdminDashboard from './pages/AdminDashboard';
import EditorialBoard from './pages/EditorialBoard';
import ContactPage from './pages/ContactPage';
import ContactDashboard from './pages/ContactDashboard';
import ReportedArticlesDashboard from './pages/ReportedArticlesDashboard';
import EbookWritingPage from './pages/EbookWritingPage';
import EBookCatalogPage from './pages/EBookCatalogPage';
import EBookReadingPage from './pages/EBookReadingPage';
import CommunityGuidelines from './pages/important/CommunityGuidelines';
import GlobalError from './components/GlobalError';

const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://urown-backend.onrender.com/api'  // Your Render backend URL
  : 'http://localhost:5000/api';

// Configure axios defaults
axios.defaults.baseURL = API_URL;
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// App Routes Component (inside UserProvider)
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
          <Route path="/" element={<HomePage />} />
          <Route path="/browse" element={<BrowseArticles />} />
          <Route path="/article/:id/:slug?" element={<ArticlePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/write-ebook" element={user ? <EbookWritingPage /> : <Navigate to="/login" />} />
<Route path="/ebooks" element={<EBookCatalogPage />} />
<Route path="/ebook/:id" element={<EBookReadingPage />} />
          <Route path="/debate/:id" element={<DebateCategoryPage />} />
          <Route path="/debate/:id/write" element={<WriteDebateOpinion />} />
          <Route 
            path="/signup" 
            element={user ? <Navigate to="/dashboard" /> : <SignupPage />} 
          />
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" /> : <LoginPage />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard /> : <Navigate to="/login" />} 
          />
          <Route 
          path="/settings" 
          element={user ? <SettingsPage /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/write" 
            element={user ? <WriteArticle /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/write-counter" 
            element={user ? <WriteCounterPage /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin" 
            element={user && (user.role === 'admin' || user.role === 'super-admin') ? <AdminDashboard /> : <Navigate to="/" />} 
          />
          <Route 
            path="/admin/contacts" 
            element={user && user.role === 'super-admin' ? <ContactDashboard /> : <Navigate to="/" />} 
          />
          <Route 
    path="/admin/reported-articles" 
    element={user && (user.role === 'admin' || user.role === 'super-admin') ? <ReportedArticlesDashboard /> : <Navigate to="/" />} 
  />
          <Route 
            path="/editorial" 
            element={user && (user.role === 'editorial-board' || user.role === 'admin' || user.role === 'super-admin') ? <EditorialBoard /> : <Navigate to="/" />} 
          />
          <Route 
            path="/editorial/create-debate" 
            element={user && (user.role === 'editorial-board' || user.role === 'admin' || user.role === 'super-admin') ? <CreateDebateTopic /> : <Navigate to="/" />} 
          />
          <Route path="/community-guidelines" element={<CommunityGuidelines />} />
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