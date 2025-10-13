import { NextRequest, NextResponse } from 'next/server';
import { dataManager } from '../../../../lib/dataManager';
import { verifyToken } from '../../../../lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { id } = params;

    // Get tutor data
    const tutorsData = await dataManager.readData<{ tutors: any[] }>('tutors.json');
    if (!tutorsData) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const tutor = tutorsData.tutors.find(t => t.id === id);
    if (!tutor) {
      return NextResponse.json({ error: 'Tutor not found' }, { status: 404 });
    }

    // Get user data for tutor
    const userData = await dataManager.readData<{ users: any[] }>('users.json');
    const user = userData?.users.find(u => u.id === tutor.userId);

    return NextResponse.json({
      ...tutor,
      user: user ? {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        university: user.university,
        major: user.major,
        avatar: user.avatar
      } : null
    });

  } catch (error) {
    console.error('Get tutor error:', error);
    return NextResponse.json({ error: 'Failed to get tutor' }, { status: 500 });
  }
}
