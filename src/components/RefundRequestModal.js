import React from 'react';
import { CreditCard, Ban, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RefundRequestModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  orderId, 
  action, 
  paymentMethod, 
  total 
}) => {
  const isRefund = action === 'Refunded';

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="min-h-screen px-4 flex items-center justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={onClose}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="relative bg-white w-full max-w-md rounded-lg shadow-xl z-50"
            >
              {/* Header */}
              <div className="p-6">
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2 mb-4">
                  {isRefund ? (
                    <CreditCard className="w-6 h-6 text-green-600" />
                  ) : (
                    <Ban className="w-6 h-6 text-red-600" />
                  )}
                  <h2 className="text-xl text-gray-800 font-semibold">
    {isRefund ? 'Confirm Refund Request' : 'Confirm Return Cancellation'}
  </h2>

                </div>

                <p className="text-gray-600 mb-6">
    Are you sure you want to {isRefund ? 'approve and refund' : 'cancel'} the return request for order #{orderId}?
  </p>

                <div className={`p-4 rounded-md space-y-2 mb-6 ${
                  isRefund ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  <div className="flex justify-between text-sm">
                    <span className={`${isRefund ? 'text-green-700' : 'text-red-700'}`}>
                      Payment Method:
                    </span>
                    <span className="font-medium text-gray-500">{paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={`${isRefund ? 'text-green-700' : 'text-red-700'}`}>
                      {isRefund ? 'Refund Amount:' : 'Order Total:'}
                    </span>
                    <span className="font-medium text-gray-500">₱{total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
    onClick={() => onConfirm(orderId, action)}
    className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${
      isRefund 
        ? 'bg-green-600 hover:bg-green-700' 
        : 'bg-red-600 hover:bg-red-700'
    }`}
  >
    {isRefund ? 'Approve & Refund' : 'Cancel Return'}
  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RefundRequestModal;