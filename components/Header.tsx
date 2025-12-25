import { auth } from "@/auth"
import { LogOut, Users, Shield, UserCog } from "lucide-react"
import { handleSignOut } from "@/lib/actions/auth"
import Link from "next/link"
import { UserRole } from "@/lib/models/DefaultUser"

export default async function Header() {
  const session = await auth()

  const getRoleIcon = (role?: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return <Shield className="w-4 h-4 text-red-600" />
      case UserRole.EDITOR:
        return <UserCog className="w-4 h-4 text-green-600" />
      case UserRole.USER:
        return <Users className="w-4 h-4 text-gray-600" />
      default:
        return null
    }
  }

  const getRoleBadgeColor = (role?: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'bg-red-100 text-red-800'
      case UserRole.EDITOR:
        return 'bg-green-100 text-green-800'
      case UserRole.USER:
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getHomeLink = () => {
    if (session?.user?.role === UserRole.USER) {
      return '/welcome'
    }
    return '/dashboard'
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div>
          <Link href={getHomeLink()}>
            <h2 className="text-xl font-semibold text-gray-800 cursor-pointer hover:text-gray-600 transition-colors">
              Booking Management
            </h2>
          </Link>
          {session?.user?.email && (
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-gray-600">
                Signed in as {session.user.email}
              </p>
              {session.user.role && (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor(session.user.role)}`}>
                  {getRoleIcon(session.user.role)}
                  {session.user.role}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Admin-only navigation */}
          {session?.user?.role === UserRole.ADMIN && (
            <Link
              href="/users"
              className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
            >
              <Users className="w-4 h-4" />
              Manage Users
            </Link>
          )}

          <form action={handleSignOut}>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}
