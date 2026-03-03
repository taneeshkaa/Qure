async function test() {
    try {
        const payload = {
            state: "mh",
            city: "mum",
            hospital_name: "Test Hospital " + Date.now(),
            address: "123 Test Street",
            owner_name: "John Doe",
            contact_person: "Jane Doe",
            phone_1: "9232837198",
            phone_2: "",
            email: "test@hospital.com",
            chemist_staff_password: "password123",
            license_number: "HOS-12345",
            chemist_shop_name: "Apollo Pharmacy " + Date.now(),
            doctors: [
                {
                    full_name: "Dr. Smith",
                    specialization: "Cardiology",
                    experience: 0
                },
                {
                    full_name: "Dr. Jones",
                    specialization: "Neurology",
                    experience: 5
                }
            ]
        };

        const response = await fetch('http://127.0.0.1:5000/api/v1/register/hospital', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log("Status:", response.status);
        if (response.status === 201) {
            console.log("Success! Created hospital ID:", data.data.hospital_id);
            console.log("Created doctors:", data.data.doctors.length);
        } else {
            console.log("Response:", JSON.stringify(data, null, 2));
        }

    } catch (err) {
        console.log("Fetch Error:", err);
    }
}

test();
