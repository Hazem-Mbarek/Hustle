import { NextRequest, NextResponse } from 'next/server';
import { Server } from 'socket.io';

// Create a global variable to store the Socket.IO instance
let io: Server;

export const runtime = 'edge'; // Use Edge Runtime

export async function GET(req: NextRequest) {
  const res = new NextResponse();
  
  if (!(res as any).socket?.server?.io) {
    // Initialize Socket.IO if it hasn't been initialized yet
    io = new Server({
      cors: {
        origin: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
    });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('join-chat', (chatId) => {
        console.log(`Socket ${socket.id} joined chat: ${chatId}`);
        socket.join(`chat-${chatId}`);
      });

      socket.on('send-message', async (messageData) => {
        try {
          // Instead of direct DB access, make an API call to your message endpoint
          const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/chat?type=message`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(messageData),
          });

          const result = await response.json();
          
          const newMessage = {
            ...messageData,
            message_id: result.id,
            time: new Date(),
            read_status: false
          };
          
          io.to(`chat-${messageData.chat_id}`).emit('new-message', newMessage);
        } catch (error) {
          console.error('Failed to save message:', error);
        }
      });

      socket.on('mark-as-read', async ({ chat_id, receiver_id }) => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/chat/read-status`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ chat_id, receiver_id }),
          });
          
          const result = await response.json();
          
          // Emit the updated messages to all clients in the chat
          io.to(`chat-${chat_id}`).emit('messages-read', { 
            chat_id, 
            reader_id: receiver_id,
            messages: result.messages 
          });
        } catch (error) {
          console.error('Failed to mark messages as read:', error);
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    // Start the Socket.IO server
    io.listen(3001);

    (res as any).socket.server.io = io;
  }

  return new NextResponse(null, { 
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST',
    },
  });
}