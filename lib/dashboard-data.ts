import { 
  mockUser, 
  mockDeliveries, 
  mockStats, 
  mockPatientUser, 
  mockPatientDeliveries 
} from "./mock-data"

// Types that define our data structure
export interface User {
  id: string
  name: string
  email: string
  role: string
  hospital: string
  avatar: string
  joinedAt: Date
  healthId?: string // For patients
  assignedDoctor?: string // For patients
  doctorId?: string // For patients
}

export interface Delivery {
  id: string
  medicationName: string
  patientId: string
  patientName?: string // For doctor's view
  status: "pending" | "in-transit" | "delivered" | "cancelled"
  priority: "routine" | "urgent" | "emergency"
  requestedAt: Date
  deliveredAt: Date | null
  estimatedTime: number
  actualTime: number | null
  droneId: string | null
  distance: string
  cost: number
  requestedBy: "doctor" | "patient"
  approvalStatus: "pending" | "approved" | "denied" | "auto-approved"
  isRecurring?: boolean // For patient view
  nextDelivery?: Date | null // For patient view
  quantity?: string // Amount requested (e.g., "30 tablets", "1 bottle")
  dosage?: string // Medication strength (e.g., "10mg", "500mg")
  notes?: string // Additional notes from patient or doctor
  prescriptionId?: string // Reference to prescription
  doctorId?: string // Assigned doctor for approval
  approvedBy?: string // Doctor who approved/denied
  approvedAt?: Date // When approved/denied
  isEmergency?: boolean // Emergency request flag
}

export interface DashboardStats {
  totalDeliveries: number
  successRate: number
  averageDeliveryTime: number
  costSavings: number
  emergencyDeliveries: number
  routineDeliveries: number
}

export interface DashboardData {
  user: User
  deliveries: Delivery[]
  stats: DashboardStats
}

// Data fetching functions - Demo only
export async function getDemoData(
  userType: "doctor" | "patient" = "doctor"
): Promise<DashboardData> {
  // Always return mock data for demo
  if (userType === "patient") {
    return {
      user: mockPatientUser,
      deliveries: mockPatientDeliveries,
      stats: {
        totalDeliveries: 12,
        successRate: 100,
        averageDeliveryTime: 18.5,
        costSavings: 340,
        emergencyDeliveries: 2,
        routineDeliveries: 10,
      },
    }
  }
  
  return {
    user: mockUser,
    deliveries: mockDeliveries,
    stats: mockStats,
  }
}

// Legacy function for backward compatibility - now just calls getDemoData
export async function getDashboardData(
  _userId?: string, 
  _useMockData = true, // Always true now
  userType: "doctor" | "patient" = "doctor"
): Promise<DashboardData> {
  return getDemoData(userType)
}

// Remove the complexity - always use demo data
export function shouldUseMockData(_searchParams?: URLSearchParams): boolean {
  return true // Always true for demo-only version
}
