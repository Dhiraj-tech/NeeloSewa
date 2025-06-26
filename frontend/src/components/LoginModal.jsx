import React, { useState } from 'react';
import axios from '../api/axiosInstance'; // Use the configured axios instance

const LoginModal = ({ isOpen, onClose, onLoginSuccess, showCustomModal }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      if (isRegistering) {
        response = await axios.post('/auth/register', { name, email, password, phone });
      } else {
        response = await axios.post('/auth/login', { email, password });
      }
      onLoginSuccess(response.data); // Pass user data to parent
      showCustomModal('Success', response.data.message || `${isRegistering ? 'Registration' : 'Login'} Successful!`);
      // No need to manually close modal here, onLoginSuccess in App.jsx will handle it.
    } catch (error) {
      console.error('Authentication error:', error.response?.data || error.message);
      showCustomModal('Error', error.response?.data?.message || 'An error occurred during authentication. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login-modal" className={`fixed inset-0 bg-gray-600 bg-opacity-70 flex items-center justify-center z-50 ${isOpen ? '' : 'hidden'} backdrop-blur-sm`}>
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm transform transition-all duration-300 scale-100 opacity-100" id="login-modal-content">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">{isRegistering ? 'Sign Up' : 'Login'}</h2>
        <form onSubmit={handleAuth}>
          {isRegistering && (
            <input
              type="text"
              placeholder="Name"
              className="p-3 border border-gray-300 rounded-lg w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 search-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            className="p-3 border border-gray-300 rounded-lg w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 search-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="p-3 border border-gray-300 rounded-lg w-full mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500 search-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {isRegistering && (
            <input
              type="tel"
              placeholder="Phone (Optional)"
              className="p-3 border border-gray-300 rounded-lg w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 search-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md btn-primary mb-3"
            disabled={loading}
          >
            {loading ? 'Processing...' : (isRegistering ? 'Sign Up' : 'Login')}
          </button>
        </form>
        <button
          onClick={() => setIsRegistering(!isRegistering)}
          className="w-full bg-gray-200 text-gray-700 p-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors shadow-md btn-secondary mb-3"
        >
          {isRegistering ? 'Already have an account? Login' : 'New User? Register Here'}
        </button>
        <button onClick={onClose} className="w-full mt-4 text-gray-600 hover:text-gray-800 hover:underline">Close</button>
      </div>
    </div>
  );
};

export default LoginModal;