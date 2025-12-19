'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createCampaignSchema } from '@/lib/validation/campaign-schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

export function CampaignForm({ campaign, onSubmit, isLoading = false }) {
  const form = useForm({
    resolver: zodResolver(createCampaignSchema),
    defaultValues: {
      name: '',
      description: '',
      goal: '',
      startDate: '',
      endDate: '',
      type: '',
      status: 'DRAFT',
    },
  })

  // Reset form when campaign changes
  useEffect(() => {
    if (campaign) {
      form.reset({
        name: campaign.name || '',
        description: campaign.description || '',
        goal: campaign.goal || '',
        startDate: campaign.startDate ? new Date(campaign.startDate).toISOString().split('T')[0] : '',
        endDate: campaign.endDate ? new Date(campaign.endDate).toISOString().split('T')[0] : '',
        type: campaign.type || '',
        status: campaign.status || 'DRAFT',
      })
    }
  }, [campaign, form])

  const handleSubmit = async (data) => {
    try {
      await onSubmit(data)
      form.reset()
    } catch (err) {
      console.error('Form submission error:', err)
    }
  }

  return (
    <div className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Campaign Name *</FormLabel>
              <Input placeholder="Annual Fund Drive" {...field} />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <Textarea placeholder="Campaign details and goals..." {...field} rows={4} />
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="goal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Goal Amount ($)</FormLabel>
                <Input type="number" placeholder="10000" {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Campaign Type</FormLabel>
                <Input placeholder="e.g., Annual Fund, Major Gifts" {...field} />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <Input type="date" {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <Input type="date" {...field} />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <select 
                {...field}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="ARCHIVED">Archived</option>
              </select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="button"
          disabled={isLoading} 
          className="w-full"
          onClick={form.handleSubmit(handleSubmit)}
        >
          {isLoading ? 'Saving...' : 'Save Campaign'}
        </Button>
    </div>
  )
}
