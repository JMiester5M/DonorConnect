/**
 * Task Form Component
 * Handles creating and editing tasks
 */

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { createTaskSchema } from '@/lib/validation/task-schema'
import { toast } from '@/lib/toast'

export function TaskForm({ task, donors = [], users = [], onSubmit, onCancel }) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    resolver: zodResolver(createTaskSchema),
    defaultValues: task || {
      title: '',
      description: '',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: '',
      donorId: null,
      assignedTo: '',
    },
  })

  const handleSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
      toast.success(task ? 'Task updated' : 'Task created')
    } catch (error) {
      toast.error(error.message || 'Failed to save task')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="task-title" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Task Title
        </label>
        <Input
          id="task-title"
          placeholder="e.g., Follow up with donor"
          {...form.register('title')}
          disabled={isSubmitting}
          className="mt-2"
        />
        {form.formState.errors.title && (
          <p className="text-sm font-medium text-destructive mt-1">
            {form.formState.errors.title.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="task-description" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Description (Optional)
        </label>
        <Textarea
          id="task-description"
          placeholder="Add notes about this task..."
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="task-status" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Status
          </label>
          <Select
            value={form.watch('status')}
            onValueChange={(value) => form.setValue('status', value)}
            disabled={isSubmitting}
          >
            <SelectTrigger id="task-status" className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-[100] bg-white">
              <SelectItem value="TODO">To Do</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.status && (
            <p className="text-sm font-medium text-destructive mt-1">
              {form.formState.errors.status.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="task-priority" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Priority
          </label>
          <Select
            value={form.watch('priority')}
            onValueChange={(value) => form.setValue('priority', value)}
            disabled={isSubmitting}
          >
            <SelectTrigger id="task-priority" className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-[100] bg-white">
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="URGENT">Urgent</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.priority && (
            <p className="text-sm font-medium text-destructive mt-1">
              {form.formState.errors.priority.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="task-due-date" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Due Date (Optional)
        </label>
        <div className="flex gap-2 items-center mt-2">
          <Input
            id="task-due-date"
            type="datetime-local"
            {...form.register('dueDate')}
            disabled={isSubmitting}
            className="flex-1"
          />
          {form.watch('dueDate') && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => form.setValue('dueDate', '')}
              disabled={isSubmitting}
            >
              Clear
            </Button>
          )}
        </div>
        {form.formState.errors.dueDate && (
          <p className="text-sm font-medium text-destructive mt-1">
            {form.formState.errors.dueDate.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="task-donor" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Related Donor (Optional)
          </label>
          <Select
            value={form.watch('donorId') || ''}
            onValueChange={(value) => form.setValue('donorId', value || null)}
            disabled={isSubmitting}
          >
            <SelectTrigger id="task-donor" className="mt-2">
              <SelectValue placeholder="Select a donor..." />
            </SelectTrigger>
            <SelectContent className="z-[100] bg-white">
              {donors.map((donor) => (
                <SelectItem key={donor.id} value={donor.id}>
                  {donor.firstName} {donor.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="task-assigned" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Assign To
          </label>
          <Select
            value={form.watch('assignedTo') || ''}
            onValueChange={(value) => form.setValue('assignedTo', value)}
            disabled={isSubmitting}
          >
            <SelectTrigger id="task-assigned" className="mt-2">
              <SelectValue placeholder="Select a team member..." />
            </SelectTrigger>
            <SelectContent className="z-[100] bg-white">
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.firstName} {user.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.assignedTo && (
            <p className="text-sm font-medium text-destructive mt-1">
              {form.formState.errors.assignedTo.message}
            </p>
          )}
        </div>
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
          {isSubmitting ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </div>
  )
}
