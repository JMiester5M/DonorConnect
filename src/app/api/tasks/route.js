// Tasks API - List and Create
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { createTaskSchema, taskListQuerySchema } from '@/lib/validation/task-schema'

export async function GET(request) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const parsed = taskListQuerySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams))
    if (!parsed.success) {
      const message = parsed.error.errors?.[0]?.message || 'Invalid query'
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const { page, limit, search, status, priority } = parsed.data
    const where = {
      ...(search ? { title: { contains: search, mode: 'insensitive' } } : {}),
      ...(status ? { status } : {}),
      ...(priority ? { priority } : {}),
    }

    const [total, tasks] = await Promise.all([
      prisma.task.count({ where }),
      prisma.task.findMany({
        where,
        include: {
          donor: { select: { id: true, firstName: true, lastName: true, email: true } },
          assignedUser: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { dueDate: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ])

    const totalPages = Math.max(1, Math.ceil(total / limit))

    return NextResponse.json({
      data: tasks,
      pagination: { page, limit, total, totalPages },
    })
  } catch (error) {
    console.error('Tasks GET error:', error)
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

    let body
    try {
      body = await request.json()
    } catch (err) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const parsed = createTaskSchema.safeParse(body)
    if (!parsed.success) {
      const message = parsed.error.errors?.[0]?.message || 'Invalid payload'
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const task = await prisma.task.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description || null,
        status: parsed.data.status || 'TODO',
        priority: parsed.data.priority || 'MEDIUM',
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
        donorId: parsed.data.donorId || null,
        assignedTo: parsed.data.assignedTo || null,
      },
      include: {
        donor: { select: { id: true, firstName: true, lastName: true, email: true } },
        assignedUser: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Task POST error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
