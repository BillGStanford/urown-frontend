// src/pages/RedFlaggedPostPage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { 
  fetchRedFlaggedPost, 
  addReaction, 
  getMyReactions, 
  addComment, 
  fetchRelatedPosts 
} from '../../utils/redFlaggedApi';

const RedFlaggedPostPage = () => {
  const { id } = useParams();
  const { user } = useUser();
  const [post, setPost] = useState(null);
  const [reactions, setReactions] = useState([]);
  const [myReactions, setMyReactions] = useState([]);
  const [comments, setComments] = useState([]);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentForm, setCommentForm] = useState({
    commenter_name: '',
    comment: '',
    is_company_response: false
  });
  const [commentLoading, setCommentLoading] = useState(false);
  
  const reactionEmojis = {
    agree: { emoji: '✊', label: 'I Agree' },
    same_experience: { emoji: '🤝', label: 'Same Experience' },
    different_story: { emoji: '🤔', label: 'Different Story' },
    helpful: { emoji: '💡', label: 'Helpful' },
    inspiring: { emoji: '⭐', label: 'Inspiring' }
  };
  
  useEffect(() => {
    fetchPost();
    fetchMyReactions();
    fetchRelated();
  }, [id]);
  
  const fetchPost = async () => {
    try {
      setLoading(true);
      const data = await fetchRedFlaggedPost(id);
      setPost(data.post);
      setReactions(data.reactions);
      setComments(data.comments);
    } catch (error) {
      console.error('Failed to fetch post:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyReactions = async () => {
    try {
      const data = await getMyReactions(id);
      setMyReactions(data.reactions);
    } catch (error) {
      console.error('Failed to fetch my reactions:', error);
    }
  };

  const fetchRelated = async () => {
    try {
      const data = await fetchRelatedPosts(id, 5);
      setRelatedPosts(data.posts);
    } catch (error) {
      console.error('Failed to fetch related posts:', error);
    }
  };

  // REAL-TIME REACTION HANDLER
  const handleReaction = async (reactionType) => {
    const wasReacted = myReactions.includes(reactionType);
    
    // Optimistic UI update
    if (wasReacted) {
      // Remove reaction
      setMyReactions(prev => prev.filter(r => r !== reactionType));
      setReactions(prev => prev.map(r => 
        r.reaction_type === reactionType 
          ? { ...r, count: Math.max(0, parseInt(r.count) - 1) }
          : r
      ));
      setPost(prev => ({ ...prev, reaction_count: prev.reaction_count - 1 }));
    } else {
      // Add reaction
      setMyReactions(prev => [...prev, reactionType]);
      setReactions(prev => {
        const existing = prev.find(r => r.reaction_type === reactionType);
        if (existing) {
          return prev.map(r => 
            r.reaction_type === reactionType 
              ? { ...r, count: parseInt(r.count) + 1 }
              : r
          );
        } else {
          return [...prev, { reaction_type: reactionType, count: 1 }];
        }
      });
      setPost(prev => ({ ...prev, reaction_count: prev.reaction_count + 1 }));
    }
    
    try {
      // Make API call
      await addReaction(id, reactionType);
    } catch (error) {
      console.error('Failed to add reaction:', error);
      // Revert on error
      if (wasReacted) {
        setMyReactions(prev => [...prev, reactionType]);
        setReactions(prev => prev.map(r => 
          r.reaction_type === reactionType 
            ? { ...r, count: parseInt(r.count) + 1 }
            : r
        ));
        setPost(prev => ({ ...prev, reaction_count: prev.reaction_count + 1 }));
      } else {
        setMyReactions(prev => prev.filter(r => r !== reactionType));
        setReactions(prev => prev.map(r => 
          r.reaction_type === reactionType 
            ? { ...r, count: Math.max(0, parseInt(r.count) - 1) }
            : r
        ));
        setPost(prev => ({ ...prev, reaction_count: prev.reaction_count - 1 }));
      }
    }
  };

  // REAL-TIME COMMENT HANDLER
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!commentForm.commenter_name.trim() || !commentForm.comment.trim()) {
      return;
    }
    
    setCommentLoading(true);
    
    try {
      const result = await addComment(id, commentForm);
      
      // Optimistic UI update - add new comment immediately
      const newComment = {
        ...result.comment,
        created_at: new Date().toISOString()
      };
      
      setComments(prev => [newComment, ...prev]);
      setPost(prev => ({ 
        ...prev, 
        comment_count: (prev.comment_count || 0) + 1 
      }));
      
      // Clear form
      setCommentForm({
        commenter_name: '',
        comment: '',
        is_company_response: false
      });
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert(error.response?.data?.error || 'Failed to add comment');
    } finally {
      setCommentLoading(false);
    }
  };
  
  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  const getExperienceBadgeColor = (type) => {
    const negativeTypes = ['Toxic Management', 'Pay Issues', 'Poor Culture', 'Overworked', 'Discrimination', 'Harassment', 'Lack of Growth'];
    return negativeTypes.includes(type) ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700';
  };
  
  const getReactionCount = (type) => {
    const reaction = reactions.find(r => r.reaction_type === type);
    return reaction ? parseInt(reaction.count) : 0;
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }
  
  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-black text-gray-900 mb-4">Post Not Found</h1>
          <Link to="/redflagged" className="text-red-600 hover:underline">
            Browse all posts
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <Link
          to="/redflagged"
          className="inline-flex items-center text-red-600 hover:text-red-700 mb-6"
        >
          ← Back to all posts
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h1 className="text-4xl font-black text-gray-900 mb-4">
                    {post.company_name}
                  </h1>
                  {post.position && (
                    <p className="text-lg text-gray-600 mb-4">{post.position}</p>
                  )}
                  {post.topic_title && (
                    <div className="mb-4">
                      <span className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                        💭 Topic: {post.topic_title}
                      </span>
                    </div>
                  )}
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getExperienceBadgeColor(post.experience_type)}`}>
                    {post.experience_type}
                  </span>
                </div>
                <div className="text-center ml-6">
                  <div className={`text-5xl font-black ${getRatingColor(Number(post.overall_rating))}`}>
                    {Number(post.overall_rating).toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Overall Rating</div>
                </div>
              </div>
              
              {/* Detailed Ratings */}
              <div className="grid grid-cols-2 gap-4 mb-6 p-6 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Fairness</div>
                  <div className={`text-2xl font-bold ${getRatingColor(post.rating_fairness)}`}>
                    {post.rating_fairness}/5 ★
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Pay & Benefits</div>
                  <div className={`text-2xl font-bold ${getRatingColor(post.rating_pay)}`}>
                    {post.rating_pay}/5 ★
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Culture</div>
                  <div className={`text-2xl font-bold ${getRatingColor(post.rating_culture)}`}>
                    {post.rating_culture}/5 ★
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Management</div>
                  <div className={`text-2xl font-bold ${getRatingColor(post.rating_management)}`}>
                    {post.rating_management}/5 ★
                  </div>
                </div>
              </div>
              
              {/* Story */}
              <div className="prose max-w-none mb-8">
                <h2 className="text-2xl font-bold mb-4">The Story</h2>
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {post.story}
                </div>
              </div>
              
              {/* Meta Info with REAL-TIME COUNTS */}
              <div className="flex items-center justify-between text-sm text-gray-500 pt-6 border-t">
                <div className="flex items-center gap-4">
                  <span>👤 {post.author_name}</span>
                  <span>📅 {new Date(post.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span>👁️ {post.views} views</span>
                  <span>💬 {post.comment_count || comments.length} comments</span>
                </div>
              </div>
            </div>
            
            {/* Reactions with REAL-TIME UPDATES */}
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
              <h3 className="text-xl font-bold mb-4">React to this post</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {Object.entries(reactionEmojis).map(([type, { emoji, label }]) => {
                  const count = getReactionCount(type);
                  const hasReacted = myReactions.includes(type);
                  
                  return (
                    <button
                      key={type}
                      onClick={() => handleReaction(type)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        hasReacted 
                          ? 'border-red-500 bg-red-50 scale-105' 
                          : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-3xl mb-2">{emoji}</div>
                      <div className="text-xs font-semibold">{label}</div>
                      <div className="text-sm text-gray-600 mt-1 font-bold">{count}</div>
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Comments with REAL-TIME UPDATES */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold mb-4">
                Comments & Responses ({comments.length})
              </h3>
              
              {/* Add Comment Form */}
              <div className="mb-8">
                <div className="mb-4">
                  <input
                    type="text"
                    value={commentForm.commenter_name}
                    onChange={(e) => setCommentForm(prev => ({ ...prev, commenter_name: e.target.value }))}
                    placeholder="Your name or company name"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <textarea
                    value={commentForm.comment}
                    onChange={(e) => setCommentForm(prev => ({ ...prev, comment: e.target.value }))}
                    placeholder="Share your thoughts or respond..."
                    rows={4}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 resize-none"
                    required
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={commentForm.is_company_response}
                      onChange={(e) => setCommentForm(prev => ({ ...prev, is_company_response: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm">I'm responding on behalf of the company</span>
                  </label>
                  <button
                    onClick={handleCommentSubmit}
                    disabled={commentLoading}
                    className="bg-red-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {commentLoading ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </div>
              
              {/* Comments List */}
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No comments yet. Be the first to respond!
                  </p>
                ) : (
                  comments.map(comment => (
                    <div 
                      key={comment.id} 
                      className={`p-4 rounded-lg ${
                        comment.is_company_response 
                          ? 'bg-blue-50 border-l-4 border-blue-500' 
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">
                            {comment.commenter_name}
                          </span>
                          {comment.is_company_response && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-semibold">
                              Company Response
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {comment.comment}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Share & Actions */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h4 className="text-lg font-bold mb-4">Share This Post</h4>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    const url = window.location.href;
                    navigator.clipboard.writeText(url);
                    alert('Link copied to clipboard!');
                  }}
                  className="w-full py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-semibold text-sm"
                >
                  📋 Copy Link
                </button>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this workplace experience at ${post.company_name} on RedFlagged by UROWN`)}&url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-2 bg-blue-500 text-white text-center rounded-lg hover:bg-blue-600 transition font-semibold text-sm"
                >
                  🐦 Share on Twitter
                </a>
              </div>
            </div>
            
            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h4 className="text-lg font-bold mb-4">
                  More from {post.company_name}
                </h4>
                <div className="space-y-3">
                  {relatedPosts.map(relatedPost => (
                    <Link
                      key={relatedPost.id}
                      to={`/redflagged/${relatedPost.id}`}
                      className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-lg font-bold ${getRatingColor(Number(relatedPost.overall_rating))}`}>
                          {Number(relatedPost.overall_rating).toFixed(1)} ★
                        </span>
                        <span className="text-xs text-gray-500">
                          {relatedPost.views} views
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {relatedPost.story}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        by {relatedPost.author_name}
                      </p>
                    </Link>
                  ))}
                </div>
                <Link
                  to={`/redflagged?company=${encodeURIComponent(post.company_name)}`}
                  className="block mt-4 text-center text-red-600 hover:underline font-semibold text-sm"
                >
                  View all posts →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RedFlaggedPostPage;