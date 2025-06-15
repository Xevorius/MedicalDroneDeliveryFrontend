"use client"

import { useState, useEffect } from "react"
import { X, Check, AlertTriangle, Info, Package } from "lucide-react"
import { Button } from "components/ui/button"

export interface Toast {
  id: string
  type: "success" | "error" | "warning" | "info" | "notification"
  title: string
  message?: string
  duration?: number // in milliseconds, 0 = never auto-dismiss
  action?: {
    label: string
    onClick: () => void
  }
  onDismiss?: () => void
}

interface ToastContainerProps {
  className?: string
}

// Toast storage and management
const toastSubscribers: Set<(toasts: Toast[]) => void> = new Set()
let activeToasts: Toast[] = []

// Subscribe to toast updates
function subscribeToToasts(callback: (toasts: Toast[]) => void) {
  toastSubscribers.add(callback)
  return () => {
    toastSubscribers.delete(callback)
  }
}

// Notify all subscribers of toast changes
function notifyToastSubscribers() {
  toastSubscribers.forEach(callback => callback([...activeToasts]))
}

// Add a new toast
export function addToast(toast: Omit<Toast, 'id'>): string {
  const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  const newToast: Toast = {
    ...toast,
    id,
    duration: toast.duration ?? 5000 // Default 5 seconds
  }
  
  activeToasts = [newToast, ...activeToasts.slice(0, 4)] // Keep max 5 toasts
  notifyToastSubscribers()
  
  // Auto-dismiss after duration (if not 0)
  if (newToast.duration && newToast.duration > 0) {
    setTimeout(() => {
      dismissToast(id)
    }, newToast.duration)
  }
  
  console.log('🍞 New toast added:', newToast)
  return id
}

// Dismiss a toast
export function dismissToast(toastId: string): void {
  const toast = activeToasts.find(t => t.id === toastId)
  if (toast?.onDismiss) {
    toast.onDismiss()
  }
  
  activeToasts = activeToasts.filter(t => t.id !== toastId)
  notifyToastSubscribers()
}

// Clear all toasts
export function clearAllToasts(): void {
  activeToasts = []
  notifyToastSubscribers()
}

// Quick toast helpers
export const toast = {
  success: (title: string, message?: string, options?: Partial<Toast>) => 
    addToast({ type: 'success', title, message, ...options }),
  
  error: (title: string, message?: string, options?: Partial<Toast>) => 
    addToast({ type: 'error', title, message, duration: 7000, ...options }),
  
  warning: (title: string, message?: string, options?: Partial<Toast>) => 
    addToast({ type: 'warning', title, message, ...options }),
  
  info: (title: string, message?: string, options?: Partial<Toast>) => 
    addToast({ type: 'info', title, message, ...options }),
  
  notification: (title: string, message?: string, options?: Partial<Toast>) => 
    addToast({ type: 'notification', title, message, duration: 8000, ...options }),
}

// Get toast icon and colors
function getToastConfig(type: Toast['type']) {
  switch (type) {
    case 'success':
      return {
        icon: <Check className="h-5 w-5" />,
        className: 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200'
      }
    case 'error':
      return {
        icon: <X className="h-5 w-5" />,
        className: 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200'
      }
    case 'warning':
      return {
        icon: <AlertTriangle className="h-5 w-5" />,
        className: 'border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200'
      }
    case 'info':
      return {
        icon: <Info className="h-5 w-5" />,
        className: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200'
      }
    case 'notification':
      return {
        icon: <Package className="h-5 w-5" />,
        className: 'border-purple-200 bg-purple-50 text-purple-800 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-200'
      }
    default:
      return {
        icon: <Info className="h-5 w-5" />,
        className: 'border-gray-200 bg-gray-50 text-gray-800 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200'
      }
  }
}

// Individual toast component
function ToastItem({ toast: toastData }: { toast: Toast }) {
  const config = getToastConfig(toastData.type)
  
  return (
    <div 
      className={`relative flex gap-3 p-4 rounded-lg border shadow-lg animate-in slide-in-from-right-full ${config.className}`}
      role="alert"
    >
      <div className="flex-shrink-0">
        {config.icon}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-sm">
            {toastData.title}
          </h4>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
            onClick={() => dismissToast(toastData.id)}
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Dismiss</span>
          </Button>
        </div>
        
        {toastData.message && (
          <p className="text-xs mt-1 opacity-90">
            {toastData.message}
          </p>
        )}
        
        {toastData.action && (
          <div className="mt-2">
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => {
                toastData.action?.onClick()
                dismissToast(toastData.id)
              }}
            >
              {toastData.action.label}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// Toast container component
export function ToastContainer({ className }: ToastContainerProps) {
  const [toasts, setToasts] = useState<Toast[]>([])
  
  useEffect(() => {
    // Set initial toasts
    setToasts([...activeToasts])
    
    // Subscribe to toast updates
    const unsubscribe = subscribeToToasts(setToasts)
    return unsubscribe
  }, [])
  
  if (toasts.length === 0) return null
  
  return (
    <div className={`fixed top-4 right-4 z-50 flex flex-col gap-2 w-80 max-w-sm ${className}`}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}
