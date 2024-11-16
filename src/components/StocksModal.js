import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Edit } from 'lucide-react';

const StocksModal = ({ isOpen, onClose, stock, onSubmit }) => {
  const [quantity, setQuantity] = React.useState('');

  React.useEffect(() => {
    if (stock) {
      setQuantity(stock.quantity?.toString() || '0');
    }
  }, [stock]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...stock,
      quantity: parseInt(quantity) || 0
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="bg-neutral-800 rounded-lg shadow-xl p-6 w-full max-w-md overflow-y-auto max-h-[90vh]"
          >
            <h2 className="text-2xl text-orange-500 font-bold mb-6 flex items-center">
              <Edit className="w-6 h-6 mr-2" />
              Update Stock Quantity
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  value={stock?.name || ''}
                  disabled
                  className="bg-neutral-700 text-gray-100 text-sm rounded-lg block w-full p-2.5 border-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="bg-neutral-700 text-gray-100 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full p-2.5"
                  placeholder="Enter quantity"
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto text-gray-300 bg-neutral-700 hover:bg-neutral-600 focus:ring-4 focus:outline-none focus:ring-neutral-500 font-medium rounded-lg text-sm px-4 py-2 text-center inline-flex items-center justify-center"
                >
                  <X className="w-5 h-5 mr-2" />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto text-white bg-orange-500 hover:bg-orange-600 focus:ring-4 focus:outline-none focus:ring-orange-300 font-medium rounded-lg text-sm px-4 py-2 text-center inline-flex items-center justify-center"
                >
                  <Edit className="w-5 h-5 mr-2" />
                  Update Stock
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StocksModal;