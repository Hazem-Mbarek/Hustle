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
    employee_id: number;
    employer_id: number;
}

// Main POST handler
export async function POST(request: Request) {
  const pool = initDB();
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  try {
    if (type === 'message') {
      // Handle message creation
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
      // Handle chat creation
      const chatData: ChatData = await request.json();
      
      // Check if chat already exists between these users
      const [existingChats] = await pool.query(
        `SELECT * FROM chats 
         WHERE (employee_id = ? AND employer_id = ?) 
         OR (employee_id = ? AND employer_id = ?)`,
        [
          chatData.employee_id, 
          chatData.employer_id,
          chatData.employer_id, 
          chatData.employee_id
        ]
      );

      // If chat exists, return the existing chat
      if ((existingChats as any[]).length > 0) {
        return NextResponse.json({ 
          message: 'Chat already exists',
          id: (existingChats as any[])[0].chat_id
        }, { status: 200 });
      }

      // If chat doesn't exist, create new chat
      const [result] = await pool.query(
        `INSERT INTO chats (employee_id, employer_id) VALUES (?, ?)`,
        [chatData.employee_id, chatData.employer_id]
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
  const user_id = searchParams.get('user_id');

  try {
    if (type === 'messages') {
      if (!chat_id) {
        return NextResponse.json({ message: 'Chat ID is required' }, { status: 400 });
      }
      const [rows] = await pool.query('SELECT * FROM messages WHERE chat_id = ?', [chat_id]);
      return NextResponse.json(rows);
    } else {
      if (!user_id) {
        return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
      }
      const [rows] = await pool.query(
        `SELECT c.*, 
          e.first_name as employee_first_name, 
          e.last_name as employee_last_name,
          em.first_name as employer_first_name, 
          em.last_name as employer_last_name 
        FROM chats c
        LEFT JOIN users e ON c.employee_id = e.id_user
        LEFT JOIN users em ON c.employer_id = em.id_user
        WHERE c.employee_id = ? OR c.employer_id = ?`,
        [user_id, user_id]
      );
      return NextResponse.json(rows);
    }
  } catch (error) {
    console.error('Database query failed:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// Add this new DELETE handler alongside your existing GET and POST handlers
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

      const [result] = await pool.query(
        'DELETE FROM messages WHERE message_id = ?',
        [message_id]
      );

      return NextResponse.json({ message: 'Message deleted successfully' });
    } else {
      // Handle chat deletion if needed
      if (!chat_id) {
        return NextResponse.json({ message: 'Chat ID is required' }, { status: 400 });
      }

      // First delete all messages in the chat
      await pool.query('DELETE FROM messages WHERE chat_id = ?', [chat_id]);
      
      // Then delete the chat itself
      await pool.query('DELETE FROM chats WHERE chat_id = ?', [chat_id]);

      return NextResponse.json({ message: 'Chat deleted successfully' });
    }
  } catch (error) {
    console.error('Delete operation failed:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// Add this new PUT handler alongside your existing handlers
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
      
      const [result] = await pool.query(
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