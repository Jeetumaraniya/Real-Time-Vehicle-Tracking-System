const express = require('express');
const router = express.Router();
const {
    getRoutes,
    getRoute,
    createRoute,
    updateRoute,
    deleteRoute,
    getRoutesWithStats
} = require('../controllers/routeController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getRoutes);
router.get('/stats', getRoutesWithStats);
router.get('/:id', getRoute);

// Protected routes (Admin only)
router.post('/', protect, authorize('admin'), createRoute);
router.put('/:id', protect, authorize('admin'), updateRoute);
router.delete('/:id', protect, authorize('admin'), deleteRoute);

module.exports = router;
