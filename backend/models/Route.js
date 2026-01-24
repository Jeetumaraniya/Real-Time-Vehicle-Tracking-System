const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    order: {
        type: Number,
        required: true
    }
});

const routeSchema = new mongoose.Schema({
    routeId: {
        type: String,
        required: [true, 'Route ID is required'],
        unique: true,
        trim: true
    },
    routeName: {
        type: String,
        required: [true, 'Route name is required'],
        trim: true
    },
    routeNumber: {
        type: String,
        required: [true, 'Route number is required'],
        trim: true
    },
    startPoint: {
        name: { type: String, required: true },
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
    },
    endPoint: {
        name: { type: String, required: true },
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
    },
    stops: [stopSchema],
    distance: {
        type: Number, // in kilometers
        default: 0
    },
    estimatedDuration: {
        type: Number, // in minutes
        default: 0
    },
    color: {
        type: String,
        default: '#3B82F6' // Default blue color for route on map
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Route', routeSchema);
