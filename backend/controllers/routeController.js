const Route = require('../models/Route');

// @desc    Get all routes
// @route   GET /api/routes
// @access  Public
exports.getRoutes = async (req, res) => {
    try {
        const routes = await Route.find({ isActive: true });

        res.status(200).json({
            success: true,
            count: routes.length,
            data: routes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching routes',
            error: error.message
        });
    }
};

// @desc    Get single route
// @route   GET /api/routes/:id
// @access  Public
exports.getRoute = async (req, res) => {
    try {
        const route = await Route.findById(req.params.id);

        if (!route) {
            return res.status(404).json({
                success: false,
                message: 'Route not found'
            });
        }

        res.status(200).json({
            success: true,
            data: route
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching route',
            error: error.message
        });
    }
};

// @desc    Create new route
// @route   POST /api/routes
// @access  Private (Admin)
exports.createRoute = async (req, res) => {
    try {
        const route = await Route.create(req.body);

        res.status(201).json({
            success: true,
            data: route
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating route',
            error: error.message
        });
    }
};

// @desc    Update route
// @route   PUT /api/routes/:id
// @access  Private (Admin)
exports.updateRoute = async (req, res) => {
    try {
        const route = await Route.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!route) {
            return res.status(404).json({
                success: false,
                message: 'Route not found'
            });
        }

        res.status(200).json({
            success: true,
            data: route
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating route',
            error: error.message
        });
    }
};

// @desc    Delete route
// @route   DELETE /api/routes/:id
// @access  Private (Admin)
exports.deleteRoute = async (req, res) => {
    try {
        const route = await Route.findByIdAndDelete(req.params.id);

        if (!route) {
            return res.status(404).json({
                success: false,
                message: 'Route not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Route deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting route',
            error: error.message
        });
    }
};

// @desc    Get routes with vehicle count
// @route   GET /api/routes/stats
// @access  Public
exports.getRoutesWithStats = async (req, res) => {
    try {
        const Vehicle = require('../models/Vehicle');

        const routes = await Route.find({ isActive: true });

        const routesWithStats = await Promise.all(
            routes.map(async (route) => {
                const vehicleCount = await Vehicle.countDocuments({ route: route._id });
                const activeVehicles = await Vehicle.countDocuments({
                    route: route._id,
                    status: { $in: ['active', 'en-route'] }
                });

                return {
                    ...route.toObject(),
                    totalVehicles: vehicleCount,
                    activeVehicles
                };
            })
        );

        res.status(200).json({
            success: true,
            count: routesWithStats.length,
            data: routesWithStats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching routes with stats',
            error: error.message
        });
    }
};
