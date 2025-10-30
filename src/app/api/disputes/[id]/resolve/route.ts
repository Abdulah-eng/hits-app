import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Create Supabase client for server-side operations
function createSupabaseClient() {
  const cookieStore = cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        async get(name: string) {
          const cookieStore = await cookies()
          return cookieStore.get(name)?.value
        },
        async set(name: string, value: string, options: any) {
          const cookieStore = await cookies()
          cookieStore.set({ name, value, ...options })
        },
        async remove(name: string, options: any) {
          const cookieStore = await cookies()
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}

// PATCH /api/disputes/[id]/resolve - Resolve a dispute (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createSupabaseClient()
    const { id: disputeId } = await params
    const body = await request.json()
    const { resolution_notes } = body

    if (!resolution_notes) {
      return NextResponse.json(
        { error: 'Missing required field: resolution_notes' },
        { status: 400 }
      )
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can resolve disputes' },
        { status: 403 }
      )
    }

    // Get dispute details
    const { data: dispute, error: disputeError } = await supabase
      .from('disputes')
      .select(`
        id,
        appointment_id,
        raised_by,
        reason,
        status,
        appointments!inner(
          id,
          client_id,
          specialist_id,
          users!appointments_client_id_fkey(name, email),
          specialists!inner(
            users!inner(name, email)
          )
        )
      `)
      .eq('id', disputeId)
      .single()

    if (disputeError || !dispute) {
      return NextResponse.json(
        { error: 'Dispute not found' },
        { status: 404 }
      )
    }

    // Check if dispute is already resolved
    if (dispute.status === 'resolved') {
      return NextResponse.json(
        { error: 'Dispute is already resolved' },
        { status: 400 }
      )
    }

    // Update dispute status to resolved
    const { error: updateError } = await supabase
      .from('disputes')
      .update({
        status: 'resolved',
        resolution_notes: resolution_notes,
        resolved_by: user.id,
        resolved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', disputeId)

    if (updateError) {
      console.error('Error resolving dispute:', updateError)
      return NextResponse.json(
        { error: 'Failed to resolve dispute' },
        { status: 500 }
      )
    }

    // Log the dispute resolution
    await supabase
      .from('logs')
      .insert({
        user_id: user.id,
        action: 'dispute_resolved',
        metadata: {
          dispute_id: disputeId,
          appointment_id: dispute.appointment_id,
          raised_by: dispute.raised_by,
          resolution_notes: resolution_notes
        }
      })

    // Send notification to the person who raised the dispute
    try {
      const notificationResponse = await fetch(`${request.nextUrl.origin}/api/notifications/appointment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointment_id: dispute.appointment_id,
          notification_type: 'dispute_resolved',
          custom_message: `Your dispute has been resolved. Resolution: ${resolution_notes}`
        }),
      })

      if (!notificationResponse.ok) {
        console.error('Failed to send dispute resolution notification')
      }
    } catch (notificationError) {
      console.error('Error sending dispute resolution notification:', notificationError)
    }

    return NextResponse.json({
      success: true,
      message: 'Dispute resolved successfully'
    })

  } catch (error) {
    console.error('Resolve dispute error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
