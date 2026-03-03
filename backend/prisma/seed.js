// ─── Database Seed Script ────────────────────────────────────
// Seeds locations, symptom mappings, sample doctors, and doctor slots.
// Uses upsert so it's idempotent — safe to run multiple times.

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ─── Locations ───────────────────────────────────────────────
const statesAndCities = {
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Tirupati", "Nellore", "Kakinada"],
    "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Tawang", "Ziro", "Pasighat"],
    "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tezpur"],
    "Bihar": ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Purnia", "Darbhanga"],
    "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg", "Rajnandgaon"],
    "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Gandhinagar"],
    "Haryana": ["Gurugram", "Faridabad", "Panipat", "Ambala", "Karnal", "Hisar"],
    "Himachal Pradesh": ["Shimla", "Dharamshala", "Manali", "Solan", "Mandi", "Kullu"],
    "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh", "Deoghar"],
    "Karnataka": ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi", "Belagavi", "Davangere"],
    "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kannur", "Kollam"],
    "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain", "Sagar"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Thane"],
    "Manipur": ["Imphal", "Thoubal", "Bishnupur", "Churachandpur", "Ukhrul"],
    "Meghalaya": ["Shillong", "Tura", "Nongstoin", "Jowai", "Baghmara"],
    "Mizoram": ["Aizawl", "Lunglei", "Champhai", "Serchhip", "Kolasib"],
    "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha"],
    "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri"],
    "Punjab": ["Chandigarh", "Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner"],
    "Sikkim": ["Gangtok", "Namchi", "Geyzing", "Mangan", "Rangpo"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem", "Tiruchirappalli", "Tirunelveli"],
    "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Secunderabad"],
    "Tripura": ["Agartala", "Udaipur", "Dharmanagar", "Kailashahar", "Belonia"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Agra", "Noida", "Prayagraj"],
    "Uttarakhand": ["Dehradun", "Haridwar", "Rishikesh", "Haldwani", "Nainital", "Roorkee"],
    "West Bengal": ["Kolkata", "Howrah", "Siliguri", "Durgapur", "Asansol", "Darjeeling"],

    // Union Territories
    "Andaman and Nicobar Islands": ["Port Blair", "Havelock Island"],
    "Chandigarh": ["Chandigarh"],
    "Dadra and Nagar Haveli and Daman and Diu": ["Daman", "Diu", "Silvassa"],
    "Delhi": ["New Delhi", "Dwarka", "Rohini", "Saket", "Karol Bagh"],
    "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Udhampur"],
    "Ladakh": ["Leh", "Kargil"],
    "Lakshadweep": ["Kavaratti", "Agatti"],
    "Puducherry": ["Puducherry", "Karaikal", "Mahe", "Yanam"],
};

// ─── Symptom-to-Specialist Mapping ──────────────────────────
const symptomMappings = [
    // Gastroenterologist
    { keyword: "pancreas", specialization: "Gastroenterologist" },
    { keyword: "digestion", specialization: "Gastroenterologist" },
    { keyword: "stomach", specialization: "Gastroenterologist" },
    { keyword: "stomach ache", specialization: "Gastroenterologist" },
    { keyword: "heartburn", specialization: "Gastroenterologist" },
    { keyword: "liver", specialization: "Gastroenterologist" },
    { keyword: "acidity", specialization: "Gastroenterologist" },
    // Neurologist
    { keyword: "headache", specialization: "Neurologist" },
    { keyword: "migraine", specialization: "Neurologist" },
    { keyword: "brain", specialization: "Neurologist" },
    { keyword: "seizure", specialization: "Neurologist" },
    { keyword: "nerve", specialization: "Neurologist" },
    // Dermatologist
    { keyword: "skin", specialization: "Dermatologist" },
    { keyword: "rash", specialization: "Dermatologist" },
    { keyword: "acne", specialization: "Dermatologist" },
    { keyword: "eczema", specialization: "Dermatologist" },
    // Cardiologist
    { keyword: "heart", specialization: "Cardiologist" },
    { keyword: "chest pain", specialization: "Cardiologist" },
    { keyword: "blood pressure", specialization: "Cardiologist" },
    { keyword: "palpitation", specialization: "Cardiologist" },
    // Orthopedic
    { keyword: "bone", specialization: "Orthopedic" },
    { keyword: "fracture", specialization: "Orthopedic" },
    { keyword: "joint pain", specialization: "Orthopedic" },
    { keyword: "back pain", specialization: "Orthopedic" },
    { keyword: "knee", specialization: "Orthopedic" },
    // ENT Specialist
    { keyword: "ear", specialization: "ENT Specialist" },
    { keyword: "nose", specialization: "ENT Specialist" },
    { keyword: "throat", specialization: "ENT Specialist" },
    { keyword: "sinus", specialization: "ENT Specialist" },
    // Ophthalmologist
    { keyword: "eye", specialization: "Ophthalmologist" },
    { keyword: "vision", specialization: "Ophthalmologist" },
    { keyword: "cataract", specialization: "Ophthalmologist" },
    // Dentist
    { keyword: "tooth", specialization: "Dentist" },
    { keyword: "teeth", specialization: "Dentist" },
    { keyword: "gums", specialization: "Dentist" },
    { keyword: "dental", specialization: "Dentist" },
    // Pulmonologist
    { keyword: "lungs", specialization: "Pulmonologist" },
    { keyword: "breathing", specialization: "Pulmonologist" },
    { keyword: "asthma", specialization: "Pulmonologist" },
    { keyword: "cough", specialization: "Pulmonologist" },
    // Urologist
    { keyword: "kidney", specialization: "Urologist" },
    { keyword: "urinary", specialization: "Urologist" },
    { keyword: "bladder", specialization: "Urologist" },
    // Endocrinologist
    { keyword: "diabetes", specialization: "Endocrinologist" },
    { keyword: "thyroid", specialization: "Endocrinologist" },
    { keyword: "hormone", specialization: "Endocrinologist" },
    // Psychiatrist
    { keyword: "anxiety", specialization: "Psychiatrist" },
    { keyword: "depression", specialization: "Psychiatrist" },
    { keyword: "stress", specialization: "Psychiatrist" },
    { keyword: "insomnia", specialization: "Psychiatrist" },
    // Gynecologist
    { keyword: "pregnancy", specialization: "Gynecologist" },
    { keyword: "menstrual", specialization: "Gynecologist" },
    { keyword: "periods", specialization: "Gynecologist" },
    // Pediatrician
    { keyword: "child", specialization: "Pediatrician" },
    { keyword: "infant", specialization: "Pediatrician" },
    { keyword: "baby", specialization: "Pediatrician" },
    // General Physician (fallback / common)
    { keyword: "fever", specialization: "General Physician" },
    { keyword: "cold", specialization: "General Physician" },
    { keyword: "flu", specialization: "General Physician" },
    { keyword: "cough", specialization: "General Physician" },
    { keyword: "weakness", specialization: "General Physician" },
];

