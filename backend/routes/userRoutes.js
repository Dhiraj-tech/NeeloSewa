const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getProfile,
    updateProfile,
    addMoneyToWallet,
    getUserTransactions,
    bookBus,
    bookHotel,
    getUserBookings,
    cancelBooking,
    getBookingDetailsByTicketNumber // For tracking
} = require('../controllers/userController');

// User Profile
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

// Wallet
router.post('/wallet/add', protect, addMoneyToWallet);
router.get('/wallet/transactions', protect, getUserTransactions);

// Bookings (Trips)
router.post('/bookings/bus', protect, bookBus);
router.post('/bookings/hotel', protect, bookHotel);
router.get('/bookings', protect, getUserBookings);
router.put('/bookings/:id/cancel', protect, cancelBooking);

// Tracking (can be public or protected, for this example we assume it's publicly trackable by ticket number)
// NOTE: Depending on security requirements, this could be protected, or limited to specific user's tickets.
// For now, allow public access via ticket number.
router.get('/tracking/:ticketNumber', getBookingDetailsByTicketNumber);

module.exports = router;