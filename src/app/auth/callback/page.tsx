'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { Code, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

function CallbackContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()

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
        return <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      case 'success':
        return <CheckCircle className="w-12 h-12 text-green-600" />
      case 'error':
        return <AlertCircle className="w-12 h-12 text-red-600" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'text-blue-600'
      case 'success':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              H.I.T.S.
            </span>
          </div>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Authentication</CardTitle>
            <CardDescription>
              Processing your authentication request
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            {/* Status Icon */}
            <div className="flex justify-center">
              {getStatusIcon()}
            </div>

            {/* Status Message */}
            <div className={`text-lg font-medium ${getStatusColor()}`}>
              {status === 'loading' && 'Verifying your email...'}
              {status === 'success' && 'Success!'}
              {status === 'error' && 'Error'}
            </div>

            <p className="text-gray-600 dark:text-gray-400">
              {message}
            </p>

            {/* Action Buttons */}
            {status === 'success' && (
              <div className="space-y-3">
                <Button 
                  onClick={() => router.push('/auth/sign-in')}
                  className="w-full"
                >
                  Go to Sign In
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/')}
                  className="w-full"
                >
                  Back to Home
                </Button>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-3">
                <Button 
                  onClick={() => router.push('/auth/sign-in')}
                  className="w-full"
                >
                  Try Signing In
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/auth/sign-up')}
                  className="w-full"
                >
                  Create Account
                </Button>
                <Button 
                  variant="ghost"
                  onClick={() => router.push('/')}
                  className="w-full"
                >
                  Back to Home
                </Button>
              </div>
            )}

            {status === 'loading' && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Please wait while we verify your email...
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Having trouble?{' '}
            <a href="mailto:support@hits-app.com" className="text-blue-600 hover:text-blue-500">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  )
}
