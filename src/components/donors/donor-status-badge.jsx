/**
 * Donor Status Badge Component
 * TODO: Implement status badge for donor states
 */

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function DonorStatusBadge({ status, className }) {
  const statusVariants = {
    ACTIVE: 'bg-green-100 text-green-800 border-green-200',
    INACTIVE: 'bg-gray-100 text-gray-800 border-gray-200',
    LAPSED: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    PROSPECTIVE: 'bg-blue-100 text-blue-800 border-blue-200',
  }

  const label = status ? status.toString().replace(/_/g, ' ') : 'UNKNOWN'
  const variantClass = statusVariants[status] || 'bg-gray-100 text-gray-800 border-gray-200'

  return (
    <Badge variant="outline" className={cn(variantClass, className)}>
      {label}
    </Badge>
  )
}

// TODO: Example usage:
// <DonorStatusBadge status="ACTIVE" />
// <DonorStatusBadge status="LAPSED" className="ml-2" />