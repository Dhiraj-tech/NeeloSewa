import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import CustomModal from './components/CustomModal';
import LoginModal from './components/LoginModal';
import Home from './pages/Home';
import AIKhalasi from './pages/AIKhalasi';
import Trips from './pages/Trips';
import Wallet from './pages/Wallet';
import Profile from './pages/Profile';
import Offers from './pages/Offers';
import TrackTicket from './pages/TrackTicket';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBuses from './pages/admin/AdminBuses';
import AdminHotels from './pages/admin/AdminHotels';
import AdminUsers from './pages/admin/AdminUsers'; // <-- NEW IMPORT
import { AuthProvider, useAuth } from './context/AuthContext';

function AppContent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalProps, setModalProps] = useState({});
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Function to show custom modal
  const showCustomModal = (title, message, isPrompt = false, defaultValue = '') => {
    return new Promise((resolve) => {
      setModalProps({ title, message, isPrompt, defaultValue, resolve });
      setModalOpen(true);
    });
  };

  // Function to show login/signup modal
  const showLoginModal = () => {
    setLoginModalOpen(true);
  };

  const handleLoginSuccess = (userData) => {
    login(userData); // Update AuthContext
    setLoginModalOpen(false); // Close login modal
    showCustomModal('Login Success', 'You have been successfully logged in!');
    navigate('/home'); // Redirect to home or dashboard after login
  };

  const handleLogout = () => {
    logout(); // Clear AuthContext
    showCustomModal('Logged Out', 'You have been successfully logged out.');
    navigate('/home'); // Redirect to home after logout
  };

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <Header
        showLoginModal={showLoginModal}
        isAuthenticated={isAuthenticated}
        user={user}
        onLogout={handleLogout}
      />
      <div className="bg-yellow-100 text-yellow-800 text-center py-3 text-base border-b border-yellow-300">
        Need Help? Ask AI Khalasi for best bus and hotel recommendations.
      </div>
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home showCustomModal={showCustomModal} isAuthenticated={isAuthenticated} />} />
          <Route path="/home" element={<Home showCustomModal={showCustomModal} isAuthenticated={isAuthenticated} />} />
          <Route path="/aikhalasi" element={<AIKhalasi showCustomModal={showCustomModal} isAuthenticated={isAuthenticated} />} />
          <Route path="/trips" element={<Trips showCustomModal={showCustomModal} isAuthenticated={isAuthenticated} />} />
          <Route path="/wallet" element={<Wallet showCustomModal={showCustomModal} isAuthenticated={isAuthenticated} />} />
          <Route path="/profile" element={<Profile showCustomModal={showCustomModal} isAuthenticated={isAuthenticated} />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/track-ticket" element={<TrackTicket />} />

          {/* Admin Routes - Protected */}
          {user?.role === 'admin' && (
            <>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/buses" element={<AdminBuses showCustomModal={showCustomModal} />} />
              <Route path="/admin/hotels" element={<AdminHotels showCustomModal={showCustomModal} />} />
              <Route path="/admin/users" element={<AdminUsers showCustomModal={showCustomModal} />} /> {/* <-- NEW ROUTE */}
            </>
          )}

          {/* Fallback for unknown routes */}
          <Route path="*" element={<Home showCustomModal={showCustomModal} isAuthenticated={isAuthenticated} />} />
        </Routes>
      </main>
      <Footer />
      <CustomModal {...modalProps} isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} onLoginSuccess={handleLoginSuccess} showCustomModal={showCustomModal} />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
