import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SESSION_COOKIE_NAME = 'dashboard_session'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect /dashboard routes (except /dashboard/login)
  if (pathname.startsWith('/dashboard') && !pathname.startsWith('/dashboard/login')) {
    const session = request.cookies.get(SESSION_COOKIE_NAME)

    if (!session?.value) {
      // Redirect to login if no session
      const loginUrl = new URL('/dashboard/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  // If logged in and trying to access login page, redirect to dashboard
  if (pathname === '/dashboard/login') {
    const session = request.cookies.get(SESSION_COOKIE_NAME)
    if (session?.value) {
      const dashboardUrl = new URL('/dashboard', request.url)
      return NextResponse.redirect(dashboardUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
