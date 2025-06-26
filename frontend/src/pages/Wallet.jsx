import React, { useState, useEffect } from 'react';
import axios from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Wallet = ({ showCustomModal }) => {
  const { isAuthenticated, user, login } = useAuth(); // Also get login to update user in context
  const navigate = useNavigate();
  const [walletBalance, setWalletBalance] = useState(user?.walletBalance || 0.00);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [showTransactions, setShowTransactions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      showCustomModal('Login Required', 'Please login to view your wallet.').then(() => {
        navigate('/home'); // Redirect to home after alert
      });
      return;
    }
    // Set initial balance from user context
    setWalletBalance(user?.walletBalance || 0.00);
    fetchTransactions();
  }, [isAuthenticated, user]); // Re-fetch when auth state or user object changes

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/user/wallet/transactions');
      setTransactionHistory(response.data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err.response?.data?.message || 'Failed to fetch transaction history.');
      setTransactionHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMoney = async () => {
    const amountStr = await showCustomModal('Add Money to Wallet', 'Enter amount to add:', true, '500');
    const amount = parseFloat(amountStr);

    if (amountStr !== false && !isNaN(amount) && amount > 0) {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.post('/user/wallet/add', { amount });
        setWalletBalance(parseFloat(response.data.newBalance));
        // Update user context with new balance
        login({ ...user, walletBalance: parseFloat(response.data.newBalance) });
        showCustomModal('Success!', response.data.message);
        fetchTransactions(); // Refresh transactions
      } catch (err) {
        console.error('Error adding money:', err);
        showCustomModal('Error', err.response?.data?.message || 'Failed to add money. Please try again.');
        setError(err.response?.data?.message || 'Failed to add money.');
      } finally {
        setLoading(false);
      }
    } else if (amountStr !== false) { // If user clicked OK but entered invalid data
      showCustomModal('Invalid Input', 'Please enter a valid positive number for the amount.');
    }
  };

  if (!isAuthenticated) {
    return (
      <section id="wallet-page-content" className="page-content container mx-auto px-4 py-12 bg-white rounded-xl shadow-2xl mb-16 border border-gray-100">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center flex items-center justify-center">
          <span className="material-icons text-3xl mr-3 text-green-600">account_balance_wallet</span>Your Neelo Wallet
        </h2>
        <div className="p-8 text-gray-700 text-center text-lg">
          <p className="mb-6">Please log in to access your wallet features.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="wallet-page-content" className="page-content container mx-auto px-4 py-12 bg-white rounded-xl shadow-2xl mb-16 border border-gray-100">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center flex items-center justify-center">
        <span className="material-icons text-3xl mr-3 text-green-600">account_balance_wallet</span>Your Neelo Wallet
      </h2>
      <div className="p-8 text-gray-700 text-center text-lg">
        <p className="text-4xl font-bold mb-4 text-blue-700">Current Balance: Rs. <span id="wallet-balance">{walletBalance.toFixed(2)}</span></p>
        <p className="mb-6">Top up your wallet for faster, easier bookings and exclusive offers!</p>
        <div className="flex justify-center space-x-4">
          <button
            id="add-money-button"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md btn-primary flex items-center"
            onClick={handleAddMoney}
            disabled={loading}
          >
            <span className="material-icons mr-2">add_card</span>Add Money
          </button>
          <button
            id="view-transactions-button"
            className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-md btn-primary flex items-center"
            onClick={() => setShowTransactions(!showTransactions)}
            disabled={loading}
          >
            <span className="material-icons mr-2">receipt_long</span>{showTransactions ? 'Hide Transactions' : 'View Transactions'}
          </button>
        </div>

        {loading && (
            <div className="text-center mt-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mx-auto"></div>
                <p className="text-blue-500 text-lg mt-3">Loading...</p>
            </div>
        )}

        {error && (
            <div className="text-center p-4 bg-red-100 text-red-700 rounded-lg mt-8">
                <p>{error}</p>
            </div>
        )}

        {showTransactions && !loading && !error && (
          <div id="transaction-history" className="mt-8 text-left max-w-lg mx-auto border border-gray-200 rounded-lg p-4">
            <h3 className="text-xl font-bold mb-4 text-gray-800 text-center">Transaction History</h3>
            <ul id="transactions-list" className="space-y-2">
              {transactionHistory.length === 0 ? (
                <p id="no-transactions-message" className="text-center text-gray-600 mt-4">No transactions recorded yet.</p>
              ) : (
                transactionHistory.map(tx => (
                  <li key={tx._id} className={`flex justify-between items-center p-2 rounded-md ${tx.type === 'credit' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    <span>{tx.description}</span>
                    <span className="font-bold">{tx.type === 'credit' ? '+' : '-'} Rs. {tx.amount.toFixed(2)}</span>
                    <span className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleDateString()}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
};

export default Wallet;