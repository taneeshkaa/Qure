🏥 Qure
The High-Velocity Healthcare Ecosystem

Qure is a frictionless healthcare management platform designed to eliminate medical bureaucracy by synchronizing Patients, Doctors, and Chemists into a single, real-time workflow. Built with a serverless Neon PostgreSQL architecture, Qure transforms the traditional, fragmented hospital visit into an automated, "gravity-defying" experience.

⚡ Tech Stack
Frontend: React.js, Tailwind CSS, Framer Motion
Backend: Node.js, Express.js
Database: Neon DB (Serverless PostgreSQL)
Environment: Antigravity (VS Code Wrapper)
Real-time: WebSockets (Socket.io) for instant prescription routing

🚀 Project Phases & Logic
Phase 1: Deep Registry & Identity
Hierarchical Onboarding: Advanced geographic mapping (State > City > Hospital) for accurate discovery.
Staff Inventory: Comprehensive hospital profiles including ownership details and a full roster of doctors categorized by specialty.
Patient Personas: Secure storage of vitals, blood groups, allergies, and chronic conditions established at registration.
Phase 2: Intelligent Discovery & Booking
Symptom-to-Specialist Mapping: A smart search engine that maps user-described problems (e.g., "pancreas") to the correct experts (e.g., Gastroenterologists).
Transactional Appointment Suite: High-integrity booking using Neon DB transactions to manage real-time slot availability and sequential Token Generation (e.g., 23 → 24).
Automated Pulse: Precision reminders triggered 24 hours and 1 hour before the appointment.
Phase 3: Clinical & Pharmacy Operations
The Doctor’s Window: Instant retrieval of the Patient Card (history + booking notes) the moment a token is called.
Advance Packing Loop: Digital prescriptions are pushed instantly to the internal hospital chemist while the patient is still in consultation.
Anti-Scam Handover: A secure protocol where the chemist reveals the patient’s Name/Phone only after the Token Number is provided, ensuring the right meds reach the right hands.
Phase 4: Admin Control & Clinical Data
Global Dashboard: A master interface for Admins to manage the ecosystem, featuring the ability to delete or suspend Hospitals, Doctors, Pharmacies, or Patients.
Patient Attachments: A dedicated upload system for patients to attach test results, old prescriptions, or medicine images during booking to provide doctors with full clinical context.

🛡️ Security & Integrity
Soft Deletes: Admin actions use deleted_at timestamps to preserve historical data integrity.
Privacy-First Pharmacy: Sensitive patient data is hidden until the physical verification step at the chemist's window.
File Handling: Secure cloud storage references for all medical attachments to keep the Neon DB lightweight and fast.

📦 Installation (Development)
Clone the repo: git clone https://github.com/your-username/qure.git
Install Backend: cd backend && npm install
Install Frontend: cd frontend && npm install
Configure .env: Add your Neon DB Connection String and API Keys.
Run: npm start