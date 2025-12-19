// Campaign business logic layer
import { prisma } from '@/lib/db'

/**
 * Get campaigns for an organization with filtering and pagination
 */
export async function getCampaigns({ organizationId, search, status, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 50 }) {
  const skip = (page - 1) * limit

  // Build where clause
  const where = {
    organizationId,
    ...(status && { status }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    }),
  }

  // Map sortBy field to database field
  const orderByMap = {
    name: 'name',
    startDate: 'startDate',
    endDate: 'endDate',
    goal: 'goal',
    createdAt: 'createdAt',
  }

  const orderBy = { [orderByMap[sortBy] || 'createdAt']: sortOrder }

  // Query
  const [data, total] = await Promise.all([
    prisma.campaign.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.campaign.count({ where }),
  ])

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }
}

/**
 * Get a single campaign by ID
 */
export async function getCampaign(id, organizationId) {
  return prisma.campaign.findUnique({
    where: { id },
    include: {
      donations: {
        include: {
          donor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  }).then(campaign => {
    // Verify org ownership
    if (!campaign || campaign.organizationId !== organizationId) {
      return null
    }
    return campaign
  })
}

/**
 * Create a new campaign
 */
export async function createCampaign(organizationId, data) {
  return prisma.campaign.create({
    data: {
      organizationId,
      ...data,
    },
  })
}

/**
 * Update a campaign
 */
export async function updateCampaign(id, organizationId, data) {
  // Verify ownership first
  const existing = await prisma.campaign.findUnique({ where: { id } })
  if (!existing || existing.organizationId !== organizationId) {
    return null
  }

  return prisma.campaign.update({
    where: { id },
    data,
  })
}

/**
 * Delete a campaign
 */
export async function deleteCampaign(id, organizationId) {
  // Verify ownership first
  const existing = await prisma.campaign.findUnique({ where: { id } })
  if (!existing || existing.organizationId !== organizationId) {
    return null
  }

  return prisma.campaign.delete({
    where: { id },
  })
}
