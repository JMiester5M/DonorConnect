'use client'

// New donor form page

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { DonorForm } from '@/components/donors/donor-form'

export default function NewDonorPage() {
  const router = useRouter()
  const [error, setError] = useState('')

  const handleCreate = async (payload) => {
    setError('')
    const res = await fetch('/api/donors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error || 'Failed to create donor')
    }
    router.push('/donors')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add New Donor</h1>
        <p className="text-gray-600 mt-2">Create a new donor profile</p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <DonorForm
        onSubmit={handleCreate}
        onCancel={() => router.push('/donors')}
      />
    </div>
  )
}