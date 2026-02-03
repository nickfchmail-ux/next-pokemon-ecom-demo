// app/api/socket/route.ts
import { NextResponse } from 'next/server';
import { Server } from 'socket.io';

let io;
export async function GET(req) {
  if (!io) {
    // Attach to a dummy server or use Vercel-compatible setup
    io = new Server({
      path: '/api/socket',
      addTrailingSlash: false,
    });

    await io.use(async (socket, next) => {
      const token = socket.handshake.auth.token;
      console.log('user is trying to connect with token: ', token);
      if (!token) return next(new Error('Unauthorized'));

      try {
        const payload = await getToken({ token, secret: process.env.NEXTAUTH_SECRET, raw: true });
        if (!payload?.id) return next(new Error('Invalid token'));
        socket.data.userId = payload.id;
        next();
      } catch {
        next(new Error('Invalid token'));
      }
    });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.data.userId);
      io.emit('connected', { message: 'Welcome!' });

      socket.on('new_message', (data) => {
        console.log('Received message:', data);

        // Re-broadcast to all connected clients
        io.emit('new_message', data);
      });
    });
  }

  return NextResponse.json({ message: 'Socket ready' });
}
