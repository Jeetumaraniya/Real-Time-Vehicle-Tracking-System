const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    vehicleId: {
        type: String,
        required: [true, 'Vehicle ID is required'],
        unique: true,
        trim: true
    },
    registrationNumber: {
        type: String,
        required: [true, 'Registration number is required'],
        unique: true,
        trim: true,
        uppercase: true
    },
    type: {
        type: String,
        enum: ['bus', 'minibus', 'metro', 'tram', 'car', 'taxi', 'van'],
        default: 'bus'
    },
    capacity: {
        type: Number,
        default: 50
    },
    route: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Route'
    },
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'maintenance', 'en-route'],
        default: 'inactive'
    },
    currentLocation: {
        latitude: {
            type: Number,
            default: 0
        },
        longitude: {
            type: Number,
            default: 0
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    },
    speed: {
        type: Number,
        default: 0
    },
    heading: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for geospatial queries
vehicleSchema.index({ 'currentLocation.latitude': 1, 'currentLocation.longitude': 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);
