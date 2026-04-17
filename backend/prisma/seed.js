// ─── Database Seed Script (Full Rewrite) ──────────────────────
// Seeds locations, hospitals, doctors, patients, appointments,
// prescriptions, medication reminders, and queue entries.
// Deletes all existing data first, then seeds fresh.

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

// ─── Locations ───────────────────────────────────────────────
const statesAndCities = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Tirupati", "Nellore"],
  "Assam": ["Guwahati", "Silchar", "Dibrugarh"],
  "Bihar": ["Patna", "Gaya", "Muzaffarpur"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar"],
  "Haryana": ["Gurugram", "Faridabad", "Panipat"],
  "Karnataka": ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Thane"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela"],
  "Punjab": ["Amritsar", "Ludhiana", "Jalandhar"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem"],
  "Telangana": ["Hyderabad", "Warangal", "Secunderabad"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Agra", "Noida"],
  "West Bengal": ["Kolkata", "Howrah", "Siliguri"],
  "Delhi": ["New Delhi", "Dwarka", "Rohini", "Saket"],
  "Chandigarh": ["Chandigarh"],
};

// ─── Symptom Mappings ─────────────────────────────────────────
const symptomMappings = [
  { keyword: "pancreas", specialization: "Gastroenterologist" },
  { keyword: "digestion", specialization: "Gastroenterologist" },
  { keyword: "stomach", specialization: "Gastroenterologist" },
  { keyword: "heartburn", specialization: "Gastroenterologist" },
  { keyword: "liver", specialization: "Gastroenterologist" },
  { keyword: "acidity", specialization: "Gastroenterologist" },
  { keyword: "headache", specialization: "Neurologist" },
  { keyword: "migraine", specialization: "Neurologist" },
  { keyword: "brain", specialization: "Neurologist" },
  { keyword: "seizure", specialization: "Neurologist" },
  { keyword: "nerve", specialization: "Neurologist" },
  { keyword: "skin", specialization: "Dermatologist" },
  { keyword: "rash", specialization: "Dermatologist" },
  { keyword: "acne", specialization: "Dermatologist" },
  { keyword: "eczema", specialization: "Dermatologist" },
  { keyword: "heart", specialization: "Cardiologist" },
  { keyword: "chest pain", specialization: "Cardiologist" },
  { keyword: "blood pressure", specialization: "Cardiologist" },
  { keyword: "palpitation", specialization: "Cardiologist" },
  { keyword: "bone", specialization: "Orthopedic" },
  { keyword: "fracture", specialization: "Orthopedic" },
  { keyword: "joint pain", specialization: "Orthopedic" },
  { keyword: "back pain", specialization: "Orthopedic" },
  { keyword: "knee", specialization: "Orthopedic" },
  { keyword: "ear", specialization: "ENT Specialist" },
  { keyword: "nose", specialization: "ENT Specialist" },
  { keyword: "throat", specialization: "ENT Specialist" },
  { keyword: "sinus", specialization: "ENT Specialist" },
  { keyword: "eye", specialization: "Ophthalmologist" },
  { keyword: "vision", specialization: "Ophthalmologist" },
  { keyword: "cataract", specialization: "Ophthalmologist" },
  { keyword: "tooth", specialization: "Dentist" },
  { keyword: "teeth", specialization: "Dentist" },
  { keyword: "gums", specialization: "Dentist" },
  { keyword: "lungs", specialization: "Pulmonologist" },
  { keyword: "breathing", specialization: "Pulmonologist" },
  { keyword: "asthma", specialization: "Pulmonologist" },
  { keyword: "kidney", specialization: "Urologist" },
  { keyword: "urinary", specialization: "Urologist" },
  { keyword: "bladder", specialization: "Urologist" },
  { keyword: "diabetes", specialization: "Endocrinologist" },
  { keyword: "thyroid", specialization: "Endocrinologist" },
  { keyword: "hormone", specialization: "Endocrinologist" },
  { keyword: "anxiety", specialization: "Psychiatrist" },
  { keyword: "depression", specialization: "Psychiatrist" },
  { keyword: "stress", specialization: "Psychiatrist" },
  { keyword: "insomnia", specialization: "Psychiatrist" },
  { keyword: "pregnancy", specialization: "Gynecologist" },
  { keyword: "menstrual", specialization: "Gynecologist" },
  { keyword: "periods", specialization: "Gynecologist" },
  { keyword: "child", specialization: "Pediatrician" },
  { keyword: "infant", specialization: "Pediatrician" },
  { keyword: "baby", specialization: "Pediatrician" },
  { keyword: "fever", specialization: "General Physician" },
  { keyword: "cold", specialization: "General Physician" },
  { keyword: "flu", specialization: "General Physician" },
  { keyword: "weakness", specialization: "General Physician" },
];

async function main() {
  console.log("🌱 Starting comprehensive database seed...\n");

  const hashedPassword = await bcrypt.hash("Password123", 10);

  // ── Step 0: Clear existing data (FK-safe order) ──────────────
  console.log("🗑️  Clearing existing data...");
  await prisma.prescription.deleteMany();
  await prisma.reminder.deleteMany();
  await prisma.medicalAttachment.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.queueEntry.deleteMany();
  await prisma.medicationReminder.deleteMany();
  await prisma.medicalProfile.deleteMany();
  await prisma.doctorSlot.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.chemist.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.hospital.deleteMany();
  await prisma.symptomMapping.deleteMany();
  // Keep locations — upsert them below
  console.log("   ✅ Cleared.\n");

  // ── Step 1: Seed Locations ────────────────────────────────────
  let totalLocations = 0;
  for (const [state, cities] of Object.entries(statesAndCities)) {
    for (const city of cities) {
      await prisma.location.upsert({
        where: { unique_state_city: { state_name: state, city_name: city } },
        update: {},
        create: { state_name: state, city_name: city },
      });
      totalLocations++;
    }
  }
  console.log(`📍 Locations seeded: ${totalLocations}`);

  // ── Step 2: Seed Symptom Mappings ────────────────────────────
  for (const mapping of symptomMappings) {
    await prisma.symptomMapping.upsert({
      where: { keyword: mapping.keyword },
      update: { specialization: mapping.specialization },
      create: mapping,
    });
  }
  console.log(`🧠 Symptom mappings seeded: ${symptomMappings.length}`);

  // ── Step 3: Seed 5 Hospitals ─────────────────────────────────
  const hospitalLocationMap = {
    Mumbai: "Maharashtra",
    "New Delhi": "Delhi",
    Bengaluru: "Karnataka",
    Chennai: "Tamil Nadu",
    Hyderabad: "Telangana",
  };

  const locationRecords = {};
  for (const [city, state] of Object.entries(hospitalLocationMap)) {
    locationRecords[city] = await prisma.location.findFirst({
      where: { city_name: city, state_name: state },
    });
  }

  const hospitalDefs = [
    {
      city: "Mumbai",
      hospital_name: "Lilavati Hospital & Research Centre",
      contact_person: "Dr. Ramesh Nair",
      phone_1: "02226568000",
      phone_2: "02226568001",
      owner_name: "Shri Lilavati Trust",
      license_number: "MH-HOS-2001-0142",
      total_staff_count: 850,
      about:
        "Lilavati Hospital is a 323-bed tertiary care hospital located in Bandra, Mumbai. It is a JCI-accredited multi-super-specialty hospital offering world-class care in cardiology, neurology, oncology, and more.",
      address: "A-791, Bandra Reclamation, Bandra West, Mumbai, Maharashtra 400050",
      email: "admin@lilavati.in",
      password_hash: hashedPassword,
      is_approved: true,
      departments: ["Cardiology", "Neurology", "Orthopedics", "Pediatrics", "General Medicine", "Dermatology"],
    },
    {
      city: "New Delhi",
      hospital_name: "Apollo Hospital Saket",
      contact_person: "Dr. Sunita Verma",
      phone_1: "01129871011",
      phone_2: "01129871012",
      owner_name: "Apollo Hospitals Group",
      license_number: "DL-HOS-1999-0087",
      total_staff_count: 1200,
      about:
        "Apollo Hospital Saket is one of Delhi's premier tertiary care hospitals. With NABH and JCI accreditation, it delivers cutting-edge care across 52+ specialities spanning cardiology, oncology, robotic surgery, and organ transplants.",
      address: "Saket District Centre, Saket, New Delhi, Delhi 110017",
      email: "admin@apollosaket.in",
      password_hash: hashedPassword,
      is_approved: true,
      departments: ["Gynecology", "Psychiatry", "ENT", "Ophthalmology", "General Medicine", "Cardiology"],
    },
    {
      city: "Bengaluru",
      hospital_name: "Manipal Hospital Whitefield",
      contact_person: "Dr. Arvind Hegde",
      phone_1: "08067999999",
      phone_2: null,
      owner_name: "Manipal Health Enterprises",
      license_number: "KA-HOS-2005-0311",
      total_staff_count: 700,
      about:
        "Manipal Hospital Whitefield offers exceptional medical services powered by cutting-edge technology and compassionate care. A 280-bed facility specialising in robotics, transplants, oncology, and complex surgeries.",
      address: "143, ITPL Main Road, Whitefield, Bengaluru, Karnataka 560066",
      email: "admin@manipalwhitefield.in",
      password_hash: hashedPassword,
      is_approved: true,
      departments: ["Orthopedics", "Dermatology", "Pediatrics", "Neurology", "Pulmonology", "General Medicine"],
    },
    {
      city: "Chennai",
      hospital_name: "Fortis Malar Hospital",
      contact_person: "Dr. Kavitha Krishnan",
      phone_1: "04424512345",
      phone_2: "04424512346",
      owner_name: "Fortis Healthcare Ltd.",
      license_number: "TN-HOS-2003-0228",
      total_staff_count: 600,
      about:
        "Fortis Malar Hospital is a 180-bed multi-specialty hospital in Chennai known for its expertise in cardiac sciences. It is the principal cardiac referral centre for the state of Tamil Nadu.",
      address: "52, 1st Main Road, Gandhi Nagar, Adyar, Chennai, Tamil Nadu 600020",
      email: "admin@fortismalar.in",
      password_hash: hashedPassword,
      is_approved: true,
      departments: ["Cardiology", "Gynecology", "ENT", "General Medicine", "Psychiatry", "Ophthalmology"],
    },
    {
      city: "Hyderabad",
      hospital_name: "KIMS Hospitals Secunderabad",
      contact_person: "Dr. Bhaskar Rao",
      phone_1: "04044885000",
      phone_2: null,
      owner_name: "Krishna Institute of Medical Sciences",
      license_number: "TS-HOS-2008-0194",
      total_staff_count: 900,
      about:
        "KIMS Hospitals is a 500-bed quaternary care hospital offering super-specialty care across 25 specialities, known for organ transplants, cancer care, and advanced orthopaedic procedures.",
      address: "1-8-31/1, Minister Road, Secunderabad, Hyderabad, Telangana 500003",
      email: "admin@kimshyd.in",
      password_hash: hashedPassword,
      is_approved: true,
      departments: ["Orthopedics", "Neurology", "Dermatology", "Pediatrics", "Cardiology", "General Medicine"],
    },
  ];

  const hospitals = [];
  for (const def of hospitalDefs) {
    const loc = locationRecords[def.city];
    const h = await prisma.hospital.create({
      data: {
        location_id: loc.id,
        hospital_name: def.hospital_name,
        contact_person: def.contact_person,
        phone_1: def.phone_1,
        phone_2: def.phone_2,
        owner_name: def.owner_name,
        license_number: def.license_number,
        total_staff_count: def.total_staff_count,
        about: def.about,
        address: def.address,
        email: def.email,
        password_hash: def.password_hash,
        is_approved: def.is_approved,
      },
    });
    hospitals.push({ ...h, departments: def.departments, city: def.city });
  }
  console.log(`\n🏥 Hospitals seeded: ${hospitals.length}`);

  // Seed one chemist per hospital
  for (const h of hospitals) {
    await prisma.chemist.create({
      data: {
        hospital_id: h.id,
        shop_name: `${h.hospital_name} Pharmacy`,
        staff_password_hash: hashedPassword,
      },
    });
  }
  console.log(`💊 Chemists seeded: ${hospitals.length}`);

  // ── Step 4: Seed Doctors (4-6 per hospital) ──────────────────
  const doctorDefs = [
    // Lilavati Mumbai — Cardiology, Neurology, Orthopedics, Pediatrics, General Medicine, Dermatology
    { hospital: 0, full_name: "Dr. Rahul Mehta", specialization: "Cardiologist", experience: 18, fee: 1500, email: "rahul.mehta@lilavati.in", phone: "9821100001", slug: "dr-rahul-mehta" },
    { hospital: 0, full_name: "Dr. Priya Sharma", specialization: "Neurologist", experience: 12, fee: 1800, email: "priya.sharma@lilavati.in", phone: "9821100002", slug: "dr-priya-sharma" },
    { hospital: 0, full_name: "Dr. Anil Desai", specialization: "Orthopedic", experience: 20, fee: 1200, email: "anil.desai@lilavati.in", phone: "9821100003", slug: "dr-anil-desai" },
    { hospital: 0, full_name: "Dr. Sunita Kulkarni", specialization: "Pediatrician", experience: 10, fee: 900, email: "sunita.kulkarni@lilavati.in", phone: "9821100004", slug: "dr-sunita-kulkarni" },
    { hospital: 0, full_name: "Dr. Vijay Kale", specialization: "General Physician", experience: 8, fee: 700, email: "vijay.kale@lilavati.in", phone: "9821100005", slug: "dr-vijay-kale" },

    // Apollo Delhi — Gynecology, Psychiatry, ENT, Ophthalmology, General Medicine, Cardiology
    { hospital: 1, full_name: "Dr. Neha Gupta", specialization: "Gynecologist", experience: 15, fee: 1400, email: "neha.gupta@apollosaket.in", phone: "9811200001", slug: "dr-neha-gupta" },
    { hospital: 1, full_name: "Dr. Amit Srivastava", specialization: "Psychiatrist", experience: 11, fee: 1600, email: "amit.srivastava@apollosaket.in", phone: "9811200002", slug: "dr-amit-srivastava" },
    { hospital: 1, full_name: "Dr. Rakesh Kumar", specialization: "ENT Specialist", experience: 9, fee: 1000, email: "rakesh.kumar@apollosaket.in", phone: "9811200003", slug: "dr-rakesh-kumar" },
    { hospital: 1, full_name: "Dr. Alka Jain", specialization: "Ophthalmologist", experience: 14, fee: 1100, email: "alka.jain@apollosaket.in", phone: "9811200004", slug: "dr-alka-jain" },
    { hospital: 1, full_name: "Dr. Manoj Tiwari", specialization: "Cardiologist", experience: 22, fee: 2000, email: "manoj.tiwari@apollosaket.in", phone: "9811200005", slug: "dr-manoj-tiwari" },

    // Manipal Bangalore — Orthopedics, Dermatology, Pediatrics, Neurology, Pulmonology, General Medicine
    { hospital: 2, full_name: "Dr. Arjun Hegde", specialization: "Orthopedic", experience: 16, fee: 1300, email: "arjun.hegde@manipalwhitefield.in", phone: "9845300001", slug: "dr-arjun-hegde" },
    { hospital: 2, full_name: "Dr. Deepika Nair", specialization: "Dermatologist", experience: 7, fee: 900, email: "deepika.nair@manipalwhitefield.in", phone: "9845300002", slug: "dr-deepika-nair" },
    { hospital: 2, full_name: "Dr. Sanjay Rao", specialization: "Neurologist", experience: 13, fee: 1700, email: "sanjay.rao@manipalwhitefield.in", phone: "9845300003", slug: "dr-sanjay-rao" },
    { hospital: 2, full_name: "Dr. Meera Krishnaswamy", specialization: "Pediatrician", experience: 9, fee: 800, email: "meera.k@manipalwhitefield.in", phone: "9845300004", slug: "dr-meera-k" },
    { hospital: 2, full_name: "Dr. Venkat Subramanian", specialization: "Pulmonologist", experience: 17, fee: 1500, email: "venkat.s@manipalwhitefield.in", phone: "9845300005", slug: "dr-venkat-s" },

    // Fortis Chennai — Cardiology, Gynecology, ENT, General Medicine, Psychiatry, Ophthalmology
    { hospital: 3, full_name: "Dr. Suresh Narayanan", specialization: "Cardiologist", experience: 25, fee: 2500, email: "suresh.n@fortismalar.in", phone: "9884400001", slug: "dr-suresh-n" },
    { hospital: 3, full_name: "Dr. Geetha Ramachandran", specialization: "Gynecologist", experience: 18, fee: 1600, email: "geetha.r@fortismalar.in", phone: "9884400002", slug: "dr-geetha-r" },
    { hospital: 3, full_name: "Dr. Arvind Balaji", specialization: "ENT Specialist", experience: 10, fee: 1000, email: "arvind.b@fortismalar.in", phone: "9884400003", slug: "dr-arvind-b" },
    { hospital: 3, full_name: "Dr. Preethi Lakshmi", specialization: "General Physician", experience: 6, fee: 600, email: "preethi.l@fortismalar.in", phone: "9884400004", slug: "dr-preethi-l" },

    // KIMS Hyderabad — Orthopedics, Neurology, Dermatology, Pediatrics, Cardiology, General Medicine
    { hospital: 4, full_name: "Dr. Kishore Reddy", specialization: "Orthopedic", experience: 20, fee: 1400, email: "kishore.r@kimshyd.in", phone: "9948500001", slug: "dr-kishore-r" },
    { hospital: 4, full_name: "Dr. Bhavana Prasad", specialization: "Neurologist", experience: 13, fee: 1600, email: "bhavana.p@kimshyd.in", phone: "9948500002", slug: "dr-bhavana-p" },
    { hospital: 4, full_name: "Dr. Satish Chandra", specialization: "Dermatologist", experience: 8, fee: 900, email: "satish.c@kimshyd.in", phone: "9948500003", slug: "dr-satish-c" },
    { hospital: 4, full_name: "Dr. Padmaja Rao", specialization: "Pediatrician", experience: 11, fee: 850, email: "padmaja.r@kimshyd.in", phone: "9948500004", slug: "dr-padmaja-r" },
    { hospital: 4, full_name: "Dr. Venugopal Sharma", specialization: "Cardiologist", experience: 19, fee: 2000, email: "venugopal.s@kimshyd.in", phone: "9948500005", slug: "dr-venugopal-s" },
  ];

  const doctors = [];
  for (const def of doctorDefs) {
    const hospital = hospitals[def.hospital];
    const d = await prisma.doctor.create({
      data: {
        full_name: def.full_name,
        slug: def.slug,
        specialization: def.specialization,
        consultation_fee: def.fee,
        experience: def.experience,
        hospital_id: hospital.id,
        email: def.email,
        password: hashedPassword,
        phone: def.phone,
        isRegistered: true,
        registeredAt: new Date("2024-01-15"),
        isAvailable: true,
      },
    });

    // Create Mon–Fri slots for every doctor
    for (let day = 1; day <= 5; day++) {
      await prisma.doctorSlot.create({
        data: {
          doctor_id: d.id,
          day_of_week: day,
          start_time: "09:00",
          end_time: "17:00",
          slot_duration_minutes: 30,
        },
      });
    }
    // Saturday half-day
    await prisma.doctorSlot.create({
      data: {
        doctor_id: d.id,
        day_of_week: 6,
        start_time: "09:00",
        end_time: "13:00",
        slot_duration_minutes: 30,
      },
    });

    doctors.push({ ...d, hospitalObj: hospital });
  }
  console.log(`\n👨‍⚕️  Doctors seeded: ${doctors.length}`);

  // ── Step 5: Seed 10 Patients ─────────────────────────────────
  const patientDefs = [
    {
      full_name: "Arjun Kapoor",
      email: "arjun.kapoor@gmail.com",
      phone: "9876543210",
      age: 35,
      gender: "Male",
      address: "14, Andheri West, Mumbai, Maharashtra 400058",
      blood_group: "B+",
      allergies: ["Penicillin"],
      chronic_conditions: ["Hypertension"],
      emergency_name: "Sunita Kapoor",
      emergency_phone: "9876543211",
    },
    {
      full_name: "Priya Nair",
      email: "priya.nair@gmail.com",
      phone: "9876543220",
      age: 28,
      gender: "Female",
      address: "22, Koramangala, Bengaluru, Karnataka 560034",
      blood_group: "A+",
      allergies: [],
      chronic_conditions: ["Asthma"],
      emergency_name: "Ramesh Nair",
      emergency_phone: "9876543221",
    },
    {
      full_name: "Vikram Sharma",
      email: "vikram.sharma@gmail.com",
      phone: "9876543230",
      age: 45,
      gender: "Male",
      address: "7, Lajpat Nagar, New Delhi 110024",
      blood_group: "O+",
      allergies: ["Sulfa drugs"],
      chronic_conditions: ["Diabetes Type 2", "Hypertension"],
      emergency_name: "Kavita Sharma",
      emergency_phone: "9876543231",
    },
    {
      full_name: "Deepa Krishnan",
      email: "deepa.krishnan@gmail.com",
      phone: "9876543240",
      age: 32,
      gender: "Female",
      address: "9, T Nagar, Chennai, Tamil Nadu 600017",
      blood_group: "AB+",
      allergies: [],
      chronic_conditions: [],
      emergency_name: "Mohan Krishnan",
      emergency_phone: "9876543241",
    },
    {
      full_name: "Ravi Reddy",
      email: "ravi.reddy@gmail.com",
      phone: "9876543250",
      age: 52,
      gender: "Male",
      address: "45, Jubilee Hills, Hyderabad, Telangana 500033",
      blood_group: "A-",
      allergies: ["Aspirin"],
      chronic_conditions: ["Arthritis"],
      emergency_name: "Latha Reddy",
      emergency_phone: "9876543251",
    },
    {
      full_name: "Meena Pillai",
      email: "meena.pillai@gmail.com",
      phone: "9876543260",
      age: 40,
      gender: "Female",
      address: "3, Palam Vihar, Gurugram, Haryana 122017",
      blood_group: "B-",
      allergies: ["Latex"],
      chronic_conditions: ["Hypothyroidism"],
      emergency_name: "Suresh Pillai",
      emergency_phone: "9876543261",
    },
    {
      full_name: "Aditya Singh",
      email: "aditya.singh@gmail.com",
      phone: "9876543270",
      age: 25,
      gender: "Male",
      address: "18, Gomti Nagar, Lucknow, Uttar Pradesh 226010",
      blood_group: "O-",
      allergies: [],
      chronic_conditions: [],
      emergency_name: "Asha Singh",
      emergency_phone: "9876543271",
    },
    {
      full_name: "Kavita Joshi",
      email: "kavita.joshi@gmail.com",
      phone: "9876543280",
      age: 38,
      gender: "Female",
      address: "5, Shyam Nagar, Jaipur, Rajasthan 302019",
      blood_group: "AB-",
      allergies: ["Ibuprofen"],
      chronic_conditions: ["Migraine"],
      emergency_name: "Rakesh Joshi",
      emergency_phone: "9876543281",
    },
    {
      full_name: "Sanjay Patel",
      email: "sanjay.patel@gmail.com",
      phone: "9876543290",
      age: 60,
      gender: "Male",
      address: "101, Satellite Road, Ahmedabad, Gujarat 380015",
      blood_group: "B+",
      allergies: [],
      chronic_conditions: ["Diabetes Type 2", "Heart Disease"],
      emergency_name: "Rekha Patel",
      emergency_phone: "9876543291",
    },
    {
      full_name: "Ananya Bose",
      email: "ananya.bose@gmail.com",
      phone: "9876543300",
      age: 22,
      gender: "Female",
      address: "12, Salt Lake, Kolkata, West Bengal 700064",
      blood_group: "A+",
      allergies: ["Pollen", "Dust"],
      chronic_conditions: [],
      emergency_name: "Amitabh Bose",
      emergency_phone: "9876543301",
    },
  ];

  const patients = [];
  for (const def of patientDefs) {
    const p = await prisma.patient.create({
      data: {
        full_name: def.full_name,
        email: def.email,
        phone: def.phone,
        age: def.age,
        gender: def.gender,
        address: def.address,
        blood_group: def.blood_group,
        allergies: def.allergies,
        chronic_conditions: def.chronic_conditions,
      },
    });
    // Create Medical Profile
    await prisma.medicalProfile.create({
      data: {
        patient_id: p.id,
        emergency_name: def.emergency_name,
        emergency_phone: def.emergency_phone,
        allergies: def.allergies.join(", ") || "None",
        medications: def.chronic_conditions.length > 0 ? "Under medication for " + def.chronic_conditions.join(", ") : "None",
        notes: "Regular checkup advised. Emergency contact informed.",
      },
    });
    patients.push(p);
  }
  console.log(`\n🧑‍🤝‍🧑 Patients seeded: ${patients.length}`);

  // ── Step 6: Seed Appointments & Prescriptions ─────────────────
  // Helpers
  const pastDate = (daysAgo) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    d.setHours(0, 0, 0, 0);
    return d;
  };
  const futureDate = (daysAhead) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  // Appointment data: [patientIdx, doctorIdx, date, slot, status, problem, token]
  const appointmentDefs = [
    // Past completed
    [0, 0, pastDate(45), "10:00", "COMPLETED", "Chest pain and shortness of breath on exertion", 1],
    [0, 1, pastDate(30), "11:00", "COMPLETED", "Recurring headaches and blurred vision", 2],
    [1, 11, pastDate(60), "09:30", "COMPLETED", "Knee pain worsening for 3 months", 1],
    [1, 12, pastDate(20), "14:00", "COMPLETED", "Skin rash and itching on arms", 3],
    [2, 5, pastDate(40), "10:30", "COMPLETED", "Irregular menstrual cycle and pelvic pain", 2],
    [2, 6, pastDate(15), "11:30", "COMPLETED", "Persistent anxiety and difficulty sleeping", 1],
    [3, 15, pastDate(50), "09:00", "COMPLETED", "Chest tightness and palpitations after exercise", 1],
    [3, 16, pastDate(25), "15:00", "COMPLETED", "Vaginal discharge and lower abdominal pain", 2],
    [4, 19, pastDate(35), "10:00", "COMPLETED", "Hip joint pain radiating down the leg", 1],
    [4, 20, pastDate(18), "12:00", "COMPLETED", "Severe headache and nausea for 2 days", 4],
    [5, 8, pastDate(55), "09:00", "COMPLETED", "Recurring sinusitis and nasal congestion", 1],
    [6, 3, pastDate(28), "14:30", "COMPLETED", "High fever and body ache for 4 days", 5],
    [7, 7, pastDate(42), "10:00", "COMPLETED", "Ear pain and hearing difficulty in left ear", 3],
    [8, 24, pastDate(22), "11:00", "COMPLETED", "Chest pain and high blood pressure", 2],
    [9, 21, pastDate(33), "09:30", "COMPLETED", "Shoulder pain and reduced movement", 1],

    // Future booked
    [0, 0, futureDate(3), "10:00", "BOOKED", "Follow-up for cardiac evaluation and ECG review", 1],
    [1, 13, futureDate(5), "11:00", "BOOKED", "Child fever and cough for 5 days", 2],
    [2, 6, futureDate(2), "14:00", "BOOKED", "Follow-up session for anxiety management", 3],
    [5, 18, futureDate(7), "09:30", "BOOKED", "Hearing check-up and ENT consultation", 1],
    [9, 23, futureDate(10), "10:30", "BOOKED", "Annual skin check-up and mole examination", 4],
  ];

  const appointments = [];
  for (const [pi, di, date, slot, status, problem, token] of appointmentDefs) {
    const a = await prisma.appointment.create({
      data: {
        patient_id: patients[pi].id,
        doctor_id: doctors[di].id,
        date,
        slot,
        token_number: token,
        problem_description: problem,
        status,
        paymentMethod: status === "COMPLETED" ? "UPI" : "CASH",
        paymentStatus: status === "COMPLETED" ? "PAID" : "PENDING",
        estimatedWaitMinutes: status === "BOOKED" ? token * 30 : null,
      },
    });
    appointments.push({ ...a, doctorIdx: di, patientIdx: pi });
  }
  console.log(`\n📅 Appointments seeded: ${appointments.length}`);

  // ── Step 7: Seed Prescriptions for all COMPLETED appointments ──
  const completedAppts = appointments.filter((a) => a.status === "COMPLETED");

  const medicinePool = [
    { name: "Amlodipine", dosage: "5mg", frequency: "Once daily", duration: "30 days", instructions: "Take in the morning with water" },
    { name: "Metoprolol", dosage: "25mg", frequency: "Twice daily", duration: "30 days", instructions: "Take with meals" },
    { name: "Aspirin", dosage: "75mg", frequency: "Once daily", duration: "Ongoing", instructions: "Take after meals" },
    { name: "Atorvastatin", dosage: "20mg", frequency: "Once daily", duration: "90 days", instructions: "Take at night" },
    { name: "Paracetamol", dosage: "500mg", frequency: "Thrice daily", duration: "5 days", instructions: "Take after meals, avoid alcohol" },
    { name: "Amoxicillin", dosage: "500mg", frequency: "Thrice daily", duration: "7 days", instructions: "Complete the full course" },
    { name: "Pantoprazole", dosage: "40mg", frequency: "Once daily", duration: "14 days", instructions: "Take 30 minutes before breakfast" },
    { name: "Cetirizine", dosage: "10mg", frequency: "Once daily", duration: "10 days", instructions: "Take at bedtime" },
    { name: "Metformin", dosage: "500mg", frequency: "Twice daily", duration: "90 days", instructions: "Take with meals" },
    { name: "Losartan", dosage: "50mg", frequency: "Once daily", duration: "30 days", instructions: "Take at the same time each day" },
    { name: "Gabapentin", dosage: "300mg", frequency: "Thrice daily", duration: "30 days", instructions: "Avoid driving; causes drowsiness" },
    { name: "Sertraline", dosage: "50mg", frequency: "Once daily", duration: "60 days", instructions: "Take in the morning with food" },
    { name: "Salbutamol", dosage: "2 puffs", frequency: "As needed", duration: "90 days", instructions: "Shake before use, rinse mouth after" },
    { name: "Levocetirizine", dosage: "5mg", frequency: "Once daily", duration: "15 days", instructions: "Take at bedtime" },
    { name: "Ibuprofen", dosage: "400mg", frequency: "Thrice daily", duration: "5 days", instructions: "Take with food, avoid on empty stomach" },
    { name: "Diclofenac", dosage: "50mg", frequency: "Twice daily", duration: "7 days", instructions: "Take after meals" },
    { name: "Ciprofloxacin", dosage: "500mg", frequency: "Twice daily", duration: "7 days", instructions: "Drink plenty of water" },
    { name: "Omeprazole", dosage: "20mg", frequency: "Once daily", duration: "14 days", instructions: "Take 30 minutes before breakfast" },
  ];

  const testPool = [
    { testName: "Complete Blood Count (CBC)", notes: "Fasting not required" },
    { testName: "Lipid Profile", notes: "12-hour fasting required" },
    { testName: "ECG (12-lead)", notes: "Routine cardiac check" },
    { testName: "2D Echocardiogram", notes: "Cardiac structure and function" },
    { testName: "HbA1c", notes: "Average blood sugar over 3 months" },
    { testName: "Fasting Blood Sugar", notes: "8-hour fasting required" },
    { testName: "Thyroid Function Test (TSH, T3, T4)", notes: "Morning sample preferred" },
    { testName: "Liver Function Test (LFT)", notes: "Fasting 4 hours" },
    { testName: "Kidney Function Test (KFT)", notes: "Ensure good hydration before test" },
    { testName: "Chest X-Ray (PA view)", notes: "Standard radiograph" },
    { testName: "MRI Brain", notes: "Gadolinium contrast as advised" },
    { testName: "CT Scan Chest", notes: "With contrast" },
    { testName: "Pap Smear", notes: "Avoid intercourse 48 hours before" },
    { testName: "Urine Routine Microscopy", notes: "Mid-stream sample" },
  ];

  const diagnosisPool = [
    "Hypertensive Heart Disease — Stage 2",
    "Tension-type Headache with Cervicogenic component",
    "Medial Compartment Osteoarthritis — Right Knee",
    "Allergic Contact Dermatitis",
    "Polycystic Ovarian Syndrome (PCOS)",
    "Generalized Anxiety Disorder (GAD)",
    "Ischaemic Cardiomyopathy — Compensated",
    "Bacterial Vaginosis",
    "Degenerative Joint Disease — Right Hip",
    "Viral Meningitis — Resolving",
    "Chronic Rhinosinusitis",
    "Viral Upper Respiratory Tract Infection",
    "Otitis Media — Acute",
    "Essential Hypertension with Dyslipidaemia",
    "Rotator Cuff Tendinopathy — Right Shoulder",
  ];

  const notesPool = [
    "Patient responded well to initial treatment. Follow-up in 4 weeks.",
    "Lifestyle modifications advised — low sodium diet, moderate exercise.",
    "Physiotherapy recommended for 8 weeks alongside medication.",
    "Advised to avoid allergens and use hypoallergenic products.",
    "Blood work reviewed. Plan to reassess in 6 weeks after medication.",
    "Patient counselled on sleep hygiene and stress reduction techniques.",
    "LVEF acceptable. Echocardiography to be repeated in 3 months.",
    "Routine check — no acute distress. Continue current regimen.",
    "X-ray reviewed. No fracture noted. Conservative management continued.",
    "Scan results reviewed with patient. Second opinion recommended.",
  ];

  const prescriptions = [];
  for (let i = 0; i < completedAppts.length; i++) {
    const appt = completedAppts[i];
    const meds = [medicinePool[i % medicinePool.length], medicinePool[(i + 2) % medicinePool.length], medicinePool[(i + 4) % medicinePool.length]];
    const tests = [testPool[i % testPool.length], testPool[(i + 3) % testPool.length]];
    const receivedAt = new Date(appt.date);
    receivedAt.setHours(receivedAt.getHours() + 2);

    const prx = await prisma.prescription.create({
      data: {
        appointmentId: appt.id,
        doctorId: appt.doctor_id,
        patientId: appt.patient_id,
        medicines: meds,
        tests,
        diagnosis: diagnosisPool[i % diagnosisPool.length],
        doctorNotes: notesPool[i % notesPool.length],
        sentToPharmacy: true,
        pharmacyReceivedAt: receivedAt,
      },
    });
    prescriptions.push(prx);
  }
  console.log(`📝 Prescriptions seeded: ${prescriptions.length}`);

  // ── Step 8: Seed Medication Reminders (2-3 per patient) ──────
  const reminderDefs = [
    [0, "Amlodipine", "5mg", "Once daily"],
    [0, "Metoprolol", "25mg", "Twice daily"],
    [1, "Salbutamol", "2 puffs", "As needed"],
    [1, "Levocetirizine", "5mg", "Once daily"],
    [2, "Metformin", "500mg", "Twice daily"],
    [2, "Losartan", "50mg", "Once daily"],
    [2, "Atorvastatin", "20mg", "Once daily"],
    [3, "Paracetamol", "500mg", "Thrice daily"],
    [4, "Diclofenac", "50mg", "Twice daily"],
    [4, "Omeprazole", "20mg", "Once daily"],
    [5, "Levothyroxine", "50mcg", "Once daily"],
    [6, "Paracetamol", "500mg", "As needed"],
    [7, "Sertraline", "50mg", "Once daily"],
    [7, "Gabapentin", "300mg", "Thrice daily"],
    [8, "Aspirin", "75mg", "Once daily"],
    [8, "Metformin", "1000mg", "Twice daily"],
    [9, "Cetirizine", "10mg", "Once daily"],
  ];

  for (const [pi, medicine, dosage, frequency] of reminderDefs) {
    await prisma.medicationReminder.create({
      data: {
        patientId: patients[pi].id,
        medicineName: medicine,
        dosage,
        frequency,
        startDate: pastDate(15),
        endDate: futureDate(15),
        active: true,
      },
    });
  }
  console.log(`⏰ Medication reminders seeded: ${reminderDefs.length}`);

  // ── Step 9: Seed Queue Entries for today (active) ────────────
  // We need User records linked to doctors for QueueEntry (phase 1 model)
  // QueueEntry links to Doctor and User (not Patient). Seed 3 user/queue combos.
  const queuePatientUsers = [
    { name: "Rajesh Kumar (Queue)", email: "queue.patient1@qure.in", password: hashedPassword, role: "PATIENT" },
    { name: "Shalini Mehta (Queue)", email: "queue.patient2@qure.in", password: hashedPassword, role: "PATIENT" },
    { name: "Harish Verma (Queue)", email: "queue.patient3@qure.in", password: hashedPassword, role: "PATIENT" },
  ];

  const queueUsers = [];
  for (const u of queuePatientUsers) {
    const user = await prisma.user.create({
      data: { name: u.name, email: u.email, password: u.password, role: u.role },
    });
    queueUsers.push(user);
  }

  // Link queue entries to doctors[0], doctors[5], doctors[10] with active queue
  const queueDoctors = [doctors[0], doctors[5], doctors[10]];
  for (let i = 0; i < 3; i++) {
    await prisma.queueEntry.create({
      data: {
        doctorId: queueDoctors[i].id,
        patientId: queueUsers[i].id,
        token: i + 1,
        status: i === 0 ? "IN_PROGRESS" : "WAITING",
        date: new Date(),
        notes: i === 0 ? "Patient called in" : "Waiting in lobby",
      },
    });
  }
  console.log(`🎫 Queue entries seeded: 3`);

  // ── Summary ───────────────────────────────────────────────────
  console.log("\n" + "═".repeat(50));
  console.log("🎉 SEED COMPLETE — Summary");
  console.log("═".repeat(50));
  console.log(`  📍 Locations:            ${totalLocations}`);
  console.log(`  🧠 Symptom mappings:     ${symptomMappings.length}`);
  console.log(`  🏥 Hospitals:            ${hospitals.length}`);
  console.log(`  💊 Chemists:             ${hospitals.length}`);
  console.log(`  👨‍⚕️  Doctors:              ${doctors.length}`);
  console.log(`  🧑‍🤝‍🧑 Patients:             ${patients.length}`);
  console.log(`  📅 Appointments:         ${appointments.length} (${completedAppts.length} completed)`);
  console.log(`  📝 Prescriptions:        ${prescriptions.length}`);
  console.log(`  ⏰ Medication reminders: ${reminderDefs.length}`);
  console.log(`  🎫 Queue entries:        3`);
  console.log("═".repeat(50));
  console.log("\n🔑 All accounts use password: Password123\n");
  console.log("🏥 Hospital emails:");
  hospitals.forEach((h) => console.log(`   ${h.email}`));
  console.log("\n👨‍⚕️  Doctor emails:");
  doctorDefs.slice(0, 5).forEach((d) => console.log(`   ${d.email}`));
  console.log(`   ... and ${doctorDefs.length - 5} more`);
  console.log("\n🧑‍🤝‍🧑 Patient emails:");
  patientDefs.slice(0, 5).forEach((p) => console.log(`   ${p.email}`));
  console.log(`   ... and ${patientDefs.length - 5} more\n`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
