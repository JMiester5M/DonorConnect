// Business logic for donor operations
import { prisma } from '../db'
import { hashPassword } from '../password'

const msPerDay = 1000 * 60 * 60 * 24

const sanitizeDonorInput = (input = {}, isUpdate = false) => {
  const allowed = isUpdate 
    ? ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode', 'status', 'donorPassword']
    : ['organizationId', 'firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode', 'status', 'retentionRisk', 'donorPassword']
  return allowed.reduce((acc, key) => {
    if (input[key] !== undefined) {
      const value = typeof input[key] === 'string' ? input[key].trim() : input[key]
      acc[key] = value === '' ? null : value
    }
    return acc
  }, {})
}

const calculateRetentionRisk = (lastGiftDate, totalGifts) => {
  if (!totalGifts || !lastGiftDate) return 'UNKNOWN'
  const daysSinceLast = (Date.now() - lastGiftDate.getTime()) / msPerDay
  if (daysSinceLast <= 90) return 'LOW'
  if (daysSinceLast <= 180) return 'MEDIUM'
  if (daysSinceLast <= 365) return 'HIGH'
  return 'CRITICAL'
}

const calculateDonorMetrics = async (donorId) => {
  const aggregates = await prisma.donation.aggregate({
    where: { donorId },
    _count: { _all: true },
    _sum: { amount: true },
    _min: { date: true },
    _max: { date: true },
  })

  const totalGifts = aggregates._count._all || 0
  const totalAmount = aggregates._sum.amount || 0
  const firstGiftDate = aggregates._min.date || null
  const lastGiftDate = aggregates._max.date || null
  const avgGift = totalGifts > 0 ? totalAmount / totalGifts : 0
  const retentionRisk = calculateRetentionRisk(lastGiftDate, totalGifts)

  return { totalGifts, totalAmount, firstGiftDate, lastGiftDate, avgGift, retentionRisk }
}

/**
 * Get a single donor by ID
 * @param {Object} params - Query parameters { id, organizationId }
 * @returns {Promise<Object|null>} Donor object or null
 */
export async function getDonor({ id, organizationId }) {
  if (!id) {
    throw new Error('id is required')
  }
  let where = { id }
  if (organizationId) where.organizationId = organizationId

  const donor = await prisma.donor.findFirst({
    where,
    include: {
      donations: { orderBy: { date: 'desc' } },
      interactions: { orderBy: { date: 'desc' } },
      tasks: { orderBy: { dueDate: 'asc' } },
    },
  })

  if (!donor) return null

  const metrics = await calculateDonorMetrics(donor.id)

  return { ...donor, interactions: donor.interactions ?? [], ...metrics }
}



/**
 * Create a new donor
 * @param {Object} donorData - Donor data to create (must include organizationId)
 * @returns {Promise<Object>} Created donor object
 */
export async function createDonor(donorData) {
  if (!donorData?.organizationId) {
    throw new Error('organizationId is required to create a donor')
  }

  let data = { ...donorData }
  let hashedPassword = null
  if (data.password) {
    hashedPassword = await hashPassword(data.password)
    data.donorPassword = hashedPassword
    delete data.password
    if (data.confirmPassword) delete data.confirmPassword
  }
  data = sanitizeDonorInput(data)
  const donor = await prisma.donor.create({ data })
  // Create corresponding user for donor login
  if (hashedPassword && donor.email) {
    await prisma.user.upsert({
      where: { email: donor.email },
      update: {
        password: hashedPassword,
        role: 'DONOR',
        organizationId: donor.organizationId,
        firstName: donor.firstName,
        lastName: donor.lastName,
      },
      create: {
        email: donor.email,
        password: hashedPassword,
        role: 'DONOR',
        organizationId: donor.organizationId,
        firstName: donor.firstName,
        lastName: donor.lastName,
      },
    })
  }
  const metrics = await updateDonorMetrics(donor.id)

  return { ...donor, ...metrics }
}



/**
 * Update an existing donor
 * @param {Object} params - Update parameters (id, organizationId, data)
 * @returns {Promise<Object|null>} Updated donor object or null if not found
 */
export async function updateDonor({ id, organizationId, data }) {
  if (!id || !organizationId) {
    throw new Error('id and organizationId are required to update a donor')
  }

  const existing = await prisma.donor.findFirst({ where: { id, organizationId } })
  if (!existing) return null

  let updateData = { ...data }
  if (updateData.password) {
    updateData.donorPassword = await hashPassword(updateData.password)
    delete updateData.password
    if (updateData.confirmPassword) delete updateData.confirmPassword
  }
  const sanitized = sanitizeDonorInput(updateData, true)
  const updatedDonor = await prisma.donor.update({ where: { id }, data: sanitized })
  const updatedMetrics = await updateDonorMetrics(id)

  return { ...updatedDonor, ...updatedMetrics }
}


/**
 * Delete a donor
 * @param {Object} params - Delete parameters (id, organizationId)
 * @returns {Promise<boolean>} True if a donor was deleted
 */
export async function deleteDonor({ id, organizationId }) {
  if (!id || !organizationId) {
    throw new Error('id and organizationId are required to delete a donor')
  }

  const result = await prisma.donor.deleteMany({ where: { id, organizationId } })
  return result.count > 0
}

/**
 * Update donor metrics after donation changes
 * @param {string} donorId - Donor ID to update metrics for
 * @returns {Promise<Object>} Updated donor with metrics and avgGift
 */
export async function updateDonorMetrics(donorId) {
  if (!donorId) {
    throw new Error('donorId is required to update metrics')
  }

  const metrics = await calculateDonorMetrics(donorId)

  const donor = await prisma.donor.update({
    where: { id: donorId },
    data: {
      totalGifts: metrics.totalGifts,
      totalAmount: metrics.totalAmount,
      firstGiftDate: metrics.firstGiftDate,
      lastGiftDate: metrics.lastGiftDate,
      retentionRisk: metrics.retentionRisk,
    },
  })

  return { ...donor, avgGift: metrics.avgGift }
}