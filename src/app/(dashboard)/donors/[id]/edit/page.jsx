'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DonorForm } from '@/components/donors/donor-form'
import { useDonor } from '@/hooks/use-donors'

// Donor edit page
export default function EditDonorPage({ params }) {
  const router = useRouter()
  const [id, setId] = useState(null)
  const { donor, loading, error, refetch } = useDonor(id)
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    async function loadParams() {
      const resolvedParams = await params
      if (!resolvedParams?.id) {
        router.push('/donors')
      } else {
        setId(resolvedParams.id)
      }
    }
    loadParams()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleUpdate = async (payload) => {
    setActionError('')
    const res = await fetch(`/api/donors/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error || 'Failed to update donor')
    }
    await refetch()
    router.push(`/donors/${id}`)
  }

  if (loading) return <p>Loading...</p>
  if (error) return <p className="text-destructive">{error}</p>
  if (!donor) return <p>Donor not found</p>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Donor</h1>
      </div>

      {actionError && <p className="text-sm text-destructive">{actionError}</p>}

      <DonorForm
        donor={donor}
        onSubmit={handleUpdate}
        onCancel={() => router.push(`/donors/${id}`)}
      />
    </div>
  )
}
