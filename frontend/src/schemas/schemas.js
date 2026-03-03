import { z } from 'zod';



export const hospitalSchema = z.object({
    // Step 1
    state: z.string().min(1, 'State is required'),
    city: z.string().min(1, 'City is required'),
    hospitalName: z.string().min(2, 'Hospital name is required'),
    address: z.string().min(5, 'Address is required'),
    // Step 2 — doctors validated individually
    // Step 3
    ownerName: z.string().min(2, 'Owner name is required'),
    contactPerson: z.string().min(2, 'Contact person is required'),
    primaryPhone: z.string().min(10, 'Enter a 10-digit phone number').max(15),
    secondaryPhone: z.string().min(10).max(15).optional().or(z.literal('')),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const doctorSchema = z.object({
    name: z.string().min(2, 'Doctor name is required'),
    specialty: z.string().min(1, 'Specialty is required'),
});

export const patientSchema = z.object({
    // Step 1
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    // Step 2
    bloodGroup: z.string().min(1, 'Blood group is required'),
    gender: z.string().min(1, 'Gender is required'),
    conditionNotes: z.string().max(500, 'Max 500 characters').optional(),
    allergies: z.array(z.string()).optional(),
    medications: z.array(z.string()).optional(),
    // Step 3
    emergencyName: z.string().min(2, 'Emergency contact name is required'),
    emergencyRelation: z.string().min(1, 'Relation is required'),
    emergencyPhone: z.string().min(10, 'Enter a 10-digit phone number').max(15),
});
