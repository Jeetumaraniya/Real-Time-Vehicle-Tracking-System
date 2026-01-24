import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

class SocketService {
    constructor() {
        this.socket = null;
        this.listeners = new Map();
    }

    connect() {
        if (this.socket?.connected) {
            return this.socket;
        }

        this.socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        this.socket.on('connect', () => {
            console.log('Socket connected:', this.socket.id);
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    // Get active vehicles on initial connection
    getActiveVehicles(callback) {
        if (!this.socket) this.connect();

        this.socket.emit('getActiveVehicles');
        this.socket.on('activeVehicles', callback);
    }

    // Subscribe to vehicle location updates
    onVehicleLocationUpdate(callback) {
        if (!this.socket) this.connect();

        this.socket.on('vehicleLocationUpdate', callback);
        this.listeners.set('vehicleLocationUpdate', callback);
    }

    // Subscribe to a specific vehicle
    subscribeToVehicle(vehicleId) {
        if (!this.socket) this.connect();

        this.socket.emit('subscribeToVehicle', vehicleId);
    }

    // Unsubscribe from a vehicle
    unsubscribeFromVehicle(vehicleId) {
        if (!this.socket) return;

        this.socket.emit('unsubscribeFromVehicle', vehicleId);
    }

    // Subscribe to a route
    subscribeToRoute(routeId) {
        if (!this.socket) this.connect();

        this.socket.emit('subscribeToRoute', routeId);
    }

    // Send vehicle location update (for drivers)
    sendLocationUpdate(vehicleId, latitude, longitude, speed, heading) {
        if (!this.socket) this.connect();

        this.socket.emit('updateVehicleLocation', {
            vehicleId,
            latitude,
            longitude,
            speed,
            heading
        });
    }

    // On specific vehicle update
    onVehicleUpdate(callback) {
        if (!this.socket) this.connect();

        this.socket.on('vehicleUpdate', callback);
    }

    // On route vehicle update
    onRouteVehicleUpdate(callback) {
        if (!this.socket) this.connect();

        this.socket.on('routeVehicleUpdate', callback);
    }

    // Remove all listeners
    removeAllListeners() {
        if (this.socket) {
            this.listeners.forEach((callback, event) => {
                this.socket.off(event, callback);
            });
            this.listeners.clear();
        }
    }
}

// Singleton instance
const socketService = new SocketService();

export default socketService;
