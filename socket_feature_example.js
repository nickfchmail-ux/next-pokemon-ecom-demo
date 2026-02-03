//client set up

'use client';

import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { loadRoomMessages } from '@/app/actions';  // Your server action for initial load

export default function RoomMessages({ roomId }: { roomId: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [socket, setSocket] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial messages via secure server action
    const fetchInitial = async () => {
      try {
        const initialData = await loadRoomMessages(roomId);
        setMessages(initialData);
      } catch (error) {
        console.error('Access denied:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();

    // Connect to custom socket
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || '/', {  // e.g., '/' for same origin
      auth: {
        token: 'your-jwt-here',  // Fetch from /api/get-jwt or use cookie forwarding
      },
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      newSocket.emit('join-room', roomId);  // Server checks authorization here
    });

    newSocket.on('join-success', () => {
      console.log('Joined room successfully');
    });

    newSocket.on('join-error', (err) => {
      console.error('Join failed:', err);
    });

    // Listen for new messages (pushed by server)
    newSocket.on('new-message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Optional: update-message, delete-message events

    setSocket(newSocket);

    return () => {
      if (newSocket) newSocket.close();
    };
  }, [roomId]);

  if (loading) return <p>Loading messages...</p>;

  return (
    <div>
      {messages.map((msg) => (
        <p key={msg.id}><strong>User {msg.user_id}:</strong> {msg.content}</p>
      ))}
    </div>
  );
}


//server set up

'use server';

import { auth } from '@/auth';  // Your NextAuth export
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Bypasses RLS, but we manually check authz
);

export async function loadRoomMessages(roomId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  // Manual authorization: Check if user is in the room (example query)
  const { data: membership } = await supabaseAdmin
    .from('room_members')
    .select('user_id')
    .eq('room_id', roomId)
    .eq('user_id', session.user.id)
    .single();

  if (!membership) {
    throw new Error('Forbidden: Not a room member');
  }

  // Fetch messages if authorized
  const { data, error } = await supabaseAdmin
    .from('messages')
    .select('*')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}
