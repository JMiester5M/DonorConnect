// Zod validation schemas for segment operations
import { z } from 'zod'
import { DonorStatusEnum, RetentionRiskEnum } from './donor-schema'

const numberRangeSchema = z
	.object({
		min: z.coerce.number().nonnegative().optional(),
		max: z.coerce.number().nonnegative().optional(),
	})
	.refine((val) => (val.min !== undefined && val.max !== undefined ? val.min <= val.max : true), {
		message: 'Min cannot exceed max',
	})

const dateRangeSchema = z
	.object({
		from: z.string().optional(),
		to: z.string().optional(),
	})
	.refine((val) => {
		if (!val.from || !val.to) return true
		return new Date(val.from) <= new Date(val.to)
	}, { message: 'Start date cannot be after end date' })

const rulesSchema = z.object({
	donorStatus: z.array(DonorStatusEnum).optional(),
	retentionRisk: z.array(RetentionRiskEnum).optional(),
	lastGiftDateRange: dateRangeSchema.optional(),
	totalGiftAmountRange: numberRangeSchema.optional(),
	giftCountRange: numberRangeSchema.optional(),
	tags: z.array(z.string().trim().min(1)).optional(),
})

export const createSegmentSchema = z.object({
	name: z.string().min(1, 'Name is required').max(120),
	description: z.string().max(500).optional().or(z.literal('')),
	rules: rulesSchema.optional(),
})

export const updateSegmentSchema = createSegmentSchema.partial()

export const segmentListQuerySchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(50),
	search: z.string().optional(),
})