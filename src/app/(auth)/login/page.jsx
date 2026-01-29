'use client'

import { Suspense } from 'react'
import { LoginForm } from './login-form'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex flex-row relative">
      {/* Home button */}
      <div className="fixed top-4 left-4 z-20">
        <Link href="/" className="px-4 py-2 rounded bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200 transition">
          ← Home
        </Link>
      </div>
      {/* Left: Login Form */}
      <div className="flex-1 flex flex-col items-center pt-24 bg-white">
        <Suspense fallback={<div>Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}