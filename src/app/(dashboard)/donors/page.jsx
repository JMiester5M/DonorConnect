"use client"

// Donors list page
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { useDonors } from '@/hooks/use-donors'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DonorStatusBadge } from '@/components/donors/donor-status-badge'
import { RetentionRiskBadge } from '@/components/donors/retention-risk-badge'

export default function DonorsPage() {
  const router = useRouter()
  const { donors, loading, error, pagination, page, setPage, filters, setFilters } = useDonors(1, 10)
  const [search, setSearch] = useState(filters.search || '')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const handleDelete = async () => {
    if (!deleteConfirm) return
    try {
      const res = await fetch(`/api/donors/${deleteConfirm.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete donor')
      setDeleteConfirm(null)
      window.location.reload()
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    const handle = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search }))
      setPage(1)
    }, 300)
    return () => clearTimeout(handle)
  }, [search, setFilters, setPage])
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Donors</h1>
          <p className="text-gray-600 mt-2">
            Manage your donor relationships and track engagement
          </p>
        </div>
        <Link href="/donors/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Donor
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between" role="search">
        <div className="flex items-center gap-2 w-full md:w-80">
          <Input
            placeholder="Search donors by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="text-sm text-gray-600">
          {loading ? 'Loading donors...' : `${pagination.total ?? 0} donors`}
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Risk</TableHead>
              <TableHead>Gifts</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Last Gift</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6">
                  Loading donors...
                </TableCell>
              </TableRow>
            )}
            {!loading && donors.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6 text-gray-500">
                  No donors found. Try adjusting your search.
                </TableCell>
              </TableRow>
            )}
            {!loading && donors.map((donor) => (
              <TableRow key={donor.id}>
                <TableCell className="font-medium">
                  <Link href={`/donors/${donor.id}`} className="text-blue-600 hover:underline">
                    {donor.firstName} {donor.lastName}
                  </Link>
                </TableCell>
                <TableCell className="text-sm text-gray-600">{donor.email}</TableCell>
                <TableCell>
                  <DonorStatusBadge status={donor.status} />
                </TableCell>
                <TableCell>
                  <RetentionRiskBadge risk={donor.retentionRisk} />
                </TableCell>
                <TableCell>{donor.totalGifts}</TableCell>
                <TableCell>${donor.totalAmount.toLocaleString()}</TableCell>
                <TableCell className="text-sm text-gray-600">
                  {donor.lastGiftDate ? new Date(donor.lastGiftDate).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/donors/${donor.id}/edit`)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setDeleteConfirm(donor)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Page {pagination.page ?? page} of {pagination.totalPages ?? 1}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={(pagination.page ?? page) <= 1 || loading}
            onClick={() => setPage((pagination.page ?? page) - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={(pagination.page ?? page) >= (pagination.totalPages ?? 1) || loading}
            onClick={() => setPage((pagination.page ?? page) + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={deleteConfirm !== null}
        title="Delete Donor"
        description={`Are you sure you want to delete ${deleteConfirm?.firstName} ${deleteConfirm?.lastName}? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  )
}