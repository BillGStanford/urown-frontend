// src/components/ViralShareCard.js
// Generates beautiful, shareable images from RedFlagged posts

import React, { useRef } from 'react';
import html2canvas from 'html2canvas';

const ViralShareCard = ({ post }) => {
  const cardRef = useRef(null);
  
  const generateShareImage = async () => {
    if (!cardRef.current) return;
    
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2
      });
      
      const image = canvas.toDataURL('image/png');
      
      // Download image
      const link = document.createElement('a');
      link.download = `redflagged-${post.company_name.toLowerCase().replace(/\s/g, '-')}.png`;
      link.href = image;
      link.click();
    } catch (error) {
      console.error('Generate image error:', error);
    }
  };
  
  const getRatingColor = (rating) => {
    if (rating >= 4) return '#10b981'; // green
    if (rating >= 3) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };
  
  return (
    <div className="space-y-4">
      {/* Share Card Preview */}
      <div 
        ref={cardRef} 
        className="bg-gradient-to-br from-red-600 to-orange-600 p-8 rounded-2xl text-white"
        style={{ width: '600px', height: '600px' }}
      >
        <div className="h-full flex flex-col justify-between">
          {/* Header */}
          <div>
            <div className="text-6xl mb-4">🚩</div>
            <h2 className="text-5xl font-black mb-4 leading-tight">
              {post.company_name}
            </h2>
            <div 
              className="inline-block px-4 py-2 bg-white bg-opacity-20 rounded-full text-lg font-bold mb-6"
            >
              {post.experience_type}
            </div>
          </div>
          
          {/* Rating */}
          <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl p-8 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm opacity-75 mb-2">Overall Rating</div>
                <div 
                  className="text-7xl font-black"
                  style={{ color: getRatingColor(post.overall_rating) }}
                >
                  {post.overall_rating.toFixed(1)}
                </div>
                <div className="text-2xl mt-2">★ ★ ★ ★ ★</div>
              </div>
              
              <div className="text-right">
                <div className="space-y-3">
                  <div>
                    <div className="text-xs opacity-75">Fairness</div>
                    <div className="text-2xl font-bold">{post.rating_fairness}/5</div>
                  </div>
                  <div>
                    <div className="text-xs opacity-75">Pay</div>
                    <div className="text-2xl font-bold">{post.rating_pay}/5</div>
                  </div>
                  <div>
                    <div className="text-xs opacity-75">Culture</div>
                    <div className="text-2xl font-bold">{post.rating_culture}/5</div>
                  </div>
                  <div>
                    <div className="text-xs opacity-75">Management</div>
                    <div className="text-2xl font-bold">{post.rating_management}/5</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quote */}
          <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl p-6 mb-6">
            <p className="text-xl font-semibold leading-relaxed line-clamp-4">
              "{post.story.substring(0, 200)}..."
            </p>
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-between text-lg">
            <div>by {post.author_name}</div>
            <div className="font-bold">RedFlagged by UROWN</div>
          </div>
        </div>
      </div>
      
      {/* Generate Button */}
      <div className="flex gap-4">
        <button
          onClick={generateShareImage}
          className="flex-1 bg-red-600 text-white font-bold py-4 rounded-lg hover:bg-red-700 transition"
        >
          📸 Generate Share Image
        </button>
        <button
          onClick={() => {
            const text = `Check out this ${post.overall_rating.toFixed(1)}⭐ rating for ${post.company_name} on RedFlagged by UROWN! 🚩`;
            const url = window.location.href;
            
            if (navigator.share) {
              navigator.share({
                title: `${post.company_name} - RedFlagged`,
                text: text,
                url: url
              });
            } else {
              navigator.clipboard.writeText(`${text}\n${url}`);
              alert('Link copied to clipboard!');
            }
          }}
          className="flex-1 bg-blue-600 text-white font-bold py-4 rounded-lg hover:bg-blue-700 transition"
        >
          📱 Share Now
        </button>
      </div>
    </div>
  );
};


