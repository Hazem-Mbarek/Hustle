import { NextResponse } from 'next/server';
import { initDB } from '@/lib/db';
import { OkPacket } from 'mysql2';

interface ProfileData {
  description: string;
  image?: Buffer;
  average_rating: number;
  id_user: number;
}

// CREATE (POST)
export async function POST(request: Request) {
  const pool = initDB();

  try {
    const { description, image } = await request.json();
    
    // Convert base64 image to Buffer if image exists
    let imageBuffer = null;
    if (image) {
      const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
      imageBuffer = Buffer.from(base64Data, 'base64');
    }

    // First, get the latest user ID from the users table
    const [userResult] = await pool.query(
      'SELECT id_user FROM users ORDER BY id_user DESC LIMIT 1'
    );
    
    const latestUserId = (userResult as any)[0]?.id_user;

    if (!latestUserId) {
      return NextResponse.json(
        { message: 'No user found' },
        { status: 404 }
      );
    }

    const [result] = await pool.query(
      `INSERT INTO profiles (description, image, average_rating, id_user) 
       VALUES (?, ?, ?, ?)`,
      [
        description,
        imageBuffer,
        0.00, // Default rating
        latestUserId
      ]
    );

    return NextResponse.json({ 
      message: 'Profile created successfully',
      id: (result as OkPacket).insertId 
    }, { status: 201 });

  } catch (error) {
    console.error('Failed to create profile:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// READ (GET)
export async function GET(request: Request) {
  const pool = initDB();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  try {
    const [rows] = await pool.query(`
      SELECT 
        p.*,
        u.first_name,
        u.last_name,
        u.email,
        COALESCE(p.average_rating, 0) as average_rating
      FROM profiles p
      INNER JOIN users u ON p.id_user = u.id_user
      ${id ? 'WHERE p.id_profile = ?' : 'ORDER BY p.id_profile DESC LIMIT 1'}
    `, id ? [id] : []);

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ message: 'No profile found' }, { status: 404 });
    }

    const profile = rows[0] as any;
    
    // Convert Buffer to base64 string if image exists
    if (profile.image) {
      // Convert Buffer to base64
      profile.image = Buffer.from(profile.image).toString('base64');
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Database query failed:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// UPDATE (PATCH)
export async function PATCH(request: Request) {
  const pool = initDB();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ message: 'Profile ID is required' }, { status: 400 });
  }

  try {
    const { description, image } = await request.json();

    // Handle image data
    let imageBuffer = null;
    if (image) {
      // If image is a base64 string, convert it to buffer
      if (image.startsWith('data:image')) {
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
        imageBuffer = Buffer.from(base64Data, 'base64');
      } else {
        imageBuffer = Buffer.from(image, 'base64');
      }
    }

    const [result] = await pool.query(
      `UPDATE profiles 
       SET description = ?, image = ?
       WHERE id_profile = ?`,
      [description, imageBuffer, id]
    );

    const affectedRows = (result as any).affectedRows;
    
    if (affectedRows === 0) {
      return NextResponse.json({ message: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Profile updated successfully' }, { status: 200 });

  } catch (error) {
    console.error('Failed to update profile:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE
export async function DELETE(request: Request) {
  const pool = initDB();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ message: 'Profile ID is required' }, { status: 400 });
  }

  try {
    const [result] = await pool.query('DELETE FROM profiles WHERE id_profile = ?', [id]);
    
    const affectedRows = (result as OkPacket).affectedRows;
    
    if (affectedRows === 0) {
      return NextResponse.json({ message: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Profile deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Failed to delete profile:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Allow': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS'
    },
  });
} 