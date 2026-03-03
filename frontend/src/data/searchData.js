import { doctors, hospitals } from './mockData';

/* ── Symptom → Specialty mapping ─────────────────────────────── */
export const SYMPTOM_MAP = {
    'chest pain': 'Cardiology', 'heart attack': 'Cardiology', 'heart': 'Cardiology', 'palpitation': 'Cardiology', 'blood pressure': 'Cardiology', 'hypertension': 'Cardiology', 'cardiac': 'Cardiology', 'shortness of breath': 'Cardiology', 'angina': 'Cardiology', 'arrhythmia': 'Cardiology', 'bypass': 'Cardiology',
    'headache': 'Neurology', 'migraine': 'Neurology', 'seizure': 'Neurology', 'epilepsy': 'Neurology', 'brain': 'Neurology', 'stroke': 'Neurology', 'tremor': 'Neurology', 'parkinson': 'Neurology', 'memory loss': 'Neurology', 'dizziness': 'Neurology', 'numbness': 'Neurology', 'nerve': 'Neurology',
    'stomach': 'Gastroenterology', 'pancreas': 'Gastroenterology', 'liver': 'Gastroenterology', 'acidity': 'Gastroenterology', 'ulcer': 'Gastroenterology', 'ibs': 'Gastroenterology', 'bloating': 'Gastroenterology', 'diarrhea': 'Gastroenterology', 'constipation': 'Gastroenterology', 'hepatitis': 'Gastroenterology', 'jaundice': 'Gastroenterology', 'gut': 'Gastroenterology', 'indigestion': 'Gastroenterology', 'nausea': 'Gastroenterology',
    'knee': 'Orthopedics', 'bone': 'Orthopedics', 'joint pain': 'Orthopedics', 'joint': 'Orthopedics', 'fracture': 'Orthopedics', 'back pain': 'Orthopedics', 'spine': 'Orthopedics', 'hip': 'Orthopedics', 'shoulder': 'Orthopedics', 'arthritis': 'Orthopedics', 'ligament': 'Orthopedics', 'cartilage': 'Orthopedics',
    'skin': 'Dermatology', 'rash': 'Dermatology', 'acne': 'Dermatology', 'eczema': 'Dermatology', 'psoriasis': 'Dermatology', 'hair loss': 'Dermatology', 'allergy': 'Dermatology', 'vitiligo': 'Dermatology', 'fungal infection': 'Dermatology', 'dark spots': 'Dermatology', 'itching': 'Dermatology',
    'child': 'Pediatrics', 'baby': 'Pediatrics', 'infant': 'Pediatrics', 'newborn': 'Pediatrics', 'kids': 'Pediatrics', 'growth': 'Pediatrics', 'vaccination': 'Pediatrics',
    'cancer': 'Oncology', 'tumor': 'Oncology', 'chemotherapy': 'Oncology', 'biopsy': 'Oncology', 'lymphoma': 'Oncology', 'leukemia': 'Oncology', 'malignant': 'Oncology',
    'kidney': 'Nephrology', 'dialysis': 'Nephrology', 'renal': 'Nephrology', 'kidney stone': 'Nephrology',
    'eye': 'Ophthalmology', 'vision': 'Ophthalmology', 'cataract': 'Ophthalmology', 'glaucoma': 'Ophthalmology', 'retina': 'Ophthalmology', 'blurred vision': 'Ophthalmology',
    'ear': 'ENT', 'nose': 'ENT', 'throat': 'ENT', 'sinus': 'ENT', 'tonsil': 'ENT', 'hearing': 'ENT', 'snoring': 'ENT',
    'pregnancy': 'Gynecology', 'menstrual': 'Gynecology', 'pcos': 'Gynecology', 'ovary': 'Gynecology', 'uterus': 'Gynecology', 'periods': 'Gynecology', 'fertility': 'Gynecology',
    'anxiety': 'Psychiatry', 'depression': 'Psychiatry', 'mental health': 'Psychiatry', 'stress': 'Psychiatry', 'insomnia': 'Psychiatry', 'ocd': 'Psychiatry', 'panic': 'Psychiatry', 'bipolar': 'Psychiatry',
    'fever': 'General Medicine', 'cold': 'General Medicine', 'cough': 'General Medicine', 'fatigue': 'General Medicine', 'diabetes': 'General Medicine', 'thyroid': 'General Medicine', 'weakness': 'General Medicine', 'flu': 'General Medicine', 'viral': 'General Medicine', 'infection': 'General Medicine',
};

/* Returns { keyword, specialty } or null */
export function detectSpecialty(query) {
    if (!query || query.trim().length < 2) return null;
    const q = query.toLowerCase().trim();
    // Longest match first for precision
    const sorted = Object.keys(SYMPTOM_MAP).sort((a, b) => b.length - a.length);
    for (const keyword of sorted) {
        if (q.includes(keyword)) return { keyword, specialty: SYMPTOM_MAP[keyword] };
    }
    return null;
}

/* Returns matched doctors + hospitals + the detected specialty */
export function smartSearch(query) {
    if (!query || query.trim().length < 2) return { doctors: [], hospitals: [], detection: null };
    const q = query.toLowerCase();
    const detection = detectSpecialty(q);

    const matchedDoctors = doctors.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.specialty.toLowerCase().includes(q) ||
        d.designation.toLowerCase().includes(q) ||
        (detection && d.specialty === detection.specialty)
    );

    const matchedHospitals = hospitals.filter(h =>
        h.name.toLowerCase().includes(q) ||
        h.city.toLowerCase().includes(q) ||
        h.specialties.some(s => s.toLowerCase().includes(q)) ||
        (detection && h.specialties.includes(detection.specialty))
    );

    return { doctors: matchedDoctors, hospitals: matchedHospitals, detection };
}

/* ── Slot generation ─────────────────────────────────────────── */
const SLOT_TIMES = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '12:00 PM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
    '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM',
];

/* Generates 6 days of slots (~20% booked, deterministic per doctor) */
export function generateSlots(doctorId) {
    const hash = doctorId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const today = new Date();
    const result = [];
    let daysPushed = 0;
    let offset = 0;

    while (daysPushed < 6) {
        const date = new Date(today);
        date.setDate(today.getDate() + offset);
        offset++;
        if (date.getDay() === 0) continue; // skip Sunday

        const dateStr = date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
        const isoDate = date.toISOString().split('T')[0];

        result.push({
            date: dateStr,
            isoDate,
            slots: SLOT_TIMES.map((time, i) => ({
                id: `${isoDate}-${i}`,
                date: dateStr,
                isoDate,
                time,
                booked: ((hash + daysPushed * 3 + i * 7) % 5 === 0),
            })),
        });
        daysPushed++;
    }
    return result;
}
