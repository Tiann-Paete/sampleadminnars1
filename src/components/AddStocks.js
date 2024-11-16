import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Edit, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AddStocks = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    stockId: '',
    productId: '',
    quantity: ''
  });
  const [error, setError] = useState('');
  const [productError, setProductError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStock, setCurrentStock] = useState(null);
  const [stockIdExists, setStockIdExists] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({ stockId: '', productId: '', quantity: '' });
      setError('');
      setProductError('');
      setCurrentStock(null);
      setStockIdExists(false);
    }
  }, [isOpen]);

  // Existing checkExistingStock effect remains the same
  useEffect(() => {
    const checkExistingStock = async () => {
      if (formData.stockId || formData.productId) {
        try {
          const response = await axios.get('/api/stocks');
          const existingStock = response.data.stocks.find(
            s => s.id === parseInt(formData.stockId)
          );
          const productStock = response.data.stocks.find(
            s => s.product_id === parseInt(formData.productId)
          );

          if (existingStock) {
            setStockIdExists(true);
            if (formData.productId && existingStock.product_id !== parseInt(formData.productId)) {
              setProductError(`This Stock ID (${formData.stockId}) is already assigned to Product ID ${existingStock.product_id}`);
              setCurrentStock(null);
              return;
            }
          } else {
            setStockIdExists(false);
          }

          if (productStock && (!existingStock || existingStock.id !== productStock.id)) {
            setProductError(`This Product ID already has Stock ID ${productStock.id}`);
            setCurrentStock(null);
            return;
          }

          if (existingStock && existingStock.product_id === parseInt(formData.productId)) {
            setCurrentStock(existingStock);
            setError(`Current stock quantity: ${existingStock.quantity}. New quantity will be added to this.`);
            setProductError('');
          } else {
            setCurrentStock(null);
            setError('');
            setProductError('');
          }
        } catch (err) {
          console.error('Error checking existing stock:', err);
        }
      } else {
        setCurrentStock(null);
        setError('');
        setProductError('');
        setStockIdExists(false);
      }
    };

    checkExistingStock();
  }, [formData.stockId, formData.productId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Existing validation function remains the same
  const validateForm = () => {
    if (!formData.stockId || !formData.productId || !formData.quantity) {
      setError('All fields are required');
      return false;
    }
    if (isNaN(formData.quantity) || parseInt(formData.quantity) <= 0) {
      setError('Quantity must be a positive number');
      return false;
    }
    if (isNaN(formData.stockId) || parseInt(formData.stockId) <= 0) {
      setError('Stock ID must be a positive number');
      return false;
    }
    if (isNaN(formData.productId) || parseInt(formData.productId) <= 0) {
      setError('Product ID must be a positive number');
      return false;
    }
    if (productError) {
      return false;
    }
    return true;
  };

  // Existing submit handler remains the same
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    setLoading(true);
    try {
      const productResponse = await axios.get(`/api/products?id=${formData.productId}`);
      const productExists = productResponse.data.products.some(p => p.id === parseInt(formData.productId));
      
      if (!productExists) {
        setError('Product ID does not exist');
        setLoading(false);
        return;
      }
  
      let response;
      const newQuantity = parseInt(formData.quantity);
  
      if (currentStock) {
        // For existing stock, use the update endpoint
        response = await axios.put(`/api/stocks/${currentStock.id}`, {
          quantity: newQuantity,
          operation: 'add'  // Specify that we want to add to existing quantity
        });
      } else {
        // For new stock, use the create endpoint
        response = await axios.post('/api/stocks', {
          id: parseInt(formData.stockId),
          product_id: parseInt(formData.productId),
          quantity: newQuantity
        });
      }
  
      if (response.status === 200 || response.status === 201) {
        onSubmit(response.data);
        onClose();
        setFormData({ stockId: '', productId: '', quantity: '' });
        setCurrentStock(null);
      }
    } catch (err) {
      if (err.response) {
        switch (err.response.status) {
          case 404:
            setError('Product not found or has been deleted');
            break;
          case 400:
            setError(err.response.data.message || 'Invalid request');
            break;
          default:
            setError(err.response.data?.error || 'Error processing your request');
        }
      } else {
        setError('Network error. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
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
              <Plus className="w-6 h-6 mr-2" />
              Add Stock
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">
                  Stock ID
                </label>
                <input
                  type="number"
                  name="stockId"
                  value={formData.stockId}
                  onChange={handleInputChange}
                  className="bg-neutral-700 text-gray-100 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full p-2.5"
                  placeholder="Enter Stock ID (e.g., 101)"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">
                  Product ID
                </label>
                <input
                  type="number"
                  name="productId"
                  value={formData.productId}
                  onChange={handleInputChange}
                  className="bg-neutral-700 text-gray-100 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full p-2.5"
                  placeholder="Enter Product ID (e.g., 1)"
                />
                {productError && (
                  <div className="text-red-500 text-sm mt-1">
                    {productError}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">
                  Quantity to Add
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="bg-neutral-700 text-gray-100 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full p-2.5"
                  placeholder="Enter quantity to add"
                />
              </div>

              {currentStock && (
                <div className="bg-neutral-700 p-3 rounded-md">
                  <p className="text-sm text-gray-300">
                    Current stock: {currentStock.quantity} units
                    {formData.quantity && (
                      <>
                        <br />
                        After adding: {currentStock.quantity + parseInt(formData.quantity || 0)} units
                      </>
                    )}
                  </p>
                </div>
              )}

              {error && !currentStock && (
                <div className="text-red-500 text-sm mt-2">
                  {error}
                </div>
              )}

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
                  disabled={loading || productError !== ''}
                  className="w-full sm:w-auto text-white bg-orange-500 hover:bg-orange-600 focus:ring-4 focus:outline-none focus:ring-orange-300 font-medium rounded-lg text-sm px-4 py-2 text-center inline-flex items-center justify-center disabled:bg-orange-300"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  {loading ? 'Processing...' : currentStock ? 'Add to Stock' : 'Create Stock'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddStocks;