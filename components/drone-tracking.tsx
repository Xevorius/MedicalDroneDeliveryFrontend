"use client"

import { useState, useEffect } from "react"
import { 
  MapPin, 
  Package, 
  Clock, 
  Navigation, 
  Battery, 
  Thermometer,
  Wind,
  Eye,
  CheckCircle,
  AlertTriangle,
  Plane,
  Phone,
  MessageCircle,
  Route,
  Bell,
  Shield
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "components/ui/card"
import { Badge } from "components/ui/badge"
import { Button } from "components/ui/button"
import { Progress } from "components/ui/progress"
import { type Delivery } from "lib/dashboard-data"

interface DroneTrackingProps {
  delivery: Delivery
}

// Mock drone data for demonstration
interface DroneData {
  id: string
  model: string
  currentLatitude: number
  currentLongitude: number
  batteryLevel: number
  temperature: number
  altitude: number
  speed: number
  windSpeed: number
  estimatedArrival: Date
  route: Array<{ lat: number; lng: number; timestamp: Date }>
}

interface DeliveryStep {
  id: string
  title: string
  description: string
  timestamp: Date | null
  status: 'completed' | 'current' | 'pending'
  icon: React.ComponentType<{ className?: string }>
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date)
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export function DroneTracking({ delivery }: DroneTrackingProps) {
  const [droneData, setDroneData] = useState<DroneData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [notifications, setNotifications] = useState<string[]>([])

  // Generate delivery timeline steps
  const getDeliverySteps = (): DeliveryStep[] => {
    const steps: DeliveryStep[] = [
      {
        id: 'order-placed',
        title: 'Order Placed',
        description: 'Your medication request has been received',
        timestamp: delivery.requestedAt,
        status: 'completed',
        icon: Package
      },
      {
        id: 'approval',
        title: delivery.approvalStatus === 'auto-approved' ? 'Auto-Approved' : 'Doctor Approval',
        description: delivery.approvalStatus === 'auto-approved' 
          ? 'Emergency order automatically approved' 
          : delivery.approvalStatus === 'approved' 
            ? 'Your doctor has approved this delivery'
            : 'Waiting for doctor approval',
        timestamp: delivery.approvalStatus === 'approved' ? new Date(delivery.requestedAt.getTime() + 2 * 60 * 1000) : null,
        status: delivery.approvalStatus === 'approved' || delivery.approvalStatus === 'auto-approved' ? 'completed' : 
               delivery.approvalStatus === 'pending' ? 'current' : 'pending',
        icon: Shield
      },
      {
        id: 'preparation',
        title: 'Medication Preparation',
        description: 'Your medication is being prepared for drone delivery',
        timestamp: delivery.status !== 'pending' ? new Date(delivery.requestedAt.getTime() + 5 * 60 * 1000) : null,
        status: delivery.status === 'pending' ? 'pending' : 'completed',
        icon: Package
      },
      {
        id: 'dispatch',
        title: 'Drone Dispatched',
        description: 'Delivery drone is en route to your location',
        timestamp: delivery.status === 'in-transit' || delivery.status === 'delivered' ? new Date(delivery.requestedAt.getTime() + 8 * 60 * 1000) : null,
        status: delivery.status === 'in-transit' ? 'current' : 
               delivery.status === 'delivered' ? 'completed' : 'pending',
        icon: Plane
      },
      {
        id: 'delivered',
        title: 'Delivered',
        description: 'Your medication has been successfully delivered',
        timestamp: delivery.deliveredAt,
        status: delivery.status === 'delivered' ? 'completed' : 'pending',
        icon: CheckCircle
      }
    ]
    return steps
  }

  // Simulate drone data updates
  useEffect(() => {
    // Initialize drone data
    const initializeDroneData = () => {
      const now = new Date()
      const estimatedArrival = new Date(now.getTime() + (delivery.estimatedTime * 60 * 1000))
      
      return {
        id: delivery.droneId || `DR-${Math.floor(Math.random() * 1000)}`,
        model: "MediFly Pro X1",
        currentLatitude: 40.7128 + (Math.random() - 0.5) * 0.01, // Mock NYC coordinates
        currentLongitude: -74.0060 + (Math.random() - 0.5) * 0.01,
        batteryLevel: 85 + Math.random() * 15,
        temperature: 22 + Math.random() * 8,
        altitude: 80 + Math.random() * 40,
        speed: 25 + Math.random() * 15,
        windSpeed: 5 + Math.random() * 10,
        estimatedArrival,
        route: generateRoute(estimatedArrival)
      }
    }

    const generateRoute = (arrivalTime: Date) => {
      const route = []
      const startTime = new Date()
      const duration = arrivalTime.getTime() - startTime.getTime()
      const points = 10
      
      for (let i = 0; i <= points; i++) {
        const progress = i / points
        const timestamp = new Date(startTime.getTime() + (duration * progress))
        route.push({
          lat: 40.7128 + (Math.random() - 0.5) * 0.02,
          lng: -74.0060 + (Math.random() - 0.5) * 0.02,
          timestamp
        })
      }
      return route
    }

    // Set initial data
    setTimeout(() => {
      setDroneData(initializeDroneData())
      setIsLoading(false)
    }, 1500)

    // Update drone position every 5 seconds if delivery is in transit
    const interval = delivery.status === "in-transit" ? setInterval(() => {
      setDroneData(prev => {
        if (!prev) return null
        
        return {
          ...prev,
          currentLatitude: prev.currentLatitude + (Math.random() - 0.5) * 0.001,
          currentLongitude: prev.currentLongitude + (Math.random() - 0.5) * 0.001,
          batteryLevel: Math.max(10, prev.batteryLevel - Math.random() * 2),
          speed: 25 + Math.random() * 15,
          windSpeed: 5 + Math.random() * 10
        }
      })
      setLastUpdate(new Date())
    }, 5000) : null

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [delivery])

  // Add notification system
  useEffect(() => {
    if (delivery.status === "in-transit" && droneData) {
      const newNotifications = []
      
      if (droneData.batteryLevel < 20) {
        newNotifications.push("⚡ Drone battery low - backup drone on standby")
      }
      
      if (droneData.windSpeed > 15) {
        newNotifications.push("🌪️ High wind conditions detected - adjusted route for safety")
      }
      
      if (delivery.priority === "emergency") {
        newNotifications.push("🚨 Emergency delivery in progress - priority routing active")
      }
      
      setNotifications(newNotifications)
    }
  }, [droneData, delivery.status, delivery.priority])

  const getDeliveryProgress = () => {
    if (delivery.status === "delivered") return 100
    if (delivery.status === "in-transit") {
      const elapsed = Date.now() - delivery.requestedAt.getTime()
      const estimated = delivery.estimatedTime * 60 * 1000
      return Math.min(90, (elapsed / estimated) * 100)
    }
    return 0
  }

  const getStatusColor = () => {
    switch (delivery.status) {
      case "delivered": return "text-green-600 bg-green-50"
      case "in-transit": return "text-blue-600 bg-blue-50"
      case "pending": return "text-yellow-600 bg-yellow-50"
      case "cancelled": return "text-red-600 bg-red-50"
      default: return "text-gray-600 bg-gray-50"
    }
  }

  // Enhanced map component
  const renderEnhancedMap = () => (
    <div className="relative bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 rounded-lg h-64 md:h-80 overflow-hidden">
      {/* Map Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      
      {/* Route Path */}
      <svg className="absolute inset-0 w-full h-full">
        <path
          d="M 50 250 Q 150 180 200 150 Q 280 120 350 100"
          stroke="#3b82f6"
          strokeWidth="3"
          strokeDasharray="5,5"
          fill="none"
          className="animate-pulse"
        />
      </svg>
      
      {/* Location Markers */}
      <div className="absolute bottom-6 left-12">
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-full px-3 py-1 shadow-lg border">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-medium">Hospital</span>
        </div>
      </div>
      
      <div className="absolute top-6 right-12">
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-full px-3 py-1 shadow-lg border">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-xs font-medium">Your Location</span>
        </div>
      </div>
      
      {/* Drone Position */}
      {droneData && (
        <div className="absolute transition-all duration-1000 ease-in-out" 
             style={{ 
               left: `${30 + (getDeliveryProgress() * 0.4)}%`, 
               top: `${60 - (getDeliveryProgress() * 0.3)}%` 
             }}>
          <div className="relative">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <Plane className="h-4 w-4 text-white transform rotate-45" />
            </div>
            {/* Drone Info Popup */}
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-lg px-2 py-1 shadow-lg border text-xs whitespace-nowrap">
              <div className="text-center">
                <div className="font-medium">{droneData.id}</div>
                <div className="text-muted-foreground">{Math.round(droneData.speed)} km/h</div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Map Info */}
      <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-gray-800/90 rounded-lg p-3 backdrop-blur-sm">
        <div className="text-xs space-y-1">
          <div className="font-medium">Live Tracking</div>
          {droneData && (
            <>
              <div>Lat: {droneData.currentLatitude.toFixed(4)}</div>
              <div>Lng: {droneData.currentLongitude.toFixed(4)}</div>
              <div>Alt: {Math.round(droneData.altitude)}m</div>
            </>
          )}
        </div>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-48">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin">
                  <Plane className="h-8 w-8 text-primary" />
                </div>
                <p className="text-muted-foreground">Loading tracking information...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {notifications.length > 0 && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Bell className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-medium text-blue-900 dark:text-blue-100">Live Updates</h4>
                {notifications.map((notification, index) => (
                  <p key={index} className="text-sm text-blue-700 dark:text-blue-300">
                    {notification}
                  </p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order #{delivery.id}
            <Badge className={getStatusColor()}>
              {delivery.status.replace("-", " ").toUpperCase()}
            </Badge>
          </CardTitle>
          <CardDescription>
            {delivery.medicationName} • Requested {formatDateTime(delivery.requestedAt)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Delivery Progress</span>
                <span>{Math.round(getDeliveryProgress())}%</span>
              </div>
              <Progress value={getDeliveryProgress()} className="h-2" />
            </div>

            {/* Key Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Priority</p>
                <Badge variant={delivery.priority === "emergency" ? "destructive" : 
                             delivery.priority === "urgent" ? "warning" : "secondary"}>
                  {delivery.priority.toUpperCase()}
                </Badge>
              </div>
              <div>
                <p className="text-muted-foreground">Distance</p>
                <p className="font-medium">{delivery.distance}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Est. Time</p>
                <p className="font-medium">{delivery.estimatedTime} min</p>
              </div>
              <div>
                <p className="text-muted-foreground">Cost</p>
                <p className="font-medium">${delivery.cost.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            Delivery Timeline
          </CardTitle>
          <CardDescription>
            Track your order progress step by step
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {getDeliverySteps().map((step, index) => {
              const Icon = step.icon
              return (
                <div key={step.id} className="flex items-start gap-4">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    step.status === 'completed' ? 'bg-green-100 border-green-500 text-green-700' :
                    step.status === 'current' ? 'bg-blue-100 border-blue-500 text-blue-700 animate-pulse' :
                    'bg-gray-100 border-gray-300 text-gray-500'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-medium ${
                        step.status === 'completed' ? 'text-green-700' :
                        step.status === 'current' ? 'text-blue-700' :
                        'text-gray-500'
                      }`}>
                        {step.title}
                      </h4>
                      {step.status === 'completed' && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                    {step.timestamp && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDateTime(step.timestamp)}
                      </p>
                    )}
                  </div>
                  {index < getDeliverySteps().length - 1 && (
                    <div className={`w-px h-8 ml-5 ${
                      step.status === 'completed' ? 'bg-green-200' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Live Tracking */}
      {droneData && delivery.status === "in-transit" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              Live Drone Tracking
              <Badge variant="outline" className="ml-auto">
                Last Update: {formatTime(lastUpdate)}
              </Badge>
            </CardTitle>
            <CardDescription>
              Real-time position and status of delivery drone {droneData.id}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Enhanced Map */}
              {renderEnhancedMap()}

              {/* Drone Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Battery className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Battery</span>
                    </div>
                    <div className="mt-2">
                      <div className="text-lg font-bold">{Math.round(droneData.batteryLevel)}%</div>
                      <Progress value={droneData.batteryLevel} className="h-1 mt-1" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium">Temperature</span>
                    </div>
                    <div className="text-lg font-bold mt-2">{Math.round(droneData.temperature)}°C</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Navigation className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Speed</span>
                    </div>
                    <div className="text-lg font-bold mt-2">{Math.round(droneData.speed)} km/h</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Wind className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium">Wind</span>
                    </div>
                    <div className="text-lg font-bold mt-2">{Math.round(droneData.windSpeed)} km/h</div>
                  </CardContent>
                </Card>
              </div>

              {/* Estimated Arrival */}
              <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900 dark:text-blue-100">Estimated Arrival</span>
                  </div>
                  <div className="text-xl font-bold text-blue-900 dark:text-blue-100">
                    {formatTime(droneData.estimatedArrival)}
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Altitude: {Math.round(droneData.altitude)}m • Model: {droneData.model}
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Emergency Contact */}
      {delivery.status === "in-transit" && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
              <Phone className="h-5 w-5" />
              Need Help?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1">
                <Phone className="h-4 w-4 mr-2" />
                Emergency Contact
              </Button>
              <Button variant="outline" className="flex-1">
                <MessageCircle className="h-4 w-4 mr-2" />
                Live Support
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delivered Status */}
      {delivery.status === "delivered" && (
        <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-900 dark:text-green-100">
                  Delivery Completed
                </h3>
                <p className="text-green-700 dark:text-green-300">
                  {delivery.deliveredAt && `Delivered at ${formatDateTime(delivery.deliveredAt)}`}
                  {delivery.actualTime && ` in ${delivery.actualTime} minutes`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending/Cancelled Status */}
      {(delivery.status === "pending" || delivery.status === "cancelled") && (
        <Card className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div>
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                  {delivery.status === "pending" ? "Waiting for Dispatch" : "Delivery Cancelled"}
                </h3>
                <p className="text-yellow-700 dark:text-yellow-300">
                  {delivery.status === "pending" 
                    ? "Your order is being prepared for drone delivery" 
                    : "This delivery has been cancelled"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1">
          <Eye className="h-4 w-4 mr-2" />
          View Order Details
        </Button>
        {delivery.status === "in-transit" && (
          <Button variant="outline">
            <MapPin className="h-4 w-4 mr-2" />
            Share Location
          </Button>
        )}
      </div>
    </div>
  )
}
