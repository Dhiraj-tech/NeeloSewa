const Bus = require('../models/Bus');
const Hotel = require('../models/Hotel');
const User = require('../models/User');

// --- Bus Management ---

// @desc    Add a new bus
// @route   POST /api/admin/buses
// @access  Private/Admin
const addBus = async (req, res) => {
    // Extract text fields from req.body
    const { operator, from, to, date, time, arrival, price, totalSeats, busType, amenities } = req.body;

    // Get file paths from req.files (populated by Multer)
    const mainImageUrl = req.files && req.files['mainImage'] ? `/uploads/images/${req.files['mainImage'][0].filename}` : undefined;
    const galleryImages = req.files && req.files['galleryImages'] ? req.files['galleryImages'].map(file => `/uploads/images/${file.filename}`) : undefined;

    if (!operator || !from || !to || !date || !time || !arrival || !price || !totalSeats || !busType) {
        return res.status(400).json({ message: 'Please fill all required fields for bus' });
    }

    try {
        const bus = new Bus({
            operator,
            from,
            to,
            date,
            time,
            arrival,
            price: parseFloat(price), // Ensure price is parsed
            totalSeats: parseInt(totalSeats), // Ensure totalSeats is parsed
            filledSeats: 0,
            busType,
            amenities: amenities ? amenities.split(',').map(a => a.trim()).filter(Boolean) : [],
            mainImageUrl,
            galleryImages,
        });

        const createdBus = await bus.save();
        res.status(201).json(createdBus);
    } catch (error) {
        console.error('Error adding bus:', error);
        res.status(500).json({ message: 'Server error while adding bus' });
    }
};

// @desc    Update bus details
// @route   PUT /api/admin/buses/:id
// @access  Private/Admin
const updateBus = async (req, res) => {
    const { id } = req.params;
    const { operator, from, to, date, time, arrival, price, totalSeats, filledSeats, busType, amenities } = req.body;

    // Get file paths from req.files (populated by Multer)
    const mainImageUrl = req.files && req.files['mainImage'] ? `/uploads/images/${req.files['mainImage'][0].filename}` : undefined;
    const galleryImages = req.files && req.files['galleryImages'] ? req.files['galleryImages'].map(file => `/uploads/images/${file.filename}`) : undefined;

    try {
        const bus = await Bus.findById(id);

        if (bus) {
            bus.operator = operator || bus.operator;
            bus.from = from || bus.from;
            bus.to = to || bus.to;
            bus.date = date || bus.date;
            bus.time = time || bus.time;
            bus.arrival = arrival || bus.arrival;
            bus.price = price !== undefined ? parseFloat(price) : bus.price;
            bus.totalSeats = totalSeats !== undefined ? parseInt(totalSeats) : bus.totalSeats;
            bus.filledSeats = filledSeats !== undefined ? parseInt(filledSeats) : bus.filledSeats;
            bus.busType = busType || bus.busType;
            bus.amenities = amenities !== undefined ? amenities.split(',').map(a => a.trim()).filter(Boolean) : bus.amenities;

            // Update image URLs only if new files were uploaded
            if (mainImageUrl) {
                bus.mainImageUrl = mainImageUrl;
            }
            if (galleryImages) {
                bus.galleryImages = galleryImages;
            }

            const updatedBus = await bus.save();
            res.json(updatedBus);
        } else {
            res.status(404).json({ message: 'Bus not found' });
        }
    } catch (error) {
        console.error('Error updating bus:', error);
        res.status(500).json({ message: 'Server error while updating bus' });
    }
};

// @desc    Delete a bus
// @route   DELETE /api/admin/buses/:id
// @access  Private/Admin
const deleteBus = async (req, res) => {
    const { id } = req.params;

    try {
        const bus = await Bus.findByIdAndDelete(id);

        if (bus) {
            // Optional: Delete associated image files from disk
            // This is more complex and requires careful error handling.
            // For simplicity, we are skipping file deletion on disk for now.
            res.json({ message: 'Bus removed' });
        } else {
            res.status(404).json({ message: 'Bus not found' });
        }
    } catch (error) {
        console.error('Error deleting bus:', error);
        res.status(500).json({ message: 'Server error while deleting bus' });
    }
};

// @desc    Get bus by ID
// @route   GET /api/admin/buses/:id
// @access  Private/Admin (can be used by admin for specific bus management)
const getBusById = async (req, res) => {
    try {
        const bus = await Bus.findById(req.params.id);
        if (bus) {
            res.json(bus);
        } else {
            res.status(404).json({ message: 'Bus not found' });
        }
    } catch (error) {
        console.error('Error fetching bus by ID:', error);
        res.status(500).json({ message: 'Server error while fetching bus' });
    }
};

// --- Hotel Management ---

