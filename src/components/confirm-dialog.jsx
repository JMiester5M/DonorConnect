"use client"

/**
 * Confirm Dialog Component - Reusable confirmation dialog
 */

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'

export function ConfirmDialog({
  isOpen,
  onClose,
  open,
  onConfirm,
  onCancel,
  title,
  description,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  variant = 'destructive',
}) {
  const [loading, setLoading] = useState(false)
  // Support both prop patterns
  const isDialogOpen = isOpen !== undefined ? isOpen : open !== undefined ? open : false
  const handleClose = onClose || onCancel

  useEffect(() => {
    if (!isDialogOpen) return
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        handleClose?.()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isDialogOpen, handleClose])

  const handleConfirm = async () => {
    if (loading) return
    setLoading(true)
    try {
      await onConfirm?.()
      handleClose?.()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) handleClose?.() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button variant={variant} onClick={handleConfirm} disabled={loading}>
            {loading ? 'Deleting...' : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// TODO: Example usage:
// <ConfirmDialog
//   isOpen={showDeleteDialog}
//   onClose={() => setShowDeleteDialog(false)}
//   onConfirm={handleDeleteDonor}
//   title="Delete Donor"
//   description="Are you sure you want to delete this donor? This action cannot be undone."
//   confirmText="Delete"
//   variant="destructive"
// />