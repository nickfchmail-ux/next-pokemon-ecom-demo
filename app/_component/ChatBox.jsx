'use client';

import { useState } from 'react';
import ChatWindow from './ChatWindow';
export default function ChatBox() {
  const [expandChatBox, setExpandChatBox] = useState(false);

  function handleChatBoxDisplay(value) {
    setExpandChatBox(value);
  }

  return (
    <div
      className={`${expandChatBox ? 'w-[200px] h-[200px] bg-amber-50 rounded-2xl' : 'w-[50px] h-[50px] bg-primary-500 rounded-full cursor-pointer hover:border-green-400'} fixed top-120 right-4 flex items-center justify-center  transition-all duration-300 z-1000 border-3 border-primary-800 shadow-lg z-10 overflow-hidden`}
    >
      {expandChatBox ? (
        <div className="h-full w-full bg-white">
          <ChatWindow
            header="Lets Chat 芒"
            open={expandChatBox}
            cancelChat={handleChatBoxDisplay}
          />
        </div>
      ) : (
        <div
          onClick={() => handleChatBoxDisplay(!expandChatBox)}
          className="w-[50px] h-[50px] flex justify-center items-center bg-primary-500 rounded-full cursor-pointer hover:bg-green-300 hover:text-green-500 transition-colors duration-300 text-sm font-medium text-primary-50"
        >
          Chat
        </div>
      )}
    </div>
  );
}
