// src/components/ads/SidebarAd.jsx
import React from 'react';
import AdSense from '../AdSense';
import { ADSENSE_CONFIG, shouldShowAds } from '../../config/adsenseConfig';

const SidebarAd = () => {
  if (!shouldShowAds()) return null;

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-3 border-b border-gray-100 bg-gray-50">
        <p className="text-xs font-semibold text-gray-500 text-center">ADVERTISEMENT</p>
      </div>
      <div className="p-4">
        <AdSense
          client={ADSENSE_CONFIG.client}
          slot={ADSENSE_CONFIG.slots.sidebar}
          format="auto"
          responsive={true}
          style={{ minHeight: '250px' }}
        />
      </div>
    </div>
  );
};

export default SidebarAd;