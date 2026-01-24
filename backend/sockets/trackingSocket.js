const Vehicle = require('../models/Vehicle');

module.exports = (io) => {
    // Store connected clients
    const connectedClients = new Map();

    io.on('connection', (socket) => {
        console.log(`Client connected: ${socket.id}`);

        // Track connected client
        connectedClients.set(socket.id, {
            id: socket.id,
            connectedAt: new Date(),
            subscribedVehicles: []
        });

        // Send current active vehicles on connection
        socket.on('getActiveVehicles', async () => {
            try {
                const vehicles = await Vehicle.find({
                    status: { $in: ['active', 'en-route'] }
                }).populate('route', 'routeName routeNumber color');

                socket.emit('activeVehicles', vehicles);
            } catch (error) {
                socket.emit('error', { message: 'Error fetching active vehicles' });
            }
        });

        // Subscribe to specific vehicle updates
        socket.on('subscribeToVehicle', (vehicleId) => {
            socket.join(`vehicle-${vehicleId}`);
            const client = connectedClients.get(socket.id);
            if (client) {
                client.subscribedVehicles.push(vehicleId);
            }
            console.log(`Client ${socket.id} subscribed to vehicle ${vehicleId}`);
        });

        // Unsubscribe from vehicle updates
        socket.on('unsubscribeFromVehicle', (vehicleId) => {
            socket.leave(`vehicle-${vehicleId}`);
            const client = connectedClients.get(socket.id);
            if (client) {
                client.subscribedVehicles = client.subscribedVehicles.filter(id => id !== vehicleId);
            }
            console.log(`Client ${socket.id} unsubscribed from vehicle ${vehicleId}`);
        });

        // Subscribe to route updates
        socket.on('subscribeToRoute', (routeId) => {
            socket.join(`route-${routeId}`);
            console.log(`Client ${socket.id} subscribed to route ${routeId}`);
        });

        // Handle vehicle location update from drivers
        socket.on('updateVehicleLocation', async (data) => {
            try {
                const { vehicleId, latitude, longitude, speed, heading } = data;

                const vehicle = await Vehicle.findByIdAndUpdate(
                    vehicleId,
                    {
                        currentLocation: {
                            latitude,
                            longitude,
                            updatedAt: Date.now()
                        },
                        speed: speed || 0,
                        heading: heading || 0,
                        status: 'en-route'
                    },
                    { new: true }
                ).populate('route', 'routeName routeNumber color');

                if (vehicle) {
                    // Broadcast to all connected clients
                    io.emit('vehicleLocationUpdate', {
                        vehicleId: vehicle._id,
                        vehicleInfo: {
                            registrationNumber: vehicle.registrationNumber,
                            type: vehicle.type,
                            route: vehicle.route
                        },
                        location: vehicle.currentLocation,
                        speed: vehicle.speed,
                        heading: vehicle.heading
                    });

                    // Also emit to specific vehicle room
                    io.to(`vehicle-${vehicleId}`).emit('vehicleUpdate', vehicle);

                    // Emit to route room if vehicle is assigned to a route
                    if (vehicle.route) {
                        io.to(`route-${vehicle.route._id}`).emit('routeVehicleUpdate', {
                            vehicleId: vehicle._id,
                            location: vehicle.currentLocation,
                            speed: vehicle.speed
                        });
                    }
                }
            } catch (error) {
                socket.emit('error', { message: 'Error updating vehicle location' });
            }
        });

        // Handle disconnect
        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
            connectedClients.delete(socket.id);
        });
    });

    // Return methods for external use (e.g., from REST API)
    return {
        broadcastVehicleUpdate: (vehicleData) => {
            io.emit('vehicleLocationUpdate', vehicleData);
        },
        getConnectedClients: () => connectedClients.size
    };
};
