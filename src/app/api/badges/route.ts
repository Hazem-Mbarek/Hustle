import { NextResponse } from 'next/server';
import { initDB } from '@/lib/db';

export async function GET(request: Request) {
  const pool = initDB();
  const { searchParams } = new URL(request.url);
  const profileId = searchParams.get('profile_id');

  if (!profileId) {
    return NextResponse.json({ error: 'Profile ID is required' }, { status: 400 });
  }

  try {
    const [rows] = await pool.query(`
      SELECT COUNT(DISTINCT r.id_user) as five_star_count
      FROM ratings r
      JOIN requests req ON r.id_job = req.id_job
      WHERE r.id_subject = ?
      AND r.value = 5
      AND req.id_profile_sender = r.id_subject
      AND req.status = 'accepted'
    `, [profileId]);

    const fiveStarCount = rows[0]?.five_star_count || 0;
    console.log('Five star count for profile', profileId, ':', fiveStarCount);

    const badges = {
      topPerformer:  fiveStarCount >=5,
      fiveStarCount
    };

    return NextResponse.json(badges);
  } catch (error) {
    console.error('Error checking badges:', error);
    return NextResponse.json(
      { error: 'Failed to check badges' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Allow': 'GET, OPTIONS',
      'Access-Control-Allow-Methods': 'GET, OPTIONS'
    },
  });
}