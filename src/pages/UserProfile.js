import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { axios, createApiRequest } from '../utils/apiUtils';
import { useIdeology } from '../hooks/useIdeology';

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    display_name: '',
    email: '',
    phone: '',
    full_name: ''
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  const { ideology, refetch: refetchIdeology, toggleVisibility } = useIdeology();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const apiRequest = createApiRequest('/user/profile');
      const response = await apiRequest();
      
      setUser(response.data.user);
      setFormData({
        display_name: response.data.user.display_name || '',
        email: response.data.user.email || '',
        phone: response.data.user.phone || '',
        full_name: response.data.user.full_name || ''
      });
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setError(err.response?.data?.error || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    
    try {
      const apiRequest = createApiRequest('/user/profile', {
        method: 'PUT',
        data: formData
      });
      
      const response = await apiRequest();
      
      setUser(response.data.user);
      setEditMode(false);
      
      // Update localStorage if needed
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({
        ...currentUser,
        ...response.data.user
      }));
      
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      alert('New passwords do not match');
      return;
    }
    
    if (passwordData.new_password.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }
    
    setPasswordLoading(true);
    
    try {
      const apiRequest = createApiRequest('/user/password', {
        method: 'PUT',
        data: {
          current_password: passwordData.current_password,
          new_password: passwordData.new_password
        }
      });
      
      await apiRequest();
      
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      
      alert('Password updated successfully!');
    } catch (err) {
      console.error('Failed to update password:', err);
      alert(err.response?.data?.error || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleToggleIdeologyVisibility = async () => {
    if (!ideology) return;
    
    try {
      const newVisibility = !ideology.ideology_public;
      await toggleVisibility(newVisibility);
      
      // Refetch user data to get updated profile
      await fetchUserProfile();
      
      alert(`Your ideology is now ${newVisibility ? 'public' : 'private'}!`);
    } catch (err) {
      console.error('Failed to toggle ideology visibility:', err);
      alert(err.response?.data?.error || 'Failed to update ideology visibility');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const getCooldownDays = (lastUpdate) => {
    if (!lastUpdate) return 0;
    const daysSinceUpdate = Math.floor((Date.now() - new Date(lastUpdate)) / (1000 * 60 * 60 * 24));
    return Math.max(0, 14 - daysSinceUpdate);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchUserProfile}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">User not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">User Profile</h1>
          
          {/* Basic Info Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">Basic Information</h2>
              {!editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Edit Profile
                </button>
              )}
            </div>
            
            {editMode ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    name="display_name"
                    value={formData.display_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  {user.display_name_updated_at && (
                    <p className="text-xs text-gray-500 mt-1">
                      Can change again in {getCooldownDays(user.display_name_updated_at)} days
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  {user.email_updated_at && (
                    <p className="text-xs text-gray-500 mt-1">
                      Can change again in {getCooldownDays(user.email_updated_at)} days
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {user.phone_updated_at && (
                    <p className="text-xs text-gray-500 mt-1">
                      Can change again in {getCooldownDays(user.phone_updated_at)} days
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={updateLoading}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {updateLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(false);
                      setFormData({
                        display_name: user.display_name || '',
                        email: user.email || '',
                        phone: user.phone || '',
                        full_name: user.full_name || ''
                      });
                    }}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Display Name:</span>
                  <span className="font-medium">{user.display_name}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{user.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">{user.phone || 'Not set'}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Full Name:</span>
                  <span className="font-medium">{user.full_name || 'Not set'}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Member Since:</span>
                  <span className="font-medium">{formatDate(user.created_at)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Account Type:</span>
                  <span className="font-medium capitalize">{user.tier}</span>
                </div>
              </div>
            )}
          </div>

          {/* Ideology Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Political Ideology</h2>
            
            {ideology ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900">{ideology.ideology}</h3>
                    {ideology.ideology_details?.description && (
                      <p className="text-gray-700 mt-1">{ideology.ideology_details.description}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-2">
                      Last updated: {formatDate(ideology.ideology_updated_at)}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/ideology-quiz')}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    Retake Quiz
                  </button>
                </div>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-blue-200">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Visibility:</span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      ideology.ideology_public 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {ideology.ideology_public ? 'Public' : 'Private'}
                    </span>
                  </div>
                  <button
                    onClick={handleToggleIdeologyVisibility}
                    className="bg-white border border-blue-300 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-50"
                  >
                    Make {ideology.ideology_public ? 'Private' : 'Public'}
                  </button>
                </div>
                
                {!ideology.ideology_public && (
                  <p className="text-xs text-gray-600 mt-3 italic">
                    Note: Your ideology is currently private. Only you can see it. Click the button above to make it visible to others.
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <p className="text-gray-600 mb-3">You haven't taken the ideology quiz yet</p>
                <button
                  onClick={() => navigate('/ideology-quiz')}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Take Quiz Now
                </button>
              </div>
            )}
          </div>

          {/* Password Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Change Password</h2>
            
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  name="current_password"
                  value={passwordData.current_password}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  name="new_password"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength="8"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirm_password"
                  value={passwordData.confirm_password}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength="8"
                />
              </div>
              
              {user.password_updated_at && (
                <p className="text-xs text-gray-500">
                  Can change again in {getCooldownDays(user.password_updated_at)} days
                </p>
              )}
              
              <button
                type="submit"
                disabled={passwordLoading}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
              >
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* Account Actions */}
          <div className="border-t pt-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 mr-4"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;