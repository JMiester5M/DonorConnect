// Tasks API - Individual Operations
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { updateTaskSchema } from '@/lib/validation/task-schema'

export async function GET(request, context) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const p = await context.params
    const id = p?.id

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        donor: { select: { id: true, firstName: true, lastName: true, email: true } },
        assignedUser: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json(task)
  } catch (error) {
    console.error('Task GET error:', error)
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

    const p = await context.params
    const id = p?.id

    let body
    try {
      body = await request.json()
    } catch (err) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const parsed = updateTaskSchema.safeParse(body)
    if (!parsed.success) {
      const message = parsed.error.errors?.[0]?.message || 'Invalid payload'
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const updateData = {
      ...(parsed.data.title && { title: parsed.data.title }),
      ...(parsed.data.description !== undefined && { description: parsed.data.description }),
      ...(parsed.data.status && { status: parsed.data.status }),
      ...(parsed.data.priority && { priority: parsed.data.priority }),
      ...(parsed.data.dueDate !== undefined && { dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null }),
      ...(parsed.data.donorId !== undefined && { donorId: parsed.data.donorId }),
      ...(parsed.data.assignedTo !== undefined && { assignedTo: parsed.data.assignedTo }),
    }

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        donor: { select: { id: true, firstName: true, lastName: true, email: true } },
        assignedUser: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error('Task PATCH error:', error)
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

    const p = await context.params
    const id = p?.id

    const deleted = await prisma.task.delete({
      where: { id },
    })

    if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Task DELETE error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
