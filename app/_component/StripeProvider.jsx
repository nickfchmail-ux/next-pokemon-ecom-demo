'use client';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const appearance = {
  theme: 'night', // 'stripe', 'night', 'flat', or undefined for full custom
  variables: {
    colorPrimary: '#635bff', // Your brand primary color
    colorBackground: '#ffffff',
    colorText: '#30313d',
    colorDanger: '#df1b41',
    fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
    spacingUnit: '4px',
    borderRadius: '8px',
  },
  rules: {
    '.Label': {
      color: '#6b7280',
      fontWeight: '500',
    },
    '.Input': {
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      borderColor: '#e5e7eb',
    },
  },
};

export default function StripeProvider({ children, clientSecret }) {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance,
        locale: 'auto',
        paymentMethodOrder: ['card', 'apple_pay', 'google_pay', 'alipay'],
      }}
    >
      {children}
    </Elements>
  );
}
