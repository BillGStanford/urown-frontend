// src/App.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { UserProvider, useUser } from './context/UserContext';
import './utils/debugApi';
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
import AdminWriteArticle from './pages/AdminWriteArticle';
import AdminDashboard from './pages/AdminDashboard';
import EditorialBoard from './pages/EditorialBoard';
import ContactPage from './pages/ContactPage';
import ContactDashboard from './pages/ContactDashboard';
import IdeologyQuiz from './pages/IdeologyQuiz';
import BrowseRedFlaggedPage from './pages/BrowseRedFlaggedPage';
import WriteRedFlaggedPage from './pages/WriteRedFlaggedPage';
import RedFlaggedPostPage from './pages/RedFlaggedPostPage';
import AdminRedFlaggedDashboard from './pages/AdminRedFlaggedDashboard';
import ReportedArticlesDashboard from './pages/ReportedArticlesDashboard';
import CommunityGuidelines from './pages/important/CommunityGuidelines';
import PartnersPage from './pages/PartnersPage';
import UserProfile from './pages/UserProfile';
import NotificationsPage from './pages/NotificationsPage';
import About from './pages/AboutUsPage';
import LibraryPage from './pages/LibraryPage';
import CareerPage from './pages/important/CareersPage';
import GlobalError from './components/GlobalError';

const API_URL = process.env.NODE_ENV === 'production' 
  ? process.env.REACT_APP_API_URL_PROD
  : process.env.REACT_APP_API_URL_DEV;

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
          <Route path="/debate/:id" element={<DebateCategoryPage />} />
          <Route path="/debate/:id/write" element={<WriteDebateOpinion />} />
            <Route path="/user/:display_name" element={<UserProfile />} />
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
  path="/admin/write-article" 
  element={user && (user.role === 'admin' || user.role === 'super-admin') ? <AdminWriteArticle /> : <Navigate to="/" />} 
/>
          <Route 
            path="/editorial" 
            element={user && (user.role === 'editorial-board' || user.role === 'admin' || user.role === 'super-admin') ? <EditorialBoard /> : <Navigate to="/" />} 
          />
          <Route 
            path="/editorial/create-debate" 
            element={user && (user.role === 'editorial-board' || user.role === 'admin' || user.role === 'super-admin') ? <CreateDebateTopic /> : <Navigate to="/" />} 
          />
          <Route 
  path="/ideology-quiz" 
  element={user ? <IdeologyQuiz /> : <Navigate to="/login" />} 
/>
<Route 
  path="/notifications" 
  element={user ? <NotificationsPage /> : <Navigate to="/login" />} 
/>
<Route 
  path="/library" 
  element={user ? <LibraryPage /> : <Navigate to="/login" />} 
/>
{/* RedFlagged Routes */}
<Route path="/redflagged" element={<BrowseRedFlaggedPage />} />
<Route path="/redflagged/write" element={<WriteRedFlaggedPage />} />
<Route path="/redflagged/:id" element={<RedFlaggedPostPage />} />
<Route 
  path="/admin/redflagged" 
  element={user && (user.role === 'admin' || user.role === 'super-admin') ? <AdminRedFlaggedDashboard /> : <Navigate to="/" />} 
/>
          <Route path="/community-guidelines" element={<CommunityGuidelines />} />
          <Route path="/about" element={<About />} />
          <Route path="/partners" element={<PartnersPage />} />
          <Route path="/careers" element={<CareerPage />} />
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