import { NextResponse } from 'next/server';
import { initDB } from '@/lib/db';

interface NotificationData {
  id_profile_receiver: number;
  id_profile_sender: number;
  type: string;
  message: string;
}

// CREATE (POST)
export async function POST(request: Request) {
  const pool = initDB();

  try {
    const body = await request.json();
    const { id_profile_receiver, id_profile_sender, type, message } = body;

    const [result] = await pool.query(
      `INSERT INTO notifications 
       (id_profile_receiver, id_profile_sender, type, message)
       VALUES (?, ?, ?, ?)`,
      [id_profile_receiver, id_profile_sender, type, message]
    );

    return NextResponse.json({ 
      message: 'Notification created successfully',
      notification: {
        id_notification: (result as any).insertId,
        ...body
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Failed to create notification:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// GET notifications
export async function GET(request: Request) {
  const pool = initDB();
  const { searchParams } = new URL(request.url);
  const profile_id = searchParams.get('profile_id');

  if (!profile_id) {
    return NextResponse.json({ message: 'Profile ID is required' }, { status: 400 });
  }

  try {
    // Simplified query without joining profiles table
    const [notifications] = await pool.query(
      `SELECT * FROM notifications 
       WHERE id_profile_receiver = ?
       ORDER BY created_at DESC`,
      [profile_id]
    );

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// Mark notification as read (PATCH)
export async function PATCH(request: Request) {
  const pool = initDB();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ message: 'Notification ID is required' }, { status: 400 });
  }

  try {
    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE id_notification = ?',
      [id]
    );

    return NextResponse.json({ 
      message: 'Notification marked as read'
    }, { status: 200 });

  } catch (error) {
    console.error('Failed to update notification:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE notification
export async function DELETE(request: Request) {
  const pool = initDB();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ message: 'Notification ID is required' }, { status: 400 });
  }

  try {
    await pool.query('DELETE FROM notifications WHERE id_notification = ?', [id]);
    return NextResponse.json({ message: 'Notification deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete notification:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// Update OPTIONS to include new methods
export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Allow': 'GET, POST, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, PATCH, OPTIONS'
    },
  });
}