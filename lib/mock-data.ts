// Mock data that mirrors the real data structure

// Doctor/Provider Mock Data
export const mockUser = {
  id: "mock-user-1",
  name: "Dr. Sarah Johnson",
  email: "sarah.johnson@stmaryshospital.com",
  role: "Chief Medical Officer",
  hospital: "St. Mary's Medical Center",
  avatar: "/avatars/dr-johnson.jpg",
  joinedAt: new Date("2024-01-15"),
}

// Patient Mock Data
export const mockPatientUser = {
  id: "mock-patient-1",
  name: "Emma Rodriguez",
  email: "emma.rodriguez@email.com",
  role: "Patient",
  hospital: "St. Mary's Medical Center", // Their assigned hospital
  avatar: "/avatars/emma.jpg",
  joinedAt: new Date("2024-03-20"),
  healthId: "HID-847291",
  assignedDoctor: "Dr. Sarah Johnson",
  doctorId: "mock-user-1",
}

// Doctor's view - deliveries they manage for all patients
export const mockDeliveries = [
  {
    id: "del-001",
    medicationName: "Insulin Rapid-Acting",
    patientId: "P-12847",
    patientName: "Emma Rodriguez",
    status: "delivered" as const,
    priority: "urgent" as const,
    requestedAt: new Date("2025-06-10T14:30:00"),
    deliveredAt: new Date("2025-06-10T14:45:00"),
    estimatedTime: 15,
    actualTime: 15,
    droneId: "DR-405",
    distance: "2.3 km",
    cost: 45.00,
    requestedBy: "doctor" as const,
    approvalStatus: "approved" as const,
    quantity: "1 vial (3ml)",
    dosage: "100 units/ml",
    prescriptionId: "RX-2025-001847",
  },
  {
    id: "del-002", 
    medicationName: "Epinephrine Auto-Injector",
    patientId: "P-15923",
    patientName: "Michael Chen",
    status: "in-transit" as const,
    priority: "emergency" as const,
    requestedAt: new Date("2025-06-10T15:20:00"),
    deliveredAt: null,
    estimatedTime: 12,
    actualTime: null,
    droneId: "DR-307",
    distance: "1.8 km",
    cost: 35.00,    requestedBy: "patient" as const,
    approvalStatus: "auto-approved" as const, // Emergency bypasses approval
  },
  {
    id: "del-003",
    medicationName: "Blood Pressure Monitor",
    patientId: "P-18456",
    patientName: "Robert Wilson",
    status: "pending" as const,
    priority: "routine" as const,
    requestedAt: new Date("2025-06-10T16:00:00"),
    deliveredAt: null,
    estimatedTime: 20,
    actualTime: null,
    droneId: null,
    distance: "4.1 km",    cost: 55.00,
    requestedBy: "patient" as const,
    approvalStatus: "pending" as const, // Needs doctor approval
    quantity: "30 tablets",
    dosage: "10mg",
    notes: "Patient reports running low on current supply. Regular prescription refill needed.",
    prescriptionId: "RX-2025-002441",
  },
  {
    id: "del-004",
    medicationName: "Oxygen Tank - Portable",
    patientId: "P-11234",
    patientName: "Linda Foster",
    status: "delivered" as const,
    priority: "urgent" as const,
    requestedAt: new Date("2025-06-10T13:15:00"),
    deliveredAt: new Date("2025-06-10T13:28:00"),
    estimatedTime: 18,
    actualTime: 13,
    droneId: "DR-201",
    distance: "3.2 km",
    cost: 75.00,    requestedBy: "doctor" as const,
    approvalStatus: "approved" as const,
  },
]

// Patient's view - only their own deliveries
export const mockPatientDeliveries = [
  {
    id: "del-001",
    medicationName: "Insulin Rapid-Acting",
    patientId: "P-12847",
    status: "delivered" as const,
    priority: "urgent" as const,
    requestedAt: new Date("2025-06-10T14:30:00"),
    deliveredAt: new Date("2025-06-10T14:45:00"),
    estimatedTime: 15,
    actualTime: 15,
    droneId: "DR-405",
    distance: "2.3 km",
    cost: 45.00,
    requestedBy: "doctor" as const,
    approvalStatus: "approved" as const,
    isRecurring: true,
    nextDelivery: new Date("2025-06-17T14:30:00"), // Weekly insulin
  },
  {
    id: "del-005",
    medicationName: "Metformin 500mg",
    patientId: "P-12847", 
    status: "delivered" as const,
    priority: "routine" as const,
    requestedAt: new Date("2025-06-05T10:00:00"),
    deliveredAt: new Date("2025-06-05T10:22:00"),
    estimatedTime: 25,
    actualTime: 22,
    droneId: "DR-102",
    distance: "2.3 km", 
    cost: 25.00,
    requestedBy: "doctor" as const,
    approvalStatus: "approved" as const,
    isRecurring: true,
    nextDelivery: new Date("2025-07-05T10:00:00"), // Monthly medication
  },
  {
    id: "del-006",
    medicationName: "Emergency Inhaler Request",
    patientId: "P-12847",
    status: "pending" as const,
    priority: "urgent" as const,
    requestedAt: new Date("2025-06-10T17:30:00"),
    deliveredAt: null,
    estimatedTime: 15,
    actualTime: null,
    droneId: null,
    distance: "2.3 km",    cost: 40.00,
    requestedBy: "patient" as const,
    approvalStatus: "pending" as const, // Waiting for doctor approval
    isRecurring: false,
    nextDelivery: null,
    quantity: "1 inhaler",
    dosage: "90mcg per dose",
    notes: "Emergency request - patient's current inhaler is empty and experiencing shortness of breath. Has backup albuterol but prefers prescribed medication.",
    prescriptionId: "RX-2025-001847-B",
  },
]

export const mockStats = {
  totalDeliveries: 156,
  successRate: 99.2,
  averageDeliveryTime: 16.5,
  costSavings: 12450,
  emergencyDeliveries: 23,
  routineDeliveries: 133,
}
