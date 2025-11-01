'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { Code, CheckCircle, AlertCircle, Loader2, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

function CallbackContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const code = searchParams.get('code')
        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')

        if (error) {
          setStatus('error')
          setMessage(errorDescription || 'Authentication failed')
          return
        }

        if (code) {
          // Handle email verification or password reset
          setStatus('success')
          setMessage('Email verified successfully! You can now sign in.')
          
          // Redirect to sign-in after a delay
          setTimeout(() => {
            router.push('/auth/sign-in')
          }, 3000)
        } else {
          // No code parameter, might be a direct visit
          if (user) {
            setStatus('success')
            setMessage('You are already signed in!')
            setTimeout(() => {
              router.push('/dashboard')
            }, 2000)
          } else {
            setStatus('error')
            setMessage('Invalid authentication link')
          }
        }
      } catch (err) {
        setStatus('error')
        setMessage('An unexpected error occurred')
      }
    }

    handleAuthCallback()
  }, [searchParams, user, router])

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-16 h-16 text-[var(--primary)] animate-spin" />
      case 'success':
        return (
          <div className="relative">
            <div className="absolute inset-0 bg-[var(--accent)]/20 rounded-full animate-ping" />
            <CheckCircle className="w-16 h-16 text-[var(--accent)] relative" />
          </div>
        )
      case 'error':
        return <AlertCircle className="w-16 h-16 text-[var(--destructive)]" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--secondary)] to-[var(--background)] relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--primary)]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--accent)]/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30" />
      </div>

      <div className="min-h-screen flex items-center justify-center p-4">
        <div className={`w-full max-w-md transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center justify-center space-x-3 mb-6 group">
              <div className="w-12 h-12 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                <Code className="w-7 h-7 text-white" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
                H.I.T.S.
              </span>
            </Link>
          </div>

          <Card className="border-0 shadow-2xl backdrop-blur-xl bg-white/80 dark:bg-[var(--card)]/80">
            <CardHeader className="text-center space-y-2">
              <CardTitle className="text-2xl">Authentication</CardTitle>
              <CardDescription className="text-base">
                Processing your authentication request
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-8">
              {/* Status Icon */}
              <div className="flex justify-center py-4">
                {getStatusIcon()}
              </div>

              {/* Status Message */}
              <div className={`text-xl font-bold ${
                status === 'loading' ? 'text-[var(--primary)]' :
                status === 'success' ? 'text-[var(--accent)]' :
                'text-[var(--destructive)]'
              }`}>
                {status === 'loading' && 'Verifying your email...'}
                {status === 'success' && 'Success!'}
                {status === 'error' && 'Authentication Error'}
              </div>

              <p className="text-[var(--foreground)]/80 dark:text-[var(--foreground)]/70 text-base leading-relaxed">
                {message}
              </p>

              {/* Action Buttons */}
              {status === 'success' && (
                <div className="space-y-3 pt-4">
                  <Button 
                    onClick={() => router.push('/auth/sign-in')}
                    className="w-full h-12 text-lg bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group"
                  >
                    Go to Sign In
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => router.push('/')}
                    className="w-full h-12 text-lg border-2 hover:bg-[var(--primary)]/10 hover:border-[var(--primary)] transition-all duration-300"
                  >
                    Back to Home
                  </Button>
                </div>
              )}

              {status === 'error' && (
                <div className="space-y-3 pt-4">
                  <Button 
                    onClick={() => router.push('/auth/sign-in')}
                    className="w-full h-12 text-lg bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group"
                  >
                    Try Signing In
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => router.push('/auth/sign-up')}
                    className="w-full h-12 text-lg border-2 hover:bg-[var(--primary)]/10 hover:border-[var(--primary)] transition-all duration-300"
                  >
                    Create Account
                  </Button>
                  <Button 
                    variant="ghost"
                    onClick={() => router.push('/')}
                    className="w-full h-12 text-lg hover:bg-[var(--primary)]/10 transition-all duration-300"
                  >
                    Back to Home
                  </Button>
                </div>
              )}

              {status === 'loading' && (
                <div className="flex items-center justify-center gap-2 text-sm text-[var(--foreground)]/70 pt-4">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  <span>Please wait while we verify your email...</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Help Text */}
          <div className="mt-6 text-center text-sm text-[var(--foreground)]/70">
            <p>
              Having trouble?{' '}
              <a href="mailto:support@hits-app.com" className="text-[var(--primary)] hover:opacity-80 font-medium transition-opacity">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
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
    }>
      <CallbackContent />
    </Suspense>
  )
}
