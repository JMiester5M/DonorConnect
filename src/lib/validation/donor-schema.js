// Zod validation schemas for donor operations
import { z } from 'zod'

// Enumerations aligned to Prisma enums
export const DonorStatusEnum = z.enum(['ACTIVE', 'LAPSED', 'INACTIVE', 'DO_NOT_CONTACT'])
export const RetentionRiskEnum = z.enum(['UNKNOWN', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])

// Create donor schema
export const createDonorSchema = z
	.object({
		firstName: z.string().min(1, 'First name is required').max(50),
		lastName: z.string().min(1, 'Last name is required').max(50),
		email: z.string().email('Invalid email').optional().or(z.literal('')),
		phone: z.string().max(20).optional().or(z.literal('')),
		address: z.string().max(200).optional().or(z.literal('')),
		city: z.string().max(100).optional().or(z.literal('')),
		state: z.string().max(50).optional().or(z.literal('')),
		zipCode: z.string().max(20).optional().or(z.literal('')),
		status: DonorStatusEnum.default('ACTIVE'),
		retentionRisk: RetentionRiskEnum.default('UNKNOWN'),
		password: z.string().min(1, 'Password is required'),
		confirmPassword: z.string().min(1, 'Confirm password is required'),
	})
	.refine((data) => {
		// Only check if password is set (for add or admin edit)
		if (data.password || data.confirmPassword) {
			return data.password === data.confirmPassword
		}
		return true
	}, {
		message: 'Passwords do not match',
		path: ['confirmPassword'],
	})

// Update donor schema - all optional
export const updateDonorSchema = createDonorSchema.partial()

// Query schema for list endpoints
export const donorListQuerySchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),
	search: z.string().optional(),
	status: DonorStatusEnum.optional(),
	retentionRisk: RetentionRiskEnum.optional(),
	sortBy: z.enum(['firstName', 'lastName', 'email', 'totalGifts', 'totalAmount', 'lastGiftDate']).default('firstName'),
	sortOrder: z.enum(['asc', 'desc']).default('asc'),
})