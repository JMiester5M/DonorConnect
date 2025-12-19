import { z } from 'zod'

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().max(1000).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  dueDate: z.string().datetime().optional().nullable().or(z.literal('')).transform(val => val === '' ? null : val),
  donorId: z.string().min(1).optional().nullable().or(z.literal('')).transform(val => val === '' ? null : val),
  assignedTo: z.string().min(1, 'Must assign task to a team member'),
})

export const updateTaskSchema = createTaskSchema.partial()

export const taskListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  search: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
})
