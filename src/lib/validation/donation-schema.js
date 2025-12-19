// Zod validation schemas for donation operations
import { z } from 'zod'

// Enumerations aligned to Prisma enums
export const DonationTypeEnum = z.enum(['ONE_TIME', 'RECURRING', 'PLEDGE', 'IN_KIND'])

// Create donation schema
export const createDonationSchema = z.object({
  donorId: z.string().min(1, 'Donor is required'),
  campaignId: z.string().optional().or(z.literal('')),
  amount: z.coerce.number().positive('Amount must be positive'),
  date: z.coerce.date(),
  type: DonationTypeEnum.default('ONE_TIME'),
  method: z.string().max(50).optional().or(z.literal('')),
  notes: z.string().max(1000).optional().or(z.literal('')),
})

// Update donation schema - all optional
export const updateDonationSchema = createDonationSchema.partial()

// Query schema for list endpoints
export const donationListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  donorId: z.string().optional(),
  campaignId: z.string().optional(),
  type: DonationTypeEnum.optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  sortBy: z.enum(['date', 'amount', 'donor', 'campaign']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})
