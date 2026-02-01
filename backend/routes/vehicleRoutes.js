const express = require('express');
const router = express.Router();
const {
    getVehicles,
    getVehicle,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    updateLocation,
    getActiveVehicles,
    reportIncident
} = require('../controllers/vehicleController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getVehicles);
router.get('/active', getActiveVehicles);
router.get('/:id', getVehicle);

// Protected routes (Admin only)
router.post('/', protect, authorize('admin'), createVehicle);
router.put('/:id', protect, authorize('admin'), updateVehicle);
router.delete('/:id', protect, authorize('admin'), deleteVehicle);

// Location & Incident update (Driver or Admin)
router.put('/:id/location', protect, authorize('admin', 'driver'), updateLocation);
router.put('/:id/incident', protect, authorize('admin', 'driver'), reportIncident);

module.exports = router;
