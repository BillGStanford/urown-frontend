import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { fetchWithRetry, handleUnauthorized } from '../utils/apiUtils';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [lastRetryTime, setLastRetryTime] = useState(null);

  // Enhanced token verification with progressive backoff
  const verifyToken = async (token, isRetry = false) => {
    try {
      console.log(`🔄 ${isRetry ? 'Retrying' : 'Verifying'} token... (Attempt ${retryCount + 1})`);
      
      const response = await fetchWithRetry(() => 
        axios.get('/user/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          },
          timeout: 10000 // 10 second timeout
        }),
        2, // Reduced retries for token verification
        1000 // 1 second delay
      );
      
      console.log('✅ Token verified successfully');
      const userData = response.data.user;
      
      // Update user state and cache
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('user_last_updated', new Date().toISOString());
      setAuthError(null);
      setRetryCount(0);
      setLastRetryTime(null);
      
      return true;
    } catch (error) {
      console.error('❌ Error verifying token:', error.message);
      await handleTokenError(error, token, isRetry);
      return false;
    }
  };

  // Enhanced error handling for token verification
  const handleTokenError = async (error, token, isRetry) => {
    // Clear any existing retry timeouts
    if (window.retryTimeout) {
      clearTimeout(window.retryTimeout);
    }

    if (error.response) {
      const status = error.response.status;
      const errorMessage = error.response.data?.error;
      
      console.log(`📊 Response status: ${status}`);
      console.log(`📊 Error message: ${errorMessage}`);
      
      switch (status) {
        case 401:
        case 403:
          // Auth error - clear everything
          console.log('🔒 Auth error, clearing token');
          handleAuthFailure(errorMessage || 'Your session has expired. Please log in again.');
          break;
          
        case 404:
          // User not found
          console.log('👤 User not found, clearing token');
          handleAuthFailure('Account not found. Please contact support.');
          break;
          
        case 500:
        case 503:
          // Server error - try to use cached data with retry logic
          await handleServerError(token, isRetry);
          break;
          
        case 429:
          // Rate limited
          handleRateLimit(errorMessage || 'Too many requests. Please slow down.');
          break;
          
        default:
          // Other server errors
          handleGenericError('Unable to verify your session. Please refresh the page.');
      }
    } else if (error.request) {
      // Network error
      await handleNetworkError(token, isRetry);
    } else {
      // Unknown error
      console.log('❓ Unknown error:', error.message);
      handleGenericError('An unexpected error occurred. Please refresh the page.');
    }
  };

  // Handle authentication failures
  const handleAuthFailure = (message) => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_last_updated');
    setUser(null);
    setAuthError(message);
    setLoading(false);
  };

  // Handle server errors with retry logic
  const handleServerError = async (token, isRetry) => {
    console.log('🖥️ Server error, checking cached data');
    
    const cachedUser = localStorage.getItem('user');
    const lastUpdated = localStorage.getItem('user_last_updated');
    
    // Use cached data if available and not too old (less than 1 hour)
    if (cachedUser && lastUpdated) {
      const lastUpdateTime = new Date(lastUpdated);
      const now = new Date();
      const hoursSinceUpdate = (now - lastUpdateTime) / (1000 * 60 * 60);
      
      if (hoursSinceUpdate < 1) {
        try {
          const userData = JSON.parse(cachedUser);
          setUser(userData);
          setAuthError('⚠️ Using cached data. Server is temporarily unavailable.');
          console.log('✅ Using cached user data');
        } catch (e) {
          console.error('❌ Error parsing cached user data:', e);
          setAuthError('Server error. Please try logging in again.');
        }
      } else {
        setAuthError('Server temporarily unavailable. Please try again in a moment.');
      }
    } else {
      setAuthError('Server temporarily unavailable. Please try again in a moment.');
    }
    
    // Set up retry with progressive backoff
    await scheduleRetry(token, isRetry);
  };

  // Handle network errors
  const handleNetworkError = async (token, isRetry) => {
    console.log('🌐 Network error, checking cached data');
    
    const cachedUser = localStorage.getItem('user');
    if (cachedUser) {
      try {
        const userData = JSON.parse(cachedUser);
        setUser(userData);
        setAuthError('⚠️ Network issue. Using cached data.');
        console.log('✅ Using cached user data due to network error');
      } catch (e) {
        setAuthError('Network error. Please check your connection.');
      }
    } else {
      setAuthError('Network error. Please check your connection.');
    }
    
    // Set up retry for network errors
    await scheduleRetry(token, isRetry);
  };

  // Handle rate limiting
  const handleRateLimit = (message) => {
    const cachedUser = localStorage.getItem('user');
    if (cachedUser) {
      try {
        const userData = JSON.parse(cachedUser);
        setUser(userData);
        setAuthError(`⏳ ${message} Using cached data.`);
      } catch (e) {
        setAuthError(message);
      }
    } else {
      setAuthError(message);
    }
    setLoading(false);
  };

  // Handle generic errors
  const handleGenericError = (message) => {
    const cachedUser = localStorage.getItem('user');
    if (cachedUser) {
      try {
        const userData = JSON.parse(cachedUser);
        setUser(userData);
        setAuthError(`⚠️ ${message} Using cached data.`);
      } catch (e) {
        setAuthError(message);
      }
    } else {
      setAuthError(message);
    }
    setLoading(false);
  };

  // Schedule retry with progressive backoff
  const scheduleRetry = async (token, isRetry) => {
    const maxRetries = 3;
    
    if (retryCount < maxRetries) {
      const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 30000); // Max 30 seconds
      
      console.log(`⏰ Scheduling retry in ${backoffDelay}ms (${retryCount + 1}/${maxRetries})`);
      
      setAuthError(prevError => 
        prevError?.includes('Using cached data') 
          ? `${prevError} Retrying in ${backoffDelay/1000}s...`
          : `Server unavailable. Retrying in ${backoffDelay/1000}s...`
      );
      
      setLastRetryTime(new Date());
      
      window.retryTimeout = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        verifyToken(token, true);
      }, backoffDelay);
    } else {
      console.log('🛑 Max retries reached');
      setAuthError(prevError => 
        prevError?.includes('Using cached data') 
          ? `${prevError} Connection failed after ${maxRetries} attempts.`
          : 'Unable to connect to server. Please check your connection and refresh the page.'
      );
      setLoading(false);
    }
  };

  // Manual retry function
  const retryVerification = () => {
    const token = localStorage.getItem('token');
    if (token) {
      setRetryCount(0);
      setAuthError('Retrying connection...');
      setLoading(true);
      verifyToken(token, true);
    }
  };

  // Main useEffect for initial token verification
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      verifyToken(token);
    } else {
      console.log('🔍 No token found');
      
      // Check if there's cached user data for guest mode
      const cachedUser = localStorage.getItem('user');
      if (cachedUser) {
        try {
          const userData = JSON.parse(cachedUser);
          console.log('👤 Found cached user data, clearing it');
          localStorage.removeItem('user');
          localStorage.removeItem('user_last_updated');
        } catch (e) {
          console.error('Error parsing cached user data:', e);
        }
      }
      
      setLoading(false);
    }

    // Cleanup function
    return () => {
      if (window.retryTimeout) {
        clearTimeout(window.retryTimeout);
      }
    };
  }, []);

  // Update user data
  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('user_last_updated', new Date().toISOString());
    setAuthError(null);
    setRetryCount(0);
  };

  // Enhanced logout with cleanup
  const logout = () => {
    console.log('🚪 Logging out user');
    
    // Clear all timeouts
    if (window.retryTimeout) {
      clearTimeout(window.retryTimeout);
    }
    
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_last_updated');
    
    // Reset state
    setUser(null);
    setAuthError(null);
    setRetryCount(0);
    setLastRetryTime(null);
    
    console.log('✅ Logout completed');
  };

  // Enhanced login with immediate verification
  const login = async (userData, token) => {
    try {
      console.log('🔐 Logging in user');
      
      // Store credentials
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', token);
      localStorage.setItem('user_last_updated', new Date().toISOString());
      
      // Update state
      setUser(userData);
      setAuthError(null);
      setRetryCount(0);
      setLastRetryTime(null);
      
      // Verify token immediately
      const verified = await verifyToken(token);
      if (!verified) {
        console.warn('⚠️ Initial token verification failed, but user is logged in');
      }
      
      console.log('✅ Login completed');
    } catch (error) {
      console.error('❌ Login error:', error);
      // Even if verification fails, keep the user logged in with cached data
    }
  };

  // Get user status information
  const getUserStatus = () => {
    const isOnline = !authError || authError.includes('Using cached data');
    const isAuthenticated = !!user;
    const needsReauthentication = authError && (
      authError.includes('session has expired') || 
      authError.includes('Please log in again')
    );
    
    return {
      isOnline,
      isAuthenticated,
      needsReauthentication,
      isUsingCachedData: authError?.includes('Using cached data'),
      retryCount,
      lastRetryTime
    };
  };

  // Clear error manually
  const clearError = () => {
    setAuthError(null);
  };

  const value = {
    // State
    user,
    loading,
    authError,
    
    // Actions
    updateUser,
    logout,
    login,
    retryVerification,
    clearError,
    
    // Status information
    getUserStatus,
    
    // Derived state
    isLoggedIn: !!user,
    isOnline: !authError || authError?.includes('Using cached data'),
    isUsingCachedData: authError?.includes('Using cached data')
  };

  return (
    <UserContext.Provider value={value}>
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

// Hook for components that need user status
export const useUserStatus = () => {
  const { getUserStatus, ...rest } = useUser();
  return {
    ...getUserStatus(),
    ...rest
  };
};

export default UserContext;