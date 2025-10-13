import { NextRequest, NextResponse } from 'next/server';
import { dataManager } from '../../../../lib/dataManager';
import { generateToken } from '../../../../lib/auth';
import { User } from '../../../../types';
import { addCorsHeaders, handleCors } from '../../../../lib/cors';

export async function POST(request: NextRequest) {
  // Handle CORS preflight
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;
  try {
    const { hcmutId, password } = await request.json();

    // Mock HCMUT SSO validation
    if (!hcmutId || !password) {
      return addCorsHeaders(NextResponse.json({ error: 'HCMUT ID and password required' }, { status: 400 }));
    }

    // Validate HCMUT ID format (mock)
    const hcmutIdPattern = /^(T\d{3}|20\d{6})$/;
    if (!hcmutIdPattern.test(hcmutId)) {
      return addCorsHeaders(NextResponse.json({ error: 'Invalid HCMUT ID format' }, { status: 400 }));
    }

    // Get user data
    const userData = await dataManager.readData<{ users: User[] }>('users.json');
    if (!userData) {
      return addCorsHeaders(NextResponse.json({ error: 'Database error' }, { status: 500 }));
    }

    // Find user by HCMUT ID
    const user = userData.users.find(u => u.hcmutId === hcmutId);
    if (!user) {
      return addCorsHeaders(NextResponse.json({ error: 'User not found' }, { status: 404 }));
    }

    // Mock password validation (in real app, validate with HCMUT SSO)
    if (password !== 'hcmut123') {
      return addCorsHeaders(NextResponse.json({ error: 'Invalid credentials' }, { status: 401 }));
    }

    if (!user.isActive) {
      return addCorsHeaders(NextResponse.json({ error: 'Account is inactive' }, { status: 403 }));
    }

    // Generate JWT token
    const token = generateToken(user);

    const response = NextResponse.json({
      success: true,
      token,
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
    });

    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 // 24 hours
    });

    return addCorsHeaders(response);
  } catch (error) {
    console.error('HCMUT SSO Error:', error);
    return addCorsHeaders(NextResponse.json({ error: 'SSO authentication failed' }, { status: 500 }));
  }
}
