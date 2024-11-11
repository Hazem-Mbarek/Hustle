import { NextResponse } from 'next/server';
import { initDB } from '@/lib/db';
import { OkPacket } from 'mysql2';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

interface RatingData {
  id_user: number;
  id_subject: number;
  value: number;
  id_job?: number;
}

// CREATE (POST)
export async function POST(request: Request) {
  const pool = initDB();
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth_token');

  if (!authToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const ratingData: RatingData = await request.json();

    // Validate rating value
    if (ratingData.value < 1 || ratingData.value > 5) {
      return NextResponse.json({ 
        message: 'Rating value must be between 1 and 5' 
      }, { status: 400 });
    }

    // Check if both profiles exist
    const [profiles] = await pool.query(
      'SELECT * FROM profiles WHERE id_profile IN (?, ?)',
      [ratingData.id_user, ratingData.id_subject]
    );

    if ((profiles as any[]).length !== 2) {
      return NextResponse.json({ 
        message: 'One or both profiles not found' 
      }, { status: 404 });
    }

    // If job ID is provided, verify it exists
    if (ratingData.id_job) {
      const [job] = await pool.query(
        'SELECT * FROM jobs WHERE id_job = ?',
        [ratingData.id_job]
      );

      if ((job as any[]).length === 0) {
        return NextResponse.json({ 
          message: 'Job not found' 
        }, { status: 404 });
      }
    }

    // Insert new rating
    const [result] = await pool.query(
      'INSERT INTO ratings (id_user, id_subject, value, id_job) VALUES (?, ?, ?, ?)',
      [ratingData.id_user, ratingData.id_subject, ratingData.value, ratingData.id_job || null]
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
      id: (result as OkPacket).insertId,
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
  const id = searchParams.get('id');
  const id_subject = searchParams.get('id_subject');
  const job_id = searchParams.get('job_id');
  const check_id_job = searchParams.get('check_id_job');
  const check_id_user = searchParams.get('check_id_user');
  const check_id_subject = searchParams.get('check_id_subject');

  try {
    if (check_id_job && check_id_user && check_id_subject) {
      const [existingRating] = await pool.query(
        `SELECT id_rating, value FROM ratings 
         WHERE id_job = ? 
         AND id_user = ? 
         AND id_subject = ?`,
        [check_id_job, check_id_user, check_id_subject]
      );
      
      const rating = (existingRating as any[])[0];
      return NextResponse.json({ 
        exists: rating ? true : false,
        rating: rating || null
      });
    }
    
    if (id) {
      // Get specific rating
      const [rows] = await pool.query('SELECT * FROM ratings WHERE id_rating = ?', [id]);
      const ratings = rows as any[];
      
      if (ratings.length === 0) {
        return NextResponse.json({ message: 'Rating not found' }, { status: 404 });
      }
      
      return NextResponse.json(ratings[0]);
    } else if (id_subject) {
      // Get ratings for specific subject
      const [rows] = await pool.query('SELECT * FROM ratings WHERE id_subject = ?', [id_subject]);
      return NextResponse.json(rows);
    } else if (job_id) {
      // Get ratings for specific job
      const [rows] = await pool.query('SELECT * FROM ratings WHERE id_job = ?', [job_id]);
      
      if ((rows as any[]).length === 0) {
        return NextResponse.json({ message: 'No ratings found for this job' }, { status: 404 });
      }
      
      return NextResponse.json(rows);
    } else {
      // Get all ratings
      const [rows] = await pool.query('SELECT * FROM ratings');
      return NextResponse.json(rows);
    }
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
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth_token');

  if (!authToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

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