// Campaigns API - Individual Operations
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getCampaign, updateCampaign, deleteCampaign } from '@/lib/api/campaigns'
import { updateCampaignSchema } from '@/lib/validation/campaign-schema'

export async function GET(request, { params }) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const organizationId = session.user.organizationId || session.user.organization?.id
    if (!organizationId) return NextResponse.json({ error: 'Organization not found' }, { status: 400 })

    const resolvedParams = await params
    const campaign = await getCampaign(resolvedParams.id, organizationId)
    if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })

    return NextResponse.json(campaign)
  } catch (error) {
    console.error('Campaign GET error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!['ADMIN', 'STAFF', 'MARKETING'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const organizationId = session.user.organizationId || session.user.organization?.id
    if (!organizationId) return NextResponse.json({ error: 'Organization not found' }, { status: 400 })

    let body
    try {
      body = await request.json()
    } catch (err) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    // Debug: log incoming payload and parsed result
    console.log('PATCH /api/campaigns/:id body:', body)
    const parsed = updateCampaignSchema.safeParse(body)
    if (!parsed.success) {
      console.error('Campaign PATCH validation errors:', parsed.error.errors)
    } else {
      console.log('Campaign PATCH parsed data:', parsed.data)
    }
    if (!parsed.success) {
      const message = parsed.error.errors?.[0]?.message || 'Validation failed'
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const resolvedParams = await params
    const campaign = await updateCampaign(resolvedParams.id, organizationId, parsed.data)
    console.log('Campaign PATCH update result:', campaign?.id ? 'updated ' + campaign.id : 'not found')
    if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })

    return NextResponse.json(campaign)
  } catch (error) {
    console.error('Campaign PATCH error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // ADMIN only for deletion
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - ADMIN only' }, { status: 403 })
    }

    const organizationId = session.user.organizationId || session.user.organization?.id
    if (!organizationId) return NextResponse.json({ error: 'Organization not found' }, { status: 400 })

    const resolvedParams = await params
    const campaign = await deleteCampaign(resolvedParams.id, organizationId)
    if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Campaign DELETE error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}