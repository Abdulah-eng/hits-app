'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { Code, Calendar, Clock, DollarSign, User, AlertCircle, CheckCircle, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface Specialist {
  id: string
  user_id: string
  verified: boolean
  credentials: string
  hourly_rate: number
  bio: string
  users: {
    id: string
    name: string
    email: string
  }
  availability?: {
    specialist_id: string
    day: string
    start_time: string
    end_time: string
    is_active: boolean
  }
  existing_appointments?: Array<{
    specialist_id: string
    start_time: string
    end_time: string
    status: string
  }>
}

interface TimeSlot {
  start: string
  end: string
  available: boolean
}

export default function BookAppointmentPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [specialists, setSpecialists] = useState<Specialist[]>([])
  const [selectedSpecialist, setSelectedSpecialist] = useState<Specialist | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedDuration, setSelectedDuration] = useState('')
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('')
  const [description, setDescription] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])

  const durations = [
    { value: '1', label: '1 hour' },
    { value: '2', label: '2 hours' },
    { value: '3', label: '3 hours' },
    { value: '4', label: '4 hours' },
    { value: '6', label: '6 hours' },
    { value: '8', label: '8 hours' }
  ]

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    if (!user) {
      router.push('/auth/sign-in')
      return
    }

    // Check if user is a client
    if (user.user_metadata?.role !== 'client') {
      router.push('/dashboard')
      return
    }

    fetchSpecialists()
  }, [user, router])

  const fetchSpecialists = async () => {
    try {
      // Fetch verified specialists from Supabase
      const { data: specialistsData, error: specialistsError } = await supabase
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
      
      console.log('Specialists fetch result:', { specialistsData, specialistsError })
      
      if (specialistsError) {
        console.error('Specialists error:', specialistsError)
        setError('Failed to load specialists')
        return
      }

      if (specialistsData && specialistsData.length > 0) {
        console.log('Setting specialists:', specialistsData)
        setSpecialists(specialistsData as any)
      } else {
        console.log('No verified specialists found')
        setError('No verified specialists available. Please contact support.')
      }
    } catch (err) {
      console.error('Error fetching specialists:', err)
      setError('Failed to load specialists')
    }
  }

  const fetchAvailability = async (specialistId: string, date: string) => {
    try {
      const appointmentDate = new Date(date)
      const dayOfWeek = appointmentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
      
      // Fetch availability for the specialist on this day
      const { data: availabilityData, error: availabilityError } = await supabase
        .from('availability')
        .select('*')
        .eq('specialist_id', specialistId)
        .eq('day', dayOfWeek)
        .eq('is_active', true)
        .single()

      if (availabilityError || !availabilityData) {
        setAvailableSlots([])
        setError('Specialist not available on this date')
        return
      }

      // Fetch existing appointments for the date
      const { data: appointmentsData } = await supabase
        .from('appointments')
        .select('start_time, end_time, status')
        .eq('specialist_id', specialistId)
        .eq('date', date)
        .in('status', ['pending', 'confirmed'])

      generateTimeSlots(availabilityData, appointmentsData || [])
    } catch (err) {
      console.error('Error fetching availability:', err)
      setError('Failed to fetch availability')
    }
  }

  const generateTimeSlots = (availability: any, existingAppointments: any[]) => {
    const slots: TimeSlot[] = []
    const startTime = new Date(`2000-01-01T${availability.start_time}`)
    const endTime = new Date(`2000-01-01T${availability.end_time}`)
    const duration = parseInt(selectedDuration) || 1
    
    // Generate hourly slots
    for (let time = new Date(startTime); time < endTime; time.setHours(time.getHours() + 1)) {
      const slotEnd = new Date(time)
      slotEnd.setHours(slotEnd.getHours() + duration)
      
      if (slotEnd <= endTime) {
        const startStr = time.toTimeString().slice(0, 5)
        const endStr = slotEnd.toTimeString().slice(0, 5)
        
        // Check for conflicts with existing appointments
        const hasConflict = existingAppointments.some(apt => {
          const aptStart = new Date(`2000-01-01T${apt.start_time}`)
          const aptEnd = new Date(`2000-01-01T${apt.end_time}`)
          return (time < aptEnd && slotEnd > aptStart)
        })
        
        slots.push({
          start: startStr,
          end: endStr,
          available: !hasConflict
        })
      }
    }
    
    setAvailableSlots(slots)
  }

  const handleSpecialistChange = (specialistId: string) => {
    const specialist = specialists.find(s => s.user_id === specialistId)
    setSelectedSpecialist(specialist || null)
    setSelectedTimeSlot('')
    setAvailableSlots([])
  }

  const handleDateChange = (date: string) => {
    setSelectedDate(date)
    setSelectedTimeSlot('')
    setAvailableSlots([])
    
    if (selectedSpecialist && date) {
      fetchAvailability(selectedSpecialist.user_id, date)
    }
  }

  const handleDurationChange = (duration: string) => {
    setSelectedDuration(duration)
    setSelectedTimeSlot('')
    
    if (selectedSpecialist && selectedDate) {
      fetchAvailability(selectedSpecialist.user_id, selectedDate)
    }
  }

  const calculateCost = () => {
    if (!selectedSpecialist || !selectedDuration) return 0
    const hourlyRate = selectedSpecialist.hourly_rate || 50
    return parseInt(selectedDuration) * hourlyRate
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (!selectedSpecialist || !selectedDate || !selectedDuration || !selectedTimeSlot || !description) {
      setError('Please fill in all required fields')
      setLoading(false)
      return
    }

    try {
      const [startTime, endTime] = selectedTimeSlot.split(' - ')
      
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          specialist_id: selectedSpecialist.user_id,
          date: selectedDate,
          start_time: startTime,
          end_time: endTime,
          description,
          client_phone: clientPhone || undefined
        }),
      })

      const data = await response.json()

      if (data.success && data.checkout_url) {
        // Redirect to Stripe Checkout
        window.location.href = data.checkout_url
      } else {
        setError(data.error || 'Failed to create payment session')
        setLoading(false)
      }
    } catch (err) {
      setError('Failed to process payment')
      setLoading(false)
    }
  }

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--secondary)] to-[var(--background)] flex items-center justify-center relative overflow-hidden">
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--primary)]/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--accent)]/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[var(--primary)] animate-spin mx-auto mb-4" />
          <p className="text-[var(--foreground)]/80 dark:text-[var(--foreground)]/70">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--secondary)] to-[var(--background)] relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--primary)]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--accent)]/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/90 dark:bg-[var(--card)]/90 shadow-lg border-b border-[var(--border)]/50">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard/client" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                <Code className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
                H.I.T.S.
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="hidden sm:block text-[var(--foreground)]/70 text-sm">
                {user.email}
              </span>
              <Badge className="bg-gradient-to-r from-[var(--primary)]/10 to-[var(--accent)]/10 text-[var(--primary)] border-[var(--primary)]/20">Client</Badge>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-10 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
              Book an Appointment
            </h1>
            <p className="text-lg text-[var(--foreground)]/70 max-w-2xl mx-auto">
              Select a specialist and schedule your IT consultation
            </p>
            {/* Debug info */}
            {process.env.NODE_ENV === 'development' && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Debug: {specialists.length} verified specialist(s) available
                </AlertDescription>
              </Alert>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Specialist Selection */}
            <Card className="border-0 shadow-xl backdrop-blur-xl bg-white/80 dark:bg-[var(--card)]/80 hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/80 flex items-center justify-center mr-3 shadow-lg">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  Select Specialist
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Choose from our verified IT specialists
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="specialist">Specialist</Label>
                    <Select onValueChange={handleSpecialistChange} disabled={specialists.length === 0}>
                      <SelectTrigger>
                        <SelectValue placeholder={specialists.length === 0 ? "No verified specialists available" : "Select a specialist"} />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {specialists.length === 0 ? (
                          <div className="p-2 text-sm text-[var(--foreground)]/60">
                            No specialists available. Please check back later.
                          </div>
                        ) : (
                          specialists.map((specialist) => (
                            <SelectItem key={specialist.user_id} value={specialist.user_id}>
                              {specialist.users.name} - ${specialist.hourly_rate}/hr
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedSpecialist && (
                    <div className="p-6 bg-gradient-to-br from-[var(--primary)]/10 via-[var(--accent)]/5 to-[var(--primary)]/10 rounded-xl border border-[var(--primary)]/20 shadow-lg">
                      <h3 className="font-bold text-xl mb-3 text-[var(--foreground)]">{selectedSpecialist.users.name}</h3>
                      <p className="text-[var(--foreground)]/80 mb-3 leading-relaxed">
                        <strong className="text-[var(--foreground)]">Credentials:</strong> {selectedSpecialist.credentials}
                      </p>
                      <p className="text-[var(--foreground)]/80 mb-4 leading-relaxed">
                        <strong className="text-[var(--foreground)]">Bio:</strong> {selectedSpecialist.bio}
                      </p>
                      <div className="mt-4">
                        <Badge className="bg-gradient-to-r from-[var(--primary)]/10 to-[var(--accent)]/10 text-[var(--primary)] border-[var(--primary)]/20 px-4 py-2">
                          <DollarSign className="w-4 h-4 mr-1" />
                          ${selectedSpecialist.hourly_rate}/hour
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Date and Duration Selection */}
            <Card className="border-0 shadow-xl backdrop-blur-xl bg-white/80 dark:bg-[var(--card)]/80 hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mr-3 shadow-lg">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  Schedule Details
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Choose your preferred date and duration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      min={today}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration</Label>
                    <Select onValueChange={handleDurationChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        {durations.map((duration) => (
                          <SelectItem key={duration.value} value={duration.value}>
                            {duration.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Time Slot Selection */}
            {availableSlots.length > 0 && (
              <Card className="border-0 shadow-xl backdrop-blur-xl bg-white/80 dark:bg-[var(--card)]/80 hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent)]/80 flex items-center justify-center mr-3 shadow-lg">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    Available Time Slots
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    Select your preferred time slot
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {availableSlots.map((slot, index) => (
                      <Button
                        key={index}
                        type="button"
                        variant={selectedTimeSlot === `${slot.start} - ${slot.end}` ? 'default' : 'outline'}
                        disabled={!slot.available}
                        onClick={() => setSelectedTimeSlot(`${slot.start} - ${slot.end}`)}
                        className="h-12"
                      >
                        <div className="text-center">
                          <div className="font-medium">
                            {formatTime(slot.start)} - {formatTime(slot.end)}
                          </div>
                          {!slot.available && (
                            <div className="text-xs text-red-500">Booked</div>
                          )}
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Service Description */}
            <Card className="border-0 shadow-xl backdrop-blur-xl bg-white/80 dark:bg-[var(--card)]/80 hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-xl">Service Description</CardTitle>
                <CardDescription className="text-base mt-2">
                  Describe what you need help with
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your IT needs, project requirements, or questions..."
                      rows={4}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number (Optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="For SMS notifications"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cost Summary */}
            {selectedSpecialist && selectedDuration && (
              <Card className="border-0 shadow-xl backdrop-blur-xl bg-gradient-to-br from-[var(--primary)]/10 via-[var(--accent)]/10 to-[var(--primary)]/10 border-2 border-[var(--primary)]/20">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mr-3 shadow-lg">
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    Cost Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>{selectedDuration} hour(s)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hourly Rate:</span>
                      <span>${selectedSpecialist.hourly_rate}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total Cost:</span>
                      <span>${calculateCost()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Error/Success Messages */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/client')}
                className="h-12 text-lg border-2 hover:bg-[var(--primary)]/10 hover:border-[var(--primary)] transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !selectedSpecialist || !selectedDate || !selectedDuration || !selectedTimeSlot || !description}
                className="min-w-[200px] h-12 text-lg bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] hover:shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Pay & Book Appointment'
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
