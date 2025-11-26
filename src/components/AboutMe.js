import React, { useState, useEffect } from 'react';
import { User, Edit2, Save, X } from 'lucide-react';
import { createApiRequest } from '../utils/apiUtils';

const AboutMe = ({ userId, displayName, isOwnProfile = false, onUpdate }) => {
  const [aboutMe, setAboutMe] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAboutMe();
  }, [userId]);

  const fetchAboutMe = async () => {
    try {
      setLoading(true);
      const response = await createApiRequest(`/users/${displayName}/about`, {
        method: 'GET'
      })();
      setAboutMe(response.data.about_me || '');
      setEditText(response.data.about_me || '');
    } catch (err) {
      console.error('Error fetching about me:', err);
      setAboutMe('');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const response = await createApiRequest('/user/about', {
        method: 'PUT',
        data: { about_me: editText.trim() }
      })();

      setAboutMe(editText.trim());
      setIsEditing(false);
      
      if (onUpdate) {
        onUpdate(response.data.user);
      }
    } catch (err) {
      console.error('Error saving about me:', err);
      setError(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditText(aboutMe);
    setIsEditing(false);
    setError(null);
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-100 rounded-xl p-6 h-32"></div>
    );
  }

  if (!isOwnProfile && !aboutMe) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <User size={20} className="text-gray-600" />
          <h3 className="text-lg font-bold text-gray-900">About Me</h3>
        </div>
        {isOwnProfile && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Edit About Me"
          >
            <Edit2 size={18} className="text-gray-600" />
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {isEditing ? (
        <div>
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            placeholder="Tell us about yourself... (max 500 characters)"
            maxLength={500}
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 resize-none"
            rows={6}
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-sm text-gray-500">
              {editText.length}/500 characters
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                disabled={saving}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <X size={16} />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || editText.trim().length === 0}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {aboutMe ? (
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {aboutMe}
            </p>
          ) : (
            <p className="text-gray-400 italic">
              {isOwnProfile 
                ? 'Tell readers about yourself. Click edit to add your bio.'
                : 'No bio available.'}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default AboutMe;