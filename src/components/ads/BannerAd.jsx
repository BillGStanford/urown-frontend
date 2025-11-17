// src/components/ads/BannerAd.jsx
import React from 'react';
import AdSense from '../AdSense';
import { ADSENSE_CONFIG, shouldShowAds } from '../../config/adsenseConfig';

const BannerAd = ({ position = 'top' }) => {
  if (!shouldShowAds()) return null;

  const slot = position === 'top' 
    ? ADSENSE_CONFIG.slots.topBanner 
    : ADSENSE_CONFIG.slots.bottomBanner;

  return (
    <div className="w-full bg-white border-y border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <p className="text-xs font-semibold text-gray-500 text-center mb-2">ADVERTISEMENT</p>
        <div className="flex justify-center">
          <AdSense
            client={ADSENSE_CONFIG.client}
            slot={slot}
            format="horizontal"
            responsive={true}
            style={{ maxWidth: '970px', minHeight: '90px' }}
          />
        </div>
      </div>
    </div>
  );
};

export default BannerAd;