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

// POST /api/disputes - Create a new dispute
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    const body = await request.json()
    const { appointment_id, reason } = body

    if (!appointment_id || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields: appointment_id and reason' },
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

    // Get appointment details
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select(`
        id,
        client_id,
        specialist_id,
        status,
        users!appointments_client_id_fkey(name, email),
        specialists!inner(
          users!inner(name, email)
        )
      `)
      .eq('id', appointment_id)
      .single()

    if (appointmentError || !appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Check if user is involved in this appointment
    const isClient = user.id === appointment.client_id
    const isSpecialist = user.id === appointment.specialist_id

    if (!isClient && !isSpecialist) {
      return NextResponse.json(
        { error: 'Only the client or specialist can raise a dispute for this appointment' },
        { status: 403 }
      )
    }

    // Check if appointment is in a state where disputes can be raised
    if (!['confirmed', 'completed'].includes(appointment.status)) {
      return NextResponse.json(
        { error: 'Can only raise disputes for confirmed or completed appointments' },
        { status: 400 }
      )
    }

    // Check if dispute already exists
    const { data: existingDispute, error: existingDisputeError } = await supabase
      .from('disputes')
      .select('id')
      .eq('appointment_id', appointment_id)
      .eq('raised_by', user.id)
      .eq('status', 'open')
      .single()

    if (existingDispute) {
      return NextResponse.json(
        { error: 'You already have an open dispute for this appointment' },
        { status: 400 }
      )
    }

    // Create the dispute
    const { data: dispute, error: disputeError } = await supabase
      .from('disputes')
      .insert({
        appointment_id: appointment_id,
        raised_by: user.id,
        reason: reason,
        status: 'open'
      })
      .select()
      .single()

    if (disputeError) {
      console.error('Error creating dispute:', disputeError)
      return NextResponse.json(
        { error: 'Failed to create dispute' },
        { status: 500 }
      )
    }

    // Log the dispute creation
    await supabase
      .from('logs')
      .insert({
        user_id: user.id,
        action: 'dispute_created',
        metadata: {
          appointment_id: appointment_id,
          specialist_id: appointment.specialist_id,
          client_id: appointment.client_id,
          reason: reason
        }
      })

    return NextResponse.json({
      success: true,
      dispute: {
        id: dispute.id,
        appointment_id: dispute.appointment_id,
        raised_by: dispute.raised_by,
        reason: dispute.reason,
        status: dispute.status,
        created_at: dispute.created_at
      }
    })

  } catch (error) {
    console.error('Create dispute error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/disputes - Get disputes (admin only or user's own disputes)
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()

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

    const isAdmin = userData?.role === 'admin'

    let query = supabase
      .from('disputes')
      .select(`
        id,
        appointment_id,
        raised_by,
        reason,
        status,
        resolution_notes,
        resolved_by,
        resolved_at,
        created_at,
        appointments!inner(
          id,
          date,
          start_time,
          end_time,
          status,
          total_cost,
          description,
          users!appointments_client_id_fkey(name, email),
          specialists!inner(
            users!inner(name, email)
          )
        )
      `)
      .order('created_at', { ascending: false })

    // If not admin, only show user's own disputes
    if (!isAdmin) {
      query = query.eq('raised_by', user.id)
    }

    const { data: disputes, error: disputesError } = await query

    if (disputesError) {
      console.error('Error fetching disputes:', disputesError)
      return NextResponse.json(
        { error: 'Failed to fetch disputes' },
        { status: 500 }
      )
    }

    // Format disputes for response
    const formattedDisputes = disputes.map(dispute => ({
      id: dispute.id,
      appointment_id: dispute.appointment_id,
      raised_by: dispute.raised_by,
      reason: dispute.reason,
      status: dispute.status,
      resolution_notes: dispute.resolution_notes,
      resolved_by: dispute.resolved_by,
      resolved_at: dispute.resolved_at,
      created_at: dispute.created_at,
      appointment: {
        id: dispute.appointments?.[0]?.id,
        date: dispute.appointments?.[0]?.date,
        start_time: dispute.appointments?.[0]?.start_time,
        end_time: dispute.appointments?.[0]?.end_time,
        status: dispute.appointments?.[0]?.status,
        total_cost: dispute.appointments?.[0]?.total_cost,
        description: dispute.appointments?.[0]?.description,
        client: dispute.appointments?.[0]?.users?.[0],
        specialist: dispute.appointments?.[0]?.specialists?.[0]?.users?.[0]
      }
    }))

    return NextResponse.json({
      success: true,
      disputes: formattedDisputes
    })

  } catch (error) {
    console.error('Get disputes error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
