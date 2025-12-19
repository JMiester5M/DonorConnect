'use client'

/**
 * Donation Form Component
 */

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { createDonationSchema } from '@/lib/validation/donation-schema'

export function DonationForm({ donation, donors = [], campaigns = [], onSubmit, onCancel }) {
  const [loadingDonors, setLoadingDonors] = useState(false)
  const [loadingCampaigns, setLoadingCampaigns] = useState(false)
  const [donorList, setDonorList] = useState(donors)
  const [campaignList, setCampaignList] = useState(campaigns)

  const form = useForm({
    resolver: zodResolver(createDonationSchema),
    defaultValues: {
      donorId: donation?.donorId || '',
      campaignId: donation?.campaignId || '',
      amount: donation?.amount || '',
      date: donation?.date ? new Date(donation.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      type: donation?.type || 'ONE_TIME',
      method: donation?.method || '',
      notes: donation?.notes || '',
    },
  })

  // Reset form when donation data changes
  useEffect(() => {
    if (donation) {
      form.reset({
        donorId: donation.donorId || '',
        campaignId: donation.campaignId || '',
        amount: donation.amount || '',
        date: donation.date ? new Date(donation.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        type: donation.type || 'ONE_TIME',
        method: donation.method || '',
        notes: donation.notes || '',
      })
    }
  }, [donation, form])

  // Fetch donors if not provided
  useEffect(() => {
    if (donorList.length === 0) {
      setLoadingDonors(true)
      fetch('/api/donors?limit=1000')
        .then(res => res.json())
        .then(data => {
          const donors = data.data || []
          // Sort by first name in ascending order
          donors.sort((a, b) => (a.firstName || '').localeCompare(b.firstName || ''))
          setDonorList(donors)
        })
        .catch(err => console.error('Failed to load donors:', err))
        .finally(() => setLoadingDonors(false))
    }
  }, [donorList.length])

  // Fetch campaigns if not provided
  useEffect(() => {
    if (campaignList.length === 0) {
      setLoadingCampaigns(true)
      fetch('/api/campaigns?limit=100')
        .then(res => res.json())
        .then(data => {
          // Filter for only ACTIVE campaigns
          const activeCampaigns = (data.data || []).filter(campaign => campaign.status === 'ACTIVE')
          // Sort by name in ascending order
          activeCampaigns.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
          setCampaignList(activeCampaigns)
        })
        .catch(err => console.error('Failed to load campaigns:', err))
        .finally(() => setLoadingCampaigns(false))
    }
  }, [campaignList.length])

  const handleSubmit = async (data) => {
    try {
      await onSubmit?.(data)
    } catch (error) {
      form.setError('root', { message: error?.message || 'Failed to save donation' })
    }
  }

  const inputLikeClasses = 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
  const textareaClasses = 'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'

  return (
    <Form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="donorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Donor *</FormLabel>
              <select className={inputLikeClasses} {...field} disabled={loadingDonors}>
                <option value="">Select donor...</option>
                {donorList.map(donor => (
                  <option key={donor.id} value={donor.id}>
                    {donor.firstName} {donor.lastName}
                  </option>
                ))}
              </select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount *</FormLabel>
              <Input type="number" step="0.01" min="0" placeholder="100.00" {...field} />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date *</FormLabel>
              <Input type="date" {...field} />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <select className={inputLikeClasses} {...field}>
                <option value="ONE_TIME">One-Time</option>
                <option value="RECURRING">Recurring</option>
                <option value="PLEDGE">Pledge</option>
                <option value="IN_KIND">In-Kind</option>
              </select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="campaignId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Campaign (Optional)</FormLabel>
              <select className={inputLikeClasses} {...field} disabled={loadingCampaigns}>
                <option value="">No campaign</option>
                {campaignList.map(campaign => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </option>
                ))}
              </select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="method"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Method (Optional)</FormLabel>
              <Input placeholder="Credit Card, Check, Wire..." {...field} />
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notes (Optional)</FormLabel>
            <textarea className={textareaClasses} placeholder="Additional notes..." {...field} />
            <FormMessage />
          </FormItem>
        )}
      />

      {form.formState.errors.root?.message && (
        <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Saving...' : donation ? 'Update Donation' : 'Create Donation'}
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