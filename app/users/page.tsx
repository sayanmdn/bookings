import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { UserRole } from '@/lib/models/DefaultUser'
import Header from '@/components/Header'
import UsersTable from '@/components/UsersTable'
import dbConnect from '@/lib/mongodb'
import DefaultUser from '@/lib/models/DefaultUser'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getUsers() {
  try {
    await dbConnect()
    const users = await DefaultUser
      .find({})
      .select('email name profileImage role createdAt updatedAt')
      .sort({ createdAt: -1 })
      .lean()

    return users.map(user => ({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      profileImage: user.profileImage,
      role: user.role,
      createdAt: user.createdAt?.toISOString(),
      updatedAt: user.updatedAt?.toISOString()
    }))
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

export default async function UsersPage() {
  const session = await auth()

  // Authorization check
  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    redirect('/dashboard')
  }

  const users = await getUsers()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            User Management
          </h1>
          <p className="text-gray-600">
            Manage user roles and permissions
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <UsersTable users={users} />
        </div>
      </div>
    </div>
  )
}
