'use client';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { retriveRoomRecord } from "../_lib/socket-service";
import ChatWindow from './ChatWindow';
export default function ChatBox() {
  const [expandChatBox, setExpandChatBox] = useState(false);
const [onMouseOver, setOnMouseOver] = useState(false);
  function handleChatBoxDisplay(value) {
    setExpandChatBox(value);
  }

  const {data:roomId, isPending:isLoadingRoom} = useQuery({

    queryKey: ['pastRoomRecord'],
    queryFn: async () => {
      const room = await retriveRoomRecord();
      return room;
    }

  })



  return (
    <div
      className={`${expandChatBox ? 'w-[200px] h-[300px] bg-amber-50 rounded-2xl' : 'w-[50px] h-[50px] bg-primary-500 rounded-full cursor-pointer hover:border-green-400'} fixed top-50 right-4 flex items-center justify-center  transition-all duration-300 z-1000 border-3 border-primary-800 shadow-lg z-10 overflow-hidden ${isLoadingRoom ? 'opacity-20 pointer-none' :''}`}
      onMouseOver={() => setOnMouseOver(true)}
      onMouseLeave={() => setOnMouseOver(false)}
    >
      {expandChatBox ? (
        <div className={`h-full w-full bg-white `}>
          <ChatWindow
            header="Lets Chat 芒"
            onMouseOver={onMouseOver}
            open={expandChatBox}
            cancelChat={handleChatBoxDisplay}
            roomId={roomId}
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
