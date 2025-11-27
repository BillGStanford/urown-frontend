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
            3, // Reduced retries
            1000 // 1 second delay
          );
          console.log('✅ Token verified successfully');
          setUser(response.data.user);
          localStorage.setItem('user', JSON.stringify(response.data.user)); // Cache it
          setAuthError(null);
          setRetryCount(0);
        } catch (error) {
          console.error('❌ Error verifying token:', error.message);
          
          if (error.response) {
            const status = error.response.status;
            const errorMessage = error.response.data?.error;
            
            console.log(`Response status: ${status}`);
            console.log(`Error message: ${errorMessage}`);
            
            if (status === 401 || status === 403) {
              // Auth error - clear everything
              console.log('Auth error, clearing token');
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUser(null);
              setAuthError(errorMessage || 'Your session has expired. Please log in again.');
            } else if (status === 404) {
              // User not found
              console.log('User not found, clearing token');
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUser(null);
              setAuthError('Account not found. Please contact support.');
            } else if (status === 500 || status === 503) {
              // Server error - try to use cached data
              console.log('Server error, using cached data if available');
              const cachedUser = localStorage.getItem('user');
              if (cachedUser) {
                try {
                  setUser(JSON.parse(cachedUser));
                  setAuthError('⚠️ Using cached data. Server is temporarily unavailable.');
                } catch (e) {
                  setAuthError('Server error. Please try logging in again.');
                }
              } else {
                setAuthError('Server temporarily unavailable. Please try again in a moment.');
              }
            } else {
              setAuthError('Unable to verify your session. Please refresh the page.');
            }
          } else if (error.request) {
            // Network error
            console.log('Network error, using cached data');
            const cachedUser = localStorage.getItem('user');
            if (cachedUser) {
              try {
                setUser(JSON.parse(cachedUser));
                setAuthError('⚠️ Network issue. Using cached data.');
              } catch (e) {
                setAuthError('Network error. Please check your connection.');
              }
            } else {
              setAuthError('Network error. Please check your connection.');
            }
          } else {
            console.log('Unknown error:', error.message);
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