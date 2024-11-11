import { NextResponse } from 'next/server';
import { initDB } from '@/lib/db';
import { OkPacket } from 'mysql2';

interface RatingData {
  id_user: number;
  id_subject: number;
  value: number;
  id_job?: number;
}

// CREATE (POST)
export async function POST(request: Request) {
  const pool = initDB();

  try {
    const ratingData = await request.json();
    console.log('Received rating data:', ratingData);

    // Validate rating value
    if (ratingData.value < 1 || ratingData.value > 5) {
      return NextResponse.json({ 
        message: 'Rating value must be between 1 and 5' 
      }, { status: 400 });
    }

    // Insert new rating
    const [result] = await pool.query(
      'INSERT INTO ratings (id_user, id_subject, value, id_job) VALUES (?, ?, ?, ?)',
      [ratingData.id_user, ratingData.id_subject, ratingData.value, ratingData.id_job]
    );

    // Update average rating
    const [avgRating] = await pool.query(
      'SELECT AVG(value) as avg_rating FROM ratings WHERE id_subject = ?',
      [ratingData.id_subject]
    );
    
    await pool.query(
      'UPDATE profiles SET average_rating = ? WHERE id_profile = ?',
      [(avgRating as any[])[0].avg_rating, ratingData.id_subject]
    );

    return NextResponse.json({ 
      message: 'Rating created successfully',
      rating: {
        id_rating: (result as OkPacket).insertId,
        ...ratingData
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Failed to create rating:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// GET all ratings or by id_subject
export async function GET(request: Request) {
  const pool = initDB();
  const { searchParams } = new URL(request.url);
  const check_id_job = searchParams.get('check_id_job');
  const check_id_user = searchParams.get('check_id_user');
  const check_id_subject = searchParams.get('check_id_subject');

  try {
    if (check_id_job && check_id_user && check_id_subject) {
      console.log('Checking rating with params:', {
        check_id_job,
        check_id_user,
        check_id_subject
      });

      const [existingRating] = await pool.query(
        `SELECT id_rating, value 
         FROM ratings 
         WHERE id_job = ? 
         AND id_user = ? 
         AND id_subject = ?`,
        [check_id_job, check_id_user, check_id_subject]
      );
      
      const rating = (existingRating as any[])[0];
      console.log('Found rating:', rating);

      return NextResponse.json({ 
        exists: rating ? true : false,
        rating: rating || null
      });
    }
    
    return NextResponse.json({ exists: false, rating: null });
  } catch (error) {
    console.error('Database query failed:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE rating
export async function DELETE(request: Request) {
  const pool = initDB();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ message: 'Rating ID is required' }, { status: 400 });
  }

  try {
    // Get the rating before deleting to update average
    const [rating] = await pool.query(
      'SELECT id_subject FROM ratings WHERE id_rating = ?',
      [id]
    );

    if ((rating as any[]).length === 0) {
      return NextResponse.json({ message: 'Rating not found' }, { status: 404 });
    }

    const id_subject = (rating as any[])[0].id_subject;

    // Delete the rating
    const [result] = await pool.query('DELETE FROM ratings WHERE id_rating = ?', [id]);
    
    // Update average rating
    const [avgRating] = await pool.query(
      'SELECT AVG(value) as avg_rating FROM ratings WHERE id_subject = ?',
      [id_subject]
    );
    
    await pool.query(
      'UPDATE profiles SET average_rating = ? WHERE id_profile = ?',
      [(avgRating as any[])[0]?.avg_rating || 0, id_subject]
    );

    return NextResponse.json({ message: 'Rating deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Failed to delete rating:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// Update OPTIONS to include new methods
export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Allow': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS'
    },
  });
}

// UPDATE (PATCH)
export async function PATCH(request: Request) {
  const pool = initDB();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ message: 'Rating ID is required' }, { status: 400 });
  }

  try {
    const ratingData: RatingData = await request.json();

    // Validate rating value
    if (ratingData.value < 1 || ratingData.value > 5) {
      return NextResponse.json({ 
        message: 'Rating value must be between 1 and 5' 
      }, { status: 400 });
    }

    // Check if rating exists and get current data
    const [existingRating] = await pool.query(
      'SELECT * FROM ratings WHERE id_rating = ?',
      [id]
    );

    if ((existingRating as any[]).length === 0) {
      return NextResponse.json({ message: 'Rating not found' }, { status: 404 });
    }

    // Update rating
    await pool.query(
      'UPDATE ratings SET value = ? WHERE id_rating = ?',
      [ratingData.value, id]
    );

    // Update average rating
    const id_subject = (existingRating as any[])[0].id_subject;
    const [avgRating] = await pool.query(
      'SELECT AVG(value) as avg_rating FROM ratings WHERE id_subject = ?',
      [id_subject]
    );
    
    await pool.query(
      'UPDATE profiles SET average_rating = ? WHERE id_profile = ?',
      [(avgRating as any[])[0].avg_rating, id_subject]
    );

    // Get updated rating
    const [updatedRating] = await pool.query(
      'SELECT * FROM ratings WHERE id_rating = ?',
      [id]
    );

    return NextResponse.json({ 
      message: 'Rating updated successfully',
      rating: (updatedRating as any[])[0]
    }, { status: 200 });

  } catch (error) {
    console.error('Failed to update rating:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}