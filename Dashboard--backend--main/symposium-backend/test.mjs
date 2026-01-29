import fetch from 'node-fetch';

const testData = {
    name: "Vignesh Kumar",
    email: "vignesh@example.com",
    team: "Team Alpha",
    event: "Hackathon 2026",
    college: "SIMATS"
};

try {
    const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(testData)
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', data);
} catch (error) {
    console.error('Error:', error.message);
}
