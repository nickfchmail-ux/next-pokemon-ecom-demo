'use client';

import PersonIcon from '@mui/icons-material/Person';
import { createClient } from '@supabase/supabase-js';
import { useSelector } from 'react-redux';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_KEY
);

export default function ChatRoomManager() {
  const anonymousUser = useSelector((state) => state.chatRoom.anonymousUser);
  const loggedInUser = useSelector((state) => state.chatRoom.loggedInUser);

  const needToShowManager = anonymousUser >= 1 || loggedInUser >= 1;

  if (!needToShowManager) return null;

  return (
    <div className="flex gap-2 items-center">
      {anonymousUser >= 1 && (
        <div className="bg-white text-primary-900 px-3 py-1 rounded-full flex gap-2 items-center">
          <div className="flex gap-1 items-center">
            <div className={`flex flex-col justify-center items-center`}>
              <img src="/anonymous.png" alt="anonymous" className="w-6 h-6" />
              <p className={`text-[8px]`}>Anonymus</p>
            </div>
            {anonymousUser}
          </div>
        </div>
      )}

      {loggedInUser >= 1 && (
        <div className="bg-green-400 px-3 py-1 rounded-full flex gap-2 items-center">
          <div className="flex gap-1 items-center">
            <div className={`flex flex-col justify-center items-center`}>
              <PersonIcon className={`h-1 w-1`} />
              <p className={`text-[8px]`}>Logged In</p>
            </div>
            {loggedInUser}
          </div>
        </div>
      )}
    </div>
  );
}
