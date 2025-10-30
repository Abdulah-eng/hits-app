'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Code, Calendar, Clock, DollarSign, Plus, Edit, Trash2, AlertCircle, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation';

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface Availability {
  id: string
  day: string
  start_time: string
  end_time: string
  is_active: boolean
}

interface Appointment {
  id: string
  client_id: string
  date: string
  start_time: string
  end_time: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  total_cost: number
  description: string
  client_name?: string
}

export default function SpecialistDashboard() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [availability, setAvailability] = useState<Availability[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [dashboardLoading, setDashboardLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingAvailability, setEditingAvailability] = useState<Availability | null>(null)
  const [newAvailability, setNewAvailability] = useState({
    day: '',
    start_time: '',
    end_time: ''
  })

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

  const fetchData = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch availability
      const { data: availabilityData, error: availabilityError } = await supabase
        .from('availability')
        .select('*')
        .eq('specialist_id', user.id)
        .order('day', { ascending: true })

      if (availabilityData) {
        setAvailability(availabilityData)
      }

      // Fetch appointments
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('specialist_id', user.id)
        .order('date', { ascending: false })

      if (appointmentsData) {
        // Fetch client names for appointments
        const appointmentsWithNames = await Promise.all(
          appointmentsData.map(async (apt: any) => {
            const { data: clientData } = await supabase
              .from('users')
              .select('name')
              .eq('id', apt.client_id)
              .single()

            return {
              ...apt,
              client_name: clientData?.name || 'Client'
            }
          })
        )
        setAppointments(appointmentsWithNames)
      }

      setDashboardLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setDashboardLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/sign-in');
    }
  }, [user, loading, router]);

  if (loading || !user || dashboardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">Loading...</div>
    );
  }

  const totalEarnings = appointments
    .filter(apt => apt.status === 'completed')
    .reduce((sum, apt) => sum + apt.total_cost, 0)

  const pendingAppointments = appointments.filter(apt => apt.status === 'pending')
  const upcomingAppointments = appointments.filter(apt => 
    apt.status === 'confirmed' || apt.status === 'pending'
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

  const formatDay = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1)
  }

  const handleAddAvailability = async () => {
    if (newAvailability.day && newAvailability.start_time && newAvailability.end_time) {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { error } = await supabase
          .from('availability')
          .insert({
            specialist_id: user.id,
            day: newAvailability.day,
            start_time: newAvailability.start_time,
            end_time: newAvailability.end_time,
            is_active: true
          })

        if (!error) {
          fetchData() // Refresh data
          setNewAvailability({ day: '', start_time: '', end_time: '' })
          setIsAddDialogOpen(false)
        }
      } catch (error) {
        console.error('Error adding availability:', error)
      }
    }
  }

  const handleEditAvailability = (item: Availability) => {
    setEditingAvailability(item)
    setIsEditDialogOpen(true)
  }

  const handleSaveEditAvailability = async () => {
    if (editingAvailability) {
      try {
        const { error } = await supabase
          .from('availability')
          .update({
            day: editingAvailability.day,
            start_time: editingAvailability.start_time,
            end_time: editingAvailability.end_time,
            is_active: editingAvailability.is_active
          })
          .eq('id', editingAvailability.id)

        if (!error) {
          fetchData() // Refresh data
          setIsEditDialogOpen(false)
          setEditingAvailability(null)
        }
      } catch (error) {
        console.error('Error updating availability:', error)
      }
    }
  }

  const handleDeleteAvailability = async (id: string) => {
    if (confirm('Are you sure you want to delete this availability slot?')) {
      try {
        const { error } = await supabase
          .from('availability')
          .delete()
          .eq('id', id)

        if (!error) {
          fetchData() // Refresh data
        }
      } catch (error) {
        console.error('Error deleting availability:', error)
      }
    }
  }

  const toggleAvailabilityStatus = async (id: string) => {
    const item = availability.find(a => a.id === id)
    if (item) {
      try {
        const { error } = await supabase
          .from('availability')
          .update({ is_active: !item.is_active })
          .eq('id', item.id)

        if (!error) {
          fetchData() // Refresh data
        }
      } catch (error) {
        console.error('Error toggling availability:', error)
      }
    }
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
            <Badge variant="outline">Specialist</Badge>
            <button onClick={() => router.push('/dashboard/specialist/settings')} className="text-blue-600 hover:underline">Settings</button>
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
              Specialist Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage your availability, view bookings, and track your earnings
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Earnings</p>
                    <p className="text-2xl font-bold text-green-600">${totalEarnings}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{pendingAppointments.length}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

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
                    <p className="text-2xl font-bold text-purple-600">
                      {appointments.filter(apt => apt.status === 'completed').length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Availability Management */}
          <Card className="border-0 shadow-lg mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-purple-600" />
                    Manage Availability
                  </CardTitle>
                  <CardDescription>
                    Set your available time slots for client bookings
                  </CardDescription>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Availability
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Availability</DialogTitle>
                      <DialogDescription>
                        Set your available time slot for a specific day
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="day">Day</Label>
                        <Select value={newAvailability.day} onValueChange={(value) => 
                          setNewAvailability({ ...newAvailability, day: value })
                        }>
                          <SelectTrigger>
                            <SelectValue placeholder="Select day" />
                          </SelectTrigger>
                          <SelectContent>
                            {days.map(day => (
                              <SelectItem key={day} value={day}>
                                {formatDay(day)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="start_time">Start Time</Label>
                        <Input
                          id="start_time"
                          type="time"
                          value={newAvailability.start_time}
                          onChange={(e) => setNewAvailability({ 
                            ...newAvailability, 
                            start_time: e.target.value 
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="end_time">End Time</Label>
                        <Input
                          id="end_time"
                          type="time"
                          value={newAvailability.end_time}
                          onChange={(e) => setNewAvailability({ 
                            ...newAvailability, 
                            end_time: e.target.value 
                          })}
                        />
                      </div>
                      <Button onClick={handleAddAvailability} className="w-full">
                        Add Availability
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {availability.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No availability set. Add your available time slots to start receiving bookings!
                  </AlertDescription>
                </Alert>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Day</TableHead>
                      <TableHead>Start Time</TableHead>
                      <TableHead>End Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {availability.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {formatDay(item.day)}
                        </TableCell>
                        <TableCell>{formatTime(item.start_time)}</TableCell>
                        <TableCell>{formatTime(item.end_time)}</TableCell>
                        <TableCell>
                          <Badge variant={item.is_active ? 'default' : 'secondary'}>
                            {item.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleAvailabilityStatus(item.id)}
                            >
                              {item.is_active ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditAvailability(item)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteAvailability(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Bookings */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                Your Bookings
              </CardTitle>
              <CardDescription>
                Manage your client appointments and bookings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {appointments.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No bookings yet. Set your availability to start receiving appointments!
                  </AlertDescription>
                </Alert>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell className="font-medium">
                          {appointment.client_name}
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
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                            {appointment.status === 'pending' && (
                              <Button size="sm">
                                Confirm
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Edit Availability Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Availability</DialogTitle>
            <DialogDescription>
              Update your available time slot
            </DialogDescription>
          </DialogHeader>
          {editingAvailability && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-day">Day</Label>
                <Select 
                  value={editingAvailability.day} 
                  onValueChange={(value) => 
                    setEditingAvailability({ ...editingAvailability, day: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map(day => (
                      <SelectItem key={day} value={day}>
                        {formatDay(day)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-start_time">Start Time</Label>
                <Input
                  id="edit-start_time"
                  type="time"
                  value={editingAvailability.start_time}
                  onChange={(e) => setEditingAvailability({ 
                    ...editingAvailability, 
                    start_time: e.target.value 
                  })}
                />
              </div>
              <div>
                <Label htmlFor="edit-end_time">End Time</Label>
                <Input
                  id="edit-end_time"
                  type="time"
                  value={editingAvailability.end_time}
                  onChange={(e) => setEditingAvailability({ 
                    ...editingAvailability, 
                    end_time: e.target.value 
                  })}
                />
              </div>
              <Button onClick={handleSaveEditAvailability} className="w-full">
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
