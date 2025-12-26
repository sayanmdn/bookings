import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { UserRole } from "@/lib/types/user"

// Route access configuration
const ROUTE_ACCESS = {
  // Public routes - no authentication required
  public: ['/', '/login', '/debug'],

  // USER role - Welcome page only
  user: ['/welcome'],

  // EDITOR role - Dashboard pages
  editor: [
    '/dashboard',
    '/bookings',
    '/advance-pending',
    '/active-advance',
    '/invoice',
    '/invoices',
    '/blo-search'
  ],

  // ADMIN role - All dashboard pages + user management
  admin: [
    '/dashboard',
    '/bookings',
    '/advance-pending',
    '/active-advance',
    '/invoice',
    '/invoices',
    '/blo-search',
    '/users'
  ]
}

// Helper to check if user can access route
function canAccessRoute(pathname: string, role: UserRole): boolean {
  // Public routes - everyone
  if (ROUTE_ACCESS.public.some(route => pathname === route)) {
    return true
  }

  // Check exact matches and path prefixes
  const checkRoutes = (routes: string[]) =>
    routes.some(route =>
      pathname === route || pathname.startsWith(`${route}/`)
    )

  switch (role) {
    case UserRole.ADMIN:
      return checkRoutes(ROUTE_ACCESS.admin)

    case UserRole.EDITOR:
      return checkRoutes(ROUTE_ACCESS.editor)

    case UserRole.USER:
      return checkRoutes(ROUTE_ACCESS.user)

    default:
      return false
  }
}

// Get default redirect based on role
function getDefaultRedirect(role: UserRole): string {
  switch (role) {
    case UserRole.ADMIN:
    case UserRole.EDITOR:
      return '/dashboard'
    case UserRole.USER:
      return '/welcome'
    default:
      return '/login'
  }
}

export default auth((req) => {
  // Bypass authentication in development mode
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next()
  }

  const isLoggedIn = !!req.auth
  const pathname = req.nextUrl.pathname
  const isOnLoginPage = pathname === '/login'
  const isOnLandingPage = pathname === '/'

  // Allow public access to landing page
  if (isOnLandingPage) {
    return NextResponse.next()
  }

  // Not logged in - redirect to login
  if (!isLoggedIn && !isOnLoginPage) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  // Logged in on login page - redirect to role-appropriate page
  if (isLoggedIn && isOnLoginPage && req.auth) {
    const role = req.auth.user?.role || UserRole.USER
    return NextResponse.redirect(
      new URL(getDefaultRedirect(role), req.nextUrl)
    )
  }

  // Check role-based access
  if (isLoggedIn && req.auth) {
    const role = req.auth.user?.role || UserRole.USER

    if (!canAccessRoute(pathname, role)) {
      // Unauthorized access - redirect to appropriate page with 403 param
      const redirect = getDefaultRedirect(role)
      const url = new URL(redirect, req.nextUrl)
      url.searchParams.set('error', 'forbidden')
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js|json|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
