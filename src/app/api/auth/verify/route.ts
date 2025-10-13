import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../../../../lib/auth';
import { dataManager } from '../../../../lib/dataManager';
import { addCorsHeaders, handleCors } from '../../../../lib/cors';

export async function GET(request: NextRequest) {
  // Handle CORS preflight
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;
  try {
    // Try to get token from Authorization header first, then from cookies
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return addCorsHeaders(NextResponse.json({ error: 'No token provided' }, { status: 401 }));
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return addCorsHeaders(NextResponse.json({ error: 'Invalid token' }, { status: 401 }));
    }

    // Get user data
    const userData = await dataManager.readData<{ users: any[] }>('users.json');
    if (!userData) {
      return addCorsHeaders(NextResponse.json({ error: 'Database error' }, { status: 500 }));
    }

    const user = userData.users.find(u => u.id === decoded.userId);
    if (!user) {
      return addCorsHeaders(NextResponse.json({ error: 'User not found' }, { status: 404 }));
    }

    return addCorsHeaders(NextResponse.json({
      success: true,
      user: {
        id: user.id,
        hcmutId: user.hcmutId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        university: user.university,
        major: user.major,
        avatar: user.avatar,
        isVerified: user.isVerified
      }
    }));
  } catch (error) {
    return addCorsHeaders(NextResponse.json({ error: 'Token verification failed' }, { status: 500 }));
  }
}
