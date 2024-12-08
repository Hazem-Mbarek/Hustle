import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { initDB } from '@/lib/db';

export async function GET(req: Request) {
  const pool = initDB();
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth_token');
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const state = searchParams.get('state') || '';
  const sortBy = searchParams.get('sortBy') || 'created_at';
  const sortOrder = searchParams.get('sortOrder') || 'desc';

  if (!authToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(authToken.value, process.env.JWT_SECRET!) as any;
    if (decoded.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    let query = `
      SELECT id_job, title, category, state, pay, location, created_at
      FROM Jobs
      WHERE (title LIKE ? OR description LIKE ?)
    `;
    
    const params = [`%${search}%`, `%${search}%`];
    
    if (category && category !== 'all') {
      query += ` AND category = ?`;
      params.push(category);
    }

    if (state && state !== 'all') {
      query += ` AND state = ?`;
      params.push(state);
    }
    
    query += ` ORDER BY ${sortBy} ${sortOrder}`;
    
    const [jobs] = await pool.query(query, params);
    return NextResponse.json(jobs);

  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const pool = initDB();
  
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token');
    const { searchParams } = new URL(req.url);
    const jobId = parseInt(searchParams.get('id') || '', 10);

    if (!authToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!jobId || isNaN(jobId)) {
      return NextResponse.json({ message: 'Invalid Job ID' }, { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const decoded = jwt.verify(authToken.value, process.env.JWT_SECRET!) as any;
    if (decoded.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute('DELETE FROM Jobs WHERE id_job = ?', [jobId]);
      
      if (!(result as any).affectedRows) {
        return NextResponse.json({ message: 'Job not found' }, { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return NextResponse.json({ 
        success: true,
        message: 'Job deleted successfully' 
      }, {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Failed to delete job',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}