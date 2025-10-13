import { NextRequest, NextResponse } from 'next/server';
import { dataManager } from '../../../../lib/dataManager';
import { verifyToken } from '../../../../lib/auth';
import { aiMatchingEngine } from '../../../../lib/ai-matching';
import { Tutor, User, SearchCriteria } from '../../../../types';

export async function GET(request: NextRequest) {
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

    // Get search parameters
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('q') || '';
    const subject = searchParams.get('subject') || '';
    const rating = searchParams.get('rating') || '';
    const availability = searchParams.get('availability') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    // Get user data for AI matching
    const userData = await dataManager.readData<{ users: User[] }>('users.json');
    const student = userData?.users.find(u => u.id === decoded.userId);
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Get tutors data
    const tutorsData = await dataManager.readData<{ tutors: Tutor[] }>('tutors.json');
    if (!tutorsData) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    let tutors = tutorsData.tutors;

    // Apply basic filters
    if (subject) {
      tutors = tutors.filter(tutor => 
        tutor.specialties?.some(s => s.toLowerCase().includes(subject.toLowerCase()))
      );
    }

    if (rating) {
      const requiredRating = parseFloat(rating.replace('+', ''));
      tutors = tutors.filter(tutor => (tutor.rating || 0) >= requiredRating);
    }

    if (availability) {
      if (availability === 'available') {
        tutors = tutors.filter(tutor => tutor.status === 'available');
      }
    }

    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      tutors = tutors.filter(tutor => 
        tutor.specialties?.some(s => s.toLowerCase().includes(query)) ||
        tutor.bio?.toLowerCase().includes(query)
      );
    }

    // AI Matching and Ranking
    const searchCriteria: SearchCriteria = {
      subject,
      rating,
      availability,
      searchQuery
    };

    const rankedTutors = aiMatchingEngine.rankTutors(tutors, student, searchCriteria);

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTutors = rankedTutors.slice(startIndex, endIndex);

    // Log search for analytics
    await dataManager.addRecord('search-history.json', {
      userId: student.id,
      searchQuery,
      filters: { subject, rating, availability },
      resultsCount: rankedTutors.length
    });

    return NextResponse.json({
      tutors: paginatedTutors,
      pagination: {
        page,
        limit,
        total: rankedTutors.length,
        totalPages: Math.ceil(rankedTutors.length / limit)
      },
      searchCriteria
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
