import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import AlertModal from './AlertModal'; // Adjust the import path as needed
import OrderedProductsModal from './OrderedProductsModal';
import { FaTimes, FaCalendarAlt } from 'react-icons/fa';
import { format, parseISO } from 'date-fns';

const DrawerSalesreport = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newOrderDate, setNewOrderDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const [showAlert, setShowAlert] = useState(false);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [selectedOrderProducts, setSelectedOrderProducts] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const TIMEZONE = 'Asia/Manila';
  const DATE_FORMAT = 'MMM d, yyyy h:mm a';


  const handleOrderClick = (event, order) => {
    const clickedElement = event.target.closest('td');
    if (clickedElement) {
      const cellIndex = clickedElement.cellIndex;
      // Check if the clicked cell is ID (1), Full Name (2), or Tracking Number (14)
      if ([1, 2, 14].includes(cellIndex)) {
        setSelectedOrderProducts(order.ordered_products);
        setSelectedOrder(order); // Add this line to set the selected order
        setShowProductsModal(true);
      }
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 90000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (openDropdownId && !event.target.closest('.dropdown-container')) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdownId]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/orders');
      // Sort orders by date, most recent first
      const sortedOrders = response.data.sort((a, b) => new Date(b.order_date) - new Date(a.order_date));
      setOrders(sortedOrders);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await axios.put(`/api/orders/${id}/status`, { status: newStatus });
      console.log('Status update response:', response.data);
      if (newStatus === 'Cancelled') {
        // Schedule deletion after 8 hours
        setTimeout(() => deleteOrder(id), 8 * 60 * 60 * 1000);
      } else if (newStatus === 'Delivered') {
        // Schedule deletion from sales report after 5 hours
        setTimeout(() => removeFromSalesReport(id), 5 * 60 * 60 * 1000);
      }
      fetchOrders();
      setOpenDropdownId(null);
    } catch (error) {
      console.error("Error updating status:", error);
      console.error("Error response:", error.response); 
    }
  };

  const deleteOrder = async (id) => {
    try {
      await axios.delete(`/api/orders/${id}`);
      fetchOrders();
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  const removeFromSalesReport = async (id) => {
    try {
      await axios.delete(`/api/orders/${id}/salesreport`);
      fetchOrders();
    } catch (error) {
      console.error("Error removing order from sales report:", error);
    }
  };

  const toggleDropdown = (id) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const handleEditClick = () => {
    const checkedOrder = orders.find(order => order.isChecked);
    if (checkedOrder && ['Processing', 'Shipped', 'Delivered', 'Returned', 'Refunded', 'Return Cancelled'].includes(checkedOrder.status)) {
      setSelectedOrder(checkedOrder);
      setNewOrderDate(checkedOrder.order_date);
      setShowEditModal(true);
    } else {
      setShowAlert(true);
    }
  };

  const handleCheckboxChange = (id) => {
    setOrders(orders.map(order => ({
      ...order,
      isChecked: order.id === id ? !order.isChecked : false
    })));
  };

  const handleSaveEdit = async () => {
    if (!newOrderDate) {
      const errorMessage = document.createElement('div');
      errorMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg';
      errorMessage.textContent = 'Please select a date and time';
      document.body.appendChild(errorMessage);
      setTimeout(() => errorMessage.remove(), 3000);
      return;
    }
  
    try {
      // Convert local datetime to Manila time (UTC+8)
      const localDate = new Date(newOrderDate);
      // Create a formatter for Manila timezone
      const manilaFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Manila',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      
      // Format the date in Manila timezone
      const manilaDate = manilaFormatter.format(localDate);
      const [month, day, year, time] = manilaDate.match(/(\d{2})\/(\d{2})\/(\d{4}), (\d{2}:\d{2}:\d{2})/).slice(1);
      const formattedDate = `${year}-${month}-${day} ${time}`;
      
      const response = await axios.put(`/api/orders/${selectedOrder.id}`, {
        order_date: formattedDate
      });
  
      if (response.status === 200) {
        setShowEditModal(false);
        setNewOrderDate('');
        fetchOrders();
        
        const successMessage = document.createElement('div');
        successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg';
        successMessage.textContent = 'Order date updated successfully';
        document.body.appendChild(successMessage);
        setTimeout(() => successMessage.remove(), 3000);
      }
    } catch (error) {
      console.error("Error updating order date:", error);
      const errorMessage = document.createElement('div');
      errorMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg';
      errorMessage.textContent = error.response?.data?.error || 'Failed to update order date';
      document.body.appendChild(errorMessage);
      setTimeout(() => errorMessage.remove(), 3000);
    }
  };

  const formatDateWithTimezone = (dateString) => {
    try {
      const date = parseISO(dateString);
      const zonedDate = utcToZonedTime(date, TIMEZONE);
      return format(zonedDate, DATE_FORMAT);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };
  
  // Update your existing formatDate function
  const formatDate = (dateString) => {
    try {
      // First parse the ISO string
      const date = new Date(dateString);
      
      // Format the date in 12-hour format with AM/PM
      const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: 'numeric', 
        hour12: true 
      };
      
      // Using the browser's built-in date formatting with Manila timezone
      return date.toLocaleString('en-US', {
        ...options,
        timeZone: 'Asia/Manila'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const filteredOrders = orders.filter(order => 
    order.id.toString().includes(searchTerm) ||
    order.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.phone_number.includes(searchTerm)
  );

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Processing': return 'text-orange-500';
      case 'Shipped': return 'text-orange-600';
      case 'Delivered': return 'text-green-600';
      case 'Received': return 'text-green-700';
      case 'Cancelled': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col p-4"
    >
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-4 flex justify-between items-center"
      >
        {/* Add Order Monitoring title */}
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-gray-800 mr-6">Order Monitoring</h1>
          <div className="relative max-w-xs">
            {/* Your existing search input */}
          </div>
        </div>
        <button 
    onClick={handleEditClick} 
    className="flex items-center justify-center px-4 py-2 bg-orange-500 text-white rounded-lg shadow-md hover:bg-orange-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
  >
    <FaCalendarAlt className="mr-2 h-5 w-5" />
    <span className="font-medium">Update Order Date</span>
  </button>
        </motion.div>
      
        <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="overflow-x-auto bg-white shadow-lg rounded-lg"
        style={{ height: '70vh' }}
      >
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-200">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Select
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <AnimatePresence>
                {currentOrders.map((order) => (
                  <motion.tr 
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="hover:bg-orange-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
  <input
    type="checkbox"
    checked={order.isChecked || false}
    onChange={() => handleCheckboxChange(order.id)}
    disabled={!['Processing', 'Shipped', 'Delivered', 'Returned', 'Refunded', 'Return Cancelled'].includes(order.status)}
    className="focus:ring-orange-500 h-4 w-4 text-orange-600 border-gray-300 rounded"
  />
</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" onClick={(e) => handleOrderClick(e, order)}>
                      {order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" onClick={(e) => handleOrderClick(e, order)}>
                      {order.full_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.phone_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.total}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.order_date)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getStatusColor(order.status)}`}>
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-opacity-10 capitalize">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="relative dropdown-container">
                        <button 
                          onClick={() => toggleDropdown(order.id)}
                          className="text-gray-500 hover:text-orange-500 focus:outline-none transition-colors duration-200"
                        >
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                          </svg>
                        </button>
                        {openDropdownId === order.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md overflow-hidden shadow-xl z-10">
                            {['Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
                              <button
                                key={status}
                                onClick={() => handleStatusChange(order.id, status)}
                                className={`block px-4 py-2 text-sm ${getStatusColor(status)} hover:bg-orange-50 w-full text-left transition-colors duration-200`}
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        )}
      </motion.div>

      <Pagination
        ordersPerPage={ordersPerPage}
        totalOrders={filteredOrders.length}
        paginate={paginate}
        currentPage={currentPage}
      />

    <AnimatePresence>
    {showEditModal && (
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
      <h2 className="text-2xl sm:text-3xl text-orange-500 font-bold mb-6 flex items-center">
      <FaCalendarAlt className="mr-2" />
      Update Order Date
    </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-gray-300 text-sm font-semibold mb-2" htmlFor="orderId">
            Order ID
          </label>
          <input
            id="orderId"
            type="text"
            value={selectedOrder.id}
            readOnly
            className="bg-neutral-700 text-gray-100 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full p-2.5"
          />
        </div>
        <div>
          <label className="block text-gray-300 text-sm font-semibold mb-2" htmlFor="currentStatus">
            Current Status
          </label>
          <input
            id="currentStatus"
            type="text"
            value={selectedOrder.status}
            readOnly
            className="bg-neutral-700 text-gray-100 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full p-2.5"
          />
        </div>
        <div>
          <label className="block text-gray-300 text-sm font-semibold mb-2" htmlFor="newOrderDate">
          New Order Date
            </label>
            <input
    id="newOrderDate"
    type="datetime-local"
    value={newOrderDate}
    onChange={(e) => {
      const selectedDate = new Date(e.target.value);
      // Adjust for timezone if needed
      const offset = selectedDate.getTimezoneOffset() * 60000;
      const adjustedDate = new Date(selectedDate.getTime() - offset);
      setNewOrderDate(adjustedDate.toISOString().slice(0, 16));
    }}
    className="bg-neutral-700 text-gray-100 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full p-2.5"
  />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-6">
          <button
            onClick={() => {
              setShowEditModal(false);
              setNewOrderDate(''); // Reset date when closing modal
            }}
            className="w-full sm:w-auto text-gray-300 bg-neutral-700 hover:bg-neutral-600 focus:ring-4 focus:outline-none focus:ring-neutral-500 font-medium rounded-lg text-sm px-4 py-2 text-center inline-flex items-center justify-center"
          >
            <FaTimes className="w-5 h-5 mr-2" />
            Cancel
          </button>
          <button
            onClick={handleSaveEdit}
            className="w-full sm:w-auto text-white bg-orange-500 hover:bg-orange-600 focus:ring-4 focus:outline-none focus:ring-orange-300 font-medium rounded-lg text-sm px-4 py-2 text-center inline-flex items-center justify-center"
          >
            <FaCalendarAlt className="w-5 h-5 mr-2" />
            Update Order Date
          </button>
    </div>
  </motion.div>
</motion.div>
        )}
        {showAlert && (
          <AlertModal
            key="alertModal"
            message="Please select an order first"
            isVisible={showAlert}
            onClose={() => setShowAlert(false)}
          />
        )}
        {showProductsModal && (
          <OrderedProductsModal 
  isVisible={showProductsModal}
  onClose={() => {
    setShowProductsModal(false);
    setSelectedOrder(null); 
    setSelectedOrderProducts('');
  }}
  products={selectedOrderProducts}
  selectedOrder={selectedOrder} 
/>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Pagination = ({ ordersPerPage, totalOrders, paginate, currentPage }) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalOrders / ordersPerPage); i++) {
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

export default DrawerSalesreport;