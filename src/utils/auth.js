// In a new file, e.g., utils/auth.js
export const authHeader = () => {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };
  
  // Then in your API calls:
  import { authHeader } from '../utils/auth';
  
  axios.get('/api/some-protected-route', { headers: authHeader() });