'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { Code, User, Briefcase, AlertCircle, CheckCircle, ArrowRight, Sparkles } from 'lucide-react'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<'client' | 'specialist'>('client')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [mounted, setMounted] = useState(false)
  
  const { signUp } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const { error } = await signUp(email, password, role)
      
      if (error) {
        setError(error.message)
      } else {
        setSuccess('Account created successfully! Please check your email to verify your account.')
        setTimeout(() => {
          router.push('/auth/sign-in')
        }, 2000)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
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
        <div className={`w-full max-w-2xl transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
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
              Create Account
            </h1>
            <p className="text-lg text-[var(--foreground)]/70">
              Join H.I.T.S. to connect with IT specialists
            </p>
          </div>

          <Card className="border-0 shadow-2xl backdrop-blur-xl bg-white/80 dark:bg-[var(--card)]/80">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl">Sign Up</CardTitle>
              <CardDescription className="text-base">
                Choose your role and create your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Role Selection */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">I want to:</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setRole('client')}
                      className={`p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 group ${
                        role === 'client'
                          ? 'border-[var(--primary)] bg-gradient-to-br from-[var(--primary)]/10 to-[var(--primary)]/5 shadow-lg'
                          : 'border-[var(--border)] hover:border-[var(--primary)]/50 hover:bg-[var(--primary)]/5'
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          role === 'client' 
                            ? 'bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/80 shadow-lg scale-110' 
                            : 'bg-[var(--primary)]/10 group-hover:bg-[var(--primary)]/20'
                        }`}>
                          <User className={`w-6 h-6 ${role === 'client' ? 'text-white' : 'text-[var(--primary)]'}`} />
                        </div>
                        <span className="font-semibold text-base">Hire Specialists</span>
                        <span className="text-sm text-[var(--foreground)]/70 text-center">
                          Find IT experts for your projects
                        </span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('specialist')}
                      className={`p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 group ${
                        role === 'specialist'
                          ? 'border-[var(--accent)] bg-gradient-to-br from-[var(--accent)]/10 to-[var(--accent)]/5 shadow-lg'
                          : 'border-[var(--border)] hover:border-[var(--accent)]/50 hover:bg-[var(--accent)]/5'
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          role === 'specialist' 
                            ? 'bg-gradient-to-br from-[var(--accent)] to-[var(--accent)]/80 shadow-lg scale-110' 
                            : 'bg-[var(--accent)]/10 group-hover:bg-[var(--accent)]/20'
                        }`}>
                          <Briefcase className={`w-6 h-6 ${role === 'specialist' ? 'text-white' : 'text-[var(--accent)]'}`} />
                        </div>
                        <span className="font-semibold text-base">Offer Services</span>
                        <span className="text-sm text-[var(--foreground)]/70 text-center">
                          Provide IT services to clients
                        </span>
                      </div>
                    </button>
                  </div>
                  <div className="flex justify-center">
                    <Badge className={`text-sm px-4 py-1.5 ${
                      role === 'client' 
                        ? 'bg-gradient-to-r from-[var(--primary)]/10 to-[var(--primary)]/5 text-[var(--primary)] border-[var(--primary)]/20' 
                        : 'bg-gradient-to-r from-[var(--accent)]/10 to-[var(--accent)]/5 text-[var(--accent)] border-[var(--accent)]/20'
                    }`}>
                      {role === 'client' ? 'Client Account' : 'Specialist Account'}
                    </Badge>
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-medium">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="h-12 border-2 focus:border-[var(--primary)] transition-all"
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-base font-medium">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password (min. 6 characters)"
                    required
                    className="h-12 border-2 focus:border-[var(--primary)] transition-all"
                  />
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-base font-medium">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required
                    className="h-12 border-2 focus:border-[var(--primary)] transition-all"
                  />
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

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-12 text-lg bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group"
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : (
                    <>
                      Create Account
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>

              {/* Sign In Link */}
              <div className="mt-6 text-center pt-6 border-t border-[var(--border)]">
                <p className="text-[var(--foreground)]/70">
                  Already have an account?{' '}
                  <Link href="/auth/sign-in" className="text-[var(--primary)] hover:opacity-80 font-semibold transition-opacity">
                    Sign in
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Terms */}
          <div className="mt-6 text-center text-sm text-[var(--foreground)]/70">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="text-[var(--primary)] hover:opacity-80 font-medium">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-[var(--primary)] hover:opacity-80 font-medium">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
