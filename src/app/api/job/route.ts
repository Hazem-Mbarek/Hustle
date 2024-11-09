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
    // Decode the JWT token to get user information
    const decoded = jwt.verify(authToken.value, process.env.JWT_SECRET || 'your-secret-key') as any;
    const userId = decoded.userId;

    const jobData = await request.json();

    const [result] = await pool.query(
      `INSERT INTO Jobs (
        title, description, profile_id, category, 
        state, num_workers, pay, location, time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        jobData.title,
        jobData.description,
        userId, // Use the ID from the token instead of the submitted data
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

// Get all jobs
export async function GET(request: Request) {
  const pool = initDB();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  try {
    if (id) {
      // Get specific job
      const [rows] = await pool.query('SELECT * FROM Jobs WHERE id_job = ?', [id]);
      const jobs = rows as any[];
      
      if (jobs.length === 0) {
        return NextResponse.json({ message: 'Job not found' }, { status: 404 });
      }
      
      return NextResponse.json(jobs[0]);
    } else {
      // Get all jobs
      const [rows] = await pool.query('SELECT * FROM Jobs');
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