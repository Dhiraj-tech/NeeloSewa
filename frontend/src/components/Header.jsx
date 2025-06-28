// Header.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = ({ showLoginModal, isAuthenticated, user, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    setIsMobileDropdownOpen(false);
  };

  // Helper to construct full image URL for user avatar
  const getFullImageUrl = (relativePath) => {
    if (!relativePath) return 'https://placehold.co/120x120/4a90e2/FFFFFF?text=User'; // Default placeholder
    // If it's already a full URL (e.g., placehold.co or external storage), use it directly
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
        return relativePath;
    }
    // Otherwise, prepend backend base URL, removing the '/api' part
    const baseUrl = import.meta.env.VITE_BACKEND_API_URL.replace('/api', '');
    return `${baseUrl}${relativePath}`;
  };

  return (
    <header className="solid-blue-bg-header text-white shadow-lg">
      {/* Top Row - Main Header */}
      <div className="container mx-auto px-4 py-3 flex items-center justify-between flex-wrap">
        <div className="flex items-center space-x-3">
          {/* Logo */}
          <svg viewBox="0 0 24 24" fill="none" className="w-11 h-11 text-white">
            <path fillRule="evenodd" clipRule="evenodd" d="M2.5 7.75C2.5 7.33579 2.83579 7 3.25 7H20.75C21.1642 7 21.5 7.33579 21.5 7.75V17C21.5 17.4142 21.1642 17.75 20.75 17.75H19.5V18.75C19.5 19.1642 19.1642 19.5 18.75 19.5H17.25C16.8358 19.5 16.5 19.1642 16.5 18.75V17.75H7.5V18.75C7.5 19.1642 7.16421 19.5 6.75 19.5H5.25C4.83579 19.5 4.5 19.1642 4.5 18.75V17.75H3.25C2.83579 17.75 2.5 17.4142 2.5 17V7.75ZM4.5 9V15.75H5.5V9H4.5ZM7.5 9V15.75H16.5V9H7.5ZM18.5 9V15.75H19.5V9H18.5Z" fill="currentColor"/>
            <rect x="7.5" y="9" width="9" height="6.75" rx="0.5" fill="#50b0f0"/>
            <circle cx="6" cy="17.75" r="1" fill="#1F2937"/>
            <circle cx="18" cy="17.75" r="1" fill="#1F2937"/>
          </svg>
          <Link to="/home" className="text-3xl font-extrabold text-shadow">NeeloSewa</Link>
        </div>

        {/* Mobile Hamburger */}
        <button className="md:hidden p-2 rounded-md hover:bg-blue-600" onClick={toggleMobileMenu}>
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Desktop Navigation Links and User/Login section */}
        {/* Conditional rendering for admin vs. regular user/logged out layout */}
        {user?.role === 'admin' ? (
          // Admin Layout: Admin link centered, user dropdown right
          <nav className="hidden md:flex items-center space-x-4 flex-grow justify-end">
            <div className="flex-grow flex justify-center">
              {/* Styled Admin Link: Increased font size and unique color */}
              <NavLink
                to="/admin"
                className="font-extrabold text-xl text-yellow-300 hover:text-white flex items-center" // Added flex items-center
              >
                <span className="material-icons text-2xl mr-2">admin_panel_settings</span> {/* Admin Icon */}
                Admin
              </NavLink>
            </div>
            {isAuthenticated ? (
              <div className="relative flex-shrink-0">
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center space-x-2 focus:outline-none">
                  <img
                    src={getFullImageUrl(user?.avatarUrl) || 'https://placehold.co/32x32/4a90e2/FFFFFF?text=U'}
                    alt="User"
                    className="w-8 h-8 rounded-full border border-gray-200"
                  />
                  <span>{user?.name || user?.email}</span>
                  <svg className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-md shadow-lg py-1 z-20">
                    <div className="px-4 py-2 text-sm font-semibold border-b border-gray-100 flex items-center">
                      <img src={getFullImageUrl(user?.avatarUrl) || 'https://placehold.co/32x32/4a90e2/FFFFFF?text=U'} alt="User" className="w-8 h-8 rounded-full mr-2" />
                      {user?.name || 'User'}
                    </div>
                    <Link to="/profile" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 hover:bg-gray-100 flex items-center">
                      <span className="material-icons text-xl mr-2">person</span>Profile
                    </Link>
                    <button onClick={() => { onLogout(); setIsDropdownOpen(false); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center">
                      <span className="material-icons text-xl mr-2">logout</span>Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={showLoginModal} className="navbar-button flex items-center"> {/* Added flex items-center */}
                <span className="material-icons text-xl mr-2">login</span> {/* Login Icon */}
                Login / Sign Up
              </button>
            )}
          </nav>
        ) : (
          // Regular User/Logged Out Layout: Offers, Track Ticket, User/Login right
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/offers" className="navbar-button flex items-center"> {/* Added flex items-center */}
              <span className="material-icons text-xl mr-2">local_offer</span> {/* Offers Icon */}
              Offers
            </Link>
            <Link to="/track-ticket" className="navbar-button flex items-center"> {/* Added flex items-center */}
              <span className="material-icons text-xl mr-2">receipt_long</span> {/* Track Ticket Icon */}
              Track Ticket
            </Link>
            {isAuthenticated ? (
              <div className="relative">
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center space-x-2 focus:outline-none">
                  <img
                    src={getFullImageUrl(user?.avatarUrl) || 'https://placehold.co/32x32/4a90e2/FFFFFF?text=U'}
                    alt="User"
                    className="w-8 h-8 rounded-full border border-gray-200"
                  />
                  <span>{user?.name || user?.email}</span>
                  <svg className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-md shadow-lg py-1 z-20">
                    <div className="px-4 py-2 text-sm font-semibold border-b border-gray-100 flex items-center">
                      <img src={getFullImageUrl(user?.avatarUrl) || 'https://placehold.co/32x32/4a90e2/FFFFFF?text=U'} alt="User" className="w-8 h-8 rounded-full mr-2" />
                      {user?.name || 'User'}
                    </div>
                    <Link to="/profile" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 hover:bg-gray-100 flex items-center">
                      <span className="material-icons text-xl mr-2">person</span>Profile
                    </Link>
                    <button onClick={() => { onLogout(); setIsDropdownOpen(false); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center">
                      <span className="material-icons text-xl mr-2">logout</span>Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={showLoginModal} className="navbar-button flex items-center"> {/* Added flex items-center */}
                <span className="material-icons text-xl mr-2">login</span> {/* Login Icon */}
                Login / Sign Up
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bottom Navbar (Desktop) - Only show if NOT admin */}
      {user?.role !== 'admin' && (
        <div className="hidden md:block bg-blue-700 py-3 shadow-md">
          <div className="container mx-auto px-4 flex justify-center items-center space-x-8 text-lg font-medium">
            <NavLink to="/home"><span className="material-icons text-xl mr-2">home</span>Home</NavLink>
            <NavLink to="/aikhalasi"><span className="material-icons text-xl mr-2">smart_toy</span>AI Khalasi</NavLink>
            <NavLink to="/trips"><span className="material-icons text-xl mr-2">explore</span>Trips</NavLink>
            <NavLink to="/wallet"><span className="material-icons text-xl mr-2">account_balance_wallet</span>Wallet</NavLink>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      <div className={`md:hidden w-full bg-blue-600 py-3 text-lg font-medium ${mobileMenuOpen ? '' : 'hidden'}`}>
        {user?.role !== 'admin' ? (
          // Mobile links for regular user/logged out
          <>
            <MobileNavLink to="/home" onClick={toggleMobileMenu}><span className="material-icons text-xl mr-2">home</span>Home</MobileNavLink>
            <MobileNavLink to="/aikhalasi" onClick={toggleMobileMenu}><span className="material-icons text-xl mr-2">smart_toy</span>AI Khalasi</MobileNavLink>
            <MobileNavLink to="/trips" onClick={toggleMobileMenu}><span className="material-icons text-xl mr-2">explore</span>Trips</MobileNavLink>
            <MobileNavLink to="/wallet" onClick={toggleMobileMenu}><span className="material-icons text-xl mr-2">account_balance_wallet</span>Wallet</MobileNavLink>
            <MobileNavLink to="/offers" onClick={toggleMobileMenu}><span className="material-icons text-xl mr-2">local_offer</span>Offers</MobileNavLink>
            <MobileNavLink to="/track-ticket" onClick={toggleMobileMenu}><span className="material-icons text-xl mr-2">receipt_long</span>Track Ticket</MobileNavLink>
          </>
        ) : (
          // Mobile link for admin
          <MobileNavLink to="/admin" onClick={toggleMobileMenu}><span className="material-icons text-xl mr-2">admin_panel_settings</span>Admin</MobileNavLink>
        )}
        {isAuthenticated ? (
          <div className="border-t border-blue-500 mt-3 pt-3 px-5">
            <button onClick={() => setIsMobileDropdownOpen(!isMobileDropdownOpen)} className="flex items-center space-x-3 w-full text-white">
              <img src={getFullImageUrl(user?.avatarUrl) || 'https://placehold.co/32x32/4a90e2/FFFFFF?text=U'} alt="User" className="w-8 h-8 rounded-full" />
              <span>{user?.name || user?.email}</span>
              <svg className={`w-4 h-4 transition-transform ${isMobileDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isMobileDropdownOpen && (
              <div className="mt-2 bg-blue-500 rounded-md shadow-lg py-1">
                <Link to="/profile" onClick={toggleMobileMenu} className="block px-4 py-2 text-white hover:bg-blue-700 flex items-center">
                  <span className="material-icons text-xl mr-2">person</span>Profile
                </Link>
                <button onClick={() => { onLogout(); toggleMobileMenu(); }} className="block w-full text-left px-4 py-2 text-white hover:bg-blue-700 flex items-center">
                  <span className="material-icons text-xl mr-2">logout</span>Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button onClick={() => { showLoginModal(); toggleMobileMenu(); }} className="w-full text-left px-5 py-2 text-white hover:bg-blue-700 font-semibold flex items-center"> {/* Added flex items-center */}
            <span className="material-icons text-xl mr-2">login</span> {/* Login Icon */}
            Login / Sign Up
          </button>
        )}
      </div>
    </header>
  );
};

// Desktop NavLink with underline hover
const NavLink = ({ to, children, onClick, className }) => { // Added className prop
  const navigate = useNavigate();
  const handleClick = (e) => {
    e.preventDefault();
    navigate(to);
    if (onClick) onClick();
  };
  return (
    // Ensure NavLink itself can handle flex if children are icon + text
    <Link to={to} onClick={handleClick} className={`pb-1 border-b-2 border-transparent hover:border-white transition-all duration-200 text-white flex items-center ${className || ''}`}>
      {children}
    </Link>
  );
};

// Mobile NavLink with underline hover
const MobileNavLink = ({ to, children, onClick }) => (
  <Link to={to} onClick={onClick} className="block px-5 py-2 border-b-2 border-transparent hover:border-white text-white hover:bg-blue-700 transition-all duration-200 flex items-center">
    {children}
  </Link>
);

export default Header;