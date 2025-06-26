import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminUsers = ({ showCustomModal }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      showCustomModal('Access Denied', 'You need admin privileges to view this page.').then(() => {
        navigate('/home');
      });
      return;
    }
    fetchUsers();
  }, [isAuthenticated, user, navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/admin/users');
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, currentRole) => {
    const newRole = currentRole === 'user' ? 'admin' : 'user';
    const confirmChange = await showCustomModal('Confirm Role Change', `Are you sure you want to change this user's role to "${newRole}"?`);

    if (confirmChange) {
      setLoading(true);
      setError(null);
      try {
        await axios.put(`/admin/users/${userId}/role`, { role: newRole });
        showCustomModal('Role Updated', `User role changed to ${newRole} successfully!`);
        fetchUsers(); // Re-fetch users to reflect the change
      } catch (err) {
        console.error('Error changing user role:', err);
        showCustomModal('Error', err.response?.data?.message || 'Failed to update user role.');
        setError(err.response?.data?.message || 'Failed to update user role.');
      } finally {
        setLoading(false);
      }
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return null; // Render nothing if not authorized, as navigate handles the redirect
  }

  return (
    <section className="page-content container mx-auto px-4 py-12 bg-white rounded-xl shadow-2xl mb-16 border border-gray-100">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center flex items-center justify-center">
        <span className="material-icons text-3xl mr-3 text-purple-600">group</span>Manage Users
      </h2>

      {loading && (
        <div className="text-center mt-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mx-auto"></div>
          <p className="text-blue-500 text-lg mt-3">Loading users...</p>
        </div>
      )}

      {error && (
        <div className="text-center p-4 bg-red-100 text-red-700 rounded-lg">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && users.length === 0 && (
        <p className="text-center text-gray-600 text-lg mt-8">No users found.</p>
      )}

      {!loading && !error && users.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Name</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Email</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Phone</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Role</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Wallet</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map(u => (
                <tr key={u._id} className="hover:bg-gray-50">
                  <td className="py-4 px-6 whitespace-nowrap">{u.name}</td>
                  <td className="py-4 px-6 whitespace-nowrap">{u.email}</td>
                  <td className="py-4 px-6 whitespace-nowrap">{u.phone || 'N/A'}</td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">Rs. {u.walletBalance?.toFixed(2) || '0.00'}</td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    {u._id !== user._id ? ( // Prevent admin from changing their own role via this UI
                      <button
                        className={`px-3 py-1 rounded-md text-sm font-semibold transition-colors ${u.role === 'user' ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-400 text-white hover:bg-gray-500'}`}
                        onClick={() => handleRoleChange(u._id, u.role)}
                        disabled={loading}
                      >
                        {u.role === 'user' ? 'Make Admin' : 'Make User'}
                      </button>
                    ) : (
                      <span className="text-gray-500 text-sm">Current User</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default AdminUsers;
