import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEffect } from 'react';

const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      // Redirect unauthenticated or non-admin users
      navigate('/home');
    }
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <section className="page-content container mx-auto px-4 py-12 bg-white rounded-xl shadow-2xl mb-16 border border-gray-100">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">Access Denied</h2>
        <p className="text-center text-gray-600">You do not have administrative access to view this page.</p>
      </section>
    );
  }

  return (
    <section className="page-content container mx-auto px-4 py-12 bg-white rounded-xl shadow-2xl mb-16 border border-gray-100">
      <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center flex items-center justify-center">
        <span className="material-icons text-3xl mr-3 text-blue-600">admin_panel_settings</span>Admin Dashboard
      </h2>
      <p className="text-center text-gray-600 mb-10">Welcome, {user?.name || 'Admin'}! Manage your platform's content and users here.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Link to="/admin/buses" className="bg-white p-8 rounded-xl shadow-lg border-l-4 border-blue-500 card-hover-effect flex flex-col items-center justify-center text-center">
          <span className="material-icons text-6xl text-blue-500 mb-4">directions_bus</span>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Manage Buses</h3>
          <p className="text-gray-600">Add, edit, or delete bus listings.</p>
        </Link>

        <Link to="/admin/hotels" className="bg-white p-8 rounded-xl shadow-lg border-l-4 border-green-500 card-hover-effect flex flex-col items-center justify-center text-center">
          <span className="material-icons text-6xl text-green-500 mb-4">hotel</span>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Manage Hotels</h3>
          <p className="text-gray-600">Add, edit, or delete hotel listings.</p>
        </Link>

        <Link to="/admin/users" className="bg-white p-8 rounded-xl shadow-lg border-l-4 border-purple-500 card-hover-effect flex flex-col items-center justify-center text-center">
          <span className="material-icons text-6xl text-purple-500 mb-4">group</span>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Manage Users</h3>
          <p className="text-gray-600">View and manage user accounts and roles.</p>
        </Link>
      </div>
    </section>
  );
};

export default AdminDashboard;