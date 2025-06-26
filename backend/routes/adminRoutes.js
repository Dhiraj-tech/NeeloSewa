const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware'); // Import middleware
const upload = require('../utils/upload'); // Import Multer upload utility

const {
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
} = require('../controllers/adminController'); // Import admin controller functions

// Bus management routes - Apply Multer for image uploads
// 'mainImage': single file for main image
// 'galleryImages': array of files for gallery images
router.post('/buses', protect, admin, upload.fields([{ name: 'mainImage', maxCount: 1 }, { name: 'galleryImages', maxCount: 10 }]), addBus);
router.put('/buses/:id', protect, admin, upload.fields([{ name: 'mainImage', maxCount: 1 }, { name: 'galleryImages', maxCount: 10 }]), updateBus);
router.delete('/buses/:id', protect, admin, deleteBus);
router.get('/buses/:id', protect, admin, getBusById);

// Hotel management routes - Apply Multer for image uploads
router.post('/hotels', protect, admin, upload.fields([{ name: 'mainImage', maxCount: 1 }, { name: 'galleryImages', maxCount: 10 }]), addHotel);
router.put('/hotels/:id', protect, admin, upload.fields([{ name: 'mainImage', maxCount: 1 }, { name: 'galleryImages', maxCount: 10 }]), updateHotel);
router.delete('/hotels/:id', protect, admin, deleteHotel);
router.get('/hotels/:id', protect, admin, getHotelById);

// User management (for admin)
router.get('/users', protect, admin, getAllUsers);
router.put('/users/:id/role', protect, admin, updateUserRole);

module.exports = router;
