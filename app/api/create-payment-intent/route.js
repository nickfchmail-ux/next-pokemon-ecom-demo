import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '../../_lib/auth';
import { convertToSubcurrency } from '../../_lib/helper';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  const session = await auth();

  if (!session.user) throw new Error('not authorized request');

  const { userId, orderId, billingAmount } = await request.json();
  console.log('order id: ', orderId);
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: convertToSubcurrency(billingAmount),
      currency: 'hkd',
      metadata: { userId, orderId, billingAmount },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
