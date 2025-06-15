"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, Package, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Button } from "components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "components/ui/card"
import { DroneTracking } from "components/drone-tracking"
import { getPatientDeliveries, getDoctorDeliveries } from "lib/delivery-management"
import { getPatientRegistration, getDoctorSession } from "lib/registration-data"
import { type Delivery } from "lib/dashboard-data"

export default function TrackingPage() {
  const [delivery, setDelivery] = useState<Delivery | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  
  const deliveryId = searchParams.get('id')
  const userType = searchParams.get('type') as 'patient' | 'doctor' || 'patient'

  useEffect(() => {
    const loadDelivery = async () => {
      if (!deliveryId) {
        setError("No delivery ID provided")
        setLoading(false)
        return
      }

      try {
        let deliveries: Delivery[] = []
        
        if (userType === 'patient') {
          // Get patient deliveries
          const registration = getPatientRegistration()
          if (registration) {
            deliveries = getPatientDeliveries(registration.medicalInfo.healthId)
          } else {
            deliveries = getPatientDeliveries()
          }
        } else {
          // Get doctor deliveries
          const session = getDoctorSession()
          if (session) {
            deliveries = getDoctorDeliveries(session.id)
          } else {
            deliveries = getDoctorDeliveries()
          }
        }

        const foundDelivery = deliveries.find(d => d.id === deliveryId)
        
        if (foundDelivery) {
          setDelivery(foundDelivery)
        } else {
          setError("Delivery not found")
        }
      } catch (err) {
        setError("Failed to load delivery information")
        console.error("Error loading delivery:", err)
      } finally {
        setLoading(false)
      }
    }

    loadDelivery()
  }, [deliveryId, userType])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin">
                    <Package className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground">Loading delivery information...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !delivery) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8">
              <div className="flex flex-col items-center gap-4 text-center">
                <AlertTriangle className="h-12 w-12 text-red-500" />
                <div>
                  <h3 className="text-lg font-semibold">Delivery Not Found</h3>
                  <p className="text-muted-foreground mt-1">
                    {error || "The delivery you're looking for could not be found."}
                  </p>
                </div>
                <Button asChild>
                  <Link href={userType === 'doctor' ? "/demo/doctor" : "/demo/patient"}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href={userType === 'doctor' ? "/demo/doctor" : "/demo/patient"}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Track Delivery</h1>
            <p className="text-muted-foreground">
              Real-time tracking for your medical delivery
            </p>
          </div>
        </div>

        {/* Tracking Component */}
        <DroneTracking delivery={delivery} />
      </div>
    </div>
  )
}
