'use client';

import { createClient } from '@supabase/supabase-js';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Activity, useEffect, useRef, useState, useTransition } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deepSeekApiQuery } from '../_lib/deepseek-service';
import { loadRoomMessages, uploadMessage } from '../_lib/socket-service';

import AiChatRoom from './AiChatRoom';
import UserChatRoom from './UserChatRoom';
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
  const [switchToAiChat, setSwitchToAiChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [aiQuery, setAiQuery] = useState([]);
  const user = useSelector((state) => state.user.user);

  const isLoggedInMode = !!user && !!roomId;

  const { data, isPending: isLoadingMessages } = useQuery({
    queryKey: ['roomMessages', roomId],
    enabled: open && !!roomId,
    queryFn: () => loadRoomMessages({ roomId: roomId }),
    onSuccess: (data) => {
      if (!data?.length > 0) return;
      const sorted = (data || []).sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      setMessages(sorted);
    },
  });

  const { mutate: sendMessage, isPending: isSendingMessage } = useMutation({
    mutationFn: (newMsg) => uploadMessage(newMsg),
  });

  const { mutate: sendQueryToDeepSeek, isPending: isSendingDeepSeekQuery } = useMutation({
    mutationFn: (content) => deepSeekApiQuery(content),
    onSuccess: (data, content) => {
      const cacheKey = ['deepseek-response', content];
      queryClient.setQueryData(cacheKey, data);
      setAiQuery((prev) => [...prev, data]);
    },
  });

  // Generate client ID for anonymous visitors (once per session)
  useEffect(() => {
    if (!isLoggedInMode && !clientId.current) {
      clientId.current = crypto.randomUUID();
    }
  }, [isLoggedInMode]);

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

    if (switchToAiChat) {
      const cacheKey = ['deepseek-response', input.trim()];

      const returnFromPrevResponseWithTheSameContent = queryClient.getQueryData(cacheKey);
      console.log('prev query: ', returnFromPrevResponseWithTheSameContent);
      if (returnFromPrevResponseWithTheSameContent) {
        let modifiedReturn = { ...returnFromPrevResponseWithTheSameContent };
        modifiedReturn.answer = modifiedReturn.answer + '-repeated ';

        setAiQuery((prev) => [...prev, modifiedReturn]);
      } else {
        console.log('input: ', input.trim());
        sendQueryToDeepSeek(input.trim());
      }
    } else {
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
    }

    setInput('');
  };

  useEffect(() => {
    if (!data) return;
    //sorting messages by time
    const sorted = data?.sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    setMessages(sorted);
  }, [isLoadingMessages]);

  return (
    <div className={`grid grid-rows-[auto_1fr] h-full w-full z-50 text-primary-900`}>
      <div className={`h-min p-2 flex justify-between border border-b-primary-800`}>
        <strong className={`${onMouseOver ? 'text-blue-500' : 'text-primary-900'}`}>
          {header}
        </strong>
        <button
          className={`px-2 py-1 cursor-pointer rounded-full border border-primary-500  ml-1 text-[12px] shadow-accent   ${switchToAiChat ? 'bg-primary-600 shadow-lg border border-primary-950 text-white ' : 'hover:text-primary-900'}`}
          onClick={() => setSwitchToAiChat(!switchToAiChat)}
        >
          On Bot
        </button>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-rows-[auto_1fr_auto] overflow-y-auto">
        <Activity mode={switchToAiChat ? 'hidden' : 'visible'}>
          <UserChatRoom
            roomId={roomId}
            messages={messages}
            isLoadingMessages={isLoadingMessages}
            setMessages={setMessages}
            onMouseOver={onMouseOver}
            currentChannelRef={currentChannelRef}
            clientId={clientId}
          />
        </Activity>

        <Activity mode={switchToAiChat ? 'visible' : 'hidden'}>
          <AiChatRoom
            aiQuery={aiQuery}
            setAiQuery={setAiQuery}
            isPending={isSendingDeepSeekQuery}
          />
        </Activity>

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
              disabled={isSendingMessage || isSendingDeepSeekQuery}
              className={`text-xs px-3 py-1 border ${isSendingMessage || isSendingDeepSeekQuery ? 'bg-gray-300 text-gray-800 border-gray-700' : 'bg-blue-100 text-blue-500  border-blue-400 hover:bg-blue-200'} rounded-full  transition`}
            >
              {isSendingMessage || isSendingDeepSeekQuery ? 'Loading...' : 'Send'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
