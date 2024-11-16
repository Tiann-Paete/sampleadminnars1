import React from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaEdit, FaTimes } from 'react-icons/fa';

const ProductModal = ({ isOpen, onClose, product, onSubmit, onChange }) => {
  if (!isOpen) return null;

  const isEditing = !!product.id;

  return (
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
        className="bg-neutral-800 rounded-lg shadow-xl p-6 w-full max-w-4xl overflow-y-auto max-h-[90vh]"
      >
        <h2 className="text-2xl sm:text-3xl text-orange-500 font-bold mb-6 flex items-center">
          {isEditing ? <FaEdit className="mr-2" /> : <FaPlus className="mr-2" />}
          {isEditing ? 'Edit Product' : 'Add New Product'}
        </h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                name="name"
                value={product.name}
                onChange={onChange}
                placeholder="Product Name"
                required
                className="bg-neutral-700 text-gray-100 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full p-2.5"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2" htmlFor="description">
                Description
              </label>
              <input
                id="description"
                name="description"
                value={product.description}
                onChange={onChange}
                placeholder="Product Description"
                required
                className="bg-neutral-700 text-gray-100 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full p-2.5"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2" htmlFor="price">
                Price
              </label>
              <input
                id="price"
                name="price"
                type="number"
                value={product.price}
                onChange={onChange}
                placeholder="Price"
                required
                className="bg-neutral-700 text-gray-100 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full p-2.5"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2" htmlFor="image_url">
                Image URL
              </label>
              <input
                id="image_url"
                name="image_url"
                value={product.image_url}
                onChange={onChange}
                placeholder="Image URL"
                className="bg-neutral-700 text-gray-100 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full p-2.5"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2" htmlFor="category">
                Category
              </label>
              <input
                id="category"
                name="category"
                value={product.category}
                onChange={onChange}
                placeholder="Category"
                className="bg-neutral-700 text-gray-100 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full p-2.5"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2" htmlFor="supplier_id">
                Supplier ID
              </label>
              <input
                id="supplier_id"
                name="supplier_id"
                value={product.supplier_id}
                onChange={onChange}
                placeholder="Supplier ID"
                required
                className="bg-neutral-700 text-gray-100 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full p-2.5"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto text-gray-300 bg-neutral-700 hover:bg-neutral-600 focus:ring-4 focus:outline-none focus:ring-neutral-500 font-medium rounded-lg text-sm px-4 py-2 text-center inline-flex items-center justify-center"
            >
              <FaTimes className="w-5 h-5 mr-2" />
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto text-white bg-orange-500 hover:bg-orange-600 focus:ring-4 focus:outline-none focus:ring-orange-300 font-medium rounded-lg text-sm px-4 py-2 text-center inline-flex items-center justify-center"
            >
              {isEditing ? <FaEdit className="w-5 h-5 mr-2" /> : <FaPlus className="w-5 h-5 mr-2" />}
              {isEditing ? 'Update' : 'Add'} Product
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ProductModal;