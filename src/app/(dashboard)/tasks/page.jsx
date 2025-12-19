// Tasks page
'use client'

import { useEffect, useState } from 'react'
import { useTasks } from '@/hooks/use-tasks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { TaskForm } from '@/components/tasks/task-form'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Loader2, Trash2, Edit2 } from 'lucide-react'
import { toast } from '@/lib/toast'

export default function TasksPage() {
  const { tasks, loading, error, page, setPage, pagination, setFilters, refetch } = useTasks()
  const [donors, setDonors] = useState([])
  const [users, setUsers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [searchValue, setSearchValue] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')

  // Load donors and users for form
  useEffect(() => {
    const loadData = async () => {
      try {
        const [donorsRes, usersRes] = await Promise.all([
          fetch('/api/donors?page=1&limit=100'),
          fetch('/api/users/staff'),
        ])
        
        if (donorsRes.ok) {
          const donorsData = await donorsRes.json()
          setDonors(donorsData.data || [])
        }

        if (usersRes.ok) {
          const usersData = await usersRes.json()
          setUsers(usersData || [])
        }
      } catch (err) {
        console.error('Error loading data:', err)
      }
    }
    loadData()
  }, [])

  const handleSearch = (value) => {
    setSearchValue(value)
    setPage(1)
    setFilters({ search: value || undefined })
  }

  const handleStatusFilter = (value) => {
    setStatusFilter(value)
    setPage(1)
    setFilters({ status: value || undefined })
  }

  const handlePriorityFilter = (value) => {
    setPriorityFilter(value)
    setPage(1)
    setFilters({ priority: value || undefined })
  }

  const handleCreateTask = async (data) => {
    try {
      const method = editingTask ? 'PATCH' : 'POST'
      const url = editingTask ? `/api/tasks/${editingTask.id}` : '/api/tasks'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to save task')
      }
      setShowForm(false)
      setEditingTask(null)
      refetch()
    } catch (err) {
      throw new Error(err.message)
    }
  }

  const handleDeleteTask = async () => {
    if (!deleteConfirm) return
    try {
      const res = await fetch(`/api/tasks/${deleteConfirm.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete task')
      toast.success(`Task "${deleteConfirm.title}" deleted successfully`)
      setDeleteConfirm(null)
      refetch()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
    setShowForm(true)
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-700'
      case 'HIGH':
        return 'bg-orange-100 text-orange-700'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-700'
      case 'LOW':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-700'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-700'
      case 'TODO':
        return 'bg-gray-100 text-gray-700'
      case 'CANCELLED':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tasks & Reminders</h1>
        <Button onClick={() => { setEditingTask(null); setShowForm(true) }}>
          Create Task
        </Button>
      </div>

      {/* Search and filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Search tasks..."
          value={searchValue}
          onChange={(e) => handleSearch(e.target.value)}
          className="flex-1"
        />
        <select 
          value={statusFilter} 
          onChange={(e) => handleStatusFilter(e.target.value)}
          className="flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All Status</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <select 
          value={priorityFilter} 
          onChange={(e) => handlePriorityFilter(e.target.value)}
          className="flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All Priority</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>
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

      {/* Tasks table */}
      {!loading && tasks.length > 0 && (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Donor</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
                      {task.status.replace(/_/g, ' ')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                  </TableCell>
                  <TableCell className="text-sm">
                    {task.donor ? `${task.donor.firstName} ${task.donor.lastName}` : '—'}
                  </TableCell>
                  <TableCell className="text-sm">
                    {task.assignedUser ? `${task.assignedUser.firstName} ${task.assignedUser.lastName}` : '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditTask(task)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setDeleteConfirm(task)}
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
      {!loading && tasks.length === 0 && (
        <div className="rounded-md border border-dashed p-8 text-center">
          <p className="text-muted-foreground">No tasks yet.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => { setEditingTask(null); setShowForm(true) }}
          >
            Create your first task
          </Button>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTask ? 'Edit Task' : 'Create Task'}
            </DialogTitle>
            <DialogDescription>
              {editingTask
                ? 'Update your task details.'
                : 'Create a new task or reminder.'}
            </DialogDescription>
          </DialogHeader>
          <TaskForm
            task={editingTask}
            donors={donors}
            users={users}
            onSubmit={handleCreateTask}
            onCancel={() => {
              setShowForm(false)
              setEditingTask(null)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirm !== null}
        title="Delete Task"
        description={`Are you sure you want to delete "${deleteConfirm?.title}"? This action cannot be undone.`}
        onConfirm={handleDeleteTask}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  )
}
