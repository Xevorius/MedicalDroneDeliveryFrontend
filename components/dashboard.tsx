"use client"

import { useState } from "react"
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
  Eye
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "components/ui/card"
import { Badge } from "components/ui/badge"
import { Button } from "components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "components/ui/dialog"
import { Textarea } from "components/ui/textarea"
import { Label } from "components/ui/label"
import { type DashboardData, type Delivery } from "lib/dashboard-data"

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

  // Separate deliveries that need approval
  const needsApproval = deliveries.filter((d: Delivery) => d.approvalStatus === "pending")

  const handleApproval = async (deliveryId: string, approved: boolean, note?: string) => {
    setIsProcessing(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log(`${approved ? 'Approved' : 'Denied'} delivery ${deliveryId}`, { note })
        // In a real app, this would update the backend and refresh the data
      alert(`Delivery ${approved ? 'approved' : 'denied'} successfully!`)
      
      setApprovalNote("")
    } catch (error) {
      console.error("Error processing approval:", error)
      alert("Error processing approval. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">        <div>
          <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.name}
            {isMockData && <span className="ml-2 text-xs text-orange-600">(Demo Mode)</span>}
          </p>
        </div>        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            {user.hospital}
          </div>
          <Button>Schedule Patient Delivery</Button>
        </div>
      </div>      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-brand-green-light/30 hover:border-brand-green-light hover:shadow-md hover:shadow-brand-green-light/10 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDeliveries}</div>
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
            <div className="text-2xl font-bold">{stats.successRate}%</div>
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
            <div className="text-2xl font-bold">{stats.averageDeliveryTime}min</div>
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
            <div className="text-2xl font-bold">${stats.costSavings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              vs traditional delivery
            </p>
          </CardContent>
        </Card>
      </div>

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
      )}      {/* Recent Deliveries */}
      <Card className="border-brand-green-light/30 hover:border-brand-green-light/50 transition-colors">
        <CardHeader>
          <CardTitle>Recent Deliveries</CardTitle>
          <CardDescription>
            Your latest medical supply deliveries
          </CardDescription>
        </CardHeader><CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medication</TableHead>
                <TableHead>Patient ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveries.map((delivery: Delivery) => (
                <TableRow key={delivery.id}>
                  <TableCell className="font-medium">
                    {delivery.medicationName}
                  </TableCell>
                  <TableCell>{delivery.patientId}</TableCell>
                  <TableCell>{getStatusBadge(delivery.status)}</TableCell>
                  <TableCell>{getPriorityBadge(delivery.priority)}</TableCell>
                  <TableCell>{formatDateTime(delivery.requestedAt)}</TableCell>
                  <TableCell>
                    {delivery.actualTime ? `${delivery.actualTime}min` : `~${delivery.estimatedTime}min`}
                  </TableCell>
                  <TableCell>${delivery.cost.toFixed(2)}</TableCell>
                </TableRow>
              ))}
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
            <div className="text-3xl font-bold text-orange-600">{stats.emergencyDeliveries}</div>
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
