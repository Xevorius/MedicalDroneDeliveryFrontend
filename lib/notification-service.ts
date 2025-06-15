import { addNotification, type Notification } from "components/notification-center"
import { toast } from "components/toast"
import { type Delivery } from "lib/dashboard-data"

// Notification service for business logic
export class NotificationService {
  
  // Send notification when a new order is placed
  static sendOrderPlacedNotification(delivery: Delivery) {
    const notification: Omit<Notification, 'id' | 'timestamp' | 'read'> = {
      type: 'order_placed',
      title: 'New Order Placed',
      message: `${delivery.patientName || delivery.patientId} has requested ${delivery.medicationName}`,
      priority: delivery.priority === 'emergency' ? 'urgent' : 
                delivery.priority === 'urgent' ? 'high' : 'medium',
      actionUrl: `/demo/doctor?highlight=${delivery.id}`,
      metadata: {
        orderId: delivery.id,
        patientId: delivery.patientId,
        medicationName: delivery.medicationName,
        priority: delivery.priority
      }
    }
    
    addNotification(notification)
    
    // Also show toast for immediate attention
    if (delivery.priority === 'emergency') {
      toast.error(
        'Emergency Order Placed!',
        `Urgent: ${delivery.medicationName} for ${delivery.patientName || delivery.patientId}`,
        {
          duration: 0, // Don't auto-dismiss emergency notifications
          action: {
            label: 'Review Now',
            onClick: () => window.open(`/demo/doctor?highlight=${delivery.id}`, '_blank')
          }
        }
      )
    } else {
      toast.notification(
        'New Order Placed',
        `${delivery.medicationName} requested by ${delivery.patientName || delivery.patientId}`,
        {
          action: {
            label: 'Review',
            onClick: () => window.open(`/demo/doctor?highlight=${delivery.id}`, '_blank')
          }
        }
      )
    }
    
    console.log('📬 Order placed notification sent:', delivery.id)
  }
  
  // Send notification when order is approved
  static sendOrderApprovedNotification(delivery: Delivery, doctorName?: string) {
    const notification: Omit<Notification, 'id' | 'timestamp' | 'read'> = {
      type: 'order_approved',
      title: 'Order Approved',
      message: `Your ${delivery.medicationName} order has been approved by ${doctorName || 'the doctor'}`,
      priority: 'medium',
      actionUrl: `/tracking?id=${delivery.id}&type=patient`,
      metadata: {
        orderId: delivery.id,
        patientId: delivery.patientId,
        medicationName: delivery.medicationName,
        doctorId: delivery.doctorId
      }
    }
    
    addNotification(notification)
    
    toast.success(
      'Order Approved!',
      `${delivery.medicationName} has been approved and will be dispatched soon`,
      {
        action: {
          label: 'Track Order',
          onClick: () => window.open(`/tracking?id=${delivery.id}&type=patient`, '_blank')
        }
      }
    )
    
    console.log('✅ Order approved notification sent:', delivery.id)
  }
  
  // Send notification when order is denied
  static sendOrderDeniedNotification(delivery: Delivery, reason?: string, doctorName?: string) {
    const notification: Omit<Notification, 'id' | 'timestamp' | 'read'> = {
      type: 'order_denied',
      title: 'Order Denied',
      message: `Your ${delivery.medicationName} order has been denied${reason ? `: ${reason}` : ''}`,
      priority: 'high',
      actionUrl: `/demo/patient?highlight=${delivery.id}`,
      metadata: {
        orderId: delivery.id,
        patientId: delivery.patientId,
        medicationName: delivery.medicationName,
        doctorId: delivery.doctorId
      }
    }
    
    addNotification(notification)
    
    toast.warning(
      'Order Denied',
      `${delivery.medicationName} order was not approved${reason ? `: ${reason}` : ''}`,
      {
        duration: 10000, // Show longer for important info
        action: {
          label: 'View Details',
          onClick: () => window.open(`/demo/patient?highlight=${delivery.id}`, '_blank')
        }
      }
    )
    
    console.log('❌ Order denied notification sent:', delivery.id)
  }
  
  // Send notification when delivery is dispatched
  static sendDeliveryDispatchedNotification(delivery: Delivery) {
    const notification: Omit<Notification, 'id' | 'timestamp' | 'read'> = {
      type: 'delivery_dispatched',
      title: 'Delivery Dispatched',
      message: `Your ${delivery.medicationName} is now in transit via drone ${delivery.droneId}`,
      priority: 'medium',
      actionUrl: `/tracking?id=${delivery.id}&type=patient`,
      metadata: {
        orderId: delivery.id,
        patientId: delivery.patientId,
        medicationName: delivery.medicationName
      }
    }
    
    addNotification(notification)
    
    toast.info(
      'Delivery Dispatched',
      `Drone ${delivery.droneId} is en route with your ${delivery.medicationName}`,
      {
        action: {
          label: 'Track Live',
          onClick: () => window.open(`/tracking?id=${delivery.id}&type=patient`, '_blank')
        }
      }
    )
    
    console.log('🚁 Delivery dispatched notification sent:', delivery.id)
  }
  
