import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

export async function GET(request) {
  const sessionToken = request.cookies.get('session')?.value
  const session = await getSession(sessionToken)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // Only return minimal user info (role, id, email)
  const { id, email, role, organizationId } = session.user
  return NextResponse.json({ user: { id, email, role, organizationId } })
}
