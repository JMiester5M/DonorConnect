
import PublicNav from '@/components/PublicNav'

export default function WhyDonorConnect() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation Bar */}
      <PublicNav />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center py-10 px-4">
        <div className="w-full max-w-4xl space-y-10">
          {/* 1. Solution Idea */}
          <section className="bg-white rounded-lg shadow p-6 mb-4">
            <h2 className="text-2xl font-bold text-blue-800 mb-3">Solution Idea</h2>
            <p className="text-gray-700 text-lg mb-2">
              DonorConnect centralizes donor data, tracks relationships, and uses AI to help nonprofits make smarter engagement decisions.
            </p>
            <p className="text-gray-700 text-lg">
              It exists to make donor management accessible to small and mid-sized nonprofits without enterprise-level budgets or technical staff.
            </p>
          </section>

          {/* 2. Key Features Section */}
          <section className="bg-white rounded-lg shadow p-6 mb-4">
            <h2 className="text-2xl font-bold text-blue-800 mb-3">Key Features</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <li className="bg-blue-50 rounded p-4 font-medium text-blue-900">Donor profiles</li>
              <li className="bg-blue-50 rounded p-4 font-medium text-blue-900">Donation tracking</li>
              <li className="bg-blue-50 rounded p-4 font-medium text-blue-900">Campaign Tracking</li>
              <li className="bg-blue-50 rounded p-4 font-medium text-blue-900">AI donor insights</li>
              <li className="bg-blue-50 rounded p-4 font-medium text-blue-900">Search and filtering</li>
            </ul>
          </section>

          {/* 3. Challenges + Planning */}
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-blue-800 mb-3">Challenges & Planning</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-100 rounded p-4">
                <h3 className="font-semibold text-blue-700 mb-1">Data organization complexity</h3>
                <p className="text-gray-700">→ simple data models</p>
              </div>
              <div className="bg-gray-100 rounded p-4">
                <h3 className="font-semibold text-blue-700 mb-1">User overwhelm</h3>
                <p className="text-gray-700">→ minimal UI</p>
              </div>
              <div className="bg-gray-100 rounded p-4">
                <h3 className="font-semibold text-blue-700 mb-1">AI trust issues</h3>
                <p className="text-gray-700">→ transparent AI safeguards</p>
              </div>
              <div className="bg-gray-100 rounded p-4">
                <h3 className="font-semibold text-blue-700 mb-1">Time constraints</h3>
                <p className="text-gray-700">→ MVP prioritization</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
