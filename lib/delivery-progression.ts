import { type Delivery } from "lib/dashboard-data"
import { updateDeliveryStatus, getPatientDeliveries, getDoctorDeliveries } from "lib/delivery-management"

// Track active progression timers
const activeTimers = new Map<string, NodeJS.Timeout[]>()

// Storage key for progression tracking
const PROGRESSION_STORAGE_KEY = 'medifly_delivery_progressions'

interface DeliveryProgression {
  deliveryId: string
  patientId: string
  doctorId?: string
  approvedAt: Date
  estimatedTime: number // in minutes
  preparationTime: number // time for medication preparation (default 1 minute)
}

// Get stored progressions
function getStoredProgressions(): DeliveryProgression[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(PROGRESSION_STORAGE_KEY)
    if (!stored) return []
    
    const progressions = JSON.parse(stored) as any[]
    return progressions.map(p => ({
      ...p,
      approvedAt: new Date(p.approvedAt)
    }))
  } catch {
    return []
  }
}

// Save progressions to storage
function saveProgressions(progressions: DeliveryProgression[]): void {
  if (typeof window === 'undefined') return
  
  localStorage.setItem(PROGRESSION_STORAGE_KEY, JSON.stringify(progressions))
}

// Add a delivery to automatic progression
function addDeliveryProgression(progression: DeliveryProgression): void {
  const existing = getStoredProgressions()
  const updated = [progression, ...existing.filter(p => p.deliveryId !== progression.deliveryId)]
  saveProgressions(updated)
}

// Remove a delivery from progression tracking
function removeDeliveryProgression(deliveryId: string): void {
  const existing = getStoredProgressions()
  const updated = existing.filter(p => p.deliveryId !== deliveryId)
  saveProgressions(updated)
}

// Start automatic progression for a delivery after doctor approval
export function startDeliveryProgression(
  deliveryId: string,
  patientId: string,
  doctorId?: string,
  estimatedTime: number = 15,
  preparationTime: number = 1
): void {
  if (typeof window === 'undefined') return
  
  console.log(`🚁 Starting automatic progression for delivery ${deliveryId}`)
  
  // Clear any existing timers for this delivery
  clearDeliveryProgression(deliveryId)
  
  const progression: DeliveryProgression = {
    deliveryId,
    patientId,
    doctorId,
    approvedAt: new Date(),
    estimatedTime,
    preparationTime
  }
  
  // Save progression info
  addDeliveryProgression(progression)
  
  const timers: NodeJS.Timeout[] = []
  
  // Step 1: Medication Preparation (1 minute after approval)
  const preparationTimer = setTimeout(() => {
    console.log(`📦 Medication preparation completed for delivery ${deliveryId}`)
    
    // Update delivery status to in-transit
    if (patientId) {
      updateDeliveryStatus(deliveryId, {
        status: "in-transit",
        droneId: `DR-${Math.floor(Math.random() * 999) + 100}`,
        dispatchedAt: new Date()
      }, "patient", patientId)
    }
    
    if (doctorId) {
      updateDeliveryStatus(deliveryId, {
        status: "in-transit",
        droneId: `DR-${Math.floor(Math.random() * 999) + 100}`,
        dispatchedAt: new Date()
      }, "doctor", doctorId)
    }
      // Trigger storage event for real-time updates
    console.log(`🔔 Triggering storage event for in-transit status`)
    window.dispatchEvent(new StorageEvent('storage', {
      key: patientId ? `medifly_patient_deliveries_${patientId}` : null,
      newValue: 'updated'
    }))
    
  }, preparationTime * 60 * 1000) // Convert minutes to milliseconds
  
  timers.push(preparationTimer)
    // Step 2: Delivery Completion (estimated time after going in-transit)
  const deliveryTimer = setTimeout(() => {
    console.log(`✅ Delivery completed for delivery ${deliveryId}`)
    
    const deliveredAt = new Date()
    const actualTime = Math.round((preparationTime + estimatedTime) + (Math.random() - 0.5) * 5) // Add some realistic variance
    
    // Update delivery status to delivered
    if (patientId) {
      console.log(`📦 Updating patient delivery ${deliveryId} to delivered status`)
      updateDeliveryStatus(deliveryId, {
        status: "delivered",
        deliveredAt,
        actualTime
      }, "patient", patientId)
    }
    
    if (doctorId) {
      console.log(`📦 Updating doctor delivery ${deliveryId} to delivered status`)
      updateDeliveryStatus(deliveryId, {
        status: "delivered",
        deliveredAt,
        actualTime
      }, "doctor", doctorId)
    }    // Clean up progression tracking after a small delay to allow UI updates
    setTimeout(() => {
      removeDeliveryProgression(deliveryId)
      clearDeliveryProgression(deliveryId)
    }, 1000) // 1 second delay for UI to update
    
    // Trigger storage event for real-time updates
    console.log(`🔔 Triggering storage event for delivery completion`)
    window.dispatchEvent(new StorageEvent('storage', {
      key: patientId ? `medifly_patient_deliveries_${patientId}` : null,
      newValue: 'updated'
    }))
    
  }, (preparationTime + estimatedTime) * 60 * 1000) // Total time from approval to delivery
  
  timers.push(deliveryTimer)
  
  // Store timers for cleanup
  activeTimers.set(deliveryId, timers)
}

