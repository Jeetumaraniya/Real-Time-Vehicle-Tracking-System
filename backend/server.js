require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const routeRoutes = require('./routes/routeRoutes');

// Import socket handler
const initializeSocket = require('./sockets/trackingSocket');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true
    }
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io accessible to routes
app.use((req, res, next) => {
    req.io = io;
    next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/routes', routeRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Dashboard stats endpoint
app.get('/api/stats', async (req, res) => {
    try {
        const Vehicle = require('./models/Vehicle');
        const Route = require('./models/Route');
        const User = require('./models/User');

        const [totalVehicles, activeVehicles, totalRoutes, totalDrivers] = await Promise.all([
            Vehicle.countDocuments(),
            Vehicle.countDocuments({ status: { $in: ['active', 'en-route'] } }),
            Route.countDocuments({ isActive: true }),
            User.countDocuments({ role: 'driver' })
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalVehicles,
                activeVehicles,
                totalRoutes,
                totalDrivers
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching stats',
            error: error.message
        });
    }
});

// Initialize Socket.io handlers
const socketHandler = initializeSocket(io);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Socket.io ready for connections`);
    console.log(`🔗 API available at http://localhost:${PORT}/api`);
});

module.exports = { app, server, io };
