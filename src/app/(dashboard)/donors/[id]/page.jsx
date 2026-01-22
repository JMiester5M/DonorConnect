'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DonorForm } from '@/components/donors/donor-form'
import { useDonor } from '@/hooks/use-donors'
import { DonorStatusBadge } from '@/components/donors/donor-status-badge'
import { RetentionRiskBadge } from '@/components/donors/retention-risk-badge'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Edit2, Trash2 } from 'lucide-react'

// Donor detail page
export default function DonorDetailPage({ params }) {
  const [id, setId] = useState(null)
  const { donor, loading, error, refetch } = useDonor(id)
  // Debug: log donor object to verify field names and data
  useEffect(() => {
    if (donor) {
      console.log('Donor object:', donor)
    }
  }, [donor])
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [actionError, setActionError] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [donations, setDonations] = useState([])
  const [loadingDonations, setLoadingDonations] = useState(false)

  useEffect(() => {
    async function loadParams() {
      const resolvedParams = await params
      console.log('DonorDetailPage params:', resolvedParams)
      if (!resolvedParams?.id) {
        router.push('/donors')
      } else {
        setId(resolvedParams.id)
      }
    }
    loadParams()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fetch donations for this donor
  useEffect(() => {
    if (id) {
      setLoadingDonations(true)
      console.log('Fetching donations for donor:', id)
      fetch(`/api/donations?donorId=${id}&limit=100&sortBy=date&sortOrder=desc`)
        .then(res => {
          console.log('Response status:', res.status)
          return res.json()
        })
        .then(data => {
          console.log('Donations response:', data)
          if (data.error) {
            console.error('API Error:', data.error)
            setDonations([])
          } else {
            setDonations(data.data || [])
          }
        })
        .catch(err => {
          console.error('Failed to load donations:', err)
        })
        .finally(() => setLoadingDonations(false))
    }
  }, [id])

  const handleUpdate = async (payload) => {
    setActionError('')
    console.log('PATCH payload:', payload)
    try {
      const res = await fetch(`/api/donors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update donor')
      await refetch()
      setEditing(false)
    } catch (err) {
      setActionError(err.message)
      throw err
    }
  }

  const handleDelete = async () => {
    setActionError('')
    setDeleting(true)
    try {
      const res = await fetch(`/api/donors/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete donor')
      setShowDeleteConfirm(false)
      router.push('/donors')
    } catch (err) {
      setActionError(err.message)
    } finally {
      setDeleting(false)
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
  if (!donor) return <p>Donor not found</p>



  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">{donor.firstName} {donor.lastName}</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {donor.email && <span>{donor.email}</span>}
            {donor.phone && <span>• {donor.phone}</span>}
            <DonorStatusBadge status={donor.status} />
            <RetentionRiskBadge risk={donor.retentionRisk} />
          </div>

        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setEditing((v) => !v)}>
            <Edit2 className="h-4 w-4 mr-2" />
            {editing ? 'Close' : 'Edit'}
          </Button>
          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => setShowDeleteConfirm(true)} disabled={deleting}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {actionError && <p className="text-sm text-destructive">{actionError}</p>}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Donor"
        description={`Are you sure you want to delete ${donor.firstName} ${donor.lastName}? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <div className="grid gap-4 md:grid-cols-2">
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
  )
}
