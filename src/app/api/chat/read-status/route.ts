import { NextResponse } from 'next/server';
import { initDB } from '@/lib/db';

export async function PUT(request: Request) {
  const pool = initDB();
  
  try {
    const { chat_id, receiver_id } = await request.json();

    const [result] = await pool.query(
      `UPDATE messages 
       SET read_status = true 
       WHERE chat_id = ? AND receiver_id = ? AND read_status = false`,
      [chat_id, receiver_id]
    );

    // Fetch updated messages
    const [updatedMessages] = await pool.query(
      `SELECT * FROM messages WHERE chat_id = ? ORDER BY time ASC`,
      [chat_id]
    );

    return NextResponse.json({ 
      message: 'Messages marked as read',
      messages: updatedMessages
    });
  } catch (error) {
    console.error('Failed to update read status:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}