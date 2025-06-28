import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminBuses = ({ showCustomModal }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBus, setEditingBus] = useState(null);

// Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const busesPerPage = 5;

  // Form states
  const [operator, setOperator] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [arrival, setArrival] = useState('');
  const [price, setPrice] = useState('');
  const [totalSeats, setTotalSeats] = useState('');
  const [filledSeats, setFilledSeats] = useState('');
  const [busType, setBusType] = useState('');
  const [amenities, setAmenities] = useState(''); // Comma separated string
  // New states for uploaded files and their previews
  const [mainImageFile, setMainImageFile] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState('');
  const [galleryImageFiles, setGalleryImageFiles] = useState([]);
  const [galleryImagePreviews, setGalleryImagePreviews] = useState([]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      showCustomModal('Access Denied', 'You need admin privileges to view this page.').then(() => {
        navigate('/home');
      });
      return;
    }
    fetchBuses();
  }, [isAuthenticated, user, navigate]);

  const fetchBuses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/public/buses'); // Admin uses public endpoint to fetch all
      setBuses(response.data);
    } catch (err) {
      console.error('Error fetching buses:', err);
      setError(err.response?.data?.message || 'Failed to fetch buses.');
    } finally {
      setLoading(false);
    }
  };


  const indexOfLastBus = currentPage * busesPerPage;
  const indexOfFirstBus = indexOfLastBus - busesPerPage;
  const currentBuses = buses.slice(indexOfFirstBus, indexOfLastBus);
  const totalPages = Math.ceil(buses.length / busesPerPage);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };


  const resetForm = () => {
    setOperator('');
    setFrom('');
    setTo('');
    setDate('');
    setTime('');
    setArrival('');
    setPrice('');
    setTotalSeats('');
    setFilledSeats('');
    setBusType('');
    setAmenities('');
    setMainImageFile(null); // Reset file input states
    setMainImagePreview('');
    setGalleryImageFiles([]);
    setGalleryImagePreviews([]);
    setEditingBus(null);
    setShowAddForm(false);
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMainImageFile(file);
      setMainImagePreview(URL.createObjectURL(file));
    } else {
      setMainImageFile(null);
      setMainImagePreview('');
    }
  };

  const handleGalleryImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setGalleryImageFiles(files);
      setGalleryImagePreviews(files.map(file => URL.createObjectURL(file)));
    } else {
      setGalleryImageFiles([]);
      setGalleryImagePreviews([]);
    }
  };


  const handleAddBus = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(); // Use FormData for file uploads

    formData.append('operator', operator);
    formData.append('from', from);
    formData.append('to', to);
    formData.append('date', date);
    formData.append('time', time);
    formData.append('arrival', arrival);
    formData.append('price', price);
    formData.append('totalSeats', totalSeats);
    formData.append('busType', busType);
    formData.append('amenities', amenities); // Send as string, backend will split

    if (editingBus) {
        formData.append('filledSeats', filledSeats); // Only for updates
    }

    if (mainImageFile) {
      formData.append('mainImage', mainImageFile);
    }
    galleryImageFiles.forEach((file) => {
      formData.append('galleryImages', file);
    });

    try {
      if (editingBus) {
        // For update, if no new image is selected, don't send the field,
        // so the existing image URL in DB is preserved.
        // If an image is selected, it overwrites the existing one.
        await axios.put(`/admin/buses/${editingBus._id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data', // Important for file uploads
          },
        });
        showCustomModal('Bus Updated', 'Bus details updated successfully!');
      } else {
        await axios.post('/admin/buses', formData, {
          headers: {
            'Content-Type': 'multipart/form-data', // Important for file uploads
          },
        });
        showCustomModal('Bus Added', 'New bus added successfully!');
      }
      resetForm();
      fetchBuses();
    } catch (err) {
      console.error('Error adding/updating bus:', err);
      showCustomModal('Error', err.response?.data?.message || 'Failed to save bus. Please check your input and ensure image files are valid (max 5MB, image types only).');
      setError(err.response?.data?.message || 'Failed to save bus.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (bus) => {
    setEditingBus(bus);
    setOperator(bus.operator);
    setFrom(bus.from);
    setTo(bus.to);
    setDate(bus.date);
    setTime(bus.time);
    setArrival(bus.arrival);
    setPrice(bus.price);
    setTotalSeats(bus.totalSeats);
    setFilledSeats(bus.filledSeats);
    setBusType(bus.busType);
    setAmenities(bus.amenities.join(', '));
    // Set existing image URLs for preview when editing
    setMainImagePreview(bus.mainImageUrl || '');
    setGalleryImagePreviews(bus.galleryImages || []);
    // Do NOT set mainImageFile or galleryImageFiles, as they are for new uploads
    setShowAddForm(true);
  };

  const handleDeleteBus = async (id) => {
    const confirmDelete = await showCustomModal('Confirm Delete', 'Are you sure you want to delete this bus? This action cannot be undone.');
    if (confirmDelete) {
      setLoading(true);
      setError(null);
      try {
        await axios.delete(`/admin/buses/${id}`);
        showCustomModal('Bus Deleted', 'Bus successfully deleted!');
        fetchBuses();
      } catch (err) {
        console.error('Error deleting bus:', err);
        showCustomModal('Error', err.response?.data?.message || 'Failed to delete bus.');
        setError(err.response?.data?.message || 'Failed to delete bus.');
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
        <span className="material-icons text-3xl mr-3 text-blue-600">directions_bus</span>Manage Buses
      </h2>

      <button
        className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-md btn-primary flex items-center mx-auto mb-8"
        onClick={() => { resetForm(); setShowAddForm(!showAddForm); }}
      >
        <span className="material-icons mr-2">{showAddForm ? 'close' : 'add'}</span>{showAddForm ? 'Cancel Add/Edit' : 'Add New Bus'}
      </button>

      {showAddForm && (
        <div className="bg-gray-50 p-6 rounded-lg shadow-inner mb-8 border border-gray-200 max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold mb-4 text-gray-800 text-center">{editingBus ? 'Edit Bus' : 'Add New Bus'}</h3>
          <form onSubmit={handleAddBus} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="operator" className="block text-gray-700 text-sm font-bold mb-2">Operator:</label>
              <input type="text" id="operator" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline search-input" value={operator} onChange={(e) => setOperator(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="from" className="block text-gray-700 text-sm font-bold mb-2">From:</label>
              <input type="text" id="from" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline search-input" value={from} onChange={(e) => setFrom(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="to" className="block text-gray-700 text-sm font-bold mb-2">To:</label>
              <input type="text" id="to" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline search-input" value={to} onChange={(e) => setTo(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="date" className="block text-gray-700 text-sm font-bold mb-2">Date (YYYY-MM-DD):</label>
              <input type="date" id="date" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline search-input" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="time" className="block text-gray-700 text-sm font-bold mb-2">Departure Time:</label>
              <input type="text" id="time" placeholder="HH:MM AM/PM" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline search-input" value={time} onChange={(e) => setTime(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="arrival" className="block text-gray-700 text-sm font-bold mb-2">Arrival Time:</label>
              <input type="text" id="arrival" placeholder="HH:MM AM/PM" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline search-input" value={arrival} onChange={(e) => setArrival(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="price" className="block text-gray-700 text-sm font-bold mb-2">Price (Rs.):</label>
              <input type="number" id="price" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline search-input" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="totalSeats" className="block text-gray-700 text-sm font-bold mb-2">Total Seats:</label>
              <input type="number" id="totalSeats" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline search-input" value={totalSeats} onChange={(e) => setTotalSeats(e.target.value)} required />
            </div>
            {editingBus && (
                <div>
                    <label htmlFor="filledSeats" className="block text-gray-700 text-sm font-bold mb-2">Filled Seats:</label>
                    <input type="number" id="filledSeats" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline search-input" value={filledSeats} onChange={(e) => setFilledSeats(e.target.value)} />
                </div>
            )}
            <div>
              <label htmlFor="busType" className="block text-gray-700 text-sm font-bold mb-2">Bus Type:</label>
              <input type="text" id="busType" placeholder="e.g., AC Deluxe" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline search-input" value={busType} onChange={(e) => setBusType(e.target.value)} required />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="amenities" className="block text-gray-700 text-sm font-bold mb-2">Amenities (comma-separated):</label>
              <input type="text" id="amenities" placeholder="WiFi, Water Bottle" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline search-input" value={amenities} onChange={(e) => setAmenities(e.target.value)} />
            </div>

            {/* New: Main Image Upload Field */}
            <div className="md:col-span-2">
                <label htmlFor="mainImageUpload" className="block text-gray-700 text-sm font-bold mb-2">Main Bus Image (Max 5MB):</label>
                <input
                    type="file"
                    id="mainImageUpload"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    accept="image/*"
                    onChange={handleMainImageChange}
                />
                {mainImagePreview && (
                    <div className="mt-2">
                        <p className="text-gray-600 text-sm mb-1">Current/New Main Image Preview:</p>
                        <img src={mainImagePreview.startsWith('/uploads') ? import.meta.env.VITE_BACKEND_API_URL.replace('/api', '') + mainImagePreview : mainImagePreview} alt="Main Preview" className="w-40 h-auto object-cover rounded-md shadow" />
                    </div>
                )}
            </div>

            {/* New: Gallery Images Upload Field */}
            <div className="md:col-span-2">
                <label htmlFor="galleryImagesUpload" className="block text-gray-700 text-sm font-bold mb-2">Gallery Images (Max 10 files, each max 5MB):</label>
                <input
                    type="file"
                    id="galleryImagesUpload"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    accept="image/*"
                    multiple // Allow multiple file selection
                    onChange={handleGalleryImagesChange}
                />
                {galleryImagePreviews.length > 0 && (
                    <div className="mt-2">
                        <p className="text-gray-600 text-sm mb-1">Gallery Image Previews:</p>
                        <div className="flex flex-wrap gap-2">
                            {galleryImagePreviews.map((previewUrl, index) => (
                                <img key={index} src={previewUrl.startsWith('/uploads') ? import.meta.env.VITE_BACKEND_API_URL.replace('/api', '') + previewUrl : previewUrl} alt={`Gallery Preview ${index + 1}`} className="w-24 h-24 object-cover rounded-md shadow" />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="md:col-span-2 flex justify-center mt-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md btn-primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : (editingBus ? 'Update Bus' : 'Add Bus')}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && !showAddForm && (
        <div className="text-center mt-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mx-auto"></div>
          <p className="text-blue-500 text-lg mt-3">Loading buses...</p>
        </div>
      )}

      {error && (
        <div className="text-center p-4 bg-red-100 text-red-700 rounded-lg">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && buses.length === 0 && (
        <p className="text-center text-gray-600 text-lg mt-8">No buses added yet. Use the "Add New Bus" button to get started.</p>
      )}

      {!loading && !error && buses.length > 0 && (
        <><div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Image</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Operator</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Route</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Date/Time</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Price</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Seats</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Type</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentBuses.map(bus => (
                <tr key={bus._id} className="hover:bg-gray-50">
                  <td className="py-4 px-6 whitespace-nowrap">
                    <img
                      // Prepend backend URL for locally served static files
                      src={bus.mainImageUrl ? import.meta.env.VITE_BACKEND_API_URL.replace('/api', '') + bus.mainImageUrl : 'https://placehold.co/100x60/4a90e2/FFFFFF?text=Bus'}
                      alt="Bus"
                      className="w-16 h-10 object-cover rounded-md"
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x60/4a90e2/FFFFFF?text=Bus'; } } />
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">{bus.operator}</td>
                  <td className="py-4 px-6 whitespace-nowrap">{bus.from} - {bus.to}</td>
                  <td className="py-4 px-6 whitespace-nowrap">{bus.date} {bus.time}</td>
                  <td className="py-4 px-6 whitespace-nowrap">Rs. {bus.price.toFixed(2)}</td>
                  <td className="py-4 px-6 whitespace-nowrap">{bus.filledSeats}/{bus.totalSeats}</td>
                  <td className="py-4 px-6 whitespace-nowrap">{bus.busType}</td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <button
                      className="text-blue-600 hover:text-blue-900 mr-4 material-icons"
                      onClick={() => handleEditClick(bus)}
                      title="Edit"
                      disabled={loading}
                    >
                      edit
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900 material-icons"
                      onClick={() => handleDeleteBus(bus._id)}
                      title="Delete"
                      disabled={loading}
                    >
                      delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div><div className="flex justify-center items-center mt-4 space-x-2">
            <button onClick={goToPrevPage} disabled={currentPage === 1} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50">Previous</button>
            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx + 1}
                onClick={() => goToPage(idx + 1)}
                className={`px-3 py-1 rounded ${currentPage === idx + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                {idx + 1}
              </button>
            ))}
            <button onClick={goToNextPage} disabled={currentPage === totalPages} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50">Next</button>
          </div></>
      )}
    </section>
  );
};

export default AdminBuses;
