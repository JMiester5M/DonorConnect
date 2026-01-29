

import PublicNavClient from './PublicNavClient'

export default async function PublicNav() {
  // Server Component: cookies() and getSession are only valid here
  const { cookies } = await import('next/headers')
  const { getSession } = await import('@/lib/session')
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session')?.value
  const session = await getSession(sessionToken)
  const user = session?.user

  return <PublicNavClient user={user} />
}
