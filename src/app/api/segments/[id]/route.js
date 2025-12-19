// Segments API - Individual Operations
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { updateSegmentSchema } from '@/lib/validation/segment-schema'

// Helper: build Prisma where clause from segment rules (supports seed + UI formats)
function buildWhereClause(rules, organizationId) {
  const where = { organizationId }
  if (!rules || typeof rules !== 'object') return where
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
    }
    return where
  }
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

export async function GET(request, { params }) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const organizationId = session.user.organization?.id
    if (!organizationId) return NextResponse.json({ error: 'Organization not found' }, { status: 400 })

    const id = (await params).id
    const segment = await prisma.segment.findFirst({
      where: { id, organizationId },
      select: {
        id: true,
        name: true,
        description: true,
        rules: true,
        memberCount: true,
        lastCalculated: true,
        updatedAt: true,
      },
    })

    if (!segment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Recalculate memberCount dynamically and update lastCalculated
    const whereClause = buildWhereClause(segment.rules, organizationId)
    const count = await prisma.donor.count({ where: whereClause })
    const updated = await prisma.segment.update({
      where: { id },
      data: {
        memberCount: count,
        lastCalculated: new Date(),
      },
    })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Segment GET error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!['ADMIN', 'STAFF'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const organizationId = session.user.organization?.id
    if (!organizationId) return NextResponse.json({ error: 'Organization not found' }, { status: 400 })

    const id = (await params).id

    let body
    try {
      body = await request.json()
    } catch (err) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const parsed = updateSegmentSchema.safeParse(body)
    if (!parsed.success) {
      const message = parsed.error.errors?.[0]?.message || 'Invalid payload'
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const updated = await prisma.segment.updateMany({
      where: { id, organizationId },
      data: {
        name: parsed.data.name,
        description: parsed.data.description || null,
        rules: parsed.data.rules || {},
      },
    })

    if (updated.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const refreshed = await prisma.segment.findFirst({ where: { id, organizationId } })
    return NextResponse.json(refreshed)
  } catch (error) {
    console.error('Segment PATCH error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const organizationId = session.user.organization?.id
    if (!organizationId) return NextResponse.json({ error: 'Organization not found' }, { status: 400 })

    const id = (await params).id
    const deleted = await prisma.segment.deleteMany({ where: { id, organizationId } })
    if (deleted.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Segment DELETE error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}