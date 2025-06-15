import { type Delivery } from "lib/dashboard-data"
import { type MedicineOrder } from "lib/medicine-data"
import { NotificationService } from "lib/notification-service"

// Local storage keys - now user-specific
const getPatientDeliveriesKey = (patientId: string) => `medifly_patient_deliveries_${patientId}`
const getDoctorDeliveriesKey = (doctorId: string) => `medifly_doctor_deliveries_${doctorId}`

// Interface for delivery request data
interface DeliveryRequestInput {
  medicines?: MedicineOrder[]
  isEmergency?: boolean
  urgencyLevel?: string
  specialInstructions?: string
  notes?: string
  prescriptionId?: string
}

// Helper to transform stored delivery data with proper date parsing
function transformStoredDelivery(stored: Record<string, unknown>): Delivery {
  return {
    id: stored.id as string,
    medicationName: stored.medicationName as string,
    patientId: stored.patientId as string,
    patientName: stored.patientName as string | undefined,
    status: stored.status as Delivery["status"],
    priority: stored.priority as Delivery["priority"],
    requestedAt: new Date(stored.requestedAt as string),
    deliveredAt: stored.deliveredAt ? new Date(stored.deliveredAt as string) : null,
    estimatedTime: stored.estimatedTime as number,
    actualTime: stored.actualTime as number | null,
    droneId: stored.droneId as string | null,
    distance: stored.distance as string,
    cost: stored.cost as number,
    requestedBy: stored.requestedBy as Delivery["requestedBy"],
    approvalStatus: stored.approvalStatus as Delivery["approvalStatus"],
    isRecurring: stored.isRecurring as boolean | undefined,
    nextDelivery: stored.nextDelivery ? new Date(stored.nextDelivery as string) : null,
    quantity: stored.quantity as string | undefined,
    dosage: stored.dosage as string | undefined,
    notes: stored.notes as string | undefined,
    prescriptionId: stored.prescriptionId as string | undefined
  }
}

// Delivery management functions
export function savePatientDelivery(delivery: Delivery, patientId?: string): void {
  if (typeof window === 'undefined') return
  
  // Get patient ID from delivery or parameter
  const targetPatientId = patientId || delivery.patientId
  if (!targetPatientId) {
    console.error('Patient ID is required to save delivery')
    return
  }
  
  const existing = getPatientDeliveries(targetPatientId)
  const updated = [delivery, ...existing.filter(d => d.id !== delivery.id)]
  
  localStorage.setItem(getPatientDeliveriesKey(targetPatientId), JSON.stringify(updated))
  
  // Also save to doctor deliveries if this is a patient request needing approval
  if (delivery.requestedBy === "patient" && delivery.doctorId) {
    const doctorDeliveries = getDoctorDeliveries(delivery.doctorId)
    const doctorUpdated = [delivery, ...doctorDeliveries.filter(d => d.id !== delivery.id)]
    localStorage.setItem(getDoctorDeliveriesKey(delivery.doctorId), JSON.stringify(doctorUpdated))
  }
}

export function getPatientDeliveries(patientId?: string): Delivery[] {
  if (typeof window === 'undefined') return []
  
  // If no patientId provided, try to get it from current patient registration
  if (!patientId) {
    // Import here to avoid circular dependency
    const { getPatientRegistration } = require('./registration-data')
    const registration = getPatientRegistration()
    if (!registration) return []
    patientId = registration.medicalInfo.healthId
  }
  
  const stored = localStorage.getItem(getPatientDeliveriesKey(patientId!))
  if (!stored) return []
  
  try {
    const parsed = JSON.parse(stored) as Record<string, unknown>[]
    return parsed.map(transformStoredDelivery)
  } catch {
    return []
  }
}

export function saveDoctorDelivery(delivery: Delivery, doctorId?: string): void {
  if (typeof window === 'undefined') return
  
  // Get doctor ID from delivery or parameter
  const targetDoctorId = doctorId || delivery.doctorId
  if (!targetDoctorId) {
    console.error('Doctor ID is required to save delivery')
    return
  }
  
  const existing = getDoctorDeliveries(targetDoctorId)
  const updated = [delivery, ...existing.filter(d => d.id !== delivery.id)]
  
  localStorage.setItem(getDoctorDeliveriesKey(targetDoctorId), JSON.stringify(updated))
}

