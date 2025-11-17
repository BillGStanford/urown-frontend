// src/config/adsenseConfig.js

/**
 * Google AdSense Configuration
 * 
 * How to get your values:
 * 1. Go to Google AdSense Dashboard
 * 2. Navigate to Ads > Overview
 * 3. Click "By ad unit" 
 * 4. Create ad units for different positions
 * 5. Copy the data-ad-client and data-ad-slot values
 */

export const ADSENSE_CONFIG = {
  // Your AdSense Publisher ID (looks like ca-pub-XXXXXXXXXX)
  // Find this in: AdSense > Account > Settings > Account information
  client: process.env.REACT_APP_ADSENSE_CLIENT || 'ca-pub-5222388837833339',
  
  // Ad Slots for different positions
  // Create these in: AdSense > Ads > By ad unit > Display ads
  slots: {
    // Sidebar ad (300x250 or responsive)
    sidebar: process.env.REACT_APP_ADSENSE_SLOT_SIDEBAR || '1234567890',
    
    // In-feed ad (between articles)
    inFeed: process.env.REACT_APP_ADSENSE_SLOT_INFEED || '1234567891',
    
    // Top banner (728x90 or responsive)
    topBanner: process.env.REACT_APP_ADSENSE_SLOT_TOP_BANNER || '1234567892',
    
    // Bottom banner
    bottomBanner: process.env.REACT_APP_ADSENSE_SLOT_BOTTOM_BANNER || '1234567893',
    
    // Article bottom (below content)
    articleBottom: process.env.REACT_APP_ADSENSE_SLOT_ARTICLE_BOTTOM || '1234567894',
  },
  
  // Enable/disable ads (useful for development)
  enabled: process.env.REACT_APP_ADSENSE_ENABLED !== 'false',
  
  // Only show ads in production (optional)
  productionOnly: true,
};

// Helper to check if ads should be shown
export const shouldShowAds = () => {
  if (!ADSENSE_CONFIG.enabled) return false;
  if (ADSENSE_CONFIG.productionOnly && process.env.NODE_ENV !== 'production') {
    return false;
  }
  return true;
};