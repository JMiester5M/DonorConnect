// Segments API - List and Create
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { createSegmentSchema, segmentListQuerySchema } from '@/lib/validation/segment-schema'

export async function GET(request) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const organizationId = session.user.organizationId || session.user.organization?.id
    if (!organizationId) return NextResponse.json({ error: 'Organization not found' }, { status: 400 })

    const parsed = segmentListQuerySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams))
    if (!parsed.success) {
      const message = parsed.error.errors?.[0]?.message || 'Invalid query'
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const { page, limit, search } = parsed.data
    const where = {
      organizationId,
      ...(search
        ? {
            name: { contains: search, mode: 'insensitive' },
          }
        : {}),
    }

    const [total, segments] = await Promise.all([
      prisma.segment.count({ where }),
      prisma.segment.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          description: true,
          memberCount: true,
          lastCalculated: true,
          updatedAt: true,
          rules: true,
        },
      }),
    ])

    const totalPages = Math.max(1, Math.ceil(total / limit))

    return NextResponse.json({
      data: segments,
      pagination: { page, limit, total, totalPages },
    })
  } catch (error) {
    console.error('Segments GET error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!['ADMIN', 'STAFF'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const organizationId = session.user.organizationId || session.user.organization?.id
    if (!organizationId) return NextResponse.json({ error: 'Organization not found' }, { status: 400 })

    let body
    try {
      body = await request.json()
    } catch (err) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const parsed = createSegmentSchema.safeParse(body)
    if (!parsed.success) {
      const message = parsed.error.errors?.[0]?.message || 'Invalid payload'
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const created = await prisma.segment.create({
      data: {
        organizationId,
        name: parsed.data.name,
        description: parsed.data.description || null,
        rules: parsed.data.rules || {},
      },
    })

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error('Segments POST error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}