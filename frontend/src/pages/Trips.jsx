import React, { useState, useEffect } from 'react';
import axios from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Trips = ({ showCustomModal }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [userTrips, setUserTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // New state for filter: 'All', 'Confirmed', 'Cancelled'
  const [statusFilter, setStatusFilter] = useState('All');

  // Helper to construct full image URL from backend relative path
  const getFullImageUrl = (relativePath) => {
    if (!relativePath) return ''; // Handle empty paths
    // Prepend backend base URL, removing '/api' part
    return `${import.meta.env.VITE_BACKEND_API_URL.replace('/api', '')}${relativePath}`;
  };

  useEffect(() => {
    if (!isAuthenticated) {
      showCustomModal('Login Required', 'Please login to view your trips.').then(() => {
        navigate('/home'); // Redirect to home after alert
      });
      return;
    }
    fetchUserTrips();
  }, [isAuthenticated, user, navigate, statusFilter]); // Added statusFilter to dependency array

  const fetchUserTrips = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Attempting to fetch user bookings with filter:', statusFilter);
      // Pass the status filter as a query parameter
      const response = await axios.get(`/user/bookings`, {
        params: { status: statusFilter === 'All' ? undefined : statusFilter }
      });
      console.log('API Response for user bookings:', response.data);
      
      if (Array.isArray(response.data)) {
        setUserTrips(response.data);
      } else {
        console.error('API Response data is not an array:', response.data);
        setError('Received unexpected data format from server.');
        setUserTrips([]);
      }
    } catch (err) {
      console.error('Error fetching user trips:', err.response?.data || err.message || err);
      setError(err.response?.data?.message || 'Failed to fetch trips.');
      setUserTrips([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTrip = async (tripId, ticketNumber, price, type) => {
    const confirmCancel = await showCustomModal('Confirm Cancellation', `Are you sure you want to cancel your ${type} trip (Ticket: ${ticketNumber}) for Rs. ${price}? This action cannot be undone.`);

    if (confirmCancel) {
      setLoading(true);
      try {
        const response = await axios.put(`/user/bookings/${tripId}/cancel`);
        showCustomModal('Cancelled!', response.data.message);
        // Optionally update wallet balance in context after successful cancellation
        if (user) {
          user.walletBalance = parseFloat(response.data.newBalance);
          localStorage.setItem('user', JSON.stringify(user));
        }
        fetchUserTrips(); // Re-fetch trips after cancellation
      } catch (err) {
        console.error('Error canceling trip:', err.response?.data || err.message || err);
        showCustomModal('Error', err.response?.data?.message || 'Failed to cancel trip. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <section id="trips-page-content" className="page-content container mx-auto px-4 py-12 bg-white rounded-xl shadow-2xl mb-16 border border-gray-100">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center flex items-center justify-center">
          <span className="material-icons text-3xl mr-3 text-purple-600">card_travel</span>Your Trips
        </h2>
        <div className="p-8 text-gray-700 text-center text-lg">
          <p className="mb-6">Please log in to view your upcoming and past trips.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="trips-page-content" className="page-content container mx-auto px-4 py-12 bg-white rounded-xl shadow-2xl mb-16 border border-gray-100">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center flex items-center justify-center">
        <span className="material-icons text-3xl mr-3 text-purple-600">card_travel</span>Your Trips
      </h2>

      {/* Filter Dropdown */}
      <div className="flex justify-center mb-8">
        <div className="relative inline-block text-gray-700">
          <select
            className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 pr-8 rounded-lg shadow-sm leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Trips</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center mt-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mx-auto"></div>
          <p className="text-blue-500 text-lg mt-3">Loading trips...</p>
        </div>
      )}

      {error && (
        <div className="text-center p-4 bg-red-100 text-red-700 rounded-lg">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {userTrips.length === 0 ? (
            <div id="no-trips-message" className="p-8 text-gray-700 text-center text-lg">
              <p className="mb-6">No trips found for the selected filter. Try adjusting your filter or book a new trip from the Home page!</p>
            </div>
          ) : (
            <div id="trip-list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {userTrips.map(trip => {
                console.log('Rendering trip:', trip);
                return (
                  <div key={trip.id} className={`bg-white p-6 rounded-xl shadow-lg border-l-4 ${trip.status === 'Cancelled' ? 'border-gray-400 opacity-70' : 'border-purple-500'} card-hover-effect`}>
                    <h3 className="text-xl font-bold mb-2 text-purple-800 flex items-center">
                      <span className="material-icons mr-2 text-purple-500">{trip.type === 'Bus' ? 'directions_bus' : 'hotel'}</span>{trip.type}: {trip.type === 'Bus' ? trip.route : trip.name}
                    </h3>
                    {/* Display image for bus or hotel */}
                    {(trip.type === 'Bus' && trip.mainImageUrl) && (
                      <img
                        src={getFullImageUrl(trip.mainImageUrl)}
                        alt="Bus"
                        className="w-full h-32 object-cover rounded-md mb-3"
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x200/4a90e2/FFFFFF?text=Bus'; }}
                      />
                    )}
                    {(trip.type === 'Hotel' && trip.hotelImage) && (
                      <img
                        src={getFullImageUrl(trip.hotelImage)}
                        alt="Hotel"
                        className="w-full h-32 object-cover rounded-md mb-3"
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x200/CCCCCC/666666?text=Hotel'; }}
                      />
                    )}
                    <p className="text-gray-700 mb-2">Ticket: <strong>{trip.ticketNumber}</strong></p>
                    <p className="text-gray-700 mb-2 flex items-center"><span className="material-icons text-base mr-1">event</span>Date: <strong>{trip.date || (trip.checkIn ? `${trip.checkIn} to ${trip.checkOut}` : 'N/A')}</strong></p>
                    {trip.type === 'Bus' && (
                      <p className="text-gray-700 mb-2">Operator: {trip.operator} | Passenger: {trip.passengerName} (Seat: {trip.seat})</p>
                    )}
                    {trip.type === 'Hotel' && (
                      <p className="text-gray-700 mb-2">Location: {trip.location} | Lead Guest: {trip.leadGuestName} | Guests: {trip.guests}</p>
                    )}
                    <p className="text-gray-700 mb-2">Status: <span className={`font-semibold ${trip.status === 'Confirmed' ? 'text-green-600' : 'text-red-600'}`}>{trip.status}</span></p> {/* Changed text-yellow-600 to text-red-600 for 'Cancelled' status */}
                    <p className="text-gray-700 mb-4">Total Price: Rs. {trip.price.toFixed(2)}</p>
                    {trip.status === 'Confirmed' && (
                      <button
                        data-id={trip.id}
                        data-ticket={trip.ticketNumber}
                        className="cancel-trip-btn bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors btn-primary text-sm flex items-center"
                        onClick={() => handleCancelTrip(trip.id, trip.ticketNumber, trip.price, trip.type)}
                        disabled={loading}
                      >
                        <span className="material-icons mr-1">cancel</span>Cancel Trip
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default Trips;
