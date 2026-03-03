Gemini said
This is a solid foundation for the Antigravity backend. Shifting from MongoDB to Neon (PostgreSQL) is a smart move for a project like this; relational databases are much better at handling the strict hierarchies (State > City > Hospital) you've described.

Here is the technical design document for Phase 1.

Design Document: Antigravity Backend (Phase 1)
Project: Antigravity (VS Code Wrapper - Healthcare Integration)

Stack: Node.js, Express, Neon DB (PostgreSQL)

Scope: Identity & Access Management (Registration)

1. System Architecture
The backend will function as a RESTful API layer. Since we are using Neon, we will utilize a relational schema to ensure data integrity, especially for the geographical and hospital lookup features.

Tech Stack Details
Runtime: Node.js

Framework: Express.js

Database: Neon (Serverless PostgreSQL)

ORM: Prisma or Drizzle (Recommended for type safety with Neon)

2. Database Schema (Relational)
To support the "State > City > Hospital" dropdown logic, we will use a normalized structure. This prevents data duplication and allows for fast querying.

Tables
Table	Key Fields
Locations	id, state_name, city_name
Hospitals	id, location_id, hospital_name, contact_person, phone_1, phone_2 (opt)
Patients	id, full_name, email, phone, age, gender, address, blood_group
Medical_Profiles	patient_id, emergency_name, emergency_phone, allergies, medications, notes
3. API Endpoints
A. Onboarding / Metadata
These endpoints provide the data for your frontend dropdowns.

GET /api/v1/locations/states: Returns a list of all Indian states.

GET /api/v1/locations/cities?state=...: Returns cities based on the selected state.

GET /api/v1/locations/hospitals?city=...: Returns registered hospitals in that city.

B. Registration Logic
POST /api/v1/register/hospital
Mandatory: state, city, hospital_name, contact_person, phone_1

Optional: phone_2

Logic: Checks if the hospital entry already exists in the selected city; if not, creates a new record and returns a unique Hospital_ID.

POST /api/v1/register/patient
Fields: full_name, email, phone, age, gender, address, blood_group, emergency_contact_name, emergency_contact_phone, allergies, current_medications, condition_notes.

Logic: Validates email/phone uniqueness. Stores core identity in Patients table and medical history in Medical_Profiles table (linked via patient_id).

4. Implementation Details (Node/Express)
Middleware Requirements
Validation: Use joi or zod to enforce that "mandatory" fields are present before hitting the database.

Error Handling: A global error handler to manage Neon connection timeouts or unique constraint violations (e.g., trying to register an email that already exists).

Connection Strategy
Since Neon is serverless, we will use a connection pooler (like pg-pool) to manage database connections efficiently, ensuring the VS Code wrapper stays snappy and doesn't hang during high-latency periods.

5. Security Considerations
Input Sanitization: Crucial for PostgreSQL to prevent SQL injection.

Data Privacy: Patient data (allergies, medications) should be handled with care; consider encrypting the Medical_Profiles table rows at a later phase.