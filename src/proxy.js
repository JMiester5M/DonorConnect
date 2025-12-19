// Next.js Middleware - Route protection and authentication
import { NextResponse } from 'next/server'

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/donors', '/campaigns', '/donations', '/segments', '/workflows', '/tasks']

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/login', '/register']

export async function proxy(request) {
  // Get session token from cookies
  const sessionToken = request.cookies.get('session')?.value
  const pathname = request.nextUrl.pathname

  // Check if current path requires authentication
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // If route is protected and no session token, redirect to login
  if (isProtectedRoute && !sessionToken) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname) // Preserve intended destination
    return NextResponse.redirect(loginUrl)
  }

  // If route is protected, validate session by calling session API
  if (isProtectedRoute && sessionToken) {
    try {
      const response = await fetch(`${request.nextUrl.origin}/api/auth/session`, {
        method: 'GET',
        headers: {
          'Cookie': `session=${sessionToken}`,
        },
      })

      // If session is invalid or expired, redirect to login
      if (!response.ok) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('from', pathname)
        return NextResponse.redirect(loginUrl)
      }
    } catch (error) {
      console.error('Session validation error:', error)
      // On error, allow access
    }
  }

  // If authenticated user tries to access auth pages, redirect to dashboard
  if (isAuthRoute && sessionToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
