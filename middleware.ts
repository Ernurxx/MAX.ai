import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Allow access to login page without token
    if (pathname.startsWith('/login')) {
      if (token) {
        // If already logged in, redirect to appropriate dashboard
        if (token.role === 'STUDENT') {
          return NextResponse.redirect(new URL('/dashboard', req.url))
        } else {
          return NextResponse.redirect(new URL('/admin', req.url))
        }
      }
      // Allow access to login page if not logged in
      return NextResponse.next()
    }

    // Protect student routes
    if (pathname.startsWith('/dashboard') || 
        pathname.startsWith('/lessons') ||
        pathname.startsWith('/flashcards') ||
        pathname.startsWith('/practice-test')) {
      if (!token) {
        return NextResponse.redirect(new URL('/login', req.url))
      }
      if (token.role !== 'STUDENT') {
        return NextResponse.redirect(new URL('/admin', req.url))
      }
    }

    // Protect teacher routes
    if (pathname.startsWith('/admin')) {
      if (!token) {
        return NextResponse.redirect(new URL('/login', req.url))
      }
      if (token.role !== 'TEACHER') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to login page without token
        if (req.nextUrl.pathname.startsWith('/login')) {
          return true
        }
        // Require token for all other protected routes
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/lessons/:path*',
    '/flashcards/:path*',
    '/practice-test/:path*',
    '/admin/:path*',
    '/login',
  ],
}
