import axios from 'axios';

const axiosInstance = axios.create({
  // CORRECTED: baseURL should include '/api' as per your backend route setup (app.use('/api/*', ...))
  // If VITE_BACKEND_API_URL is 'http://localhost:5000/api', this will use it directly.
  baseURL: import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the token
axiosInstance.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user')); // Get user from local storage
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`; // Add token to Authorization header
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration/invalidity
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401 Unauthorized and not a login/register request, potentially clear token
    if (error.response && error.response.status === 401 &&
        !error.config.url.includes('/auth/login') &&
        !error.config.url.includes('/auth/register')) {
      console.log('Token expired or invalid. Logging out...');
      localStorage.removeItem('user'); // Clear user from local storage
      window.location.href = '/home'; // Redirect to home or login page
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
