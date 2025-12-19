"use client"

// React hook for segment data management
import { useEffect, useState, useCallback } from 'react'

export function useSegments(page = 1, limit = 50, filters = {}) {
	const [segments, setSegments] = useState([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [pagination, setPagination] = useState({ page, limit, total: 0, totalPages: 0 })
	const [internalPage, setInternalPage] = useState(page)
	const [internalFilters, setInternalFilters] = useState(filters)

	const fetchSegments = useCallback(async (p = internalPage, f = internalFilters) => {
		setLoading(true)
		setError('')
		try {
			const params = new URLSearchParams({ page: String(p), limit: String(limit) })
			if (f?.search) params.set('search', f.search)

			const res = await fetch(`/api/segments?${params.toString()}`)
			const data = await res.json()
			if (!res.ok) throw new Error(data.error || 'Failed to load segments')

			setSegments(data.data || [])
			setPagination(data.pagination || { page: p, limit, total: 0, totalPages: 0 })
		} catch (err) {
			setError(err.message)
		} finally {
			setLoading(false)
		}
	}, [internalPage, internalFilters, limit])

	useEffect(() => {
		fetchSegments(internalPage, internalFilters)
	}, [fetchSegments, internalPage, internalFilters])

	const refetch = () => fetchSegments(internalPage, internalFilters)

	return {
		segments,
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