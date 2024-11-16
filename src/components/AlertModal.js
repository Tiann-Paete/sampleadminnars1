import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const AlertModal = ({ message, isVisible, onClose }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(onClose, 300); // Wait for fade out animation before closing
      }, 2700); // Start fading out after 2.7 seconds (3 seconds total display time)

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible && !isAnimating) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 flex justify-center z-50 transition-all duration-300 ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'}`}>
      <div className="bg-red-50 rounded-lg shadow-lg p-4 m-4 max-w-sm w-full flex items-center border border-red-200">
        <X className="h-6 w-6 text-red-600 mr-3 flex-shrink-0" />
        <p className="text-sm font-medium text-gray-900">{message}</p>
      </div>
    </div>
  );
};

export default AlertModal;