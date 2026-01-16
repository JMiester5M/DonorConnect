import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/password'
import { getSession } from '@/lib/session'

// POST /api/users/donor
// Admins: Create or update a donor user account (set password)
export async function POST(request) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { donorId, password } = await request.json()
    if (!donorId || !password) {
      return NextResponse.json({ error: 'Missing donorId or password' }, { status: 400 })
    }
    // Find donor
    const donor = await prisma.donor.findUnique({ where: { id: donorId } })
    if (!donor || !donor.email) {
      return NextResponse.json({ error: 'Donor not found or missing email' }, { status: 404 })
    }
    // Upsert user with DONOR role
    const hashed = await hashPassword(password)
    const user = await prisma.user.upsert({
      where: { email: donor.email },
      update: {
        password: hashed,
        role: 'DONOR',
        organizationId: donor.organizationId,
        firstName: donor.firstName,
        lastName: donor.lastName,
      },
      create: {
        email: donor.email,
        password: hashed,
        role: 'DONOR',
        organizationId: donor.organizationId,
        firstName: donor.firstName,
        lastName: donor.lastName,
      },
    })
    return NextResponse.json({ user: { id: user.id, email: user.email, role: user.role } })
  } catch (err) {
    console.error('POST /api/users/donor error:', err)
    return NextResponse.json({ error: 'Server error', details: err?.message || err }, { status: 500 })
  }
}
