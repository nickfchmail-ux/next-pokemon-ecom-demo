import { useEffect, useRef } from 'react';

export default function AiChatRoom({ aiQuery, setAiQuery }) {
  const scrollContainerRef = useRef(null);
  const prevMessagesLength = useRef(0);
  // Auto-scroll to bottom
  useEffect(() => {
    if (!aiQuery?.length) return;
    const container = scrollContainerRef.current;

    if (!container) return;

    const wasInitial = prevMessagesLength.current === 0;
    const behavior = wasInitial ? 'auto' : 'smooth';

    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    });

    prevMessagesLength.current = aiQuery.length;
  }, [aiQuery]);
  return (
    <div ref={scrollContainerRef} className={`flex-1   overflow-y-auto`}>
      {aiQuery.map((msg, i) => (
        <div key={`ai-client-msg-${i}`} className={`flex justify-end list-none`}>
          <li className={`w-max bg-amber-100 m-1 p-2 text-sm rounded-[6px] text-primary-900`}>
            {msg}
          </li>
        </div>
      ))}
    </div>
  );
}
