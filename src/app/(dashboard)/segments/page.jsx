'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { SegmentForm } from '@/components/segments/segment-form'
import { useSegments } from '@/hooks/use-segments'

export default function SegmentsPage() {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const { segments, loading, error, page, setPage, pagination, setFilters, refetch } = useSegments(1, 20, {})

  const onSearch = (value) => {
    setSearch(value)
    setFilters({ search: value })
    setPage(1)
  }

  const handleSave = async (payload) => {
    const res = await fetch('/api/segments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Failed to save segment')
    }
    await refetch()
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Donor Segments</h1>
          <p className="text-sm text-muted-foreground">Create and manage dynamic segments for outreach.</p>
        </div>
        <Button onClick={() => setShowForm(true)}>New Segment</Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          className="max-w-md"
          placeholder="Search segments..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
        <p className="text-sm text-muted-foreground">
          Page {pagination.page ?? page} of {pagination.totalPages || 1} • {pagination.total || 0} total
        </p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={4}>Loading...</TableCell>
              </TableRow>
            )}
            {!loading && segments.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>No segments found.</TableCell>
              </TableRow>
            )}
            {segments.map((segment) => (
              <TableRow 
                key={segment.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => router.push(`/segments/${segment.id}`)}
              >
                <TableCell className="font-medium">{segment.name}</TableCell>
                <TableCell className="max-w-xl truncate text-muted-foreground">{segment.description || '—'}</TableCell>
                <TableCell>{segment.memberCount ?? 0}</TableCell>
                <TableCell>{segment.updatedAt ? new Date(segment.updatedAt).toLocaleDateString() : '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="outline" disabled={page <= 1 || loading} onClick={() => setPage(page - 1)}>
          Previous
        </Button>
        <Button
          variant="outline"
          disabled={loading || page >= (pagination.totalPages || 1)}
          onClick={() => setPage(page + 1)}
        >
          Next
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" onClose={() => setShowForm(false)}>
          <DialogHeader>
            <DialogTitle>Create Segment</DialogTitle>
          </DialogHeader>
          <SegmentForm onSubmit={handleSave} onCancel={() => setShowForm(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}