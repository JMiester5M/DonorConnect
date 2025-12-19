'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DonationForm } from '@/components/donations/donation-form'

export default function NewDonationPage() {
  const router = useRouter()
  const [error, setError] = useState('')

  const handleSubmit = async (data) => {
    setError('')
    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Failed to create donation')
      router.push('/donations')
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Record New Donation</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Add a donation to the system and it will automatically update donor metrics.
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Card>
        <CardHeader>
          <CardTitle>Donation Details</CardTitle>
        </CardHeader>
        <CardContent>
          <DonationForm onSubmit={handleSubmit} onCancel={() => router.push('/donations')} />
        </CardContent>
      </Card>
    </div>
  )
}
