const User = require('../models/User');
const Booking = require('../models/Booking');
const Transaction = require('../models/Transaction');
const Bus = require('../models/Bus');
const Hotel = require('../models/Hotel');

// Utility to generate unique ticket number
function generateTicketNumber(type) {
    const now = new Date();
    const datePart = now.getFullYear().toString() +
        (now.getMonth() + 1).toString().padStart(2, '0') +
        now.getDate().toString().padStart(2, '0');
    const randomPart = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
    return `${type}-${datePart}-${randomPart}`;
}

// --- User Profile ---

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
const getProfile = async (req, res) => {
    try {
        // req.user is set by the protect middleware (contains user ID)
        const user = await User.findById(req.user).select('-password'); // Exclude password
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server error fetching profile' });
    }
};

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user); // Get user by ID from authenticated request

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.phone = req.body.phone || user.phone;
            user.avatarUrl = req.body.avatarUrl || user.avatarUrl;

            // If password is provided, hash and update it
            if (req.body.password) {
                user.password = req.body.password; // pre-save hook in User model will hash it
            }

            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                avatarUrl: updatedUser.avatarUrl,
                role: updatedUser.role,
                walletBalance: updatedUser.walletBalance,
                message: 'Profile updated successfully'
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Server error updating profile' });
    }
};

// --- Wallet Management ---

// @desc    Add money to user's wallet
// @route   POST /api/user/wallet/add
// @access  Private
const addMoneyToWallet = async (req, res) => {
    const { amount } = req.body;

    if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: 'Please provide a valid positive amount' });
    }

    try {
        const user = await User.findById(req.user);
        if (user) {
            user.walletBalance += amount;
            await user.save();

            const transaction = new Transaction({
                user: req.user,
                type: 'credit',
                amount,
                description: `Wallet Top-up`
            });
            await transaction.save();

            res.json({
                message: `Successfully added Rs. ${amount.toFixed(2)} to wallet.`,
                newBalance: user.walletBalance.toFixed(2)
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error adding money to wallet:', error);
        res.status(500).json({ message: 'Server error adding money to wallet' });
    }
};

// @desc    Get user's transaction history
// @route   GET /api/user/wallet/transactions
// @access  Private
const getUserTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user }).sort({ createdAt: -1 }); // Latest first
        res.json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: 'Server error fetching transactions' });
    }
};

// --- Booking Management (Trips) ---

// @desc    Book a bus ticket
// @route   POST /api/user/bookings/bus
// @access  Private
const bookBus = async (req, res) => {
    const { busId, seatNumber, passengerName } = req.body;

    console.log('Book Bus Request Received:', { userId: req.user, busId, seatNumber, passengerName }); // DEBUG

    if (!busId || !seatNumber || !passengerName) {
        console.log('Validation Error: Missing bus booking details'); // DEBUG
        return res.status(400).json({ message: 'Missing bus booking details' });
    }

    let user;
    let bus;
    try {
        user = await User.findById(req.user);
        bus = await Bus.findById(busId);

        if (!user) {
            console.log('Error: User not found for ID:', req.user); // DEBUG
            return res.status(404).json({ message: 'User not found' });
        }
        if (!bus) {
            console.log('Error: Bus not found for ID:', busId); // DEBUG
            return res.status(404).json({ message: 'Bus not found' });
        }

        if (bus.filledSeats >= bus.totalSeats) {
            console.log('Error: Bus is fully booked'); // DEBUG
            return res.status(400).json({ message: 'Bus is fully booked' });
        }

        if (user.walletBalance < bus.price) {
            console.log('Error: Insufficient funds. User balance:', user.walletBalance, 'Bus price:', bus.price); // DEBUG
            return res.status(400).json({ message: `Insufficient funds. Need Rs. ${(bus.price - user.walletBalance).toFixed(2)} more.` });
        }

        // Check if this seat is already booked for this bus
        const existingBooking = await Booking.findOne({
            itemType: 'bus',
            itemId: busId,
            seatNumber: seatNumber,
            status: 'Confirmed'
        });

        if (existingBooking) {
            console.log('Error: Seat already booked. Existing booking:', existingBooking); // DEBUG
            return res.status(400).json({ message: `Seat ${seatNumber} is already booked for this bus.` });
        }

        // --- All checks passed, proceed with transaction ---
        console.log('Proceeding with bus booking...'); // DEBUG
        user.walletBalance -= bus.price;
        bus.filledSeats += 1;

        const ticketNumber = generateTicketNumber('BUS');
        const booking = new Booking({
            user: req.user,
            itemType: 'bus',
            itemId: busId,
            ticketNumber,
            price: bus.price,
            seatNumber,
            passengerName,
            status: 'Confirmed',
        });

        const transaction = new Transaction({
            user: req.user,
            type: 'debit',
            amount: bus.price,
            description: `Bus ticket: ${bus.from} to ${bus.to} (Seat: ${seatNumber})`
        });

        // Save all changes
        await user.save();
        console.log('User saved:', user); // DEBUG
        await bus.save();
        console.log('Bus saved:', bus); // DEBUG
        await booking.save();
        console.log('Booking saved:', booking); // DEBUG
        await transaction.save();
        console.log('Transaction saved:', transaction); // DEBUG

        res.status(201).json({
            message: 'Bus ticket booked successfully!',
            ticketNumber: booking.ticketNumber,
            newBalance: user.walletBalance.toFixed(2)
        });

    } catch (error) {
        console.error('Final Catch Block Error during bus booking:', error); // DEBUG
        res.status(500).json({ message: 'Server error booking bus' });
    }
};

