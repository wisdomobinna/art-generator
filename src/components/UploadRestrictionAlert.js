import React from 'react';

const UploadRestrictionAlert = ({ onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-50 w-96">
      <div className="bg-white border-l-4 border-red-500 rounded-lg shadow-lg p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-red-500 font-semibold mb-1">
              Image Upload Restricted
            </h3>
            <p className="text-gray-600 text-sm">
              Your account is set to AI-only image generation. Image uploads are not permitted for this session.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadRestrictionAlert;