import { NextResponse } from 'next/server';
import { initDB } from '@/lib/db';
import { OkPacket } from 'mysql2';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

interface UserData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  email_verified?: boolean;
  password_token?: string;
  login_attempts?: number;
  block_account?: boolean;
  verification_token?: string;
}

// CREATE (POST) - Register new user
export async function POST(request: Request) {
  const pool = initDB();

  try {
    const userData: UserData = await request.json();
    
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

// READ (GET)
export async function GET(request: Request) {
  const pool = initDB();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const email = searchParams.get('email');

  try {
    if (id) {
      const [rows] = await pool.query(
        'SELECT id_user, email, first_name, last_name, email_verified, created_at FROM Users WHERE id_user = ?', 
        [id]
      );
      const users = rows as any[];
      
      if (users.length === 0) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
      }
      
      return NextResponse.json(users[0]);
    } else if (email) {
      const [rows] = await pool.query(
        'SELECT id_user, email, first_name, last_name, email_verified, created_at FROM Users WHERE email = ?', 
        [email]
      );
      const users = rows as any[];
      
      if (users.length === 0) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
      }
      
      return NextResponse.json(users[0]);
    } else {
      const [rows] = await pool.query(
        'SELECT id_user, email, first_name, last_name, email_verified, created_at FROM Users'
      );
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
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    const updateFields = await request.json();
    
    // Don't allow direct password updates through this endpoint
    delete updateFields.password;
    
    const updates = Object.keys(updateFields)
      .filter(key => updateFields[key] !== undefined)
      .map(key => `${key} = ?`);
    
    if (updates.length === 0) {
      return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
    }

    const query = `
      UPDATE Users 
      SET ${updates.join(', ')}
      WHERE id_user = ?
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
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User updated successfully' }, { status: 200 });

  } catch (error) {
    console.error('Failed to update user:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE
export async function DELETE(request: Request) {
  const pool = initDB();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
  }

  try {
    const [result] = await pool.query('DELETE FROM Users WHERE id_user = ?', [id]);
    
    const affectedRows = (result as OkPacket).affectedRows;
    
    if (affectedRows === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// OPTIONS (for CORS)
export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Allow': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS'
    },
  });
} 