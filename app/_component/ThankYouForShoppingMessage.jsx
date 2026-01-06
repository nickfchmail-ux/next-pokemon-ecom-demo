'use client';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Button from '@mui/material/Button';
import { useRouter } from 'next/navigation';

export default function ThankYouForShoppingMessage() {
  const router = useRouter();

  return (
    <div className={`flex justify-center flex-col items-center h-full p-5`}>
      <div className="mb-8">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-primary-500 rounded-full">
          <ShoppingCartIcon className="text-primary-800" sx={{ fontSize: 60 }} />
        </div>
      </div>

      {/* Main Message */}
      <h1 className="text-4xl md:text-5xl font-bold text-primary-50 mb-6">
        Thank You for Your Purchase!
      </h1>
      <p className="text-lg text-primary-50 mb-4">
        Your order has been successfully placed and is on its way.
      </p>
      <p className="text-md text-primary-50   mb-10">
        We appreciate your trust in us. Explore more exciting Pokémon items while you wait!
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          variant="contained"
          size="large"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/shop')}
          className="bg-primary-200 hover:bg-amber-700 rounded-full px-8 py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Continue Shopping
        </Button>

        <Button
          variant="outlined"
          size="large"
          onClick={() => router.push('/account/invoice')}
          className="border-amber-600 text-amber-600 hover:bg-amber-50 rounded-full px-8 py-3 text-lg font-medium"
        >
          View My Orders
        </Button>
      </div>

      {/* Subtle footer note */}
      <p className="mt-10 text-sm text-primary-50">
        Questions? Feel free to contact our support team anytime.
      </p>
    </div>
  );
}
