import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import dbConnect from '@/lib/mongodb'
import DefaultUser, { UserRole } from '@/lib/models/DefaultUser'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    // Check authentication
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check authorization - ADMIN only
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    await dbConnect()

    // Get search query parameter
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')

    let query = {}
    if (search) {
      // Case-insensitive search on email and name
      query = {
        $or: [
          { email: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } }
        ]
      }
    }

    const users = await DefaultUser
      .find(query)
      .select('email name profileImage role createdAt updatedAt')
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
