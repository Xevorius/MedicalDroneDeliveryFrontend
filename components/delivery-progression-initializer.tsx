"use client"

import { useEffect } from "react"
import { resumeDeliveryProgressions } from "lib/delivery-progression"

/**
 * Component to initialize delivery progression system on app start
 * This ensures that any in-progress deliveries continue their automatic progression
 * even after page reloads or browser restarts
 */
export function DeliveryProgressionInitializer() {
  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      // Resume any in-progress delivery progressions
      resumeDeliveryProgressions()
      
      console.log('📦 Delivery progression system initialized')
    }
  }, [])

  // This component renders nothing - it's just for initialization
  return null
}
