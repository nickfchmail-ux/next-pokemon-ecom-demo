import { createClient } from '@supabase/supabase-js';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setAnonymousUserAction,
  setLoggedInUserAction,
} from '../_state/_global/chatRoom/chatRoomSlice';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_KEY
);

export default function UserChatRoom({
  roomId,
  messages,
  isLoadingMessages,
  setMessages,
  onMouseOver,
  currentChannelRef,
  clientId,
}) {
  const dispatch = useDispatch();

  const prevMessagesLength = useRef(0);

  const scrollContainerRef = useRef(null);

  const otherChannelRef = useRef(null);

  const user = useSelector((state) => state.user.user);

  const isLoggedInMode = !!user && !!roomId;

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

        setMessages((prev) => [...prev, msg]);
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

  useEffect(() => {
    if (!messages?.length) return;

    //sorting messages by time
    const sorted = messages?.sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    setMessages(sorted);
  }, [messages]);

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

  return (
    <div
      ref={scrollContainerRef}
      className={`overflow-y-auto  flex-1 p-2 ${onMouseOver ? 'text-primary-600' : 'text-primary-900'}`}
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
  );
}
