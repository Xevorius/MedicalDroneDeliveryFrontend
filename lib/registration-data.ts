export interface Hospital {
  id: string
  name: string
  address: string
  type: "public" | "private"
  specialties: string[]
}

export interface Doctor {
  id: string
  name: string
  specialty: string
  hospitalId: string
  experience: number
  languages: string[]
  rating: number
  patients: number
  avatar?: string
}

export interface PatientRegistration {
  id: string
  personalInfo: {
    firstName: string
    lastName: string
    dateOfBirth: string
    gender: "male" | "female" | "other"
    phone: string
    email: string
    profilePicture?: string
  }
  medicalInfo: {
    healthId: string
    bloodType: string
    allergies: string[]
    currentMedications: string[]
    emergencyContact: {
      name: string
      relationship: string
      phone: string
    }
  }
  preferences: {
    hospitalId: string
    doctorId: string
    preferredLanguage: string
    deliveryAddress: string
    deliveryInstructions?: string
  }
  registeredAt: Date
}

// Mock hospitals in Beijing
export const MOCK_HOSPITALS: Hospital[] = [
  {
    id: "hospital-1",
    name: "Beijing Union Medical College Hospital",
    address: "1 Shuaifuyuan Wangfujing, Dongcheng District, Beijing",
    type: "public",
    specialties: ["Internal Medicine", "Cardiology", "Surgery", "Neurology", "Oncology"]
  },
  {
    id: "hospital-2", 
    name: "Beijing Friendship Hospital",
    address: "95 Yong'an Road, Xicheng District, Beijing",
    type: "public",
    specialties: ["Family Medicine", "Endocrinology", "Orthopedics", "Gastroenterology"]
  },
  {
    id: "hospital-3",
    name: "Beijing International Medical Center",
    address: "Building C, Lufthansa Center, Chaoyang District, Beijing", 
    type: "private",
    specialties: ["Internal Medicine", "Pediatrics", "Dermatology", "Psychiatry"]
  }
]

// Mock doctors - 2 per hospital
export const MOCK_DOCTORS: Doctor[] = [
  // Beijing Union Medical College Hospital
  {
    id: "doctor-1",
    name: "Wei Chen",
    specialty: "Internal Medicine",
    hospitalId: "hospital-1",
    experience: 15,
    languages: ["Chinese", "English"],
    rating: 4.8,
    patients: 1250
  },
  {
    id: "doctor-2", 
    name: "Li Zhang",
    specialty: "Cardiology",
    hospitalId: "hospital-1",
    experience: 12,
    languages: ["Chinese", "English"],
    rating: 4.9,
    patients: 980
  },
  // Beijing Friendship Hospital
  {
    id: "doctor-3",
    name: "Ming Wang",
    specialty: "Family Medicine", 
    hospitalId: "hospital-2",
    experience: 8,
    languages: ["Chinese"],
    rating: 4.6,
    patients: 1450
  },
  {
    id: "doctor-4",
    name: "Yan Liu",
    specialty: "Endocrinology",
    hospitalId: "hospital-2", 
    experience: 10,
    languages: ["Chinese", "English"],
    rating: 4.7,
    patients: 760
  },
  // Beijing International Medical Center
  {
    id: "doctor-5",
    name: "John Smith",
    specialty: "Internal Medicine",
    hospitalId: "hospital-3",
    experience: 20,
    languages: ["English", "Chinese"],
    rating: 4.9,
    patients: 1100
  },
  {
    id: "doctor-6",
    name: "Sarah Johnson", 
    specialty: "Pediatrics",
    hospitalId: "hospital-3",
    experience: 14,
    languages: ["English", "Chinese"],
    rating: 4.8,
    patients: 890
  }
]

// Local storage keys
const PATIENT_STORAGE_KEY = "medifly_patient_registration"
const DOCTOR_SESSION_KEY = "medifly_doctor_session"

// Patient registration functions
export function savePatientRegistration(registration: PatientRegistration): void {
  localStorage.setItem(PATIENT_STORAGE_KEY, JSON.stringify(registration))
}

export function getPatientRegistration(): PatientRegistration | null {
  const stored = localStorage.getItem(PATIENT_STORAGE_KEY)
  if (!stored) return null
  
  try {
    const parsed = JSON.parse(stored)
    return {
      ...parsed,
      registeredAt: new Date(parsed.registeredAt)
    }
  } catch {
    return null
  }
}

export function clearPatientRegistration(): void {
  localStorage.removeItem(PATIENT_STORAGE_KEY)
}

// Doctor session functions  
export function saveDoctorSession(doctor: Doctor): void {
  localStorage.setItem(DOCTOR_SESSION_KEY, JSON.stringify(doctor))
}

export function getDoctorSession(): Doctor | null {
  const stored = localStorage.getItem(DOCTOR_SESSION_KEY)
  if (!stored) return null
  
  try {
    return JSON.parse(stored)
  } catch {
    return null
  }
}

export function clearDoctorSession(): void {
  localStorage.removeItem(DOCTOR_SESSION_KEY)
}

// Helper functions
export function getHospitalById(id: string): Hospital | undefined {
  return MOCK_HOSPITALS.find(h => h.id === id)
}

export function getDoctorById(id: string): Doctor | undefined {
  return MOCK_DOCTORS.find(d => d.id === id)
}

export function getDoctorsByHospital(hospitalId: string): Doctor[] {
  return MOCK_DOCTORS.filter(d => d.hospitalId === hospitalId)
}

export function generateHealthId(): string {
  // Generate a mock health ID
  const prefix = "BJ"
  const year = new Date().getFullYear()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `${prefix}${year}${random}`
}
