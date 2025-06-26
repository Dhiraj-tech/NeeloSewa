const mongoose = require('mongoose');

const busSchema = mongoose.Schema({
    operator: {
        type: String,
        required: true,
    },
    from: {
        type: String,
        required: true,
    },
    to: {
        type: String,
        required: true,
    },
    date: {
        type: String, // Stored as YYYY-MM-DD string for simplicity as per HTML mock
        required: true,
    },
    time: {
        type: String,
        required: true,
    },
    arrival: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    totalSeats: {
        type: Number,
        required: true,
    },
    filledSeats: {
        type: Number,
        default: 0,
    },
    busType: {
        type: String,
        required: true,
    },
    amenities: {
        type: [String], // Array of strings
        default: [],
    },
    // New fields for images
    mainImageUrl: { // Main image for listings
        type: String,
        default: 'https://placehold.co/400x250/4a90e2/FFFFFF?text=Bus', // Default placeholder
    },
    galleryImages: { // Multiple images for detail view
        type: [String],
        default: [],
    },
}, {
    timestamps: true,
});

const Bus = mongoose.model('Bus', busSchema);
module.exports = Bus;
