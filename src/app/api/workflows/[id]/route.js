// Workflows API - Individual Operations
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { updateWorkflowSchema } from '@/lib/validation/workflow-schema'

export async function GET(request, context) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const organizationId = session.user.organization?.id
    if (!organizationId) return NextResponse.json({ error: 'Organization not found' }, { status: 400 })

    const p = await context.params
    const id = p?.id

    const workflow = await prisma.workflow.findFirst({
      where: { id, organizationId },
      include: {
        segment: { select: { id: true, name: true } },
        executions: { select: { id: true, status: true, completedAt: true, startedAt: true } },
      },
    })

    if (!workflow) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json(workflow)
  } catch (error) {
    console.error('Workflow GET error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(request, context) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!['ADMIN', 'STAFF'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const organizationId = session.user.organization?.id
    if (!organizationId) return NextResponse.json({ error: 'Organization not found' }, { status: 400 })

    const p = await context.params
    const id = p?.id

    let body
    try {
      body = await request.json()
    } catch (err) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const parsed = updateWorkflowSchema.safeParse(body)
    if (!parsed.success) {
      const message = parsed.error.errors?.[0]?.message || 'Invalid payload'
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const updated = await prisma.workflow.updateMany({
      where: { id, organizationId },
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        trigger: parsed.data.trigger,
        steps: parsed.data.steps,
        segmentId: parsed.data.segmentId,
        isActive: parsed.data.isActive,
      },
    })

    if (updated.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const refreshed = await prisma.workflow.findFirst({
      where: { id, organizationId },
      include: {
        segment: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(refreshed)
  } catch (error) {
    console.error('Workflow PATCH error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request, context) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const organizationId = session.user.organization?.id
    if (!organizationId) return NextResponse.json({ error: 'Organization not found' }, { status: 400 })

    const p = await context.params
    const id = p?.id

    const deleted = await prisma.workflow.deleteMany({ where: { id, organizationId } })
    if (deleted.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Workflow DELETE error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })  }
}