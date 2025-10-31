import { useState, useEffect } from 'react';
import { createApiRequest } from '../utils/apiUtils';

export const useIdeology = () => {
  const [ideology, setIdeology] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchIdeology = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const apiRequest = createApiRequest('/user/ideology');
      const response = await apiRequest();
      
      setIdeology(response.data.ideology);
    } catch (err) {
      console.error('Failed to fetch ideology:', err);
      setError(err.response?.data?.error || 'Failed to fetch ideology');
    } finally {
      setLoading(false);
    }
  };

  const updateIdeology = async (ideologyData) => {
    try {
      const apiRequest = createApiRequest('/user/ideology', {
        method: 'PUT',
        data: ideologyData
      });
      
      const response = await apiRequest();
      
      // Update local state with the response from server
      setIdeology(response.data.ideology);
      
      return response.data;
    } catch (err) {
      console.error('Failed to update ideology:', err);
      throw err;
    }
  };

  const toggleVisibility = async (isPublic) => {
    try {
      const apiRequest = createApiRequest('/user/ideology/visibility', {
        method: 'PUT',
        data: { ideology_public: isPublic }
      });
      
      const response = await apiRequest();
      
      // Update local state
      setIdeology(prev => ({
        ...prev,
        ideology_public: response.data.ideology_public
      }));
      
      return response.data;
    } catch (err) {
      console.error('Failed to toggle ideology visibility:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchIdeology();
  }, []);

  return {
    ideology,
    loading,
    error,
    refetch: fetchIdeology,
    updateIdeology,
    toggleVisibility
  };
};