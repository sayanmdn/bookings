import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  // Bypass authentication in development mode
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next()
  }

  const isLoggedIn = !!req.auth
  const isOnLoginPage = req.nextUrl.pathname.startsWith('/login')
  const isOnLandingPage = req.nextUrl.pathname === '/'

  // Allow public access to landing page
  if (isOnLandingPage) {
    return NextResponse.next()
  }

  if (!isLoggedIn && !isOnLoginPage) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  if (isLoggedIn && isOnLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
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
