// Home page - Redirects to dashboard or login

import PublicNav from '@/components/PublicNav'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navigation Bar */}
      <PublicNav />

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-center text-center px-4 py-16 md:py-32">
        <h1 className="text-4xl md:text-6xl font-extrabold text-blue-800 mb-6">DonorConnect</h1>
        <p className="text-lg md:text-2xl text-gray-700 mb-4 max-w-2xl">
          Nonprofits struggle to manage donor relationships using scattered tools, spreadsheets, and outdated systems.
        </p>
        <p className="text-lg md:text-2xl text-gray-700 mb-8 max-w-2xl">
          DonorConnect is a simple, AI-powered CRM that helps nonprofits organize donors, understand relationships, and grow sustainable support.
        </p>
        <Link href="/login">
          <span className="inline-block px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded shadow hover:bg-blue-700 transition">
            Start Using DonorConnect
          </span>
        </Link>
      </main>
    </div>
  )
}
