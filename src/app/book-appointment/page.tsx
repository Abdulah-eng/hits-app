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
import { Code, Calendar, Clock, DollarSign, User, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              H.I.T.S.
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600 dark:text-gray-400">
              Welcome, {user.email}
            </span>
            <Badge variant="outline">Client</Badge>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Book an Appointment
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
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
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  Select Specialist
                </CardTitle>
                <CardDescription>
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
                          <div className="p-2 text-sm text-gray-500">
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
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h3 className="font-semibold text-lg mb-2">{selectedSpecialist.users.name}</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        <strong>Credentials:</strong> {selectedSpecialist.credentials}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        <strong>Bio:</strong> {selectedSpecialist.bio}
                      </p>
                      <div className="mt-2">
                        <Badge variant="outline">
                          <DollarSign className="w-3 h-3 mr-1" />
                          ${selectedSpecialist.hourly_rate}/hour
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Date and Duration Selection */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-green-600" />
                  Schedule Details
                </CardTitle>
                <CardDescription>
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
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-purple-600" />
                    Available Time Slots
                  </CardTitle>
                  <CardDescription>
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
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Service Description</CardTitle>
                <CardDescription>
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
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-green-600" />
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
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/client')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !selectedSpecialist || !selectedDate || !selectedDuration || !selectedTimeSlot || !description}
                className="min-w-[120px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
