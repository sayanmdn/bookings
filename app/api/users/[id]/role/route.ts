import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import dbConnect from '@/lib/mongodb'
import DefaultUser from '@/lib/models/DefaultUser'
import { UserRole } from '@/lib/types/user'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const body = await request.json()
    const { role } = body

    // Validate role
    if (!role || ![UserRole.USER, UserRole.EDITOR].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Only USER or EDITOR allowed' },
        { status: 400 }
      )
    }

    await dbConnect()

    // Await params before using
    const { id } = await params

    // Fetch target user
    const targetUser = await DefaultUser.findById(id)

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Prevent modifying ADMIN role
    if (targetUser.role === UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Cannot modify ADMIN role' },
        { status: 403 }
      )
    }

    // Prevent setting to ADMIN
    if (role === UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Cannot assign ADMIN role through API' },
        { status: 403 }
      )
    }

    // Update role
    targetUser.role = role
    await targetUser.save()

    return NextResponse.json({
      success: true,
      user: {
        id: targetUser._id,
        email: targetUser.email,
        name: targetUser.name,
        role: targetUser.role
      }
    })
  } catch (error) {
    console.error('Error updating user role:', error)
    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    )
  }
}
