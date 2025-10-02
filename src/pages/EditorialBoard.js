// pages/EditorialBoard.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { fetchWithDeduplication, createApiRequest } from '../utils/apiUtils';

function EditorialBoard() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all', // all, published, draft
    certified: 'all', // all, certified, uncertified
    search: ''
  });
  const [isCertifying, setIsCertifying] = useState(false);
  const [certifyModal, setCertifyModal] = useState({
    show: false,
    article: null,
    action: null // certify or uncertify
  });
  const [showCertificationChecklist, setShowCertificationChecklist] = useState(false);
  const [checklistItems, setChecklistItems] = useState({
    factualAccuracy: false,
    sourcesVerified: false,
    grammarSpelling: false,
    plagiarismCheck: false,
    ethicalStandards: false,
    legalCompliance: false,
    editorialGuidelines: false,
    imageRights: false,
    titleAccuracy: false,
    contentStructure: false
  });

  // Editorial requirements that must be checked before certification
  const editorialRequirements = [
    {
      id: 'factualAccuracy',
      title: 'Factual Accuracy Verification',
      description: 'All facts, statistics, and claims have been verified from reliable sources'
    },
    {
      id: 'sourcesVerified',
      title: 'Source Credibility Check',
      description: 'All sources are credible, current, and properly cited'
    },
    {
      id: 'grammarSpelling',
      title: 'Grammar and Spelling Review',
      description: 'Article has been proofread for grammar, spelling, and style consistency'
    },
    {
      id: 'plagiarismCheck',
      title: 'Plagiarism Verification',
      description: 'Content has been checked for originality and proper attribution'
    },
    {
      id: 'ethicalStandards',
      title: 'Ethical Standards Compliance',
      description: 'Article meets journalistic ethics and editorial standards'
    },
    {
      id: 'legalCompliance',
      title: 'Legal Compliance Review',
      description: 'Content reviewed for potential legal issues, libel, or defamation'
    },
    {
      id: 'editorialGuidelines',
      title: 'Editorial Guidelines Adherence',
      description: 'Article follows publication style guide and editorial policies'
    },
    {
      id: 'imageRights',
      title: 'Image and Media Rights',
      description: 'All images and media have proper licensing and attribution'
    },
    {
      id: 'titleAccuracy',
      title: 'Headline Accuracy',
      description: 'Title accurately represents content and follows headline guidelines'
    },
    {
      id: 'contentStructure',
      title: 'Content Structure Review',
      description: 'Article has proper structure, flow, and readability'
    }
  ];

  // Fetch articles
  const fetchArticles = useCallback(async () => {
    try {
      const response = await fetchWithDeduplication(
        'editorial-articles',
        createApiRequest('/admin/articles', { method: 'GET' })
      );
      
      setArticles(response.data.articles);
      setError(null);
    } catch (error) {
      console.error('Error fetching articles:', error);
      if (error.response?.status !== 429) {
        setError('Failed to load articles. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data loading
  useEffect(() => {
    if (user && (user.role === 'editorial-board' || user.role === 'admin' || user.role === 'super-admin')) {
      fetchArticles();
    }
  }, [user, fetchArticles]);

  // Apply filters when articles or filters change
  useEffect(() => {
    let result = [...articles];
    
    // Status filter
    if (filters.status !== 'all') {
      result = result.filter(article => 
        filters.status === 'published' ? article.published : !article.published
      );
    }
    
    // Certification filter
    if (filters.certified !== 'all') {
      result = result.filter(article => 
        filters.certified === 'certified' ? article.certified : !article.certified
      );
    }
    
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(article => 
        article.title.toLowerCase().includes(searchLower) ||
        article.display_name.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredArticles(result);
  }, [articles, filters]);

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // Handle checklist item toggle
  const handleChecklistToggle = (itemId) => {
    setChecklistItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Check if all checklist items are completed
  const isChecklistComplete = () => {
    return Object.values(checklistItems).every(item => item === true);
  };

  // Reset checklist
  const resetChecklist = () => {
    const resetItems = {};
    editorialRequirements.forEach(req => {
      resetItems[req.id] = false;
    });
    setChecklistItems(resetItems);
  };

  // Handle certification action
  const handleCertifyAction = async () => {
    if (!certifyModal.article || !certifyModal.action) return;
    
    setIsCertifying(true);
    try {
      await fetchWithDeduplication(
        `certify-article-${certifyModal.article.id}`,
        createApiRequest(`/editorial/articles/${certifyModal.article.id}/certify`, {
          method: 'POST',
          data: { certified: certifyModal.action === 'certify' }
        })
      );
      
      // Refresh articles
      await fetchArticles();
      setCertifyModal({ show: false, article: null, action: null });
      setShowCertificationChecklist(false);
      resetChecklist();
    } catch (error) {
      console.error('Error certifying article:', error);
      setError('Failed to update article certification. Please try again later.');
    } finally {
      setIsCertifying(false);
    }
  };

  // Show certification confirmation modal
  const showCertifyModal = (article, action) => {
    if (action === 'certify') {
      // Show checklist first for certification
      setCertifyModal({
        show: false,
        article,
        action
      });
      setShowCertificationChecklist(true);
      resetChecklist();
    } else {
      // Direct confirmation for uncertification
      setCertifyModal({
        show: true,
        article,
        action
      });
    }
  };

  // Proceed to final certification after checklist completion
  const proceedToCertification = () => {
    setShowCertificationChecklist(false);
    setCertifyModal({
      show: true,
      article: certifyModal.article,
      action: certifyModal.action
    });
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!user || (user.role !== 'editorial-board' && user.role !== 'admin' && user.role !== 'super-admin')) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-2xl px-4">
          <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
          <p className="text-xl mb-8">You don't have permission to access the Editorial Board.</p>
          <a href="/" className="bg-black text-white px-6 py-3 font-bold hover:bg-gray-800 transition-colors">
            GO TO HOMEPAGE
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-2 border-red-500 text-red-700 p-4 mb-8 text-center">
          <div className="text-xl font-bold">{error}</div>
          <button 
            onClick={() => setError(null)}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded font-bold hover:bg-red-600"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-7xl font-bold mb-6">
          EDITORIAL BOARD
        </h1>
        <p className="text-2xl font-bold text-gray-600">
          Review and certify articles for quality and accuracy
        </p>
        <div className="flex justify-center mt-6 space-x-4">
          <button 
            onClick={fetchArticles}
            disabled={loading}
            className={`px-6 py-3 font-bold ${
              loading 
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            {loading ? 'LOADING...' : 'REFRESH ARTICLES'}
          </button>
          <Link 
            to="/editorial/create-debate"
            className="bg-blue-600 text-white px-6 py-3 font-bold hover:bg-blue-700"
          >
            CREATE DEBATE TOPIC
          </Link>
        </div>
      </div>

      {/* Editorial Requirements Section */}
      <div className="bg-blue-50 p-6 border-2 border-blue-500 mb-8">
        <h2 className="text-2xl font-bold mb-4 text-blue-800">Editorial Certification Requirements</h2>
        <p className="text-blue-700 mb-4 font-semibold">
          Before certifying any article, editors must verify all of the following criteria:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {editorialRequirements.map((requirement) => (
            <div key={requirement.id} className="bg-white p-4 border border-blue-300 rounded">
              <h3 className="font-bold text-gray-800 mb-2">{requirement.title}</h3>
              <p className="text-sm text-gray-600">{requirement.description}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-4 bg-blue-100 border border-blue-300 rounded">
          <p className="text-sm text-blue-800 font-semibold">
            <strong>Note:</strong> When you click "Certify" on an article, you will be prompted to confirm 
            that you have reviewed all these requirements before the article can be certified.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-6 border-2 border-black mb-8">
        <h2 className="text-2xl font-bold mb-4">Filter Articles</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-bold mb-2">Status</label>
            <select 
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="all">All Articles</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-bold mb-2">Certification</label>
            <select 
              value={filters.certified}
              onChange={(e) => handleFilterChange('certified', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="all">All</option>
              <option value="certified">Certified</option>
              <option value="uncertified">Uncertified</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-bold mb-2">Search</label>
            <input 
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search by title or author..."
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        </div>
        
        <div className="text-sm text-gray-600">
          Showing {filteredArticles.length} of {articles.length} articles
        </div>
      </div>

      {/* Articles List */}
      <div className="bg-white p-8 border-2 border-black">
        <h2 className="text-2xl font-bold mb-6">Articles for Review</h2>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <div className="text-xl font-bold mt-4">LOADING ARTICLES...</div>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-2xl font-bold mb-4">No articles found</div>
            <p className="text-gray-600">Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Views
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Certified
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredArticles.map((article) => (
                  <tr key={article.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900 max-w-xs truncate">
                        {article.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(article.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{article.display_name}</div>
                      <div className="text-xs text-gray-500">{article.tier}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        article.published 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {article.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {article.views || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        article.certified 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {article.certified ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => showCertifyModal(article, article.certified ? 'uncertify' : 'certify')}
                        className={`mr-3 ${article.certified ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}`}
                      >
                        {article.certified ? 'Uncertify' : 'Certify'}
                      </button>
                      <a 
                        href={`/article/${article.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Certification Checklist Modal */}
      {showCertificationChecklist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-3xl font-bold mb-6 text-center text-blue-800">
              Article Certification Checklist
            </h3>
            
            {certifyModal.article && (
              <div className="mb-6 p-4 bg-gray-100 rounded">
                <h4 className="font-bold text-lg">{certifyModal.article.title}</h4>
                <p className="text-gray-600">by {certifyModal.article.display_name}</p>
              </div>
            )}
            
            <div className="mb-6">
              <p className="text-lg mb-4 font-semibold text-gray-700">
                Before certifying this article, please confirm that you have reviewed and verified all of the following requirements:
              </p>
              
              <div className="space-y-4">
                {editorialRequirements.map((requirement) => (
                  <label key={requirement.id} className="flex items-start space-x-3 p-4 border rounded hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklistItems[requirement.id]}
                      onChange={() => handleChecklistToggle(requirement.id)}
                      className="mt-1 h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">{requirement.title}</div>
                      <div className="text-sm text-gray-600 mt-1">{requirement.description}</div>
                    </div>
                  </label>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-300 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> By checking these items and proceeding with certification, 
                  you are confirming that this article meets all editorial standards and is ready for publication.
                </p>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {Object.values(checklistItems).filter(Boolean).length} of {editorialRequirements.length} items completed
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setShowCertificationChecklist(false);
                    resetChecklist();
                  }}
                  className="px-6 py-3 border border-gray-300 rounded font-bold hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={proceedToCertification}
                  disabled={!isChecklistComplete()}
                  className={`px-6 py-3 rounded font-bold text-white ${
                    isChecklistComplete()
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isChecklistComplete() ? 'Proceed to Certify' : 'Complete All Items'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Certification Confirmation Modal */}
      {certifyModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-lg max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4">
              {certifyModal.action === 'certify' ? 'Certify Article' : 'Uncertify Article'}
            </h3>
            <p className="mb-6">
              Are you sure you want to {certifyModal.action} this article?
              {certifyModal.article && (
                <div className="mt-2 p-3 bg-gray-100 rounded">
                  <strong>{certifyModal.article.title}</strong>
                  <div className="text-sm text-gray-600">by {certifyModal.article.display_name}</div>
                </div>
              )}
            </p>
            
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setCertifyModal({ show: false, article: null, action: null })}
                className="px-4 py-2 border border-gray-300 rounded font-bold hover:bg-gray-100"
                disabled={isCertifying}
              >
                Cancel
              </button>
              <button
                onClick={handleCertifyAction}
                disabled={isCertifying}
                className={`px-4 py-2 rounded font-bold text-white ${
                  certifyModal.action === 'certify' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-yellow-600 hover:bg-yellow-700'
                } ${isCertifying ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isCertifying ? 'Processing...' : certifyModal.action === 'certify' ? 'Certify' : 'Uncertify'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditorialBoard;