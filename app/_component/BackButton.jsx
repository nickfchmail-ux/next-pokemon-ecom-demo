'use client';

import { useRouter } from 'next/navigation';

export default function BackButton() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <button
      onClick={handleBack}
      className={`bg-amber-400 py-2 px-4 rounded-2xl cursor-pointer hover:bg-amber-300 text-primary-600 active:-translate-y-1 hover:text-primary-500`}
    >
      Go Back
    </button>
  );
}
