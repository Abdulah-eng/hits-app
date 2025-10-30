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

// GET /api/specialists - Get verified specialists with availability
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    // Get verified specialists with their user info
    const { data: specialists, error: specialistsError } = await supabase
      .from('specialists')
      .select(`
        id,
        user_id,
        verified,
        credentials,
        hourly_rate,
        bio,
        users!inner(
          id,
          name,
          email
        )
      `)
      .eq('verified', true)

    if (specialistsError) {
      return NextResponse.json(
        { error: 'Failed to fetch specialists' },
        { status: 500 }
      )
    }

    // If date is provided, get availability for that specific day
    if (date) {
      const appointmentDate = new Date(date)
      const dayOfWeek = appointmentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
      
      // Get availability for the specified day
      const { data: availability, error: availabilityError } = await supabase
        .from('availability')
        .select(`
          specialist_id,
          day,
          start_time,
          end_time,
          is_active
        `)
        .eq('day', dayOfWeek)
        .eq('is_active', true)

      if (availabilityError) {
        return NextResponse.json(
          { error: 'Failed to fetch availability' },
          { status: 500 }
        )
      }

      // Get existing appointments for the date to check conflicts
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          specialist_id,
          start_time,
          end_time,
          status
        `)
        .eq('date', date)
        .in('status', ['pending', 'confirmed'])

      if (appointmentsError) {
        return NextResponse.json(
          { error: 'Failed to fetch appointments' },
          { status: 500 }
        )
      }

      // Filter specialists who have availability on the requested day
      const availableSpecialists = specialists.filter(specialist => {
        const specialistAvailability = availability.find(a => a.specialist_id === specialist.user_id)
        return specialistAvailability
      }).map(specialist => {
        const specialistAvailability = availability.find(a => a.specialist_id === specialist.user_id)!
        const specialistAppointments = appointments.filter(a => a.specialist_id === specialist.user_id)
        
        return {
          ...specialist,
          availability: specialistAvailability,
          existing_appointments: specialistAppointments
        }
      })

      return NextResponse.json({
        success: true,
        specialists: availableSpecialists,
        requested_date: date,
        day_of_week: dayOfWeek
      })
    }

    // Return all verified specialists without specific availability
    return NextResponse.json({
      success: true,
      specialists: specialists.map(specialist => ({
        ...specialist,
        availability: null,
        existing_appointments: []
      }))
    })

  } catch (error) {
    console.error('Get specialists error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
