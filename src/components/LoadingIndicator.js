// components/LoadingIndicator.js
import React from 'react';

const LoadingIndicator = () => {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-lg font-semibold">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingIndicator;