import { NextRequest, NextResponse } from 'next/server';
import { dataManager } from '../../../lib/dataManager';

export async function GET(request: NextRequest) {
  try {
    const subjectsData = await dataManager.readData<{ subjects: any[] }>('subjects.json');
    if (!subjectsData) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json(subjectsData.subjects);
  } catch (error) {
    console.error('Get subjects error:', error);
    return NextResponse.json({ error: 'Failed to get subjects' }, { status: 500 });
  }
}
