'use client';

import { useEffect, useState } from 'react';
import CheckoutForm from './CheckoutForm';
import StripeProvider from './StripeProvider';

export default function StripePayment({ userId, orderId, purchasePokemons, billingAmount }) {
  const [clientSecret, setClientSecret] = useState(null);
  const [error, setError] = useState(null);
  console.log('order received from StripePayment: ', orderId);
  useEffect(() => {
    // Prevent unnecessary API calls if data is missing
    if (!billingAmount || billingAmount <= 0) return;

    fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, orderId, purchasePokemons, billingAmount }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to initialize payment');
        return res.json();
      })
      .then((data) => setClientSecret(data.clientSecret))
      .catch((err) => setError(err.message));
  }, []); // Added billingAmount

  if (error) return <div className="text-red-500">Error: {error}</div>;

  // Conditional rendering prevents Stripe errors while fetching the secret
  if (!clientSecret) return <div>Loading Secure Checkout...</div>;

  return (
    <StripeProvider clientSecret={clientSecret}>
      <CheckoutForm purchasePokemons={purchasePokemons} amount={billingAmount} />
    </StripeProvider>
  );
}
