'use client';
import { useQuery } from '@tanstack/react-query';
import * as motion from 'motion/react-client';
import { Activity, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { retriveRoomRecord } from '../_lib/socket-service';
import { setChatRoomId } from '../_state/_global/user/userSlice';
import ChatWindow from './ChatWindow';
export default function ChatBox() {
  const parentRef = useRef(null);
  const [expandChatBox, setExpandChatBox] = useState(false);
  const [onMouseOver, setOnMouseOver] = useState(false);
  const [extendWindow, setExtendWindow] = useState(false);
  function handleChatBoxDisplay(value) {
    setExpandChatBox(value);
  }

  const { data: roomId, isPending: isLoadingRoom } = useQuery({
    queryKey: ['pastRoomRecord'],
    queryFn: async () => {
      const room = await retriveRoomRecord();
      return room;
    },
  });

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setChatRoomId(roomId));
  }, [roomId]);

  return (
    <div ref={parentRef} className="fixed inset-0 pointer-events-none z-50 ">
      <motion.div
        drag
        dragConstraints={parentRef}
        dragElastic={0.2}
        dragMomentum={false} // optional – prevents sliding after release for a cleaner feel
        className="pointer-events-auto top-50 right-4 absolute z-50 "
      >
        <div
          className={`${expandChatBox ? `${extendWindow ? 'w-[350px] h-[600px]' : 'w-[200px] h-[300px]'}  bg-amber-50 rounded-2xl` : 'w-[50px] h-[50px] bg-primary-500 rounded-full cursor-pointer hover:border-green-400'}  t flex items-center justify-center  transition-all duration-300  border-3 border-primary-800 shadow-lg z-10 overflow-hidden ${isLoadingRoom ? 'opacity-20 pointer-none' : ''}`}
          onMouseOver={() => setOnMouseOver(true)}
          onMouseLeave={() => setOnMouseOver(false)}
        >
          <Activity mode={expandChatBox ? 'visible' : 'invisible'}>
            <div
              className={` bg-white ${expandChatBox ? 'h-full w-full' : 'w-0 h-0 opacity-0 -z-1'}`}
            >
              <ChatWindow
                header="Lets Chat 芒"
                onMouseOver={onMouseOver}
                open={expandChatBox}
                cancelChat={handleChatBoxDisplay}
                roomId={roomId}
                extendWindow={extendWindow}
                setExtendWindow={setExtendWindow}
              />
            </div>
          </Activity>

          <Activity mode={expandChatBox ? 'hidden' : 'visible'}>
            <div
              onDoubleClick={() => handleChatBoxDisplay(!expandChatBox)}
              className="w-[50px] h-[50px] flex justify-center items-center bg-primary-500 rounded-full cursor-grab active:cursor-grabbing hover:bg-green-300 hover:text-green-500 transition-colors duration-300 text-sm font-medium text-primary-50"
            >
              Chat
            </div>
          </Activity>
        </div>
      </motion.div>
    </div>
  );
}
