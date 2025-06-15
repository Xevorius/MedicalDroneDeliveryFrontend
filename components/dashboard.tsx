"use client"

import { useState, useEffect } from "react"
import { 
  Clock, 
  Package, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  User,
  Check,
  X,
  Eye,
  Stethoscope,
  MapPin,
  Star,
  Plus,
  Loader2
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "components/ui/card"
import { Badge } from "components/ui/badge"
import { Button } from "components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "components/ui/dialog"
import { Textarea } from "components/ui/textarea"
import { Label } from "components/ui/label"
import { AddMedicineForm } from "components/add-medicine-form"
import { OrderDetailsModal } from "components/order-details-modal"
import { type DashboardData, type Delivery } from "lib/dashboard-data"
import { 
  getDoctorSession, 
  getHospitalById,
  type Doctor,
  type Hospital
} from "lib/registration-data"
import { type Medicine } from "lib/medicine-data"
import {
  saveDoctorDelivery,
  getDoctorDeliveries,
  updateDeliveryApprovalStatus,
  getDeliveriesForDoctor
} from "lib/delivery-management"
import { 
  getDeliveryProgression,
  isDeliveryInProgression 
} from "lib/delivery-progression"

interface DashboardProps {
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

function getProgressionBadge(deliveryId: string) {
  if (typeof window === 'undefined') return null
  
  const progression = getDeliveryProgression(deliveryId)
  if (!progression) return null
  
  const now = new Date()
  const elapsedMinutes = (now.getTime() - progression.approvedAt.getTime()) / (1000 * 60)
  const totalTime = progression.preparationTime + progression.estimatedTime
  const remainingTime = Math.max(0, totalTime - elapsedMinutes)
  
  if (elapsedMinutes < progression.preparationTime) {
    return (
      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
        Preparing ({remainingTime.toFixed(0)}m)
      </Badge>
    )
  } else if (remainingTime > 0) {
    return (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
        In Transit ({remainingTime.toFixed(0)}m)
      </Badge>
    )
  }
  
  return null
}

function getPriorityBadge(priority: Delivery["priority"]) {
  switch (priority) {
    case "emergency":
      return <Badge variant="error">Emergency</Badge>
    case "urgent":
      return <Badge variant="warning">Urgent</Badge>
    case "routine":
      return <Badge variant="secondary">Routine</Badge>
    default:
      return <Badge variant="outline">{priority}</Badge>
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

export function Dashboard({ data, isMockData = false }: DashboardProps) {
  const { user, deliveries, stats } = data
  const [approvalNote, setApprovalNote] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null)
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentDeliveries, setCurrentDeliveries] = useState<Delivery[]>([])  // Fetch doctor session data
  useEffect(() => {
    const session = getDoctorSession()
    if (session) {
      setSelectedDoctor(session)
      const hospital = getHospitalById(session.hospitalId)
      setSelectedHospital(hospital ?? null)
      
      // Load deliveries for this specific doctor
      const savedDeliveries = getDoctorDeliveries(session.id)
      setCurrentDeliveries(savedDeliveries)
    } else {
      // Load deliveries without doctor ID (will try to get from session)
      const savedDeliveries = getDoctorDeliveries()
      setCurrentDeliveries(savedDeliveries)
    }
  }, [deliveries])

  // Listen for storage events to update deliveries in real-time
  useEffect(() => {
    const handleStorageChange = () => {
      console.log('📡 Storage event detected in doctor dashboard')
      
      // Reload deliveries when storage changes
      const session = getDoctorSession()
      if (session) {
        const savedDeliveries = getDoctorDeliveries(session.id)
        setCurrentDeliveries(savedDeliveries)
      } else {
        const savedDeliveries = getDoctorDeliveries()
        setCurrentDeliveries(savedDeliveries)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Calculate stats from actual deliveries
  const calculatedStats = {
    totalDeliveries: currentDeliveries.length,
    successRate: currentDeliveries.length > 0 
      ? Math.round((currentDeliveries.filter(d => d.status === "delivered").length / currentDeliveries.length) * 100)
      : 100,
    averageDeliveryTime: currentDeliveries.length > 0
      ? Math.round(currentDeliveries.filter(d => d.actualTime).reduce((sum, d) => sum + (d.actualTime || 0), 0) / currentDeliveries.filter(d => d.actualTime).length) || 18
      : 18,
    costSavings: Math.round(currentDeliveries.reduce((sum, d) => sum + (d.cost * 0.2), 0)), // Assume 20% cost reduction for doctors
    emergencyDeliveries: currentDeliveries.filter(d => d.isEmergency).length,
    routineDeliveries: currentDeliveries.filter(d => !d.isEmergency).length,
  }

  // Use selected doctor data if available, otherwise fall back to mock data
  const displayUser = selectedDoctor ? {
    name: `Dr. ${selectedDoctor.name}`,
    email: `${selectedDoctor.name.toLowerCase().replace(/\s+/g, '.')}@hospital.com`,
    role: selectedDoctor.specialty,
    department: selectedDoctor.specialty,
    hospital: selectedHospital?.name ?? 'Medical Center'
  } : user  // Separate deliveries that need approval using current deliveries
  const needsApproval = currentDeliveries.filter((d: Delivery) => d.approvalStatus === "pending")

  // Handle row click for order details
  const handleRowClick = (delivery: Delivery) => {
    setSelectedDelivery(delivery)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedDelivery(null)
  }
  const handleApproval = async (deliveryId: string, approved: boolean, note?: string) => {
    setIsProcessing(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const doctorId = selectedDoctor?.id ?? "DOCTOR-001"
      const success = updateDeliveryApprovalStatus(
        deliveryId, 
        approved ? "approved" : "denied", 
        doctorId
      )
      
      if (success) {
        setCurrentDeliveries(prev => 
          prev.map(d => 
            d.id === deliveryId 
              ? { 
                  ...d, 
                  approvalStatus: approved ? "approved" as const : "denied" as const, 
                  status: approved ? "pending" as const : "cancelled" as const,
                  approvedBy: doctorId,
                  approvedAt: new Date()
                }
              : d
          )
        )
        
        console.log(`${approved ? 'Approved' : 'Denied'} delivery ${deliveryId}`, { note })
        alert(`Delivery ${approved ? 'approved' : 'denied'} successfully!`)
      } else {
        throw new Error("Failed to update delivery status")
      }
      
      setApprovalNote("")
    } catch (error) {
      console.error("Error processing approval:", error)
      alert("Error processing approval. Please try again.")
    } finally {
      setIsProcessing(false)
    }  }

  return (
    <div className="flex flex-col gap-6">{/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {displayUser.name}
            {isMockData && <span className="ml-2 text-xs text-orange-600">(Demo Mode)</span>}
            {selectedDoctor && <span className="ml-2 text-xs text-green-600">(Demo Doctor)</span>}
          </p>
          {selectedDoctor && (
            <p className="text-sm text-muted-foreground">
              {selectedDoctor.specialty} • {selectedDoctor.experience} years experience • {selectedHospital?.name}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            {displayUser.hospital}
          </div>
          {!selectedDoctor && (
            <Button asChild size="sm" variant="outline" className="border-brand-green-light hover:border-brand-green-dark">
              <a href="/doctor-demo">
                <Stethoscope className="h-4 w-4 mr-2" />
                Select Doctor Profile
              </a>
            </Button>
          )}
          <Button>Schedule Patient Delivery</Button>
        </div>
      </div>

      {/* Doctor Profile Section for Selected Doctors */}
      {selectedDoctor && (
        <Card className="border-brand-green-light/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Doctor Profile
              <Badge variant="secondary" className="text-xs">Demo Session</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Professional Information</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Name:</span> Dr. {selectedDoctor.name}</p>
                  <p><span className="font-medium">Specialty:</span> {selectedDoctor.specialty}</p>
                  <p><span className="font-medium">Experience:</span> {selectedDoctor.experience} years</p>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Rating:</span>
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span>{selectedDoctor.rating}/5</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Hospital Information</h4>
                <div className="space-y-1 text-sm">
                  {selectedHospital && (
                    <>
                      <p><span className="font-medium">Hospital:</span> {selectedHospital.name}</p>
                      <p><span className="font-medium">Type:</span> {selectedHospital.type}</p>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span className="text-xs">{selectedHospital.address}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Statistics</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Patients:</span> {selectedDoctor.patients}+</p>
                  <p><span className="font-medium">Languages:</span> {selectedDoctor.languages.join(', ')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}{/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-brand-green-light/30 hover:border-brand-green-light hover:shadow-md hover:shadow-brand-green-light/10 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculatedStats.totalDeliveries}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
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
              +0.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-brand-green-light/30 hover:border-brand-green-light hover:shadow-md hover:shadow-brand-green-light/10 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Delivery Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculatedStats.averageDeliveryTime}min</div>
            <p className="text-xs text-muted-foreground">
              -2.1min from last month
            </p>
          </CardContent>
        </Card>        <Card className="border-brand-green-light/30 hover:border-brand-green-light hover:shadow-md hover:shadow-brand-green-light/10 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${calculatedStats.costSavings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              vs traditional delivery
            </p>
          </CardContent>        </Card>
      </div>

      {/* Medicine Management Section */}
      <Card className="border-brand-green-light/30 hover:border-brand-green-light/50 transition-colors">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Medicine Database Management
          </CardTitle>
          <CardDescription>
            Add new medicines to the system database for patient ordering
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Manage the centralized medicine database that patients can order from.
              </p>
              <p className="text-xs text-muted-foreground">
                Added medicines will be available for all patients to select during delivery requests.
              </p>
            </div>            <AddMedicineForm 
              onMedicineAdded={(medicine: Medicine) => {
                console.log("New medicine added:", medicine)
                // In a real app, this would refresh the medicine list
                alert(`Successfully added ${medicine.name} to the medicine database!`)
              }}
            >
              <Button className="bg-brand-green-dark hover:bg-brand-green-dark/90">                <Plus className="h-4 w-4 mr-2" />
                Add Medicine
              </Button>
            </AddMedicineForm>
          </div>
        </CardContent>
      </Card>

      {/* Pending Approvals Alert */}
      {needsApproval.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
              <AlertTriangle className="h-5 w-5" />
              Pending Patient Requests ({needsApproval.length})
            </CardTitle>
            <CardDescription className="text-orange-700 dark:text-orange-300">
              These requests from your patients need your approval
            </CardDescription>
          </CardHeader>          <CardContent>
            <div className="space-y-3">
              {needsApproval.map((delivery: Delivery) => (
                <div key={delivery.id} className="flex items-center justify-between p-3 bg-white dark:bg-orange-900 rounded-md">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{delivery.medicationName}</span>
                      {getPriorityBadge(delivery.priority)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Patient: {delivery.patientName ?? delivery.patientId} • Requested {formatDateTime(delivery.requestedAt)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {delivery.quantity} • Cost: ${delivery.cost.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Review Delivery Request</DialogTitle>
                          <DialogDescription>
                            Review and approve or deny this medication delivery request
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Medication</Label>
                              <p className="font-medium">{delivery.medicationName}</p>
                            </div>
                            <div>
                              <Label>Patient</Label>
                              <p className="font-medium">{delivery.patientName ?? delivery.patientId}</p>
                            </div>
                            <div>
                              <Label>Quantity</Label>
                              <p>{delivery.quantity}</p>
                            </div>
                            <div>
                              <Label>Priority</Label>
                              <div>{getPriorityBadge(delivery.priority)}</div>
                            </div>
                            <div>
                              <Label>Requested</Label>
                              <p>{formatDateTime(delivery.requestedAt)}</p>
                            </div>
                            <div>
                              <Label>Cost</Label>
                              <p>${delivery.cost.toFixed(2)}</p>
                            </div>
                          </div>
                          
                          {delivery.notes && (
                            <div>
                              <Label>Patient Notes</Label>
                              <p className="text-sm p-2 bg-muted rounded">{delivery.notes}</p>
                            </div>
                          )}
                          
                          <div>
                            <Label htmlFor="approvalNote">Doctor Notes (Optional)</Label>
                            <Textarea 
                              id="approvalNote"
                              placeholder="Add any notes about this approval/denial..."
                              value={approvalNote}
                              onChange={(e) => setApprovalNote(e.target.value)}
                              rows={3}
                            />
                          </div>
                          
                          <div className="flex gap-2 pt-4">
                            <Button
                              variant="outline"
                              onClick={() => handleApproval(delivery.id, false, approvalNote)}
                              disabled={isProcessing}
                              className="flex-1"
                            >
                              <X className="h-4 w-4 mr-2" />
                              {isProcessing ? "Processing..." : "Deny Request"}
                            </Button>
                            <Button
                              onClick={() => handleApproval(delivery.id, true, approvalNote)}
                              disabled={isProcessing}
                              className="flex-1"
                            >
                              <Check className="h-4 w-4 mr-2" />
                              {isProcessing ? "Processing..." : "Approve & Dispatch"}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleApproval(delivery.id, false)}
                      disabled={isProcessing}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Deny
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleApproval(delivery.id, true)}
                      disabled={isProcessing}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}<Card className="border-brand-green-light/30 hover:border-brand-green-light/50 transition-colors">
        <CardHeader>
          <CardTitle>Recent Deliveries</CardTitle>
          <CardDescription>
            Your latest medical supply deliveries • Click any row for details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>              <TableRow>
                <TableHead>Medication</TableHead>
                <TableHead>Patient ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentDeliveries.length === 0 ? (                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Package className="h-8 w-8" />
                      <p>No delivery requests yet</p>
                      <p className="text-sm">Patient requests will appear here for your review and approval</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (                currentDeliveries.map((delivery: Delivery) => (
                  <TableRow key={delivery.id}>
                    <TableCell className="font-medium">
                      {delivery.medicationName}
                    </TableCell>                    <TableCell>{delivery.patientId}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {getStatusBadge(delivery.status)}
                        {getProgressionBadge(delivery.id)}
                      </div>
                    </TableCell>
                    <TableCell>{getPriorityBadge(delivery.priority)}</TableCell>
                    <TableCell>{formatDateTime(delivery.requestedAt)}</TableCell>
                    <TableCell>
                      {delivery.actualTime ? `${delivery.actualTime}min` : `~${delivery.estimatedTime}min`}
                    </TableCell>
                    <TableCell>${delivery.cost.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(`/tracking?id=${delivery.id}&type=doctor`, '_blank')}
                        >
                          Track
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRowClick(delivery)}
                        >
                          Details
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Emergency Deliveries
            </CardTitle>
            <CardDescription>
              High-priority deliveries this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{calculatedStats.emergencyDeliveries}</div>
            <p className="text-sm text-muted-foreground mt-2">
              Average response time: 11.2 minutes
            </p>
            <Button variant="outline" className="mt-4">View Emergency Protocol</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Performance Trends
            </CardTitle>
            <CardDescription>
              Your delivery performance overview
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">On-time deliveries</span>
                <span className="text-sm font-medium">96.2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Patient satisfaction</span>
                <span className="text-sm font-medium">4.8/5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Cost efficiency</span>
                <span className="text-sm font-medium text-green-600">+18%</span>
              </div>
            </div>
            <Button variant="outline" className="mt-4">View Full Report</Button>
          </CardContent>        </Card>
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        delivery={selectedDelivery}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        userType="doctor"
        onApprove={(deliveryId) => handleApproval(deliveryId, true)}
        onDeny={(deliveryId) => handleApproval(deliveryId, false)}
      />
    </div>
  )
}
