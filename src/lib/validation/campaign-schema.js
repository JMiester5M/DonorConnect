// Zod validation schemas for campaign operations
import { z } from 'zod'

// Helper to treat empty strings as undefined for optional fields
const emptyToUndefined = (val) => (val === '' || val === null ? undefined : val)

// Campaign status enum aligned to Prisma
export const CampaignStatusEnum = z.enum(['DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED'])

// Create campaign schema
export const createCampaignSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  description: z.string().max(1000, 'Description must be 1000 characters or less').optional().or(z.literal('')),
  // Map empty string to undefined, then coerce to number if provided
  goal: z
    .preprocess(emptyToUndefined, z.coerce.number().positive('Goal must be positive'))
    .optional(),
  // Map empty string to undefined, then coerce to Date if provided
  startDate: z.preprocess(emptyToUndefined, z.coerce.date()).optional(),
  endDate: z.preprocess(emptyToUndefined, z.coerce.date()).optional(),
  type: z.string().max(50).optional().or(z.literal('')),
  status: CampaignStatusEnum.default('DRAFT'),
})

// Update campaign schema - all optional
export const updateCampaignSchema = createCampaignSchema.partial()

// Query schema for list endpoints
export const campaignListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  status: CampaignStatusEnum.optional(),
  sortBy: z.enum(['name', 'startDate', 'endDate', 'goal', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})