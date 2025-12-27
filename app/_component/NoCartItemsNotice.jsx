'use client';

import Button from '@mui/material/Button';
import { useRouter } from 'next/navigation';

export default function NoCartItemsNotice() {
  const router = useRouter();

  return (
    <div className="bg-amber-100 flex flex-col items-center justify-center w-full h-full  p-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-amber-600 mb-4 max-w-md mx-auto">
          Oops! Your cart is empty right now. Let's go shopping! 🛒✨
        </h1>
        <p className="text-lg text-amber-800 mb-8">Discover amazing items waiting just for you.</p>
        <Button
          variant="contained"
          color="primary"
          startIcon={<i className="pi pi-arrow-left" style={{ fontSize: '1.5rem' }} />}
          onClick={() => router.push('/shop')}
          className="rounded-full px-6 py-3 shadow-md hover:shadow-lg transition-shadow duration-300"
        >
          Back to Shop
        </Button>
      </div>
    </div>
  );
}
