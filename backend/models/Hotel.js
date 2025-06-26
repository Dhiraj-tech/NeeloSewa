const mongoose = require('mongoose');

const hotelSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    pricePerNight: {
        type: Number,
        required: true,
    },
    roomsAvailable: {
        type: Number,
        required: true,
    },
    type: {
        type: String, // e.g., Luxury Hotel, Resort, Jungle Lodge
        required: true,
    },
    imageUrl: { // Main image for listings (already exists)
        type: String,
        default: 'https://placehold.co/300x200/CCCCCC/666666?text=Hotel',
    },
    amenities: {
        type: [String], // Array of strings
        default: [],
    },
    checkIn: {
        type: String, // Stored as YYYY-MM-DD string
        required: true,
    },
    checkOut: {
        type: String, // Stored as YYYY-MM-DD string
        required: true,
    },
    // New field for multiple images
    galleryImages: { // Multiple images for detail view
        type: [String],
        default: [],
    },
}, {
    timestamps: true,
});

const Hotel = mongoose.model('Hotel', hotelSchema);
module.exports = Hotel;
