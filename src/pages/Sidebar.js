import React, { useState, useEffect } from 'react';
import { HiOutlineChartSquareBar, HiOutlineCube, HiOutlineClipboardList, HiLogout, HiChevronDown, HiChevronRight } from 'react-icons/hi';
import { FaUserCircle, FaShieldAlt } from 'react-icons/fa';
import { IoAnalyticsSharp } from "react-icons/io5";
import { HiUsers } from "react-icons/hi2";
import { TbTruckReturn } from "react-icons/tb";
import { RiHistoryLine } from "react-icons/ri";
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, toggleSidebar, selectedTab, setSelectedTab, onOpenUserAdminModal }) => {
  const { logout } = useAuth();
  const [adminName, setAdminName] = useState('');
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);

  useEffect(() => {
    const fetchAdminName = async () => {
      try {
        const response = await fetch('/api/admin-name');
        const data = await response.json();
        setAdminName(data.fullName);
      } catch (error) {
        console.error('Error fetching admin name:', error);
      }
    };

    fetchAdminName();
  }, []);

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await logout();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleItemClick = (tab) => {
    if (tab === 'userAdmin') {
      onOpenUserAdminModal();
    }
    setSelectedTab(tab);
  };

  const toggleInventoryDropdown = () => {
    setIsInventoryOpen(!isInventoryOpen);
  };

  const menuItems = [
    { id: 'dashboard', icon: HiOutlineChartSquareBar, label: 'Sales Dashboard' },
    {
      id: 'inventory',
      icon: HiOutlineCube,
      label: 'Inventory',
      hasDropdown: true,
      dropdownItems: [
        { id: 'productList', label: 'Product' },
        { id: 'stockManagement', label: 'Stock Management' }
      ]
    },
    { id: 'analytics', icon: IoAnalyticsSharp, label: 'Data Analytics' },
    { id: 'sales', icon: HiOutlineClipboardList, label: 'Orders' },
    { id: 'sessionActivity', icon: TbTruckReturn, label: 'Returns & Cancellations' },
    { id: 'userAdmin', icon: HiUsers, label: 'User Admin' },
  ];

  return (
    <aside className={`fixed md:static top-0 left-0 z-40 w-64 h-screen transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} bg-neutral-800 text-white flex flex-col md:translate-x-0`}>
      {/* User Info */}
      <div className="flex items-center justify-center p-4 md:p-6">
        <div className="flex items-center">
          <FaUserCircle className="w-10 h-10 text-gray-300 mr-3" />
          <div className="flex flex-col items-start">
            <h2 className="text-lg font-semibold truncate">{adminName}</h2>
            <div className="flex items-center mt-1">
              <FaShieldAlt className="text-green-500 w-4 h-4 mr-1" />
              <span className="text-xs text-green-500">verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Separator Line */}
      <div className="h-px bg-neutral-600 mx-4 mb-6"></div>

      {/* Menu Items */}
      <nav className="flex flex-col py-4">
        {menuItems.map((item) => (
          <div key={item.id}>
            {item.hasDropdown ? (
              // Inventory dropdown button without background highlight
              <button
                onClick={toggleInventoryDropdown}
                className="w-full flex items-center justify-between px-4 py-2 text-base 
                  text-gray-300 hover:text-orange-500 group transition-colors duration-200"
              >
                <div className="flex items-center">
                  <item.icon className="w-6 h-6 mr-3 text-gray-300 group-hover:text-orange-500 transition-colors duration-200" />
                  <span>{item.label}</span>
                </div>
                {isInventoryOpen ? <HiChevronDown className="w-5 h-5" /> : <HiChevronRight className="w-5 h-5" />}
              </button>
            ) : (
              // Regular menu items
              <button
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center px-4 py-2 text-base 
                  ${selectedTab === item.id
                    ? 'bg-gray-100 text-black md:rounded-l-lg rounded-r-lg md:rounded-r-none' 
                    : 'text-gray-300 hover:text-orange-500'
                  } group transition-colors duration-200`}
              >
                <div className="flex items-center">
                  <item.icon className={`w-6 h-6 mr-3 
                    ${selectedTab === item.id 
                      ? 'text-black' 
                      : 'text-gray-300 group-hover:text-orange-500'
                    } transition-colors duration-200`} 
                  />
                  <span>{item.label}</span>
                </div>
              </button>
            )}
            
            {/* Dropdown Items */}
            {item.hasDropdown && isInventoryOpen && (
              <div className="ml-6 mt-1 space-y-1">
                {item.dropdownItems.map((dropdownItem) => (
                  <button
                    key={dropdownItem.id}
                    onClick={() => handleItemClick(dropdownItem.id)}
                    className={`w-full flex items-center px-4 py-2 text-base 
                      ${selectedTab === dropdownItem.id 
                        ? 'bg-gray-100 text-black md:rounded-l-lg rounded-r-lg md:rounded-r-none' 
                        : 'text-gray-300 hover:text-orange-500'
                      } transition-colors duration-200`}
                  >
                    {dropdownItem.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Separator Line */}
      <div className="h-px bg-neutral-600 mx-4 my-4"></div>

      {/* Logout Button */}
      <button onClick={handleLogout} className="flex items-center px-4 py-2 text-base hover:bg-red-700">
        <HiLogout className="w-6 h-6 mr-3" />
        Logout
      </button>

      {/* Spacer */}
      <div className="flex-grow"></div>
    </aside>
  );
};

export default Sidebar;