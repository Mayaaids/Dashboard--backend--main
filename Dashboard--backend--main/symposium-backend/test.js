async function testRegistration() {
    try {
        const response = await fetch("http://localhost:5000/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "Vignesh Kumar",
                email: "vignesh@example.com",
                team: "Team Alpha",
                event: "Hackathon 2026",
                college: "SIMATS"
            })
        });

        const data = await response.json();
        console.log("✅ Registration Successful!");
        console.log("Response:", data);
    } catch (error) {
        console.log("❌ Error:", error.message);
    }
}

testRegistration();
