const API_URL = 'http://localhost:5000/api';
const VEHICLE_ID = '69746a88d7690f5a8484095f'; // GJ-01-BUS-2001

async function verify() {
    try {
        console.log('1. Logging in as Admin...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@transport.com', password: 'admin123' })
        });
        const loginData = await loginRes.json();

        if (!loginData.success) {
            throw new Error(`Login failed: ${loginData.message}`);
        }

        const token = loginData.token;
        console.log('   Success! Token received.');

        console.log(`2. Reporting Incident for Vehicle ${VEHICLE_ID}...`);
        const incidentRes = await fetch(`${API_URL}/vehicles/${VEHICLE_ID}/incident`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                incidentStatus: 'accident',
                incidentDescription: 'Test Accident Verification via Script'
            })
        });
        const incidentData = await incidentRes.json();
        console.log('   Reported status:', incidentRes.status);

        console.log('3. Verifying Vehicle Status...');
        const vehicleRes = await fetch(`${API_URL}/vehicles/${VEHICLE_ID}`);
        const vehicleData = await vehicleRes.json();
        const vehicle = vehicleData.data;

        console.log('------------------------------------------------');
        console.log(`Vehicle: ${vehicle.registrationNumber}`);
        console.log(`Status: ${vehicle.status}`);
        console.log(`Incident: ${vehicle.incidentStatus}`);
        console.log(`Description: ${vehicle.incidentDescription}`);
        console.log('------------------------------------------------');

        if (vehicle.incidentStatus === 'accident') {
            console.log('✅ VERIFICATION PASSED');
        } else {
            console.error('❌ VERIFICATION FAILED: Status mismatch');
            process.exit(1);
        }

    } catch (error) {
        console.error('❌ Error during verification:', error.message);
        process.exit(1);
    }
}

verify();
