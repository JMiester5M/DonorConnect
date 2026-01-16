import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'

// GET /api/donors/[id]/user-password
// Only for admins: returns the donor's plain password (for demo purposes only)
export async function GET(request, { params }) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const donorId = params.id
    if (!donorId) return NextResponse.json({ error: 'Missing donorId' }, { status: 400 })
    const donor = await prisma.donor.findUnique({ where: { id: donorId } })
    if (!donor || !donor.donorPassword) {
      return NextResponse.json({ error: 'Donor not found or missing password' }, { status: 404 })
    }
    // WARNING: Never expose plain passwords in production!
    return NextResponse.json({ password: donor.donorPassword })
  } catch (err) {
    console.error('GET /api/donors/[id]/user-password error:', err)
    return NextResponse.json({ error: 'Server error', details: err?.message || err }, { status: 500 })
  }
}
