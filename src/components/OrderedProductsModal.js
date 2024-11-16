import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';

const OrderedProductsModal = ({ isVisible, onClose, products = '', selectedOrder }) => {
  // Add console.log to debug incoming props
  React.useEffect(() => {
    if (isVisible) {
      console.log('Modal Products:', products);
      console.log('Modal Selected Order:', selectedOrder);
    }
  }, [isVisible, products, selectedOrder]);

  if (!isVisible) return null;

  // Safely parse products string
  // Safely parse products string
const productList = products?.split(', ').map(item => {
  const match = item.match(/(.*?)\s*\((.*?)\)\s*\[(.*?)\]/);
  return match ? { 
    name: match[1], 
    quantity: match[2],
    image_url: match[3]
  } : { 
    name: item, 
    quantity: 'N/A',
    image_url: null 
  };
}) || [];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Order Details</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <FaTimes />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Order Details Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Customer Details</h3>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium text-gray-700">Name:</span>
                    <span className="text-gray-600 ml-2">{selectedOrder?.full_name || 'N/A'}</span>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-700">Phone:</span>
                    <span className="text-gray-600 ml-2">{selectedOrder?.phone_number || 'N/A'}</span>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-700">Address:</span>
                    <span className="text-gray-600 ml-2">{selectedOrder?.address || 'N/A'}</span>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-700">City:</span>
                    <span className="text-gray-600 ml-2">{selectedOrder?.city || 'N/A'}</span>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-700">State/Province:</span>
                    <span className="text-gray-600 ml-2">{selectedOrder?.state_province || 'N/A'}</span>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-700">Postal Code:</span>
                    <span className="text-gray-600 ml-2">{selectedOrder?.postal_code || 'N/A'}</span>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-700">Delivery Address:</span>
                    <span className="text-gray-600 ml-2">{selectedOrder?.delivery_address || 'N/A'}</span>
                  </p>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-3">Payment Information</h3>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium text-gray-700">Payment Method:</span>
                    <span className="text-gray-600 ml-2">{selectedOrder?.payment_method || 'N/A'}</span>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-700">Subtotal:</span>
                    <span className="text-gray-600 ml-2">
                      {selectedOrder?.subtotal ? `₱${parseFloat(selectedOrder.subtotal).toFixed(2)}` : 'N/A'}
                    </span>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-700">Delivery Fee:</span>
                    <span className="text-gray-600 ml-2">
                      {selectedOrder?.delivery_fee ? `₱${parseFloat(selectedOrder.delivery_fee).toFixed(2)}` : 'N/A'}
                    </span>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-700">Total:</span>
                    <span className="text-gray-600 ml-2">
                      {selectedOrder?.total ? `₱${parseFloat(selectedOrder.total).toFixed(2)}` : 'N/A'}
                    </span>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-700">Order Date:</span>
                    <span className="text-gray-600 ml-2">
                      {selectedOrder?.order_date ? new Date(selectedOrder.order_date).toLocaleDateString() : 'N/A'}
                    </span>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-700">Tracking Number:</span>
                    <span className="text-gray-600 ml-2">{selectedOrder?.tracking_number || 'N/A'}</span>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-700">Status:</span>
                    <span className="text-gray-600 ml-2">{selectedOrder?.status || 'N/A'}</span>
                  </p>
                </div>
              </div>

              {/* Ordered Products Section - Keeping this unchanged as requested */}
              <div className="bg-gray-50 p-4 rounded-lg">
  <h3 className="text-lg font-semibold text-gray-800 mb-3">Ordered Products</h3>
  <div className="max-h-[400px] overflow-y-auto">
    {productList.length > 0 ? (
      productList.map((product, index) => (
        <div 
          key={index} 
          className="mb-3 p-3 bg-white rounded-lg shadow-sm flex items-center"
        >
          {/* Add image container with fixed size */}
          <div className="w-16 h-16 flex-shrink-0 mr-3">
            <img 
              src={product.image_url || '/placeholder-image.png'} // Add a fallback image
              alt={product.name}
              className="w-full h-full object-cover rounded-md"
            />
          </div>
          <div>
            <p className="font-semibold text-gray-700">{product.name}</p>
            <p className="text-sm text-gray-600">Quantity: {product.quantity}</p>
          </div>
        </div>
      ))
    ) : (
      <p className="text-gray-600">No products found</p>
    )}
  </div>
</div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OrderedProductsModal;