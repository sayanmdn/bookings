import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { UserRole } from '@/lib/types/user';
import dbConnect from '@/lib/mongodb';
import BLO from '@/lib/models/BLO';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check authorization - EDITOR or ADMIN only
    if (![UserRole.EDITOR, UserRole.ADMIN].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);

    // Extract search parameters
    const district = searchParams.get('district');
    const assemblyName = searchParams.get('assemblyName');
    const partNo = searchParams.get('partNo');
    const partName = searchParams.get('partName');
    const bloName = searchParams.get('bloName');
    const mobileNumber = searchParams.get('mobileNumber');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build query with case-insensitive partial matching
    const query: Record<string, unknown> = {};

    if (district && district.trim()) {
      query.district = { $regex: district.trim(), $options: 'i' };
    }
    if (assemblyName && assemblyName.trim()) {
      query.assemblyName = { $regex: assemblyName.trim(), $options: 'i' };
    }
    if (partNo && partNo.trim()) {
      query.partNo = { $regex: partNo.trim(), $options: 'i' };
    }
    if (partName && partName.trim()) {
      query.partName = { $regex: partName.trim(), $options: 'i' };
    }
    if (bloName && bloName.trim()) {
      query.bloName = { $regex: bloName.trim(), $options: 'i' };
    }
    if (mobileNumber && mobileNumber.trim()) {
      query.mobileNumber = { $regex: mobileNumber.trim(), $options: 'i' };
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      BLO.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ district: 1, acNumber: 1, partNo: 1 })
        .lean(),
      BLO.countDocuments(query)
    ]);

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      filters: {
        district,
        assemblyName,
        partNo,
        partName,
        bloName,
        mobileNumber
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error searching BLO data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to search data', details: errorMessage },
      { status: 500 }
    );
  }
}
