import { NextResponse } from 'next/server';
import { initDB } from '@/lib/db';
import { OkPacket } from 'mysql2';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

interface RequestData {
  id_profile_sender: number;
  id_job: number;
  status: string;
  bid: number;
  id_profile_receiver: number;
}

// Add this function after the interface declarations
async function checkExistingRequest(pool: any, userId: number, jobId: number) {
  const [rows] = await pool.query(
    `SELECT * FROM requests 
     WHERE id_profile_sender = ? 
     AND id_job = ? 
     AND status IN ('pending', 'accepted')`,
    [userId, jobId]
  );
  return (rows as any[]).length > 0;
}

// CREATE (POST)
export async function POST(request: Request) {
  const pool = initDB();
  const cookieStore = cookies();
  const authToken = cookieStore.get('auth_token');

  if (!authToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const requestData: RequestData = await request.json();
    
    // Check for existing request
    const hasExistingRequest = await checkExistingRequest(
      pool, 
      requestData.id_profile_sender, 
      requestData.id_job
    );

    if (hasExistingRequest) {
      return NextResponse.json({ 
        message: 'You already have a pending or accepted request for this job' 
      }, { status: 409 });
    }

    const [result] = await pool.query(
      `INSERT INTO requests (
        id_profile_sender, id_job, status, bid, id_profile_receiver
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        requestData.id_profile_sender,
        requestData.id_job,
        requestData.status || 'pending',
        requestData.bid,
        requestData.id_profile_receiver
      ]
    );

    return NextResponse.json({ 
      message: 'Request created successfully',
      id: (result as OkPacket).insertId 
    }, { status: 201 });

  } catch (error) {
    console.error('Failed to create request:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// READ (GET)
export async function GET(request: Request) {
  const pool = initDB();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const job_id = searchParams.get('job_id');
  const sender_id = searchParams.get('sender_id');
  const receiver_id = searchParams.get('receiver_id');

  try {
    if (id) {
      // Get specific request
      const [rows] = await pool.query('SELECT * FROM requests WHERE id_request = ?', [id]);
      const requests = rows as any[];
      
      if (requests.length === 0) {
        return NextResponse.json({ message: 'Request not found' }, { status: 404 });
      }
      
      return NextResponse.json(requests[0]);
    } else if (job_id) {
      // Get requests for specific job
      const [rows] = await pool.query('SELECT * FROM requests WHERE id_job = ?', [job_id]);
      return NextResponse.json(rows);
    } else if (sender_id) {
      // Get requests from specific sender
      const [rows] = await pool.query('SELECT * FROM requests WHERE id_profile_sender = ?', [sender_id]);
      return NextResponse.json(rows);
    } else if (receiver_id) {
      // Get requests for specific receiver
      const [rows] = await pool.query('SELECT * FROM requests WHERE id_profile_receiver = ?', [receiver_id]);
      return NextResponse.json(rows);
    } else {
      // Get all requests
      const [rows] = await pool.query('SELECT * FROM requests');
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
      return NextResponse.json({ message: 'Request ID is required' }, { status: 400 });
    }

    const updateFields = await request.json();
    
    const updates = Object.keys(updateFields)
      .filter(key => updateFields[key] !== undefined)
      .map(key => `${key} = ?`);
    
    if (updates.length === 0) {
      return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
    }

    const query = `
      UPDATE requests 
      SET ${updates.join(', ')}
      WHERE id_request = ?
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
      return NextResponse.json({ message: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Request updated successfully' }, { status: 200 });

  } catch (error) {
    console.error('Failed to update request:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE
export async function DELETE(request: Request) {
  const pool = initDB();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ message: 'Request ID is required' }, { status: 400 });
  }

  try {
    const [result] = await pool.query('DELETE FROM requests WHERE id_request = ?', [id]);
    
    const affectedRows = (result as OkPacket).affectedRows;
    
    if (affectedRows === 0) {
      return NextResponse.json({ message: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Request deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Failed to delete request:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// OPTIONS
export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Allow': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS'
    },
  });
}

export const config = {
  matcher: [
    '/job/:path*',
    '/profile/:path*',
    '/chat/:path*',
    '/api/job/:path*',
    '/api/user/:path*',
    '/api/chat/:path*',
    '/api/request/:path*',
  ]
}; 