'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SegmentForm } from '@/components/segments/segment-form'

export default function SegmentDetailPage({ params }) {
  const router = useRouter()
  const [id, setId] = useState(null)
  const [segment, setSegment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)

  const fetchSegment = async () => {
    if (!id) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/segments/${id}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load segment')
      setSegment(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
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
          <Button variant="outline" onClick={() => setEditing((v) => !v)}>
            {editing ? 'Close Editor' : 'Edit'}
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
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
          {rules.tags && renderRule('Tags', rules.tags.join(', '))}
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

      {editing && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Segment</CardTitle>
          </CardHeader>
          <CardContent>
            <SegmentForm segment={segment} onSubmit={handleUpdate} onCancel={() => setEditing(false)} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}