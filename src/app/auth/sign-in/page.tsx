'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { Code, Mail, Lock, AlertCircle, CheckCircle, ArrowRight, Sparkles } from 'lucide-react'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [magicLinkLoading, setMagicLinkLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showMagicLinkSuccess, setShowMagicLinkSuccess] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  const { signIn, signInWithMagicLink } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const { error } = await signIn(email, password)
      
      if (error) {
        setError(error.message)
      } else {
        setSuccess('Signed in successfully!')
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLinkSignIn = async () => {
    setError('')
    setSuccess('')
    setMagicLinkLoading(true)

    try {
      const { error } = await signInWithMagicLink(email)
      
      if (error) {
        setError(error.message)
      } else {
        setShowMagicLinkSuccess(true)
        setSuccess('Magic link sent! Check your email.')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setMagicLinkLoading(false)
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
            <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-lg text-[var(--foreground)]/70">
              Sign in to your H.I.T.S. account
            </p>
          </div>

          <Card className="border-0 shadow-2xl backdrop-blur-xl bg-white/80 dark:bg-[var(--card)]/80">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl">Sign In</CardTitle>
              <CardDescription className="text-base">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEmailSignIn} className="space-y-6">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-medium">Email Address</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--muted-foreground)] w-5 h-5 group-focus-within:text-[var(--primary)] transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="h-12 pl-10 border-2 focus:border-[var(--primary)] transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-base font-medium">Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--muted-foreground)] w-5 h-5 group-focus-within:text-[var(--primary)] transition-colors" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="h-12 pl-10 border-2 focus:border-[var(--primary)] transition-all"
                    />
                  </div>
                </div>

                {/* Forgot Password */}
                <div className="text-right">
                  <Link href="/auth/forgot-password" className="text-sm text-[var(--primary)] hover:opacity-80 transition-opacity font-medium">
                    Forgot your password?
                  </Link>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-center space-x-2 text-[var(--destructive)] bg-[var(--destructive)]/10 dark:bg-[var(--destructive)]/20 p-4 rounded-lg border border-[var(--destructive)]/20">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="flex items-center space-x-2 text-[var(--accent)] bg-[var(--accent)]/10 dark:bg-[var(--accent)]/20 p-4 rounded-lg border border-[var(--accent)]/20">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{success}</span>
                  </div>
                )}

                {/* Sign In Button */}
                <Button
                  type="submit"
                  className="w-full h-12 text-lg bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group"
                  disabled={loading}
                >
                  {loading ? 'Signing In...' : (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--border)]" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white dark:bg-[var(--card)] text-[var(--muted-foreground)]">Or</span>
                </div>
              </div>

              {/* Magic Link */}
              <div className="space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 text-lg border-2 hover:bg-[var(--primary)]/10 hover:border-[var(--primary)] hover:scale-[1.02] transition-all duration-300"
                  onClick={handleMagicLinkSignIn}
                  disabled={magicLinkLoading || !email}
                >
                  {magicLinkLoading ? (
                    <>
                      <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Send Magic Link
                    </>
                  )}
                </Button>
                
                {showMagicLinkSuccess && (
                  <div className="text-center text-sm text-[var(--foreground)]/80 dark:text-[var(--foreground)]/70 bg-[var(--accent)]/10 p-4 rounded-lg border border-[var(--accent)]/20">
                    <p className="font-medium mb-1">Check your email!</p>
                    <p>We've sent a magic link to <strong>{email}</strong></p>
                    <p className="mt-1">Click the link to sign in.</p>
                  </div>
                )}
              </div>

              {/* Sign Up Link */}
              <div className="mt-6 text-center pt-6 border-t border-[var(--border)]">
                <p className="text-[var(--foreground)]/70">
                  Don't have an account?{' '}
                  <Link href="/auth/sign-up" className="text-[var(--primary)] hover:opacity-80 font-semibold transition-opacity">
                    Sign up
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-[var(--foreground)]/60 hover:text-[var(--primary)] transition-colors inline-flex items-center gap-2">
              <ArrowRight className="w-4 h-4 rotate-180" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
