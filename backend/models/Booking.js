const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User', // Reference to the User model
    },
    // itemType determines which model to reference (Bus or Hotel)
    itemType: {
        type: String,
        required: true,
        enum: ['bus', 'hotel'], // Ensure only these values are allowed
    },
    // itemId will store the ObjectId of either a Bus or a Hotel document
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        // The 'refPath' tells Mongoose to look at the 'itemType' field
        // in the current document to determine which model to use for population.
        refPath: 'itemType', // <-- This is the key for dynamic population
    },
    ticketNumber: {
        type: String,
        required: true,
        unique: true,
    },
    price: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        required: true,
        default: 'Confirmed',
        enum: ['Confirmed', 'Cancelled'], // Possible statuses
    },
    // --- Bus specific fields ---
    seatNumber: {
        type: Number,
        required: function() { return this.itemType === 'bus'; }, // Required only if itemType is 'bus'
    },
    passengerName: {
        type: String,
        required: function() { return this.itemType === 'bus'; }, // Required only if itemType is 'bus'
    },
    // --- Hotel specific fields ---
    leadGuestName: {
        type: String,
        required: function() { return this.itemType === 'hotel'; }, // Required only if itemType is 'hotel'
    },
    numGuests: {
        type: Number,
        required: function() { return this.itemType === 'hotel'; }, // Required only if itemType is 'hotel'
        min: 1,
    },
    checkInDate: {
        type: String, // YYYY-MM-DD
        required: function() { return this.itemType === 'hotel'; }, // Required only if itemType is 'hotel'
    },
    checkOutDate: {
        type: String, // YYYY-MM-DD
        required: function() { return this.itemType === 'hotel'; }, // Required only if itemType is 'hotel'
    },
}, {
    timestamps: true, // Adds createdAt and updatedAt fields
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
