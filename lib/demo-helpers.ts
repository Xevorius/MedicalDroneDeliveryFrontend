import { type Delivery } from "lib/dashboard-data"
import { type MedicineOrder } from "lib/medicine-data"

// Test data for demonstration
export const DEMO_MEDICINE_ORDERS: MedicineOrder[] = [
  {
    medicineId: "med-001",
    medicineName: "Ibuprofen",
    dosage: "400mg",
    quantity: 20,
    unitType: "tablets",
    instructions: "Take with food"
  },
  {
    medicineId: "med-006",
    medicineName: "Lisinopril",
    dosage: "10mg", 
    quantity: 30,
    unitType: "tablets",
    instructions: "Take once daily in morning"
  }
]

export function createTestDelivery(userType: "patient" | "doctor", isEmergency = false): Delivery {
  const now = new Date()
  const testId = `TEST-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
  
  return {
    id: testId,
    medicationName: isEmergency ? "Emergency Epinephrine Injection" : "Test Order - Multiple Medications",
    patientId: "PATIENT-TEST-001",
    patientName: userType === "doctor" ? "John Doe (Test Patient)" : undefined,
    status: isEmergency ? "in-transit" : "pending",
    priority: isEmergency ? "emergency" : "routine",
    requestedAt: now,
    deliveredAt: null,
    estimatedTime: isEmergency ? 8 : 25,
    actualTime: null,
    droneId: null,
    distance: "1.8 km",
    cost: isEmergency ? 45.00 : 25.00,
    requestedBy: userType,
    approvalStatus: isEmergency ? "auto-approved" : "pending",
    isRecurring: false,
    nextDelivery: null,
    quantity: "20 tablets, 30 tablets",
    dosage: "400mg, 10mg",
    notes: isEmergency ? "Emergency request - patient experiencing severe allergic reaction" : "Regular prescription refill",
    prescriptionId: `RX-${Date.now()}-TEST`
  }
}

export function addTestOrders() {
  // This function can be called to add test orders for demonstration
  return {
    patientOrder: createTestDelivery("patient", false),
    emergencyOrder: createTestDelivery("patient", true),
    doctorOrder: createTestDelivery("doctor", false)
  }
}
