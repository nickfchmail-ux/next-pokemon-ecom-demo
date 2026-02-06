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
  const [anonymousUser, setAnonymousUser] = useState(0);
  const [loggedInUser, setLoggedInUser] = useState(0);
  const uuid = crypto.randomUUID();
  const queryClient = useQueryClient();
  const bottomRef = useRef(null);
  const clientId = useRef(null);
  // Add roomId prop if needed
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const currentChannel = useRef(null);

  const user = useSelector((state) => state.user.user);
  const room = useSelector((state) => state.user.chatRoomId);

  const { data, isPending: isSettingMessages } = useQuery({
    queryKey: ['roomMessages'],
    enabled: open && !!roomId,
    queryFn: () => loadRoomMessages({ roomId: room }),
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
    if (!user && !room) {
      clientId.current = crypto.randomUUID();
    }
  }, [roomId]); // runs when roomId changes (or on mount)

  useEffect(() => {
    if (isSettingMessages) return;
    const sortByTime = data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    setMessages(sortByTime ?? []);
  }, [isSettingMessages]);

  const filterString = `room_id=eq.${room}`;

  // Realtime subscription
  useEffect(() => {
    const channelName = !!room ? `member-channel` : 'visitor-broadcast';
    let channel = supabase.channel(channelName, {
      config: {
        broadcast: {
          self: true, // Temporarily enable to test receiving (even own messages will log)
          ack: true, // Enable server acknowledgments to detect send failures
        },
      },
    });
    // current users in chat room
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const count = Object.keys(state).length;

      if (user) {
           setLoggedInUser(count);
        dispatch(setLoggedInUserAction(count));
      } else {
        setAnonymousUser(count);
        dispatch(setAnonymousUserAction(count));
      }
    });

    if (!!(user && room)) {
      channel.on(
        'postgres_changes',
        {
          event: 'INSERT', // 'INSERT' only; use '*' for all changes
          schema: 'public',
          table: 'messages',
          filter: filterString,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]); // payload.new = the full row
        }
      );

      let anonymousChannel = supabase.channel('visitor-broadcast');

      anonymousChannel.on('presence', { event: 'sync' }, () => {
        const state = anonymousChannel.presenceState();

        const anonCount = Object.keys(state).length;

        dispatch(setAnonymousUserAction(anonCount));
      });

      anonymousChannel.subscribe();
    } else {
      channel.on('broadcast', { event: 'new_message' }, (payload) => {
        const msg = payload.payload;

        if (msg.client_id === clientId.current) return; // Ignore own echo

        setMessages((prev) => [...prev, msg]);
      });

      let loggedInChannel = supabase.channel('member-channel');
      loggedInChannel.on('presence', { event: 'sync' }, () => {
        const state = loggedInChannel.presenceState();
        const loggedInCount = Object.keys(state).length;

        dispatch(setLoggedInUserAction(loggedInCount));
      });

      loggedInChannel.subscribe();
    }

    // Single subscribe + track presence
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ online: true });
      }
    });

    currentChannel.current = channel;
    return () => {
      currentChannel.current?.untrack();
      supabase.removeChannel(channel);
    };
  }, [user, room]);

  useEffect(() => {
    const container = bottomRef.current;
    if (!container) return;

    const wasInitial = prevMessagesLength.current <= 0;

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

    let newMsg;

    if (room && user) {
      newMsg = {
        room_id: roomId,
        content: input,
      };
      sendMessage(newMsg);
    } else {
      const timestamp = Date.now();
      newMsg = {
        content: input,
        timestamp,
        client_id: clientId.current,
      };

      try {
        await currentChannel.current.send({
          type: 'broadcast',
          event: 'new_message',
          payload: newMsg,
        });
        setMessages((prev) => [...prev, newMsg]);
      } catch (err) {
        console.log(err);
      }
    }

    setInput('');
  };
  const isLoggedInMode = !!(user && roomId);

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
        ref={bottomRef}
        className={`overflow-y-auto border-t border-primary-500 flex-1 p-2 ${onMouseOver ? 'text-primary-600' : 'text-primary-900'}`}
      >
        {roomId && isSettingMessages
          ? 'Loading messages...'
          : messages?.map((msg, i) => {
              const isOwnMessage = isLoggedInMode
                ? msg.user_id === user?.id
                : clientId.current === msg.client_id;

              const senderLabel = isLoggedInMode
                ? user.name || user.email
                : msg.client_id?.slice(-3) || '???';

              return (
                <div
                  key={msg.id ?? msg.timestamp ?? msg.created_at ?? `msg-${i}`}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-2`}
                >
                  <div
                    className={`
          max-w-[75%] w-fit rounded-lg px-3 py-2 text-sm
          ${isOwnMessage ? 'bg-green-200' : 'bg-amber-100'}
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
        <div ref={bottomRef} />
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
