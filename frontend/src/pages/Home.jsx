import React, { useState, useEffect } from 'react';
import axios from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import './Home.css'; // Make sure this CSS file is imported

// Import the background image directly
import heroBgImage from '../assets/img.png'; // Make sure this path is correct: src/assets/img.png

// Import the SVG file as a URL
import BusIconUrl from '../assets/bus-icon-svgrepo-com.svg'; // Make sure this path is correct: src/assets/bus-icon-svgrepo-com.svg

// Define a global variable outside the component to track if the app has loaded once
// This will persist across component mounts/unmounts
let hasAppLoadedOnce = false;

const Home = ({ showCustomModal, isAuthenticated }) => {
  const { user } = useAuth();
  const [activeSearchTab, setActiveSearchTab] = useState('bus');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false); // For search results loading
  // Initialize loadingApp based on the global flag
  const [loadingApp, setLoadingApp] = useState(!hasAppLoadedOnce); // State for overall app loading
  const [showResultsSection, setShowResultsSection] = useState(false);
  const [showDetailView, setShowDetailView] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedBusSeat, setSelectedBusSeat] = useState(null);
  const [passengerName, setPassengerName] = useState('');
  const [leadGuestName, setLeadGuestName] = useState(1);
  const [numGuests, setNumGuests] = useState(1);
  const [recommendations, setRecommendations] = useState([]);
  const [noResults, setNoResults] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3); // Show 3 results per page

  // Helper to construct full image URL from backend relative path
  const getFullImageUrl = (relativePath) => {
    if (!relativePath) return '';
    return `${import.meta.env.VITE_BACKEND_API_URL.replace('/api', '')}${relativePath}`;
  };

  // Mock Recommendations (should ideally come from an API or be more dynamic)
  const mockRecommendations = [
    { type: 'activity', title: 'Visit Phewa Lake', description: 'Enjoy boating and lakeside cafes in Pokhara.', location: 'Pokhara', icon: 'sailing' },
    { type: 'food', title: 'Taste Newari Cuisine', description: 'Explore local eateries in Kathmandu for authentic flavors.', location: 'Kathmandu', icon: 'restaurant' },
    { type: 'attraction', title: 'Explore Chitwan National Park', description: 'Go on a safari and see wildlife.', location: 'Chitwan', icon: 'forest' },
    { type: 'tip', title: 'Book in Advance', description: 'Popular bus routes and hotels get booked quickly, especially during peak season.', icon: 'info' },
    { type: 'activity', title: 'Paragliding in Pokhara', description: 'Experience breathtaking views of the Himalayas.', location: 'Pokhara', icon: 'flight_takeoff' },
    { type: 'attraction', title: 'Boudhanath Stupa', description: 'Visit one of the largest stupas in Nepal, a UNESCO World Heritage site.', location: 'Kathmandu', icon: 'temple_buddhist' }
  ];

  const displayRecommendations = (fromLocation = '', toLocation = '') => {
    let relevantRecommendations = [];

    if (activeSearchTab === 'bus' && toLocation) {
      relevantRecommendations = mockRecommendations.filter(rec => rec.location && rec.location.toLowerCase().includes(toLocation.toLowerCase()));
    } else if (activeSearchTab === 'hotel' && fromLocation) {
      relevantRecommendations = mockRecommendations.filter(rec => rec.location && rec.location.toLowerCase().includes(fromLocation.toLowerCase()));
    }

    const generalTips = mockRecommendations.filter(rec => !rec.location || (!fromLocation && !toLocation));
    const neededTips = 3 - relevantRecommendations.length;
    if (neededTips > 0) {
      relevantRecommendations = relevantRecommendations.concat(generalTips.slice(0, neededTips));
    }
    setRecommendations(relevantRecommendations);
  };

  const handleSearch = async () => {
    setLoading(true);
    setSearchResults([]);
    setNoResults(false);
    setShowDetailView(false);
    setSelectedItem(null);
    setShowResultsSection(true);
    setCurrentPage(1);

    try {
      let endpoint = '';
      let params = {};

      if (activeSearchTab === 'bus') {
        endpoint = '/public/buses';
        params = { from, to, date };
      } else {
        endpoint = '/public/hotels';
        params = { location: from, checkIn: date };
      }

      const response = await axios.get(endpoint, { params });
      setSearchResults(response.data);
      setNoResults(response.data.length === 0);
      displayRecommendations(from, to);
    } catch (error) {
      console.error('Search error:', error);
      showCustomModal('Error', error.response?.data?.message || 'Failed to fetch listings. Please try again.');
      setNoResults(true);
      setSearchResults([]);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const showDetail = (item, type) => {
    setSelectedItem({ ...item, type });
    setShowDetailView(true);
    setSelectedBusSeat(null);
    setPassengerName('');
    setLeadGuestName('');
    setNumGuests(1);
  };

  const handleBackToResults = () => {
    setShowDetailView(false);
    setSelectedItem(null);
  };

  const handleBookNow = async () => {
    if (!isAuthenticated) {
      showCustomModal('Login Required', 'Please login or register to book tickets/rooms.');
      return;
    }

    if (!selectedItem) return;

    setLoading(true);
    let endpoint = '';
    let payload = {};
    let successMessage = '';
    let itemPrice = 0;

    try {
      if (selectedItem.type === 'bus') {
        if (!selectedBusSeat) {
          showCustomModal('Selection Error', 'Please select a seat to book this bus.');
          return;
        }
        if (!passengerName.trim()) {
            showCustomModal('Validation Error', 'Please enter passenger name.');
            return;
        }
        endpoint = '/user/bookings/bus';
        payload = { busId: selectedItem._id, seatNumber: selectedBusSeat, passengerName: passengerName.trim() };
        itemPrice = selectedItem.price;
        successMessage = `Bus ticket booked! Your ticket number: (will be generated by backend).`;
      } else {
        if (!leadGuestName.trim() || isNaN(numGuests) || numGuests <= 0) {
          showCustomModal('Validation Error', 'Please enter lead guest name and a valid number of guests.');
          return;
        }
        endpoint = '/user/bookings/hotel';
        const checkinDate = selectedItem.checkIn;
        const checkoutDate = selectedItem.checkOut;
        const start = new Date(checkinDate);
        const end = new Date(checkoutDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        itemPrice = selectedItem.pricePerNight * Math.max(1, diffDays);

        payload = {
          hotelId: selectedItem._id,
          leadGuestName: leadGuestName.trim(),
          numGuests: parseInt(numGuests, 10),
          checkInDate: checkinDate,
          checkOutDate: checkoutDate
        };
        successMessage = `Hotel room booked! Your confirmation number: (will be generated by backend).`;

        const confirmHotelBooking = await showCustomModal('Confirm Booking', `Do you want to book ${selectedItem.name} from ${checkinDate} to ${checkoutDate} for ${diffDays} nights at a total price of Rs. ${itemPrice.toFixed(2)}?`, true, 'Confirm');
        if (confirmHotelBooking === false) {
            setLoading(false);
            return;
        }
      }

      if (user.walletBalance < itemPrice) {
        showCustomModal('Insufficient Funds', `You need Rs. ${(itemPrice - user.walletBalance).toFixed(2)} more to complete this booking. Please add money to your wallet.`);
        setLoading(false);
        return;
      }

      const response = await axios.post(endpoint, payload);
      showCustomModal('Success!', `${successMessage} Ticket Number: ${response.data.ticketNumber}. Amount deducted: Rs. ${itemPrice.toFixed(2)}. Remaining balance: Rs. ${response.data.newBalance}. Check your Trips page or Track Ticket!`);

      user.walletBalance = parseFloat(response.data.newBalance);
      localStorage.setItem('user', JSON.stringify(user));

      setFrom('');
      setTo('');
      setDate('');
      setShowResultsSection(false);
      setShowDetailView(false);
      setSelectedItem(null);
      setSelectedBusSeat(null);
      setPassengerName('');
      setLeadGuestName('');
      setNumGuests(1);

    } catch (error) {
      console.error('Booking error:', error.response?.data || error.message);
      showCustomModal('Error', error.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderBusSeats = (totalSeats, filledSeats) => {
    const seats = [];
    const occupiedSeats = new Set();

    while (occupiedSeats.size < filledSeats) {
      const randomSeat = Math.floor(Math.random() * totalSeats) + 1;
      if (!occupiedSeats.has(randomSeat)) {
        occupiedSeats.add(randomSeat);
      }
    }

    seats.push(
      <div key="driver" className="col-span-5 flex flex-col items-center justify-center mb-4">
        <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mb-2">
          <span className="material-icons text-3xl">directions_bus</span>
        </div>
        <span className="text-sm font-semibold">Driver</span>
      </div>
    );

    const rowLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M'];
    let seatNumberCounter = 1;

    for (let row = 0; row < Math.ceil(totalSeats / 4); row++) {
      const rowLetter = rowLetters[row] || String.fromCharCode(65 + row);

      for (let i = 0; i < 2; i++) {
        if (seatNumberCounter > totalSeats) break;

        const currentSeatNumber = seatNumberCounter;
        const seatLabel = `${rowLetter}${i + 1}`;
        seats.push(
          <div
            key={`seat-${currentSeatNumber}`}
            className={`seat-icon ${occupiedSeats.has(currentSeatNumber) ? 'seat-filled' : 'seat-vacant'} ${selectedBusSeat === currentSeatNumber ? 'seat-selected' : ''} ${!isAuthenticated || occupiedSeats.has(currentSeatNumber) ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
            onClick={() => {
              if (!occupiedSeats.has(currentSeatNumber) && isAuthenticated) {
                setSelectedBusSeat(prev => prev === currentSeatNumber ? null : currentSeatNumber);
              }
            }}
          >
            {seatLabel}
          </div>
        );
        seatNumberCounter++;
      }

      seats.push(<div key={`aisle-${row}`} className="seat-icon bg-transparent shadow-none"></div>);

      for (let i = 2; i < 4; i++) {
        if (seatNumberCounter > totalSeats) break;

        const currentSeatNumber = seatNumberCounter;
        const seatLabel = `${rowLetter}${i + 1}`;
        seats.push(
          <div
            key={`seat-${currentSeatNumber}`}
            className={`seat-icon ${occupiedSeats.has(currentSeatNumber) ? 'seat-filled' : 'seat-vacant'} ${selectedBusSeat === currentSeatNumber ? 'seat-selected' : ''} ${!isAuthenticated || occupiedSeats.has(currentSeatNumber) ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
            onClick={() => {
              if (!occupiedSeats.has(currentSeatNumber) && isAuthenticated) {
                setSelectedBusSeat(prev => prev === currentSeatNumber ? null : currentSeatNumber);
              }
            }}
          >
            {seatLabel}
          </div>
        );
        seatNumberCounter++;
      }
    }

    return seats;
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = searchResults.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(searchResults.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // useEffect to handle the initial loader visibility
  useEffect(() => {
    // Only show the loader if the app hasn't loaded once before
    if (!hasAppLoadedOnce) {
      const initialLoadTimeout = setTimeout(() => {
        setLoadingApp(false);
        hasAppLoadedOnce = true; // Set the flag to true after the first load
      }, 1000); // 1 second as before

      // Cleanup the timeout if the component unmounts early
      return () => clearTimeout(initialLoadTimeout);
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  // useEffect to trigger search on initial load and when activeSearchTab changes
  useEffect(() => {
    // Initial load, perhaps fetch some default listings or popular ones
    handleSearch(); // Call search on initial load to show something
  }, [activeSearchTab]); // Reruns when activeSearchTab changes

  return (
    <>
      {/* Loader Wrapper - Conditionally render based on loadingApp state */}
      {loadingApp && (
        <div id="loader-wrapper" className={loadingApp ? '' : 'loader-fade-out'}>
          <div className="loader-bus">
            <img src={BusIconUrl} alt="Bus Icon" className="bus-svg-icon" />
          </div>
          <div className="loader-text" aria-live="polite">
            NeeloSewa is loading<span id="dots"></span>
          </div>
        </div>
      )}

      {/* Main Content - This will now always be rendered and visible underneath the loader */}
      <section id="home-page-content" className="page-content">
        {/* Hero Section */}
        <section
          className="hero-background-image text-white py-24 px-4 shadow-xl"
          style={{ backgroundImage: `url(${heroBgImage})` }}
        >
          <div className="container mx-auto text-center text-decor">
            <h1 className="text-5xl md:text-5xl font-extrabold mb-5 text-shadow">NeeloSewa: Smart Travel, Connected Nepal.</h1>
            <p className="text-xl md:text-2xl mb-10 font-light opacity-90">Welcome to NeeloSewa! Explore smart travel options across Nepal.</p>
          </div>
        </section>

        {/* Booking Search Section */}
        <section className="bg-white py-10 px-6 -mt-16 relative z-10 rounded-2xl shadow-2xl max-w-6xl mx-auto mb-10 border border-gray-100">
          <div className="flex bg-white rounded-t-lg overflow-hidden shadow-xl mb-8 max-w-lg w-full mx-auto transform -translate-y-4">
            <button
              className={`flex-1 py-3 text-lg font-semibold transition-all duration-300 ${activeSearchTab === 'bus' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-blue-100'}`}
              onClick={() => setActiveSearchTab('bus')}
            >
              <i className="material-icons align-middle mr-2">directions_bus</i> Bus
            </button>
            <button
              className={`flex-1 py-3 text-lg font-semibold transition-all duration-300 ${activeSearchTab === 'hotel' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-blue-100'}`}
              onClick={() => setActiveSearchTab('hotel')}
            >
              <i className="material-icons align-middle mr-2">hotel</i> Hotel
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <input
              type="text"
              id="from-input"
              placeholder={activeSearchTab === 'bus' ? 'From Location' : 'Location (e.g., City)'}
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all search-input text-lg"
            />
            <input
              type="text"
              id="to-input"
              placeholder={activeSearchTab === 'bus' ? 'To Destination' : 'Not Applicable'}
              value={to}
              onChange={(e) => setTo(e.target.value)}
              disabled={activeSearchTab === 'hotel'}
              className={`p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all search-input text-lg ${activeSearchTab === 'hotel' ? 'hidden' : ''}`}
            />
            <input
              type="date"
              id="date-input"
              placeholder="Travel Date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all search-input text-lg"
            />
            <button
              id="search-button"
              className="p-4 bg-green-500 text-white rounded-xl font-bold text-lg hover:bg-green-600 transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 btn-primary"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search Now'}
            </button>
          </div>
        </section>

        {/* Search Results Section (Dynamic) */}
        {showResultsSection && (
          <section id="search-results-section" className="container mx-auto px-4 py-8 mb-20">
            <div className="flex justify-between items-center mb-8">
              <h2 id="results-heading" className="text-3xl font-bold text-gray-800">
                {showDetailView ? (selectedItem.type === 'bus' ? 'Bus Details' : 'Hotel Details') : `Available ${activeSearchTab === 'bus' ? 'Buses' : 'Hotels'}`}
              </h2>
              {showDetailView && (
                <button
                  id="back-to-results-button"
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center"
                  onClick={handleBackToResults}
                >
                  <span className="material-icons text-lg align-middle mr-1">arrow_back</span> Back to Results
                </button>
              )}
            </div>

            {loading && (
              <div id="loading-spinner" className="text-center mt-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mx-auto"></div>
                <p className="text-blue-500 text-lg mt-3">Searching...</p>
              </div>
            )}

            {!loading && !showDetailView && (
              <div id="results-list-view">
                <div id="results-list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {currentItems.map((item) => (
                    <div
                      key={item._id}
                      className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500 card-hover-effect flex flex-col cursor-pointer"
                      onClick={() => showDetail(item, activeSearchTab)}
                    >
                      {activeSearchTab === 'bus' ? (
                        <>
                          <img
                            src={getFullImageUrl(item.mainImageUrl) || 'https://placehold.co/400x250/4a90e2/FFFFFF?text=Bus'}
                            alt={`${item.operator} Bus`}
                            className="rounded-lg mb-4 object-cover h-40 w-full"
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x250/4a90e2/FFFFFF?text=Bus'; }}
                          />
                          <h3 className="text-xl font-bold mb-2 text-blue-800 flex items-center"><span className="material-icons mr-2">directions_bus</span>{item.operator} - {item.to}</h3>
                          <p className="text-gray-700 text-sm mb-1">From: <strong>{item.from}</strong> to <strong>{item.to}</strong></p>
                          <p className="text-gray-700 text-sm mb-1 flex items-center"><span className="material-icons text-base mr-1">schedule</span>Departs: {item.time} | Arrives: {item.arrival}</p>
                          <p className="text-gray-700 text-sm mb-1 flex items-center"><span className="material-icons text-base mr-1">event</span>Date: {item.date}</p>
                          <p className="text-gray-700 text-sm mb-4 flex items-center"><span className="material-icons text-base mr-1">wifi</span>Amenities: {item.amenities.join(', ') || 'N/A'}</p>
                          <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                            <span className="text-xl font-bold text-green-700">Rs. {item.price}</span>
                            <span className="text-sm font-semibold text-gray-600">{item.totalSeats - item.filledSeats} seats vacant</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <img src={getFullImageUrl(item.imageUrl) || 'https://placehold.co/300x200/CCCCCC/666666?text=Hotel'} alt={item.name} className="rounded-lg mb-4 object-cover h-40 w-full" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/300x200/CCCCCC/666666?text=Hotel'; }} />
                          <h3 className="text-xl font-bold mb-2 text-blue-800 flex items-center"><span className="material-icons mr-2">hotel</span>{item.name} ({item.rating} <span className="text-yellow-500 material-icons text-lg">star</span>)</h3>
                          <p className="text-gray-700 text-sm mb-1 flex items-center"><span className="material-icons text-base mr-1">place</span>Location: <strong>{item.location}</strong></p>
                          <p className="text-gray-700 text-sm mb-1">Type: {item.type}</p>
                          <p className="text-gray-700 text-sm mb-4 flex items-center"><span className="material-icons text-base mr-1">pool</span>Amenities: {item.amenities.join(', ') || 'N/A'}</p>
                          <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                            <span className="text-xl font-bold text-green-700">Rs. {item.pricePerNight} / night</span>
                            <span className="text-sm font-semibold text-gray-600">{item.roomsAvailable} rooms available</span>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
                {noResults && (
                  <p id="no-results-message" className="text-center text-gray-600 text-lg mt-8">No results found for your search criteria. Try adjusting your filters.</p>
                )}
                {/* Pagination Controls */}
                {searchResults.length > itemsPerPage && (
                  <div className="flex justify-center mt-8 space-x-2">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => paginate(i + 1)}
                        className={`px-4 py-2 rounded-lg ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}

            {!loading && showDetailView && selectedItem && (
              <div id="detail-view" className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <h3 id="detail-title" className="text-2xl font-bold mb-4 text-gray-800">
                  {selectedItem.type === 'bus' ? (
                    <><span className="material-icons text-3xl align-bottom mr-2">directions_bus</span>{selectedItem.operator} - {selectedItem.from} to {selectedItem.to}</>
                  ) : (
                    <><span className="material-icons text-3xl align-bottom mr-2">hotel</span>{selectedItem.name} ({selectedItem.location})</>
                  )}
                </h3>
                <div id="detail-content" className="space-y-4">
                  {(selectedItem.galleryImages && selectedItem.galleryImages.length > 0) ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                      {selectedItem.galleryImages.map((imgUrl, index) => (
                        <img
                          key={index}
                          src={getFullImageUrl(imgUrl)}
                          alt={`${selectedItem.type} Image ${index + 1}`}
                          className="w-full h-40 object-cover rounded-lg shadow-md"
                          onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x250/CCCCCC/666666?text=No+Image'; }}
                        />
                      ))}
                    </div>
                  ) : (
                    <img
                      src={getFullImageUrl(selectedItem.type === 'bus' ? selectedItem.mainImageUrl : selectedItem.imageUrl) || 'https://placehold.co/400x250/CCCCCC/666666?text=No+Images+Available'}
                      alt={`${selectedItem.type} Main Image`}
                      className="rounded-lg mb-4 object-cover h-48 w-full"
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x250/CCCCCC/666666?text=No+Images+Available'; }}
                    />
                  )}
                  {selectedItem.type === 'bus' ? (
                    <>
                      <p className="text-gray-700"><strong className="text-blue-700">Bus Type:</strong> {selectedItem.busType}</p>
                      <p className="text-gray-700"><strong className="text-blue-700">Departure:</strong> {selectedItem.time} on {selectedItem.date}</p>
                      <p className="text-700"><strong className="text-blue-700">Arrival:</strong> {selectedItem.arrival}</p>
                      <p className="text-gray-700"><strong className="text-blue-700">Price:</strong> Rs. {selectedItem.price}</p>
                      <p className="text-gray-700"><strong className="text-blue-700">Amenities:</strong> {selectedItem.amenities.join(', ') || 'N/A'}</p>
                      <p className="text-gray-700"><strong className="text-blue-700">Seats Available:</strong> {selectedItem.totalSeats - selectedItem.filledSeats} / {selectedItem.totalSeats}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-700"><strong className="text-green-700">Type:</strong> {selectedItem.type}</p>
                      <p className="text-gray-700"><strong className="text-green-700">Price Per Night:</strong> Rs. {selectedItem.pricePerNight}</p>
                      <p className="text-gray-700"><strong className="text-green-700">Rating:</strong> {selectedItem.rating} <span className="material-icons text-yellow-500 text-lg align-bottom">star</span></p>
                      <p className="text-gray-700"><strong className="text-green-700">Rooms Available:</strong> {selectedItem.roomsAvailable}</p>
                      <p className="text-gray-700"><strong className="text-green-700">Check-in:</strong> {selectedItem.checkIn} <strong className="text-green-700">Check-out:</strong> {selectedItem.checkOut}</p>
                      <p className="text-gray-700"><strong className="text-green-700">Amenities:</strong> {selectedItem.amenities.join(', ') || 'N/A'}</p>
                    </>
                  )}
                </div>

                {selectedItem.type === 'bus' && (
                  <div id="bus-booking-details" className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="text-xl font-semibold text-blue-800 mb-3 flex items-center">
                      <span className="material-icons text-xl mr-2">person_add</span> Passenger Details
                    </h4>
                    <div className="flex flex-wrap justify-center p-4 bg-white rounded-lg shadow-md border border-gray-200 mb-4">
                      <div id="bus-seats-layout" className="grid grid-cols-5 gap-2 w-full max-w-md mx-auto">
                        {renderBusSeats(selectedItem.totalSeats, selectedItem.filledSeats)}
                      </div>
                    </div>
                    <p className="text-center text-sm text-gray-600 mt-2">Click on a green seat to select. Selected seat: <span id="selected-seat-display" className="font-bold text-blue-600">{selectedBusSeat || 'None'}</span></p>
                    <div className="flex justify-center items-center mt-4 space-x-4 text-sm">
                      <div className="flex items-center">
                        <span className="seat-icon bg-green-500 w-5 h-5 rounded-sm"></span><span className="ml-1 text-gray-700">Vacant</span>
                      </div>
                      <div className="flex items-center">
                        <span className="seat-icon bg-red-500 w-5 h-5 rounded-sm"></span><span className="ml-1 text-gray-700">Filled</span>
                      </div>
                      <div className="flex items-center">
                        <span className="seat-icon bg-blue-500 border-yellow-400 border-2 w-5 h-5 rounded-sm"></span><span className="ml-1 text-gray-700">Selected</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label htmlFor="bus-passenger-name-input" className="block text-gray-700 text-sm font-bold mb-2">Passenger Name:</label>
                      <input
                        type="text"
                        id="bus-passenger-name-input"
                        placeholder="Enter full name"
                        value={passengerName}
                        onChange={(e) => setPassengerName(e.target.value)}
                        required
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline search-input"
                      />
                    </div>
                  </div>
                )}

                {selectedItem.type === 'hotel' && (
                  <div id="hotel-booking-details" className="mt-6 p-4 bg-green-50 rounded-lg">
                    <h4 className="text-xl font-semibold text-green-800 mb-3 flex items-center">
                      <span className="material-icons text-xl mr-2">group</span> Guest Details
                    </h4>
                    <div className="mb-4">
                      <label htmlFor="hotel-lead-guest-name-input" className="block text-gray-700 text-sm font-bold mb-2">Lead Guest Name:</label>
                      <input
                        type="text"
                        id="hotel-lead-guest-name-input"
                        placeholder="Enter lead guest name"
                        value={leadGuestName}
                        onChange={(e) => setLeadGuestName(e.target.value)}
                        required
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline search-input"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="hotel-num-guests-input" className="block text-gray-700 text-sm font-bold mb-2">Number of Guests:</label>
                      <input
                        type="number"
                        id="hotel-num-guests-input"
                        value={numGuests}
                        min="1"
                        onChange={(e) => setNumGuests(parseInt(e.target.value, 10))}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline search-input"
                      />
                    </div>
                  </div>
                )}

                <button
                  id="confirm-booking-button"
                  className={`mt-6 w-full p-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-md btn-primary ${selectedItem.type === 'bus' && !selectedBusSeat ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={handleBookNow}
                  disabled={(selectedItem.type === 'bus' && !selectedBusSeat) || loading || !isAuthenticated}
                >
                  {loading ? 'Confirming...' : (isAuthenticated ? 'Book Now' : 'Login to Book')}
                </button>
              </div>
            )}

            {/* Recommendations Section */}
            <div id="recommendations-section" className="pt-6 border-t border-gray-200 mt-12">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="material-icons text-3xl mr-3 text-yellow-500">lightbulb</span> Recommendations for You
              </h3>
              <div id="recommendations-list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.length > 0 ? (
                  recommendations.map((rec, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-400 card-hover-effect">
                      <h4 className="text-xl font-bold mb-2 text-yellow-800 flex items-center">
                        <span className="material-icons mr-2 text-yellow-500">{rec.icon || 'lightbulb'}</span>{rec.title}
                      </h4>
                      <p className="text-gray-700 text-md">{rec.description}</p>
                    </div>
                  ))
                ) : (
                  <p id="no-recommendations-message" className="text-center text-gray-600 text-lg col-span-full">No specific recommendations at this time.</p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Why Choose NeeloSewa Section */}
        <section className="bg-blue-50 py-20 px-4">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl font-extrabold mb-12 text-gray-800">Why Choose NeeloSewa?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              <div className="bg-white p-10 rounded-2xl shadow-lg flex flex-col items-center card-hover-effect border-b-4 border-blue-400">
                <span className="material-icons text-6xl text-blue-500 mb-5">language</span>
                <p className="text-2xl font-bold text-gray-800 mb-2">Vast Network</p>
                <p className="text-gray-600 text-center leading-relaxed">Over 1000+ bus routes across Nepal for unparalleled connectivity and choice.</p>
              </div>
              <div className="bg-white p-10 rounded-2xl shadow-lg flex flex-col items-center card-hover-effect border-b-4 border-green-400">
                <span className="material-icons text-6xl text-green-500 mb-5">speed</span>
                <p className="text-2xl font-bold text-gray-800 mb-2">Blazing Fast Booking</p>
                <p className="text-gray-600 text-center leading-relaxed">Book your tickets in mere seconds, ensuring a smooth and efficient process.</p>
              </div>
              <div className="bg-white p-10 rounded-2xl shadow-lg flex flex-col items-center card-hover-effect border-b-4 border-purple-400">
                <span className="material-icons text-6xl text-purple-500 mb-5">support_agent</span>
                <p className="text-2xl font-bold text-gray-800 mb-2">24/7 Dedicated Support</p>
                <p className="text-gray-600 text-center leading-relaxed">Our friendly customer support team is always available to assist you, day or night.</p>
              </div>
              <div className="bg-white p-10 rounded-2xl shadow-lg flex flex-col items-center card-hover-effect border-b-4 border-red-400">
                <span className="material-icons text-6xl text-red-500 mb-5">receipt_long</span>
                <p className="text-2xl font-bold text-gray-800 mb-2">Hassle-Free Refunds</p>
                <p className="text-gray-600 text-center leading-relaxed">Experience quick and instant refunds directly credited to your account.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-20">
          <h2 className="text-4xl font-extrabold mb-12 text-gray-800 text-center">Our Innovative Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            <div className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-blue-500 card-hover-effect">
              <h3 className="text-2xl font-bold mb-3 text-blue-800 flex items-center"><span className="material-icons mr-2 text-blue-500">smart_toy</span>AI Khalasi</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 text-lg">
                <li>Your Onboard AI Assistant</li>
                <li>Emergency Alert System</li>
                <li>Real-time Announcements</li>
                <li>Interactive Chat Support</li>
              </ul>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-green-500 card-hover-effect">
              <h3 className="text-2xl font-bold mb-3 text-green-800 flex items-center"><span className="material-icons mr-2 text-green-500">wifi</span>Unlimited Wifi</h3>
              <p className="text-gray-700 text-lg leading-relaxed">Seamless QR-based wifi access throughout your journey to keep you connected.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-purple-500 card-hover-effect">
              <h3 className="text-2xl font-bold mb-3 text-purple-800 flex items-center"><span className="material-icons mr-2 text-purple-500">account_balance_wallet</span>Neelo Wallet</h3>
              <p className="text-gray-700 text-lg leading-relaxed">Our integrated wallet is accepted at every corner of Nepal for convenient payments.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-red-500 card-hover-effect">
              <h3 className="text-2xl font-bold mb-3 text-red-800 flex items-center"><span className="material-icons mr-2 text-red-500">track_changes</span>Track & Locate</h3>
              <p className="text-gray-700 text-lg leading-relaxed">Effortlessly track your ticket, vehicle, and get real-time fare updates via our live data server.</p>
            </div>
          </div>
        </section>
      </section>
    </>
  );
};

export default Home;