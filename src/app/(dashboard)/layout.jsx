// Dashboard layout - Protected area
import { getSessionUser } from '@/lib/session'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LogoutButton } from '@/components/logout-button'
import { Home, Users, Gift, TrendingUp, CheckSquare, FolderTree, Workflow } from 'lucide-react'

function getNavigation(user) {
  if (user.role === 'DONOR') {
    return [
      { name: 'My Profile', href: `/profile`, icon: Users },
      { name: 'Campaigns', href: '/donorcampaigns', icon: TrendingUp },
    ]
  }
  return [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Donors', href: '/donors', icon: Users },
    { name: 'Donations', href: '/donations', icon: Gift },
    { name: 'Campaigns', href: '/campaigns', icon: TrendingUp },
    { name: 'Segments', href: '/segments', icon: FolderTree },
    { name: 'Workflows', href: '/workflows', icon: Workflow },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  ]
}

export default async function DashboardLayout({ children }) {
  // Get session user and redirect if not authenticated
  const user = await getSessionUser()
  if (!user) {
    redirect('/login')
  }
  const navigation = getNavigation(user)
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation header */}
      <nav className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and main nav */}
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold text-gray-900">DonorConnect</h1>
              <div className="hidden md:flex gap-1">
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* User info and logout */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500">{user.organization?.name || 'Organization'}</p>
              </div>
              <LogoutButton />
            </div>
          </div>

          {/* Mobile navigation */}
          <div className="md:hidden flex gap-1 pb-2 overflow-x-auto">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors whitespace-nowrap"
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main content area */}
      <main className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}