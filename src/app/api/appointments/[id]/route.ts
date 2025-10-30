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

// GET /api/appointments/[id] - Get appointment details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createSupabaseClient()
    const { id: appointmentId } = await params

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get appointment with related data
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select(`
        id,
        client_id,
        specialist_id,
        date,
        start_time,
        end_time,
        status,
        total_cost,
        description,
        created_at,
        updated_at,
        users!appointments_client_id_fkey(name, email),
        specialists(
          users(name, email)
        )
      `)
      .eq('id', appointmentId)
      .single()

    if (appointmentError || !appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Check if user has access to this appointment
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const hasAccess = 
      user.id === appointment.client_id || 
      user.id === appointment.specialist_id || 
      userData?.role === 'admin'

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      appointment: {
        id: appointment.id,
        client_id: appointment.client_id,
        specialist_id: appointment.specialist_id,
        date: appointment.date,
        start_time: appointment.start_time,
        end_time: appointment.end_time,
        status: appointment.status,
        total_cost: appointment.total_cost,
        description: appointment.description,
        created_at: appointment.created_at,
        updated_at: appointment.updated_at,
        client: appointment.users,
        specialist: appointment.specialists?.[0]?.users
      }
    })

  } catch (error) {
    console.error('Get appointment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/appointments/[id] - Update appointment (cancel, confirm, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createSupabaseClient()
    const { id: appointmentId } = await params
    const body = await request.json()
    const { status, action } = body

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get appointment
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
      .eq('id', appointmentId)
      .single()

    if (appointmentError || !appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Check permissions
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const isClient = user.id === appointment.client_id
    const isSpecialist = user.id === appointment.specialist_id
    const isAdmin = userData?.role === 'admin'

    // Determine allowed actions based on user role and current status
    let allowedActions: string[] = []
    
    if (isClient) {
      if (appointment.status === 'pending') {
        allowedActions = ['cancelled']
      } else if (appointment.status === 'confirmed') {
        allowedActions = ['cancelled']
      }
    } else if (isSpecialist) {
      if (appointment.status === 'pending') {
        allowedActions = ['confirmed', 'cancelled']
      } else if (appointment.status === 'confirmed') {
        allowedActions = ['completed', 'cancelled']
      }
    } else if (isAdmin) {
      allowedActions = ['confirmed', 'cancelled', 'completed']
    }

    if (!allowedActions.includes(status)) {
      return NextResponse.json(
        { error: 'Action not allowed' },
        { status: 403 }
      )
    }

    // Update appointment
    const { data: updatedAppointment, error: updateError } = await supabase
      .from('appointments')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId)
      .select(`
        id,
        status,
        users!appointments_client_id_fkey(name, email),
        specialists!inner(
          users!inner(name, email)
        )
      `)
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update appointment' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      appointment: {
        id: updatedAppointment.id,
        status: updatedAppointment.status
      }
    })

  } catch (error) {
    console.error('Update appointment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
