import { useEffect, useState, useCallback, useMemo } from 'react'

export function useTasks(page = 1, limit = 50, filters = {}) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pagination, setPagination] = useState({})
  const [currentPage, setCurrentPage] = useState(page)
  const [searchQuery, setSearchQuery] = useState(filters.search || '')
  const [statusFilter, setStatusFilter] = useState(filters.status || '')
  const [priorityFilter, setPriorityFilter] = useState(filters.priority || '')

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
      })
      if (searchQuery) params.append('search', searchQuery)
      if (statusFilter) params.append('status', statusFilter)
      if (priorityFilter) params.append('priority', priorityFilter)

      const res = await fetch(`/api/tasks?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch tasks')
      setTasks(data.data || [])
      setPagination(data.pagination || {})
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchQuery, statusFilter, priorityFilter])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const setFilters = useCallback((newFilters) => {
    setCurrentPage(1)
    if (newFilters.search !== undefined) {
      setSearchQuery(newFilters.search || '')
    }
    if (newFilters.status !== undefined) {
      setStatusFilter(newFilters.status || '')
    }
    if (newFilters.priority !== undefined) {
      setPriorityFilter(newFilters.priority || '')
    }
  }, [])

  return {
    tasks,
    loading,
    error,
    page: currentPage,
    setPage: setCurrentPage,
    pagination,
    setFilters,
    refetch: fetchTasks,
  }
}