export function getDoctorDeliveries(doctorId?: string): Delivery[] {
  if (typeof window === 'undefined') return []
  
  // If no doctorId provided, try to get it from current doctor session
  if (!doctorId) {
    // Import here to avoid circular dependency
    const { getDoctorSession } = require('./registration-data')
    const session = getDoctorSession()
    if (!session) return []
    doctorId = session.id
  }
  
  const stored = localStorage.getItem(getDoctorDeliveriesKey(doctorId!))
  if (!stored) return []
  
  try {
    const parsed = JSON.parse(stored) as Record<string, unknown>[]
    return parsed.map(transformStoredDelivery)
  } catch {
    return []
  }
}

export function updateDeliveryStatus(
  deliveryId: string, 
  updates: Partial<Delivery>, 
  userType: "patient" | "doctor",
  userId?: string
): void {
  if (typeof window === 'undefined') return
  
  if (userType === "patient") {
    // Get patient ID from parameter or try to get from registration
    let patientId = userId
    if (!patientId) {
      const { getPatientRegistration } = require('./registration-data')
      const registration = getPatientRegistration()
      if (!registration) return
      patientId = registration.medicalInfo.healthId
    }
    
    if (!patientId) return // Guard against undefined patient ID
    
    const deliveries = getPatientDeliveries(patientId)
    const updated = deliveries.map(d => 
      d.id === deliveryId ? { ...d, ...updates } : d
    )
    localStorage.setItem(getPatientDeliveriesKey(patientId), JSON.stringify(updated))
  } else {
    // Get doctor ID from parameter or try to get from session
    let doctorId = userId
    if (!doctorId) {
      const { getDoctorSession } = require('./registration-data')
      const session = getDoctorSession()
      if (!session) return
      doctorId = session.id
    }
    
    if (!doctorId) return // Guard against undefined doctor ID
    
    const deliveries = getDoctorDeliveries(doctorId)
    const updated = deliveries.map(d => 
      d.id === deliveryId ? { ...d, ...updates } : d
    )
    localStorage.setItem(getDoctorDeliveriesKey(doctorId), JSON.stringify(updated))
  }
}

export function approveDelivery(deliveryId: string, doctorId?: string, patientId?: string): void {
  // Update in both patient and doctor stores with user IDs
  if (patientId) {
    updateDeliveryStatus(deliveryId, { 
      approvalStatus: "approved",
      status: "pending" // Keep as pending initially, progression will handle the rest
    }, "patient", patientId)
  }
  
  if (doctorId) {
    updateDeliveryStatus(deliveryId, { 
      approvalStatus: "approved",
      status: "pending" // Keep as pending initially, progression will handle the rest
    }, "doctor", doctorId)
  }
  
  // Send approval notification
  if (patientId) {
    const deliveries = getPatientDeliveries(patientId)
    const delivery = deliveries.find(d => d.id === deliveryId)
    if (delivery) {
      NotificationService.sendOrderApprovedNotification(delivery, "Dr. Smith")
    }
  }
  
  // Start automatic delivery progression
  if (patientId && doctorId) {
    // Find the delivery to get estimated time
    const deliveries = getPatientDeliveries(patientId)
    const delivery = deliveries.find(d => d.id === deliveryId)
    if (delivery) {
      // Import progression service here to avoid circular dependency
      const { startDeliveryProgression } = require('./delivery-progression')
      
      // Calculate realistic preparation time (1-3 minutes based on delivery complexity)
      const preparationTime = delivery.priority === "emergency" ? 1 :
                             delivery.priority === "urgent" ? 2 : 3
      
      // Calculate actual delivery time (total estimated time minus preparation)
      const totalEstimatedTime = delivery.estimatedTime || 15
      const actualDeliveryTime = Math.max(totalEstimatedTime - preparationTime, 5) // At least 5 minutes delivery
      
      console.log(`🚁 Starting real delivery progression for ${deliveryId}:`)
      console.log(`📋 Preparation time: ${preparationTime} minutes (${delivery.priority} priority)`)
      console.log(`🚁 Delivery time: ${actualDeliveryTime} minutes`)
      console.log(`⏰ Total time: ${preparationTime + actualDeliveryTime} minutes`)
      
      startDeliveryProgression(
        deliveryId, 
        patientId, 
        doctorId, 
        actualDeliveryTime, // Use calculated delivery time
        preparationTime     // Use realistic preparation time
      )
    }
  }
}

