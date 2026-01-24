const express = require('express');
const router = express.Router();
const {
    getVehicles,
    getVehicle,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    updateLocation,
    getActiveVehicles
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

// Location update (Driver or Admin)
router.put('/:id/location', protect, authorize('admin', 'driver'), updateLocation);

module.exports = router;
