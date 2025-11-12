// src/utils/redFlaggedApi.js
// API utilities specifically for RedFlagged feature that work with your existing system

import { 
  fetchWithRetry, 
  fetchWithDeduplication, 
  createApiRequest,
  getCachedData,
  setCachedData 
} from './apiUtils';

// ==========================================
// REDFLAGGED API FUNCTIONS
// ==========================================

// Get all RedFlagged posts with filters
export const fetchRedFlaggedPosts = async (filters = {}) => {
  const { company, experienceType, topicId, minRating, maxRating, sort = 'recent', limit = 20, offset = 0 } = filters;
  
  const cacheKey = `redflagged_posts_${JSON.stringify(filters)}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;
  
  const params = { limit, offset, sort };
  if (company) params.company = company;
  if (experienceType) params.experienceType = experienceType;
  if (topicId) params.topicId = topicId;
  if (minRating) params.minRating = minRating;
  if (maxRating) params.maxRating = maxRating;
  
  const response = await fetchWithRetry(
    createApiRequest('/redflagged', { params })
  );
  
  setCachedData(cacheKey, response.data);
  return response.data;
};

// Get single RedFlagged post
export const fetchRedFlaggedPost = async (id) => {
  const cacheKey = `redflagged_post_${id}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;
  
  const response = await fetchWithDeduplication(
    `redflagged_post_${id}`,
    createApiRequest(`/redflagged/${id}`)
  );
  
  setCachedData(cacheKey, response.data);
  return response.data;
};

// Create new RedFlagged post (public or authenticated)
export const createRedFlaggedPost = async (postData) => {
  const response = await fetchWithRetry(
    createApiRequest('/redflagged', {
      method: 'POST',
      data: postData
    })
  );
  
  return response.data;
};

// Add reaction to post
export const addReaction = async (postId, reactionType) => {
  const response = await fetchWithRetry(
    createApiRequest(`/redflagged/${postId}/react`, {
      method: 'POST',
      data: { reaction_type: reactionType }
    })
  );
  
  return response.data;
};

// Get user's reactions for a post
export const getMyReactions = async (postId) => {
  const response = await fetchWithRetry(
    createApiRequest(`/redflagged/${postId}/my-reactions`)
  );
  
  return response.data;
};

// Add comment to post
export const addComment = async (postId, commentData) => {
  const response = await fetchWithRetry(
    createApiRequest(`/redflagged/${postId}/comments`, {
      method: 'POST',
      data: commentData
    })
  );
  
  return response.data;
};

// Get related posts
export const fetchRelatedPosts = async (postId, limit = 5) => {
  const cacheKey = `redflagged_related_${postId}_${limit}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;
  
  const response = await fetchWithRetry(
    createApiRequest(`/redflagged/${postId}/related`, {
      params: { limit }
    })
  );
  
  setCachedData(cacheKey, response.data);
  return response.data;
};

// Get trending companies
export const fetchTrendingCompanies = async (limit = 10) => {
  const cacheKey = `redflagged_trending_companies_${limit}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;
  
  const response = await fetchWithDeduplication(
    `redflagged_trending_${limit}`,
    createApiRequest('/redflagged/trending/companies', {
      params: { limit }
    })
  );
  
  setCachedData(cacheKey, response.data);
  return response.data;
};

// Get real-time trending posts
export const fetchTrendingPosts = async () => {
  const cacheKey = 'redflagged_trending_posts';
  const cached = getCachedData(cacheKey);
  if (cached) return cached;
  
  const response = await fetchWithDeduplication(
    'redflagged_trending_posts',
    createApiRequest('/redflagged/trending/real-time')
  );
  
  setCachedData(cacheKey, response.data);
  return response.data;
};

