import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ImageModal from './ImageModal';
import ProductModal from './ProductModal';
import { motion, AnimatePresence } from 'framer-motion';
import DeleteProductConfirmation from '../components/DeleteProductConfirmation';

const DrawerInventory = () => {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  const fetchProducts = async (page) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/products?page=${page}&limit=10`);
      setProducts(response.data.products);
      setTotalPages(response.data.totalPages);
      setTotalItems(response.data.totalItems);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (currentProduct.id) {
      await handleUpdateProduct();
    } else {
      await handleAddProduct();
    }
    setIsModalOpen(false);
    setCurrentProduct(null);
  };
  
  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setCurrentProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleAddProduct = async () => {
  try {
    // Remove any stock-related fields from the product submission
    const productData = { ...currentProduct };
    delete productData.stock_quantity; // Ensure stock isn't included
    
    await axios.post('/api/products', productData);
    fetchProducts(currentPage);
  } catch (error) {
    console.error('Error adding product:', error);
  }
};

  const handleUpdateProduct = async () => {
    try {
      await axios.put(`/api/products/${currentProduct.id}`, currentProduct);
      fetchProducts(currentPage);
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleDeleteProduct = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      try {
        const response = await axios.delete(`/api/products/${productToDelete.id}`);
        if (response.status === 200) {
          fetchProducts(currentPage);
          setIsDeleteModalOpen(false);
          setProductToDelete(null);
        } else {
          console.error('Error marking product as deleted:', response.data.error);
        }
      } catch (error) {
        console.error('Error marking product as deleted:', error.response ? error.response.data : error.message);
      }
    }
  };

  const handleEditProduct = (product) => {
    setCurrentProduct(product);
    setIsModalOpen(true);
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const renderPagination = () => {
    const pageNumbers = [];
    const pageRange = 5;
    let startPage, endPage;
  
    if (totalPages <= pageRange) {
      startPage = 1;
      endPage = totalPages;
    } else {
      if (currentPage <= Math.ceil(pageRange / 2)) {
        startPage = 1;
        endPage = pageRange;
      } else if (currentPage + Math.floor(pageRange / 2) >= totalPages) {
        startPage = totalPages - pageRange + 1;
        endPage = totalPages;
      } else {
        startPage = currentPage - Math.floor(pageRange / 2);
        endPage = startPage + pageRange - 1;
      }
    }
  
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 mx-1 rounded shadow-lg ${
            currentPage === i ? 'bg-orange-500 text-white' : 'text-black bg-white hover:bg-orange-100'
          }`}
        >
          {i}
        </button>
      );
    }
  
    return (
      <div className="flex justify-center items-center mt-4">
        <button
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 mx-1 text-black shadow-lg rounded bg-white hover:bg-orange-100 disabled:opacity-50"
        >
          &lt;
        </button>
        
        {startPage > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className="px-3 py-1 mx-1 rounded shadow-lg text-black bg-white hover:bg-orange-100"
            >
              1
            </button>
            {startPage > 2 && <span className="mx-1 text-black">...</span>}
          </>
        )}
        
        {pageNumbers}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="mx-1 text-black">...</span>}
            <button
              onClick={() => handlePageChange(totalPages)}
              className="px-3 py-1 mx-1 rounded shadow-lg text-black bg-white hover:bg-orange-100"
            >
              {totalPages}
            </button>
          </>
        )}
        
        <button
          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 mx-1 text-black shadow-lg rounded bg-white hover:bg-orange-100 disabled:opacity-50"
        >
          &gt;
        </button>
        
        <span className="ml-4 text-gray-600">
          {totalItems} items | Page {currentPage} of {totalPages}
        </span>
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl text-neutral-900 font-bold">
          Product List 
        </h2>
        <button 
          onClick={() => {
            setCurrentProduct({
              name: '',
              description: '',
              price: '',
              image_url: '',
              category: '',
              supplier_id: '',
            });
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          <span className="hidden sm:inline font-medium">Add Product</span>
        </button>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      ) : (
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="overflow-x-auto shadow-md rounded-lg"
        >
          <div className="w-full min-w-max">
            <table className="w-full text-xs sm:text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-2 py-2 sm:px-3 sm:py-3">Product ID</th>
                  <th scope="col" className="px-2 py-2 sm:px-3 sm:py-3">Img</th>
                  <th scope="col" className="px-2 py-2 sm:px-3 sm:py-3">Name</th>
                  <th scope="col" className="px-2 py-2 sm:px-3 sm:py-3">Description</th>
                  <th scope="col" className="px-2 py-2 sm:px-3 sm:py-3">Price</th>
                  <th scope="col" className="px-2 py-2 sm:px-3 sm:py-3">Category</th>
                  <th scope="col" className="px-2 py-2 sm:px-3 sm:py-3">Supplier ID</th>
                  <th scope="col" className="px-2 py-2 sm:px-3 sm:py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {products.map((product) => (
                    <motion.tr 
                      key={product.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white border-b hover:bg-gray-50"
                    >
                      <td className="px-2 py-2 sm:px-3 sm:py-3">{product.id}</td>
                      <td className="px-2 py-2 sm:px-3 sm:py-3">
                        {product.image_url && (
                          <img 
                            src={product.image_url.startsWith('http') ? product.image_url : `http://localhost:8001${product.image_url}`} 
                            alt={product.name} 
                            className="w-8 h-8 rounded-full object-cover cursor-pointer"
                            onClick={() => handleImageClick(product.image_url.startsWith('http') ? product.image_url : `http://localhost:8001${product.image_url}`)}
                          />
                        )}
                      </td>
                      <td className="px-2 py-2 sm:px-3 sm:py-3 font-medium text-gray-900 whitespace-nowrap">{product.name}</td>
                      <td className="px-2 py-2 sm:px-3 sm:py-3 max-w-[150px] truncate">{product.description}</td>
                      <td className="px-2 py-2 sm:px-3 sm:py-3">₱{product.price}</td>
                      <td className="px-2 py-2 sm:px-3 sm:py-3">{product.category}</td>
                      <td className="px-2 py-2 sm:px-3 sm:py-3">{product.supplier_id}</td>
                      <td className="px-2 py-2 sm:px-3 sm:py-3">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleEditProduct(product)} 
                            className="text-blue-500 hover:text-blue-900"
                            title="Update"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product)} 
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
      {renderPagination()}
      
      <AnimatePresence>
        {selectedImage && (
          <ImageModal 
            imageUrl={selectedImage} 
            altText="Product Image"
            onClose={closeImageModal}
          />
        )}
      </AnimatePresence>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCurrentProduct(null);
        }}
        product={currentProduct || {}}
        onSubmit={handleModalSubmit}
        onChange={handleModalChange}
      />
      <DeleteProductConfirmation
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        productName={productToDelete?.name}
      />
    </motion.div>
  );
}

export default DrawerInventory;