"use client"

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogoutButton } from '@/components/logout-button'

export default function PublicNavClient({ user }) {
  const router = useRouter()
  const handleAppNameClick = (e) => {
    e.preventDefault()
    if (user) {
      router.push('/dashboard')
    } else {
      router.push('/')
    }
  }
  return (
    <nav className="w-full bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <div className="flex items-center space-x-8">
          <button
            onClick={handleAppNameClick}
            className="text-xl font-bold text-blue-700 hover:underline bg-transparent border-none cursor-pointer p-0 m-0"
            style={{ background: 'none' }}
            aria-label="Go to app home or dashboard"
          >
            DonorConnect
          </button>
          <span className="hidden md:inline-block" style={{ width: '0.75rem' }} />
          <div className="hidden md:flex space-x-6">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <Link href="/about" className="hover:text-blue-600">About / Problem</Link>
            <Link href="/why-donorconnect" className="hover:text-blue-600">Why DonorConnect</Link>
            <Link href="/ai-policy" className="hover:text-blue-600">AI Policy & Safeguards</Link>
            {user?.role === 'INSTRUCTOR' && (
              <>
                <Link href="/reflection" className="hover:text-blue-600">Reflection</Link>
                <Link href="/evidence" className="hover:text-blue-600">Evidence</Link>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500">{user.organization?.name || 'Organization'}</p>
              </div>
              <LogoutButton />
            </div>
          ) : (
            <Link href="/login" className="ml-4 px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">Sign Up/Log in</Link>
          )}
        </div>
      </div>
    </nav>
  )
}