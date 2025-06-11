"use client"

import React from "react"
import { Package, User, MapPin, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "components/ui/dialog"
import { Badge } from "components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "components/ui/card"
import { Button } from "components/ui/button"
import { type Delivery } from "lib/dashboard-data"

interface OrderDetailsModalProps {
  delivery: Delivery | null
  isOpen: boolean
  onClose: () => void
  userType: "patient" | "doctor"
  onApprove?: (deliveryId: string) => void
  onDeny?: (deliveryId: string) => void
}

export function OrderDetailsModal({ 
  delivery, 
  isOpen, 
  onClose, 
  userType,
  onApprove,
  onDeny 
}: OrderDetailsModalProps) {
  if (!delivery) return null

  const getStatusColor = (status: Delivery["status"]) => {
    switch (status) {
      case "delivered": return "text-green-600 bg-green-50"
      case "in-transit": return "text-blue-600 bg-blue-50"
      case "pending": return "text-yellow-600 bg-yellow-50"
      case "cancelled": return "text-red-600 bg-red-50"
      default: return "text-gray-600 bg-gray-50"
    }
  }

  const getPriorityColor = (priority: Delivery["priority"]) => {
    switch (priority) {
      case "emergency": return "text-red-600 bg-red-50 border-red-200"
      case "urgent": return "text-orange-600 bg-orange-50 border-orange-200"
      case "routine": return "text-green-600 bg-green-50 border-green-200"
      default: return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getApprovalColor = (status: Delivery["approvalStatus"]) => {
    switch (status) {
      case "approved": return "text-green-600 bg-green-50"
      case "denied": return "text-red-600 bg-red-50"
      case "pending": return "text-yellow-600 bg-yellow-50"
      case "auto-approved": return "text-blue-600 bg-blue-50"
      default: return "text-gray-600 bg-gray-50"
    }
  }

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const canApprove = userType === "doctor" && delivery.approvalStatus === "pending"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Details - {delivery.id}
            <Badge className={getPriorityColor(delivery.priority)}>
              {delivery.priority.toUpperCase()}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Delivery Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={getStatusColor(delivery.status)}>
                  {delivery.status.replace("-", " ").toUpperCase()}
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">
                  {delivery.status === "delivered" && delivery.deliveredAt && 
                    `Delivered: ${formatDateTime(delivery.deliveredAt)}`}
                  {delivery.status === "in-transit" && 
                    `Estimated: ${delivery.estimatedTime} minutes`}
                  {delivery.status === "pending" && 
                    "Awaiting processing"}
                  {delivery.status === "cancelled" && 
                    "Order was cancelled"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Approval Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={getApprovalColor(delivery.approvalStatus)}>
                  {delivery.approvalStatus.replace("-", " ").toUpperCase()}
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">
                  {delivery.approvalStatus === "pending" && "Waiting for doctor approval"}
                  {delivery.approvalStatus === "approved" && "Doctor approved"}
                  {delivery.approvalStatus === "denied" && "Doctor denied request"}
                  {delivery.approvalStatus === "auto-approved" && "Emergency auto-approved"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Cost & Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${delivery.cost.toFixed(2)}</div>
                <p className="text-sm text-muted-foreground">
                  {delivery.actualTime ? 
                    `Delivered in ${delivery.actualTime} min` : 
                    `Est. ${delivery.estimatedTime} min`}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Medication Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Medication Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Medication Name</h4>
                  <p className="font-medium">{delivery.medicationName}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Prescription ID</h4>
                  <p className="font-mono text-sm">{delivery.prescriptionId ?? "N/A"}</p>
                </div>
                {delivery.quantity && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Quantity</h4>
                    <p>{delivery.quantity}</p>
                  </div>
                )}
                {delivery.dosage && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Dosage</h4>
                    <p>{delivery.dosage}</p>
                  </div>
                )}
              </div>
              {delivery.notes && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Special Instructions</h4>
                  <p className="text-sm bg-muted p-3 rounded-md">{delivery.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Patient Information (for doctors) */}
          {userType === "doctor" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Patient ID</h4>
                    <p className="font-mono text-sm">{delivery.patientId}</p>
                  </div>
                  {delivery.patientName && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Patient Name</h4>
                      <p>{delivery.patientName}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Delivery Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Requested Date</h4>
                  <p>{formatDateTime(delivery.requestedAt)}</p>
                </div>
                {delivery.deliveredAt && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Delivered Date</h4>
                    <p>{formatDateTime(delivery.deliveredAt)}</p>
                  </div>
                )}
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Distance</h4>
                  <p>{delivery.distance}</p>
                </div>
                {delivery.droneId && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Drone ID</h4>
                    <p className="font-mono text-sm">{delivery.droneId}</p>
                  </div>
                )}
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Requested By</h4>
                  <p className="capitalize">{delivery.requestedBy}</p>
                </div>
                {delivery.isRecurring && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Delivery Type</h4>
                    <Badge variant="outline">Recurring Order</Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Doctor Actions */}
          {canApprove && (
            <Card className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
                  <AlertTriangle className="h-5 w-5" />
                  Pending Approval Required
                </CardTitle>
                <CardDescription className="text-orange-700 dark:text-orange-300">
                  This order requires your medical approval before delivery
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Button
                    onClick={() => onApprove?.(delivery.id)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Order
                  </Button>
                  <Button
                    onClick={() => onDeny?.(delivery.id)}
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Deny Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
