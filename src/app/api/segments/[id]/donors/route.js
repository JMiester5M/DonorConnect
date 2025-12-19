// Helper: build Prisma where clause from segment rules
// Supports both formats:
// 1) Seed-style single rule: { field, operator, value }
// 2) UI-style multi-key rules: { donorStatus?, retentionRisk?, giftCountRange?, totalGiftAmountRange?, lastGiftDateRange?, hasRecurring? }
function buildWhereClause(rules, organizationId) {
  const where = { organizationId }

  if (!rules || typeof rules !== 'object') return where

  // Seed-style single rule
  if (rules.field) {
    const { field, operator, value } = rules
    switch (field) {
      case 'totalGifts':
        if (operator === 'equals') where.totalGifts = value
        else if (operator === 'greaterThan') where.totalGifts = { gt: value }
        else if (operator === 'lessThan') where.totalGifts = { lt: value }
        else if (operator === 'greaterThanOrEqual') where.totalGifts = { gte: value }
        else if (operator === 'lessThanOrEqual') where.totalGifts = { lte: value }
        break
      case 'totalAmount':
        if (operator === 'equals') where.totalAmount = value
        else if (operator === 'greaterThan') where.totalAmount = { gt: value }
        else if (operator === 'lessThan') where.totalAmount = { lt: value }
        else if (operator === 'greaterThanOrEqual') where.totalAmount = { gte: value }
        else if (operator === 'lessThanOrEqual') where.totalAmount = { lte: value }
        break
      case 'status':
        if (operator === 'equals') where.status = value
        else if (operator === 'in' && Array.isArray(value)) where.status = { in: value }
        break
      case 'retentionRisk':
        if (operator === 'equals') where.retentionRisk = value
        else if (operator === 'in' && Array.isArray(value)) where.retentionRisk = { in: value }
        break
      case 'hasRecurring':
        if (operator === 'equals') {
          if (value === true) where.donations = { some: { type: 'RECURRING' } }
          else if (value === false) where.donations = { none: { type: 'RECURRING' } }
        }
        break
      default:
        break
    }
    return where
  }

  // UI-style multi-key rules
  if (rules.donorStatus && Array.isArray(rules.donorStatus) && rules.donorStatus.length > 0) {
    where.status = { in: rules.donorStatus }
  }

  if (rules.retentionRisk && Array.isArray(rules.retentionRisk) && rules.retentionRisk.length > 0) {
    where.retentionRisk = { in: rules.retentionRisk }
  }

  if (rules.giftCountRange && typeof rules.giftCountRange === 'object') {
    const { min, max } = rules.giftCountRange
    if (min !== undefined || max !== undefined) {
      where.totalGifts = {}
      if (min !== undefined && min !== null) where.totalGifts.gte = min
      if (max !== undefined && max !== null) where.totalGifts.lte = max
    }
  }

  if (rules.totalGiftAmountRange && typeof rules.totalGiftAmountRange === 'object') {
    const { min, max } = rules.totalGiftAmountRange
    if (min !== undefined || max !== undefined) {
      where.totalAmount = {}
      if (min !== undefined && min !== null) where.totalAmount.gte = min
      if (max !== undefined && max !== null) where.totalAmount.lte = max
    }
  }

  if (rules.lastGiftDateRange && typeof rules.lastGiftDateRange === 'object') {
    const { from, to } = rules.lastGiftDateRange
    if (from || to) {
      where.lastGiftDate = {}
      if (from) where.lastGiftDate.gte = new Date(from)
      if (to) where.lastGiftDate.lte = new Date(to)
    }
  }

  if (rules.hasRecurring !== undefined) {
    const val = rules.hasRecurring
    if (val === true) where.donations = { some: { type: 'RECURRING' } }
    else if (val === false) where.donations = { none: { type: 'RECURRING' } }
  }

  return where
}

// Segment Donors API - Get donors matching segment criteria
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function GET(request, context) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const organizationId = session.user.organization?.id
    if (!organizationId) return NextResponse.json({ error: 'Organization not found' }, { status: 400 })

    const p = await context.params
    const url = new URL(request.url)
    const idFromPath = url.pathname.split('/')[3]
    const id = p?.id ?? idFromPath
    console.log('DEBUG: Donors route id:', id)

    // Get the segment
    const segment = await prisma.segment.findUnique({
      where: { id },
    })

    if (!segment || segment.organizationId !== organizationId) {
      return NextResponse.json({ error: 'Segment not found' }, { status: 404 })
    }

    console.log('DEBUG: Segment rules:', JSON.stringify(segment.rules, null, 2))

    // Build where clause from rules
    const where = buildWhereClause(segment.rules, organizationId)
    console.log('DEBUG: Built where clause:', JSON.stringify(where, null, 2))

    // Fetch matching donors
    const donors = await prisma.donor.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        status: true,
        retentionRisk: true,
        totalGifts: true,
        totalAmount: true,
      },
      orderBy: { lastName: 'asc' },
      take: 1000,
    })

    console.log(`DEBUG: Found ${donors.length} donors matching segment rules`)

    return NextResponse.json({
      data: donors,
      count: donors.length,
    })
  } catch (error) {
    console.error('Segment Donors GET error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
