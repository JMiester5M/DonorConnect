/**
 * Workflow Form Component
 * Handles creating and editing automated workflows
 */

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { createWorkflowSchema } from '@/lib/validation/workflow-schema'
import { toast } from '@/lib/toast'

export function WorkflowForm({ workflow, segments = [], onSubmit, onCancel }) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    resolver: zodResolver(createWorkflowSchema),
    defaultValues: workflow || {
      name: '',
      description: '',
      trigger: 'DONATION_RECEIVED',
      steps: [],
      segmentId: null,
      isActive: false,
    },
  })

  const handleSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
      toast.success(workflow ? 'Workflow updated' : 'Workflow created')
    } catch (error) {
      toast.error(error.message || 'Failed to save workflow')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="workflow-name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Workflow Name
        </label>
        <Input
          id="workflow-name"
          placeholder="e.g., First-Time Donor Follow-up"
          {...form.register('name')}
          disabled={isSubmitting}
          className="mt-2"
        />
        {form.formState.errors.name && (
          <p className="text-sm font-medium text-destructive mt-1">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="workflow-description" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Description (Optional)
        </label>
        <Textarea
          id="workflow-description"
          placeholder="Describe what this workflow does..."
          {...form.register('description')}
          disabled={isSubmitting}
          className="mt-2"
        />
        {form.formState.errors.description && (
          <p className="text-sm font-medium text-destructive mt-1">
            {form.formState.errors.description.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="workflow-trigger" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Trigger Event
        </label>
        <Select
          value={form.watch('trigger')}
          onValueChange={(value) => form.setValue('trigger', value)}
          disabled={isSubmitting}
        >
          <SelectTrigger id="workflow-trigger" className="mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="z-[100] bg-white">
            <SelectItem value="FIRST_DONATION">First Donation</SelectItem>
            <SelectItem value="DONATION_RECEIVED">Donation Received</SelectItem>
            <SelectItem value="INACTIVITY_THRESHOLD">Inactivity Threshold</SelectItem>
            <SelectItem value="SEGMENT_ENTRY">Segment Entry</SelectItem>
            <SelectItem value="MANUAL">Manual Trigger</SelectItem>
            <SelectItem value="SCHEDULED">Scheduled</SelectItem>
          </SelectContent>
        </Select>
        {form.formState.errors.trigger && (
          <p className="text-sm font-medium text-destructive mt-1">
            {form.formState.errors.trigger.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="workflow-segment" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Target Segment (Optional)
        </label>
        <Select
          value={form.watch('segmentId') || ''}
          onValueChange={(value) => form.setValue('segmentId', value || null)}
          disabled={isSubmitting}
        >
          <SelectTrigger id="workflow-segment" className="mt-2">
            <SelectValue placeholder="Select a segment..." />
          </SelectTrigger>
          <SelectContent className="z-[100] bg-white">
            {segments.map((seg) => (
              <SelectItem key={seg.id} value={seg.id}>
                {seg.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.segmentId && (
          <p className="text-sm font-medium text-destructive mt-1">
            {form.formState.errors.segmentId.message}
          </p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="workflow-active"
          checked={form.watch('isActive')}
          onCheckedChange={(checked) => form.setValue('isActive', checked)}
          disabled={isSubmitting}
        />
        <label
          htmlFor="workflow-active"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Enable Workflow
        </label>
      </div>

      <div className="flex gap-2 justify-end pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button 
          type="button" 
          onClick={form.handleSubmit(handleSubmit)} 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : workflow ? 'Update Workflow' : 'Create Workflow'}
        </Button>
      </div>
    </div>
  )
}