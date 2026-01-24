// Seed script to create initial admin user and sample data
require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const User = require('./models/User');
const Vehicle = require('./models/Vehicle');
const Route = require('./models/Route');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        fs.writeFileSync('seed_error.txt', 'DB Connection Error: ' + error.message);
        console.error('Error:', error.message);
        process.exit(1);
    }
};

const seedData = async () => {
    try {
        await connectDB();

        // Clear existing data
        await User.deleteMany({});
        await Vehicle.deleteMany({});
        await Route.deleteMany({});
        // ... rest of code


        console.log('Cleared existing data');

        // Create admin user
        const admin = await User.create({
            username: 'admin',
            email: 'admin@transport.com',
            password: 'admin123',
            role: 'admin'
        });
        console.log('Admin user created:', admin.email);

        // Create 10 sample drivers
        const drivers = [];
        for (let i = 1; i <= 10; i++) {
            const driver = await User.create({
                username: `driver${i}`,
                email: `driver${i}@transport.com`,
                password: 'driver123',
                role: 'driver'
            });
            drivers.push(driver);
        }
        console.log('10 Sample drivers created');

        // --- ROUTES ---

        // 1. Bus: Ahmedabad Central - Gandhinagar
        const route1 = await Route.create({
            routeId: 'RT101',
            routeName: 'Ahmedabad Central - Gandhinagar Tech Park',
            routeNumber: '101',
            startPoint: { name: 'Ahmedabad Central', latitude: 23.0225, longitude: 72.5714 },
            endPoint: { name: 'Gift City', latitude: 23.1606, longitude: 72.6865 },
            stops: [
                { name: 'Ahmedabad Central', latitude: 23.0225, longitude: 72.5714, order: 1 },
                { name: 'Sabarmati', latitude: 23.0630, longitude: 72.5830, order: 2 },
                { name: 'Visat Junction', latitude: 23.1000, longitude: 72.5900, order: 3 },
                { name: 'Koba Circle', latitude: 23.1300, longitude: 72.6200, order: 4 },
                { name: 'Gift City', latitude: 23.1606, longitude: 72.6865, order: 5 }
            ],
            distance: 22.5,
            estimatedDuration: 45,
            color: '#3B82F6' // Blue
        });

        // 2. Bus: SVPI Airport - ISCON
        const route2 = await Route.create({
            routeId: 'RT102',
            routeName: 'SVPI Airport - ISCON Cross Road',
            routeNumber: '102',
            startPoint: { name: 'SVPI Airport', latitude: 23.0734, longitude: 72.6266 },
            endPoint: { name: 'ISCON Cross Road', latitude: 23.0270, longitude: 72.5072 },
            stops: [
                { name: 'SVPI Airport', latitude: 23.0734, longitude: 72.6266, order: 1 },
                { name: 'Dudheshwar', latitude: 23.0450, longitude: 72.5900, order: 2 },
                { name: 'Income Tax', latitude: 23.0380, longitude: 72.5700, order: 3 },
                { name: 'Gujarat University', latitude: 23.0364, longitude: 72.5451, order: 4 },
                { name: 'ISCON Cross Road', latitude: 23.0270, longitude: 72.5072, order: 5 }
            ],
            distance: 15.2,
            estimatedDuration: 35,
            color: '#10B981' // Green
        });

        // 3. Minibus: Maninagar - Science City
        const route3 = await Route.create({
            routeId: 'RT103',
            routeName: 'Maninagar - Science City',
            routeNumber: '103',
            startPoint: { name: 'Maninagar', latitude: 22.9972, longitude: 72.6022 },
            endPoint: { name: 'Science City', latitude: 23.0784, longitude: 72.4920 },
            stops: [
                { name: 'Maninagar', latitude: 22.9972, longitude: 72.6022, order: 1 },
                { name: 'Geeta Mandir', latitude: 23.0130, longitude: 72.5920, order: 2 },
                { name: 'Paldi', latitude: 23.0120, longitude: 72.5600, order: 3 },
                { name: 'Satellite', latitude: 23.0300, longitude: 72.5200, order: 4 },
                { name: 'Science City', latitude: 23.0784, longitude: 72.4920, order: 5 }
            ],
            distance: 18.1,
            estimatedDuration: 50,
            color: '#F59E0B' // Orange
        });

        // 4. Metro East-West: Thaltej - Vastral
        const route4 = await Route.create({
            routeId: 'MT001',
            routeName: 'Metro East-West Corridor',
            routeNumber: 'M-EW',
            startPoint: { name: 'Thaltej', latitude: 23.0500, longitude: 72.5000 },
            endPoint: { name: 'Vastral Gam', latitude: 23.0000, longitude: 72.6500 },
            stops: [
                { name: 'Thaltej', latitude: 23.0500, longitude: 72.5000, order: 1 },
                { name: 'Doordarshan Kendra', latitude: 23.0550, longitude: 72.5200, order: 2 },
                { name: 'Stadium', latitude: 23.0400, longitude: 72.5600, order: 3 },
                { name: 'Kalupur', latitude: 23.0250, longitude: 72.5950, order: 4 },
                { name: 'Vastral Gam', latitude: 23.0000, longitude: 72.6500, order: 5 }
            ],
            distance: 20.5,
            estimatedDuration: 30,
            color: '#8B5CF6' // Purple
        });

        // 5. Tram/Riverfront: Heritage Tour
        const route5 = await Route.create({
            routeId: 'TR001',
            routeName: 'Riverfront Heritage Tour',
            routeNumber: 'RF-1',
            startPoint: { name: 'Subhash Bridge', latitude: 23.0700, longitude: 72.5800 },
            endPoint: { name: 'Vasna Barrage', latitude: 23.0000, longitude: 72.5500 },
            stops: [
                { name: 'Subhash Bridge', latitude: 23.0700, longitude: 72.5800, order: 1 },
                { name: 'Usmanpura', latitude: 23.0500, longitude: 72.5700, order: 2 },
                { name: 'Ellis Bridge', latitude: 23.0200, longitude: 72.5700, order: 3 },
                { name: 'Flower Park', latitude: 23.0100, longitude: 72.5650, order: 4 },
                { name: 'Vasna Barrage', latitude: 23.0000, longitude: 72.5500, order: 5 }
            ],
            distance: 7.0,
            estimatedDuration: 40,
            color: '#EC4899' // Pink
        });

        // 6. Rajkot: Central - Airport
        const route6 = await Route.create({
            routeId: 'RT_RJK_01',
            routeName: 'Rajkot Central - Airport',
            routeNumber: 'RJK-1',
            startPoint: { name: 'Rajkot Central', latitude: 22.3039, longitude: 70.8022 },
            endPoint: { name: 'Rajkot Airport', latitude: 22.3092, longitude: 70.7794 },
            stops: [
                { name: 'Rajkot Central', latitude: 22.3039, longitude: 70.8022, order: 1 },
                { name: 'Yagnik Road', latitude: 22.2980, longitude: 70.7950, order: 2 },
                { name: 'Race Course', latitude: 22.3020, longitude: 70.7900, order: 3 },
                { name: 'Rajkot Airport', latitude: 22.3092, longitude: 70.7794, order: 4 }
            ],
            distance: 5.5,
            estimatedDuration: 20,
            color: '#EF4444' // Red
        });

        // 7. Jamnagar: City - Reliance Refinery
        const route7 = await Route.create({
            routeId: 'RT_JAM_01',
            routeName: 'Jamnagar City - Reliance Greens',
            routeNumber: 'JAM-1',
            startPoint: { name: 'Jamnagar Bus Station', latitude: 22.4707, longitude: 70.0577 },
            endPoint: { name: 'Reliance Greens', latitude: 22.3600, longitude: 69.8500 },
            stops: [
                { name: 'Jamnagar Bus Station', latitude: 22.4707, longitude: 70.0577, order: 1 },
                { name: 'Digjam Circle', latitude: 22.4500, longitude: 70.0400, order: 2 },
                { name: 'Khavdi', latitude: 22.3800, longitude: 69.9000, order: 3 },
                { name: 'Reliance Greens', latitude: 22.3600, longitude: 69.8500, order: 4 }
            ],
            distance: 28.0,
            estimatedDuration: 45,
            color: '#14B8A6' // Teal
        });

        // 8. Morbi: Morbi - Wankaner
        const route8 = await Route.create({
            routeId: 'RT_MOR_01',
            routeName: 'Morbi - Wankaner Connection',
            routeNumber: 'MOR-1',
            startPoint: { name: 'Morbi Bus Stand', latitude: 22.8120, longitude: 70.8236 },
            endPoint: { name: 'Wankaner Junction', latitude: 22.6200, longitude: 70.9400 },
            stops: [
                { name: 'Morbi Bus Stand', latitude: 22.8120, longitude: 70.8236, order: 1 },
                { name: 'Sanala', latitude: 22.7800, longitude: 70.8300, order: 2 },
                { name: 'Rafaleshwar', latitude: 22.7500, longitude: 70.8800, order: 3 },
                { name: 'Wankaner Junction', latitude: 22.6200, longitude: 70.9400, order: 4 }
            ],
            distance: 30.0,
            estimatedDuration: 50,
            color: '#8B5CF6' // Violet
        });

        // 9. Junagadh: Bus Stand - Girnar
        const route9 = await Route.create({
            routeId: 'RT_JUN_01',
            routeName: 'Junagadh City - Girnar Taleti',
            routeNumber: 'JUN-1',
            startPoint: { name: 'Junagadh Bus Stand', latitude: 21.5222, longitude: 70.4579 },
            endPoint: { name: 'Girnar Taleti', latitude: 21.5300, longitude: 70.5000 },
            stops: [
                { name: 'Junagadh Bus Stand', latitude: 21.5222, longitude: 70.4579, order: 1 },
                { name: 'Kalwa Chowk', latitude: 21.5250, longitude: 70.4650, order: 2 },
                { name: 'Bhavnath', latitude: 21.5280, longitude: 70.4900, order: 3 },
                { name: 'Girnar Taleti', latitude: 21.5300, longitude: 70.5000, order: 4 }
            ],
            distance: 6.0,
            estimatedDuration: 25,
            color: '#F97316' // Orange
        });

        console.log('9 Sample routes created');

        // --- VEHICLES ---

        // 1. Bus on RT101 (Active)
        await Vehicle.create({
            vehicleId: 'GJ-B01',
            registrationNumber: 'GJ-01-BUS-1001',
            type: 'bus',
            capacity: 50,
            route: route1._id,
            driver: drivers[0]._id,
            status: 'en-route',
            currentLocation: {
                latitude: 23.0630,
                longitude: 72.5830,
                updatedAt: new Date()
            },
            speed: 45
        });

        // 2. Bus on RT101 (Inactive/Depot)
        await Vehicle.create({
            vehicleId: 'GJ-B02',
            registrationNumber: 'GJ-01-BUS-1002',
            type: 'bus',
            capacity: 50,
            route: route1._id,
            status: 'inactive',
            currentLocation: {
                latitude: 23.0225,
                longitude: 72.5714,
                updatedAt: new Date()
            },
            speed: 0
        });

        // 3. Bus on RT102 (Active)
        await Vehicle.create({
            vehicleId: 'GJ-B03',
            registrationNumber: 'GJ-01-BUS-2001',
            type: 'bus',
            capacity: 45,
            route: route2._id,
            driver: drivers[1]._id,
            status: 'active',
            currentLocation: {
                latitude: 23.0450,
                longitude: 72.5900,
                updatedAt: new Date()
            },
            speed: 30
        });

        // 4. Minibus on RT103 (En-route)
        await Vehicle.create({
            vehicleId: 'GJ-MB01',
            registrationNumber: 'GJ-01-MIN-3001',
            type: 'minibus',
            capacity: 25,
            route: route3._id,
            driver: drivers[2]._id,
            status: 'en-route',
            currentLocation: {
                latitude: 23.0130,
                longitude: 72.5920,
                updatedAt: new Date()
            },
            speed: 55
        });

        // 5. Metro on MT001 (Active)
        await Vehicle.create({
            vehicleId: 'GJ-M01',
            registrationNumber: 'GJ-METRO-001',
            type: 'metro',
            capacity: 200,
            route: route4._id,
            driver: drivers[3]._id,
            status: 'active',
            currentLocation: {
                latitude: 23.0400,
                longitude: 72.5600,
                updatedAt: new Date()
            },
            speed: 70
        });

        // 6. Metro on MT001 (Active)
        await Vehicle.create({
            vehicleId: 'GJ-M02',
            registrationNumber: 'GJ-METRO-002',
            type: 'metro',
            capacity: 200,
            route: route4._id,
            driver: drivers[4]._id,
            status: 'active',
            currentLocation: {
                latitude: 23.0250,
                longitude: 72.5950,
                updatedAt: new Date()
            },
            speed: 65
        });

        // 7. Tram on TR001 (En-route)
        await Vehicle.create({
            vehicleId: 'GJ-T01',
            registrationNumber: 'GJ-TRAM-101',
            type: 'tram',
            capacity: 60,
            route: route5._id,
            driver: drivers[5]._id,
            status: 'en-route',
            currentLocation: {
                latitude: 23.0200,
                longitude: 72.5700,
                updatedAt: new Date()
            },
            speed: 20
        });

        // 8. Taxi/Car (Unassigned Route or Special Route)
        await Vehicle.create({
            vehicleId: 'GJ-TX01',
            registrationNumber: 'GJ-01-TAXI-999',
            type: 'car',
            capacity: 4,
            route: route2._id,
            driver: drivers[6]._id,
            status: 'active',
            currentLocation: {
                latitude: 23.0734,
                longitude: 72.6266,
                updatedAt: new Date()
            },
            speed: 40
        });

        // 9. Rajkot: Taxi (Active)
        await Vehicle.create({
            vehicleId: 'GJ-TX02',
            registrationNumber: 'GJ-03-TAXI-555',
            type: 'taxi',
            capacity: 4,
            route: route6._id,
            driver: drivers[7]._id,
            status: 'active',
            currentLocation: {
                latitude: 22.3050,
                longitude: 70.8000,
                updatedAt: new Date()
            },
            speed: 35
        });

        // 10. Jamnagar: Bus (Active)
        await Vehicle.create({
            vehicleId: 'GJ-B04',
            registrationNumber: 'GJ-10-BUS-888',
            type: 'bus',
            capacity: 45,
            route: route7._id,
            driver: drivers[8]._id,
            status: 'active',
            currentLocation: {
                latitude: 22.4600,
                longitude: 70.0500,
                updatedAt: new Date()
            },
            speed: 50
        });

        // 11. Morbi: Van (Active)
        await Vehicle.create({
            vehicleId: 'GJ-V01',
            registrationNumber: 'GJ-36-VAN-222',
            type: 'van',
            capacity: 8,
            route: route8._id,
            driver: drivers[9]._id,
            status: 'active',
            currentLocation: {
                latitude: 22.8000,
                longitude: 70.8300,
                updatedAt: new Date()
            },
            speed: 60
        });

        // 12. Junagadh: Minibus (En-route)
        await Vehicle.create({
            vehicleId: 'GJ-MB02',
            registrationNumber: 'GJ-11-MIN-444',
            type: 'minibus',
            capacity: 20,
            route: route9._id,
            driver: drivers[0]._id, // Recycling driver 1
            status: 'en-route',
            currentLocation: {
                latitude: 21.5260,
                longitude: 70.4700,
                updatedAt: new Date()
            },
            speed: 40
        });

        console.log('Sample vehicles created');

        console.log('\n✅ Seed data created successfully!');
        console.log('\n📌 Admin Login Credentials:');
        console.log('   Email: admin@transport.com');
        console.log('   Password: admin123');

        process.exit(0);
    } catch (error) {
        fs.writeFileSync('seed_error.txt', 'Seed Error: ' + error.toString() + '\nStack: ' + error.stack);
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
