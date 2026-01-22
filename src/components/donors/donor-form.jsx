'use client'

/**
 * Donor Form Component
 */

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { createDonorSchema } from '@/lib/validation/donor-schema'

export function DonorForm({ donor, onSubmit, onCancel }) {
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
      password: '',
      confirmPassword: '',
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
    try {
      await onSubmit?.(data)
    } catch (error) {
      form.setError('root', { message: error?.message || 'Failed to save donor' })
    }
  }

  const inputLikeClasses = 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'

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
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Set user password" autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Confirm password" autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

        </div>

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
