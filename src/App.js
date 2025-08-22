import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import UserDashboard from './pages/UserDashboard';
import WritersPage from './pages/WritersPage';
import ArticleReadingPage from './pages/ArticleReadingPage';
import AdminPanel from './pages/admins/AdminPanel'; // Import the AdminPanel
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (token) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // Handle banned users
        const errorData = await response.json();
        if (errorData.banned) {
          alert(`Your account is banned.\nReason: ${errorData.banReason}\nTime remaining: ${errorData.timeLeft || 'Unknown'}`);
        }
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Check if user has admin access
  const isAdmin = user && (user.role === 'admin' || user.role === 'super-admin');

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-6xl font-black tracking-tighter animate-pulse">UROWN</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage user={user} logout={logout} />} />
          <Route 
            path="/signup" 
            element={user ? <Navigate to="/dashboard" /> : <SignUpPage login={login} />} 
          />
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" /> : <LoginPage login={login} />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <UserDashboard user={user} logout={logout} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/write" 
            element={user ? <WritersPage user={user} logout={logout} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/article/:id" 
            element={<ArticleReadingPage user={user} logout={logout} />}
          />
          <Route 
            path="/admin" 
            element={
              isAdmin ? 
                <AdminPanel user={user} logout={logout} /> : 
                <Navigate to="/" />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;