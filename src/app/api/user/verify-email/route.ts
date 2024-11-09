import { NextResponse } from 'next/server';
import { initDB } from '@/lib/db';

export async function POST(request: Request) {
  const pool = initDB();
  const { token } = await request.json();

  try {
    const [result] = await pool.query(
      `UPDATE Users 
       SET email_verified = TRUE, 
           verification_token = NULL 
       WHERE verification_token = ?`,
      [token]
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ 
        message: 'Invalid verification token' 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      message: 'Email verified successfully' 
    }, { status: 200 });

  } catch (error) {
    console.error('Email verification failed:', error);
    return NextResponse.json({ 
      message: 'Internal Server Error' 
    }, { status: 500 });
  }
} 