  // Send notification when delivery is completed
  static sendDeliveryCompletedNotification(delivery: Delivery) {
    const notification: Omit<Notification, 'id' | 'timestamp' | 'read'> = {
      type: 'delivery_completed',
      title: 'Delivery Completed',
      message: `Your ${delivery.medicationName} has been successfully delivered`,
      priority: 'medium',
      actionUrl: `/demo/patient?highlight=${delivery.id}`,
      metadata: {
        orderId: delivery.id,
        patientId: delivery.patientId,
        medicationName: delivery.medicationName
      }
    }
    
    addNotification(notification)
    
    toast.success(
      'Delivery Completed!',
      `${delivery.medicationName} has been delivered successfully`,
      {
        action: {
          label: 'View Order',
          onClick: () => window.open(`/demo/patient?highlight=${delivery.id}`, '_blank')
        }
      }
    )
    
    console.log('✅ Delivery completed notification sent:', delivery.id)
  }
  
  // Send notification for emergency requests
  static sendEmergencyRequestNotification(delivery: Delivery) {
    const notification: Omit<Notification, 'id' | 'timestamp' | 'read'> = {
      type: 'emergency_request',
      title: 'EMERGENCY REQUEST',
      message: `URGENT: Emergency delivery of ${delivery.medicationName} for ${delivery.patientName || delivery.patientId}`,
      priority: 'urgent',
      actionUrl: `/demo/doctor?highlight=${delivery.id}`,
      metadata: {
        orderId: delivery.id,
        patientId: delivery.patientId,
        medicationName: delivery.medicationName,
        priority: delivery.priority
      }
    }
    
    addNotification(notification)
    
    // Emergency notifications should be very prominent
    toast.error(
      '🚨 EMERGENCY REQUEST',
      `Critical delivery needed: ${delivery.medicationName}`,
      {
        duration: 0, // Don't auto-dismiss
        action: {
          label: 'REVIEW NOW',
          onClick: () => window.open(`/demo/doctor?highlight=${delivery.id}`, '_blank')
        }
      }
    )
    
    console.log('🚨 Emergency request notification sent:', delivery.id)
  }
  
  // Send system notifications
  static sendSystemNotification(title: string, message: string, priority: Notification['priority'] = 'low') {
    const notification: Omit<Notification, 'id' | 'timestamp' | 'read'> = {
      type: 'system',
      title,
      message,
      priority
    }
    
    addNotification(notification)
    
    toast.info(title, message)
    
    console.log('ℹ️ System notification sent:', title)
  }
  
  // Test function to demonstrate all notification types
  static sendTestNotifications() {
    console.log('🧪 Sending test notifications...')
    
    // Test order placed
    setTimeout(() => {
      this.sendOrderPlacedNotification({
        id: 'TEST-001',
        medicationName: 'Insulin Humalog',
        patientId: 'P-001',
        patientName: 'John Doe',
        priority: 'urgent',
        status: 'pending',
        approvalStatus: 'pending',
        requestedAt: new Date(),
        deliveredAt: null,
        estimatedTime: 15,
        actualTime: null,
        droneId: null,
        distance: '2.5 km',
        cost: 29.99,
        requestedBy: 'patient'
      })
    }, 1000)
    
    // Test emergency request
    setTimeout(() => {
      this.sendEmergencyRequestNotification({
        id: 'EMERGENCY-001',
        medicationName: 'EpiPen',
        patientId: 'P-002',
        patientName: 'Jane Smith',
        priority: 'emergency',
        status: 'pending',
        approvalStatus: 'pending',
        requestedAt: new Date(),
        deliveredAt: null,
        estimatedTime: 8,
        actualTime: null,
        droneId: null,
        distance: '1.2 km',
        cost: 89.99,
        requestedBy: 'patient'
      })
    }, 3000)
    
    // Test approval
    setTimeout(() => {
      this.sendOrderApprovedNotification({
        id: 'TEST-002',
        medicationName: 'Metformin',
        patientId: 'P-003',
        patientName: 'Bob Johnson',
        priority: 'routine',
        status: 'pending',
        approvalStatus: 'approved',
        requestedAt: new Date(),
        deliveredAt: null,
        estimatedTime: 20,
        actualTime: null,
        droneId: null,
        distance: '3.8 km',
        cost: 19.99,
        requestedBy: 'patient'
      }, 'Dr. Sarah Wilson')
    }, 5000)
    
    // Test dispatch
    setTimeout(() => {
      this.sendDeliveryDispatchedNotification({
        id: 'TEST-003',
        medicationName: 'Aspirin',
        patientId: 'P-004',
        patientName: 'Alice Brown',
        priority: 'routine',
        status: 'in-transit',
        approvalStatus: 'approved',
        requestedAt: new Date(),
        deliveredAt: null,
        estimatedTime: 12,
        actualTime: null,
        droneId: 'DR-456',
        distance: '2.1 km',
        cost: 14.99,
        requestedBy: 'patient'
      })
    }, 7000)
    
    // Test delivery completion
    setTimeout(() => {
      this.sendDeliveryCompletedNotification({
        id: 'TEST-004',
        medicationName: 'Vitamin D',
        patientId: 'P-005',
        patientName: 'Charlie Davis',
        priority: 'routine',
        status: 'delivered',
        approvalStatus: 'approved',
        requestedAt: new Date(),
        deliveredAt: new Date(),
        estimatedTime: 18,
        actualTime: 16,
        droneId: 'DR-789',
        distance: '4.2 km',
        cost: 24.99,
        requestedBy: 'patient'
      })
    }, 9000)
    
    console.log('🎬 Test notifications will appear over the next 10 seconds')
  }
}

// Export for global access in browser console
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).NotificationService = NotificationService
}
