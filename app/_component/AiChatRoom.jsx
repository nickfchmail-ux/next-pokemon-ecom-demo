import { useEffect, useRef } from 'react';


export default function AiChatRoom({ aiQuery, setAiQuery, isPending }) {
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
      {aiQuery.map((msg, i) => {
        console.log('response: ', msg);
        return (
          <div key={`ai-deep-seek-query-${i} `}>
            <div key={`ai-client-msg-${i}`} className={`flex justify-end list-none `}>
              <li
                className={`w-max bg-amber-100 m-1 p-2 text-sm rounded-[6px] text-primary-900 max-w-[80%]`}
              >
                <div className="break-words whitespace-pre-wrap">{msg.question}</div>
              </li>
            </div>
            <div key={`ai-server-msg-${i}`} className={`flex justify-start list-none `}>
              <div
                className={`w-max bg-green-200 m-1 p-2 text-sm rounded-[6px] text-primary-900 max-w-[80%]`}
              >
                <div className="flex gap-1 justify-start items-center text-center mb-1">
                  <img src="/duck-icon.png" alt="duck-icon" className={`w-[20px] h-[20px]`} />{' '}
                  <strong className={`pt-2`}>芒 Bot:</strong>
                </div>
                <div className="break-words whitespace-pre-wrap">{msg.answer}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
