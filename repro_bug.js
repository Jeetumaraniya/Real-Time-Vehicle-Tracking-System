const API_URL = 'http://localhost:5000/api';

async function repro() {
    try {
        console.log('1. Logging in as Admin...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@transport.com', password: 'admin123' })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;

        console.log('2. Fetching vehicles...');
        const vRes = await fetch(`${API_URL}/vehicles`);
        const vData = await vRes.json();
        const vehicles = vData.data;

        if (vehicles.length < 2) {
            console.error('❌ Need at least 2 vehicles to reproduce. Run seed.js first.');
            process.exit(1);
        }

        const v1 = vehicles[0];
        const v2 = vehicles[1];

        console.log(`Testing with V1: ${v1.registrationNumber} (${v1._id}) and V2: ${v2.registrationNumber} (${v2._id})`);

        console.log(`3. Reporting Incident for V1...`);
        await fetch(`${API_URL}/vehicles/${v1._id}/incident`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                incidentStatus: 'accident',
                incidentDescription: 'Repro test'
            })
        });

        console.log('4. Verifying both vehicles...');
        const v1ResAfter = await fetch(`${API_URL}/vehicles/${v1._id}`);
        const v1DataAfter = await v1ResAfter.json();
        const v2ResAfter = await fetch(`${API_URL}/vehicles/${v2._id}`);
        const v2DataAfter = await v2ResAfter.json();

        console.log(`   V1 Result: ${v1DataAfter.data.incidentStatus}`);
        console.log(`   V2 Result: ${v2DataAfter.data.incidentStatus}`);

        if (v1DataAfter.data.incidentStatus === 'accident' && v2DataAfter.data.incidentStatus === 'none') {
            console.log('✅ BACKEND IS ISOLATED: Reporting V1 did not affect V2.');
        } else {
            console.error('❌ BUG DETECTED: Reporting V1 affected V2 or failed.');
        }

        console.log('5. Clearing Incident for V1...');
        await fetch(`${API_URL}/vehicles/${v1._id}/incident`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                incidentStatus: 'none',
                incidentDescription: ''
            })
        });

        const v1ResFinal = await fetch(`${API_URL}/vehicles/${v1._id}`);
        const v1DataFinal = await v1ResFinal.json();
        console.log(`   V1 Final Result: ${v1DataFinal.data.incidentStatus}`);

        if (v1DataFinal.data.incidentStatus === 'none') {
            console.log('✅ BACKEND IS ISOLATED: Clearing V1 worked correctly.');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

repro();
