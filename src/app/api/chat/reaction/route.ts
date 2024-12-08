import { NextResponse } from 'next/server';
import { initDB } from '@/lib/db';

export async function POST(request: Request) {
  const pool = initDB();
  
  try {
    const { message_id, reaction } = await request.json();

    // First, get the current reaction
    const [currentReaction] = await pool.query(
      'SELECT reaction FROM messages WHERE message_id = ?',
      [message_id]
    );

    // If the current reaction is the same as the new one, remove it
    const newReaction = (currentReaction as any[])[0]?.reaction === reaction ? null : reaction;

    // Update the message with the new reaction (or null to remove it)
    await pool.query(
      'UPDATE messages SET reaction = ? WHERE message_id = ?',
      [newReaction, message_id]
    );

    return NextResponse.json({ 
      message: 'Reaction updated successfully',
      reaction: newReaction
    });
  } catch (error) {
    console.error('Failed to update reaction:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error' 
    }, { status: 500 });
  }
} 