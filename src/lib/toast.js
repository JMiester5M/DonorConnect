/**
 * Toast Utility Component
 * Provides toast notification system with success, error, info, and warning types
 */

import { useState, useCallback, useEffect } from 'react'
import { createContext, useContext } from 'react'

// Create toast context for global access
const ToastContext = createContext()

// Toast state management hook
export function useToast() {
  const [toasts, setToasts] = useState([])

  // Generate unique ID for each toast
  const generateId = useCallback(() => {
    return Date.now() + Math.random()
  }, [])

  // Add toast to state with auto-dismiss
  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = generateId()
    setToasts((prev) => [...prev, { id, message, type }])

    // Auto-dismiss after duration
    if (duration > 0) {
      setTimeout(() => {
        dismissToast(id)
      }, duration)
    }

    return id
  }, [generateId])

  // Toast functions for different types
  const toast = {
    success: (message, duration = 3000) => {
      return addToast(message, 'success', duration)
    },
    error: (message, duration = 4000) => {
      return addToast(message, 'error', duration)
    },
    info: (message, duration = 3000) => {
      return addToast(message, 'info', duration)
    },
    warning: (message, duration = 3500) => {
      return addToast(message, 'warning', duration)
    }
  }

  // Remove toast from state
  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { toast, toasts, dismissToast }
}

// Toast container component that renders all active toasts
export function Toaster() {
  const context = useContext(ToastContext)
  if (!context) {
    return null
  }

  const { toasts, dismissToast } = context

  const getStyles = (type) => {
    const baseStyles = 'fixed right-4 px-6 py-4 rounded-md shadow-lg text-white flex items-center justify-between gap-4 animate-slideIn'
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-500`
      case 'error':
        return `${baseStyles} bg-red-500`
      case 'warning':
        return `${baseStyles} bg-yellow-500`
      case 'info':
      default:
        return `${baseStyles} bg-blue-500`
    }
  }

  return (
    <div className="fixed right-0 top-4 z-50 space-y-2">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className={getStyles(toast.type)}
          style={{ top: `${index * 80 + 16}px` }}
        >
          <span className="text-sm font-medium">{toast.message}</span>
          <button
            onClick={() => dismissToast(toast.id)}
            className="text-white hover:opacity-80 transition-opacity flex-shrink-0"
            aria-label="Close notification"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}

// Provider component to wrap the app and provide toast context
export function ToastProvider({ children }) {
  const toastUtils = useToast()

  return (
    <ToastContext.Provider value={toastUtils}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  )
}

// Hook to use toast from anywhere in the app
export function useToastNotification() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToastNotification must be used within a ToastProvider')
  }
  return context.toast
}

// Example usage:
// 1. Wrap app with ToastProvider in layout.jsx:
//    <ToastProvider><Body>{children}</Body></ToastProvider>
//
// 2. Use in any client component:
//    const toast = useToastNotification()
//    toast.success('Donor created successfully!')
//    toast.error('Failed to save donor')
//    toast.info('Processing donation...')
//    toast.warning('Duplicate email detected')

// Simple client-side toast for use outside of React context
export const toast = {
  success: (message) => console.log('[SUCCESS]', message),
  error: (message) => console.error('[ERROR]', message),
  info: (message) => console.info('[INFO]', message),
  warning: (message) => console.warn('[WARNING]', message)
}
