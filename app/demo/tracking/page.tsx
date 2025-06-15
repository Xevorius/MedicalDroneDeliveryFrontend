"use client"

import { useState, useEffect } from "react"
import { DroneTracking } from "components/drone-tracking"
import { DemoNavigation } from "components/demo-navigation"
import { Button } from "components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "components/ui/card"
import { Badge } from "components/ui/badge"
import { Play, RotateCcw, Clock, Package, Plane } from "lucide-react"
import { type Delivery } from "lib/dashboard-data"
import { 
  startDeliveryProgression, 
  clearDeliveryProgression, 
  resumeDeliveryProgressions,
  getDeliveryProgression,
  clearAllProgressions 
} from "lib/delivery-progression"

// Mock delivery for demo purposes
const mockDelivery: Delivery = {
  id: "DEL-DEMO-001",
  medicationName: "Insulin Rapid-Acting",
  patientId: "P-12847",
  status: "pending",  priority: "urgent",
  requestedAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
  deliveredAt: null,
  estimatedTime: 1, // Shorter time for demo purposes (1 minute)
  actualTime: null,
  droneId: null,
  distance: "2.3 km",
  cost: 45.00,
  requestedBy: "patient",
  approvalStatus: "approved" // Start as approved for demo
}

export default function TrackingDemoPage() {
  const [selectedStatus, setSelectedStatus] = useState<'pending' | 'in-transit' | 'delivered'>('pending')
  const [demoDelivery, setDemoDelivery] = useState<Delivery>(mockDelivery)
  const [isProgressionActive, setIsProgressionActive] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
    // Check for active progression on mount
  useEffect(() => {
    resumeDeliveryProgressions()
    
    const progression = getDeliveryProgression(mockDelivery.id)
    if (progression) {
      setIsProgressionActive(true)
      
      // Calculate remaining time
      const now = new Date()
      const elapsedMinutes = (now.getTime() - progression.approvedAt.getTime()) / (1000 * 60)
      const totalTime = progression.preparationTime + progression.estimatedTime
      const remaining = Math.max(0, totalTime - elapsedMinutes)
      setTimeRemaining(remaining)
    }
  }, [])

  // Periodic check for progression completion (fallback mechanism)
  useEffect(() => {
    if (!isProgressionActive) return

    const progressionChecker = setInterval(() => {
      const progression = getDeliveryProgression(mockDelivery.id)
      if (!progression && isProgressionActive) {
        console.log('🔄 Periodic check: Progression completed - updating to delivered')
        setSelectedStatus('delivered')
        setIsProgressionActive(false)
        setTimeRemaining(null)
      }
    }, 2000) // Check every 2 seconds

    return () => clearInterval(progressionChecker)
  }, [isProgressionActive])
  
  // Update delivery status based on manual selection or automatic progression
  useEffect(() => {
    setDemoDelivery(prev => ({
      ...prev,
      status: selectedStatus,
      deliveredAt: selectedStatus === 'delivered' ? new Date() : null,
      droneId: selectedStatus === 'in-transit' || selectedStatus === 'delivered' ? 'DR-405' : null
    }))
  }, [selectedStatus])  // Listen for storage events to update delivery status from progression
  useEffect(() => {
    const handleStorageChange = () => {
      console.log('📡 Storage event detected in demo tracking page')
      
      // Check progression and update status accordingly
      const progression = getDeliveryProgression(mockDelivery.id)
      if (progression) {
        console.log('🔍 Found active progression:', progression)
        
        // Calculate current status based on progression timing
        const now = new Date()
        const elapsedMinutes = (now.getTime() - progression.approvedAt.getTime()) / (1000 * 60)
        
        console.log(`⏱️ Elapsed time: ${elapsedMinutes.toFixed(2)} minutes`)
        console.log(`📋 Preparation time: ${progression.preparationTime} minutes`)
        console.log(`🚁 Estimated time: ${progression.estimatedTime} minutes`)
        console.log(`⏰ Total time: ${progression.preparationTime + progression.estimatedTime} minutes`)
        
        if (elapsedMinutes >= (progression.preparationTime + progression.estimatedTime)) {
          console.log('✅ Setting status to delivered')
          setSelectedStatus('delivered')
          setIsProgressionActive(false)
          setTimeRemaining(null)
        } else if (elapsedMinutes >= progression.preparationTime) {
          console.log('🚁 Setting status to in-transit')
          setSelectedStatus('in-transit')
          const remaining = (progression.preparationTime + progression.estimatedTime) - elapsedMinutes
          setTimeRemaining(remaining)
        } else {
          console.log('📋 Setting status to pending')
          setSelectedStatus('pending')
          const remaining = (progression.preparationTime + progression.estimatedTime) - elapsedMinutes
          setTimeRemaining(remaining)
        }
      } else {
        console.log('⚠️ No active progression found - progression completed')
        // If no progression exists, it means it completed successfully
        if (isProgressionActive) {
          console.log('✅ Progression completed - setting to delivered')
          setSelectedStatus('delivered')
          setIsProgressionActive(false)
          setTimeRemaining(null)
        }
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [isProgressionActive])
    // Update time remaining every second
  useEffect(() => {
    if (!isProgressionActive || timeRemaining === null) return
    
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null) return null
        
        const newTime = prev - (1/60) // Subtract 1 second (in minutes)
        
        // Don't immediately stop when timer hits 0 - give progression time to complete
        if (newTime <= 0) {
          // Check if progression is actually complete
          const progression = getDeliveryProgression(mockDelivery.id)
          if (!progression) {
            // Progression is truly complete, set to delivered and stop
            console.log('⏰ Timer expired and progression complete - setting to delivered')
            setSelectedStatus('delivered')
            setIsProgressionActive(false)
            return null
          } else {
            // Progression still active, give it a few more seconds
            console.log('⏰ Timer expired but progression still active - extending time')
            return Math.max(0, newTime) // Keep at 0 but don't go negative
          }
        }
        
        return newTime
      })
    }, 1000)
    
    return () => clearInterval(interval)
  }, [isProgressionActive, timeRemaining])
  
  const startAutomaticProgression = () => {
    console.log("🚁 Starting automatic delivery progression demo")
    
    // Reset delivery to approved/pending state
    setSelectedStatus('pending')
    setDemoDelivery({
      ...mockDelivery,
      status: 'pending',
      approvalStatus: 'approved',
      requestedAt: new Date(),
      deliveredAt: null,
      droneId: null
    })
      // Start automatic progression
    startDeliveryProgression(
      mockDelivery.id,
      mockDelivery.patientId,
      "DOC-123", // Mock doctor ID
      1, // 1 minute estimated time for demo
      1  // 1 minute preparation time
    )
    
    setIsProgressionActive(true)
    setTimeRemaining(2) // 1 minute prep + 1 minute delivery
  }
  
  const resetDemo = () => {
    console.log("🔄 Resetting delivery progression demo")
    
    // Clear progression
    clearDeliveryProgression(mockDelivery.id)
    setIsProgressionActive(false)
    setTimeRemaining(null)
    
    // Reset delivery state
    setSelectedStatus('pending')
    setDemoDelivery({
      ...mockDelivery,
      status: 'pending',
      requestedAt: new Date(),
      deliveredAt: null,
      droneId: null
    })
  }
  
  const clearAllDemos = () => {
    clearAllProgressions()
    resetDemo()
  }
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Demo Navigation */}
          <DemoNavigation />
          
          {/* Automatic Progression Demo */}
          <Card className="border-2 border-dashed border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Automatic Delivery Progression Demo
              </CardTitle>
              <CardDescription>
                Watch a complete delivery lifecycle: Doctor Approval → Medication Preparation (1 min) → In Transit (1 min) → Delivered
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Progression Status */}
                {isProgressionActive && timeRemaining !== null && (
                  <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900 dark:text-blue-100">
                        Automatic Progression Active
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Time remaining: {Math.max(0, timeRemaining).toFixed(1)} minutes
                      </p>
                    </div>
                    <Badge variant="secondary" className="ml-auto">
                      {selectedStatus === 'pending' && timeRemaining > 5 ? 'Preparation' : 
                       selectedStatus === 'in-transit' ? 'In Transit' : 'Completed'}
                    </Badge>
                  </div>
                )}
                
                {/* Demo Controls */}
                <div className="flex gap-3">
                  <Button 
                    onClick={startAutomaticProgression}
                    disabled={isProgressionActive}
                    className="flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Start Auto Progression (2 min demo)
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={resetDemo}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset Demo
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={clearAllDemos}
                    className="flex items-center gap-2"
                    size="sm"
                  >
                    Clear All
                  </Button>
                </div>
                
                {/* Timeline Visual */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className={`p-3 rounded-lg border ${
                    selectedStatus === 'pending' && isProgressionActive 
                      ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800' 
                      : selectedStatus !== 'pending' 
                        ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
                        : 'bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-800'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-4 w-4" />
                      <span className="font-medium text-sm">Preparation</span>
                      {selectedStatus !== 'pending' && <Badge variant="secondary">✓</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">1 minute</p>
                  </div>
                  
                  <div className={`p-3 rounded-lg border ${
                    selectedStatus === 'in-transit' && isProgressionActive 
                      ? 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800' 
                      : selectedStatus === 'delivered' 
                        ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
                        : 'bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-800'
                  }`}>                    <div className="flex items-center gap-2 mb-2">
                      <Plane className="h-4 w-4" />
                      <span className="font-medium text-sm">In Transit</span>
                      {selectedStatus === 'delivered' && <Badge variant="secondary">✓</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">1 minute</p>
                  </div>
                  
                  <div className={`p-3 rounded-lg border ${
                    selectedStatus === 'delivered' 
                      ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
                      : 'bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-800'
                  }`}>                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-4 w-4" />
                      <span className="font-medium text-sm">Delivered</span>
                      {selectedStatus === 'delivered' && <Badge variant="secondary">✓</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">Complete</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Manual Demo Controls */}
          <div className="bg-muted/50 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Manual Status Demo</h2>
            <p className="text-muted-foreground mb-4">
              Manually switch between delivery states to explore different tracking interfaces.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedStatus('pending')}
                disabled={isProgressionActive}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedStatus === 'pending' 
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                    : 'bg-background text-muted-foreground hover:bg-muted'
                } ${isProgressionActive ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Pending Status
              </button>
              <button
                onClick={() => setSelectedStatus('in-transit')}
                disabled={isProgressionActive}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedStatus === 'in-transit' 
                    ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                    : 'bg-background text-muted-foreground hover:bg-muted'
                } ${isProgressionActive ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                In Transit (Live Tracking)
              </button>
              <button
                onClick={() => setSelectedStatus('delivered')}
                disabled={isProgressionActive}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedStatus === 'delivered' 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-background text-muted-foreground hover:bg-muted'
                } ${isProgressionActive ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Delivered Status
              </button>
            </div>
            
            {isProgressionActive && (
              <p className="text-sm text-muted-foreground mt-2">
                Manual controls disabled during automatic progression
              </p>
            )}
          </div>

          {/* Tracking Component */}
          <DroneTracking delivery={demoDelivery} />
        </div>
      </div>
    </div>
  )
}