// @desc    Book a hotel room
// @route   POST /api/user/bookings/hotel
// @access  Private
const bookHotel = async (req, res) => {
    const { hotelId, leadGuestName, numGuests, checkInDate, checkOutDate } = req.body;

    if (!hotelId || !leadGuestName || !numGuests || !checkInDate || !checkOutDate) {
        return res.status(400).json({ message: 'Missing hotel booking details' });
    }

    let user;
    let hotel;
    let totalPrice;

    try {
        user = await User.findById(req.user);
        hotel = await Hotel.findById(hotelId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }

        if (hotel.roomsAvailable <= 0) {
            return res.status(400).json({ message: 'No rooms available at this hotel' });
        }

        // Calculate nights and total price
        const start = new Date(checkInDate);
        const end = new Date(checkOutDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        totalPrice = hotel.pricePerNight * Math.max(1, diffDays);

        if (user.walletBalance < totalPrice) {
            return res.status(400).json({ message: `Insufficient funds. Need Rs. ${(totalPrice - user.walletBalance).toFixed(2)} more.` });
        }

        // For simplicity, we assume one booking reduces one room.
        // More advanced logic would check if rooms are available for specific dates.
        if (hotel.roomsAvailable < 1) { // If it was 0, it would have been caught earlier.
            return res.status(400).json({ message: 'Not enough rooms available for your booking.' });
        }

        // --- All checks passed, proceed with transaction ---
        user.walletBalance -= totalPrice;
        hotel.roomsAvailable -= 1;

        const ticketNumber = generateTicketNumber('HOTEL');
        const booking = new Booking({
            user: req.user,
            itemType: 'hotel',
            itemId: hotelId,
            ticketNumber,
            price: totalPrice,
            leadGuestName,
            numGuests,
            checkInDate,
            checkOutDate,
            status: 'Confirmed',
        });

        const transaction = new Transaction({
            user: req.user,
            type: 'debit',
            amount: totalPrice,
            description: `Hotel booking: ${hotel.name} (${checkInDate} to ${checkOutDate})`
        });

        // Save all changes
        await user.save();
        await hotel.save();
        await booking.save();
        await transaction.save();

        res.status(201).json({
            message: 'Hotel room booked successfully!',
            ticketNumber: booking.ticketNumber,
            newBalance: user.walletBalance.toFixed(2)
        });

    } catch (error) {
        console.error('Error booking hotel:', error);
        res.status(500).json({ message: 'Server error booking hotel' });
    }
};

// @desc    Get all user's bookings (trips)
// @route   GET /api/user/bookings
// @access  Private
const getUserBookings = async (req, res) => {
    try {
        console.log('Fetching bookings for user:', req.user); // DEBUG

        const query = { user: req.user };
        // Add status filter if provided
        if (req.query.status) {
            query.status = req.query.status;
            console.log('Filtering bookings by status:', req.query.status); // New debug log
        }

        // 1. Fetch all booking documents WITHOUT population
        const rawBookings = await Booking.find(query) // Use the filtered query
            .sort({ createdAt: -1 })
            .lean(); // Keep it lean for efficiency

        console.log('Raw bookings BEFORE manual population:', rawBookings); // NEW DEBUG LOG

        // 2. Collect all unique Bus and Hotel ObjectIds
        const busIds = rawBookings
            .filter(b => b.itemType === 'bus' && b.itemId)
            .map(b => b.itemId);
        const hotelIds = rawBookings
            .filter(b => b.itemType === 'hotel' && b.itemId)
            .map(b => b.itemId);

        // 3. Fetch all related Bus and Hotel documents separately
        const buses = await Bus.find({ _id: { $in: busIds } }).lean();
        const hotels = await Hotel.find({ _id: { $in: hotelIds } }).lean();

        // Convert arrays to maps for quick lookup by ID
        const busMap = new Map(buses.map(bus => [bus._id.toString(), bus]));
        const hotelMap = new Map(hotels.map(hotel => [hotel._id.toString(), hotel]));

        console.log('Fetched Buses (for manual pop):', buses); // NEW DEBUG LOG
        console.log('Fetched Hotels (for manual pop):', hotels); // NEW DEBUG LOG
        console.log('Bus Map (for manual pop):', busMap);     // NEW DEBUG LOG
        console.log('Hotel Map (for manual pop):', hotelMap); // NEW DEBUG LOG


        // 4. Manually populate and format the bookings
        const formattedBookings = rawBookings.map(booking => {
            console.log('Processing raw booking (inside map for manual pop):', booking); // NEW DEBUG LOG

            let populatedItem = null;
            if (booking.itemType === 'bus' && booking.itemId) {
                populatedItem = busMap.get(booking.itemId.toString());
            } else if (booking.itemType === 'hotel' && booking.itemId) {
                populatedItem = hotelMap.get(booking.itemId.toString());
            }

            if (!populatedItem) {
                // If item not found after manual population, skip
                console.warn(`Booking found with unresolvable itemId (${booking.itemId}) for itemType ${booking.itemType}, skipping:`, booking._id); // DEBUG
                return null;
            }

            // Now, format based on populatedItem
            if (booking.itemType === 'bus') {
                console.log('Manually populating bus booking:', booking); // DEBUG
                return {
                    id: booking._id,
                    type: 'Bus',
                    ticketNumber: booking.ticketNumber,
                    operator: populatedItem.operator,
                    route: `${populatedItem.from} to ${populatedItem.to}`,
                    date: populatedItem.date,
                    time: populatedItem.time,
                    arrival: populatedItem.arrival,
                    price: booking.price, // This is the total price from the booking itself
                    status: booking.status,
                    seat: booking.seatNumber,
                    passengerName: booking.passengerName,
                    busType: populatedItem.busType,
                    amenities: populatedItem.amenities,
                    mainImageUrl: populatedItem.mainImageUrl,
                    galleryImages: populatedItem.galleryImages,
                    createdAt: booking.createdAt,
                };
            } else if (booking.itemType === 'hotel') {
                console.log('Manually populating hotel booking:', booking); // DEBUG
                return {
                    id: booking._id,
                    type: 'Hotel',
                    ticketNumber: booking.ticketNumber,
                    name: populatedItem.name,
                    location: populatedItem.location,
                    price: booking.price, // This is the total price from the booking itself
                    status: booking.status,
                    leadGuestName: booking.leadGuestName,
                    guests: booking.numGuests,
                    checkIn: booking.checkInDate,
                    checkOut: booking.checkOutDate,
                    hotelRating: populatedItem.rating,
                    hotelType: populatedItem.type,
                    hotelImage: populatedItem.imageUrl,
                    amenities: populatedItem.amenities,
                    galleryImages: populatedItem.galleryImages,
                    createdAt: booking.createdAt,
                };
            }
            return null; // Should not reach here if itemType is 'bus' or 'hotel'
        }).filter(Boolean); // Filter out any null entries

        res.json(formattedBookings);
    } catch (error) {
        console.error('Error in getUserBookings final catch:', error); // DEBUG
        res.status(500).json({ message: 'Server error fetching bookings' });
    }
};

// @desc    Cancel a booking
// @route   PUT /api/user/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res) => {
    const { id } = req.params; // Booking ID

    try {
        const booking = await Booking.findOne({ _id: id, user: req.user });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found or not authorized' });
        }

        if (booking.status === 'Cancelled') {
            return res.status(400).json({ message: 'Booking is already cancelled' });
        }

        const user = await User.findById(req.user);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const refundAmount = booking.price * 0.9; // 90% refund
        user.walletBalance += refundAmount;
        await user.save();

        booking.status = 'Cancelled';
        await booking.save();

        // Update bus/hotel availability if applicable
        if (booking.itemType === 'bus') {
            const bus = await Bus.findById(booking.itemId);
            if (bus && bus.filledSeats > 0) {
                bus.filledSeats -= 1;
                await bus.save();
            }
        } else if (booking.itemType === 'hotel') {
            const hotel = await Hotel.findById(booking.itemId);
            if (hotel) {
                hotel.roomsAvailable += 1; // Increment room availability
                await hotel.save();
            }
        }

        const transaction = new Transaction({
            user: req.user,
            type: 'credit',
            amount: refundAmount,
            description: `Refund for cancelled ${booking.itemType} booking: ${booking.ticketNumber}`
        });
        await transaction.save();

        res.json({
            message: `Booking ${booking.ticketNumber} cancelled. Rs. ${refundAmount.toFixed(2)} refunded.`,
            newBalance: user.walletBalance.toFixed(2)
        });

    } catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({ message: 'Server error cancelling booking' });
    }
};