export function denyDelivery(deliveryId: string, doctorId?: string, patientId?: string): void {
  // Send denial notification first
  if (patientId) {
    const deliveries = getPatientDeliveries(patientId)
    const delivery = deliveries.find(d => d.id === deliveryId)
    if (delivery) {
      NotificationService.sendOrderDeniedNotification(delivery, "Medical review required", "Dr. Smith")
    }
  }
  
  // Update in both patient and doctor stores with user IDs
  if (patientId) {
    updateDeliveryStatus(deliveryId, { 
      approvalStatus: "denied",
      status: "cancelled" 
    }, "patient", patientId)
  }
  
  if (doctorId) {
    updateDeliveryStatus(deliveryId, { 
      approvalStatus: "denied",
      status: "cancelled" 
    }, "doctor", doctorId)
  }
}

export function generateDeliveryId(): string {
  return `DEL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function createDeliveryFromRequest(
  requestData: DeliveryRequestInput, 
  userType: "patient" | "doctor",
  patientId?: string
): Delivery {
  const delivery: Delivery = {
    id: generateDeliveryId(),
    medicationName: requestData.medicines?.length 
      ? requestData.medicines.map((m: MedicineOrder) => m.medicineName).join(", ")
      : "Multiple medications",
    patientId: patientId ?? "PATIENT-001",
    patientName: userType === "doctor" ? "Patient Name" : undefined,
    status: requestData.isEmergency ? "in-transit" : "pending",
    priority: requestData.urgencyLevel === "emergency" ? "emergency" : 
              requestData.urgencyLevel === "urgent" ? "urgent" : "routine",
    requestedAt: new Date(),
    deliveredAt: null,
    estimatedTime: requestData.isEmergency ? 10 : 25,
    actualTime: null,
    droneId: null,
    distance: "2.5 km",
    cost: calculateDeliveryCost(requestData),
    requestedBy: userType,
    approvalStatus: requestData.isEmergency ? "auto-approved" : "pending",
    isRecurring: false,
    nextDelivery: null,
    quantity: requestData.medicines?.map((m: MedicineOrder) => `${m.quantity} ${m.unitType}`).join(", "),
    dosage: requestData.medicines?.map((m: MedicineOrder) => m.dosage).join(", "),
    notes: requestData.specialInstructions ?? requestData.notes,
    prescriptionId: requestData.prescriptionId
  }
  
  return delivery
}

function calculateDeliveryCost(requestData: DeliveryRequestInput): number {
  const baseCost = 15.00
  const emergencyFee = requestData.isEmergency ? 10.00 : 0
  const medicineCount = requestData.medicines?.length ?? 1
  const medicineMultiplier = medicineCount * 5.00
  
  return baseCost + emergencyFee + medicineMultiplier
}

// Function to update delivery approval status
export function updateDeliveryApprovalStatus(
  deliveryId: string, 
  newStatus: "approved" | "denied",
  doctorId: string
): boolean {
  if (typeof window === 'undefined') return false
  
  // Find the delivery first to get patient ID
  const doctorDeliveries = getDoctorDeliveries(doctorId)
  const targetDelivery = doctorDeliveries.find(d => d.id === deliveryId)
  if (!targetDelivery) return false
  
  // Update in patient deliveries
  const patientDeliveries = getPatientDeliveries(targetDelivery.patientId)
  const patientUpdated = patientDeliveries.map(delivery => 
    delivery.id === deliveryId 
      ? { 
          ...delivery, 
          approvalStatus: newStatus,
          status: newStatus === "approved" ? "pending" : "cancelled",
          approvedBy: doctorId,
          approvedAt: new Date()
        }
      : delivery
  )
  
  // Update in doctor deliveries
  const doctorUpdated = doctorDeliveries.map(delivery => 
    delivery.id === deliveryId 
      ? { 
          ...delivery, 
          approvalStatus: newStatus,
          status: newStatus === "approved" ? "pending" : "cancelled",
          approvedBy: doctorId,
          approvedAt: new Date()
        }
      : delivery
  )
    // Save both lists with user-specific keys
  localStorage.setItem(getPatientDeliveriesKey(targetDelivery.patientId), JSON.stringify(patientUpdated))
  localStorage.setItem(getDoctorDeliveriesKey(doctorId), JSON.stringify(doctorUpdated))    // Start automatic progression if approved
  if (newStatus === "approved") {
    // Send approval notification first
    NotificationService.sendOrderApprovedNotification(targetDelivery, "Dr. Smith")
    
    // Import progression service here to avoid circular dependency
    const { startDeliveryProgression } = require('./delivery-progression')
    
    // Calculate realistic preparation time (1-3 minutes based on delivery complexity)
    const preparationTime = targetDelivery.priority === "emergency" ? 1 : 
                           targetDelivery.priority === "urgent" ? 2 : 3
    
    // Calculate actual delivery time (total estimated time minus preparation)
    const totalEstimatedTime = targetDelivery.estimatedTime || 15
    const actualDeliveryTime = Math.max(totalEstimatedTime - preparationTime, 5) // At least 5 minutes delivery
    
    console.log(`🚁 Starting real delivery progression for ${deliveryId}:`)
    console.log(`📋 Preparation time: ${preparationTime} minutes (${targetDelivery.priority} priority)`)
    console.log(`🚁 Delivery time: ${actualDeliveryTime} minutes`)
    console.log(`⏰ Total time: ${preparationTime + actualDeliveryTime} minutes`)
    
    startDeliveryProgression(
      deliveryId, 
      targetDelivery.patientId, 
      doctorId, 
      actualDeliveryTime, // Use calculated delivery time
      preparationTime     // Use realistic preparation time
    )
  } else {
    // Send denial notification
    NotificationService.sendOrderDeniedNotification(targetDelivery, "Medical review required", "Dr. Smith")
  }
  
  return true
}

// Function to get deliveries for a specific doctor
export function getDeliveriesForDoctor(doctorId: string): Delivery[] {
  if (typeof window === 'undefined') return []
  
  // Get deliveries from the doctor's specific storage
  return getDoctorDeliveries(doctorId)
}

// Function to create delivery from patient request with proper doctor assignment
// Function overloads for better type safety
export function createDeliveryFromPatientRequest(
  requestData: DeliveryRequestInput, 
  patientId: string
): Delivery;
export function createDeliveryFromPatientRequest(
  requestData: DeliveryRequestInput, 
  patientId: string,
  doctorId: string
): Delivery;
export function createDeliveryFromPatientRequest(
  requestData: DeliveryRequestInput, 
  patientId: string,
  doctorId?: string
): Delivery {
  const now = new Date()
  const deliveryId = `DEL-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
  
  // Calculate estimated delivery details
  const baseDeliveryCost = 15.99
  const urgencyMultiplier = requestData.isEmergency ? 2.5 : 1
  const medicationCount = requestData.medicines?.length ?? 1
  const cost = baseDeliveryCost * urgencyMultiplier * medicationCount
  
  const estimatedTime = requestData.isEmergency ? 8 : 18
  const distance = `${(Math.random() * 5 + 1).toFixed(1)} km`
  
  // Get medication name for display
  const medicationName = requestData.medicines?.length 
    ? requestData.medicines.map(m => m.medicineName).join(", ")
    : "Custom medication request"
  
  const delivery: Delivery = {
    id: deliveryId,
    medicationName,
    patientId,
    status: requestData.isEmergency ? "pending" : "pending",
    priority: requestData.isEmergency ? "emergency" : "routine",
    requestedAt: now,
    deliveredAt: null,
    estimatedTime,
    actualTime: null,
    droneId: null,
    distance,
    cost,
    requestedBy: "patient",
    approvalStatus: requestData.isEmergency ? "auto-approved" : "pending",
    quantity: requestData.medicines?.[0]?.quantity?.toString(),
    dosage: requestData.medicines?.[0]?.dosage,
    notes: requestData.specialInstructions ?? requestData.notes,
    prescriptionId: requestData.prescriptionId,
    doctorId: doctorId ?? undefined,
    isEmergency: requestData.isEmergency
  }
  
  // Send notification for new order placed
  if (requestData.isEmergency) {
    NotificationService.sendEmergencyRequestNotification(delivery)
  } else {
    NotificationService.sendOrderPlacedNotification(delivery)
  }
  
  return delivery
}