async function main() {
    console.log("🌱 Starting database seed...\n");

    // ── Step 1: Seed Locations ──────────────────────────────────
    let totalLocations = 0;
    for (const [state, cities] of Object.entries(statesAndCities)) {
        for (const city of cities) {
            await prisma.location.upsert({
                where: {
                    unique_state_city: {
                        state_name: state,
                        city_name: city,
                    },
                },
                update: {},
                create: {
                    state_name: state,
                    city_name: city,
                },
            });
            totalLocations++;
        }
        console.log(`  ✅ ${state} — ${cities.length} cities seeded`);
    }
    console.log(`\n🎉 Locations seeded: ${totalLocations}\n`);

    // ── Step 2: Seed Symptom Mappings ────────────────────────────
    let mappingCount = 0;
    for (const mapping of symptomMappings) {
        try {
            await prisma.symptomMapping.upsert({
                where: { keyword: mapping.keyword },
                update: { specialization: mapping.specialization },
                create: mapping,
            });
            mappingCount++;
        } catch (err) {
            // Skip duplicates silently (keyword unique constraint)
            if (err.code !== "P2002") throw err;
        }
    }
    console.log(`🧠 Symptom mappings seeded: ${mappingCount}\n`);

    // ── Step 3: Seed Sample Doctors (if hospitals exist) ────────
    const hospitals = await prisma.hospital.findMany({ take: 5 });

    if (hospitals.length === 0) {
        console.log("⏭️  No hospitals found — skipping doctor seeding.");
        console.log("   Register hospitals first, then re-run seed.\n");
    } else {
        const sampleDoctors = [
            { full_name: "Dr. Anil Sharma", specialization: "Gastroenterologist" },
            { full_name: "Dr. Priya Verma", specialization: "Cardiologist" },
            { full_name: "Dr. Rajesh Gupta", specialization: "Neurologist" },
            { full_name: "Dr. Sneha Patel", specialization: "Dermatologist" },
            { full_name: "Dr. Vikram Singh", specialization: "Orthopedic" },
            { full_name: "Dr. Meena Iyer", specialization: "General Physician" },
            { full_name: "Dr. Arjun Nair", specialization: "ENT Specialist" },
            { full_name: "Dr. Kavita Joshi", specialization: "Gynecologist" },
            { full_name: "Dr. Suresh Reddy", specialization: "Pulmonologist" },
            { full_name: "Dr. Pooja Mishra", specialization: "Pediatrician" },
        ];

        let doctorCount = 0;
        for (const doc of sampleDoctors) {
            // Assign doctors round-robin to available hospitals
            const hospital = hospitals[doctorCount % hospitals.length];

            // Check if this doctor already exists at this hospital
            const existing = await prisma.doctor.findFirst({
                where: {
                    full_name: doc.full_name,
                    hospital_id: hospital.id,
                },
            });

            if (!existing) {
                const createdDoctor = await prisma.doctor.create({
                    data: {
                        full_name: doc.full_name,
                        specialization: doc.specialization,
                        hospital_id: hospital.id,
                    },
                });

                // Create default weekly slots (Mon–Sat, 09:00–17:00, 30 min each)
                for (let day = 1; day <= 6; day++) {
                    await prisma.doctorSlot.upsert({
                        where: {
                            unique_doctor_day: {
                                doctor_id: createdDoctor.id,
                                day_of_week: day,
                            },
                        },
                        update: {},
                        create: {
                            doctor_id: createdDoctor.id,
                            day_of_week: day,
                            start_time: "09:00",
                            end_time: "17:00",
                            slot_duration_minutes: 30,
                        },
                    });
                }
                doctorCount++;
                console.log(
                    `  👨‍⚕️ ${doc.full_name} (${doc.specialization}) → ${hospital.hospital_name}`
                );
            }
        }
        console.log(`\n🏥 Doctors seeded: ${doctorCount}\n`);
    }

    console.log("✅ Seeding complete!\n");
}

main()
    .catch((e) => {
        console.error("❌ Seed error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
