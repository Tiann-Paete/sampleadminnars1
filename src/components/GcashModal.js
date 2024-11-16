import React, { useState } from 'react';
import Image from 'next/image';

const GcashModal = ({ isOpen, onClose, onConfirm, total }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  // Handle visibility on mount/unmount
  React.useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation for Philippine phone numbers
    const phoneRegex = /^(09|\+639)\d{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError('Please enter a valid Philippine phone number');
      return;
    }
    onConfirm(phoneNumber);
    setPhoneNumber('');
    setError('');
  };

  const handleOutsideClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleOutsideClick}
    >
      <div className={`bg-blue-600 p-8 rounded-lg max-w-md w-full transform transition-transform duration-300 ${isVisible ? 'scale-100' : 'scale-95'}`}>
        <div className="flex items-center mb-6">
          <Image src="/ImageLogo/Gcash.png" alt="GCash Logo" width={50} height={50} className="mr-4" />
          <h2 className="text-3xl font-bold text-white">GCash</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="GCash Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-200 border rounded-lg bg-white text-gray-800"
            required
          />
          {error && (
            <p className="mb-4 text-red-200 text-sm">{error}</p>
          )}
          <p className="mb-6 text-white text-lg">Amount to Refund: ₱{total.toLocaleString()}</p>
          <button
            type="submit"
            className="w-full bg-white text-blue-600 px-4 py-3 rounded-full hover:bg-gray-100 transition duration-300 font-bold text-lg"
          >
            Confirm Refund
          </button>
        </form>
      </div>
    </div>
  );
};

export default GcashModal;