// Clear progression timers for a delivery
export function clearDeliveryProgression(deliveryId: string): void {
  const timers = activeTimers.get(deliveryId)
  if (timers) {
    timers.forEach(timer => clearTimeout(timer))
    activeTimers.delete(deliveryId)
  }
}

// Resume progressions for deliveries that were in progress (on page reload)
export function resumeDeliveryProgressions(): void {
  if (typeof window === 'undefined') return
  
  const progressions = getStoredProgressions()
  const now = new Date()
  
  progressions.forEach(progression => {
    const elapsedMinutes = (now.getTime() - progression.approvedAt.getTime()) / (1000 * 60)
    
    // If delivery should already be completed, mark it as delivered
    if (elapsedMinutes >= (progression.preparationTime + progression.estimatedTime)) {
      console.log(`📦 Marking overdue delivery ${progression.deliveryId} as delivered`)
      
      const deliveredAt = new Date(progression.approvedAt.getTime() + (progression.preparationTime + progression.estimatedTime) * 60 * 1000)
      const actualTime = progression.preparationTime + progression.estimatedTime
      
      if (progression.patientId) {
        updateDeliveryStatus(progression.deliveryId, {
          status: "delivered",
          deliveredAt,
          actualTime
        }, "patient", progression.patientId)
      }
      
      if (progression.doctorId) {
        updateDeliveryStatus(progression.deliveryId, {
          status: "delivered",
          deliveredAt,
          actualTime
        }, "doctor", progression.doctorId)
      }
      
      removeDeliveryProgression(progression.deliveryId)
    }
    // If delivery should be in-transit but not yet delivered
    else if (elapsedMinutes >= progression.preparationTime) {
      console.log(`🚁 Marking delivery ${progression.deliveryId} as in-transit (resumed)`)
      
      if (progression.patientId) {
        updateDeliveryStatus(progression.deliveryId, {
          status: "in-transit",
          droneId: `DR-${Math.floor(Math.random() * 999) + 100}`,
          dispatchedAt: new Date(progression.approvedAt.getTime() + progression.preparationTime * 60 * 1000)
        }, "patient", progression.patientId)
      }
        if (progression.doctorId) {
        updateDeliveryStatus(progression.deliveryId, {
          status: "in-transit",
          droneId: `DR-${Math.floor(Math.random() * 999) + 100}`,
          dispatchedAt: new Date(progression.approvedAt.getTime() + progression.preparationTime * 60 * 1000)
        }, "doctor", progression.doctorId)
      }
      
      // Set timer for remaining delivery time
      const remainingTime = (progression.estimatedTime) - (elapsedMinutes - progression.preparationTime)
      if (remainingTime > 0) {
        const deliveryTimer = setTimeout(() => {
          console.log(`✅ Delivery completed for delivery ${progression.deliveryId} (resumed)`)
          
          const deliveredAt = new Date()
          const actualTime = Math.round((progression.preparationTime + progression.estimatedTime))
          
          if (progression.patientId) {
            updateDeliveryStatus(progression.deliveryId, {
              status: "delivered",
              deliveredAt,
              actualTime
            }, "patient", progression.patientId)
          }
          
          if (progression.doctorId) {
            updateDeliveryStatus(progression.deliveryId, {
              status: "delivered",
              deliveredAt,
              actualTime
            }, "doctor", progression.doctorId)
          }
          
          removeDeliveryProgression(progression.deliveryId)
          clearDeliveryProgression(progression.deliveryId)
          
          // Trigger storage event
          window.dispatchEvent(new StorageEvent('storage', {
            key: progression.patientId ? `medifly_patient_deliveries_${progression.patientId}` : null,
            newValue: 'updated'
          }))
          
        }, remainingTime * 60 * 1000)
        
        activeTimers.set(progression.deliveryId, [deliveryTimer])
      }
    }
    // If delivery is still in preparation phase
    else {
      console.log(`📋 Resuming preparation for delivery ${progression.deliveryId}`)
      
      const remainingPreparationTime = progression.preparationTime - elapsedMinutes
      
      // Resume the progression with remaining times
      const timers: NodeJS.Timeout[] = []
      
      if (remainingPreparationTime > 0) {
        const preparationTimer = setTimeout(() => {
          console.log(`📦 Medication preparation completed for delivery ${progression.deliveryId} (resumed)`)
          
          if (progression.patientId) {
            updateDeliveryStatus(progression.deliveryId, {
              status: "in-transit",
              droneId: `DR-${Math.floor(Math.random() * 999) + 100}`,
              dispatchedAt: new Date()
            }, "patient", progression.patientId)
          }
          
          if (progression.doctorId) {
            updateDeliveryStatus(progression.deliveryId, {
              status: "in-transit",
              droneId: `DR-${Math.floor(Math.random() * 999) + 100}`,
              dispatchedAt: new Date()
            }, "doctor", progression.doctorId)
          }
          
          // Trigger storage event
          window.dispatchEvent(new StorageEvent('storage', {
            key: progression.patientId ? `medifly_patient_deliveries_${progression.patientId}` : null,
            newValue: 'updated'
          }))
          
        }, remainingPreparationTime * 60 * 1000)
        
        timers.push(preparationTimer)
      }
      
      // Set delivery timer
      const totalRemainingTime = (progression.preparationTime + progression.estimatedTime) - elapsedMinutes
      if (totalRemainingTime > 0) {
        const deliveryTimer = setTimeout(() => {
          console.log(`✅ Delivery completed for delivery ${progression.deliveryId} (resumed)`)
          
          const deliveredAt = new Date()
          const actualTime = Math.round((progression.preparationTime + progression.estimatedTime))
          
          if (progression.patientId) {
            updateDeliveryStatus(progression.deliveryId, {
              status: "delivered",
              deliveredAt,
              actualTime
            }, "patient", progression.patientId)
          }
          
          if (progression.doctorId) {
            updateDeliveryStatus(progression.deliveryId, {
              status: "delivered",
              deliveredAt,
              actualTime
            }, "doctor", progression.doctorId)
          }
          
          removeDeliveryProgression(progression.deliveryId)
          clearDeliveryProgression(progression.deliveryId)
          
          // Trigger storage event
          window.dispatchEvent(new StorageEvent('storage', {
            key: progression.patientId ? `medifly_patient_deliveries_${progression.patientId}` : null,
            newValue: 'updated'
          }))
          
        }, totalRemainingTime * 60 * 1000)
        
        timers.push(deliveryTimer)
      }
      
      if (timers.length > 0) {
        activeTimers.set(progression.deliveryId, timers)
      }
    }
  })
}

// Get progression info for a delivery
export function getDeliveryProgression(deliveryId: string): DeliveryProgression | null {
  const progressions = getStoredProgressions()
  return progressions.find(p => p.deliveryId === deliveryId) || null
}

// Check if a delivery is in automatic progression
export function isDeliveryInProgression(deliveryId: string): boolean {
  return getDeliveryProgression(deliveryId) !== null
}

// Cleanup all progressions (for development/testing)
export function clearAllProgressions(): void {
  // Clear all timers
  activeTimers.forEach((timers, deliveryId) => {
    timers.forEach(timer => clearTimeout(timer))
  })
  activeTimers.clear()
  
  // Clear storage
  if (typeof window !== 'undefined') {
    localStorage.removeItem(PROGRESSION_STORAGE_KEY)
  }
  
  console.log('🧹 All delivery progressions cleared')
}
