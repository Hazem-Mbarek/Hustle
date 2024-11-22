import { NextResponse } from 'next/server';
import { initDB } from '@/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { OkPacket } from 'mysql2';
import jwt from 'jsonwebtoken';

interface SignupData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export async function POST(request: Request) {
  const pool = initDB();

  try {
    const userData: SignupData = await request.json();
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const [result] = await pool.query(
      `INSERT INTO Users (
        email, password, first_name, last_name, 
        verification_token
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        userData.email,
        hashedPassword,
        userData.first_name,
        userData.last_name,
        verificationToken
      ]
    );

    // Create auth token
    const token = jwt.sign(
      { userId: (result as OkPacket).insertId },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    const response = NextResponse.json({ 
      message: 'User registered successfully',
      id: (result as OkPacket).insertId,
      verification_token: verificationToken
    }, { status: 201 });

    // Set both tokens in cookies
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400 // 24 hours
    });

    response.cookies.set('profile_creation_token', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 300 // 5 minutes
    });

    return response;
  } catch (error) {
    console.error('Failed to create user:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
} 