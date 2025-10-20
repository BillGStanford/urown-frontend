// utils/apiUtils.js
import axios from 'axios';

// Set base URL for all API requests based on environment
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://urown-backend.onrender.com/api' 
  : 'http://localhost:5000/api';

axios.defaults.baseURL = API_BASE_URL;

// Create a separate axios instance for unauthenticated requests
export const unauthenticatedAxios = axios.create({
  baseURL: API_BASE_URL
});

// Retry function with exponential backoff
export const fetchWithRetry = async (axiosRequest, maxRetries = 3, initialDelay = 1000) => {
  let retryCount = 0;
  
  const execute = async () => {
    try {
      return await axiosRequest();
    } catch (error) {
      // If we get a 429 (Too Many Requests) and haven't exceeded max retries, retry
      if (error.response && error.response.status === 429 && retryCount < maxRetries) {
        retryCount++;
        const delay = initialDelay * Math.pow(2, retryCount - 1); // Exponential backoff
        console.log(`Rate limited. Retrying in ${delay}ms (attempt ${retryCount}/${maxRetries})`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return execute(); // Retry the request
      }
      // Re-throw if not a 429 error or max retries reached
      throw error;
    }
  };
  
  return execute();
};

// Simple cache object to store responses
const cache = {};
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

export const getCachedData = (key) => {
  const item = cache[key];
  if (item && Date.now() - item.timestamp < CACHE_EXPIRY) {
    return item.data;
  }
  return null;
};

export const setCachedData = (key, data) => {
  cache[key] = {
    data,
    timestamp: Date.now()
  };
};

// Request deduplication - prevents multiple identical requests
const pendingRequests = {};

// Function to handle 401 and 403 responses
export const handleUnauthorized = (error) => {
  if (error.response && (error.response.status === 401 || error.response.status === 403)) {
    const errorMessage = error.response.data.error || 
      (error.response.status === 401 
        ? 'Your session has expired. Please log in again.' 
        : 'You do not have permission to access this resource. Your account may be banned or suspended.');
    
    // Clear user data from localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Redirect to login page with error message
    window.location.href = `/login?error=${encodeURIComponent(errorMessage)}`;
  }
  return Promise.reject(error);
};

export const fetchWithDeduplication = async (requestKey, axiosRequest) => {
  // If there's already a pending request for this key, return its promise
  if (pendingRequests[requestKey]) {
    return pendingRequests[requestKey];
  }
  
  // Create a new request
  const requestPromise = fetchWithRetry(axiosRequest)
    .catch(error => {
      // Handle 401 Unauthorized and 403 Forbidden errors
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        handleUnauthorized(error);
      }
      throw error;
    });
  
  // Store the promise
  pendingRequests[requestKey] = requestPromise;
  
  try {
    // Wait for the request to complete
    const result = await requestPromise;
    return result;
  } finally {
    // Clean up the pending request
    delete pendingRequests[requestKey];
  }
};

// Helper function to create API requests
export const createApiRequest = (endpoint, options = {}) => {
  const { method = 'GET', data, params, headers = {} } = options;
  
  return () => {
    const config = {
      method,
      url: endpoint, // Don't add /api here since we set it as baseURL
      headers
    };
    
    // Add authorization token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (data) {
      config.data = data;
    }
    
    if (params) {
      config.params = params;
    }
    
    return axios(config);
  };
};

// Helper function to create unauthenticated API requests
export const createUnauthenticatedApiRequest = (endpoint, options = {}) => {
  const { method = 'GET', data, params, headers = {} } = options;
  
  return () => {
    const config = {
      method,
      url: endpoint, // Don't add /api here since we set it as baseURL
      headers
    };
    
    if (data) {
      config.data = data;
    }
    
    if (params) {
      config.params = params;
    }
    
    return unauthenticatedAxios(config);
  };
};

// Add a response interceptor to handle common errors globally for authenticated requests
axios.interceptors.response.use(
  response => response,
  error => {
    // Handle 401 Unauthorized and 403 Forbidden errors globally
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      handleUnauthorized(error);
    }
    return Promise.reject(error);
  }
);

// Add a response interceptor for unauthenticated requests
unauthenticatedAxios.interceptors.response.use(
  response => response,
  error => {
    // Don't redirect to login for unauthenticated requests
    return Promise.reject(error);
  }
);

// Export the axios instances for use in components
export { axios, unauthenticatedAxios };