// Workflows page
'use client'

import { useEffect, useState } from 'react'
import { useWorkflows } from '@/hooks/use-workflows'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { WorkflowForm } from '@/components/workflows/workflow-form'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Loader2, Trash2, Edit2 } from 'lucide-react'
import { toast } from '@/lib/toast'

export default function WorkflowsPage() {
  const { workflows, loading, error, page, setPage, pagination, setFilters, refetch } = useWorkflows()
  const [segments, setSegments] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingWorkflow, setEditingWorkflow] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [searchValue, setSearchValue] = useState('')

  // Load segments for form
  useEffect(() => {
    const loadSegments = async () => {
      try {
        const res = await fetch('/api/segments?page=1&limit=100')
        if (!res.ok) throw new Error('Failed to load segments')
        const data = await res.json()
        setSegments(data.data || [])
      } catch (err) {
        console.error('Error loading segments:', err)
        toast.error('Failed to load segments')
      }
    }
    loadSegments()
  }, [])

  const handleSearch = (value) => {
    setSearchValue(value)
    setPage(1)
    setFilters({ search: value || undefined })
  }

  const handleCreateWorkflow = async (data) => {
    try {
      const method = editingWorkflow ? 'PATCH' : 'POST'
      const url = editingWorkflow ? `/api/workflows/${editingWorkflow.id}` : '/api/workflows'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to save workflow')
      }
      setShowForm(false)
      setEditingWorkflow(null)
      refetch()
    } catch (err) {
      throw new Error(err.message)
    }
  }

  const handleDeleteWorkflow = async () => {
    if (!deleteConfirm) return
    try {
      const res = await fetch(`/api/workflows/${deleteConfirm.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete workflow')
      toast.success(`Workflow "${deleteConfirm.name}" deleted successfully`)
      setDeleteConfirm(null)
      refetch()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleEditWorkflow = (workflow) => {
    setEditingWorkflow(workflow)
    setShowForm(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Automation Workflows</h1>
        <Button onClick={() => { setEditingWorkflow(null); setShowForm(true) }}>
          Create Workflow
        </Button>
      </div>

      {/* Search and filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Search workflows..."
          value={searchValue}
          onChange={(e) => handleSearch(e.target.value)}
          className="flex-1"
        />
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Workflows table */}
      {!loading && workflows.length > 0 && (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>Segment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workflows.map((workflow) => (
                <TableRow key={workflow.id}>
                  <TableCell className="font-medium">{workflow.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {workflow.trigger.replace(/_/g, ' ')}
                  </TableCell>
                  <TableCell className="text-sm">
                    {workflow.segment?.name || '—'}
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      workflow.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {workflow.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditWorkflow(workflow)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setDeleteConfirm(workflow)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} of {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={page === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty state */}
      {!loading && workflows.length === 0 && (
        <div className="rounded-md border border-dashed p-8 text-center">
          <p className="text-muted-foreground">No workflows yet.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => { setEditingWorkflow(null); setShowForm(true) }}
          >
            Create your first workflow
          </Button>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingWorkflow ? 'Edit Workflow' : 'Create Workflow'}
            </DialogTitle>
            <DialogDescription>
              {editingWorkflow
                ? 'Update your workflow details and settings.'
                : 'Set up a new automation workflow to engage donors.'}
            </DialogDescription>
          </DialogHeader>
          <WorkflowForm
            workflow={editingWorkflow}
            segments={segments}
            onSubmit={handleCreateWorkflow}
            onCancel={() => {
              setShowForm(false)
              setEditingWorkflow(null)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirm !== null}
        title="Delete Workflow"
        description={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteWorkflow}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  )
}
