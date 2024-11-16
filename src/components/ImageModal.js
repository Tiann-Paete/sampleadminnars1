import React from 'react';
import { motion } from 'framer-motion';

const ImageModal = ({ imageUrl, altText, onClose }) => {
  const handleCloseModal = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleCloseModal}
    >
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white p-4 rounded-lg max-w-3xl max-h-3xl overflow-auto relative"
      >
        <img
          src={imageUrl}
          alt={altText}
          className="max-w-full max-h-[80vh] object-contain"
        />
       </motion.div>
       </motion.div>
  );
};

export default ImageModal;