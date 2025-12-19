'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

/**
 * Hook to fetch campaigns list with filtering and pagination
 */
export function useCampaigns({
  search = '',
  status = '',
  sortBy = 'createdAt',
  sortOrder = 'desc',
  page = 1,
  limit = 50,
} = {}) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({})
  const [refreshIndex, setRefreshIndex] = useState(0)

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        params.append('page', page)
        params.append('limit', limit)
        if (search) params.append('search', search)
        if (status) params.append('status', status)
        params.append('sortBy', sortBy)
        params.append('sortOrder', sortOrder)

        const res = await fetch(`/api/campaigns?${params.toString()}`)
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Failed to fetch campaigns')
        }
        const result = await res.json()
        setData(result.data || [])
        setPagination(result.pagination || {})
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCampaigns()
  }, [search, status, sortBy, sortOrder, page, limit, refreshIndex])

  const refetch = () => setRefreshIndex((i) => i + 1)

  return { data, loading, error, pagination, refetch }
}

/**
 * Hook to fetch a single campaign
 */
export function useCampaign(id) {
  const [campaign, setCampaign] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchCampaign = async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/campaigns/${id}`)
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to fetch campaign')
      }
      setCampaign(await res.json())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCampaign()
  }, [id])

  const refetch = () => fetchCampaign()

  return { campaign, loading, error, refetch }
}