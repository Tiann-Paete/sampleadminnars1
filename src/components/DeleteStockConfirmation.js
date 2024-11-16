import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

const DeleteStockConfirmation = ({ isOpen, onClose, stock, onConfirm }) => {
  if (!isOpen || !stock) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full"
        >
          <div className="flex items-center justify-center mb-4">
            <AlertTriangle size={48} className="text-red-500" />
          </div>
          
          <h2 className="text-2xl font-semibold text-gray-600 text-center mb-4">
            Stock Confirm Deletion
          </h2>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Stock ID:</span>
                <span className="font-medium text-gray-800">
                  {String(stock.id).padStart(2, '0')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Product Name:</span>
                <span className="font-medium text-gray-800">
                  {stock.name}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Current Stock:</span>
                <span className="font-medium text-gray-800">
                  {stock.quantity || 'No stocks'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Last Updated:</span>
                <span className="font-medium text-gray-800">
                  {new Date(stock.last_updated).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <p className="text-center mb-6 text-red-500 text-sm">
            This action cannot be undone. The stock record will be permanently deleted.
          </p>

          <div className="flex justify-center space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-900 rounded hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DeleteStockConfirmation;