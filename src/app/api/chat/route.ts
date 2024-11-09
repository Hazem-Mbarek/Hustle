// src/app/api/chat/route.ts
import { NextResponse } from 'next/server';
import { initDB } from '@/lib/db';
import { ResultSetHeader } from 'mysql2';

interface MessageData {
  chat_id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  attachment?: string;
}

interface ChatData {
    profile_id_1: number;
    profile_id_2: number;
}

// Main POST handler
export async function POST(request: Request) {
  const pool = initDB();
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  try {
    if (type === 'message') {
      const messageData: MessageData = await request.json();
      
      const [result] = await pool.query(
        `INSERT INTO messages (
          chat_id, sender_id, receiver_id, content, attachment, time, read_status
        ) VALUES (?, ?, ?, ?, ?, NOW(), ?)`,
        [
          messageData.chat_id,
          messageData.sender_id,
          messageData.receiver_id,
          messageData.content,
          messageData.attachment || null,
          false
        ]
      );

      return NextResponse.json({ 
        message: 'Message sent successfully',
        id: (result as ResultSetHeader).insertId 
      }, { status: 201 });
    } else {
      const chatData: ChatData = await request.json();
      
      // Check if chat already exists between these users
      const [existingChats] = await pool.query(
        `SELECT * FROM chats 
         WHERE (profile_id_1 = ? AND profile_id_2 = ?) 
         OR (profile_id_1 = ? AND profile_id_2 = ?)`,
        [
          chatData.profile_id_1, 
          chatData.profile_id_2,
          chatData.profile_id_2, 
          chatData.profile_id_1
        ]
      );

      if ((existingChats as any[]).length > 0) {
        return NextResponse.json({ 
          message: 'Chat already exists',
          id: (existingChats as any[])[0].chat_id
        }, { status: 200 });
      }

      const [result] = await pool.query(
        `INSERT INTO chats (profile_id_1, profile_id_2) VALUES (?, ?)`,
        [chatData.profile_id_1, chatData.profile_id_2]
      );

      return NextResponse.json({ 
        message: 'Chat created successfully',
        id: (result as ResultSetHeader).insertId 
      }, { status: 201 });
    }
  } catch (error) {
    console.error('Operation failed:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// Main GET handler
export async function GET(request: Request) {
  const pool = initDB();
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const chat_id = searchParams.get('chat_id');
  const profile_id = searchParams.get('profile_id');

  try {
    if (type === 'messages') {
      if (!chat_id) {
        return NextResponse.json({ message: 'Chat ID is required' }, { status: 400 });
      }
      const [rows] = await pool.query('SELECT * FROM messages WHERE chat_id = ?', [chat_id]);
      return NextResponse.json(Array.isArray(rows) ? rows : []);
    } else {
      if (!profile_id) {
        return NextResponse.json({ message: 'Profile ID is required' }, { status: 400 });
      }
      const [rows] = await pool.query(
        `SELECT 
          c.chat_id,
          c.profile_id_1,
          c.profile_id_2,
          CASE 
            WHEN c.profile_id_1 = ? THEN u2.first_name
            ELSE u1.first_name
          END as profile2_first_name,
          CASE 
            WHEN c.profile_id_1 = ? THEN u2.last_name
            ELSE u1.last_name
          END as profile2_last_name
        FROM chats c
        LEFT JOIN profiles p1 ON c.profile_id_1 = p1.id_profile
        LEFT JOIN profiles p2 ON c.profile_id_2 = p2.id_profile
        LEFT JOIN users u1 ON p1.id_user = u1.id_user
        LEFT JOIN users u2 ON p2.id_user = u2.id_user
        WHERE p1.id_profile = ? OR p2.id_profile = ?
        ORDER BY c.chat_id DESC`,
        [profile_id, profile_id, profile_id, profile_id]
      );
      return NextResponse.json(Array.isArray(rows) ? rows : []);
    }
  } catch (error) {
    console.error('Database query failed:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE handler
export async function DELETE(request: Request) {
  const pool = initDB();
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const message_id = searchParams.get('message_id');
  const chat_id = searchParams.get('chat_id');

  try {
    if (type === 'message') {
      if (!message_id) {
        return NextResponse.json({ message: 'Message ID is required' }, { status: 400 });
      }

      await pool.query('DELETE FROM messages WHERE message_id = ?', [message_id]);
      return NextResponse.json({ message: 'Message deleted successfully' });
    } else {
      if (!chat_id) {
        return NextResponse.json({ message: 'Chat ID is required' }, { status: 400 });
      }

      await pool.query('DELETE FROM messages WHERE chat_id = ?', [chat_id]);
      await pool.query('DELETE FROM chats WHERE chat_id = ?', [chat_id]);
      return NextResponse.json({ message: 'Chat deleted successfully' });
    }
  } catch (error) {
    console.error('Delete operation failed:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT handler
export async function PUT(request: Request) {
  const pool = initDB();
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const message_id = searchParams.get('message_id');

  try {
    if (type === 'message') {
      if (!message_id) {
        return NextResponse.json({ message: 'Message ID is required' }, { status: 400 });
      }

      const { content } = await request.json();
      await pool.query(
        'UPDATE messages SET content = ? WHERE message_id = ?',
        [content, message_id]
      );

      return NextResponse.json({ message: 'Message updated successfully' });
    }
    
    return NextResponse.json({ message: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('Update operation failed:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export const config = {
  matcher: [
    '/job/:path*',
    '/profile/:path*',
    '/api/job/:path*',
    '/api/user/:path*',
  ]
};