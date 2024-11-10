import { NextResponse } from 'next/server';
import { initDB } from '@/lib/db';
import { OkPacket } from 'mysql2';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

interface JobData {
  title: string;
  description: string;
  id_employer: number;
  category: string;
  state: string;
  num_workers: number;
  pay: number;
  location: string;
  time: string;
}

// Add a new job

export async function POST(request: Request) {
  const pool = initDB();
  const cookieStore = cookies();
  const authToken = cookieStore.get('auth_token');

  if (!authToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    // First, get the profile ID from auth profile
    const profileResponse = await fetch('http://localhost:3000/api/auth/profile', {
      headers: {
        'Cookie': `auth_token=${authToken.value}`
      }
    });
    
    if (!profileResponse.ok) {
      return NextResponse.json({ message: 'Profile not found' }, { status: 404 });
    }
    
    const profileData = await profileResponse.json();
    console.log('Profile data for job creation:', profileData);
    
    if (!profileData.profileId) {
      return NextResponse.json({ message: 'Profile ID not found' }, { status: 404 });
    }

    const jobData = await request.json();

    const [result] = await pool.query(
      `INSERT INTO Jobs (
        title, description, profile_id, category, 
        state, num_workers, pay, location, time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        jobData.title,
        jobData.description,
        profileData.profileId, // Use profileId from auth profile
        jobData.category,
        jobData.state,
        jobData.num_workers,
        jobData.pay,
        jobData.location,
        jobData.time
      ]
    );

    return NextResponse.json({ 
      message: 'Job created successfully',
      id: (result as OkPacket).insertId 
    }, { status: 201 });

  } catch (error) {
    console.error('Failed to create job:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// Get all jobs or specific job
export async function GET(request: Request) {
  const pool = initDB();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const profile_id = searchParams.get('profile_id');

  console.log('GET /api/job - profile_id:', profile_id); // Debug log

  try {
    if (id) {
      // Get specific job with employer information
      const [rows] = await pool.query(`
        SELECT j.*, p.id_profile as id_employer 
        FROM Jobs j
        JOIN Profiles p ON j.profile_id = p.id_profile
        WHERE j.id_job = ?
      `, [id]);
      const jobs = rows as any[];
      
      if (jobs.length === 0) {
        return NextResponse.json({ message: 'Job not found' }, { status: 404 });
      }
      
      return NextResponse.json(jobs[0]);
    } else if (profile_id) {
      // Get jobs for specific profile
      const [rows] = await pool.query(`
        SELECT j.*, p.id_profile as id_employer 
        FROM Jobs j
        JOIN Profiles p ON j.profile_id = p.id_profile
        WHERE j.profile_id = ?
      `, [profile_id]);
      return NextResponse.json(rows);
    } else {
      // Get all jobs with employer information
      const [rows] = await pool.query(`
        SELECT j.*, p.id_profile as id_employer 
        FROM Jobs j
        JOIN Profiles p ON j.profile_id = p.id_profile
      `);
      return NextResponse.json(rows);
    }
  } catch (error) {
    console.error('Database query failed:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// Update a job
export async function PATCH(request: Request) {
  const pool = initDB();
  const { searchParams } = new URL(request.url);
  const id_job = searchParams.get('id');

  try {
    if (!id_job) {
      return NextResponse.json({ message: 'Job ID is required' }, { status: 400 });
    }

    const updateFields = await request.json();
    
    // Build dynamic query based on provided fields
    const updates = Object.keys(updateFields)
      .filter(key => updateFields[key] !== undefined)
      .map(key => `${key} = ?`);
    
    if (updates.length === 0) {
      return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
    }

    const query = `
      UPDATE Jobs 
      SET ${updates.join(', ')}
      WHERE id_job = ?
    `;

    // Create array of values for the query
    const values = [
      ...Object.keys(updateFields)
        .filter(key => updateFields[key] !== undefined)
        .map(key => updateFields[key]),
      id_job
    ];

    const [result] = await pool.query(query, values);
    
    const affectedRows = (result as OkPacket).affectedRows;
    
    if (affectedRows === 0) {
      return NextResponse.json({ message: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Job updated successfully' }, { status: 200 });

  } catch (error) {
    console.error('Failed to update job:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// Add DELETE method
export async function DELETE(request: Request) {
  const pool = initDB();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ message: 'Job ID is required' }, { status: 400 });
  }

  try {
    const [result] = await pool.query('DELETE FROM Jobs WHERE id_job = ?', [id]);
    
    const affectedRows = (result as OkPacket).affectedRows;
    
    if (affectedRows === 0) {
      return NextResponse.json({ message: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Job deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Failed to delete job:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// Update the OPTIONS method to ensure DELETE is included
export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Allow': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS'
    },
  });
}