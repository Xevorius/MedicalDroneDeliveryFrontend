"use client"

import { useState, useEffect } from "react"
import { Bell, X, Check, AlertTriangle, Package, Clock } from "lucide-react"
import { Button } from "components/ui/button"
import { Badge } from "components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "components/ui/dropdown-menu"

export interface Notification {
  id: string
  type: "order_placed" | "order_approved" | "order_denied" | "delivery_dispatched" | "delivery_completed" | "emergency_request" | "system"
  title: string
  message: string
  timestamp: Date
  read: boolean
  priority: "low" | "medium" | "high" | "urgent"
  actionUrl?: string
  metadata?: {
    orderId?: string
    patientId?: string
    doctorId?: string
    medicationName?: string
    priority?: string
  }
}

interface NotificationCenterProps {
  className?: string
}

const NOTIFICATIONS_STORAGE_KEY = 'medifly_notifications'

// Get stored notifications
function getStoredNotifications(): Notification[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY)
    if (!stored) return []
    
    const notifications = JSON.parse(stored) as Notification[]
    return notifications.map(n => ({
      ...n,
      timestamp: new Date(n.timestamp)
    }))
  } catch {
    return []
  }
}

// Save notifications to storage
function saveNotifications(notifications: Notification[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications))
}

// Add a new notification
export function addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): void {
  if (typeof window === 'undefined') return
  
  const newNotification: Notification = {
    ...notification,
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    read: false
  }
  
  const existing = getStoredNotifications()
  const updated = [newNotification, ...existing.slice(0, 49)] // Keep last 50 notifications
  saveNotifications(updated)
  
  // Trigger storage event for real-time updates
  window.dispatchEvent(new StorageEvent('storage', {
    key: NOTIFICATIONS_STORAGE_KEY,
    newValue: JSON.stringify(updated)
  }))
  
  console.log('📬 New notification added:', newNotification)
}

// Mark notification as read
export function markNotificationAsRead(notificationId: string): void {
  if (typeof window === 'undefined') return
  
  const notifications = getStoredNotifications()
  const updated = notifications.map(n => 
    n.id === notificationId ? { ...n, read: true } : n
  )
  saveNotifications(updated)
  
  // Trigger storage event
  window.dispatchEvent(new StorageEvent('storage', {
    key: NOTIFICATIONS_STORAGE_KEY,
    newValue: JSON.stringify(updated)
  }))
}

// Clear all notifications
export function clearAllNotifications(): void {
  if (typeof window === 'undefined') return
  
  saveNotifications([])
  
  // Trigger storage event
  window.dispatchEvent(new StorageEvent('storage', {
    key: NOTIFICATIONS_STORAGE_KEY,
    newValue: JSON.stringify([])
  }))
}

// Get notification icon
function getNotificationIcon(type: Notification['type']) {
  switch (type) {
    case 'order_placed':
      return <Package className="h-4 w-4 text-blue-600" />
    case 'order_approved':
      return <Check className="h-4 w-4 text-green-600" />
    case 'order_denied':
      return <X className="h-4 w-4 text-red-600" />
    case 'delivery_dispatched':
      return <Clock className="h-4 w-4 text-purple-600" />
    case 'delivery_completed':
      return <Check className="h-4 w-4 text-green-600" />
    case 'emergency_request':
      return <AlertTriangle className="h-4 w-4 text-red-600" />
    default:
      return <Bell className="h-4 w-4 text-gray-600" />
  }
}

// Get notification priority color
function getPriorityColor(priority: Notification['priority']) {
  switch (priority) {
    case 'urgent':
      return 'bg-red-100 border-red-200 text-red-800'
    case 'high':
      return 'bg-orange-100 border-orange-200 text-orange-800'
    case 'medium':
      return 'bg-yellow-100 border-yellow-200 text-yellow-800'
    default:
      return 'bg-blue-100 border-blue-200 text-blue-800'
  }
}

// Format timestamp
function formatTimestamp(timestamp: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - timestamp.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return timestamp.toLocaleDateString()
}

export function NotificationCenter({ className }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  
  // Load notifications on mount
  useEffect(() => {
    setNotifications(getStoredNotifications())
  }, [])
  
  // Listen for storage events (real-time updates)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === NOTIFICATIONS_STORAGE_KEY) {
        setNotifications(getStoredNotifications())
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])
  
  const unreadCount = notifications.filter(n => !n.read).length
  const recentNotifications = notifications.slice(0, 10) // Show last 10 in dropdown
  
  const handleNotificationClick = (notification: Notification) => {
    markNotificationAsRead(notification.id)
    
    // Navigate to action URL if provided
    if (notification.actionUrl) {
      window.open(notification.actionUrl, '_blank')
    }
  }
  
  const handleMarkAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }))
    saveNotifications(updated)
    setNotifications(updated)
  }
  
  const handleClearAll = () => {
    clearAllNotifications()
    setNotifications([])
    setIsOpen(false)
  }
  
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={`relative ${className}`}>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} new
            </Badge>
          )}
        </div>
        
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No notifications yet</p>
            <p className="text-xs">New orders and updates will appear here</p>
          </div>
        ) : (
          <>
            <div className="max-h-64 overflow-y-auto">
              {recentNotifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`p-3 cursor-pointer hover:bg-muted/50 ${
                    !notification.read ? 'bg-blue-50 dark:bg-blue-950/30' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-3 w-full">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-sm truncate">
                          {notification.title}
                        </p>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getPriorityColor(notification.priority)}`}
                        >
                          {notification.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
            
            {notifications.length > recentNotifications.length && (
              <div className="p-2 border-t text-center">
                <Button variant="ghost" size="sm" className="text-xs">
                  View all {notifications.length} notifications
                </Button>
              </div>
            )}
            
            <DropdownMenuSeparator />
            
            <div className="p-2 flex gap-2">
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex-1 text-xs"
                  onClick={handleMarkAllAsRead}
                >
                  Mark all read
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex-1 text-xs"
                onClick={handleClearAll}
              >
                Clear all
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
