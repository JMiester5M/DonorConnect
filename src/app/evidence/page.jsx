import Link from 'next/link'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/session'
import PublicNav from '@/components/PublicNav'

export default async function EvidencePage() {
  // Role-based access control: Only instructors can view
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session')?.value
  const session = await getSession(sessionToken)
  if (!session || session.user.role !== 'INSTRUCTOR') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded shadow text-center">
          <h2 className="text-2xl font-bold text-red-700 mb-2">Access Denied</h2>
          <p className="text-gray-700">You do not have permission to view this page.</p>
          <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">Return Home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Shared Navigation Bar */}
      <PublicNav />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center py-10 px-4">
        <div className="w-full max-w-4xl space-y-10">
          {/* CCC.1.3 Evidence */}
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-blue-800 mb-3">CCC.1.3 Evidence</h2>
            <ul className="list-disc pl-6 text-gray-700 text-lg space-y-1">
              <li>Product planning docs <span className="text-gray-400">(placeholder)</span></li>
              <li>Feature mapping <span className="text-gray-400">(placeholder)</span></li>
              <li>User flows <span className="text-gray-400">(placeholder)</span></li>
              <li>Wireframes <span className="text-gray-400">(placeholder)</span></li>
            </ul>
          </section>

          {/* TS.6.2 Evidence */}
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-blue-800 mb-3">TS.6.2 Evidence</h2>
            <ul className="list-disc pl-6 text-gray-700 text-lg space-y-1">
              <li>AI feature implementation <span className="text-gray-400">(placeholder)</span></li>
              <li>API integration screenshots <span className="text-gray-400">(placeholder)</span></li>
              <li>Prompt design examples <span className="text-gray-400">(placeholder)</span></li>
            </ul>
          </section>

          {/* TS.6.3 Evidence */}
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-blue-800 mb-3">TS.6.3 Evidence</h2>
            <ul className="list-disc pl-6 text-gray-700 text-lg space-y-1">
              <li>AI policy <span className="text-gray-400">(placeholder)</span></li>
              <li>Safeguards <span className="text-gray-400">(placeholder)</span></li>
              <li>Ethical design decisions <span className="text-gray-400">(placeholder)</span></li>
            </ul>
          </section>

          {/* Direct Links Section */}
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-blue-800 mb-3">Direct Links</h2>
            <ul className="list-disc pl-6 text-blue-700 text-lg space-y-1">
              <li><a href="https://github.com/JMiester5M/DonorConnect" target="_blank" rel="noopener noreferrer" className="hover:underline">GitHub Repository</a></li>
              <li><a href="https://donor-connect-henna.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:underline">Vercel Deployment</a></li>
              <li><a href="https://trello.com/invite/b/68e5376b9174a0e5333ed2af/ATTIb33708449746b3adbe0526fa89f463c31717786A/donorconnect-crm" target="_blank" rel="noopener noreferrer" className="hover:underline">Trello Board</a></li>
              <li className="flex items-center gap-2">
                  <span className="text-blue-700 select-none cursor-default">Wireframe</span>
                  <a
                    href="/Lab 3 Wireframe(v3)png.png"
                    download
                    className="ml-2 px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-semibold hover:bg-blue-200 transition border border-blue-200"
                    title="Download wireframe PNG"
                  >
                    Download
                  </a>
              </li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  )
}
