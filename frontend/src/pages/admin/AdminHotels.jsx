import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminHotels = ({ showCustomModal }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [rating, setRating] = useState('');
  const [pricePerNight, setPricePerNight] = useState('');
  const [roomsAvailable, setRoomsAvailable] = useState('');
  const [type, setType] = useState('');
  const [amenities, setAmenities] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
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
    fetchHotels();
  }, [isAuthenticated, user, navigate]);

  const fetchHotels = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/public/hotels'); // Admin uses public endpoint to fetch all
      setHotels(response.data);
    } catch (err) {
      console.error('Error fetching hotels:', err);
      setError(err.response?.data?.message || 'Failed to fetch hotels.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setLocation('');
    setRating('');
    setPricePerNight('');
    setRoomsAvailable('');
    setType('');
    setAmenities('');
    setCheckIn('');
    setCheckOut('');
    setMainImageFile(null); // Reset file input states
    setMainImagePreview('');
    setGalleryImageFiles([]);
    setGalleryImagePreviews([]);
    setEditingHotel(null);
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


  const handleAddHotel = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(); // Use FormData for file uploads

    formData.append('name', name);
    formData.append('location', location);
    formData.append('rating', rating);
    formData.append('pricePerNight', pricePerNight);
    formData.append('roomsAvailable', roomsAvailable);
    formData.append('type', type);
    formData.append('amenities', amenities);
    formData.append('checkIn', checkIn);
    formData.append('checkOut', checkOut);

    if (mainImageFile) {
      formData.append('mainImage', mainImageFile); // 'mainImage' matches backend field name
    }
    galleryImageFiles.forEach((file) => {
      formData.append('galleryImages', file); // 'galleryImages' matches backend field name
    });

    try {
      if (editingHotel) {
        await axios.put(`/admin/hotels/${editingHotel._id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data', // Important for file uploads
          },
        });
        showCustomModal('Hotel Updated', 'Hotel details updated successfully!');
      } else {
        await axios.post('/admin/hotels', formData, {
          headers: {
            'Content-Type': 'multipart/form-data', // Important for file uploads
          },
        });
        showCustomModal('Hotel Added', 'New hotel added successfully!');
      }
      resetForm();
      fetchHotels();
    } catch (err) {
      console.error('Error adding/updating hotel:', err);
      showCustomModal('Error', err.response?.data?.message || 'Failed to save hotel. Please check your input and ensure image files are valid (max 5MB, image types only).');
      setError(err.response?.data?.message || 'Failed to save hotel.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (hotel) => {
    setEditingHotel(hotel);
    setName(hotel.name);
    setLocation(hotel.location);
    setRating(hotel.rating);
    setPricePerNight(hotel.pricePerNight);
    setRoomsAvailable(hotel.roomsAvailable);
    setType(hotel.type);
    setAmenities(hotel.amenities.join(', '));
    setCheckIn(hotel.checkIn);
    setCheckOut(hotel.checkOut);
    // Set existing image URLs for preview when editing
    setMainImagePreview(hotel.imageUrl || '');
    setGalleryImagePreviews(hotel.galleryImages || []);
    setShowAddForm(true);
  };

  const handleDeleteHotel = async (id) => {
    const confirmDelete = await showCustomModal('Confirm Delete', 'Are you sure you want to delete this hotel? This action cannot be undone.');
    if (confirmDelete) {
      setLoading(true);
      setError(null);
      try {
        await axios.delete(`/admin/hotels/${id}`);
        showCustomModal('Hotel Deleted', 'Hotel successfully deleted!');
        fetchHotels();
      } catch (err) {
        console.error('Error deleting hotel:', err);
        showCustomModal('Error', err.response?.data?.message || 'Failed to delete hotel.');
        setError(err.response?.data?.message || 'Failed to delete hotel.');
      } finally {
        setLoading(false);
      }
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <section className="page-content container mx-auto px-4 py-12 bg-white rounded-xl shadow-2xl mb-16 border border-gray-100">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center flex items-center justify-center">
        <span className="material-icons text-3xl mr-3 text-green-600">hotel</span>Manage Hotels
      </h2>

      <button
        className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-md btn-primary flex items-center mx-auto mb-8"
        onClick={() => { resetForm(); setShowAddForm(!showAddForm); }}
      >
        <span className="material-icons mr-2">{showAddForm ? 'close' : 'add'}</span>{showAddForm ? 'Cancel Add/Edit' : 'Add New Hotel'}
      </button>

      {showAddForm && (
        <div className="bg-gray-50 p-6 rounded-lg shadow-inner mb-8 border border-gray-200 max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold mb-4 text-gray-800 text-center">{editingHotel ? 'Edit Hotel' : 'Add New Hotel'}</h3>
          <form onSubmit={handleAddHotel} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Hotel Name:</label>
              <input type="text" id="name" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline search-input" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="location" className="block text-gray-700 text-sm font-bold mb-2">Location:</label>
              <input type="text" id="location" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline search-input" value={location} onChange={(e) => setLocation(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="rating" className="block text-gray-700 text-sm font-bold mb-2">Rating (1-5):</label>
              <input type="number" id="rating" min="1" max="5" step="0.1" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline search-input" value={rating} onChange={(e) => setRating(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="pricePerNight" className="block text-gray-700 text-sm font-bold mb-2">Price Per Night (Rs.):</label>
              <input type="number" id="pricePerNight" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline search-input" value={pricePerNight} onChange={(e) => setPricePerNight(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="roomsAvailable" className="block text-gray-700 text-sm font-bold mb-2">Rooms Available:</label>
              <input type="number" id="roomsAvailable" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline search-input" value={roomsAvailable} onChange={(e) => setRoomsAvailable(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="type" className="block text-gray-700 text-sm font-bold mb-2">Type (e.g., Luxury, Resort):</label>
              <input type="text" id="type" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline search-input" value={type} onChange={(e) => setType(e.target.value)} required />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="amenities" className="block text-gray-700 text-sm font-bold mb-2">Amenities (comma-separated):</label>
              <input type="text" id="amenities" placeholder="Pool, Spa, Restaurant" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline search-input" value={amenities} onChange={(e) => setAmenities(e.target.value)} />
            </div>

            {/* New: Main Image Upload Field */}
            <div className="md:col-span-2">
                <label htmlFor="mainImageUpload" className="block text-gray-700 text-sm font-bold mb-2">Main Hotel Image (Max 5MB):</label>
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

            <div>
              <label htmlFor="checkIn" className="block text-gray-700 text-sm font-bold mb-2">Check-in (YYYY-MM-DD):</label>
              <input type="date" id="checkIn" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline search-input" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="checkOut" className="block text-gray-700 text-sm font-bold mb-2">Check-out (YYYY-MM-DD):</label>
              <input type="date" id="checkOut" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline search-input" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} required />
            </div>
            <div className="md:col-span-2 flex justify-center mt-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md btn-primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : (editingHotel ? 'Update Hotel' : 'Add Hotel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && !showAddForm && (
        <div className="text-center mt-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mx-auto"></div>
          <p className="text-blue-500 text-lg mt-3">Loading hotels...</p>
        </div>
      )}

      {error && (
        <div className="text-center p-4 bg-red-100 text-red-700 rounded-lg">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && hotels.length === 0 && (
        <p className="text-center text-gray-600 text-lg mt-8">No hotels added yet. Use the "Add New Hotel" button to get started.</p>
      )}

      {!loading && !error && hotels.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Image</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Name</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Location</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Rating</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Price/Night</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Rooms Avail.</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Type</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {hotels.map(hotel => (
                <tr key={hotel._id} className="hover:bg-gray-50">
                  <td className="py-4 px-6 whitespace-nowrap">
                    <img
                      // Prepend backend URL for locally served static files
                      src={hotel.imageUrl ? import.meta.env.VITE_BACKEND_API_URL.replace('/api', '') + hotel.imageUrl : 'https://placehold.co/100x60/CCCCCC/666666?text=Hotel'}
                      alt="Hotel"
                      className="w-16 h-10 object-cover rounded-md"
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x60/CCCCCC/666666?text=Hotel'; }}
                    />
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">{hotel.name}</td>
                  <td className="py-4 px-6 whitespace-nowrap">{hotel.location}</td>
                  <td className="py-4 px-6 whitespace-nowrap">{hotel.rating.toFixed(1)}</td>
                  <td className="py-4 px-6 whitespace-nowrap">Rs. {hotel.pricePerNight.toFixed(2)}</td>
                  <td className="py-4 px-6 whitespace-nowrap">{hotel.roomsAvailable}</td>
                  <td className="py-4 px-6 whitespace-nowrap">{hotel.type}</td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <button
                      className="text-blue-600 hover:text-blue-900 mr-4 material-icons"
                      onClick={() => handleEditClick(hotel)}
                      title="Edit"
                      disabled={loading}
                    >
                      edit
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900 material-icons"
                      onClick={() => handleDeleteHotel(hotel._id)}
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
        </div>
      )}
    </section>
  );
};

export default AdminHotels;