// @desc    Add a new hotel
// @route   POST /api/admin/hotels
// @access  Private/Admin
const addHotel = async (req, res) => {
    const { name, location, rating, pricePerNight, roomsAvailable, type, amenities, checkIn, checkOut } = req.body;

    const imageUrl = req.files && req.files['mainImage'] ? `/uploads/images/${req.files['mainImage'][0].filename}` : undefined;
    const galleryImages = req.files && req.files['galleryImages'] ? req.files['galleryImages'].map(file => `/uploads/images/${file.filename}`) : undefined;

    if (!name || !location || !rating || !pricePerNight || !roomsAvailable || !type || !checkIn || !checkOut) {
        return res.status(400).json({ message: 'Please fill all required fields for hotel' });
    }

    try {
        const hotel = new Hotel({
            name,
            location,
            rating: parseFloat(rating),
            pricePerNight: parseFloat(pricePerNight),
            roomsAvailable: parseInt(roomsAvailable),
            type,
            imageUrl, // Main image
            amenities: amenities ? amenities.split(',').map(a => a.trim()).filter(Boolean) : [],
            checkIn,
            checkOut,
            galleryImages, // Gallery images
        });

        const createdHotel = await hotel.save();
        res.status(201).json(createdHotel);
    } catch (error) {
        console.error('Error adding hotel:', error);
        res.status(500).json({ message: 'Server error while adding hotel' });
    }
};

// @desc    Update hotel details
// @route   PUT /api/admin/hotels/:id
// @access  Private/Admin
const updateHotel = async (req, res) => {
    const { id } = req.params;
    const { name, location, rating, pricePerNight, roomsAvailable, type, amenities, checkIn, checkOut } = req.body;

    const imageUrl = req.files && req.files['mainImage'] ? `/uploads/images/${req.files['mainImage'][0].filename}` : undefined;
    const galleryImages = req.files && req.files['galleryImages'] ? req.files['galleryImages'].map(file => `/uploads/images/${file.filename}`) : undefined;

    try {
        const hotel = await Hotel.findById(id);

        if (hotel) {
            hotel.name = name || hotel.name;
            hotel.location = location || hotel.location;
            hotel.rating = rating !== undefined ? parseFloat(rating) : hotel.rating;
            hotel.pricePerNight = pricePerNight !== undefined ? parseFloat(pricePerNight) : hotel.pricePerNight;
            hotel.roomsAvailable = roomsAvailable !== undefined ? parseInt(roomsAvailable) : hotel.roomsAvailable;
            hotel.type = type || hotel.type;
            hotel.amenities = amenities !== undefined ? amenities.split(',').map(a => a.trim()).filter(Boolean) : hotel.amenities;
            hotel.checkIn = checkIn || hotel.checkIn;
            hotel.checkOut = checkOut || hotel.checkOut;

            if (imageUrl) {
                hotel.imageUrl = imageUrl;
            }
            if (galleryImages) {
                hotel.galleryImages = galleryImages;
            }

            const updatedHotel = await hotel.save();
            res.json(updatedHotel);
        } else {
            res.status(404).json({ message: 'Hotel not found' });
        }
    } catch (error) {
        console.error('Error updating hotel:', error);
        res.status(500).json({ message: 'Server error while updating hotel' });
    }
};

// @desc    Delete a hotel
// @route   DELETE /api/admin/hotels/:id
// @access  Private/Admin
const deleteHotel = async (req, res) => {
    const { id } = req.params;

    try {
        const hotel = await Hotel.findByIdAndDelete(id);

        if (hotel) {
            // Optional: Delete associated image files from disk
            res.json({ message: 'Hotel removed' });
        } else {
            res.status(404).json({ message: 'Hotel not found' });
        }
    } catch (error) {
        console.error('Error deleting hotel:', error);
        res.status(500).json({ message: 'Server error while deleting hotel' });
    }
};

// @desc    Get hotel by ID
// @route   GET /api/admin/hotels/:id
// @access  Private/Admin (can be used by admin for specific hotel management)
const getHotelById = async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.id);
        if (hotel) {
            res.json(hotel);
        } else {
            res.status(404).json({ message: 'Hotel not found' });
        }
    } catch (error) {
        console.error('Error fetching hotel by ID:', error);
        res.status(500).json({ message: 'Server error while fetching hotel' });
    }
};

// --- User Management (for Admin) ---

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password'); // Don't return passwords
        res.json(users);
    } catch (error) {
        console.error('Error fetching all users:', error);
        res.status(500).json({ message: 'Server error fetching users' });
    }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['user', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role provided. Must be "user" or "admin".' });
    }

    try {
        const user = await User.findById(id);

        if (user) {
            user.role = role;
            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                message: `User role updated to ${updatedUser.role}`
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({ message: 'Server error updating user role' });
    }
};

module.exports = {
    addBus,
    updateBus,
    deleteBus,
    getBusById,
    addHotel,
    updateHotel,
    deleteHotel,
    getHotelById,
    getAllUsers,
    updateUserRole
};
