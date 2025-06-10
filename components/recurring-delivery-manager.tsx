"use client"

import { useState } from "react"
import { Clock, Repeat, Plus, Trash2, Edit } from "lucide-react"
import { Button } from "components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "components/ui/dialog"
import { Input } from "components/ui/input"
import { Label } from "components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "components/ui/select"
import { Textarea } from "components/ui/textarea" 
import { Badge } from "components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "components/ui/table"

export interface RecurringSchedule {
  id: string
  medicationName: string
  dosage: string
  quantity: string
  frequency: "daily" | "weekly" | "biweekly" | "monthly"
  preferredTime: string
  preferredDay?: string // For weekly/monthly
  deliveryAddress: string
  isActive: boolean
  nextDelivery: Date
  prescriptionId: string
  notes?: string
}

interface RecurringDeliveryManagerProps {
  schedules: RecurringSchedule[]
  onAddSchedule?: (schedule: Omit<RecurringSchedule, "id" | "nextDelivery">) => void
  onUpdateSchedule?: (id: string, schedule: Partial<RecurringSchedule>) => void
  onDeleteSchedule?: (id: string) => void
  children: React.ReactNode
}

export function RecurringDeliveryManager({ 
  schedules, 
  onAddSchedule,
  onUpdateSchedule,
  onDeleteSchedule,
  children 
}: RecurringDeliveryManagerProps) {  const [isOpen, setIsOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<RecurringSchedule | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<{
    medicationName: string
    dosage: string
    quantity: string
    frequency: RecurringSchedule["frequency"]
    preferredTime: string
    preferredDay: string
    deliveryAddress: string
    prescriptionId: string
    notes: string
  }>({
    medicationName: "",
    dosage: "",
    quantity: "",
    frequency: "monthly",
    preferredTime: "09:00",
    preferredDay: "monday",
    deliveryAddress: "",
    prescriptionId: "",
    notes: ""
  })
  const resetForm = () => {
    setFormData({
      medicationName: "",
      dosage: "",
      quantity: "",
      frequency: "monthly" as RecurringSchedule["frequency"],
      preferredTime: "09:00",
      preferredDay: "monday",
      deliveryAddress: "",
      prescriptionId: "",
      notes: ""
    })
    setEditingSchedule(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))

      if (editingSchedule && onUpdateSchedule) {
        onUpdateSchedule(editingSchedule.id, {
          ...formData,
          isActive: true
        })
        alert("Recurring delivery schedule updated successfully!")
      } else if (onAddSchedule) {
        onAddSchedule({
          ...formData,
          isActive: true
        })
        alert("Recurring delivery schedule created successfully!")
      }

      resetForm()
      setIsOpen(false)
    } catch (error) {
      console.error("Error saving schedule:", error)
      alert("Error saving schedule. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (schedule: RecurringSchedule) => {
    setEditingSchedule(schedule)
    setFormData({
      medicationName: schedule.medicationName,
      dosage: schedule.dosage,
      quantity: schedule.quantity,
      frequency: schedule.frequency,
      preferredTime: schedule.preferredTime,      preferredDay: schedule.preferredDay ?? "monday",
      deliveryAddress: schedule.deliveryAddress,
      prescriptionId: schedule.prescriptionId,
      notes: schedule.notes ?? ""
    })
    setIsOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this recurring delivery schedule?")) {
      if (onDeleteSchedule) {
        onDeleteSchedule(id)
        alert("Recurring delivery schedule deleted successfully!")
      }
    }
  }

  const getFrequencyDisplay = (frequency: RecurringSchedule["frequency"]) => {
    switch (frequency) {
      case "daily": return "Daily"
      case "weekly": return "Weekly"
      case "biweekly": return "Bi-weekly"
      case "monthly": return "Monthly"
      default: return frequency
    }
  }

  const formatNextDelivery = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Repeat className="h-5 w-5" />
            Recurring Delivery Schedules
          </DialogTitle>
          <DialogDescription>
            Manage your automatic medication delivery schedules for ongoing treatments
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Existing Schedules */}
          {schedules.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Schedules</CardTitle>
                <CardDescription>Your active recurring delivery schedules</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medication</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Next Delivery</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedules.map((schedule) => (
                      <TableRow key={schedule.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{schedule.medicationName}</div>
                            <div className="text-sm text-muted-foreground">
                              {schedule.dosage} • {schedule.quantity}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {getFrequencyDisplay(schedule.frequency)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatNextDelivery(schedule.nextDelivery)}</TableCell>
                        <TableCell>
                          <Badge variant={schedule.isActive ? "success" : "secondary"}>
                            {schedule.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(schedule)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(schedule.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Add/Edit Schedule Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {editingSchedule ? "Edit Schedule" : "Add New Schedule"}
              </CardTitle>
              <CardDescription>
                {editingSchedule 
                  ? "Update your recurring delivery schedule"
                  : "Create a new recurring delivery schedule for your medication"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="medicationName">Medication Name *</Label>
                    <Input
                      id="medicationName"
                      placeholder="e.g., Lisinopril, Metformin"
                      value={formData.medicationName}
                      onChange={(e) => setFormData(prev => ({ ...prev, medicationName: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dosage">Dosage *</Label>
                    <Input
                      id="dosage"
                      placeholder="e.g., 10mg, 500mg"
                      value={formData.dosage}
                      onChange={(e) => setFormData(prev => ({ ...prev, dosage: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      placeholder="e.g., 30 tablets, 1 bottle"
                      value={formData.quantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prescriptionId">Prescription ID</Label>
                    <Input
                      id="prescriptionId"
                      placeholder="e.g., RX-123456"
                      value={formData.prescriptionId}
                      onChange={(e) => setFormData(prev => ({ ...prev, prescriptionId: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="frequency">Delivery Frequency *</Label>                    <Select 
                      value={formData.frequency} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, frequency: value as RecurringSchedule["frequency"] }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Bi-weekly (every 2 weeks)</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preferredTime">Preferred Delivery Time</Label>
                    <Input
                      id="preferredTime"
                      type="time"
                      value={formData.preferredTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, preferredTime: e.target.value }))}
                    />
                  </div>

                  {(formData.frequency === "weekly" || formData.frequency === "monthly") && (
                    <div className="space-y-2">
                      <Label htmlFor="preferredDay">
                        Preferred {formData.frequency === "weekly" ? "Day of Week" : "Day of Month"}
                      </Label>
                      {formData.frequency === "weekly" ? (
                        <Select 
                          value={formData.preferredDay} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, preferredDay: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select day" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monday">Monday</SelectItem>
                            <SelectItem value="tuesday">Tuesday</SelectItem>
                            <SelectItem value="wednesday">Wednesday</SelectItem>
                            <SelectItem value="thursday">Thursday</SelectItem>
                            <SelectItem value="friday">Friday</SelectItem>
                            <SelectItem value="saturday">Saturday</SelectItem>
                            <SelectItem value="sunday">Sunday</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          placeholder="Day of month (1-28)"
                          type="number"
                          min="1"
                          max="28"
                          value={formData.preferredDay}
                          onChange={(e) => setFormData(prev => ({ ...prev, preferredDay: e.target.value }))}
                        />
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryAddress">Delivery Address *</Label>
                  <Textarea
                    id="deliveryAddress"
                    placeholder="Enter your full delivery address including apartment/unit number"
                    value={formData.deliveryAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, deliveryAddress: e.target.value }))}
                    required
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special instructions for recurring deliveries..."
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetForm()
                      setIsOpen(false)
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        {editingSchedule ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      <>
                        {editingSchedule ? (
                          <>
                            <Edit className="h-4 w-4 mr-2" />
                            Update Schedule
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Schedule
                          </>
                        )}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
