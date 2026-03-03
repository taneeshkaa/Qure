Here is the updated Frontend Design Document for Phase 2. I have removed the specific external references while maintaining the high-end, fluid logic and the "Antigravity" aesthetic you requested.

Design Document: Qure Frontend (Phase 2)
Project: Qure (Patient Experience & Discovery)

Stack: React.js, Tailwind CSS, Framer Motion (for physics-based transitions).

Concept: "The Seamless Journey"

1. Feature 1: The Keyword-Intelligent Search
The search bar acts as a bridge between common language and medical specialization.

Symptom-to-Specialty Logic: As the user types keywords like "pancreas," the frontend logic (supported by the backend mapping) identifies the relevant specialty—in this case, Gastroenterologist.

Visual Routing: The UI displays a live "Mapping" indicator. For example: Searching for: Pancreas → Found: Gastroenterology.

Doctor-Direct Search: Users can bypass symptoms and search for a doctor's name directly. The result card will prominently display the specific Hospital Name where that doctor is currently active.

2. Feature 2: Hospital & Doctor Discovery Cards
Results are displayed in interactive, expandable cards to maintain a clean interface.

Interaction Logic: Clicking a Hospital card triggers a transition to show the roster of doctors available there.

Availability Badges: Real-time indicators showing if a doctor has open slots for the current day.

3. Feature 3: The Integrated Appointment Suite
Since the patient is already registered, the UI focuses purely on the current booking details.

Condition Textbox: A dedicated area for the user to write their specific problem. This data is passed to the backend to be included in the final "Token Card."

The Slot Grid: * Logic: A dynamic grid that displays date and time periods.

Real-time Availability: The UI fetches data from Neon DB to "ghost out" or disable slots that are already booked.

User Choice: Patients can browse and select their favorite available slot with a single click.

4. Feature 4: The Digital Token Card
Upon clicking "Book," the system processes the transaction and generates a confirmation card.

Token Logic: The UI displays the sequential token number assigned by the backend (e.g., Token #24).

Card Aggregation: The card visually bundles:

Registration Data: Full name, phone, blood group, allergies, and chronic diseases.

Booking Data: The specific problem description, the hospital/doctor names, and the confirmed time slot.

5. Feature 5: The Notification & Reminder UI
Logic: The frontend displays a persistent "Upcoming Appointment" countdown.

States: Visual alerts change color or style as the "1 Day" and "1 Hour" reminder windows are hit, ensuring the user is prepared for their visit.

6. Technical Stack & Logic Flow
Language: React.js.

Styling: Tailwind CSS for a modern, minimalist layout.

Animation: Framer Motion to handle the "Antigravity" feel—making cards feel light and transitions feel fluid.

Data Sync: Using Neon DB as the source of truth, ensuring that slot availability is updated instantly across all users to prevent double-booking.

Error Handling Logic
Concurrency Collision: If a user selects a slot that was just taken by another patient, the frontend displays a clear, non-intrusive error message: "This slot was just booked. Please select your next favorite time."

Incomplete Data: If the user tries to book without writing in the problem description box, the field will pulse to guide the user's attention.