// Get company analytics
export const fetchCompanyAnalytics = async (companyName) => {
  const cacheKey = `redflagged_analytics_${companyName}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;
  
  const response = await fetchWithRetry(
    createApiRequest(`/redflagged/company/${encodeURIComponent(companyName)}/analytics`)
  );
  
  setCachedData(cacheKey, response.data);
  return response.data;
};

// ==========================================
// TOPIC FUNCTIONS
// ==========================================

// Get active topics
export const fetchActiveTopics = async () => {
  const cacheKey = 'redflagged_active_topics';
  const cached = getCachedData(cacheKey);
  if (cached) return cached;
  
  const response = await fetchWithRetry(
    createApiRequest('/redflagged/topics/active')
  );
  
  setCachedData(cacheKey, response.data);
  return response.data;
};

// ==========================================
// ADMIN FUNCTIONS
// ==========================================

// Flag/unflag a post (admin only)
export const flagPost = async (postId, flagged, reason = '') => {
  const response = await fetchWithRetry(
    createApiRequest(`/admin/redflagged/${postId}/flag`, {
      method: 'PUT',
      data: { flagged, flagged_reason: reason }
    })
  );
  
  return response.data;
};

// Delete a post (admin only)
export const deleteRedFlaggedPost = async (postId) => {
  const response = await fetchWithRetry(
    createApiRequest(`/admin/redflagged/${postId}`, {
      method: 'DELETE'
    })
  );
  
  return response.data;
};

// Get all topics (admin only)
export const fetchAllTopics = async () => {
  const response = await fetchWithRetry(
    createApiRequest('/admin/redflagged/topics')
  );
  
  return response.data;
};

// Create topic (admin/editorial only)
export const createTopic = async (topicData) => {
  const response = await fetchWithRetry(
    createApiRequest('/admin/redflagged/topics', {
      method: 'POST',
      data: topicData
    })
  );
  
  return response.data;
};

// Update topic (admin/editorial only)
export const updateTopic = async (topicId, topicData) => {
  const response = await fetchWithRetry(
    createApiRequest(`/admin/redflagged/topics/${topicId}`, {
      method: 'PUT',
      data: topicData
    })
  );
  
  return response.data;
};

// Delete topic (admin/editorial only)
export const deleteTopic = async (topicId) => {
  const response = await fetchWithRetry(
    createApiRequest(`/admin/redflagged/topics/${topicId}`, {
      method: 'DELETE'
    })
  );
  
  return response.data;
};

// Toggle topic active status (admin/editorial only)
export const toggleTopicActive = async (topicId, active) => {
  const response = await fetchWithRetry(
    createApiRequest(`/admin/redflagged/topics/${topicId}/toggle`, {
      method: 'PUT',
      data: { active }
    })
  );
  
  return response.data;
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

// Get experience type badge color
export const getExperienceBadgeColor = (type) => {
  const negativeTypes = [
    'Toxic Management',
    'Pay Issues',
    'Poor Culture',
    'Overworked',
    'Discrimination',
    'Harassment',
    'Lack of Growth'
  ];
  return negativeTypes.includes(type) 
    ? 'bg-red-100 text-red-700' 
    : 'bg-green-100 text-green-700';
};

// Get rating color
export const getRatingColor = (rating) => {
  if (rating >= 4) return 'text-green-600';
  if (rating >= 3) return 'text-yellow-600';
  return 'text-red-600';
};

// Format date for display
export const formatPostDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};

// Validate post data before submission
export const validatePostData = (postData) => {
  const errors = {};
  
  if (!postData.company_name?.trim()) {
    errors.company_name = 'Company name is required';
  }
  
  if (!postData.experience_type?.trim()) {
    errors.experience_type = 'Experience type is required';
  }
  
  if (!postData.story?.trim()) {
    errors.story = 'Your story is required';
  } else if (postData.story.trim().length < 100) {
    errors.story = 'Your story must be at least 100 characters';
  }
  
  if (!postData.rating_fairness || !postData.rating_pay || 
      !postData.rating_culture || !postData.rating_management) {
    errors.ratings = 'All ratings are required';
  }
  
  if (postData.is_anonymous && !postData.anonymous_username?.trim()) {
    errors.anonymous_username = 'Username is required for anonymous posts';
  }
  
  if (!postData.terms_agreed) {
    errors.terms_agreed = 'You must agree to the terms';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Experience type options
export const EXPERIENCE_TYPES = [
  'Toxic Management',
  'Pay Issues',
  'Poor Culture',
  'Overworked',
  'Discrimination',
  'Harassment',
  'Lack of Growth',
  'Great Experience',
  'Fair Treatment',
  'Good Benefits',
  'Work-Life Balance',
  'Other'
];

// Sort options
export const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'controversial', label: 'Most Discussed' },
  { value: 'highest-rated', label: 'Highest Rated' },
  { value: 'lowest-rated', label: 'Lowest Rated' }
];

// Reaction types with emojis
export const REACTION_TYPES = {
  agree: { emoji: '✊', label: 'I Agree' },
  same_experience: { emoji: '🤝', label: 'Same Experience' },
  different_story: { emoji: '🤔', label: 'Different Story' },
  helpful: { emoji: '💡', label: 'Helpful' },
  inspiring: { emoji: '⭐', label: 'Inspiring' }
};

// Share post to social media
export const shareToSocial = (post, platform) => {
  const url = `${window.location.origin}/redflagged/${post.id}`;
  const text = `Check out this ${post.overall_rating.toFixed(1)}⭐ rating for ${post.company_name} on RedFlagged by UROWN! 🚩`;
  
  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    reddit: `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`
  };
  
  if (shareUrls[platform]) {
    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  }
};

// Copy share text to clipboard
export const copyShareText = (post) => {
  const url = `${window.location.origin}/redflagged/${post.id}`;
  const text = `🚩 RED FLAG: ${post.company_name} rated ${post.overall_rating.toFixed(1)}⭐\n\n"${post.story.substring(0, 150)}..."\n\nRead more on RedFlagged by UROWN:\n${url}`;
  
  navigator.clipboard.writeText(text).then(() => {
    return true;
  }).catch(() => {
    return false;
  });
};

// Track share event
export const trackShare = async (postId, platform) => {
  try {
    await fetchWithRetry(
      createApiRequest(`/redflagged/${postId}/share`, {
        method: 'POST',
        data: { platform }
      })
    );
  } catch (error) {
    console.error('Error tracking share:', error);
  }
};

export default {
  fetchRedFlaggedPosts,
  fetchRedFlaggedPost,
  createRedFlaggedPost,
  addReaction,
  getMyReactions,
  addComment,
  fetchRelatedPosts,
  fetchTrendingCompanies,
  fetchTrendingPosts,
  fetchCompanyAnalytics,
  fetchActiveTopics,
  flagPost,
  deleteRedFlaggedPost,
  fetchAllTopics,
  createTopic,
  updateTopic,
  deleteTopic,
  toggleTopicActive,
  getExperienceBadgeColor,
  getRatingColor,
  formatPostDate,
  validatePostData,
  EXPERIENCE_TYPES,
  SORT_OPTIONS,
  REACTION_TYPES,
  shareToSocial,
  copyShareText,
  trackShare
};