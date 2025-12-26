import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { UserRole } from '@/lib/types/user'
import Header from '@/components/Header'
import { Shield, Mail } from 'lucide-react'

export default async function WelcomePage() {
  const session = await auth()

  // Redirect if not authenticated
  if (!session?.user) {
    redirect('/login')
  }

  // Only redirect if explicitly EDITOR or ADMIN (not if role is undefined or USER)
  if (session.user.role && session.user.role !== UserRole.USER) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-10 h-10 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to Booking Management
            </h1>
            <p className="text-gray-600">
              Your account has been created successfully
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-amber-900 mb-2">
              Access Restricted
            </h2>
            <p className="text-amber-700 mb-4">
              Your account currently has restricted access to the booking management system.
              You do not have permission to view or manage bookings at this time.
            </p>
            <div className="flex items-start gap-3 text-amber-800">
              <Mail className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium mb-1">Need access?</p>
                <p className="text-sm">
                  Contact the system administrator at{' '}
                  <a
                    href="mailto:sayanmdn@gmail.com"
                    className="underline hover:text-amber-900 font-medium"
                  >
                    sayanmdn@gmail.com
                  </a>
                  {' '}to request elevated permissions.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 text-gray-600">
            <h3 className="font-semibold text-gray-900">Account Information</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium text-gray-900">{session.user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium text-gray-900">{session.user.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Access Level:</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                  {session.user.role}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
