// Home page - Redirects to dashboard or login
import { getSessionUser } from '@/lib/session'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  // Get current user session and redirect based on authentication status
  console.log('Welcome to Business Case 2!')

  const user = await getSessionUser()

  if (user) {
    redirect('/dashboard')
  } else {
    redirect('/login')
  }
}
