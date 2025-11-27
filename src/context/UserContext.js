// context/UserContext.js - Updated version
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { fetchWithRetry, handleUnauthorized } from '../utils/apiUtils';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

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
            5, // maxRetries - increased for better reliability
            2000 // initialDelay
          );
          console.log('Token verified successfully:', response.data.user);
          setUser(response.data.user);
          setAuthError(null);
          setRetryCount(0); // Reset retry count on success
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
              // Server/Database error - keep token, try to recover
              console.log('Server/DB error, keeping token');
              
              // Try to get user from localStorage as fallback
              const cachedUser = localStorage.getItem('user');
              if (cachedUser) {
                try {
                  const parsedUser = JSON.parse(cachedUser);
                  setUser(parsedUser);
                  setAuthError('Temporary server issue. Using cached data. Please refresh in a moment.');
                } catch (e) {
                  setAuthError('Server temporarily unavailable. Please refresh the page.');
                }
              } else {
                setAuthError('Server temporarily unavailable. Please refresh the page.');
              }
              
              // Retry after a delay if we haven't exceeded max retries
              if (retryCount < 3) {
                setTimeout(() => {
                  setRetryCount(prev => prev + 1);
                  verifyToken();
                }, 5000); // Retry after 5 seconds
              }
            } else {
              // Other errors - keep token
              console.log('Unknown error, keeping token');
              setAuthError('Unable to verify your session. Please refresh the page.');
            }
          } else if (error.request) {
            // Network error - keep token and use cached data
            console.log('Network error, using cached data');
            const cachedUser = localStorage.getItem('user');
            if (cachedUser) {
              try {
                const parsedUser = JSON.parse(cachedUser);
                setUser(parsedUser);
                setAuthError('Network error. Using cached data. Please check your connection.');
              } catch (e) {
                setAuthError('Network error. Please check your connection and refresh.');
              }
            } else {
              setAuthError('Network error. Please check your connection and refresh the page.');
            }
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
  }, [retryCount]);

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData)); // Cache user data
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
      authError
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