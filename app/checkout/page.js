// app/checkout/page.tsx (or wherever your Page is)
import { loadStripe } from '@stripe/stripe-js';
import Stripe from 'stripe';
import StripePayment from '../_component/StripePayment';
import { auth } from '../_lib/auth';
import { calculateBillingAmount, getOrderItemsByOrderId, getUser } from '../_lib/data-service';
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20', // Use latest stable or pin your version
});

export default async function Page({ searchParams }) {
  const session = await auth();

  if (!session?.user?.email) {
    // Handle unauthenticated user (redirect or show message)
    return (
      <div className="flex bg-primary-200 px-4 text-primary-700 justify-center items-center h-[83.6vh] text-4xl">
        <div>Please log in to continue.</div>;
      </div>
    );
  }

  const params = await searchParams;

  if (!params.orderId) {
    return (
      <div className="flex bg-primary-200 px-4 text-primary-700 justify-center items-center h-[83.6vh] text-4xl">
        <h1>No Order has been made</h1>
      </div>
    );
  }

  let orderItems = await getOrderItemsByOrderId(params.orderId);
  orderItems = orderItems.map((order) => {
    return { id: order.product_id, quantity: order.quantity };
  });

  const billingAmount = await calculateBillingAmount(orderItems);

  const { id: userId, created_at, ...userProfile } = await getUser(session.user.email);

  return (
    <div className="h-[83.6vh] bg-primary-200 p-3 overflow-y-auto">
      <StripePayment
        userId={userId}
        orderId={params.orderId}
        purchasePokemons={orderItems}
        billingAmount={billingAmount}
      />
    </div>
  );
}
