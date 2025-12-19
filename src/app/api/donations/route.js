// Donations API - List and Create
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getDonations, createDonation } from '@/lib/api/donations'
import { createDonationSchema, donationListQuerySchema } from '@/lib/validation/donation-schema'

export async function GET(request) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const organizationId = session.user.organizationId || session.user.organization?.id
    if (!organizationId) return NextResponse.json({ error: 'Organization not found' }, { status: 400 })

    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    console.log('Query params received:', queryParams)
    const parsed = donationListQuerySchema.safeParse(queryParams)
    console.log('Validation result:', parsed)

    if (!parsed.success) {
      const message = parsed.error.errors?.[0]?.message || 'Invalid query parameters'
      console.error('Validation error details:', parsed.error.errors)
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const result = await getDonations({ organizationId, ...parsed.data })
    return NextResponse.json(result)
  } catch (error) {
    console.error('Donations GET error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
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

    const parsed = createDonationSchema.safeParse(body)
    if (!parsed.success) {
      const message = parsed.error.errors?.[0]?.message || 'Invalid payload'
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const donation = await createDonation(parsed.data)
    return NextResponse.json(donation, { status: 201 })
  } catch (error) {
    console.error('Donation POST error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
