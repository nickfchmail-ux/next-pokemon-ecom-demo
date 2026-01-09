'use client';

import { AddressElement, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
export default function CheckoutForm({ purchasePokemons, amount }) {
  console.log('Purchase pokemons from client: ', purchasePokemons);
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch();
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const addressOptions = {
    mode: 'billing',
    // --- Add this configuration block ---
    fields: {
      phone: 'always', // Makes the phone number field mandatory
    },
    // -------------------------------------
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setMessage('Payment system is not ready yet. Please wait.');
      return;
    }

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setMessage(submitError.message ?? 'An error occurred while submitting payment details.');
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
      },
    });

    if (error) {
      setMessage(error.message ?? 'An unexpected error occurred.');
    }
    // On success, Stripe redirects automatically

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <AddressElement options={addressOptions} />
      <PaymentElement
        options={{
          fields: { billingDetails: { address: 'never' } },
        }}
      />

      <button
        disabled={isLoading || !stripe || !elements}
        type="submit"
        className="mt-6 w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
      >
        {isLoading ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
      </button>

      {message && <div className="mt-4 text-red-600 text-center">{message}</div>}
    </form>
  );
}
