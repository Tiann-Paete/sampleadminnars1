import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { HiMenuAlt3 } from 'react-icons/hi';
import NextImage from 'next/image';
import Sidebar from './Sidebar';
import DrawerInventory from '../components/DrawerInventory';
import DrawerStocks from '../components/DrawerStocks';
import DrawerSalesreport from '../components/DrawerSalesreport';
import POSDashboard from '../components/POSDashboard';
import UserAdminModal from '../components/UserAdminModal';
import SessionActivity from '../components/SessionActivity'; // Import the new component
import { withAuth, useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import DataAnalytics from '../components/DataAnalytics';

const HomeAdmin = () => {
  const [unauthorized, setUnauthorized] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserAdminModalOpen, setIsUserAdminModalOpen] = useState(false);
  const sidebarRef = useRef(null);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const openUserAdminModal = () => {
    setSelectedTab('userAdmin');
    setIsUserAdminModalOpen(true);
  };

  const closeUserAdminModal = () => {
    setIsUserAdminModalOpen(false);
  };

  useEffect(() => {
    if (!isUserAdminModalOpen && selectedTab === 'userAdmin') {
      setSelectedTab('dashboard');
    }
  }, [isUserAdminModalOpen, selectedTab]);

  useEffect(() => {
    console.log('HomeAdmin effect running. Authenticated:', isAuthenticated);
    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to home');
      router.push('/');
    }

    const checkAuth = async () => {
      console.log('Additional auth check in HomeAdmin');
      // You can add an additional check here if needed
    };
    checkAuth();

    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };

    
  }, [isSidebarOpen]);

  const handleCloseUnauthorized = () => {
    setUnauthorized(false);
    router.push('/');
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
    
  }, [isAuthenticated, router]);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      {/* Sidebar */}
      <div ref={sidebarRef}>
        <Sidebar
          isOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          onOpenUserAdminModal={openUserAdminModal}
        />
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar with menu button for mobile and Nar's logo */}
        <header className="z-10 flex justify-between items-center px-4 py-2">
          <div className="md:hidden">
            <HiMenuAlt3
              className="h-6 w-6 cursor-pointer text-black"
              onClick={toggleSidebar}
            />
          </div>
          <div className="flex-grow"></div>
          <div className="w-24 h-8 relative">
            <NextImage
              src="/images/Narss.png"
              alt="Nar's School Supplies"
              layout="fill"
              objectFit="contain"
            />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {selectedTab === 'dashboard' && <POSDashboard />}
          {selectedTab === 'productList' && <DrawerInventory />}
          {selectedTab === 'stockManagement' && <DrawerStocks />}
          {selectedTab === 'analytics' && <DataAnalytics />}
          {selectedTab === 'sales' && <DrawerSalesreport />}
          {selectedTab === 'sessionActivity' && <SessionActivity />}
        </div>
      </main>
      </div>
      
      <AnimatePresence>
        {unauthorized && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white p-6 rounded-lg shadow-xl"
            >
              <h2 className="text-xl font-bold mb-4">Unauthorized Access</h2>
              <p className="mb-4">You are not authorized to view this page. Please log in with valid credentials.</p>
              <button
                onClick={handleCloseUnauthorized}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Go to Login
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <UserAdminModal isOpen={isUserAdminModalOpen} onClose={closeUserAdminModal} />
    </div>
  );
};

export default withAuth(HomeAdmin);