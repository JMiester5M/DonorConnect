// Segments API - Individual Operations
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { updateSegmentSchema } from '@/lib/validation/segment-schema'

export async function GET(request, { params }) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const organizationId = session.user.organizationId || session.user.organization?.id
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

    return NextResponse.json(segment)
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

    const organizationId = session.user.organizationId || session.user.organization?.id
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

    const organizationId = session.user.organizationId || session.user.organization?.id
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