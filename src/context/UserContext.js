// context/UserContext.js - Improved version with better error recovery
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { fetchWithRetry, handleUnauthorized } from '../utils/apiUtils';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const verifyToken = async () => {
        try {
          console.log('Verifying token...');
          const response = await fetchWithRetry(() => 
            axios.get('/user/profile', {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }),
            3, // maxRetries (reduced from 5)
            1000 // initialDelay (reduced from 2000)
          );
          console.log('Token verified successfully:', response.data.user);
          setUser(response.data.user);
          setAuthError(null);
        } catch (error) {
          console.error('Error verifying token:', error);
          console.error('Error response:', error.response);
          
          // Handle different error scenarios
          if (error.response) {
            const status = error.response.status;
            const errorMessage = error.response.data?.error;
            
            if (status === 401 || status === 403) {
              // Authentication/authorization error - clear token
              console.log('Auth error, clearing token');
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUser(null);
              setAuthError(errorMessage || 'Your session has expired. Please log in again.');
            } else if (status === 404) {
              // User not found - clear token
              console.log('User not found, clearing token');
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUser(null);
              setAuthError('Account not found. Please contact support.');
            } else if (status === 500 || status === 503) {
              // Server error - keep token, show error but don't log out
              console.log('Server error, keeping token and showing error');
              setAuthError('Server error. Your session is still valid. Please refresh the page.');
              // Don't clear user/token on server errors
            } else {
              // Other errors - keep token
              console.log('Unknown error, keeping token');
              setAuthError('Unable to verify your session. Please refresh the page.');
            }
          } else if (error.request) {
            // Network error - keep token
            console.log('Network error, keeping token');
            setAuthError('Network error. Please check your connection and refresh the page.');
            // Don't clear user/token on network errors
          } else {
            // Other errors
            console.log('Unexpected error:', error.message);
            setAuthError('An unexpected error occurred. Please refresh the page.');
          }
        } finally {
          setLoading(false);
        }
      };
      
      verifyToken();
    } else {
      console.log('No token found');
      setLoading(false);
    }
  }, []);

  // Add a function to check if user is banned
  const checkBanStatus = async () => {
    if (!user || !localStorage.getItem('token')) return;
    
    try {
      const response = await axios.get('/user/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data.user;
    } catch (error) {
      // Only handle auth errors
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        handleUnauthorized(error);
      }
      // Don't throw on other errors - just log them
      console.error('Ban status check error:', error);
      return null;
    }
  };

  // Check ban status periodically (every 5 minutes)
  useEffect(() => {
    if (user && localStorage.getItem('token')) {
      const interval = setInterval(() => {
        checkBanStatus().catch(error => {
          console.error('Error checking ban status:', error);
        });
      }, 5 * 60 * 1000); // 5 minutes
      
      return () => clearInterval(interval);
    }
  }, [user]);

  const updateUser = (userData) => {
    setUser(userData);
    setAuthError(null);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setAuthError(null);
  };

  const login = (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    setUser(userData);
    setAuthError(null);
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      updateUser, 
      logout, 
      login, 
      loading, 
      authError,
      checkBanStatus 
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext;