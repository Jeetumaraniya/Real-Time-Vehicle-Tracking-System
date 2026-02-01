const Vehicle = require('../models/Vehicle');
const Route = require('../models/Route');

// @desc    Get all vehicles
// @route   GET /api/vehicles
// @access  Public
exports.getVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find()
            .populate('route', 'routeName routeNumber')
            .populate('driver', 'username');

        res.status(200).json({
            success: true,
            count: vehicles.length,
            data: vehicles
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching vehicles',
            error: error.message
        });
    }
};

// @desc    Get single vehicle
// @route   GET /api/vehicles/:id
// @access  Public
exports.getVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id)
            .populate('route')
            .populate('driver', 'username');

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        res.status(200).json({
            success: true,
            data: vehicle
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching vehicle',
            error: error.message
        });
    }
};

// @desc    Create new vehicle
// @route   POST /api/vehicles
// @access  Private (Admin)
exports.createVehicle = async (req, res) => {
    try {
        const vehicleData = req.body;

        // If route is assigned but no location, set initial location to route start point
        if (vehicleData.route && !vehicleData.currentLocation) {
            const route = await Route.findById(vehicleData.route);
            if (route && route.startPoint) {
                vehicleData.currentLocation = {
                    latitude: route.startPoint.latitude,
                    longitude: route.startPoint.longitude,
                    updatedAt: Date.now()
                };
            }
        }

        const vehicle = await Vehicle.create(vehicleData);

        // Notify clients about new vehicle
        if (req.io) {
            const populatedVehicle = await Vehicle.findById(vehicle._id).populate('route');
            req.io.emit('vehicleAdded', populatedVehicle);
        }

        res.status(201).json({
            success: true,
            data: vehicle
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating vehicle',
            error: error.message
        });
    }
};

// @desc    Update vehicle
// @route   PUT /api/vehicles/:id
// @access  Private (Admin)
exports.updateVehicle = async (req, res) => {
    try {
        const vehicleData = req.body;

        // Check if route changed and we need to reset location (optional, but good for "Active" updates)
        // For now, let's just update

        // If route is being updated and no location exists, set it
        if (vehicleData.route && (!vehicleData.currentLocation?.latitude)) {
            // Check if we already have a location in DB
            const currentVehicle = await Vehicle.findById(req.params.id);
            if (!currentVehicle.currentLocation?.latitude) {
                const route = await Route.findById(vehicleData.route);
                if (route && route.startPoint) {
                    vehicleData.currentLocation = {
                        latitude: route.startPoint.latitude,
                        longitude: route.startPoint.longitude,
                        updatedAt: Date.now()
                    };
                }
            }
        }

        const vehicle = await Vehicle.findByIdAndUpdate(
            req.params.id,
            vehicleData,
            { new: true, runValidators: true }
        ).populate('route');

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        // Notify clients about update
        if (req.io) {
            req.io.emit('vehicleUpdated', vehicle);
        }

        res.status(200).json({
            success: true,
            data: vehicle
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating vehicle',
            error: error.message
        });
    }
};

// @desc    Delete vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private (Admin)
exports.deleteVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findByIdAndDelete(req.params.id);

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        // Notify clients about deletion
        if (req.io) {
            req.io.emit('vehicleDeleted', vehicle._id);
        }

        res.status(200).json({
            success: true,
            message: 'Vehicle deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting vehicle',
            error: error.message
        });
    }
};

// @desc    Update vehicle location
// @route   PUT /api/vehicles/:id/location
// @access  Private
exports.updateLocation = async (req, res) => {
    try {
        const { latitude, longitude, speed, heading } = req.body;

        const vehicle = await Vehicle.findByIdAndUpdate(
            req.params.id,
            {
                currentLocation: {
                    latitude,
                    longitude,
                    updatedAt: Date.now()
                },
                speed: speed || 0,
                heading: heading || 0
            },
            { new: true }
        );

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        // Emit location update via Socket.io (handled in server.js)
        if (req.io) {
            req.io.emit('vehicleLocationUpdate', {
                vehicleId: vehicle._id,
                location: vehicle.currentLocation,
                speed: vehicle.speed,
                heading: vehicle.heading
            });
        }

        res.status(200).json({
            success: true,
            data: vehicle
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating location',
            error: error.message
        });
    }
};

// @desc    Get active vehicles
// @route   GET /api/vehicles/active
// @access  Public
exports.getActiveVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find({ status: { $in: ['active', 'en-route'] } })
            .populate('route', 'routeName routeNumber color')
            .populate('driver', 'username');

        res.status(200).json({
            success: true,
            count: vehicles.length,
            data: vehicles
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching active vehicles',
            error: error.message
        });
    }
};

// @desc    Report vehicle incident
// @route   PUT /api/vehicles/:id/incident
// @access  Private (Driver/Admin)
exports.reportIncident = async (req, res) => {
    try {
        const { incidentStatus, incidentDescription } = req.body;

        const vehicle = await Vehicle.findByIdAndUpdate(
            req.params.id,
            {
                incidentStatus,
                incidentDescription,
                incidentTime: incidentStatus !== 'none' ? Date.now() : null,
                // If incident is cleared ('none'), revert status to 'active', else set to 'maintenance'
                status: incidentStatus === 'none' ? 'active' : 'maintenance'
            },
            { new: true }
        ).populate('route');

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        // Emit incident update via Socket.io
        if (req.io) {
            req.io.emit('vehicleIncident', {
                vehicleId: vehicle._id,
                incidentStatus: vehicle.incidentStatus,
                incidentDescription: vehicle.incidentDescription,
                incidentTime: vehicle.incidentTime,
                status: vehicle.status
            });
        }

        res.status(200).json({
            success: true,
            data: vehicle
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error reporting incident',
            error: error.message
        });
    }
};
