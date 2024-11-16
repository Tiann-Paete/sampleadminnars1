import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [usernamePasswordVerified, setUsernamePasswordVerified] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    console.log('Checking auth status...');
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.log('No token found in localStorage');
      setIsAuthenticated(false);
      setUsernamePasswordVerified(false);
      setLoading(false);
      return;
    }
  
    try {
      console.log('Sending request to check-auth endpoint...');
      const response = await axios.get('/api/check-auth', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('check-auth response:', response.data);
      setIsAuthenticated(response.data.isAuthenticated);
      setUsernamePasswordVerified(response.data.usernamePasswordVerified);
      
      if (response.data.expiresIn) {
        console.log(`Token expires in ${response.data.expiresIn} seconds`);
        setTimeout(checkAuthStatus, (response.data.expiresIn - 60) * 1000);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      setUsernamePasswordVerified(false);
      localStorage.removeItem('authToken');
    } finally {
      setLoading(false);
    }
  };
  
  const login = async (username, password) => {
    try {
      console.log('Attempting login with:', { username }); // Don't log passwords
      const response = await axios.post('/api/signin', { username, password });
      console.log('Login response:', response.data);
      
      if (response.data.success) {
        setUsernamePasswordVerified(true);
        
        const token = response.data.token;
        console.log('Received token:', token);
        localStorage.setItem('authToken', token);
        
        router.push('/Pin');
      } else {
        throw new Error(response.data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error.response ? error.response.data : error.message);
      setUsernamePasswordVerified(false);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const validatePin = async (pin) => {
    const token = localStorage.getItem('authToken');
    try {
      await axios.post('/api/validate-pin', { pin }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setIsAuthenticated(true);
    } catch (error) {
      console.error('PIN validation error:', error);
      setIsAuthenticated(false);
      throw new Error('Invalid PIN');
    }
  };

  const logout = async () => {
    console.log('Logout process started');
    try {
      const token = localStorage.getItem('authToken');
      console.log('Calling logout API...');
      await axios.get('/api/logout', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always perform these actions, even if there's an error
      console.log('Clearing local state...');
      setIsAuthenticated(false);
      setUsernamePasswordVerified(false);
      
      console.log('Removing token from localStorage...');
      localStorage.removeItem('authToken');
      
      console.log('Preparing to navigate to Admin Login page...');
      setTimeout(() => {
        router.push('/', undefined, { shallow: true })
          .then(() => console.log('Navigation completed'))
          .catch(error => console.error('Navigation error:', error));
      }, 100);
    }
  };
  


  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, logout, validatePin, usernamePasswordVerified }}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);

export const withAuth = (WrappedComponent) => {
  return (props) => {
    const { isAuthenticated, loading, usernamePasswordVerified } = useAuth();
    const router = useRouter();

    useEffect(() => {
      console.log('withAuth effect running. Loading:', loading, 'Authenticated:', isAuthenticated, 'Username/Password Verified:', usernamePasswordVerified);
      if (!loading) {
        const navigateWithDelay = (path) => {
          setTimeout(() => {
            router.push(path, undefined, { shallow: true })
              .catch(error => console.error('Navigation error:', error));
          }, 100);
        };

        if (!isAuthenticated && !usernamePasswordVerified) {
          console.log('Not authenticated, redirecting to home');
          navigateWithDelay('/');
        } else if (!isAuthenticated && usernamePasswordVerified && router.pathname !== '/Pin') {
          console.log('Username/Password verified but not fully authenticated, redirecting to PIN page');
          navigateWithDelay('/Pin');
        }
      }
    }, [loading, isAuthenticated, usernamePasswordVerified, router]);

    if (loading) {
      console.log('Still loading, showing loading component');
      return <div>Loading...</div>;
    }

    console.log('Rendering wrapped component. Authenticated:', isAuthenticated, 'Username/Password Verified:', usernamePasswordVerified);
    return isAuthenticated || (usernamePasswordVerified && router.pathname === '/Pin') ? <WrappedComponent {...props} /> : null;
  };
};