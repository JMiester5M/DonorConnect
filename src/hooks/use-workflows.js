import { useEffect, useState, useCallback } from 'react'

export function useWorkflows() {
  const [workflows, setWorkflows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pagination, setPagination] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchWorkflows = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
      })
      if (searchQuery) {
        params.append('search', searchQuery)
      }
      const res = await fetch(`/api/workflows?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch workflows')
      setWorkflows(data.data || [])
      setPagination(data.pagination || {})
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchQuery])

  useEffect(() => {
    fetchWorkflows()
  }, [fetchWorkflows])

  const setFilters = useCallback((newFilters) => {
    setCurrentPage(1)
    if (newFilters.search !== undefined) {
      setSearchQuery(newFilters.search || '')
    }
  }, [])

  return {
    workflows,
    loading,
    error,
    page: currentPage,
    setPage: setCurrentPage,
    pagination,
    setFilters,
    refetch: fetchWorkflows,
  }
}