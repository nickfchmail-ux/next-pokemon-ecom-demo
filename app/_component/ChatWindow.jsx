'use client';

import { createClient } from '@supabase/supabase-js';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { loadRoomMessages, uploadMessage } from '../_lib/socket-service';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_KEY
);

export default function ChatWindow({ header, open, cancelChat, onMouseOver, roomId }) {
  const uuid = crypto.randomUUID();
  const queryClient = useQueryClient();
  const scrollRef = useRef(null);
  const clientId = useRef(null);
  // Add roomId prop if needed
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const currentChannel = useRef(null);
  const { data, isPending } = useQuery({
    queryKey: ['roomMessages'],
    enabled: open && !!roomId,
    queryFn: () => loadRoomMessages({ roomId }),
    onSuccess: (data) => {
      setMessages(data);
    },
  });

  const {
    mutate: sendMessage,
    isPending: isSendingMessage,
    error: sendError,
  } = useMutation({
    mutationFn: (newMsg) => uploadMessage(newMsg),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['roomMessages'] });
    },
    onError: (error) => {},
  });

  useEffect(() => {
    if (!roomId?.length > 0 && !clientId.current) {
      clientId.current = crypto.randomUUID();
      console.log('Generated persistent client ID:', clientId.current); // for debugging
    }
  }, [roomId]); // runs when roomId changes (or on mount)

  useEffect(() => {
    if (isPending) return;

    setMessages(data ?? []);
  }, [isPending]);

  const filterString = `room_id=eq.${roomId}`;

  // Realtime subscription
  useEffect(() => {
    const channelName = roomId ? `room-${roomId}` : 'visitor-broadcast';
    const channel = supabase.channel(channelName, {
      config: {
        broadcast: {
          self: true, // Temporarily enable to test receiving (even own messages will log)
          ack: true, // Enable server acknowledgments to detect send failures
        },
      },
    });

    if (roomId?.length > 0) {
      channel.on(
        'postgres_changes',
        {
          event: '*', // 'INSERT' only; use '*' for all changes
          schema: 'public',
          table: 'messages',
          filter: filterString,
        },
        (payload) => {
          console.log('Received INSERT for room', roomId, payload.new);
          setMessages((prev) => [...prev, payload.new]); // payload.new = the full row
        }
      );
    } else {
      channel.on('broadcast', { event: 'new_message' }, (payload) => {
        console.log(payload);
        const msg = payload.payload;
        console.log(msg.client_id, uuid);
        if (msg.client_id === clientId.current) return; // Ignore own echo

        setMessages((prev) => [...prev, msg]);
      });
    }

    channel.subscribe((status) => {
      console.log('Subscription status:', status);
    });

    currentChannel.current = channel;
    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]); // Run every time messages change

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    let newMsg;

    if (roomId?.length > 0) {
      newMsg = {
        room_id: roomId,
        content: input,
      };
    } else {
      const timestamp = Date.now();
      newMsg = {
        content: input,
        timestamp,
        client_id: clientId.current,
      };
    }

    setMessages((prev) => [...prev, newMsg]);

    try {
      await currentChannel.current.send({
        type: 'broadcast',
        event: 'new_message',
        payload: newMsg,
      });
    } catch (err) {
      console.log(err);
    }

    setInput('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-rows-[auto_1fr_auto] h-full w-full z-50 text-primary-900"
    >
      <h1
        className={`h-min inline-block m-1 text-center ${onMouseOver ? 'text-blue-500' : 'text-primary-900'} font-semibold text-lg`}
      >
        {header}
      </h1>

      <div
        ref={scrollRef}
        className={`overflow-y-auto border-t border-primary-500 flex-1 p-2 ${onMouseOver ? 'text-primary-600' : 'text-primary-900'}`}
      >
        {isPending
          ? 'Loading messages...'
          : messages?.map((msg, i) => {
              console.log('own id: ', clientId.current);

              const isOwnMessage = clientId.current === msg.client_id;

              return (
                <div
                  key={msg.id ?? msg.timestamp ?? `fallback-${i}`}
                  className={`flex ${isOwnMessage ? 'justify-end' : ''}`}
                >
                  <li
                    key={i}
                    className={` rounded text-[10px] ${isOwnMessage ? 'bg-green-200' : 'bg-amber-100'} flex self-end w-max list-none rounded-[5px] overflow-hidden mb-1 `}
                  >
                    {!isOwnMessage ? (
                      <div className="h-full w-full">
                        <li className="flex gap-1 bg-amber-200 h-min w-full px-2 py-1">
                          <img src={'/trianerIcon.png'} className="h-3 w-3 " />
                          {msg.client_id.slice(-3)} :
                        </li>
                        <li className={`px-2 py-1`}>{msg.content}</li>
                      </div>
                    ) : (
                      <li className={`px-2 py-1`}>{msg.content}</li>
                    )}
                  </li>
                </div>
              );
            })}
      </div>

      <div className="flex flex-col mt-auto">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="w-full max-w-md mx-auto mb-2 bg-white border border-amber-200 px-2  rounded focus:outline-none focus:border-amber-400 transition"
        />
        <div className="flex justify-between px-2 py-1">
          <button
            type="button"
            onClick={() => cancelChat(false)}
            className="text-xs px-3 py-1 bg-red-100 text-red-500 border border-red-400 rounded-full hover:bg-red-200 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="text-xs px-3 py-1 bg-blue-100 text-blue-500 border border-blue-400 rounded-full hover:bg-blue-200 transition"
          >
            Send
          </button>
        </div>
      </div>
    </form>
  );
}
