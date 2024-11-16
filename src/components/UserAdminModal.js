import React, { useState, useEffect, useRef } from 'react';
import { FaEye, FaEyeSlash, FaLock, FaUnlock, FaUser, FaUserShield, FaSave, FaEdit, FaTimes } from 'react-icons/fa';
import { motion } from 'framer-motion';

const UserAdminModal = ({ isOpen, onClose }) => {
  const [adminData, setAdminData] = useState({
    full_name: '',
    username: '',
    password: '',
    pin: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newPin, setNewPin] = useState('');
  const modalRef = useRef();

  useEffect(() => {
    if (isOpen) {
      fetchAdminData();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const fetchAdminData = async () => {
    try {
      const response = await fetch('/api/admin-data');
      const data = await response.json();
      setAdminData(data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAdminData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToUpdate = { ...adminData };
      if (newPin) {
        dataToUpdate.pin = newPin;
      }

      const response = await fetch('/api/update-admin', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToUpdate),
      });
      if (response.ok) {
        setIsEditing(false);
        setNewPin('');
        fetchAdminData();
      }
    } catch (error) {
      console.error('Error updating admin data:', error);
    }
  };

  const toggleVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else if (field === 'pin') {
      setShowPin(!showPin);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        ref={modalRef}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className="bg-neutral-800 rounded-lg shadow-xl p-8 max-w-5xl w-full"
      >
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 mb-6 md:mb-0">
            <h2 className="text-3xl text-orange-500 font-bold mb-6 flex items-center">
              <FaUserShield className="mr-2" />
              User Admin Details
            </h2>
            <p className="text-gray-300 mb-4">Manage your admin account details here.</p>
          </div>
          <div className="md:w-2/3 md:pl-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-semibold mb-2" htmlFor="full_name">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="full_name"
                      name="full_name"
                      value={adminData.full_name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="bg-neutral-700 text-gray-100 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full p-2.5"
                    />
                    <FaUser className="absolute right-3 top-3 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-semibold mb-2" htmlFor="username">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={adminData.username}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="bg-neutral-700 text-gray-100 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full p-2.5"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-semibold mb-2" htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword && isEditing ? "text" : "password"}
                      id="password"
                      name="password"
                      value={adminData.password}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="bg-neutral-700 text-gray-100 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full p-2.5 pr-10"
                    />
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => toggleVisibility('password')}
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                      >
                        {showPassword ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-semibold mb-2" htmlFor="pin">
                    PIN
                  </label>
                  <div className="relative">
                    {isEditing ? (
                      <input
                        type={showPin ? "text" : "password"}
                        id="newPin"
                        name="newPin"
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value)}
                        className="bg-neutral-700 text-gray-100 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full p-2.5 pr-10"
                        placeholder="Enter new PIN"
                      />
                    ) : (
                      <input
                        type="password"
                        id="pin"
                        name="pin"
                        value="********"
                        disabled
                        className="bg-neutral-700 text-gray-100 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full p-2.5 pr-10"
                      />
                    )}
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => toggleVisibility('pin')}
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                      >
                        {showPin ? <FaUnlock className="text-gray-400" /> : <FaLock className="text-gray-400" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-4 pt-4">
                {isEditing ? (
                  <>
                    <button
                      type="submit"
                      className="text-white bg-orange-500 hover:bg-orange-600 focus:ring-4 focus:outline-none focus:ring-orange-300 font-medium rounded-lg text-sm px-4 py-2 text-center inline-flex items-center"
                    >
                      <FaSave className="w-5 h-5 mr-2" />
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="text-gray-300 bg-neutral-700 hover:bg-neutral-600 focus:ring-4 focus:outline-none focus:ring-neutral-500 font-medium rounded-lg text-sm px-4 py-2 text-center inline-flex items-center"
                    >
                      <FaTimes className="w-5 h-5 mr-2" />
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="text-white bg-orange-500 hover:bg-orange-600 focus:ring-4 focus:outline-none focus:ring-orange-300 font-medium rounded-lg text-sm px-4 py-2 text-center inline-flex items-center"
                  >
                    <FaEdit className="w-5 h-5 mr-2" />
                    Edit
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-300 bg-neutral-700 hover:bg-neutral-600 focus:ring-4 focus:outline-none focus:ring-neutral-500 font-medium rounded-lg text-sm px-4 py-2 text-center inline-flex items-center"
                >
                  <FaTimes className="w-5 h-5 mr-2" />
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UserAdminModal;