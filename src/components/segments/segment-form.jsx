'use client'

/**
 * Segment Form Component
 */

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { createSegmentSchema } from '@/lib/validation/segment-schema'
import { DonorStatusEnum, RetentionRiskEnum } from '@/lib/validation/donor-schema'

export function SegmentForm({ segment, onSubmit, onCancel }) {
  const numberField = z.preprocess((val) => (val === '' || val === null ? undefined : val), z.coerce.number().nonnegative().optional())

  const formSchema = createSegmentSchema.extend({
    donorStatus: DonorStatusEnum.optional().or(z.literal('')),
    retentionRisk: RetentionRiskEnum.optional().or(z.literal('')),
    lastGiftFrom: z.string().optional(),
    lastGiftTo: z.string().optional(),
    minTotalAmount: numberField,
    maxTotalAmount: numberField,
    minGiftCount: numberField,
    maxGiftCount: numberField,
    tags: z.string().optional(),
  })

  const rules = segment?.rules || {}

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: segment?.name ?? '',
      description: segment?.description ?? '',
      donorStatus: rules.donorStatus?.[0] ?? '',
      retentionRisk: rules.retentionRisk?.[0] ?? '',
      lastGiftFrom: rules.lastGiftDateRange?.from ?? '',
      lastGiftTo: rules.lastGiftDateRange?.to ?? '',
      minTotalAmount: rules.totalGiftAmountRange?.min ?? '',
      maxTotalAmount: rules.totalGiftAmountRange?.max ?? '',
      minGiftCount: rules.giftCountRange?.min ?? '',
      maxGiftCount: rules.giftCountRange?.max ?? '',
      tags: rules.tags?.join(', ') ?? '',
    },
  })

  const buildRules = (data) => {
    const built = {}
    if (data.donorStatus) built.donorStatus = [data.donorStatus]
    if (data.retentionRisk) built.retentionRisk = [data.retentionRisk]
    if (data.lastGiftFrom || data.lastGiftTo) {
      built.lastGiftDateRange = {
        from: data.lastGiftFrom || undefined,
        to: data.lastGiftTo || undefined,
      }
    }
    if (data.minTotalAmount !== undefined || data.maxTotalAmount !== undefined) {
      built.totalGiftAmountRange = {
        min: data.minTotalAmount,
        max: data.maxTotalAmount,
      }
    }
    if (data.minGiftCount !== undefined || data.maxGiftCount !== undefined) {
      built.giftCountRange = {
        min: data.minGiftCount,
        max: data.maxGiftCount,
      }
    }
    if (data.tags) {
      built.tags = data.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
    }
    return Object.keys(built).length ? built : undefined
  }

  const handleSubmit = async (data) => {
    try {
      const rulesPayload = buildRules(data)
      await onSubmit?.({
        name: data.name,
        description: data.description || null,
        rules: rulesPayload,
      })
    } catch (error) {
      form.setError('root', { message: error?.message || 'Failed to save segment' })
    }
  }

  const inputLikeClasses = 'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'

  return (
    <Form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Lapsed donors 6-12 months" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <textarea
                    rows={3}
                    className={`${inputLikeClasses} min-h-[90px]`}
                    placeholder="Define the purpose of this segment"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="donorStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Donor Status</FormLabel>
                <FormControl>
                  <select className={inputLikeClasses} {...field}>
                    <option value="">Any</option>
                    <option value="ACTIVE">Active</option>
                    <option value="LAPSED">Lapsed</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="DO_NOT_CONTACT">Do Not Contact</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="retentionRisk"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Retention Risk</FormLabel>
                <FormControl>
                  <select className={inputLikeClasses} {...field}>
                    <option value="">Any</option>
                    <option value="UNKNOWN">Unknown</option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastGiftFrom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Gift From</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastGiftTo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Gift To</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="minTotalAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Min Total Amount</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxTotalAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Total Amount</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="minGiftCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Min Gift Count</FormLabel>
                <FormControl>
                  <Input type="number" min="0" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxGiftCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Gift Count</FormLabel>
                <FormControl>
                  <Input type="number" min="0" placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Tags (comma separated)</FormLabel>
                <FormControl>
                  <Input placeholder="major donor, gala" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {form.formState.errors.root?.message && (
          <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
        )}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Saving...' : segment ? 'Update Segment' : 'Create Segment'}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={form.formState.isSubmitting}>
              Cancel
            </Button>
          )}
          <span className="text-xs text-muted-foreground">Segment size updates after saving and recalculation.</span>
        </div>
    </Form>
  )
}

// TODO: Example usage:
// <SegmentForm 
//   segment={editingSegment} 
//   onSubmit={handleCreateSegment}
//   onCancel={() => setShowForm(false)}
// />