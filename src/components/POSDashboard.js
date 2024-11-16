import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HiCurrencyDollar, HiShoppingCart, HiUsers, HiCalendar, HiChevronRight, HiChevronLeft, HiShoppingBag } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const POSDashboard = () => {
  const [salesData, setSalesData] = useState({
    periodSales: 0,
    totalQuantity: 0, // [NEW] Added total quantity
    totalOrders: 0,
    totalCustomers: 0,
  });

  const [totalProducts, setTotalProducts] = useState(0);
  const [timeframe, setTimeframe] = useState('monthly');
  const [chartData, setChartData] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [showSalesReport, setShowSalesReport] = useState(true);
  const [totalSalesAmount, setTotalSalesAmount] = useState(0);


  useEffect(() => {
    fetchData();
    fetchOrderDetails();
  }, [date]);

  useEffect(() => {
    fetchTimeframeData();
    fetchProductDetails(); // Now fetch product details when timeframe changes
  }, [timeframe]); // Use the same timeframe state for both sections

  // Update fetchProductDetails to use the same timeframe as Sales Report
  const fetchProductDetails = async () => {
    try {
      const response = await axios.get(`/api/product-details?timeframe=${timeframe}`);
      setOrderDetails(response.data.products);
      setTotalSalesAmount(response.data.totalSales);
    } catch (error) {
      console.error('Error fetching product details:', error);
    }
  };

  // Add new function to fetch order details
  const fetchOrderDetails = async () => {
    try {
      const response = await axios.get(`/api/order-details?date=${date}`);
      setOrderDetails(response.data);
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchSalesData(),
        fetchTotalProducts()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTimeframeData = async () => {
    try {
      let endpoint = '';
      switch(timeframe) {
        case 'daily':
          endpoint = '/api/daily-sales';
          break;
        case 'weekly':
          endpoint = '/api/weekly-sales';
          break;
        case 'monthly':
          endpoint = '/api/monthly-sales';
          break;
        case 'yearly':
          endpoint = '/api/yearly-sales';
          break;
        default:
          endpoint = '/api/monthly-sales';
      }
      
      const response = await axios.get(endpoint);
      
      if (timeframe === 'monthly') {
        // Create an array with all months initialized with zero values
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const initialData = monthNames.map(month => ({
          month,
          total: 0,
          orders: 0,
          cancelledTotal: 0,
          cancelledOrders: 0
        }));
        
        // Update the months that have data
        response.data.forEach(item => {
          const monthIndex = item.month - 1;
          if (monthIndex >= 0 && monthIndex < 12) {
            initialData[monthIndex] = {
              month: monthNames[monthIndex],
              total: Number(item.total) || 0,
              orders: Number(item.orderCount) || 0,
              cancelledTotal: Number(item.cancelledTotal) || 0,
              cancelledOrders: Number(item.cancelledCount) || 0
            };
          }
        });
        
        setChartData(initialData);
      } else {
        setChartData(response.data);
      }
    } catch (error) {
      console.error('Error fetching timeframe data:', error);
      setError('Error fetching sales data');
    }
  };

  const fetchSalesData = async () => {
    const response = await axios.get(`/api/sales-data?date=${date}`);
    setSalesData(response.data);
  };

  const fetchTotalProducts = async () => {
    const response = await axios.get('/api/total-products');
    setTotalProducts(response.data.totalProducts);
  };

  const formatCurrency = (value) => {
    return typeof value === 'number' ? `₱${value.toFixed(2)}` : '₱0.00';
  };

  // [ADD] Add this function near your other formatting functions in POSDashboard
const formatQuantity = (value) => {
  return typeof value === 'number' ? value.toLocaleString() : '0';
};

  const formatDate = (dateString) => {
    const inputDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
    inputDate.setHours(0, 0, 0, 0);

    if (inputDate.getTime() === today.getTime()) {
      return 'Today';
    } else if (inputDate.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    } else {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  const formatXAxisTick = (value) => {
    switch(timeframe) {
      case 'daily':
        return value; // Now value will be the day name (Monday, Tuesday, etc.)
      case 'weekly':
        return value.split('(')[0].trim(); // Show just "Week X" in the axis
      case 'yearly':
        return value; // Show the full year
      case 'monthly':
        return value; // Month name (already formatted)
      default:
        return value;
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      let periodLabel = '';
      switch(timeframe) {
        case 'daily':
          periodLabel = label;
          break;
        case 'weekly':
          periodLabel = label;
          break;
        case 'monthly':
          periodLabel = `${label} ${new Date().getFullYear()}`;
          break;
        case 'yearly':
          periodLabel = label;
          break;
      }
  
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-lg">
          <p className="text-sm font-semibold text-gray-800">{periodLabel}</p>
          <div>
            <p className="text-sm text-gray-700">
              {`${payload[0].name}: ${formatCurrency(Number(payload[0].value))}`}
            </p>
            <p className="text-xs text-gray-500">
              {`Total Orders: ${payload[0].payload.orders}`}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="space-y-6 p-6 bg-neutral-100">
      <div className="flex justify-between items-center mb-6">
        <div className="relative">
          <div className="flex items-center bg-white rounded-lg border border-neutral-300 px-3 py-2 focus-within:border-neutral-500">
            <HiCalendar className="w-5 h-5 text-neutral-500 mr-2" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border-none focus:outline-none text-sm text-neutral-700"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      ) : (
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  
  <StatCard
    key="sales"
    icon={<HiCurrencyDollar className="w-8 h-8 text-green-600" />}
    title="Sales"
    date={formatDate(date)}
    value={formatCurrency(salesData.periodSales)}
    bgColor="bg-green-100"
  />
  
  
  <StatCard
    key="products-sold"
    icon={<HiShoppingBag className="w-8 h-8 text-green-600" />} 
    title="Products Sold"
    date={formatDate(date)}
    value={salesData.totalQuantity?.toLocaleString() || '0'}
    bgColor="bg-green-100" 
  />
  
 
  <StatCard
    key="orders"
    icon={<HiShoppingCart className="w-8 h-8 text-orange-600" />}
    title="Orders"
    date={formatDate(date)}
    value={salesData.totalOrders || 0}
    bgColor="bg-orange-100"
  />
  
  
  <StatCard
    key="customers"
    icon={<HiUsers className="w-8 h-8 text-neutral-700" />}
    title="Customers"
    date={formatDate(date)}
    value={salesData.totalCustomers || 0}
    bgColor="bg-neutral-100"
  />
</div>

          <div className="relative overflow-hidden">
            <motion.div 
              className="flex"
              animate={{ x: showSalesReport ? 0 : '-100%' }}
              transition={{ type: 'tween', duration: 0.5 }}
            >
              {/* Sales Report Section */}
              <div className="min-w-full">
                <div className="bg-white p-6 rounded-lg shadow-lg relative">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">
                      Sales Report {new Date().getFullYear()}
                    </h3>
                    <div className="flex items-center gap-4">
                      <select
                        value={timeframe}
                        onChange={(e) => setTimeframe(e.target.value)}
                        className="text-gray-600 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:border-gray-100 bg-gray-100"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                      <button
                        onClick={() => setShowSalesReport(false)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <HiChevronRight className="w-6 h-6 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  <div className="w-full h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey={timeframe === 'monthly' ? 'month' : 'period'}
                  tick={{ fill: '#666' }}
                  axisLine={{ stroke: '#ccc' }}
                  tickFormatter={formatXAxisTick}
                />
                <YAxis
                  tickFormatter={(value) => `₱${value >= 1000 ? (value/1000) + 'k' : value}`}
                  tick={{ fill: '#666' }}
                  axisLine={{ stroke: '#ccc' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="total" 
                  fill="#4cbd48" 
                  name="Total Revenue"
                  radius={[4, 4, 0, 0]}
                  activeBar={
                    <Rectangle 
                      fill="#278a24" 
                      stroke="#1c6119"
                      strokeWidth={2}
                    />
                  }
                />
              </BarChart>
            </ResponsiveContainer>
                  </div>
                </div>
              </div>

            
  <div className="min-w-full">
    <div className="bg-white p-6 rounded-lg shadow-md relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSalesReport(true)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <HiChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h3 className="text-xl font-semibold text-gray-800">
              Products Sold{' '}
              <span className="text-lg text-green-600 ml-2">
                ({formatCurrency(totalSalesAmount)})
              </span>
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} Report
            </p>
          </div>
        </div>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="text-gray-600 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:border-gray-100 bg-gray-100"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>
      <div className="overflow-y-auto max-h-[400px]">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receiver</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orderDetails.map((order, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(order.order_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{order.full_name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-900">{order.product_name}</span>
                    <span className="text-sm font-medium text-orange-500">{order.quantity}x</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(Number(order.price) * Number(order.quantity))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <img 
                    src={order.image_url} 
                    alt={order.product_name}
                    className="h-12 w-12 object-cover rounded-md"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
};

const StatCard = ({ icon, title, value, date, bgColor }) => (
  <motion.div
    className={`bg-white p-6 rounded-lg shadow-lg flex items-center justify-between space-x-4 ${bgColor}`}
    whileHover={{ scale: 1.03 }}
  >
    <div className="flex items-center space-x-4">
      <div className={`p-3 rounded-full ${bgColor} flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
    <div className="text-sm text-gray-400">{date}</div>
  </motion.div>
);

export default POSDashboard;