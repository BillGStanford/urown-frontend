// src/components/ads/InFeedAd.jsx
import React from 'react';
import AdSense from '../AdSense';
import { ADSENSE_CONFIG, shouldShowAds } from '../../config/adsenseConfig';

const InFeedAd = ({ className = '' }) => {
  if (!shouldShowAds()) return null;

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden ${className}`}>
      <div className="p-2 bg-gray-50 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-500 text-center">SPONSORED</p>
      </div>
      <div className="p-4">
        <AdSense
          client={ADSENSE_CONFIG.client}
          slot={ADSENSE_CONFIG.slots.inFeed}
          format="fluid"
          responsive={true}
          style={{ minHeight: '200px' }}
        />
      </div>
    </div>
  );
};

export default InFeedAd;