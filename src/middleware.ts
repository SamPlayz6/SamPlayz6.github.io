import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SESSION_COOKIE_NAME = 'dashboard_session'

const protectedPaths = ['/dashboard', '/api/data', '/api/process', '/api/instagram']
const publicPaths = ['/dashboard/login']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Check if path needs protection
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p))
  if (!isProtected) {
    return NextResponse.next()
  }

  // Check for session cookie
  const session = request.cookies.get(SESSION_COOKIE_NAME)

  if (!session?.value) {
    // Redirect to login for page requests, return 401 for API requests
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const loginUrl = new URL('/dashboard/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/data/:path*', '/api/process/:path*', '/api/instagram/:path*'],
}
