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
  const role = searchParams.get('role') || '';
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
      SELECT id_user, email, first_name, last_name, role, created_at
      FROM Users
      WHERE role != 'admin'
      AND (email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)
    `;
    
    const params = [`%${search}%`, `%${search}%`, `%${search}%`];
    
    if (role) {
      query += ` AND role = ?`;
      params.push(role);
    }
    
    query += ` ORDER BY ${sortBy} ${sortOrder}`;
    
    const [users] = await pool.query(query, params);
    return NextResponse.json(users);

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
} 