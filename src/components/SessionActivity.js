import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import RefundRequestModal from '../components/RefundRequestModal';
import GcashModal from '../components/GcashModal';
import ProductOrdered from '../components/ProductOrdered';

const ReturnRefundManagement = () => {
  const [returnRequests, setReturnRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [requestsPerPage] = useState(10); // You can adjust this number
  const [modalState, setModalState] = useState({
    isOpen: false,
    orderId: null,
    action: null,
    paymentMethod: '',
    total: 0
  });
  const [gcashModalState, setGcashModalState] = useState({
    isOpen: false,
    orderId: null,
    total: 0
  });
  const [productModalState, setProductModalState] = useState({
    isOpen: false,
    products: []
  });

  useEffect(() => {
    fetchReturnRequests();
  }, []);

  // Get current requests for pagination
  const indexOfLastRequest = currentPage * requestsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - requestsPerPage;
  const currentRequests = returnRequests.slice(indexOfFirstRequest, indexOfLastRequest);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const fetchReturnRequests = async () => {
    try {
      const response = await fetch('/api/return-requests');
      if (!response.ok) {
        throw new Error('Failed to fetch return requests');
      }
      const data = await response.json();
      setReturnRequests(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching return requests:', error);
      setError('Failed to load return requests. Please try again later.');
      setIsLoading(false);
    }
  };

  const openModal = (orderId, action, paymentMethod, total) => {
    setModalState({
      isOpen: true,
      orderId,
      action,
      paymentMethod,
      total
    });
  };

  const handleStatusUpdate = async (orderId, status) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      setModalState(prev => ({ ...prev, isOpen: false }));
      setGcashModalState(prev => ({ ...prev, isOpen: false }));
      await fetchReturnRequests();
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update status. Please try again.');
    }
  };

  const handleRefundConfirm = (orderId, action, paymentMethod, total) => {
    if (paymentMethod === 'GCash' && action === 'Refunded') {
      setGcashModalState({
        isOpen: true,
        orderId,
        total
      });
      setModalState(prev => ({ ...prev, isOpen: false }));
    } else {
      handleStatusUpdate(orderId, action);
    }
  };

  const handleGcashConfirm = (phoneNumber) => {
    console.log(`GCash refund to be sent to: ${phoneNumber}`);
    handleStatusUpdate(gcashModalState.orderId, 'Refunded');
  };

  const handleProductClick = async (orderId) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/products`);
      if (!response.ok) {
        throw new Error('Failed to fetch product details');
      }
      const products = await response.json();
      setProductModalState({
        isOpen: true,
        products
      });
    } catch (error) {
      console.error('Error fetching product details:', error);
      setError('Failed to load product details. Please try again later.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-500 flex items-center justify-center gap-2">
        <AlertCircle className="w-5 h-5" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Return Product Requests</h2>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow rounded-lg p-6"
      >
      
      <div className="overflow-x-auto">
        <div className="max-h-[600px] overflow-y-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ordered Products
                </th>
                <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Return Reason
                </th>
                <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request Date
                </th>
                <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentRequests.map((request) => (
                <tr key={request.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{request.full_name}</div>
                    <div className="text-sm text-gray-500">{request.phone_number}</div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductClick(request.id);
                      }}
                      className="text-sm text-gray-900 whitespace-pre-line hover:text-gray-600 cursor-pointer"
                    >
                      {request.ordered_products}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs break-words">
                      {request.feedback}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(request.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      request.status === 'Refunded' ? 'bg-green-100 text-green-800' :
                      request.status === 'Return Cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {request.status === 'Returned' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openModal(
                            request.id, 
                            'Refunded', 
                            request.payment_method, 
                            request.total
                          )}
                          className="text-green-600 hover:text-green-900 flex items-center gap-1"
                          title="Approve Return & Refund"
                        >
                          <CheckCircle className="w-5 h-5" />
                          <span>Refund</span>
                        </button>
                        <button
                          onClick={() => openModal(
                            request.id, 
                            'Return Cancelled', 
                            request.payment_method, 
                            request.total
                          )}
                          className="text-red-600 hover:text-red-900 flex items-center gap-1"
                          title="Cancel Return Request"
                        >
                          <XCircle className="w-5 h-5" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </motion.div>

      <Pagination 
        requestsPerPage={requestsPerPage}
        totalRequests={returnRequests.length}
        paginate={paginate}
        currentPage={currentPage}
      />

      <RefundRequestModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={(orderId, action) => 
          handleRefundConfirm(orderId, action, modalState.paymentMethod, modalState.total)
        }
        orderId={modalState.orderId}
        action={modalState.action}
        paymentMethod={modalState.paymentMethod}
        total={modalState.total}
      />
      
      <GcashModal
        isOpen={gcashModalState.isOpen}
        onClose={() => setGcashModalState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleGcashConfirm}
        total={gcashModalState.total}
      />

      <ProductOrdered
        isOpen={productModalState.isOpen}
        onClose={() => setProductModalState(prev => ({ ...prev, isOpen: false }))}
        products={productModalState.products}
      />
    </>
  );
};

const Pagination = ({ requestsPerPage, totalRequests, paginate, currentPage }) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalRequests / requestsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className="flex justify-center mt-4">
      <ul className="flex space-x-2">
        {pageNumbers.map(number => (
          <li key={number}>
            <button
              onClick={() => paginate(number)}
              className={`px-3 py-1 shadow-lg rounded-md transition-colors duration-200 ${
                currentPage === number
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-orange-100'
              }`}
            >
              {number}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default ReturnRefundManagement;