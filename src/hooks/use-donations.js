"use client"

// React hook for donation data management
import { useState, useEffect, useCallback, useMemo } from 'react'

/**
 * Hook to fetch and manage donations list
 * @param {number} page - Page number for pagination
 * @param {number} limit - Items per page
 * @param {Object} filters - Search and filter options
 * @returns {Object} { donations, loading, error, pagination, refetch }
 */
export function useDonations(page = 1, limit = 50, filters = {}) {
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pagination, setPagination] = useState({ page, limit, total: 0, totalPages: 0 })
  const [internalPage, setInternalPage] = useState(page)
  const [internalFilters, setInternalFilters] = useState(filters)

  const fetchDonations = useCallback(async (p = internalPage, f = internalFilters) => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({
        page: String(p),
        limit: String(limit),
      })
      if (f?.search) params.set('search', f.search)
      if (f?.donorId) params.set('donorId', f.donorId)
      if (f?.campaignId) params.set('campaignId', f.campaignId)
      if (f?.type) params.set('type', f.type)
      if (f?.minAmount) params.set('minAmount', String(f.minAmount))
      if (f?.maxAmount) params.set('maxAmount', String(f.maxAmount))
      if (f?.startDate) params.set('startDate', f.startDate)
      if (f?.endDate) params.set('endDate', f.endDate)
      if (f?.sortBy) params.set('sortBy', f.sortBy)
      if (f?.sortOrder) params.set('sortOrder', f.sortOrder)

      const res = await fetch(`/api/donations?${params.toString()}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to load donations')
      }

      setDonations(data.data || [])
      setPagination(data.pagination || { page: p, limit, total: 0, totalPages: 0 })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [internalPage, internalFilters, limit])

  useEffect(() => {
    fetchDonations(internalPage, internalFilters)
  }, [fetchDonations, internalPage, internalFilters])

  const refetch = () => fetchDonations(internalPage, internalFilters)

  return {
    donations,
    loading,
    error,
    pagination,
    page: internalPage,
    setPage: setInternalPage,
    filters: internalFilters,
    setFilters: setInternalFilters,
    refetch,
  }
}

/**
 * Hook to fetch single donation
 * @param {string} donationId - Donation ID
 * @returns {Object} { donation, loading, error, refetch }
 */
export function useDonation(donationId) {
  const [donation, setDonation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchDonation = async () => {
    if (!donationId) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/donations/${donationId}`)
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load donation')
      }
      setDonation(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDonation()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [donationId])

  return { donation, loading, error, refetch: fetchDonation }
}