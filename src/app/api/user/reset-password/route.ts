import { NextResponse } from 'next/server';
import { initDB } from '@/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function POST(request: Request) {
  const pool = initDB();
  const { email } = await request.json();

  try {
    // Generate password reset token
    const passwordToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    const [result] = await pool.query(
      'UPDATE Users SET password_token = ? WHERE email = ?',
      [passwordToken, email]
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Here you would typically send an email with the reset link
    // containing the password_token

    return NextResponse.json({ 
      message: 'Password reset link sent' 
    }, { status: 200 });

  } catch (error) {
    console.error('Password reset failed:', error);
    return NextResponse.json({ 
      message: 'Internal Server Error' 
    }, { status: 500 });
  }
} 