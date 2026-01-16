// Donors API - Individual Donor Operations
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getDonor, updateDonor, deleteDonor } from '@/lib/api/donors'
import { updateDonorSchema } from '@/lib/validation/donor-schema'

export async function GET(request, { params }) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const organizationId = session.user.organizationId || session.user.organization?.id
    if (!organizationId) return NextResponse.json({ error: 'Organization not found' }, { status: 400 })

    const donorId = (await params).id


    let donor = null
    if (session.user.role === 'DONOR') {
      const { prisma } = await import('@/lib/db')
      // Find donor record by email (should match user email)
      const userDonor = await prisma.donor.findUnique({ where: { email: session.user.email } })
      if (userDonor && userDonor.id === donorId) {
        const { getDonor } = await import('@/lib/api/donors')
        donor = await getDonor({ id: donorId })
      }
    } else {
      donor = await getDonor({ id: donorId, organizationId })
    }

    if (!donor) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Only include donorPassword for admins
    let result = { ...donor }
    if (session.user.role === 'ADMIN') {
      // Fetch donorPassword from the donor record
      const { prisma } = await import('@/lib/db')
      const donorRecord = await prisma.donor.findUnique({ where: { id: donorId } })
      if (donorRecord && donorRecord.donorPassword) {
        result.password = donorRecord.donorPassword
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Donor GET error:', error)
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

    const donorId = (await params).id

    let body
    try {
      body = await request.json()
    } catch (err) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const parsed = updateDonorSchema.safeParse(body)
    if (!parsed.success) {
      const message = parsed.error.errors?.[0]?.message || 'Invalid payload'
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const updated = await updateDonor({ id: donorId, organizationId, data: parsed.data })
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Donor PATCH error:', error)
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

    const donorId = (await params).id
    const deleted = await deleteDonor({ id: donorId, organizationId })
    if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Donor DELETE error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
