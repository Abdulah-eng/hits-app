'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Code, Calendar, Star, Clock, DollarSign, AlertCircle, CheckCircle, Loader2, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation';

interface Appointment {
  id: string
  specialist_id: string
  date: string
  start_time: string
  end_time: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  total_cost: number
  description: string
  specialist_name?: string
}

interface Review {
  id: string
  appointment_id: string
  rating: number
  comment: string
  created_at: string
}

export default function ClientDashboard() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [dashboardLoading, setDashboardLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/sign-in');
    }
  }, [user, loading, router]);

  const fetchData = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch appointments
      const { data: appointmentsData } = await supabase
        .from('appointments')
        .select('*')
        .eq('client_id', user.id)
        .order('date', { ascending: false })

      if (appointmentsData) {
        // Fetch specialist names for appointments
        const appointmentsWithNames = await Promise.all(
          appointmentsData.map(async (apt: any) => {
            const { data: specialistData } = await supabase
              .from('users')
              .select('name')
              .eq('id', apt.specialist_id)
              .single()

            return {
              ...apt,
              specialist_name: specialistData?.name || 'Specialist'
            }
          })
        )
        setAppointments(appointmentsWithNames)
      }

      // Fetch reviews
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('*')
        .eq('reviewer_id', user.id)
        .order('created_at', { ascending: false })

      if (reviewsData) {
        setReviews(reviewsData)
      }

      setDashboardLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setDashboardLoading(false)
    }
  }

  useEffect(() => {
    // Check for payment success/cancel parameters
    const urlParams = new URLSearchParams(window.location.search)
    const paymentStatus = urlParams.get('payment')
    const appointmentId = urlParams.get('appointment_id')

    if (paymentStatus === 'success' && appointmentId) {
      setSuccess('Payment successful! Your appointment has been confirmed.')
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname)
    } else if (paymentStatus === 'cancelled') {
      setError('Payment was cancelled. Your appointment was not booked.')
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname)
    }

    fetchData()
  }, [])

  const handleReviewSubmit = async () => {
    if (!selectedAppointment) return

    setSubmittingReview(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Unauthorized')
        return
      }

      const { error } = await supabase
        .from('reviews')
        .insert({
          appointment_id: selectedAppointment.id,
          reviewer_id: user.id,
          rating: reviewRating,
          comment: reviewComment || null
        })

      if (!error) {
        setSuccess('Review submitted successfully!')
        setIsReviewModalOpen(false)
        setReviewRating(5)
        setReviewComment('')
        setSelectedAppointment(null)
        // Refresh data
        fetchData()
      } else {
        setError(error.message || 'Failed to submit review')
      }
    } catch (error) {
      setError('Failed to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

  const openReviewModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setReviewRating(5)
    setReviewComment('')
    setIsReviewModalOpen(true)
  }

  const upcomingAppointments = appointments.filter(apt => 
    apt.status === 'confirmed' || apt.status === 'pending'
  )

  const pastAppointments = appointments.filter(apt => 
    apt.status === 'completed' || apt.status === 'cancelled'
  )

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      confirmed: 'default',
      completed: 'default',
      cancelled: 'destructive'
    } as const

    const colors = {
      pending: 'text-yellow-600',
      confirmed: 'text-green-600',
      completed: 'text-blue-600',
      cancelled: 'text-red-600'
    }

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        <span className={colors[status as keyof typeof colors]}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  if (loading || !user || dashboardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">Loading...</div>
    );
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
              Welcome, {user?.email}
            </span>
            <Badge variant="outline">Client</Badge>
            <button onClick={() => router.push('/dashboard/client/settings')} className="text-blue-600 hover:underline">Settings</button>
            <button
              onClick={signOut}
              className="text-red-600 border border-red-400 px-3 py-1 rounded hover:bg-red-100 transition"
            >
              Sign Out
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Client Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage your appointments and track your IT specialist bookings
            </p>
          </div>

          {/* Payment Status Messages */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Quick Actions */}
          <div className="mb-8">
            <Button size="lg" className="text-lg px-8" asChild>
              <Link href="/book-appointment">
                <Calendar className="w-5 h-5 mr-2" />
                Book New Appointment
              </Link>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Upcoming</p>
                    <p className="text-2xl font-bold text-blue-600">{upcomingAppointments.length}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{pastAppointments.filter(apt => apt.status === 'completed').length}</p>
                  </div>
                  <Star className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Spent</p>
                    <p className="text-2xl font-bold text-purple-600">
                      ${pastAppointments.reduce((sum, apt) => sum + apt.total_cost, 0)}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Appointments */}
          <Card className="border-0 shadow-lg mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-600" />
                Upcoming Appointments
              </CardTitle>
              <CardDescription>
                Your scheduled appointments with IT specialists
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No upcoming appointments. Book your first appointment to get started!
                  </AlertDescription>
                </Alert>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Specialist</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcomingAppointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell className="font-medium">
                          {appointment.specialist_name}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div>{formatDate(appointment.date)}</div>
                            <div className="text-sm text-gray-500">
                              {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{appointment.description}</TableCell>
                        <TableCell>${appointment.total_cost}</TableCell>
                        <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Past Bookings and Reviews */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-600" />
                Past Bookings & Reviews
              </CardTitle>
              <CardDescription>
                Your completed appointments and ratings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pastAppointments.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No past appointments yet. Complete your first appointment to see it here!
                  </AlertDescription>
                </Alert>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Specialist</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pastAppointments.map((appointment) => {
                      const review = reviews.find(r => r.appointment_id === appointment.id)
                      return (
                        <TableRow key={appointment.id}>
                          <TableCell className="font-medium">
                            {appointment.specialist_name}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div>{formatDate(appointment.date)}</div>
                              <div className="text-sm text-gray-500">
                                {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{appointment.description}</TableCell>
                          <TableCell>${appointment.total_cost}</TableCell>
                          <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                          <TableCell>
                            {review ? (
                              <div className="flex items-center">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                <span className="ml-1">{review.rating}/5</span>
                              </div>
                            ) : appointment.status === 'completed' ? (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => openReviewModal(appointment)}
                              >
                                <Star className="w-4 h-4 mr-1" />
                                Rate & Review
                              </Button>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Review Modal */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rate & Review Specialist</DialogTitle>
            <CardDescription>
              Share your experience with {selectedAppointment?.specialist_name}
            </CardDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="rating">Rating</Label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className={`p-1 ${
                      star <= reviewRating
                        ? 'text-yellow-500'
                        : 'text-gray-300'
                    }`}
                  >
                    <Star className="w-6 h-6 fill-current" />
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  {reviewRating}/5 stars
                </span>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="comment">Comment (Optional)</Label>
              <Textarea
                id="comment"
                placeholder="Share your experience with this specialist..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsReviewModalOpen(false)}
              disabled={submittingReview}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReviewSubmit}
              disabled={submittingReview}
            >
              {submittingReview ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Star className="w-4 h-4 mr-2" />
                  Submit Review
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
