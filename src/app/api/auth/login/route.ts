import { NextResponse } from 'next/server';
import { initDB } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  const pool = initDB();
  
  try {
    const { email, password } = await request.json();

    const [rows] = await pool.query(
      'SELECT id_user, email, password, first_name, last_name, role FROM Users WHERE email = ?',
      [email]
    );
    const users = rows as any[];

    if (users.length === 0) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user.id_user,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        role: user.role
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Set HTTP-only cookie
    const response = NextResponse.json(
      { 
        message: 'Login successful',
        user: {
          id: user.id_user,
          email: user.email,
          name: `${user.first_name} ${user.last_name}`,
          role: user.role
        }
      },
      { status: 200 }
    );

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400 // 24 hours
    });

    // Set profile creation token if coming from signup
    const isFromSignup = request.headers.get('X-From-Signup') === 'true';
    if (isFromSignup) {
      response.cookies.set('profile_creation_token', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 300 // 5 minutes
      });
    }

    return response;

  } catch (error) {
    console.error('Login failed:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
} 