'use client'

/**
 * Donor Form Component
 */

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { createDonorSchema } from '@/lib/validation/donor-schema'

export function DonorForm({ donor, onSubmit, onCancel }) {
  const [showPasswordError, setShowPasswordError] = useState(false)
  const form = useForm({
    resolver: zodResolver(createDonorSchema),
    defaultValues: {
      firstName: donor?.firstName || '',
      lastName: donor?.lastName || '',
      email: donor?.email || '',
      phone: donor?.phone || '',
      address: donor?.address || '',
      city: donor?.city || '',
      state: donor?.state || '',
      zipCode: donor?.zipCode || '',
      status: donor?.status || 'ACTIVE',
      password: donor ? '' : undefined,
      confirmPassword: donor ? '' : undefined,
    },
  })

  // Reset form when donor data changes
  useEffect(() => {
    if (donor) {
      form.reset({
        firstName: donor.firstName || '',
        lastName: donor.lastName || '',
        email: donor.email || '',
        phone: donor.phone || '',
        address: donor.address || '',
        city: donor.city || '',
        state: donor.state || '',
        zipCode: donor.zipCode || '',
        status: donor.status || 'ACTIVE',
        password: '',
        confirmPassword: '',
      })
    }
  }, [donor, form])

  const handleSubmit = async (data) => {
    let payload = { ...data }
    // Always send password fields for creation, only filter for updates
    if (!donor) {
      // Creating new donor: always send password fields
    } else {
      // Updating donor: only send password fields if non-empty
      if (!payload.password) delete payload.password
      if (!payload.confirmPassword) delete payload.confirmPassword
    }
    try {
      await onSubmit?.(payload)
    } catch (error) {
      form.setError('root', { message: error?.message || 'Failed to save donor' })
    }
  }

  const inputLikeClasses = 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'

  // Show overlay if confirmPassword error is present
  useEffect(() => {
    if (form.formState.errors.confirmPassword?.message === 'Passwords do not match') {
      setShowPasswordError(true)
    }
  }, [form.formState.errors.confirmPassword])

  return (
    <Form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="Jane" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="jane@example.org" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="(555) 123-4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="123 Main St" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="Springfield" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <FormControl>
                  <Input placeholder="IL" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="zipCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ZIP Code</FormLabel>
                <FormControl>
                  <Input placeholder="12345" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />


          {/* Password and Confirm Password fields for admin to set user password */}
          <div className="md:col-span-2 border-t pt-4 mt-2">
            <h3 className="font-semibold mb-2">Set/Change Password</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="password"
                rules={{ required: 'Password is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Set user password" autoComplete="new-password" required {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                rules={{ required: 'Confirm password is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Confirm password" autoComplete="new-password" required {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

        </div>

        {/* Overlay for password mismatch error */}
        {showPasswordError && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
            onClick={() => setShowPasswordError(false)}
            style={{ cursor: 'pointer' }}
          >
            <div className="bg-white rounded-lg shadow-lg px-8 py-6 text-center max-w-xs mx-auto">
              <p className="text-lg font-semibold text-red-600 mb-2">Passwords do not match</p>
              <p className="text-sm text-gray-600">Click anywhere to dismiss</p>
            </div>
          </div>
        )}
        {form.formState.errors.root?.message && (
          <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
        )}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Saving...' : donor ? 'Update Donor' : 'Create Donor'}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={form.formState.isSubmitting}>
              Cancel
            </Button>
          )}
        </div>
    </Form>
  )
}

// TODO: Example usage:
// <DonorForm 
//   donor={editingDonor} 
//   onSubmit={handleCreateDonor}
//   onCancel={() => setShowForm(false)}
// />
