import { create } from 'zustand';

const useFormStore = create((set) => ({
    // ─── Identity ─────────────────────────────────────────────────
    identity: 'hospital', // 'hospital' | 'patient'
    setIdentity: (v) => set({ identity: v }),

    // ─── Hospital Flow ────────────────────────────────────────────
    hospitalData: {
        state: null,
        city: null,
        // Step 1: Location
        hospitalName: '',
        address: '',
        // Step 2: Staff roster
        doctors: [{ id: Date.now(), name: '', specialty: '' }],
        // Step 3: Ownership
        ownerName: '',
        contactPerson: '',
        primaryPhone: '',
        secondaryPhone: '',
        email: '',
        password: '',
    },
    setHospitalData: (patch) =>
        set((s) => ({ hospitalData: { ...s.hospitalData, ...patch } })),
    resetHospitalData: () =>
        set({
            hospitalData: {
                state: null, city: null, hospitalName: '', address: '',
                doctors: [{ id: Date.now(), name: '', specialty: '' }],
                ownerName: '', contactPerson: '', primaryPhone: '', secondaryPhone: '',
                email: '', password: '',
            },
        }),

    // ─── Patient Flow ─────────────────────────────────────────────
    patientData: {
        // Step 1: Identity
        name: '',
        email: '',
        password: '',
        // Step 2: Medical
        bloodGroup: '',
        gender: '',
        conditionNotes: '',
        allergies: [],
        medications: [],
        // Step 3: Emergency
        emergencyName: '',
        emergencyRelation: '',
        emergencyPhone: '',
    },
    setPatientData: (patch) =>
        set((s) => ({ patientData: { ...s.patientData, ...patch } })),
    resetPatientData: () =>
        set({
            patientData: {
                name: '', email: '', password: '', bloodGroup: '', gender: '',
                conditionNotes: '', allergies: [], medications: [],
                emergencyName: '', emergencyRelation: '', emergencyPhone: '',
            },
        }),
}));

export default useFormStore;
