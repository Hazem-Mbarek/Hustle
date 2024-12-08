import { NextResponse } from 'next/server';
import { initDB } from '@/lib/db';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function GET() {
  const pool = initDB();
  const cookieStore = await cookies();
  const authToken = await cookieStore.get('auth_token');

  if (!authToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(authToken.value, process.env.JWT_SECRET || 'your-secret-key') as any;
    const userId = decoded.userId;

    const [rows] = await pool.query(
      'SELECT id_profile FROM profiles WHERE id_user = ?',
      [userId]
    );
    const profiles = rows as any[];

    if (profiles.length === 0) {
      return NextResponse.json({ message: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ profileId: profiles[0].id_profile });
  } catch (error) {
    console.error('Failed to get profile:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
} 