'use client'

import { Input } from '@/components/ui/input'
import { useState, useEffect } from 'react'
import { useCampaigns } from '@/hooks/use-campaigns'
import { CampaignList } from '@/components/campaigns/campaign-list'

export default function DonorCampaignsClient({ organizationId }) {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [page, setPage] = useState(1)
  const { data, loading, error, pagination } = useCampaigns({
    search: debouncedSearch,
    status,
    sortBy,
    sortOrder,
    page,
    limit: 20,
    organizationId,
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Campaigns</h1>
      {/* Filters */}
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="text-sm font-medium mb-1.5 block">Search</label>
          <Input
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-48">
          <label className="text-sm font-medium mb-1.5 block">Status</label>
          <select 
            value={status} 
            onChange={(e) => setStatus(e.target.value)}
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
        <div className="w-48">
          <label className="text-sm font-medium mb-1.5 block">Sort By</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="createdAt">Date Created</option>
            <option value="name">Name</option>
            <option value="startDate">Start Date</option>
            <option value="endDate">End Date</option>
            <option value="goal">Goal</option>
          </select>
        </div>
        <div className="w-32">
          <label className="text-sm font-medium mb-1.5 block">Order</label>
          <select 
            value={sortOrder} 
            onChange={(e) => setSortOrder(e.target.value)}
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>
      {/* Results */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {loading ? (
        <div className="text-center py-12">Loading campaigns...</div>
      ) : (
        <>
          <CampaignList
            campaigns={data}
            hideActions={true}
          />
          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                className="px-4 py-2 rounded border bg-white text-gray-700 disabled:opacity-50"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </button>
              <span className="py-2 px-4">
                Page {page} of {pagination.pages}
              </span>
              <button
                className="px-4 py-2 rounded border bg-white text-gray-700 disabled:opacity-50"
                disabled={page === pagination.pages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
