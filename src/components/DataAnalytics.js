import React, { useState, useEffect } from 'react';
import { Package, Star, TrendingUp, TrendingDown, AlertTriangle, Frown, Users } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';
import ProductDetails from '../components/ProductDetails';

const COLORS = ['#4dab53', '#e38d1e'];

const NoResultsMessage = ({ message }) => (
  <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-sm">
    <Frown className="w-16 h-16 text-gray-300 mb-4" />
    <p className="text-lg text-gray-500 text-center">{message}</p>
  </div>
);

const ProductAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    topSaleableProducts: [],
    nonSaleableProducts: [],
    currentRatedProducts: [],
    loading: true,
    error: null,
    saleableCount: 0,
    nonSaleableCount: 0
  });

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [analyticsRes, performanceRes] = await Promise.all([
          fetch('/api/product-analytics'),
          fetch('/api/product-performance')
        ]);
    
        if (!analyticsRes.ok || !performanceRes.ok) {
          throw new Error('Failed to fetch analytics data');
        }
    
        const analyticsData = await analyticsRes.json();
        const performanceData = await performanceRes.json();
    
        // Top performing products (more than 8 units sold)
        const saleableProducts = performanceData.performance
          .filter(product => product.total_units_sold > 8)
          .sort((a, b) => b.total_units_sold - a.total_units_sold);
    
        // Low performing products (strictly 1-3 units sold in last 2 weeks with stock)
        const nonSaleableProducts = performanceData.performance
          .filter(product => {
            const hasStock = product.current_stock > 0;
            const recentSales = parseInt(product.recent_sales);
            return hasStock && recentSales >= 1 && recentSales <= 3;
          })
          .sort((a, b) => b.recent_sales - a.recent_sales);
    
        // Get rated products from the last 7 days (unchanged)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const currentRatedProducts = performanceData.performance.filter(product => {
          if (!product.latest_rating_date) return false;
          const ratingDate = new Date(product.latest_rating_date);
          return ratingDate >= sevenDaysAgo;
        });
    
        setAnalyticsData({
          topSaleableProducts: saleableProducts.slice(0, 10),
          nonSaleableProducts: nonSaleableProducts.slice(0, 10),
          currentRatedProducts,
          loading: false,
          error: null,
          saleableCount: saleableProducts.length,
          nonSaleableCount: nonSaleableProducts.length
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setAnalyticsData(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to fetch analytics data'
        }));
      }
    };

    fetchAnalytics();
  }, []);

  const ProductCard = ({ title, icon: Icon, products, type }) => {
    const getBorderColor = () => {
      switch (type) {
        case 'saleable': return 'border-l-green-500';
        case 'non-saleable': return 'border-l-orange-400';
        case 'rated': return 'border-l-yellow-500';
        default: return 'border-l-gray-300';
      }
    };

    const getIconColor = (type, hasStock, iconType) => {
      if (!hasStock && iconType !== 'package') return 'text-gray-400';
      
      if (iconType === 'headerIcon') {
        switch (type) {
          case 'saleable': return 'text-green-500';
          case 'non-saleable': return 'text-orange-400';
          default: return 'text-gray-400';
        }
      }
      
      if (iconType === 'package') {
        switch (type) {
          case 'saleable': return 'text-green-500';
          case 'non-saleable': return 'text-red-500';
          default: return 'text-gray-400';
        }
      }
      
      switch (type) {
        case 'rated': return 'text-yellow-500';
        default: return 'text-gray-400';
      }
    };

    const getStockStatus = (stock) => {
      if (stock === 0) {
        return {
          icon: TrendingDown,
          color: 'text-gray-400',
          message: 'Out of stock'
        };
      } else if (stock <= 2) {
        return {
          icon: TrendingDown,
          color: 'text-red-500',
          message: 'Critical stock'
        };
      } else if (stock <= 6) {
        return {
          icon: TrendingUp,
          color: 'text-orange-400',
          message: 'Low stock'
        };
      } else {
        return {
          icon: TrendingUp,
          color: 'text-green-500',
          message: 'In stock'
        };
      }
    };

    const getRatingStatus = (rating) => {
      if (!rating || rating === 0) {
        return {
          color: 'text-gray-400',
          message: 'Not yet rated'
        };
      } else if (rating >= 4) {
        return {
          color: 'text-yellow-500',
          message: 'Highly rated'
        };
      } else {
        return {
          color: 'text-yellow-100',
          message: 'Low rating'
        };
      }
    };

    const formatPrice = (price) => {
      return `₱${Number(price).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
    };

    const getRatingText = (count) => {
      return count === 1 ? "1 customer rated" : `${count} customers rated`;
    };
  
    return (
      <div className={`bg-white rounded-lg shadow-sm border-l-4 ${getBorderColor()} overflow-hidden h-full`}>
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {type === 'saleable' ? (
                <TrendingUp className={getIconColor(type, true, 'headerIcon')} />
              ) : type === 'non-saleable' ? (
                <AlertTriangle className={getIconColor(type, true, 'headerIcon')} />
              ) : (
                <Icon className={getIconColor(type, true)} />
              )}
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
            <span className="text-sm text-gray-500">{products.length} items</span>
          </div>
        </div>
        <div className="divide-y divide-gray-100 overflow-y-auto max-h-96">
        {products.length > 0 ? (
          products.map((product) => {
            const stockStatus = getStockStatus(product.current_stock);
            const StockIcon = stockStatus.icon;
            const ratingStatus = getRatingStatus(product.average_rating);
            const hasHighReturns = product.returned_count > 10;

            return (
              <div 
                key={product.id} 
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedProduct(product);
                  setIsModalOpen(true);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium text-gray-900">{product.name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      {type === 'rated' ? (
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-2 text-gray-400" />
                          {getRatingText(product.rating_count || 0)}
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Package className={`w-4 h-4 mr-2 ${getIconColor(type, true, 'package')}`} />
                          {type === 'non-saleable' ? 
                            `${product.recent_sales} sold in 2 weeks` : 
                            `${product.total_units_sold} sold`}
                        </span>
                      )}
                      <span className="flex items-center group relative">
                        <StockIcon className={`w-4 h-4 mr-1 ${stockStatus.color}`} />
                        <span>{product.current_stock || 0} in stock</span>
                      </span>
                      <span className="flex items-center group relative">
                        <Star className={`w-4 h-4 mr-1 ${ratingStatus.color}`} />
                        <span>{product.average_rating ? Number(product.average_rating).toFixed(1) : '0.0'}</span>
                      </span>
                      {type === 'non-saleable' && hasHighReturns && (
                        <span className="flex items-center text-red-500">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          High Returns
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatPrice(product.price)}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <NoResultsMessage 
            message={`No ${type === 'saleable' ? 'top performing' : 
              type === 'non-saleable' ? 'low performing' : 
              'rated'} products yet`} 
          />
        )}
      </div>
    </div>
  );
  };

  if (analyticsData.loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (analyticsData.error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
          <h3 className="text-lg font-medium text-red-800">Error</h3>
        </div>
        <p className="mt-2 text-sm text-red-700">{analyticsData.error}</p>
      </div>
    );
  }

  // Show no results message if there's no data at all
  if (!analyticsData.topSaleableProducts.length && 
      !analyticsData.nonSaleableProducts.length && 
      !analyticsData.currentRatedProducts.length) {
    return (
      <div className="container mx-auto p-4">
        <NoResultsMessage message="No analytics data available yet" />
      </div>
    );
  }

  const pieData = [
    { name: 'Saleable Products', value: analyticsData.saleableCount },
    { name: 'Non-Saleable Products', value: analyticsData.nonSaleableCount }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl text-neutral-900 font-bold">
            Product Saleable Analytics
            <p className="text-sm font-normal text-gray-500 mt-1">
              Overview of product performance and saleability metrics
            </p>
          </h2>
        </div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Distribution Chart */}
          <div className="mb-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-l-orange-300">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Distribution</h3>
              <div className="h-64">
                {pieData.some(item => item.value > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        startAngle={90}
                        endAngle={450}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [
                          `${value} products`, 
                          name === 'Non-Saleable Products' ? 
                            <span className="text-gray-600">{name}</span> : 
                            name
                        ]} 
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <NoResultsMessage message="No product distribution data available" />
                )}
              </div>
            </div>
          </div>

          {/* Top and Low Performing Products */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProductCard
              title="Top Performing Products"
              icon={TrendingUp}
              products={analyticsData.topSaleableProducts}
              type="saleable"
            />
            <ProductCard
              title="Low Performing Products"
              icon={AlertTriangle}
              products={analyticsData.nonSaleableProducts}
              type="non-saleable"
            />
          </div>

          {/* Current Rated Products Section */}
          <div className="mt-6">
            <ProductCard
              title="Current Rated Products"
              icon={Star}
              products={analyticsData.currentRatedProducts}
              type="rated"
            />
          </div>
        </motion.div>
        <ProductDetails
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
        />
      </div>
    </motion.div>
  );
};

export default ProductAnalytics;