/**
 * Campaign Status Badge Component
 * Displays campaign status with appropriate color coding
 */

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function CampaignStatusBadge({ status, className }) {
  const statusVariants = {
    DRAFT: 'bg-gray-100 text-gray-800 border-gray-300',
    ACTIVE: 'bg-green-100 text-green-800 border-green-300',
    COMPLETED: 'bg-blue-100 text-blue-800 border-blue-300',
    ARCHIVED: 'bg-red-100 text-red-800 border-red-300',
  }

  const variant = statusVariants[status] || 'bg-gray-100 text-gray-800 border-gray-300'

  const statusLabels = {
    DRAFT: 'Draft',
    ACTIVE: 'Active',
    COMPLETED: 'Completed',
    ARCHIVED: 'Archived',
  }

  return (
    <Badge className={cn(variant, 'border', className)}>
      {statusLabels[status] || status}
    </Badge>
  )
}