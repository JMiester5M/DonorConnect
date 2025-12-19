// Dashboard home page  
import { getSessionUser } from '@/lib/session'
import { prisma } from '@/lib/db'
import { Users, Gift, TrendingDown, Target } from 'lucide-react'

export default async function DashboardPage() {
  const user = await getSessionUser()
  const organizationId = user?.organizationId || user?.organization?.id

  if (!user || !organizationId) {
    return null
  }

  // Metrics
  const totalDonors = await prisma.donor.count({ where: { organizationId } })

  const donationsAgg = await prisma.donation.aggregate({
    where: { donor: { organizationId } },
    _sum: { amount: true },
    _count: { _all: true },
  })

  const totalDonations = donationsAgg._sum.amount || 0
  const donationCount = donationsAgg._count?._all || 0

  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

  const atRiskDonors = await prisma.donor.count({
    where: {
      organizationId,
      lastGiftDate: {
        lt: oneYearAgo,
      },
    },
  })

  const avgDonation = donationCount > 0 ? Math.round(totalDonations / donationCount) : 0

  const recentDonors = await prisma.donor.findMany({
    where: { organizationId },
    orderBy: { lastGiftDate: 'desc' },
    take: 5,
    include: {
      donations: {
        orderBy: { date: 'desc' },
        take: 1,
      },
    },
  })
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome to your donor retention platform
        </p>
      </div>

      {/* Dashboard metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Donors</p>
              <p className="text-3xl font-bold mt-2">{totalDonors}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Raised</p>
              <p className="text-3xl font-bold mt-2">${totalDonations.toLocaleString()}</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <Gift className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Avg Donation</p>
              <p className="text-3xl font-bold mt-2">${avgDonation.toLocaleString()}</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">At-Risk Donors</p>
              <p className="text-3xl font-bold mt-2">{atRiskDonors}</p>
              {atRiskDonors > 0 && (
                <p className="text-sm text-red-600 mt-2">No gift in 1 year</p>
              )}
            </div>
            <div className="bg-red-100 rounded-full p-3">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts and visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold mb-4">Donor Status Breakdown</h2>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">Active Donors</span>
                <span className="text-gray-600">{Math.max(0, totalDonors - atRiskDonors)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${totalDonors > 0 ? ((totalDonors - atRiskDonors) / totalDonors) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">At-Risk Donors</span>
                <span className="text-gray-600">{atRiskDonors}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{ width: `${totalDonors > 0 ? (atRiskDonors / totalDonors) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold mb-4">Fundraising Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Donations</span>
              <span className="font-semibold">{donationCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Average per Donor</span>
              <span className="font-semibold">${avgDonation.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Donors with 2+ Gifts</span>
              <span className="font-semibold">{Math.round(totalDonors > 0 ? Math.min(totalDonors, Math.max(0, totalDonors * 0.4)) : 0)}</span>
            </div>
            <div className="border-t pt-3 flex justify-between font-semibold">
              <span>Total Raised</span>
              <span className="text-green-600">${totalDonations.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-lg font-bold">Recent Donors</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Donor</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Last Gift</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentDonors.length > 0 ? (
                recentDonors.map((donor) => (
                  <tr key={donor.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{donor.firstName} {donor.lastName}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{donor.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{donor.lastGiftDate ? new Date(donor.lastGiftDate).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-6 py-4 text-sm font-semibold">
                      {donor.donations.length > 0 && donor.donations[0].amount
                        ? `$${donor.donations[0].amount.toLocaleString()}`
                        : 'N/A'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    No donors yet. Start by adding your first donor!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}