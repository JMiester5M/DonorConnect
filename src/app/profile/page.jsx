// Profile page: identical to donor detail page, but for the logged-in donor
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DonorForm } from '@/components/donors/donor-form'
import { DonorStatusBadge } from '@/components/donors/donor-status-badge'
import { RetentionRiskBadge } from '@/components/donors/retention-risk-badge'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Edit2, Home, Users, Gift, TrendingUp, CheckSquare, FolderTree, Workflow } from 'lucide-react'
import Link from 'next/link'
import { LogoutButton } from '@/components/logout-button'

function getNavigation(user) {
  // For donors, only show profile and campaigns
  return [
    { name: 'My Profile', href: `/profile`, icon: Users },
    { name: 'Campaigns', href: '/donorcampaigns', icon: TrendingUp },
  ]
}
export default function ProfilePage() {
  const [donor, setDonor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [actionError, setActionError] = useState('')
  const [donations, setDonations] = useState([])
  const [loadingDonations, setLoadingDonations] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true)
      setError('')
      try {
        const res = await fetch('/api/profile')
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load profile')
        setDonor(data)
      } catch (err) {
        setError(err.message)
        setDonor(null)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  useEffect(() => {
    if (donor?.id) {
      setLoadingDonations(true)
      fetch(`/api/donations?donorId=${donor.id}&limit=100&sortBy=date&sortOrder=desc`)
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            setDonations([])
          } else {
            setDonations(data.data || [])
          }
        })
        .catch(() => {})
        .finally(() => setLoadingDonations(false))
    }
  }, [donor?.id])

  const handleUpdate = async (payload) => {
    setActionError('')
    try {
      const res = await fetch(`/api/donors/${donor.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update donor')
      setDonor(data)
      setEditing(false)
    } catch (err) {
      setActionError(err.message)
      throw err
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const formatDonationType = (type) => {
    return type?.replace(/_/g, ' ').split(' ').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')
  }

  if (loading) return <p>Loading...</p>
  if (error) return <p className="text-destructive">{error}</p>
  if (!donor) return <p>Profile not found</p>

  // Admin-only password display component (copied from donorid page)
  function AdminDonorPassword({ password }) {
    if (!password) return null
    return (
      <div className="mt-1 text-xs text-muted-foreground">
        <span className="font-semibold">password:</span> {password}
      </div>
    )
  }

  return (
    <>
      {/* Navigation header (admin style, donor links only) */}
      <nav className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and main nav */}
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold text-gray-900">DonorConnect</h1>
              <div className="hidden md:flex gap-1">
                {getNavigation(donor).map((item) => {
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
                  {donor.firstName} {donor.lastName}
                </p>
                <p className="text-xs text-gray-500">{donor.organization?.name || 'Organization'}</p>
              </div>
              <LogoutButton />
            </div>
          </div>
          {/* Mobile navigation */}
          <div className="md:hidden flex gap-1 pb-2 overflow-x-auto">
            {getNavigation(donor).map((item) => {
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
      <div className="max-w-6xl mx-auto">
      <div className="mt-12 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold leading-tight">{donor.firstName} {donor.lastName}</h1>
            <div className="flex flex-wrap items-center gap-2 text-base text-muted-foreground">
              {donor.email && <span>{donor.email}</span>}
              {donor.phone && <span>• {donor.phone}</span>}
              <DonorStatusBadge status={donor.status} />
              <RetentionRiskBadge risk={donor.retentionRisk} />
            </div>
            {/* Admin-only: Show donor user password */}
            <AdminDonorPassword password={donor.password} />
          </div>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <Button variant="ghost" size="sm" className="text-base" onClick={() => setEditing((v) => !v)}>
              <Edit2 className="h-5 w-5 mr-2" />
              {editing ? 'Close' : 'Edit'}
            </Button>
          </div>
        </div>
      </div>


      {actionError && <p className="text-sm text-destructive mt-2 mb-2">{actionError}</p>}

      <div className="grid gap-8 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Giving Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            <div>Total Gifts: {donor.totalGifts ?? 0}</div>
            <div>Total Amount: ${Number(donor.totalAmount ?? 0).toFixed(2)}</div>
            <div>Average Gift: ${Number(donor.avgGift ?? 0).toFixed(2)}</div>
            <div>Last Gift: {donor.lastGiftDate ? new Date(donor.lastGiftDate).toLocaleDateString() : '—'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            <div>Email: {donor.email || '—'}</div>
            <div>Phone: {donor.phone || '—'}</div>
            <div>Address: {donor.address || '—'}</div>
            <div>City/State: {donor.city || '—'}{donor.state ? `, ${donor.state}` : ''}</div>
            <div>ZIP: {donor.zipCode || '—'}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="donations" className="w-full">
        <TabsList>
          <TabsTrigger value="donations">Donations</TabsTrigger>
          <TabsTrigger value="interactions">Interactions</TabsTrigger>
        </TabsList>
        <TabsContent value="donations">
          <Card>
            <CardHeader>
              <CardTitle>Donation History</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingDonations && <p className="text-sm text-muted-foreground">Loading donations...</p>}
              {!loadingDonations && donations.length === 0 && <p className="text-sm text-muted-foreground">No donations found.</p>}
              {!loadingDonations && donations.length > 0 && (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Campaign</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {donations.map((donation) => (
                        <TableRow key={donation.id}>
                          <TableCell>{formatDate(donation.date)}</TableCell>
                          <TableCell className="font-medium">{formatCurrency(donation.amount)}</TableCell>
                          <TableCell>{formatDonationType(donation.type)}</TableCell>
                          <TableCell>{donation.campaign?.name || '—'}</TableCell>
                          <TableCell>{donation.method || '—'}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{donation.notes ? donation.notes.substring(0, 30) + '...' : '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="interactions">
          <Card>
            <CardHeader>
              <CardTitle>Interactions</CardTitle>
            </CardHeader>
            <CardContent>
              {donor.interactions && donor.interactions.length > 0 ? (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead>Created By</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {donor.interactions.map((interaction) => (
                        <TableRow key={interaction.id}>
                          <TableCell>{formatDate(interaction.date)}</TableCell>
                          <TableCell>{interaction.type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</TableCell>
                          <TableCell>{interaction.subject || '—'}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{interaction.notes ? interaction.notes.substring(0, 40) + (interaction.notes.length > 40 ? '...' : '') : '—'}</TableCell>
                          <TableCell>{interaction.createdById || '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No interactions found.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" onClose={() => setEditing(false)}>
          <DialogHeader>
            <DialogTitle>Edit Donor</DialogTitle>
          </DialogHeader>
          <DonorForm donor={donor} onSubmit={handleUpdate} onCancel={() => setEditing(false)} />
        </DialogContent>
      </Dialog>

    </div>
    </>
  )
}
