import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Bell, User, MessageSquare, FileText, Clock, Trash2 } from 'lucide-react';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingNotifications, setDeletingNotifications] = useState(new Set());

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/notifications');
      setNotifications(response.data.notifications);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`/api/notifications/${notificationId}/read`);
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true, deletion_starts_at: new Date().toISOString() }
            : notif
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      setDeletingNotifications(prev => new Set(prev).add(notificationId));
      await axios.delete(`/api/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    } catch (err) {
      console.error('Error deleting notification:', err);
      alert('Failed to delete notification');
    } finally {
      setDeletingNotifications(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('/api/notifications/mark-all-read');
      fetchNotifications();
    } catch (err) {
      console.error('Error marking all as read:', err);
      alert('Failed to mark all as read');
    }
  };

  const deleteAllRead = async () => {
    if (!window.confirm('Delete all read notifications?')) return;
    
    try {
      await axios.delete('/api/notifications/delete-all-read');
      fetchNotifications();
    } catch (err) {
      console.error('Error deleting read notifications:', err);
      alert('Failed to delete read notifications');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_follower':
        return <User className="w-5 h-5 text-blue-500" />;
      case 'counter_argument':
        return <MessageSquare className="w-5 h-5 text-orange-500" />;
      case 'following_post':
        return <FileText className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTimeRemaining = (deletionStartsAt) => {
    if (!deletionStartsAt) return null;
    
    const deletionTime = new Date(deletionStartsAt).getTime() + (5 * 60 * 1000); // 5 minutes
    const now = Date.now();
    const remaining = Math.max(0, deletionTime - now);
    
    if (remaining === 0) return 'Deleting...';
    
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Auto-refresh to update countdown timers
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications(prev => [...prev]); // Force re-render for countdown
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Bell className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {unreadCount} new
              </span>
            )}
          </div>
          
          <div className="flex space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Mark all read
              </button>
            )}
            {notifications.some(n => n.read) && (
              <button
                onClick={deleteAllRead}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Clear read
              </button>
            )}
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-500">No notifications yet</p>
          <p className="text-gray-400 mt-2">
            You'll be notified when someone follows you, responds to your articles, or when people you follow post new content.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const timeRemaining = notification.read ? getTimeRemaining(notification.deletion_starts_at) : null;
            
            return (
              <div
                key={notification.id}
                className={`border rounded-lg p-4 transition ${
                  notification.read
                    ? 'bg-gray-50 border-gray-200'
                    : 'bg-white border-blue-200 shadow-sm'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900">
                      {notification.message}
                    </p>
                    
                    {notification.link && (
                      <Link
                        to={notification.link}
                        onClick={() => !notification.read && markAsRead(notification.id)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-1 inline-block"
                      >
                        View →
                      </Link>
                    )}
                    
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>{new Date(notification.created_at).toLocaleString()}</span>
                      
                      {notification.read && timeRemaining && (
                        <span className="flex items-center space-x-1 text-orange-600">
                          <Clock className="w-3 h-3" />
                          <span>Deletes in {timeRemaining}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                      >
                        Mark read
                      </button>
                    )}
                    
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      disabled={deletingNotifications.has(notification.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
                      title="Delete notification"
                    >
                      {deletingNotifications.has(notification.id) ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-600"></div>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;