// context/UserContext.js
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
          
          // Handle 401 Unauthorized and 403 Forbidden errors
          if (error.response) {
            if (error.response.status === 401) {
              console.log('Token is invalid, removing from localStorage');
              localStorage.removeItem('token');
              setAuthError(error.response.data.error || 'Your session has expired. Please log in again.');
            } else if (error.response.status === 403) {
              console.log('Access forbidden, removing from localStorage');
              localStorage.removeItem('token');
              setAuthError(error.response.data.error || 'You do not have permission to access this resource.');
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