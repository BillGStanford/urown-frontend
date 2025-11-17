// src/components/AdSense.jsx
import React, { useEffect } from 'react';

/**
 * Reusable Google AdSense Component
 * 
 * Usage:
 * <AdSense 
 *   client="ca-pub-XXXXXXXXXX"
 *   slot="1234567890"
 *   format="auto"
 *   responsive={true}
 * />
 */

const AdSense = ({ 
  client, 
  slot, 
  format = 'auto', 
  responsive = true,
  style = {},
  className = ''
}) => {
  useEffect(() => {
    try {
      // Push the ad to AdSense
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div className={`adsense-container ${className}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive.toString()}
      />
    </div>
  );
};

export default AdSense;