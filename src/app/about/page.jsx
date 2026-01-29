
import PublicNav from '@/components/PublicNav'

export default function AboutProblem() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation Bar */}
      <PublicNav />

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center py-10 px-4">
        <div className="w-full max-w-3xl space-y-12">
          {/* 1. Problem Overview Section */}
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-blue-800 mb-4">Problem Overview</h2>
            <p className="text-gray-700 text-lg">
              Nonprofits often rely on spreadsheets, disconnected platforms, or manual tracking to manage donor information. This leads to lost data, poor communication, and weak donor relationships.
            </p>
          </section>

          {/* 2. Why This Problem Matters */}
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-blue-800 mb-4">Why This Problem Matters</h2>
            <ul className="list-disc pl-6 text-gray-700 text-lg space-y-1">
              <li>Lost donor trust</li>
              <li>Missed funding opportunities</li>
              <li>Inefficient operations</li>
              <li>Staff burnout</li>
              <li>Poor long-term sustainability</li>
            </ul>
          </section>

          {/* 3. Who Is Affected */}
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-blue-800 mb-4">Who Is Affected</h2>
            <ul className="list-disc pl-6 text-gray-700 text-lg space-y-1">
              <li>Nonprofit staff</li>
              <li>Volunteers</li>
              <li>Donors</li>
              <li>Communities served by nonprofits</li>
            </ul>
          </section>

          {/* 4. Consequences If Not Solved */}
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-blue-800 mb-4">Consequences If Not Solved</h2>
            <ul className="list-disc pl-6 text-gray-700 text-lg space-y-1">
              <li>Donor drop-off</li>
              <li>Reduced funding</li>
              <li>Disorganized outreach</li>
              <li>Poor decision-making</li>
              <li>Program instability</li>
            </ul>
          </section>

          {/* 5. What Makes DonorConnect Different */}
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-blue-800 mb-4">What Makes DonorConnect Different</h2>
            <p className="text-gray-700 text-lg">
              Unlike traditional CRMs that overwhelm users with complex dashboards and features, DonorConnect focuses on simplicity and AI-powered insights — helping nonprofits understand donor relationships instead of just storing donor data.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
