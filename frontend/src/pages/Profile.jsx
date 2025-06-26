import React, { useState, useEffect, useRef } from 'react';
import axios from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = ({ showCustomModal }) => {
    const { isAuthenticated, user, login } = useAuth(); // Destructure 'login' from useAuth
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);

    // State for editable fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [currentAvatarUrl, setCurrentAvatarUrl] = useState(''); // Stores the URL from DB or after successful upload
    
    // States for new image upload
    const [newAvatarFile, setNewAvatarFile] = useState(null);
    const [previewAvatarUrl, setPreviewAvatarUrl] = useState(''); // For immediate preview in UI
    const fileInputRef = useRef(null); // Ref to trigger file input click

    // Helper to construct full image URL from backend relative path
    const getFullImageUrl = (relativePath) => {
        if (!relativePath) return 'https://placehold.co/120x120/4a90e2/FFFFFF?text=User'; // Default placeholder
        // Check if it's already a full URL (e.g., placehold.co or external service)
        if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
            return relativePath;
        }
        // Otherwise, prepend backend base URL, removing the '/api' part
        const baseUrl = import.meta.env.VITE_BACKEND_API_URL.replace('/api', '');
        return `${baseUrl}${relativePath}`;
    };

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/home');
            return;
        }
        // If user data is available in context, initialize state.
        // Otherwise, fetch it.
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
            setPhone(user.phone || '');
            setCurrentAvatarUrl(user.avatarUrl || ''); // Initialize with user's current avatar
            setPreviewAvatarUrl(getFullImageUrl(user.avatarUrl || '')); // Set initial preview
            setLoading(false);
        } else {
            fetchUserProfile(); // Fallback to fetch if user is null on initial load
        }
    }, [isAuthenticated, user, navigate, showCustomModal]);

    // Cleanup for preview URL when exiting edit mode
    useEffect(() => {
        if (!isEditMode && newAvatarFile) {
            setNewAvatarFile(null);
            setPreviewAvatarUrl(getFullImageUrl(currentAvatarUrl)); // Revert preview to current avatar
        }
    }, [isEditMode, newAvatarFile, currentAvatarUrl]);


    const fetchUserProfile = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('/user/profile');
            const fetchedUser = response.data;
            if (fetchedUser) {
                // When fetching, ensure to merge with current user token from context/localStorage if available
                // This is important because the /user/profile endpoint does not return the token.
                const userWithToken = { ...fetchedUser, token: user?.token || JSON.parse(localStorage.getItem('user'))?.token };
                login(userWithToken); // Use login to update user in AuthContext
                setName(fetchedUser.name || '');
                setEmail(fetchedUser.email || '');
                setPhone(fetchedUser.phone || '');
                setCurrentAvatarUrl(fetchedUser.avatarUrl || '');
                setPreviewAvatarUrl(getFullImageUrl(fetchedUser.avatarUrl || ''));
            } else {
                setError('Failed to load user profile.');
            }
        } catch (err) {
            console.error('Error fetching user profile:', err);
            setError(err.response?.data?.message || 'Failed to fetch profile.');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setNewAvatarFile(file);
            setPreviewAvatarUrl(URL.createObjectURL(file)); // Create URL for immediate preview
        } else {
            setNewAvatarFile(null);
            setPreviewAvatarUrl(getFullImageUrl(currentAvatarUrl)); // Revert to current or default
        }
    };

    const handleUpdateProfile = async () => {
        setLoading(true);
        setError(null);
        let finalAvatarUrl = currentAvatarUrl;

        try {
            // Basic validation
            if (!name || !email || !phone) {
                showCustomModal('Validation Error', 'Name, Email, and Phone are required.');
                setLoading(false);
                return;
            }

            // 1. Upload new avatar image if selected
            if (newAvatarFile) {
                const formData = new FormData();
                formData.append('profileImage', newAvatarFile); // 'profileImage' must match backend field name

                const uploadResponse = await axios.post('/upload/profile-image', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                finalAvatarUrl = uploadResponse.data.filePath;
                showCustomModal('Image Uploaded', 'New avatar image uploaded successfully!');
            } else if (currentAvatarUrl && previewAvatarUrl === 'https://placehold.co/120x120/4a90e2/FFFFFF?text=User') {
                 // If user had a custom image but then "cleared" it by showing placeholder,
                 // set avatarUrl to empty string in DB (or specific placeholder depending on backend)
                 finalAvatarUrl = ''; // Clear avatar URL if the user explicitly makes it a placeholder
            }


            // 2. Update user profile with potentially new avatar URL
            const updatePayload = {
                name,
                email,
                phone,
                avatarUrl: finalAvatarUrl
            };

            const response = await axios.put('/user/profile', updatePayload);

            const updatedUserResponseData = response.data;

            // CRITICAL FIX: Merge the updated user data with the existing token
            // The /user/profile PUT endpoint doesn't return the token, so we must re-add it.
            const userWithToken = { ...updatedUserResponseData, token: user.token };
            
            login(userWithToken); // Use 'login' to update user data in AuthContext and localStorage
            setCurrentAvatarUrl(updatedUserResponseData.avatarUrl || '');
            setPreviewAvatarUrl(getFullImageUrl(updatedUserResponseData.avatarUrl || ''));
            showCustomModal('Success', updatedUserResponseData.message || 'Profile updated successfully!');
            setIsEditMode(false);

        } catch (err) {
            console.error('Full Error Object:', err);
            console.error('Error Response:', err.response);
            console.error('Error Message:', err.message);
            setError(err.response?.data?.message || 'Failed to update profile.');
            showCustomModal('Error', err.response?.data?.message || 'Failed to update profile. Please check your network and try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelEdit = () => {
        // Revert changes to original user data from context
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
            setPhone(user.phone || '');
            setCurrentAvatarUrl(user.avatarUrl || '');
            setPreviewAvatarUrl(getFullImageUrl(user.avatarUrl || ''));
            setNewAvatarFile(null);
        }
        setIsEditMode(false);
    };

    if (!isAuthenticated) {
        return (
            <section id="profile-page-content" className="page-content container mx-auto px-4 py-12 bg-white rounded-xl shadow-2xl mb-16 border border-gray-100">
                <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center flex items-center justify-center">
                    <span className="material-icons text-3xl mr-3 text-blue-600">person</span>Your Profile
                </h2>
                <div className="p-8 text-gray-700 text-center text-lg">
                    <p className="mb-6">Please log in to view your profile.</p>
                </div>
            </section>
        );
    }

    if (loading) {
        return (
            <section id="profile-page-content" className="page-content container mx-auto px-4 py-12 bg-white rounded-xl shadow-2xl mb-16 border border-gray-100">
                <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center flex items-center justify-center">
                    <span className="material-icons text-3xl mr-3 text-blue-600">person</span>Your Profile
                </h2>
                <div className="text-center mt-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mx-auto"></div>
                    <p className="text-blue-500 text-lg mt-3">Loading profile...</p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section id="profile-page-content" className="page-content container mx-auto px-4 py-12 bg-white rounded-xl shadow-2xl mb-16 border border-gray-100">
                <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center flex items-center justify-center">
                    <span className="material-icons text-3xl mr-3 text-blue-600">person</span>Your Profile
                </h2>
                <div className="text-center p-4 bg-red-100 text-red-700 rounded-lg">
                    <p>{error}</p>
                </div>
            </section>
        );
    }

    return (
        <section id="profile-page-content" className="page-content container mx-auto px-4 py-12 bg-white rounded-xl shadow-2xl mb-16 border border-gray-100">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center flex items-center justify-center">
                <span className="material-icons text-3xl mr-3 text-blue-600">person</span>Your Profile
            </h2>

            <div className="max-w-md mx-auto bg-gray-50 p-8 rounded-lg shadow-md border border-gray-200">
                <div className="flex flex-col items-center mb-6">
                    <img
                        src={previewAvatarUrl || getFullImageUrl(currentAvatarUrl)}
                        alt="User Avatar"
                        className="w-32 h-32 rounded-full object-cover border-4 border-blue-400 shadow-lg mb-4"
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/120x120/4a90e2/FFFFFF?text=User'; }}
                    />
                    <h3 className="text-2xl font-bold text-gray-800">{user?.name}</h3>
                    <p className="text-md text-gray-600">Balance: <span className="font-semibold text-green-600">Rs. {user?.walletBalance?.toFixed(2) || '0.00'}</span></p>
                </div>

                {!isEditMode ? (
                    <div className="space-y-4">
                        <div className="flex items-center text-gray-700">
                            <span className="material-icons mr-3 text-blue-500">email</span>
                            <p className="font-medium">Email: <span className="font-normal">{user?.email}</span></p>
                        </div>
                        <div className="flex items-center text-gray-700">
                            <span className="material-icons mr-3 text-blue-500">phone</span>
                            <p className="font-medium">Phone: <span className="font-normal">{user?.phone || 'N/A'}</span></p>
                        </div>
                        <button
                            onClick={() => setIsEditMode(true)}
                            className="w-full mt-6 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors shadow-md flex items-center justify-center"
                            disabled={loading}
                        >
                            <span className="material-icons mr-2">edit</span>Edit Profile
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name-input" className="block text-gray-700 text-sm font-bold mb-2">Name:</label>
                            <input
                                type="text"
                                id="name-input"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="email-input" className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
                            <input
                                type="email"
                                id="email-input"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="phone-input" className="block text-gray-700 text-sm font-bold mb-2">Phone:</label>
                            <input
                                type="tel"
                                id="phone-input"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                            />
                        </div>
                        {/* File Input for Avatar */}
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Upload New Avatar:</label>
                            <input
                                type="file"
                                id="avatar-file-input"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                                ref={fileInputRef}
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current.click()}
                                className="w-full bg-blue-400 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-500 transition-colors shadow-md flex items-center justify-center"
                            >
                                <span className="material-icons mr-2">upload</span>Choose Image
                            </button>
                            <p className="text-sm text-gray-500 mt-2">
                                {newAvatarFile ? `Selected: ${newAvatarFile.name}` : 'No new image selected. Current image will be kept.'}
                            </p>
                        </div>

                        <div className="flex justify-between mt-6 space-x-4">
                            <button
                                onClick={handleUpdateProfile}
                                className="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors shadow-md flex items-center justify-center"
                                disabled={loading}
                            >
                                <span className="material-icons mr-2">save</span>Save Changes
                            </button>
                            <button
                                onClick={handleCancelEdit}
                                className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors shadow-md flex items-center justify-center"
                                disabled={loading}
                            >
                                <span className="material-icons mr-2">cancel</span>Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Profile;
