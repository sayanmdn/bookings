import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const isOnLoginPage = request.nextUrl.pathname.startsWith('/login')
  const isOnLandingPage = request.nextUrl.pathname === '/'
  const isOnAuthCallback = request.nextUrl.pathname.startsWith('/auth-callback')

  // Allow public access to landing page and auth callback
  if (isOnLandingPage || isOnAuthCallback) {
    return NextResponse.next()
  }

  // All other pages will check authentication client-side
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