// Alternative: Text-based viral content generator
const ViralTweetGenerator = ({ post }) => {
  const templates = [
    `🚩 RED FLAG ALERT 🚩\n\n${post.company_name} got a ${post.overall_rating.toFixed(1)}⭐ rating from an employee.\n\n"${post.story.substring(0, 100)}..."\n\nRead the full story on RedFlagged by UROWN`,
    
    `Just saw this on RedFlagged:\n\n${post.company_name}: ${post.overall_rating.toFixed(1)}/5 stars\n\nExperience: ${post.experience_type}\n\n"${post.story.substring(0, 120)}..."\n\nIs this your experience too?`,
    
    `⚠️ Workers at ${post.company_name} are speaking out:\n\n✊ Fairness: ${post.rating_fairness}/5\n💰 Pay: ${post.rating_pay}/5\n🏢 Culture: ${post.rating_culture}/5\n👔 Management: ${post.rating_management}/5\n\nOverall: ${post.overall_rating.toFixed(1)}/5\n\n#RedFlagged #WorkerRights`,
    
    `${post.company_name} employees are sharing their truth on RedFlagged:\n\n"${post.story.substring(0, 150)}..."\n\nRating: ${post.overall_rating.toFixed(1)}⭐\n\nYour workplace story matters too. Share it anonymously.`
  ];
  
  const [selectedTemplate, setSelectedTemplate] = React.useState(0);
  
  return (
    <div className="bg-white rounded-lg p-6">
      <h3 className="text-xl font-bold mb-4">Ready-to-Share Content</h3>
      
      <div className="space-y-4">
        {/* Template Selector */}
        <div className="flex gap-2">
          {templates.map((_, index) => (
            <button
              key={index}
              onClick={() => setSelectedTemplate(index)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                selectedTemplate === index
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Template {index + 1}
            </button>
          ))}
        </div>
        
        {/* Preview */}
        <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-red-600">
          <pre className="whitespace-pre-wrap font-sans text-sm">
            {templates[selectedTemplate]}
          </pre>
        </div>
        
        {/* Copy Button */}
        <button
          onClick={() => {
            navigator.clipboard.writeText(templates[selectedTemplate] + '\n\n' + window.location.href);
            alert('Copied to clipboard!');
          }}
          className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition"
        >
          📋 Copy to Clipboard
        </button>
      </div>
    </div>
  );
};


// Pre-made hashtag suggestions
const HashtagSuggestions = ({ post }) => {
  const baseHashtags = ['#RedFlagged', '#WorkerRights', '#EmployeeVoice', '#WorkplaceTruth'];
  
  const experienceHashtags = {
    'Toxic Management': ['#ToxicWorkplace', '#BadBoss', '#ManagementFail'],
    'Pay Issues': ['#FairPay', '#PayTransparency', '#WageGap'],
    'Poor Culture': ['#ToxicCulture', '#WorkCulture', '#CompanyCulture'],
    'Overworked': ['#Burnout', '#WorkLifeBalance', '#Overworked'],
    'Discrimination': ['#WorkplaceEquity', '#Discrimination', '#EqualRights'],
    'Great Experience': ['#GreatCompany', '#BestWorkplace', '#EmployeeSatisfaction']
  };
  
  const suggestedHashtags = [
    ...baseHashtags,
    ...(experienceHashtags[post.experience_type] || []),
    `#${post.company_name.replace(/\s/g, '')}`
  ];
  
  return (
    <div className="flex flex-wrap gap-2">
      {suggestedHashtags.map(tag => (
        <button
          key={tag}
          onClick={() => {
            navigator.clipboard.writeText(tag);
            alert(`Copied ${tag}!`);
          }}
          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition"
        >
          {tag}
        </button>
      ))}
    </div>
  );
};


// Social media preview cards
const SocialPreviewCard = ({ post, platform }) => {
  const previews = {
    twitter: {
      title: `${post.company_name} - RedFlagged`,
      description: post.story.substring(0, 200),
      image: 'https://your-domain.com/redflagged-og-image.jpg'
    },
    linkedin: {
      title: `Employee Experience at ${post.company_name}`,
      description: `${post.overall_rating.toFixed(1)}⭐ rating - ${post.experience_type}`,
      image: 'https://your-domain.com/redflagged-og-image.jpg'
    },
    facebook: {
      title: `The truth about working at ${post.company_name}`,
      description: post.story.substring(0, 300),
      image: 'https://your-domain.com/redflagged-og-image.jpg'
    }
  };
  
  const preview = previews[platform];
  
  return (
    <div className="border rounded-lg overflow-hidden hover:shadow-lg transition">
      <div className="bg-gray-200 h-48 flex items-center justify-center">
        <div className="text-6xl">🚩</div>
      </div>
      <div className="p-4">
        <h4 className="font-bold mb-1 line-clamp-2">{preview.title}</h4>
        <p className="text-sm text-gray-600 line-clamp-3">{preview.description}</p>
        <div className="text-xs text-gray-500 mt-2">redflagged.urown.com</div>
      </div>
    </div>
  );
};


export { 
  ViralShareCard, 
  ViralTweetGenerator, 
  HashtagSuggestions,
  SocialPreviewCard 
};

// Note: Install html2canvas for image generation:
// npm install html2canvas