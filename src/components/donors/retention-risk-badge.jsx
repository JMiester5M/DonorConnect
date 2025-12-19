/**
 * Retention Risk Badge Component
 * TODO: Implement badge for donor retention risk levels
 */

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function RetentionRiskBadge({ risk, className }) {
  const riskVariants = {
    LOW: 'bg-green-100 text-green-800 border-green-200',
    MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    HIGH: 'bg-red-100 text-red-800 border-red-200',
    CRITICAL: 'bg-red-200 text-red-900 border-red-300',
    UNKNOWN: 'bg-gray-100 text-gray-800 border-gray-200',
  }

  const label = risk || 'UNKNOWN'
  const variantClass = riskVariants[risk] || riskVariants.UNKNOWN

  return (
    <Badge variant="outline" className={cn(variantClass, className)}>
      {label}
    </Badge>
  )
}

// TODO: Example usage:
// <RetentionRiskBadge risk="LOW" />
// <RetentionRiskBadge risk="HIGH" className="ml-2" />