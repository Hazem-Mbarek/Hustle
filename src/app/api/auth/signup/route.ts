import { NextResponse } from 'next/server';
import { initDB } from '@/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { OkPacket } from 'mysql2';

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
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    
    // Generate verification token
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

    return NextResponse.json({ 
      message: 'User registered successfully',
      id: (result as OkPacket).insertId,
      verification_token: verificationToken
    }, { status: 201 });

  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ 
        message: 'Email already exists' 
      }, { status: 409 });
    }
    console.error('Failed to create user:', error);
    return NextResponse.json({ 
      message: 'Internal Server Error' 
    }, { status: 500 });
  }
} 