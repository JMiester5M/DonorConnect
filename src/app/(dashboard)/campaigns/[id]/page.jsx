'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CampaignForm } from '@/components/campaigns/campaign-form'
import { useCampaign } from '@/hooks/use-campaigns'
import { CampaignStatusBadge } from '@/components/campaigns/campaign-status-badge'
import { useToast } from '@/lib/toast'

export default function CampaignDetailPage({ params }) {
  const router = useRouter()
  const [id, setId] = useState(null)
  const { campaign, loading, error, refetch } = useCampaign(id)
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [actionError, setActionError] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    async function loadParams() {
      const resolvedParams = await params
      if (!resolvedParams?.id) {
        router.push('/campaigns')
      } else {
        setId(resolvedParams.id)
      }
    }
    loadParams()
  }, [params, router])

  const handleUpdate = async (payload) => {
    setActionError('')
    try {
      const res = await fetch(`/api/campaigns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update campaign')
      
      toast.success('Campaign updated successfully')
      await refetch()
      setEditing(false)
    } catch (err) {
      setActionError(err.message)
      toast.error(err.message)
      throw err
    }
  }

  const handleDelete = async () => {
    setActionError('')
    setDeleting(true)
    try {
      const res = await fetch(`/api/campaigns/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete campaign')
      
      toast.success('Campaign deleted successfully')
      router.push('/campaigns')
    } catch (err) {
      setActionError(err.message)
      toast.error(err.message)
    } finally {
      setDeleting(false)
    }
  }

  const formatCurrency = (amount) => {
    if (!amount) return '$0'
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  if (loading) return <div className="py-12 text-center">Loading campaign...</div>
  if (error) return <div className="py-12 text-center text-red-600">Error: {error}</div>
  if (!campaign) return <div className="py-12 text-center">Campaign not found</div>

  // Calculate total raised from donations
  const totalRaised = campaign.donations?.reduce((sum, d) => sum + d.amount, 0) || 0
  const goalProgress = campaign.goal ? (totalRaised / campaign.goal) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{campaign.name}</h1>
            <CampaignStatusBadge status={campaign.status} />
          </div>
          {campaign.type && <p className="text-gray-600">{campaign.type}</p>}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/campaigns')}>
            Back
          </Button>
          <Button onClick={() => setEditing(true)}>Edit</Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      {actionError && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {actionError}
        </div>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="donations">
            Donations ({campaign.donations?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">Goal Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(campaign.goal)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">Total Raised</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRaised)}</p>
                {campaign.goal && (
                  <p className="text-sm text-gray-600 mt-1">{goalProgress.toFixed(1)}% of goal</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">Donations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{campaign.donations?.length || 0}</p>
              </CardContent>
            </Card>
          </div>

          {/* Campaign Details */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {campaign.description && (
                <div>
                  <h3 className="font-semibold mb-1">Description</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{campaign.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-1">Start Date</h3>
                  <p className="text-gray-700">{formatDate(campaign.startDate)}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">End Date</h3>
                  <p className="text-gray-700">{formatDate(campaign.endDate)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-1">Created</h3>
                  <p className="text-gray-700">{formatDate(campaign.createdAt)}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Last Updated</h3>
                  <p className="text-gray-700">{formatDate(campaign.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="donations">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Donations</CardTitle>
            </CardHeader>
            <CardContent>
              {campaign.donations && campaign.donations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Donor ID</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaign.donations.map((donation) => (
                      <TableRow key={donation.id}>
                        <TableCell>{formatDate(donation.date)}</TableCell>
                        <TableCell>
                          <a 
                            href={`/donors/${donation.donorId}`}
                            className="text-blue-600 hover:underline"
                          >
                            {donation.donorId}
                          </a>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(donation.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-gray-500 py-8">No donations yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Campaign</DialogTitle>
          </DialogHeader>
          <CampaignForm campaign={campaign} onSubmit={handleUpdate} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
