'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { CampaignStatusBadge } from './campaign-status-badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CampaignForm } from './campaign-form'

export function CampaignList({ campaigns, onEdit, onDelete }) {
  const router = useRouter()
  const [editingCampaign, setEditingCampaign] = useState(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const formatCurrency = (amount) => {
    if (!amount) return '-'
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const handleEdit = (campaign) => {
    setEditingCampaign(campaign)
    setIsEditDialogOpen(true)
  }

  const handleEditSubmit = async (data) => {
    await onEdit(editingCampaign.id, data)
    setIsEditDialogOpen(false)
    setEditingCampaign(null)
  }

  const handleRowClick = (id) => {
    router.push(`/campaigns/${id}`)
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No campaigns found.</p>
      </div>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Goal</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => (
            <TableRow key={campaign.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleRowClick(campaign.id)}>
              <TableCell className="font-medium">{campaign.name}</TableCell>
              <TableCell>
                <CampaignStatusBadge status={campaign.status} />
              </TableCell>
              <TableCell>{campaign.type || '-'}</TableCell>
              <TableCell>{formatCurrency(campaign.goal)}</TableCell>
              <TableCell>{formatDate(campaign.startDate)}</TableCell>
              <TableCell>{formatDate(campaign.endDate)}</TableCell>
              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex gap-2 justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEdit(campaign)
                    }}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (window.confirm(`Delete campaign "${campaign.name}"?`)) {
                        onDelete(campaign.id)
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Edit Campaign Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Campaign</DialogTitle>
          </DialogHeader>
          <CampaignForm 
            campaign={editingCampaign} 
            onSubmit={handleEditSubmit}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
