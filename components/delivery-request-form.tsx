"use client"

import { useState } from "react"
import { AlertTriangle, Package, Clock } from "lucide-react"
import { Button } from "components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card"
import { Input } from "components/ui/input"
import { Label } from "components/ui/label"
import { Textarea } from "components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "components/ui/dialog"
import { Badge } from "components/ui/badge"

interface DeliveryRequestFormProps {
  isEmergency?: boolean
  onSubmit?: (data: DeliveryRequestData) => void
  children: React.ReactNode
}

export interface DeliveryRequestData {
  medicationName: string
  quantity: string
  dosage: string
  prescriptionId: string
  deliveryAddress: string
  phoneNumber: string
  notes: string
  isEmergency: boolean
  urgencyLevel?: "low" | "medium" | "high" | "critical"
}

export function DeliveryRequestForm({ isEmergency = false, onSubmit, children }: DeliveryRequestFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<DeliveryRequestData>({
    medicationName: "",
    quantity: "",
    dosage: "",
    prescriptionId: "",
    deliveryAddress: "",
    phoneNumber: "",
    notes: "",
    isEmergency,
    urgencyLevel: isEmergency ? "critical" : "low"
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (onSubmit) {
        onSubmit(formData)
      }
      
      // Reset form and close dialog
      setFormData({
        medicationName: "",
        quantity: "",
        dosage: "",
        prescriptionId: "",
        deliveryAddress: "",
        phoneNumber: "",
        notes: "",
        isEmergency,
        urgencyLevel: isEmergency ? "critical" : "low"
      })
      setIsOpen(false)
      
      // Show success message (you could use a toast here)
      alert(isEmergency 
        ? "Emergency delivery request submitted! A drone will be dispatched immediately." 
        : "Delivery request submitted! Your doctor will review and approve shortly."
      )
    } catch (error) {
      console.error("Error submitting request:", error)
      alert("Error submitting request. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateFormData = (field: keyof DeliveryRequestData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEmergency ? (
              <>
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Emergency Delivery Request
              </>
            ) : (
              <>
                <Package className="h-4 w-4" />
                Request Medication Delivery
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isEmergency 
              ? "Emergency requests bypass doctor approval and are dispatched immediately. Please ensure this is a genuine medical emergency."
              : "Submit a request for medication delivery. Your assigned doctor will review and approve before dispatch."
            }
          </DialogDescription>
        </DialogHeader>

        {isEmergency && (
          <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
            <CardHeader className="pb-3">
              <CardTitle className="text-red-800 dark:text-red-200 text-sm">
                Emergency Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 text-sm text-red-700 dark:text-red-300">
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Average response time: 8-12 minutes
                </p>
                <p>• All emergency requests are reviewed afterward</p>
                <p>• Non-covered medications will be billed directly</p>
                <p>• Misuse of emergency delivery may result in service suspension</p>
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="medicationName">Medication Name *</Label>
              <Input
                id="medicationName"
                placeholder="e.g., Lisinopril, Metformin"
                value={formData.medicationName}
                onChange={(e) => updateFormData("medicationName", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                placeholder="e.g., 30 tablets, 1 bottle"
                value={formData.quantity}
                onChange={(e) => updateFormData("quantity", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dosage">Dosage *</Label>
              <Input
                id="dosage"
                placeholder="e.g., 10mg, 500mg"
                value={formData.dosage}
                onChange={(e) => updateFormData("dosage", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prescriptionId">Prescription ID</Label>
              <Input
                id="prescriptionId"
                placeholder="e.g., RX-123456"
                value={formData.prescriptionId}
                onChange={(e) => updateFormData("prescriptionId", e.target.value)}
              />
            </div>
          </div>

          {!isEmergency && (
            <div className="space-y-2">
              <Label htmlFor="urgencyLevel">Urgency Level</Label>
              <Select value={formData.urgencyLevel} onValueChange={(value) => updateFormData("urgencyLevel", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select urgency level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Low</Badge>
                      <span>Standard delivery (24-48 hours)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <Badge variant="warning">Medium</Badge>
                      <span>Priority delivery (12-24 hours)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <Badge variant="error">High</Badge>
                      <span>Urgent delivery (4-8 hours)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="deliveryAddress">Delivery Address *</Label>
            <Textarea
              id="deliveryAddress"
              placeholder="Enter your full delivery address including apartment/unit number"
              value={formData.deliveryAddress}
              onChange={(e) => updateFormData("deliveryAddress", e.target.value)}
              required
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Contact Phone Number *</Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="(555) 123-4567"
              value={formData.phoneNumber}
              onChange={(e) => updateFormData("phoneNumber", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any special instructions or additional information..."
              value={formData.notes}
              onChange={(e) => updateFormData("notes", e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              variant={isEmergency ? "destructive" : "default"}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  {isEmergency ? "Dispatching Emergency Drone..." : "Submitting Request..."}
                </>
              ) : (
                <>
                  {isEmergency ? (
                    <>
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Dispatch Emergency Drone
                    </>
                  ) : (
                    <>
                      <Package className="h-4 w-4 mr-2" />
                      Submit for Approval
                    </>
                  )}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
