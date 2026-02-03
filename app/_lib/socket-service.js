'use server';

import { createClient } from '@supabase/supabase-js';
import { auth } from '../_lib/auth';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

export async function loadRoomMessages({ roomName = 'General Room', roomId }) {
  const session = await auth();

  if (!session?.user?.id) {
    return [];
  }

  // Step 1: Find room by id (if provided) or by name
  let query = supabaseAdmin.from('rooms').select('id');

  if (roomId) {
    query = query.eq('id', roomId);
  } else {
    query = query.eq('name', roomName);
  }

  let { data: rooms, error: findError } = await query;

  if (findError) throw findError;

  let room;

  // Step 2: If not found and no roomId was given → create it
  if (!rooms?.length) {
    if (roomId) {
      throw new Error('Room not found');
    }

    // Assume unique constraint on rooms(name). If concurrent creates happen,
    // one will succeed, others will hit 23505 and we re-query.
    const { data: newRoom, error: insertError } = await supabaseAdmin
      .from('rooms')
      .insert({ name: roomName, creator_id: session.user.id })
      .select('id');

    if (insertError) {
      if (insertError.code === '23505') {
        // Another request created it — fetch it
        const { data: fallbackRooms } = await supabaseAdmin
          .from('rooms')
          .select('id')
          .eq('name', roomName);
        room = fallbackRooms?.[0];
        console.log('Room created concurrently — using existing:', room?.id);
      } else {
        throw insertError;
      }
    } else {
      room = newRoom?.[0];
      console.log('New room created:', room?.id);
    }
  } else {
    room = rooms[0];
    console.log('Existing room found:', room.id);
  }

  if (!room?.id) {
    throw new Error('Failed to resolve room');
  }

  // Step 3: Ensure user is a member (idempotent insert)
  const { error: memberError } = await supabaseAdmin
    .from('room_members')
    .insert({ room_id: room.id, user_id: session.user.id });

  if (memberError) {
    if (memberError.code === '23505') {
      console.log('User already a member — ignoring duplicate');
    } else {
      throw memberError;
    }
  }

  // Step 4: Load messages
  const { data: messages, error: msgError } = await supabaseAdmin
    .from('messages')
    .select('*')
    .eq('room_id', room.id)
    .order('created_at', { ascending: true });

  if (msgError) throw msgError;

  return messages || [];
}

export async function uploadMessage(payload) {
  const session = await auth();

  if (!session?.user?.id) {
    return;
  }

  if (!payload?.room_id) {
    throw new Error('Missing room_id in payload');
  }

  // Security: verify membership
  const { data: members, error: checkError } = await supabaseAdmin
    .from('room_members')
    .select('user_id')
    .eq('room_id', payload.room_id)
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (checkError) throw checkError;
  if (!members) {
    throw new Error('Forbidden: You are not a member of this room');
  }

  // Insert message with correct user_id
  const messageToInsert = {
    ...payload,
    user_id: session.user.id,
  };

  const { data, error } = await supabaseAdmin.from('messages').insert([messageToInsert]).select();

  if (error) throw error;

  return data[0];
}

export async function retriveRoomRecord() {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  const { data: room, error } = await supabaseAdmin
    .from('rooms')
    .select('*')
    .eq('creator_id', session.user.id)
    .eq('name', 'General Room');

  return room?.[0].id || null;
}

export async function returnVisitorSays(payload) {
  return payload;
}
