import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { fetchWithRetry, handleUnauthorized, validateToken, refreshToken } from '../utils/apiUtils';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // First validate the token format and expiration
      if (!validateToken(token)) {
        console.log('Token is invalid or expired, removing from localStorage');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setLoading(false);
        return;
      }
      
      const verifyToken = async () => {
        try {
          const response = await fetchWithRetry(() => 
            axios.get('/user/profile', {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }),
            5, // maxRetries
            2000 // initialDelay
          );
          setUser(response.data.user);
          setAuthError(null);
        } catch (error) {
          console.error('Error verifying token:', error);
          
          // Handle specific error cases
          if (error.response) {
            if (error.response.status === 401) {
              console.log('Token is invalid, removing from localStorage');
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setAuthError(error.response.data.error || 'Your session has expired. Please log in again.');
            } else if (error.response.status === 403) {
              console.log('Access forbidden, removing from localStorage');
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setAuthError(error.response.data.error || 'You do not have permission to access this resource.');
            } else if (error.response.status === 500) {
              console.log('Server error, keeping token');
              setAuthError('Server error. Please try again later.');
            } else {
              // For other errors, keep token and show error
              console.log('Network or server error, keeping token');
              setAuthError('Unable to verify your session. Please try again later.');
            }
          } else {
            // For network errors, keep token and show error
            console.log('Network error, keeping token');
            setAuthError('Network error. Please check your connection and try again.');
          }
        } finally {
          setLoading(false);
        }
      };
      
      verifyToken();
    } else {
      setLoading(false);
    }
  }, []);

  // Add a function to check if user is banned
  const checkBanStatus = async () => {
    if (!user || !localStorage.getItem('token')) return;
    
    try {
      // Make a simple API call to check if user is banned
      const response = await axios.get('/user/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // If we get a successful response, the user is not banned
      return response.data.user;
    } catch (error) {
      // Handle 401 Unauthorized and 403 Forbidden errors (which could be due to a ban)
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          handleUnauthorized(error);
        }
      }
      throw error;
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

  // Function to refresh token if it's about to expire
  const ensureValidToken = async () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      // Check if token is valid
      if (!validateToken(token)) {
        try {
          // Try to refresh the token
          const newToken = await refreshToken();
          return newToken;
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          logout();
          return false;
        }
      }
      return token;
    } catch (error) {
      console.error('Token validation error:', error);
      logout();
      return false;
    }
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      updateUser, 
      logout, 
      login, 
      loading, 
      authError,
      checkBanStatus,
      ensureValidToken
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