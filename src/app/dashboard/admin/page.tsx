'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Code, Users, Shield, DollarSign, AlertTriangle, CheckCircle, XCircle, Eye, AlertCircle, MessageSquare, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface Specialist {
  id: string
  user_id: string
  verified: boolean
  credentials: string
  hourly_rate: number
  bio: string
  user_name?: string
  user_email?: string
}

interface Dispute {
  id: string
  appointment_id: string
  raised_by: string
  reason: string
  status: 'open' | 'resolved'
  created_at: string
  client_name?: string
  specialist_name?: string
}

interface Transaction {
  id: string
  appointment_id: string
  amount: number
  status: 'pending' | 'paid' | 'refunded'
  method: string
  created_at: string
  client_name?: string
  specialist_name?: string
}

interface Review {
  id: string
  appointment_id: string
  reviewer_id: string
  rating: number
  comment: string
  created_at: string
  reviewer_name?: string
}

export default function AdminDashboard() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [specialists, setSpecialists] = useState<Specialist[]>([])
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [dashboardLoading, setDashboardLoading] = useState(true)
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false)
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null)
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [resolvingDispute, setResolvingDispute] = useState(false)

  useEffect(() => {
    setDashboardLoading(true);
    const fetchAllData = async () => {
      // Specialists with user info
      const { data: specialistRows, error: specialistError } = await supabase
        .from('specialists')
        .select(`id, user_id, verified, credentials, hourly_rate, bio, users (name, email)`);
      let specialists: Specialist[] = [];
      if (specialistRows) {
        specialists = specialistRows.map((s: any) => ({
          id: s.id,
          user_id: s.user_id,
          verified: s.verified,
          credentials: s.credentials,
          hourly_rate: s.hourly_rate,
          bio: s.bio,
          user_name: s.users?.name || '',
          user_email: s.users?.email || ''
        }));
      }
      // ---
      // Disputes: only fetch one level join
      let disputes: Dispute[] = [];
      const { data: disputeRows, error: disputeError } = await supabase
        .from('disputes')
        .select('id, appointment_id, raised_by, reason, status, created_at, appointments(id, client_id, specialist_id)');
      let userIdSet = new Set<string>();
      if (disputeRows) {
        disputeRows.forEach((d: any) => {
          if (d.appointments?.client_id) userIdSet.add(d.appointments.client_id);
          if (d.appointments?.specialist_id) userIdSet.add(d.appointments.specialist_id);
        });
        const userIds = Array.from(userIdSet);
        let userMap: {[id:string]: string} = {};
        if (userIds.length > 0) {
          const { data: userRows } = await supabase.from('users').select('id, name').in('id', userIds);
          if (userRows) {
            userRows.forEach((u: any) => {
              userMap[u.id] = u.name;
            });
          }
        }
        disputes = disputeRows.map((d: any) => ({
          id: d.id,
          appointment_id: d.appointment_id,
          raised_by: d.raised_by,
          reason: d.reason,
          status: d.status,
          created_at: d.created_at,
          client_name: (d.appointments && userMap[d.appointments.client_id]) || '',
          specialist_name: (d.appointments && userMap[d.appointments.specialist_id]) || ''
        }));
      }
      // ---
      // Payments/transactions (as before)
      const { data: transactionRows, error: transactionError } = await supabase
        .from('payments')
        .select(`id, appointment_id, amount, status, method, created_at, appointments (users (name), specialists (users (name)))`);
      let transactions: Transaction[] = [];
      if (transactionRows) {
        transactions = transactionRows.map((t: any) => ({
          id: t.id,
          appointment_id: t.appointment_id,
          amount: t.amount,
          status: t.status,
          method: t.method,
          created_at: t.created_at,
          client_name: t.appointments?.users?.name || '',
          specialist_name: t.appointments?.specialists?.[0]?.users?.name || ''
        }));
      }
      // ---
      // Reviews with reviewer name (same as before, safe join)
      let reviews: Review[] = [];
      const { data: reviewRows, error: reviewError } = await supabase
        .from('reviews')
        .select(`id, appointment_id, reviewer_id, rating, comment, created_at, appointments!inner(users:users!appointments_client_id_fkey(name))`);
      if (reviewRows) {
        reviews = reviewRows.map((r: any) => ({
          id: r.id,
          appointment_id: r.appointment_id,
          reviewer_id: r.reviewer_id,
          rating: r.rating,
          comment: r.comment,
          created_at: r.created_at,
          reviewer_name: r.appointments?.users?.name || ''
        }));
      }
      // Fetch real total users
      const { data: usersList } = await supabase.from('users').select('id', { count: 'exact', head: false });
      setTotalUsers((usersList || []).length);
      setSpecialists(specialists);
      setDisputes(disputes);
      setTransactions(transactions);
      setReviews(reviews);
      setDashboardLoading(false);
    };
    fetchAllData();
  }, []);

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

  const handleResolveDispute = async () => {
    if (!selectedDispute || !resolutionNotes.trim()) return

    setResolvingDispute(true)
    try {
      const response = await fetch(`/api/disputes/${selectedDispute.id}/resolve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resolution_notes: resolutionNotes
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Update local state
        setDisputes(disputes.map(d => 
          d.id === selectedDispute.id 
            ? { ...d, status: 'resolved' as const }
            : d
        ))
        setIsDisputeModalOpen(false)
        setResolutionNotes('')
        setSelectedDispute(null)
      } else {
        console.error('Failed to resolve dispute:', data.error)
      }
    } catch (error) {
      console.error('Error resolving dispute:', error)
    } finally {
      setResolvingDispute(false)
    }
  }

  const openDisputeModal = (dispute: Dispute) => {
    setSelectedDispute(dispute)
    setResolutionNotes('')
    setIsDisputeModalOpen(true)
  }

  const pendingSpecialists = specialists.filter(s => !s.verified)
  const openDisputes = disputes.filter(d => d.status === 'open')
  const totalRevenue = transactions
    .filter(t => t.status === 'paid')
    .reduce((sum, t) => sum + t.amount, 0)

  const handleApproveSpecialist = (specialistId: string) => {
    setSpecialists(specialists.map(s => 
      s.id === specialistId ? { ...s, verified: true } : s
    ))
  }

  const handleRejectSpecialist = (specialistId: string) => {
    setSpecialists(specialists.filter(s => s.id !== specialistId))
  }


  const handleDeleteReview = (reviewId: string) => {
    setReviews(reviews.filter(r => r.id !== reviewId))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      paid: 'default',
      refunded: 'destructive',
      open: 'destructive',
      resolved: 'default'
    } as const

    const colors = {
      pending: 'text-yellow-600',
      paid: 'text-green-600',
      refunded: 'text-red-600',
      open: 'text-red-600',
      resolved: 'text-green-600'
    }

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        <span className={colors[status as keyof typeof colors]}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading admin dashboard...</p>
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
              Welcome, {user?.email}
            </span>
            <Badge variant="outline">Admin</Badge>
            <button onClick={() => router.push('/dashboard/admin/settings')} className="text-blue-600 hover:underline">Settings</button>
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
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage specialists, resolve disputes, and monitor platform activity
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Approvals</p>
                    <p className="text-2xl font-bold text-yellow-600">{pendingSpecialists.length}</p>
                  </div>
                  <Shield className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Open Disputes</p>
                    <p className="text-2xl font-bold text-red-600">{openDisputes.length}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-600">${totalRevenue}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                    <p className="text-2xl font-bold text-blue-600">{totalUsers}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Specialist Approvals */}
          <Card className="border-0 shadow-lg mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2 text-yellow-600" />
                Specialist Approvals
              </CardTitle>
              <CardDescription>
                Review and approve specialist applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingSpecialists.length === 0 ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    No pending specialist approvals at this time.
                  </AlertDescription>
                </Alert>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Credentials</TableHead>
                      <TableHead>Hourly Rate</TableHead>
                      <TableHead>Bio</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingSpecialists.map((specialist) => (
                      <TableRow key={specialist.id}>
                        <TableCell className="font-medium">
                          {specialist.user_name}
                        </TableCell>
                        <TableCell>{specialist.user_email}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {specialist.credentials}
                        </TableCell>
                        <TableCell>${specialist.hourly_rate}/hr</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {specialist.bio}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleApproveSpecialist(specialist.id)}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRejectSpecialist(specialist.id)}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
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

          {/* Disputes */}
          <Card className="border-0 shadow-lg mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                Disputes & Transactions
              </CardTitle>
              <CardDescription>
                Manage disputes and monitor transaction activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Disputes */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Open Disputes</h3>
                  {openDisputes.length === 0 ? (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        No open disputes at this time.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Client</TableHead>
                          <TableHead>Specialist</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {openDisputes.map((dispute) => (
                          <TableRow key={dispute.id}>
                            <TableCell className="font-medium">
                              {dispute.client_name}
                            </TableCell>
                            <TableCell>{dispute.specialist_name}</TableCell>
                            <TableCell className="max-w-xs truncate">
                              {dispute.reason}
                            </TableCell>
                            <TableCell>{formatDate(dispute.created_at)}</TableCell>
                            <TableCell>{getStatusBadge(dispute.status)}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  onClick={() => openDisputeModal(dispute)}
                                >
                                  <MessageSquare className="w-4 h-4 mr-1" />
                                  Resolve
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>

                {/* Transactions */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Specialist</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">
                            {transaction.client_name}
                          </TableCell>
                          <TableCell>{transaction.specialist_name}</TableCell>
                          <TableCell>${transaction.amount}</TableCell>
                          <TableCell>{transaction.method}</TableCell>
                          <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                          <TableCell>{formatDate(transaction.created_at)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Management & Reviews */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                User Management & Reviews
              </CardTitle>
              <CardDescription>
                Manage users and moderate reviews
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Reviews */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Recent Reviews</h3>
                  {reviews.length === 0 ? (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        No reviews to moderate at this time.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Reviewer</TableHead>
                          <TableHead>Rating</TableHead>
                          <TableHead>Comment</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reviews.map((review) => (
                          <TableRow key={review.id}>
                            <TableCell className="font-medium">
                              {review.reviewer_name}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <span
                                    key={i}
                                    className={`text-sm ${
                                      i < review.rating ? 'text-yellow-500' : 'text-gray-300'
                                    }`}
                                  >
                                    ★
                                  </span>
                                ))}
                                <span className="ml-1">({review.rating}/5)</span>
                              </div>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {review.comment}
                            </TableCell>
                            <TableCell>{formatDate(review.created_at)}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteReview(review.id)}
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Dispute Resolution Modal */}
      <Dialog open={isDisputeModalOpen} onOpenChange={setIsDisputeModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Resolve Dispute</DialogTitle>
            <CardDescription>
              Provide resolution details for the dispute between {selectedDispute?.client_name} and {selectedDispute?.specialist_name}
            </CardDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">Dispute Reason</Label>
              <div className="p-3 bg-gray-50 rounded-md text-sm">
                {selectedDispute?.reason}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="resolution">Resolution Notes</Label>
              <Textarea
                id="resolution"
                placeholder="Describe how you resolved this dispute..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDisputeModalOpen(false)}
              disabled={resolvingDispute}
            >
              Cancel
            </Button>
            <Button
              onClick={handleResolveDispute}
              disabled={resolvingDispute || !resolutionNotes.trim()}
            >
              {resolvingDispute ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Resolving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Resolve Dispute
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
