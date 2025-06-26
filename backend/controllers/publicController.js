const Bus = require('../models/Bus');
const Hotel = require('../models/Hotel');

// @desc    Get all buses (public)
// @route   GET /api/public/buses
// @access  Public
const getAllBuses = async (req, res) => {
    try {
        // Implement search/filter logic if needed (e.g., from, to, date)
        const { from, to, date } = req.query;
        let query = {};

        if (from) query.from = { $regex: from, $options: 'i' }; // Case-insensitive search
        if (to) query.to = { $regex: to, $options: 'i' };
        if (date) query.date = date; // Exact date match

        const buses = await Bus.find(query);
        res.json(buses);
    } catch (error) {
        console.error('Error fetching all buses:', error);
        res.status(500).json({ message: 'Server error while fetching buses' });
    }
};

// @desc    Get single bus by ID (public)
// @route   GET /api/public/buses/:id
// @access  Public
const getBusByIdPublic = async (req, res) => {
    try {
        const bus = await Bus.findById(req.params.id);
        if (bus) {
            res.json(bus);
        } else {
            res.status(404).json({ message: 'Bus not found' });
        }
    } catch (error) {
        console.error('Error fetching public bus by ID:', error);
        res.status(500).json({ message: 'Server error while fetching bus' });
    }
};

// @desc    Get all hotels (public)
// @route   GET /api/public/hotels
// @access  Public
const getAllHotels = async (req, res) => {
    try {
        // Implement search/filter logic if needed (e.g., location, checkIn, checkOut)
        const { location, checkIn } = req.query;
        let query = {};

        if (location) query.location = { $regex: location, $options: 'i' };
        // For date, we check if the requested checkIn date falls within the hotel's available checkIn/checkOut range
        if (checkIn) {
            query.checkIn = { $lte: checkIn }; // Requested checkIn must be on or after hotel's checkIn
            query.checkOut = { $gte: checkIn }; // Requested checkIn must be on or before hotel's checkOut
        }

        const hotels = await Hotel.find(query);
        res.json(hotels);
    } catch (error) {
        console.error('Error fetching all hotels:', error);
        res.status(500).json({ message: 'Server error while fetching hotels' });
    }
};

// @desc    Get single hotel by ID (public)
// @route   GET /api/public/hotels/:id
// @access  Public
const getHotelByIdPublic = async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.id);
        if (hotel) {
            res.json(hotel);
        } else {
            res.status(404).json({ message: 'Hotel not found' });
        }
    } catch (error) {
        console.error('Error fetching public hotel by ID:', error);
        res.status(500).json({ message: 'Server error while fetching hotel' });
    }
};

module.exports = { getAllBuses, getAllHotels, getBusByIdPublic, getHotelByIdPublic };
