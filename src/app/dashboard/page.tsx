'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      const userRole = user.user_metadata?.role || 'client'
      router.replace(`/dashboard/${userRole}`)
    } else if (!loading && !user) {
      router.replace('/auth/sign-in')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--secondary)] to-[var(--background)] dark:from-[var(--background)] dark:to-[var(--card)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[var(--primary)] animate-spin mx-auto mb-4" />
          <p className="text-[var(--foreground)]/80 dark:text-[var(--foreground)]/70">Redirecting to your dashboard...</p>
        </div>
      </div>
    )
  }

  return null
}