// @desc    Get booking details by ticket number (for tracking)
// @route   GET /api/user/tracking/:ticketNumber
// @access  Public (for simplicity, but can be protected)
const getBookingDetailsByTicketNumber = async (req, res) => {
    const { ticketNumber } = req.params;

    try {
        const booking = await Booking.findOne({ ticketNumber }).lean(); // Fetch raw booking, not populated automatically

        if (!booking) {
            return res.status(404).json({ message: 'No tracking information found for this ticket number.' });
        }

        let trackingData = {
            ticketNumber: booking.ticketNumber,
            status: booking.status,
            lastUpdated: booking.updatedAt.toLocaleString(), // Use updated timestamp
        };

        // Manually fetch and assign item details based on itemType
        let itemDetails = null;
        if (booking.itemType === 'bus') {
            itemDetails = await Bus.findById(booking.itemId).lean();
        } else if (booking.itemType === 'hotel') {
            itemDetails = await Hotel.findById(booking.itemId).lean();
        }

        if (!itemDetails) {
            console.warn(`Tracking: Could not find item details for booking ${booking.ticketNumber} (itemId: ${booking.itemId}, itemType: ${booking.itemType})`);
            return res.status(404).json({ message: 'Associated travel/hotel details not found for this ticket.' });
        }

        if (booking.itemType === 'bus') {
            // Simulate dynamic bus tracking info
            const bus = itemDetails; // Use itemDetails here
            const currentLocationOptions = [`Departed from ${bus.from}`, `En route to ${bus.to}`, `Near ${bus.to.split(' ')[0]}`, `Arrived at ${bus.to}`];
            const etaOptions = [`${Math.floor(Math.random() * 2) + 1} hours`, `${Math.floor(Math.random() * 30) + 1} minutes`, 'On Time', 'Delayed by 30 mins'];
            const driverContacts = [`+977-98${Math.floor(10000000 + Math.random() * 90000000)}`, `+977-97${Math.floor(10000000 + Math.random() * 90000000)}`];
            const vehicleNumbers = [`NE-${Math.floor(1000 + Math.random() * 9000)}`, `BA-${Math.floor(10 + Math.random() * 90)}-${Math.floor(1000 + Math.random() * 9000)}`];

            Object.assign(trackingData, {
                type: 'Bus', // Explicitly set type as 'Bus'
                operator: bus.operator,
                route: `${bus.from} to ${bus.to}`,
                currentLocation: currentLocationOptions[Math.floor(Math.random() * currentLocationOptions.length)],
                nextStop: bus.to, // Next stop is final destination for simplicity
                eta: etaOptions[Math.floor(Math.random() * etaOptions.length)],
                vehicleNumber: vehicleNumbers[Math.floor(Math.random() * vehicleNumbers.length)],
                driverContact: driverContacts[Math.floor(Math.random() * driverContacts.length)],
                passengerName: booking.passengerName,
                seatNumber: booking.seatNumber
            });
        } else if (booking.itemType === 'hotel') {
            const hotel = itemDetails; // Use itemDetails here
            Object.assign(trackingData, {
                type: 'Hotel', // Explicitly set type as 'Hotel'
                hotelName: hotel.name,
                location: hotel.location,
                checkInDate: booking.checkInDate,
                checkOutDate: booking.checkOutDate,
                roomType: 'Standard Room', // Mock room type
                confirmationNumber: booking.ticketNumber,
                guests: booking.numGuests,
                leadGuestName: booking.leadGuestName
            });
        }
        res.json(trackingData);

    } catch (error) {
        console.error('Error getting tracking details:', error);
        res.status(500).json({ message: 'Server error getting tracking details' });
    }
};


module.exports = {
    getProfile,
    updateProfile,
    addMoneyToWallet,
    getUserTransactions,
    bookBus,
    bookHotel,
    getUserBookings,
    cancelBooking,
    getBookingDetailsByTicketNumber
};
