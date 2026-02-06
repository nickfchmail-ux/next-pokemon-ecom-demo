'use client';

import { createClient } from '@supabase/supabase-js';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState, useTransition } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadRoomMessages, uploadMessage } from '../_lib/socket-service';
import {
  setAnonymousUserAction,
  setLoggedInUserAction,
} from '../_state/_global/chatRoom/chatRoomSlice';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_KEY
);

export default function ChatWindow({ header, open, cancelChat, onMouseOver, roomId }) {
  const dispatch = useDispatch();
  const [isPending, startTransition] = useTransition();
  const prevMessagesLength = useRef(0);
  const queryClient = useQueryClient();
  const scrollContainerRef = useRef(null);
  const clientId = useRef(null);
  const currentChannelRef = useRef(null);
  const otherChannelRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const user = useSelector((state) => state.user.user);

  const isLoggedInMode = !!user && !!roomId;

  const { data, isPending: isLoadingMessages } = useQuery({
    queryKey: ['roomMessages', roomId],
    enabled: open && !!roomId,
    queryFn: () => loadRoomMessages({ roomId: roomId }),
    onSuccess: (data) => {
      setMessages(data || []);
    },
  });

  const { mutate: sendMessage, isPending: isSendingMessage } = useMutation({
    mutationFn: (newMsg) => uploadMessage(newMsg),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roomMessages', roomId] });
    },
  });

  // Generate client ID for anonymous visitors (once per session)
  useEffect(() => {
    if (!isLoggedInMode && !clientId.current) {
      clientId.current = crypto.randomUUID();
    }
  }, [isLoggedInMode]);

  // Realtime subscription
  useEffect(() => {
    const channelName = isLoggedInMode ? 'member-channel' : 'visitor-broadcast';
    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { self: true, ack: true },
      },
    });

    // Presence for the main channel (logged-in or anonymous count)
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const count = Object.keys(state).length;
      if (isLoggedInMode) {
        dispatch(setLoggedInUserAction(count));
      } else {
        dispatch(setAnonymousUserAction(count));
      }
    });

    if (isLoggedInMode) {
      // Listen for new messages in this specific room
      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      );

      // Subscribe to visitor channel to get anonymous count
      const visitorChan = supabase.channel('visitor-broadcast');
      visitorChan.on('presence', { event: 'sync' }, () => {
        const state = visitorChan.presenceState();
        const anonCount = Object.keys(state).length;
        dispatch(setAnonymousUserAction(anonCount));
      });
      visitorChan.subscribe();
      otherChannelRef.current = visitorChan;
    } else {
      // Broadcast listener for anonymous chat
      channel.on('broadcast', { event: 'new_message' }, (payload) => {
        const msg = payload.payload;

        if (msg.client_id === clientId.current) return;

        console.log('previous messages: ', messages);
        setMessages((prev) => [...prev, msg]);
        console.log('updated message: ', messages);
      });

      // Subscribe to member channel to get logged-in count
      const memberChan = supabase.channel('member-channel');
      memberChan.on('presence', { event: 'sync' }, () => {
        const state = memberChan.presenceState();
        const loggedCount = Object.keys(state).length;
        dispatch(setLoggedInUserAction(loggedCount));
      });
      memberChan.subscribe();
      otherChannelRef.current = memberChan;
    }

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ online: true });
      }
    });

    currentChannelRef.current = channel;

    return () => {
      currentChannelRef.current?.untrack();
      supabase.removeChannel(currentChannelRef.current);
      if (otherChannelRef.current) {
        supabase.removeChannel(otherChannelRef.current);
        otherChannelRef.current = null;
      }
    };
  }, [isLoggedInMode, roomId, dispatch]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (!messages?.length) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const wasInitial = prevMessagesLength.current === 0;
    const behavior = wasInitial ? 'auto' : 'smooth';

    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    });

    prevMessagesLength.current = messages.length;
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (isLoggedInMode) {
      const newMsg = {
        room_id: roomId,
        content: input,
        name: user.name,
      };
      sendMessage(newMsg);
    } else {
      const newMsg = {
        content: input,
        timestamp: Date.now(),
        client_id: clientId.current,
      };

      try {
        await currentChannelRef.current.send({
          type: 'broadcast',
          event: 'new_message',
          payload: newMsg,
        });
        setMessages((prev) => [...prev, newMsg]);
      } catch (err) {
        console.error('Broadcast failed:', err);
      }
    }

    setInput('');
  };

  useEffect(() => {
    if (!data?.length > 0) return;
    const sortedData = data?.sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    setMessages(sortedData);
  }, [isLoadingMessages]);

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
        ref={scrollContainerRef}
        className={`overflow-y-auto border-t border-primary-500 flex-1 p-2 ${onMouseOver ? 'text-primary-600' : 'text-primary-900'}`}
      >
        {roomId && isLoadingMessages
          ? 'Loading messages...'
          : messages?.map((msg, i) => {
              const isOwnMessage = isLoggedInMode
                ? msg.user_id === user?.id
                : msg.client_id === clientId.current;

              const shortId = msg?.client_id?.slice(-4) || '????';

              const senderLabel = isLoggedInMode ? `${msg.name} ` : `Guest (${shortId})`;

              return (
                <div
                  key={msg.id ?? msg.timestamp ?? msg.created_at ?? `msg-${i}`}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-2`}
                >
                  <div
                    className={`
                      max-w-[75%] w-fit rounded-lg px-3 py-2 text-sm
                      ${!isOwnMessage ? 'bg-green-200' : 'bg-amber-100'}
                    `}
                  >
                    {!isOwnMessage && (
                      <div className="flex items-center gap-1 mb-1 opacity-75">
                        <img src="/trianerIcon.png" alt="" className="h-4 w-4" />
                        <span className="text-xs">{senderLabel}:</span>
                      </div>
                    )}
                    <div className="break-all whitespace-pre-wrap">{msg.content}</div>
                  </div>
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
          className="w-full max-w-md mx-auto mb-2 bg-white border border-amber-200 px-2 rounded focus:outline-none focus:border-amber-400 transition"
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
            disabled={isSendingMessage}
            className="text-xs px-3 py-1 bg-blue-100 text-blue-500 border border-blue-400 rounded-full hover:bg-blue-200 transition"
          >
            Send
          </button>
        </div>
      </div>
    </form>
  );
}
