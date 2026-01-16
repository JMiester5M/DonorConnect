// API route to return the currently logged-in donor's profile
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { getDonor } from '@/lib/api/donors'

export async function GET(request) {
  const sessionToken = request.cookies.get('session')?.value
  const session = await getSession(sessionToken)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Only allow donor users
  if (session.user.role !== 'DONOR') {
    return NextResponse.json({ error: 'Not a donor user' }, { status: 403 })
  }


  // Find donor by user email (email is not unique, so use findFirst)
  const donor = await prisma.donor.findFirst({ where: { email: session.user.email } })
  if (!donor) return NextResponse.json({ error: 'Donor profile not found' }, { status: 404 })

  // Get donor with metrics and related info
  const fullDonor = await getDonor({ id: donor.id })
  if (!fullDonor) return NextResponse.json({ error: 'Donor profile not found' }, { status: 404 })

  return NextResponse.json(fullDonor)
}
