import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { HiEye, HiEyeOff } from 'react-icons/hi'; 
import { FaLock, FaUser } from 'react-icons/fa'; 
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get('username');
    const password = formData.get('password');
  
    try {
      await login(username, password);
      try {
        await router.push('/Pin');
      } catch (routerError) {
        console.error('Navigation error:', routerError);
        setError('An error occurred during navigation. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.error || 'Invalid username or password');
      setTimeout(() => setError(''), 5000);
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center">
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5 }}
              className="mt-4 flex items-center p-4 mb-4 text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400"
              role="alert"
            >
              <svg className="flex-shrink-0 w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
              </svg>
              <span className="sr-only">Info</span>
              <div className="ml-3 text-sm font-medium mr-10">
                {error}
              </div>
              <button
                type="button"
                onClick={() => setError('')}
                className="ml-auto -mx-1.5 -my-1.5 bg-red-50 text-red-500 rounded-lg focus:ring-2 focus:ring-red-400 p-1.5 hover:bg-red-200 inline-flex items-center justify-center h-8 w-8 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-gray-700"
              >
                <span className="sr-only">Close</span>
                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                </svg>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <section className="bg-cover bg-center min-h-screen flex flex-col items-center justify-center px-6 py-8" style={{ backgroundImage: "url('/images/narsadmin.jpg')" }}>
        <div className="w-full max-w-md bg-neutral-800 rounded-lg shadow-md p-6 dark:bg-neutral-800 dark:border dark:border-gray-300">
        <div className="flex items-center justify-center mr-6 mb-2">
    <img src="/images/purenars.png" alt="Nar's Logo" className="w-auto h-20" />
</div>

          <h1 className="text-xl font-bold leading-tight tracking-tight text-white dark:text-white mb-10 mx-auto text-center">
    Admin Login
</h1>

          <form onSubmit={handleSubmit} className="space-y-8" action="#">
            <div>
              <label htmlFor="username" className="block mb-2 text-sm font-medium text-white dark:text-white"></label>
              <div className="flex">
                <span className="inline-flex items-center px-3 text-sm text-white bg-gray-200 border rounded-s-md">
                  <FaUser className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </span>
                <input type="text" id="username" name="username" className="rounded-r-lg bg-white border border-gray-300 text-gray-900 flex-1 min-w-0 p-2.5 dark:bg-white dark:text-black outline-orange-300" placeholder="Username" required />
              </div>
            </div>
            <div className="relative mt-4">
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-white dark:text-white"></label>
              <div className="flex">
                <span className="inline-flex items-center px-3 text-sm text-white bg-gray-200 border rounded-s-md">
                  <FaLock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </span>
                <input type={showPassword ? 'text' : 'password'} id="password" name="password" className="rounded-r-lg bg-gray-50 border border-gray-300 text-gray-900 flex-1 min-w-0 p-2.5 dark:bg-white dark:text-black outline-orange-300" placeholder="Password" required />
                <button type="button" className="mr-2 absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent border-none" onClick={togglePasswordVisibility}>
                  {showPassword ? <HiEyeOff className="text-gray-400" /> : <HiEye className="text-gray-400" />}
                </button>
              </div>
            </div>
            <button type="submit" className="w-full text-white bg-orange-500 hover:bg-amber-600 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Login</button>
          </form>
        </div>
      </section>
    </>
  );
};

export default Home;