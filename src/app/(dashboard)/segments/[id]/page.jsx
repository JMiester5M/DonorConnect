'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { SegmentForm } from '@/components/segments/segment-form'

export default function SegmentDetailPage({ params }) {
  const router = useRouter()
  const [id, setId] = useState(null)
  const [segment, setSegment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [donors, setDonors] = useState([])
  const [loadingDonors, setLoadingDonors] = useState(false)

  const fetchSegment = async () => {
    if (!id) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/segments/${id}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load segment')
      setSegment(data)
      
      // Fetch donors matching this segment's rules
      setLoadingDonors(true)
      const donorRes = await fetch(`/api/segments/${id}/donors`)
      const donorData = await donorRes.json()
      if (donorRes.ok) {
        setDonors(donorData.data || [])
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setLoadingDonors(false)
    }
  }

  useEffect(() => {
    async function loadParams() {
      const resolvedParams = await params
      if (!resolvedParams?.id) {
        router.push('/segments')
      } else {
        setId(resolvedParams.id)
      }
    }
    loadParams()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (id) fetchSegment()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleUpdate = async (payload) => {
    const res = await fetch(`/api/segments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to update segment')
    await fetchSegment()
    setEditing(false)
  }

  const handleDelete = async () => {
    const res = await fetch(`/api/segments/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Failed to delete segment')
    }
    router.push('/segments')
  }

  if (loading) return <p>Loading...</p>
  if (error) return <p className="text-destructive">{error}</p>
  if (!segment) return <p>Segment not found</p>

  const rules = segment.rules || {}

  const renderSingleRule = (rule) => {
    if (!rule || !rule.field) return null
    const { field, operator, value } = rule
    let label = field
    let display = ''
    switch (field) {
      case 'status':
        label = 'Donor Status'
        display = operator === 'in' && Array.isArray(value) ? value.join(', ') : String(value)
        break
      case 'retentionRisk':
        label = 'Retention Risk'
        display = operator === 'in' && Array.isArray(value) ? value.join(', ') : String(value)
        break
      case 'totalGifts':
        label = 'Gift Count'
        display = `${operator} ${value}`
        break
      case 'totalAmount':
        label = 'Total Amount'
        display = `${operator} ${value}`
        break
      case 'hasRecurring':
        label = 'Has Recurring'
        display = value === true ? 'Yes' : value === false ? 'No' : String(value)
        break
      default:
        display = `${operator} ${Array.isArray(value) ? value.join(', ') : String(value)}`
    }
    return renderRule(label, display)
  }

  const renderRule = (label, value) => (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{segment.name}</h1>
          <p className="text-sm text-muted-foreground">{segment.description || 'No description provided.'}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setEditing((v) => !v)}>
            <Edit2 className="h-4 w-4 mr-2" />
            {editing ? 'Close' : 'Edit'}
          </Button>
          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => setDeleteConfirm(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Object.keys(rules).length === 0 && <p className="text-sm text-muted-foreground">No rules defined.</p>}
          {/* Seed-style single rule */}
          {rules.field && renderSingleRule(rules)}
          {/* UI-style multi-key rules */}
          {!rules.field && (
            <>
              {rules.donorStatus && renderRule('Donor Status', rules.donorStatus.join(', '))}
              {rules.retentionRisk && renderRule('Retention Risk', rules.retentionRisk.join(', '))}
              {rules.lastGiftDateRange &&
                renderRule(
                  'Last Gift Range',
                  `${rules.lastGiftDateRange.from || 'Any'} → ${rules.lastGiftDateRange.to || 'Any'}`
                )}
              {rules.totalGiftAmountRange &&
                renderRule(
                  'Total Amount',
                  `${rules.totalGiftAmountRange.min ?? '0'} → ${rules.totalGiftAmountRange.max ?? '∞'}`
                )}
              {rules.giftCountRange && renderRule('Gift Count', `${rules.giftCountRange.min ?? '0'} → ${rules.giftCountRange.max ?? '∞'}`)}
              {rules.hasRecurring !== undefined && renderRule('Has Recurring', rules.hasRecurring ? 'Yes' : 'No')}
              {rules.tags && renderRule('Tags', rules.tags.join(', '))}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-muted-foreground">
          <div>Members: {segment.memberCount ?? 0}</div>
          <div>Last Calculated: {segment.lastCalculated ? new Date(segment.lastCalculated).toLocaleString() : 'Not calculated'}</div>
          <div>Updated: {segment.updatedAt ? new Date(segment.updatedAt).toLocaleString() : '—'}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Matching Donors ({donors.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingDonors ? (
            <p className="text-sm text-muted-foreground">Loading donors...</p>
          ) : donors.length === 0 ? (
            <p className="text-sm text-muted-foreground">No donors match this segment's criteria.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total Gifts</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {donors.map((donor) => (
                  <TableRow 
                    key={donor.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => router.push(`/donors/${donor.id}`)}
                  >
                    <TableCell className="font-medium">{donor.firstName} {donor.lastName}</TableCell>
                    <TableCell>{donor.email}</TableCell>
                    <TableCell>{donor.status}</TableCell>
                    <TableCell>{donor.totalGifts ?? 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" onClose={() => setEditing(false)}>
          <DialogHeader>
            <DialogTitle>Edit Segment</DialogTitle>
          </DialogHeader>
          <SegmentForm segment={segment} onSubmit={handleUpdate} onCancel={() => setEditing(false)} />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirm}
        title="Delete Segment"
        description={`Are you sure you want to delete "${segment?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(false)}
      />
    </div>
  )
}