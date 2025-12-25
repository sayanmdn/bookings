import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { UserRole } from '@/lib/models/DefaultUser';
import dbConnect from '@/lib/mongodb';
import BLO from '@/lib/models/BLO';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { data, clearExisting = false } = body;

    if (!data || !Array.isArray(data)) {
      return NextResponse.json(
        { error: 'Invalid data format. Expected an array of BLO records.' },
        { status: 400 }
      );
    }

    // Validate data structure
    const requiredFields = ['district', 'acNumber', 'assemblyName', 'partNo', 'partName', 'bloName', 'mobileNumber', 'designation', 'departmentName'];

    for (let i = 0; i < data.length; i++) {
      const record = data[i];
      for (const field of requiredFields) {
        if (!record[field]) {
          return NextResponse.json(
            { error: `Missing required field '${field}' in record ${i + 1}` },
            { status: 400 }
          );
        }
      }
    }

    // Clear existing data if requested
    if (clearExisting) {
      await BLO.deleteMany({});
      console.log('Cleared existing BLO data');
    }

    // Bulk insert with ordered:false to continue on duplicate key errors
    let insertedCount = 0;
    let duplicates = 0;

    try {
      const result = await BLO.insertMany(data, {
        ordered: false,
        rawResult: true
      });

      insertedCount = Array.isArray(result) ? result.length : result.insertedCount || 0;
    } catch (error: unknown) {
      // Handle duplicate key errors gracefully
      if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
        const mongoError = error as { result?: { nInserted?: number }; writeErrors?: unknown[] };
        insertedCount = mongoError.result?.nInserted || 0;
        duplicates = mongoError.writeErrors?.length || 0;
      } else {
        throw error;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${insertedCount} BLO records`,
      insertedCount,
      totalRecords: data.length,
      duplicates: duplicates || (data.length - insertedCount)
    }, { status: 200 });

  } catch (error) {
    console.error('Error importing BLO data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to import data', details: errorMessage },
      { status: 500 }
    );
  }
}

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
    const district = searchParams.get('district');
    const assemblyName = searchParams.get('assemblyName');
    const mobileNumber = searchParams.get('mobileNumber');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const query: Record<string, string> = {};

    if (district) {
      query.district = district;
    }
    if (assemblyName) {
      query.assemblyName = assemblyName;
    }
    if (mobileNumber) {
      query.mobileNumber = mobileNumber;
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      BLO.find(query).skip(skip).limit(limit).sort({ district: 1, acNumber: 1, partNo: 1 }),
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
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching BLO data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch data', details: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE() {
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

    const result = await BLO.deleteMany({});

    return NextResponse.json({
      success: true,
      message: `Deleted ${result.deletedCount} BLO records`,
      deletedCount: result.deletedCount
    }, { status: 200 });

  } catch (error) {
    console.error('Error deleting BLO data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to delete data', details: errorMessage },
      { status: 500 }
    );
  }
}
