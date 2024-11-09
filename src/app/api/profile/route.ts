import { NextResponse } from 'next/server';
import { initDB } from '@/lib/db';
import { OkPacket } from 'mysql2';

interface ProfileData {
  description: string;
  image?: Buffer;
  average_rating_employee: number;
  average_rating_employer: number;
  id_user: number;
}

interface User {
  id_user: number;
  email: string;
  first_name: string;
  last_name: string;
}

// CREATE (POST)
export async function POST(request: Request) {
  const pool = initDB();

  try {
    const profileData: ProfileData = await request.json();

    const [result] = await pool.query(
      `INSERT INTO profiles (description, image, average_rating_employee, average_rating_employer, id_user) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        profileData.description,
        profileData.image || null,
        profileData.average_rating_employee || null,
        profileData.average_rating_employer,
        profileData.id_user
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
    if (id) {
      // Get specific profile
      const [rows] = await pool.query('SELECT * FROM profiles WHERE id_profile = ?', [id]);
      const profiles = rows as any[];
      
      if (profiles.length === 0) {
        return NextResponse.json({ message: 'Profile not found' }, { status: 404 });
      }
      
      return NextResponse.json(profiles[0]);
    } else {
      // Get all profiles
      const [rows] = await pool.query('SELECT * FROM profiles');
      return NextResponse.json(rows);
    }
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

  try {
    if (!id) {
      return NextResponse.json({ message: 'Profile ID is required' }, { status: 400 });
    }

    const updateFields = await request.json();
    
    const updates = Object.keys(updateFields)
      .filter(key => updateFields[key] !== undefined)
      .map(key => `${key} = ?`);
    
    if (updates.length === 0) {
      return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
    }

    const query = `
      UPDATE profiles 
      SET ${updates.join(', ')}
      WHERE id_profile = ?
    `;

    const values = [
      ...Object.keys(updateFields)
        .filter(key => updateFields[key] !== undefined)
        .map(key => updateFields[key]),
      id
    ];

    const [result] = await pool.query(query, values);
    
    const affectedRows = (result as OkPacket).affectedRows;
    
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