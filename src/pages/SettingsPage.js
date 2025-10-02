// pages/SettingsPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '../context/UserContext';
import { createApiRequest } from '../utils/apiUtils';

function SettingsPage() {
  const { user, updateUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Display name form
  const [displayName, setDisplayName] = useState('');
  const [displayNameCooldown, setDisplayNameCooldown] = useState(null);
  
  // Email form
  const [email, setEmail] = useState('');
  const [emailCooldown, setEmailCooldown] = useState(null);
  
  // Phone form
  const [phone, setPhone] = useState('');
  const [phoneCooldown, setPhoneCooldown] = useState(null);
  
  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordCooldown, setPasswordCooldown] = useState(null);
  
  // Account deletion
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Calculate cooldown days
  const calculateCooldown = useCallback((lastUpdated) => {
    if (!lastUpdated) return 0;
    
    const now = new Date();
    const lastUpdate = new Date(lastUpdated);
    const daysSinceUpdate = Math.floor((now - lastUpdate) / (24 * 60 * 60 * 1000));
    
    return Math.max(0, 14 - daysSinceUpdate);
  }, []);

  // Initialize form data and cooldowns
  useEffect(() => {
    if (user) {
      setDisplayName(user.display_name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      
      // Calculate cooldowns
      setDisplayNameCooldown(calculateCooldown(user.display_name_updated_at));
      setEmailCooldown(calculateCooldown(user.email_updated_at));
      setPhoneCooldown(calculateCooldown(user.phone_updated_at));
      setPasswordCooldown(calculateCooldown(user.password_updated_at));
    }
  }, [user, calculateCooldown]);

  // Handle display name update
  const handleUpdateDisplayName = async (e) => {
    e.preventDefault();
    
    if (!displayName.trim()) {
      setError('Display name is required');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const response = await createApiRequest('/user/profile', {
        method: 'PUT',
        data: { display_name: displayName.trim() }
      })();
      
      // Debug: log the response structure
      console.log('API Response:', response.data);
      
      // Check if response has the expected structure
      if (response.data && response.data.user) {
        updateUser(response.data.user);
        setSuccess('Display name updated successfully');
        setDisplayNameCooldown(14); // Reset cooldown to 14 days
      } else {
        // Fallback: if the response doesn't have the expected structure
        // Fetch the updated user profile
        const profileResponse = await createApiRequest('/user/profile', { method: 'GET' })();
        if (profileResponse.data && profileResponse.data.user) {
          updateUser(profileResponse.data.user);
          setSuccess('Display name updated successfully');
          setDisplayNameCooldown(14);
        } else {
          throw new Error('Invalid response structure from server');
        }
      }
      
    } catch (error) {
      console.error('Error updating display name:', error);
      setError(error.response?.data?.error || 'Failed to update display name');
    } finally {
      setLoading(false);
    }
  };

  // Handle email update
  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const response = await createApiRequest('/user/profile', {
        method: 'PUT',
        data: { email: email.trim() }
      })();
      
      // Check if response has the expected structure
      if (response.data && response.data.user) {
        updateUser(response.data.user);
        setSuccess('Email updated successfully');
        setEmailCooldown(14); // Reset cooldown to 14 days
      } else {
        // Fallback: fetch the updated user profile
        const profileResponse = await createApiRequest('/user/profile', { method: 'GET' })();
        if (profileResponse.data && profileResponse.data.user) {
          updateUser(profileResponse.data.user);
          setSuccess('Email updated successfully');
          setEmailCooldown(14);
        } else {
          throw new Error('Invalid response structure from server');
        }
      }
      
    } catch (error) {
      console.error('Error updating email:', error);
      setError(error.response?.data?.error || 'Failed to update email');
    } finally {
      setLoading(false);
    }
  };

  // Handle phone update
  const handleUpdatePhone = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const response = await createApiRequest('/user/profile', {
        method: 'PUT',
        data: { phone: phone.trim() || null }
      })();
      
      // Check if response has the expected structure
      if (response.data && response.data.user) {
        updateUser(response.data.user);
        setSuccess('Phone updated successfully');
        setPhoneCooldown(14); // Reset cooldown to 14 days
      } else {
        // Fallback: fetch the updated user profile
        const profileResponse = await createApiRequest('/user/profile', { method: 'GET' })();
        if (profileResponse.data && profileResponse.data.user) {
          updateUser(profileResponse.data.user);
          setSuccess('Phone updated successfully');
          setPhoneCooldown(14);
        } else {
          throw new Error('Invalid response structure from server');
        }
      }
      
    } catch (error) {
      console.error('Error updating phone:', error);
      setError(error.response?.data?.error || 'Failed to update phone');
    } finally {
      setLoading(false);
    }
  };

  // Handle password update
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All password fields are required');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      await createApiRequest('/user/password', {
        method: 'PUT',
        data: {
          current_password: currentPassword,
          new_password: newPassword
        }
      })();
      
      setSuccess('Password updated successfully');
      setPasswordCooldown(14); // Reset cooldown to 14 days
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Fetch updated user data to get new password_updated_at timestamp
      try {
        const profileResponse = await createApiRequest('/user/profile', { method: 'GET' })();
        if (profileResponse.data && profileResponse.data.user) {
          updateUser(profileResponse.data.user);
        }
      } catch (profileError) {
        console.error('Error fetching updated profile after password change:', profileError);
      }
      
    } catch (error) {
      console.error('Error updating password:', error);
      setError(error.response?.data?.error || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'I want to delete my account') {
      setError('Please type the exact phrase to confirm');
      return;
    }
    
    try {
      setIsDeleting(true);
      setError(null);
      
      await createApiRequest('/user', {
        method: 'DELETE',
        data: { confirmation: deleteConfirmation }
      })();
      
      // Redirect to home page after deletion
      window.location.href = '/';
      
    } catch (error) {
      console.error('Error deleting account:', error);
      setError(error.response?.data?.error || 'Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-16">
        <div className="text-2xl font-bold">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold mb-8">Account Settings</h1>
      
      {error && (
        <div className="bg-red-50 border-2 border-red-500 text-red-700 p-4 mb-8 text-center">
          <div className="text-xl font-bold">{error}</div>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border-2 border-green-500 text-green-700 p-4 mb-8 text-center">
          <div className="text-xl font-bold">{success}</div>
        </div>
      )}
      
      <div className="space-y-12">
        {/* Display Name Section */}
        <div className="bg-white p-8 border-2 border-black">
          <h2 className="text-2xl font-bold mb-6">Display Name</h2>
          
          <form onSubmit={handleUpdateDisplayName}>
            <div className="mb-4">
              <label className="block text-lg font-bold mb-2">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full p-3 border-2 border-black"
                disabled={displayNameCooldown > 0}
              />
            </div>
            
            {displayNameCooldown > 0 && (
              <div className="mb-4 text-red-600 font-bold">
                You can change your display name again in {displayNameCooldown} day{displayNameCooldown !== 1 ? 's' : ''}
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading || displayNameCooldown > 0}
              className="bg-black text-white px-6 py-3 font-bold border-2 border-black hover:bg-white hover:text-black disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Display Name'}
            </button>
          </form>
        </div>
        
        {/* Email Section */}
        <div className="bg-white p-8 border-2 border-black">
          <h2 className="text-2xl font-bold mb-6">Email Address</h2>
          
          <form onSubmit={handleUpdateEmail}>
            <div className="mb-4">
              <label className="block text-lg font-bold mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border-2 border-black"
                disabled={emailCooldown > 0}
              />
            </div>
            
            {emailCooldown > 0 && (
              <div className="mb-4 text-red-600 font-bold">
                You can change your email again in {emailCooldown} day{emailCooldown !== 1 ? 's' : ''}
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading || emailCooldown > 0}
              className="bg-black text-white px-6 py-3 font-bold border-2 border-black hover:bg-white hover:text-black disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Email'}
            </button>
          </form>
        </div>
        
        {/* Phone Section */}
        <div className="bg-white p-8 border-2 border-black">
          <h2 className="text-2xl font-bold mb-6">Phone Number</h2>
          
          <form onSubmit={handleUpdatePhone}>
            <div className="mb-4">
              <label className="block text-lg font-bold mb-2">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 border-2 border-black"
                disabled={phoneCooldown > 0}
              />
            </div>
            
            {phoneCooldown > 0 && (
              <div className="mb-4 text-red-600 font-bold">
                You can change your phone number again in {phoneCooldown} day{phoneCooldown !== 1 ? 's' : ''}
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading || phoneCooldown > 0}
              className="bg-black text-white px-6 py-3 font-bold border-2 border-black hover:bg-white hover:text-black disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Phone'}
            </button>
          </form>
        </div>
        
        {/* Password Section */}
        <div className="bg-white p-8 border-2 border-black">
          <h2 className="text-2xl font-bold mb-6">Change Password</h2>
          
          <form onSubmit={handleUpdatePassword}>
            <div className="mb-4">
              <label className="block text-lg font-bold mb-2">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-3 border-2 border-black"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-lg font-bold mb-2">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 border-2 border-black"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-lg font-bold mb-2">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 border-2 border-black"
              />
            </div>
            
            {passwordCooldown > 0 && (
              <div className="mb-4 text-red-600 font-bold">
                You can change your password again in {passwordCooldown} day{passwordCooldown !== 1 ? 's' : ''}
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading || passwordCooldown > 0}
              className="bg-black text-white px-6 py-3 font-bold border-2 border-black hover:bg-white hover:text-black disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>
        
        {/* Account Deletion Section */}
        <div className="bg-red-50 p-8 border-2 border-red-500">
          <h2 className="text-2xl font-bold mb-6 text-red-700">Delete Account</h2>
          
          <p className="mb-6 text-lg">
            Deleting your account is permanent and cannot be undone. All your articles and data will be removed.
          </p>
          
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-600 text-white px-6 py-3 font-bold border-2 border-red-600 hover:bg-red-700"
            >
              Delete My Account
            </button>
          ) : (
            <div>
              <div className="mb-4">
                <label className="block text-lg font-bold mb-2">
                  Type "I want to delete my account" to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className="w-full p-3 border-2 border-black"
                />
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmation('');
                  }}
                  className="bg-gray-600 text-white px-6 py-3 font-bold border-2 border-gray-600 hover:bg-gray-700"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || deleteConfirmation !== 'I want to delete my account'}
                  className="bg-red-600 text-white px-6 py-3 font-bold border-2 border-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete My Account'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;