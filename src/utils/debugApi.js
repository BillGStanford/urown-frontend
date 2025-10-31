import { debugApiConfig } from './apiUtils';

// Run this in the browser console to debug API issues
export const runApiDebug = () => {
  console.log('=== API Debug Information ===');
  debugApiConfig();
  
  // Check if user is logged in
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('token');
  
  console.log('User in localStorage:', user ? 'Present' : 'Missing');
  console.log('Token in localStorage:', token ? 'Present' : 'Missing');
  
  if (user) {
    console.log('User ID:', user.id);
    console.log('User email:', user.email);
  }
  
  // Test API connection
  fetch('/api/health')
    .then(response => response.json())
    .then(data => console.log('Health check response:', data))
    .catch(error => console.error('Health check error:', error));
};

// Auto-run debug in development
if (process.env.NODE_ENV === 'development') {
  setTimeout(runApiDebug, 1000);
}