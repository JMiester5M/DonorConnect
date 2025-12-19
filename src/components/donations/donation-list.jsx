'use client'

/**
 * Donation List Component
 * Table for displaying donations with filtering and sorting
 */

import { useState, useMemo } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export function DonationList({ donations = [], onEdit, onDelete, isLoading }) {
  const [sortField, setSortField] = useState('date')
  const [sortDirection, setSortDirection] = useState('desc')
  const [filters, setFilters] = useState({
    donorName: '',
    donationType: '',
    minAmount: '',
    maxAmount: '',
    startDate: '',
    endDate: '',
  })

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const filteredAndSortedDonations = useMemo(() => {
    let result = [...donations]

    // Apply filters
    if (filters.donorName) {
      const search = filters.donorName.toLowerCase()
      result = result.filter(d => 
        d.donor?.firstName?.toLowerCase().includes(search) ||
        d.donor?.lastName?.toLowerCase().includes(search) ||
        d.donor?.email?.toLowerCase().includes(search)
      )
    }

    if (filters.donationType) {
      result = result.filter(d => d.type === filters.donationType)
    }

    if (filters.minAmount) {
      const min = parseFloat(filters.minAmount)
      result = result.filter(d => d.amount >= min)
    }

    if (filters.maxAmount) {
      const max = parseFloat(filters.maxAmount)
      result = result.filter(d => d.amount <= max)
    }

    if (filters.startDate) {
      const start = new Date(filters.startDate)
      result = result.filter(d => new Date(d.date) >= start)
    }

    if (filters.endDate) {
      const end = new Date(filters.endDate)
      result = result.filter(d => new Date(d.date) <= end)
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue, bValue

      switch (sortField) {
        case 'date':
          aValue = new Date(a.date).getTime()
          bValue = new Date(b.date).getTime()
          break
        case 'donor':
          aValue = `${a.donor?.lastName} ${a.donor?.firstName}`.toLowerCase()
          bValue = `${b.donor?.lastName} ${b.donor?.firstName}`.toLowerCase()
          break
        case 'amount':
          aValue = a.amount
          bValue = b.amount
          break
        case 'type':
          aValue = a.type
          bValue = b.type
          break
        case 'campaign':
          aValue = a.campaign?.name || ''
          bValue = b.campaign?.name || ''
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [donations, filters, sortField, sortDirection])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const formatDonationType = (type) => {
    return type?.replace(/_/g, ' ').split(' ').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')
  }

  const SortableHeader = ({ field, children }) => (
    <TableHead 
      className="cursor-pointer hover:bg-muted/50 select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && (
          <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
        )}
      </div>
    </TableHead>
  )

  const inputClasses = 'h-9 text-sm'

  return (
    <div className="space-y-4">
      {/* Filter controls */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Input
          placeholder="Search donor..."
          value={filters.donorName}
          onChange={(e) => handleFilterChange('donorName', e.target.value)}
          className={inputClasses}
        />
        
        <select
          value={filters.donationType}
          onChange={(e) => handleFilterChange('donationType', e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">All Types</option>
          <option value="ONE_TIME">One-Time</option>
          <option value="RECURRING">Recurring</option>
          <option value="PLEDGE">Pledge</option>
          <option value="IN_KIND">In-Kind</option>
        </select>

        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min $"
            value={filters.minAmount}
            onChange={(e) => handleFilterChange('minAmount', e.target.value)}
            className={inputClasses}
          />
          <Input
            type="number"
            placeholder="Max $"
            value={filters.maxAmount}
            onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
            className={inputClasses}
          />
        </div>

        <Input
          type="date"
          placeholder="Start Date"
          value={filters.startDate}
          onChange={(e) => handleFilterChange('startDate', e.target.value)}
          className={inputClasses}
        />
        
        <Input
          type="date"
          placeholder="End Date"
          value={filters.endDate}
          onChange={(e) => handleFilterChange('endDate', e.target.value)}
          className={inputClasses}
        />

        <Button
          variant="outline"
          size="sm"
          onClick={() => setFilters({
            donorName: '',
            donationType: '',
            minAmount: '',
            maxAmount: '',
            startDate: '',
            endDate: '',
          })}
          className="h-9"
        >
          Clear Filters
        </Button>
      </div>

      {/* Donations table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader field="date">Date</SortableHeader>
              <SortableHeader field="donor">Donor</SortableHeader>
              <SortableHeader field="amount">Amount</SortableHeader>
              <SortableHeader field="type">Type</SortableHeader>
              <SortableHeader field="campaign">Campaign</SortableHeader>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading donations...
                </TableCell>
              </TableRow>
            )}

            {!isLoading && filteredAndSortedDonations.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No donations found. {Object.values(filters).some(v => v) && 'Try adjusting your filters.'}
                </TableCell>
              </TableRow>
            )}

            {!isLoading && filteredAndSortedDonations.map((donation) => (
              <TableRow key={donation.id}>
                <TableCell>{formatDate(donation.date)}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {donation.donor?.firstName} {donation.donor?.lastName}
                    </span>
                    {donation.donor?.email && (
                      <span className="text-xs text-muted-foreground">{donation.donor.email}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{formatCurrency(donation.amount)}</TableCell>
                <TableCell>
                  <Badge variant="outline">{formatDonationType(donation.type)}</Badge>
                </TableCell>
                <TableCell>{donation.campaign?.name || '—'}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(donation)}
                      >
                        Edit
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(donation)}
                        className="text-destructive hover:text-destructive"
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredAndSortedDonations.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Showing {filteredAndSortedDonations.length} of {donations.length} donations
        </p>
      )}
    </div>
  )
}