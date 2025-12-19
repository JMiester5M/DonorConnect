// Business logic for donation operations
import { prisma } from '../db'
import { updateDonorMetrics } from './donors'

const sanitizeDonationInput = (input = {}) => {
  const allowed = ['donorId', 'campaignId', 'amount', 'date', 'type', 'method', 'notes']
  return allowed.reduce((acc, key) => {
    if (input[key] !== undefined) {
      const value = typeof input[key] === 'string' ? input[key].trim() : input[key]
      acc[key] = value === '' ? null : value
    }
    return acc
  }, {})
}

/**
 * Get a single donation by ID
 * @param {Object} params - Query parameters { id, organizationId }
 * @returns {Promise<Object|null>} Donation object or null
 */
export async function getDonation({ id, organizationId }) {
  if (!id || !organizationId) {
    throw new Error('id and organizationId are required')
  }

  const donation = await prisma.donation.findFirst({
    where: {
      id,
      donor: { organizationId }
    },
    include: {
      donor: true,
      campaign: true,
    },
  })

  return donation
}

/**
 * Get donations list with filtering and pagination
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} { data, pagination }
 */
export async function getDonations({
  organizationId,
  page = 1,
  limit = 50,
  search,
  donorId,
  campaignId,
  type,
  minAmount,
  maxAmount,
  startDate,
  endDate,
  sortBy = 'date',
  sortOrder = 'desc',
}) {
  if (!organizationId) {
    throw new Error('organizationId is required')
  }

  const where = {
    donor: { organizationId }
  }

  if (donorId) where.donorId = donorId
  if (campaignId) where.campaignId = campaignId
  if (type) where.type = type
  if (minAmount !== undefined || maxAmount !== undefined) {
    where.amount = {}
    if (minAmount !== undefined) where.amount.gte = minAmount
    if (maxAmount !== undefined) where.amount.lte = maxAmount
  }
  if (startDate !== undefined || endDate !== undefined) {
    where.date = {}
    if (startDate !== undefined) where.date.gte = startDate
    if (endDate !== undefined) where.date.lte = endDate
  }

  if (search) {
    where.OR = [
      { donor: { firstName: { contains: search, mode: 'insensitive' } } },
      { donor: { lastName: { contains: search, mode: 'insensitive' } } },
      { donor: { email: { contains: search, mode: 'insensitive' } } },
      { campaign: { name: { contains: search, mode: 'insensitive' } } },
    ]
  }

  const orderByMap = {
    date: { date: sortOrder },
    amount: { amount: sortOrder },
    donor: { donor: { firstName: sortOrder } },
    campaign: { campaign: { name: sortOrder } },
  }

  const [donations, total] = await Promise.all([
    prisma.donation.findMany({
      where,
      include: {
        donor: { select: { id: true, firstName: true, lastName: true, email: true } },
        campaign: { select: { id: true, name: true } },
      },
      orderBy: orderByMap[sortBy] || orderByMap.date,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.donation.count({ where }),
  ])

  return {
    data: donations,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

/**
 * Create a new donation
 * @param {Object} donationData - Donation data to create (must include donorId)
 * @returns {Promise<Object>} Created donation
 */
export async function createDonation(donationData) {
  if (!donationData.donorId) {
    throw new Error('donorId is required to create a donation')
  }

  const data = sanitizeDonationInput(donationData)
  const donation = await prisma.donation.create({
    data,
    include: {
      donor: true,
      campaign: true,
    },
  })

  // Update donor metrics after creating donation
  await updateDonorMetrics(donation.donorId)

  return donation
}

/**
 * Update an existing donation
 * @param {Object} params - Update parameters (id, organizationId, data)
 * @returns {Promise<Object|null>} Updated donation object or null if not found
 */
export async function updateDonation({ id, organizationId, data }) {
  if (!id || !organizationId) {
    throw new Error('id and organizationId are required to update a donation')
  }

  const existing = await prisma.donation.findFirst({
    where: { id, donor: { organizationId } },
    include: { donor: true }
  })
  if (!existing) return null

  const sanitized = sanitizeDonationInput(data)
  const updated = await prisma.donation.update({
    where: { id },
    data: sanitized,
    include: {
      donor: true,
      campaign: true,
    },
  })

  // Update donor metrics after updating donation
  await updateDonorMetrics(updated.donorId)
  
  // If donor changed, update old donor's metrics too
  if (existing.donorId !== updated.donorId) {
    await updateDonorMetrics(existing.donorId)
  }

  return updated
}

/**
 * Delete a donation
 * @param {Object} params - Delete parameters (id, organizationId)
 * @returns {Promise<boolean>} True if a donation was deleted
 */
export async function deleteDonation({ id, organizationId }) {
  if (!id || !organizationId) {
    throw new Error('id and organizationId are required to delete a donation')
  }

  const existing = await prisma.donation.findFirst({
    where: { id, donor: { organizationId } }
  })
  if (!existing) return false

  await prisma.donation.delete({ where: { id } })

  // Update donor metrics after deleting donation
  await updateDonorMetrics(existing.donorId)

  return true
}
