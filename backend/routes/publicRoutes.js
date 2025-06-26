const express = require('express');
const router = express.Router();
const { getAllBuses, getAllHotels, getBusByIdPublic, getHotelByIdPublic } = require('../controllers/publicController');

router.get('/buses', getAllBuses); // Get all buses
router.get('/buses/:id', getBusByIdPublic); // Get single bus by ID (for detail view)
router.get('/hotels', getAllHotels); // Get all hotels
router.get('/hotels/:id', getHotelByIdPublic); // Get single hotel by ID (for detail view)

module.exports = router;