"use client"

// React hook for donor data management
import { useState, useEffect, useCallback, useMemo } from 'react'

/**
 * TODO: Hook to fetch and manage donors list
 * @param {number} page - Page number for pagination
 * @param {number} limit - Items per page
 * @param {Object} filters - Search and filter options
 * @returns {Object} { donors, loading, error, refetch }
 */
export function useDonors(page = 1, limit = 50, filters = {}) {
  const [donors, setDonors] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pagination, setPagination] = useState({ page, limit, total: 0, totalPages: 0 })
  const [internalPage, setInternalPage] = useState(page)
  const [internalFilters, setInternalFilters] = useState(filters)

  const fetchDonors = useCallback(async (p = internalPage, f = internalFilters) => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({
        page: String(p),
        limit: String(limit),
      })
      if (f?.search) params.set('search', f.search)

      const res = await fetch(`/api/donors?${params.toString()}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to load donors')
      }

      setDonors(data.data || [])
      setPagination(data.pagination || { page: p, limit, total: 0, totalPages: 0 })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [internalPage, internalFilters, limit])

  useEffect(() => {
    fetchDonors(internalPage, internalFilters)
  }, [fetchDonors, internalPage, internalFilters])

  const refetch = () => fetchDonors(internalPage, internalFilters)

  return {
    donors,
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
 * TODO: Hook to fetch single donor
 * @param {string} donorId - Donor ID
 * @returns {Object} { donor, loading, error, refetch }
 */
export function useDonor(donorId) {
  const [donor, setDonor] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchDonor = async () => {
    if (!donorId) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/donors/${donorId}`)
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load donor')
      }
      setDonor(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDonor()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [donorId])

  return { donor, loading, error, refetch: fetchDonor }
}