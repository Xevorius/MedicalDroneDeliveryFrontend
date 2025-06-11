"use client"

import { useState, useEffect } from "react"
import { 
  Clock, 
  Package, 
  Heart, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  Plus,
  Repeat,
  User,
  UserPlus
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "components/ui/card"
import { Badge } from "components/ui/badge"
import { Button } from "components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "components/ui/table"
import { type DashboardData, type Delivery } from "lib/dashboard-data"
import { DeliveryRequestForm, type DeliveryRequestData } from "components/delivery-request-form"
import { RecurringDeliveryManager, type RecurringSchedule } from "components/recurring-delivery-manager"
import { OrderDetailsModal } from "components/order-details-modal"
import { 
  getPatientRegistration, 
  getDoctorById,
  getHospitalById,
  type PatientRegistration,
  type Doctor,
  type Hospital 
} from "lib/registration-data"
import {
  savePatientDelivery,
  getPatientDeliveries,
  createDeliveryFromPatientRequest
} from "lib/delivery-management"

interface PatientDashboardProps {
  data: DashboardData
  isMockData?: boolean
}

function getStatusBadge(status: Delivery["status"]) {
  switch (status) {
    case "delivered":
      return <Badge variant="success">Delivered</Badge>
    case "in-transit":
      return <Badge variant="warning">In Transit</Badge>
    case "pending":
      return <Badge variant="secondary">Pending</Badge>
    case "cancelled":
      return <Badge variant="error">Cancelled</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function getApprovalBadge(approvalStatus: Delivery["approvalStatus"]) {
  switch (approvalStatus) {
    case "approved":
      return <Badge variant="success">Approved</Badge>
    case "auto-approved":
      return <Badge variant="success">Auto-Approved</Badge>
    case "pending":
      return <Badge variant="warning">Awaiting Approval</Badge>
    case "denied":
      return <Badge variant="error">Denied</Badge>
    default:
      return <Badge variant="outline">{approvalStatus}</Badge>
  }
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export function PatientDashboard({ data, isMockData = false }: PatientDashboardProps) {
  const { user, deliveries, stats } = data;
  const [patientRegistration, setPatientRegistration] = useState<PatientRegistration | null>(null)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null)
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentDeliveries, setCurrentDeliveries] = useState<Delivery[]>([])
  
  useEffect(() => {
    // Check for registered patient data
    const registration = getPatientRegistration()
    if (registration) {
      setPatientRegistration(registration)
      // Get doctor and hospital details
      const doctor = getDoctorById(registration.preferences.doctorId)
      const hospital = getHospitalById(registration.preferences.hospitalId)
      
      setSelectedDoctor(doctor ?? null)
      setSelectedHospital(hospital ?? null)
      
      // Load deliveries for this specific patient
      const savedDeliveries = getPatientDeliveries(registration.medicalInfo.healthId)
      setCurrentDeliveries(savedDeliveries)
    } else {
      // Load deliveries without patient ID (will try to get from registration-data)
      const savedDeliveries = getPatientDeliveries()
      setCurrentDeliveries(savedDeliveries)
    }
  }, [deliveries])

  // Calculate stats from actual deliveries
  const calculatedStats = {
    totalDeliveries: currentDeliveries.length,
    successRate: currentDeliveries.length > 0 
      ? Math.round((currentDeliveries.filter(d => d.status === "delivered").length / currentDeliveries.length) * 100)
      : 100,
    averageDeliveryTime: currentDeliveries.length > 0
      ? Math.round(currentDeliveries.filter(d => d.actualTime).reduce((sum, d) => sum + (d.actualTime || 0), 0) / currentDeliveries.filter(d => d.actualTime).length) || 18
      : 18,
    costSavings: Math.round(currentDeliveries.reduce((sum, d) => sum + (d.cost * 0.3), 0)), // Assume 30% savings vs pharmacy trips
    emergencyDeliveries: currentDeliveries.filter(d => d.isEmergency).length,
    routineDeliveries: currentDeliveries.filter(d => !d.isEmergency).length,
  }

  // Use registered user data if available, otherwise fall back to mock data
  const displayUser = patientRegistration ? {
    name: `${patientRegistration.personalInfo.firstName} ${patientRegistration.personalInfo.lastName}`,
    email: patientRegistration.personalInfo.email,
    phone: patientRegistration.personalInfo.phone,
    healthId: patientRegistration.medicalInfo.healthId,
    profilePicture: patientRegistration.personalInfo.profilePicture
  } : user  // Separate recurring and one-time deliveries using current deliveries
  const recurringDeliveries = currentDeliveries.filter((d: Delivery) => d.isRecurring)
  const pendingApprovals = currentDeliveries.filter((d: Delivery) => d.approvalStatus === "pending")
    const handleDeliveryRequest = (requestData: DeliveryRequestData) => {
    console.log("New delivery request:", requestData)
    
    // Create new delivery and save it
    const patientId = patientRegistration?.medicalInfo.healthId ?? displayUser.healthId
    const doctorId = patientRegistration?.preferences.doctorId
    
    const newDelivery = doctorId 
      ? createDeliveryFromPatientRequest(requestData as any, patientId as string, doctorId)
      : createDeliveryFromPatientRequest(requestData as any, patientId as string)
    savePatientDelivery(newDelivery, patientId as string)
    
    // Update local state
    setCurrentDeliveries(prev => [newDelivery, ...prev])
  }
  
  const handleEmergencyRequest = (requestData: DeliveryRequestData) => {
    console.log("Emergency delivery request:", requestData)
    
    // Create emergency delivery and save it
    const emergencyData = { ...requestData, isEmergency: true, urgencyLevel: "critical" as const }
    const patientId = patientRegistration?.medicalInfo.healthId ?? displayUser.healthId
    const doctorId = patientRegistration?.preferences.doctorId
    
    const newDelivery = doctorId 
      ? createDeliveryFromPatientRequest(emergencyData as any, patientId as string, doctorId)
      : createDeliveryFromPatientRequest(emergencyData as any, patientId as string)
    savePatientDelivery(newDelivery, patientId as string)
    
    // Update local state
    setCurrentDeliveries(prev => [newDelivery, ...prev])
  }

  const handleRowClick = (delivery: Delivery) => {
    setSelectedDelivery(delivery)
    setIsModalOpen(true)
  }
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedDelivery(null)
  }
  
  const handleAddRecurringSchedule = (scheduleData: Omit<RecurringSchedule, "id" | "nextDelivery">) => {
    console.log("New recurring schedule:", scheduleData)
    // In a real app, this would make an API call to create the schedule
  }

  const handleUpdateRecurringSchedule = (id: string, scheduleData: Partial<RecurringSchedule>) => {
    console.log("Update recurring schedule:", id, scheduleData)
    // In a real app, this would make an API call to update the schedule
  }
  
  const handleDeleteRecurringSchedule = (id: string) => {
    console.log("Delete recurring schedule:", id)
    // In a real app, this would make an API call to delete the schedule
  }
  // ...existing code...

  return (
    <div className="flex flex-col gap-6">      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Health Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {displayUser.name}
            {isMockData && <span className="ml-2 text-xs text-orange-600">(Demo Mode)</span>}
            {patientRegistration && <span className="ml-2 text-xs text-green-600">(Registered User)</span>}
          </p>
          <p className="text-sm text-muted-foreground">
            Health ID: {displayUser.healthId}
            {selectedDoctor && (
              <span> • Dr. {selectedDoctor.name} ({selectedDoctor.specialty})</span>
            )}
            {selectedHospital && (
              <span> • {selectedHospital.name}</span>
            )}
          </p>
        </div>
          {/* Registration CTA for non-registered users */}
        {!patientRegistration && (
          <div className="text-right">
            <p className="text-sm text-muted-foreground mb-2">New to Medifly?</p>
            <Button asChild size="sm" className="bg-brand-green-dark hover:bg-brand-green-dark/90">
              <a href="/register">
                <UserPlus className="h-4 w-4 mr-2" />
                Register Now
              </a>
            </Button>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <DeliveryRequestForm onSubmit={handleDeliveryRequest}>
            <Button variant="outline" size="sm" className="border-brand-green-light hover:border-brand-green-dark hover:shadow-md hover:shadow-brand-green-light/20">
              <Plus className="h-4 w-4 mr-2" />
              Request Delivery
            </Button>
          </DeliveryRequestForm>
          <RecurringDeliveryManager schedules={recurringDeliveries.map((d: Delivery) => ({
              id: d.id,
              medicines: d.medicationName ? [{
                medicineId: `med-${d.id}`,
                medicineName: d.medicationName,
                dosage: d.dosage ?? "Not specified",
                quantity: parseInt(d.quantity?.split(' ')[0] ?? "1") ?? 1,
                unitType: d.quantity?.split(' ')[1] ?? "units",
                instructions: d.notes
              }] : [],
              frequency: "monthly" as const,
              preferredTime: "09:00",
              deliveryAddress: "Your registered address",
              isActive: true,
              nextDelivery: d.nextDelivery ?? new Date(),
              prescriptionId: d.prescriptionId ?? "Not specified",
              // Legacy fields for backward compatibility
              medicationName: d.medicationName,
              dosage: d.dosage ?? "Not specified",
              quantity: d.quantity ?? "Not specified"
            }))}
            onAddSchedule={handleAddRecurringSchedule}
            onUpdateSchedule={handleUpdateRecurringSchedule}
            onDeleteSchedule={handleDeleteRecurringSchedule}>
            <Button variant="outline" size="sm" className="border-brand-green-light hover:border-brand-green-dark hover:shadow-md hover:shadow-brand-green-light/20">
              <Repeat className="h-4 w-4 mr-2" />
              Manage Recurring
            </Button>
          </RecurringDeliveryManager>
          
          <DeliveryRequestForm isEmergency onSubmit={handleEmergencyRequest}>
            <Button variant="destructive" size="sm">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Emergency Request
            </Button>
          </DeliveryRequestForm>
        </div>
      </div>{/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-brand-green-light/30 hover:border-brand-green-light hover:shadow-md hover:shadow-brand-green-light/10 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Deliveries</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculatedStats.totalDeliveries}</div>
            <p className="text-xs text-muted-foreground">
              This year
            </p>
          </CardContent>
        </Card>

        <Card className="border-brand-green-light/30 hover:border-brand-green-light hover:shadow-md hover:shadow-brand-green-light/10 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculatedStats.successRate}%</div>
            <p className="text-xs text-muted-foreground">
              On-time deliveries
            </p>
          </CardContent>
        </Card>        <Card className="border-brand-green-light/30 hover:border-brand-green-light hover:shadow-md hover:shadow-brand-green-light/10 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Delivery Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculatedStats.averageDeliveryTime}min</div>
            <p className="text-xs text-muted-foreground">
              To your location
            </p>
          </CardContent>
        </Card>

        <Card className="border-brand-green-light/30 hover:border-brand-green-light hover:shadow-md hover:shadow-brand-green-light/10 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${calculatedStats.costSavings}</div>
            <p className="text-xs text-muted-foreground">
              vs pharmacy trips
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals Alert */}
      {pendingApprovals.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
              <AlertTriangle className="h-5 w-5" />
              Pending Approvals ({pendingApprovals.length})
            </CardTitle>
            <CardDescription className="text-orange-700 dark:text-orange-300">
              These requests are waiting for your doctor&apos;s approval
            </CardDescription>
          </CardHeader>
          <CardContent>            <div className="space-y-2">
              {pendingApprovals.map((delivery: Delivery) => (
                <div key={delivery.id} className="flex items-center justify-between p-2 bg-white dark:bg-orange-900 rounded-md">
                  <div>
                    <span className="font-medium">{delivery.medicationName}</span>
                    <p className="text-sm text-muted-foreground">
                      Requested {formatDateTime(delivery.requestedAt)}
                    </p>
                  </div>
                  {getApprovalBadge(delivery.approvalStatus)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}      {/* Recurring Medications */}
      {recurringDeliveries.length > 0 && (
        <Card className="border-brand-green-light/30 hover:border-brand-green-light/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Repeat className="h-5 w-5" />
              Recurring Medications
            </CardTitle>
            <CardDescription>
              Your scheduled medication deliveries
            </CardDescription>
          </CardHeader>
          <CardContent>            <div className="grid gap-4 md:grid-cols-2">
              {recurringDeliveries.map((delivery: Delivery) => (
                <div key={delivery.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{delivery.medicationName}</h4>
                    <p className="text-sm text-muted-foreground">
                      Next delivery: {delivery.nextDelivery ? formatDate(delivery.nextDelivery) : "Not scheduled"}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="success">Active</Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      ${delivery.cost.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            </CardContent>
        </Card>
      )}

      {/* Recent Deliveries */}
      <Card className="border-brand-green-light/30 hover:border-brand-green-light/50 transition-colors">
        <CardHeader>
          <CardTitle>Recent Deliveries</CardTitle>
          <CardDescription>
            Your latest medication deliveries • Click any row for details
          </CardDescription>
          </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medication</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Approval</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Delivered</TableHead>
                <TableHead>Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentDeliveries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Package className="h-8 w-8" />
                      <p>No deliveries yet</p>
                      <p className="text-sm">Use the "Request Delivery" button above to create your first order</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                currentDeliveries.slice(0, 5).map((delivery: Delivery) => (
                  <TableRow 
                    key={delivery.id} 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleRowClick(delivery)}
                  >
                    <TableCell className="font-medium">
                      <div>
                        {delivery.medicationName}
                        {delivery.isRecurring && (
                          <Repeat className="h-3 w-3 inline ml-2 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(delivery.status)}</TableCell>
                    <TableCell>{getApprovalBadge(delivery.approvalStatus)}</TableCell>
                    <TableCell>{formatDateTime(delivery.requestedAt)}</TableCell>
                    <TableCell>
                      {delivery.deliveredAt ? formatDateTime(delivery.deliveredAt) : "-"}
                    </TableCell>
                    <TableCell>${delivery.cost.toFixed(2)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Emergency Information */}
      <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800 dark:text-red-200">
            <Heart className="h-5 w-5" />
            Emergency Delivery Information
          </CardTitle>
          <CardDescription className="text-red-700 dark:text-red-300">
            Important information about emergency requests
          </CardDescription>
        </CardHeader>
        <CardContent className="text-red-800 dark:text-red-200">
          <div className="space-y-2 text-sm">
            <p>• Emergency deliveries bypass doctor approval and are sent immediately</p>
            <p>• All emergency requests are reviewed afterward for medical necessity</p>
            <p>• Non-covered emergency requests will be billed to you directly</p>
            <p>• Average emergency response time: 8-12 minutes</p>
          </div>
          
          <DeliveryRequestForm isEmergency onSubmit={handleEmergencyRequest}>
            <Button variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Request Emergency Delivery
            </Button>
          </DeliveryRequestForm>
        </CardContent>
      </Card>

      {/* User Profile Section for Registered Users */}
      {patientRegistration && (
        <Card className="border-brand-green-light/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Your Profile
              <Badge variant="secondary" className="text-xs">Registered</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Personal Information</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Name:</span> {patientRegistration.personalInfo.firstName} {patientRegistration.personalInfo.lastName}</p>
                  <p><span className="font-medium">Email:</span> {patientRegistration.personalInfo.email}</p>
                  <p><span className="font-medium">Phone:</span> {patientRegistration.personalInfo.phone}</p>
                  <p><span className="font-medium">Blood Type:</span> {patientRegistration.medicalInfo.bloodType}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Healthcare Provider</h4>
                <div className="space-y-1 text-sm">
                  {selectedHospital && (
                    <p><span className="font-medium">Hospital:</span> {selectedHospital.name}</p>
                  )}
                  {selectedDoctor && (
                    <>
                      <p><span className="font-medium">Doctor:</span> Dr. {selectedDoctor.name}</p>
                      <p><span className="font-medium">Specialty:</span> {selectedDoctor.specialty}</p>
                      <p><span className="font-medium">Experience:</span> {selectedDoctor.experience} years</p>
                    </>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Emergency Contact</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Name:</span> {patientRegistration.medicalInfo.emergencyContact.name}</p>
                  <p><span className="font-medium">Relationship:</span> {patientRegistration.medicalInfo.emergencyContact.relationship}</p>
                  <p><span className="font-medium">Phone:</span> {patientRegistration.medicalInfo.emergencyContact.phone}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Delivery Address:</span> {patientRegistration.preferences.deliveryAddress}
                </div>
                <div className="text-sm text-muted-foreground">
                  Registered: {formatDate(patientRegistration.registeredAt)}
                </div>
              </div>
            </div>          </CardContent>
        </Card>
      )}

      {/* Order Details Modal */}
      <OrderDetailsModal
        delivery={selectedDelivery}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        userType="patient"
      />
    </div>
  )
}
