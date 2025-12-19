// Zod validation schemas for workflow operations
import { z } from 'zod'

const workflowStepSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['email', 'sms', 'note', 'task']).optional(),
  action: z.string().optional(),
  delayDays: z.number().optional(),
})

export const createWorkflowSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().max(1000).optional(),
  trigger: z.enum(['FIRST_DONATION', 'DONATION_RECEIVED', 'INACTIVITY_THRESHOLD', 'SEGMENT_ENTRY', 'MANUAL', 'SCHEDULED']),
  steps: z.array(workflowStepSchema).optional(),
  segmentId: z.string().min(1).optional().nullable().or(z.literal('')).transform(val => val === '' ? null : val),
  isActive: z.boolean().default(false),
})

export const updateWorkflowSchema = createWorkflowSchema.partial()

export const workflowListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  search: z.string().optional(),
})