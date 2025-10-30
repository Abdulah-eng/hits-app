import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          req.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          req.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard']
  const authRoutes = ['/auth/sign-in', '/auth/sign-up', '/auth/callback']
  
  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )
  const isAuthRoute = authRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )

  // Redirect unauthenticated users from protected routes to sign-in
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/auth/sign-in', req.url)
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Handle role-based redirects for dashboard
  if (req.nextUrl.pathname === '/dashboard' && session) {
    const userRole = session.user?.user_metadata?.role || 'client'
    
    switch (userRole) {
      case 'client':
        return NextResponse.redirect(new URL('/dashboard/client', req.url))
      case 'specialist':
        return NextResponse.redirect(new URL('/dashboard/specialist', req.url))
      case 'admin':
        return NextResponse.redirect(new URL('/dashboard/admin', req.url))
      default:
        return NextResponse.redirect(new URL('/dashboard/client', req.url))
    }
  }

  // Role-based access control for specific dashboard routes
  if (session && req.nextUrl.pathname.startsWith('/dashboard/')) {
    const userRole = session.user?.user_metadata?.role || 'client'
    const requestedRole = req.nextUrl.pathname.split('/')[2]

    // Check if user has access to the requested dashboard
    if (userRole !== requestedRole && userRole !== 'admin') {
      // Redirect to user's appropriate dashboard
      return NextResponse.redirect(new URL(`/dashboard/${userRole}`, req.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}