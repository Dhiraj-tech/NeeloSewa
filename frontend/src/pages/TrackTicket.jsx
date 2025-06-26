import React, { useState } from 'react';
import axios from '../api/axiosInstance';

const TrackTicket = () => {
  const [ticketNumber, setTicketNumber] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTrackTicket = async () => {
    if (!ticketNumber.trim()) {
      setError('Please enter a ticket number.');
      setTrackingData(null);
      return;
    }

    setLoading(true);
    setError(null);
    setTrackingData(null); // Clear previous data

    try {
      const response = await axios.get(`/user/tracking/${ticketNumber.trim().toUpperCase()}`);
      setTrackingData(response.data);
    } catch (err) {
      console.error('Error tracking ticket:', err);
      setError(err.response?.data?.message || 'No tracking information found for this ticket number.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="track-ticket-page-content" className="page-content container mx-auto px-4 py-12 bg-white rounded-xl shadow-2xl mb-16 border border-gray-100">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center flex items-center justify-center">
        <span className="material-icons text-3xl mr-3 text-blue-600">track_changes</span>Track Your Ticket
      </h2>
      <div className="p-8 text-gray-700 text-center text-lg">
        <p className="mb-6">Enter your ticket number to get real-time updates on your bus or hotel booking.</p>
        <div className="flex justify-center max-w-md mx-auto mb-6">
          <input
            type="text"
            id="ticket-number-input"
            placeholder="Enter Ticket Number (e.g., BUS-20250616-123456)"
            className="flex-grow p-4 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all search-input"
            value={ticketNumber}
            onChange={(e) => setTicketNumber(e.target.value)}
            onKeyPress={(e) => { if (e.key === 'Enter') handleTrackTicket(); }}
          />
          <button
            id="track-button"
            className="bg-blue-600 text-white p-4 rounded-r-lg font-semibold hover:bg-blue-700 transition-colors shadow-md btn-primary flex items-center"
            onClick={handleTrackTicket}
            disabled={loading}
          >
            <span className="material-icons">track_changes</span>
          </button>
        </div>
        <p className="text-gray-500 text-sm mb-8">Please ensure you enter the correct ticket number for accurate tracking.</p>

        {/* Tracking Results Display Area */}
        <div id="tracking-results" className="bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-200 relative overflow-hidden" style={{ minHeight: '150px' }}>
          {loading && (
            <div id="tracking-loading-spinner" className="absolute inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75 z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mx-auto"></div>
            </div>
          )}

          {!loading && error && (
            <p id="tracking-error" className="text-red-600 text-center mt-6 font-semibold">{error}</p>
          )}

          {!loading && !error && trackingData && (
            <>
              <h3 id="tracking-title" className="text-2xl font-bold mb-4 text-gray-800">Tracking Details for Ticket: {trackingData.ticketNumber}</h3>
              <div id="tracking-details" className="space-y-3 text-left">
                {trackingData.type === 'Bus' ? (
                  <>
                    <p className="text-gray-800"><strong className="text-blue-700">Type:</strong> Bus</p>
                    <p className="text-gray-800"><strong className="text-blue-700">Status:</strong> <span className={`font-semibold ${trackingData.status.includes('Delayed') ? 'text-red-600' : 'text-green-600'}`}>{trackingData.status}</span></p>
                    <p className="text-gray-800 flex items-center"><span className="material-icons text-base mr-1">location_on</span><strong className="text-blue-700">Current Location:</strong> {trackingData.currentLocation}</p>
                    <p className="text-gray-800 flex items-center"><span className="material-icons text-base mr-1">navigation</span><strong className="text-blue-700">Next Stop:</strong> {trackingData.nextStop}</p>
                    <p className="text-gray-800 flex items-center"><span className="material-icons text-base mr-1">timer</span><strong className="text-blue-700">ETA to Destination:</strong> {trackingData.eta}</p>
                    <p className="text-gray-800 flex items-center"><span className="material-icons text-base mr-1">directions_bus</span><strong className="text-blue-700">Vehicle Number:</strong> {trackingData.vehicleNumber}</p>
                    <p className="text-gray-800 flex items-center"><span className="material-icons text-base mr-1">phone</span><strong className="text-blue-700">Driver Contact:</strong> {trackingData.driverContact}</p>
                    <p className="text-gray-800"><strong className="text-blue-700">Passenger Name:</strong> {trackingData.passengerName}</p>
                    <p className="text-gray-800"><strong className="text-blue-700">Seat Number:</strong> {trackingData.seatNumber}</p>
                  </>
                ) : ( // Hotel tracking
                  <>
                    <p className="text-gray-800"><strong className="text-purple-700">Type:</strong> Hotel Booking</p>
                    <p className="text-gray-800"><strong className="text-purple-700">Status:</strong> <span className={`font-semibold ${trackingData.status === 'Confirmed' ? 'text-green-600' : 'text-yellow-600'}`}>{trackingData.status}</span></p>
                    <p className="text-gray-800 flex items-center"><span className="material-icons text-base mr-1">hotel</span><strong className="text-purple-700">Hotel Name:</strong> {trackingData.hotelName}</p>
                    <p className="text-gray-800 flex items-center"><span className="material-icons text-base mr-1">place</span><strong className="text-purple-700">Location:</strong> {trackingData.location}</p>
                    <p className="text-gray-800 flex items-center"><span className="material-icons text-base mr-1">date_range</span><strong className="text-purple-700">Check-in Date:</strong> {trackingData.checkInDate}</p>
                    <p className="text-gray-800 flex items-center"><span className="material-icons text-base mr-1">date_range</span><strong className="text-purple-700">Check-out Date:</strong> {trackingData.checkOutDate}</p>
                    <p className="text-gray-800"><strong className="text-purple-700">Room Type:</strong> {trackingData.roomType}</p>
                    <p className="text-gray-800"><strong className="text-purple-700">Confirmation No.:</strong> {trackingData.confirmationNumber}</p>
                    <p className="text-gray-800"><strong className="text-purple-700">Guests:</strong> {trackingData.guests}</p>
                    <p className="text-gray-800"><strong className="text-purple-700">Lead Guest:</strong> {trackingData.leadGuestName}</p>
                  </>
                )}
                <p className="text-gray-500 text-sm mt-4">Last Updated: {new Date(trackingData.lastUpdated).toLocaleString()}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default TrackTicket;